const { onCall, HttpsError, onRequest } = require('firebase-functions/v2/https');
const { VertexAI } = require('@google-cloud/vertexai');
// ...existing code...

// ...existing code...

// ...existing code...
/**
 * Cloud Functions for keeping wave counters accurate.
 * - Increments/decrements counts.splashes on waves/{id} when a splash is created/deleted
 * - Increments/decrements counts.echoes on waves/{id} when an echo is created/deleted
 *
 * You can also add FCM/Pings in the onCreate handlers where indicated.
 */
const functions = require('firebase-functions');
const { onDocumentCreated, onDocumentDeleted, onDocumentWritten } = require('firebase-functions/v2/firestore');
// Already imported at the top
const admin = require('firebase-admin');
const os = require('os');
const path = require('path');
const { promises: fsPromises } = require('fs');
const AdmZip = require('adm-zip');

try { admin.initializeApp(); } catch {}
const db = admin.firestore();
const DOWNLOAD_BUCKET = admin.storage().bucket();
const LOGO_SOURCE_PATH = path.join(__dirname, 'assets', 'my_logo.jpg');
const DOWNLOADS_PREFIX = 'downloads/waves';

// ===== FACEBOOK-STYLE NOTIFICATION SYSTEM =====

// Notification types (Facebook-inspired)
const NOTIFICATION_TYPES = {
  HUG: 'hug',
  ECHO: 'echo',
  CONNECT: 'connect',
  MENTION: 'mention',
  FOLLOW: 'follow',
  SHARE: 'share'
};

// Create a comprehensive notification
async function createNotification({
  recipientId,
  actorId,
  actorName,
  actorPhoto,
  type,
  entityId,
  entityType,
  message,
  waveId,
  waveTitle
}) {
  // Don't notify self
  if (recipientId === actorId) return null;

  const notificationId = `${type}_${entityType}_${entityId}_${Date.now()}`;

  const notification = {
    id: notificationId,
    recipientId,
    actorId,
    actorName,
    actorPhoto,
    type,
    entityId,
    entityType,
    message,
    waveId,
    waveTitle,
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('notifications').doc(notificationId).set(notification);

  // Update unread count
  await db.collection('users').doc(recipientId).set({
    notificationStats: {
      unreadCount: admin.firestore.FieldValue.increment(1),
      lastNotificationAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }, { merge: true });

  // Send push notification
  try {
    await sendPushNotification(recipientId, {
      title: getNotificationTitle(type),
      body: message,
      data: { type, entityId, entityType, waveId }
    });
  } catch (error) {
    console.warn('Push notification failed:', error);
  }

  return notification;
}

// Send push notification
async function sendPushNotification(userId, { title, body, data }) {
  const tokensSnap = await db.collection('users').doc(userId).collection('fcmTokens').get();
  if (tokensSnap.empty) return;

  const tokens = [];
  tokensSnap.forEach(doc => {
    const tokenData = doc.data();
    if (tokenData.token) tokens.push(tokenData.token);
  });

  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: data || {},
    tokens
  };

  await admin.messaging().sendEachForMulticast(message);
}

// Get notification title based on type
function getNotificationTitle(type) {
  const titles = {
    [NOTIFICATION_TYPES.HUG]: 'New Hug',
    [NOTIFICATION_TYPES.ECHO]: 'New Echo',
    [NOTIFICATION_TYPES.CONNECT]: 'New Connection',
    [NOTIFICATION_TYPES.MENTION]: 'You were mentioned',
    [NOTIFICATION_TYPES.FOLLOW]: 'New Follower',
    [NOTIFICATION_TYPES.SHARE]: 'Wave Shared'
  };
  return titles[type] || 'New Notification';
}

// Mark notification as read
async function markNotificationAsRead(notificationId, userId) {
  const notificationRef = db.collection('notifications').doc(notificationId);

  // Verify ownership
  const notification = await notificationRef.get();
  if (!notification.exists || notification.data().recipientId !== userId) {
    throw new HttpsError('permission-denied', 'Not authorized');
  }

  await notificationRef.update({
    isRead: true,
    readAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Update unread count
  await db.collection('users').doc(userId).set({
    notificationStats: {
      unreadCount: admin.firestore.FieldValue.increment(-1)
    }
  }, { merge: true });
}

// Get notifications for user
async function getNotifications(userId, limit = 50, offset = 0) {
  const notifications = await db.collection('notifications')
    .where('recipientId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .offset(offset)
    .get();

  return notifications.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Cloud Functions for notifications
exports.createNotification = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { recipientId, type, entityId, entityType, message, waveId, waveTitle } = req.data;

  // Get actor info
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();

  return await createNotification({
    recipientId,
    actorId: uid,
    actorName: userData?.displayName || userData?.handle || 'Someone',
    actorPhoto: userData?.photoURL || userData?.userPhoto,
    type,
    entityId,
    entityType,
    message,
    waveId,
    waveTitle
  });
});

exports.markNotificationRead = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { notificationId } = req.data;
  await markNotificationAsRead(notificationId, uid);
  return { success: true };
});

exports.getUserNotifications = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { limit, offset } = req.data || {};
  return await getNotifications(uid, limit, offset);
});

// ===== END NOTIFICATION SYSTEM =====

// Utility: ensure counts object exists; return a transaction update
async function ensureCounts(tx, waveRef) {
  const snap = await tx.get(waveRef);
  if (!snap.exists) return; // wave might have been deleted
  const data = snap.data() || {};
  const counts = data.counts || { splashes: 0, regularSplashes: 0, hugs: 0, echoes: 0 };
  if (!data.counts) tx.update(waveRef, { counts });
}

// Utility: process mentions in text and send notifications
async function processMentionsInText(text, authorUid, waveId, authorName, echoId = null) {
  try {
    // Extract @mentions from text (e.g., @username, @user_name, @user-name)
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // Extract username without @
    }

    if (mentions.length === 0) return;

    // Remove duplicates
    const uniqueMentions = [...new Set(mentions)];

    // Look up users by username/handle
    for (const username of uniqueMentions) {
      try {
        // Search for user by username
        const userQuery = await db.collection('users')
          .where('username', '==', username)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const mentionedUserId = userDoc.id;

          // Don't send notification to self
          if (mentionedUserId === authorUid) continue;

          const mentionType = echoId ? 'echo_mention' : 'post_mention';
          const mentionText = echoId 
            ? `${authorName} mentioned you in an echo`
            : `${authorName} mentioned you in a post`;

          // Send mention notification
          await addPing(mentionedUserId, {
            type: 'mention',
            text: mentionText,
            waveId: waveId,
            fromUid: authorUid,
            fromName: authorName,
          });

          // Also add to mentions collection for the mentioned user
          await db.collection('users').doc(mentionedUserId).collection('mentions').add({
            text: mentionText,
            fromUid: authorUid,
            fromName: authorName,
            waveId: waveId,
            echoId: echoId,
            type: mentionType,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } catch (error) {
        console.warn(`Failed to process mention for @${username}:`, error);
      }
    }
  } catch (error) {
    console.warn('Error processing mentions:', error);
  }
}

exports.onSplashCreate = onDocumentCreated('waves/{waveId}/splashes/{uid}', async (event) => {
  const snap = event.data;
  const waveId = event.params.waveId;
  const splashData = snap.data() || {};
  const splashType = splashData.splashType || 'regular';

  // Get wave info
  const waveSnap = await db.collection('waves').doc(waveId).get();
  const wave = waveSnap.data() || {};
  if (!wave.authorId) return;
  if (wave.authorId === splashData.userUid) return; // Don't notify self

  // Create notification
  await createNotification({
    recipientId: wave.authorId,
    actorId: splashData.userUid,
    actorName: splashData.userName || 'Someone',
    actorPhoto: splashData.userPhoto,
    type: NOTIFICATION_TYPES.HUG,
    entityId: waveId,
    entityType: 'wave',
    message: splashType === 'octopus_hug'
      ? `${splashData.userName || 'Someone'} hugged your wave 🐙`
      : `${splashData.userName || 'Someone'} splashed your wave 🌊`,
    waveId,
    waveTitle: wave.title || 'Untitled Wave'
  });
});

exports.onSplashDelete = onDocumentDeleted('waves/{waveId}/splashes/{uid}', async (event) => {
  const waveId = event.params.waveId;
  const splashData = event.data?.data() || {};
  
  // Counts are now handled by toggleSplash function, so we skip count updates here
  
  // No ping needed for deletion
});

exports.onEchoCreate = onDocumentCreated('waves/{waveId}/echoes/{echoId}', async (event) => {
  const snap = event.data;
  const waveId = event.params.waveId;
  const echoData = snap.data() || {};

  // Get wave info
  const waveSnap = await db.collection('waves').doc(waveId).get();
  const wave = waveSnap.data() || {};
  if (!wave.authorId) return;

  // Determine notification target and type
  let notificationTargetUid = wave.authorId;
  let notificationType = NOTIFICATION_TYPES.ECHO;
  let message = `${echoData.userName || 'Someone'} echoed your wave 🔊`;

  // Check if this is a reply to another echo
  if (echoData.replyToEchoId) {
    try {
      const originalEchoSnap = await db.collection('waves').doc(waveId).collection('echoes').doc(echoData.replyToEchoId).get();
      if (originalEchoSnap.exists) {
        const originalEcho = originalEchoSnap.data() || {};
        const originalEchoAuthorUid = originalEcho.userUid;
        if (originalEchoAuthorUid && String(originalEchoAuthorUid) !== String(echoData.userUid)) {
          // Notify the original echo author
          notificationTargetUid = originalEchoAuthorUid;
          notificationType = NOTIFICATION_TYPES.ECHO_REPLY;
          message = `${echoData.userName || 'Someone'} replied to your echo 💬`;
        }
      }
    } catch (error) {
      console.warn('Error checking original echo for reply:', error);
      // Fall back to notifying wave owner
    }
  }

  // Don't notify self
  if (String(notificationTargetUid) === String(echoData.userUid)) return;

  // Create notification
  await createNotification({
    recipientId: notificationTargetUid,
    actorId: echoData.userUid,
    actorName: echoData.userName || 'Someone',
    actorPhoto: echoData.userPhoto,
    type: notificationType,
    entityId: waveId,
    entityType: 'wave',
    message,
    waveId,
    waveTitle: wave.title || 'Untitled Wave'
  });
});

exports.onEchoDelete = onDocumentDeleted('waves/{waveId}/echoes/{echoId}', async (event) => {
  const waveId = event.params.waveId;
  const waveRef = db.doc(`waves/${waveId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(waveRef);
    if (!snap.exists) return;
    const data = snap.data() || {};
    const counts = data.counts || { splashes: 0, regularSplashes: 0, hugs: 0, echoes: 0 };
    
    // Only decrement if count is above 0 to prevent negative values
    if (counts.echoes > 0) {
      tx.update(waveRef, { 'counts.echoes': admin.firestore.FieldValue.increment(-1) });
    }
  });
});

exports.onMentionCreate = onDocumentCreated('users/{targetUid}/mentions/{id}', async (event) => {
  const snap = event.data;
  const m = snap?.data() || {};
  await addPing(event.params.targetUid, {
    type: m.type || 'message',
    text: m.text || 'New message',
    actorName: m.fromName || null,
    fromUid: m.fromUid || null,
  });
});

exports.onCrewJoin = onDocumentCreated('users/{targetUid}/crew/{followerUid}', async (event) => {
  const snap = event.data;
  const crewData = snap?.data() || {};
  const followerName = crewData.followerName || 'Drifter';
  
  await addPing(event.params.targetUid, {
    type: 'crew_join',
    text: `${followerName} joined your tide ⚓`,
    fromUid: event.params.followerUid,
    userName: followerName,
  });
});

exports.onCrewLeave = onDocumentDeleted('users/{targetUid}/crew/{followerUid}', async (event) => {
  const crewData = event.data?.data() || {};
  const followerName = crewData.followerName || 'Drifter';
  await addPing(event.params.targetUid, {
    type: 'crew_leave',
    text: `${followerName} left your tide 🌊`,
    fromUid: event.params.followerUid,
    userName: followerName,
  });
});

exports.onFollowCreate = onDocumentCreated('users/{targetUid}/followers/{followerUid}', async (event) => {
  const snap = event.data;
  const followData = snap?.data() || {};

  // Don't notify self
  if (event.params.targetUid === event.params.followerUid) return;

  // Create notification
  await createNotification({
    recipientId: event.params.targetUid,
    actorId: event.params.followerUid,
    actorName: followData.followerName || 'Someone',
    actorPhoto: followData.followerPhoto,
    type: NOTIFICATION_TYPES.CONNECT,
    entityId: event.params.followerUid,
    entityType: 'user',
    message: `${followData.followerName || 'Someone'} connected with you 🤝`
  });
});

exports.onFollowDelete = onDocumentDeleted('users/{targetUid}/followers/{followerUid}', async (event) => {
  const followData = event.data?.data() || {};
  const followerName = followData.followerName || 'Drifter';
  await addPing(event.params.targetUid, {
    type: 'unfollow',
    text: `${followerName} disconnected from you`,
    fromUid: event.params.followerUid,
    userName: followerName,
  });
});

/**
 * Callable HTTP functions (v2) for toggling a splash and managing echoes via HTTPS
 * These complement the Firestore triggers above and use the same `counts.*` fields.
 */
// Already imported at the top
const { initializeApp: initApp } = require('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');

// Ensure modular admin is initialized (no-op if already)
try { initApp(); } catch {}
const dbMod = getFirestore();

// Helper for sending pings from callable functions
async function addPingModular(userId, data) {
  await dbMod.collection('users').doc(userId).collection('pings').add({
    ...data,
    read: false,
    createdAt: Timestamp.now(),
  });
  await dbMod.collection('users').doc(userId).set({
    counters: { unreadPings: FieldValue.increment(1) }
  }, { merge: true });
  
  // Send FCM notification
  try {
    const tokensSnap = await dbMod.collection('users').doc(userId).collection('tokens').get();
    if (tokensSnap.empty) return;
    
    const tokens = [];
    tokensSnap.docs.forEach(doc => {
      const tokenData = doc.data();
      if (tokenData && tokenData.token) tokens.push(tokenData.token);
    });
    
    if (tokens.length === 0) return;
    
    const message = {
      notification: {
        title: data.type === 'splash' ? 'New Splash! 🌊' : data.type === 'echo' ? 'New Echo 📣' : data.type === 'hug' ? 'New Hug! 🫂' : 'Notification',
        body: data.text || 'You have a new notification',
      },
      data: {
        type: data.type || 'ping',
        waveId: data.waveId || '',
        fromUid: data.fromUid || '',
      },
      tokens: tokens,
    };
    
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Sent ${response.successCount} notifications to user ${userId}`);
  } catch (error) {
    console.warn('Failed to send FCM notification:', error);
  }
}

async function getWaveOwnerUid(waveId) {
  const snap = await dbMod.doc(`waves/${waveId}`).get();
  if (!snap.exists) throw new HttpsError('not-found', 'Wave not found');
  const ownerUid = snap.get('ownerUid');
  if (!ownerUid) throw new HttpsError('failed-precondition', 'Wave missing ownerUid');
  return ownerUid;
}

// toggleSplash: if user hasn't splashed -> create; else delete. Updates counts.splashes.
exports.toggleSplash = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { waveId, action, splashType } = req.data || {};
  if (!waveId || typeof waveId !== 'string') {
    throw new HttpsError('invalid-argument', 'waveId is required');
  }

  const waveRef = dbMod.doc(`waves/${waveId}`);
  const splashRef = waveRef.collection('splashes').doc(uid);

  let result = 'splashed';
  await dbMod.runTransaction(async (tx) => {
    const [waveSnap, splashSnap] = await Promise.all([tx.get(waveRef), tx.get(splashRef)]);
    if (!waveSnap.exists) throw new HttpsError('not-found', 'Wave not found');

    const wantSplash = action ? action === 'splash' : !splashSnap.exists;
    const countField = splashType === 'octopus_hug' ? 'hugs' : 'regularSplashes';
    
    if (wantSplash) {
      if (!splashSnap.exists) {
        tx.set(splashRef, { 
          userUid: uid, 
          splashType: splashType || 'regular',
          createdAt: Timestamp.now() 
        }, { merge: true });
        tx.update(waveRef, { 
          'counts.splashes': FieldValue.increment(1),
          [`counts.${countField}`]: FieldValue.increment(1)
        });
      }
      result = 'splashed';
    } else {
      if (splashSnap.exists) {
        const existingSplashType = splashSnap.data()?.splashType || 'regular';
        const existingCountField = existingSplashType === 'octopus_hug' ? 'hugs' : 'regularSplashes';
        tx.delete(splashRef);
        tx.update(waveRef, { 
          'counts.splashes': FieldValue.increment(-1),
          [`counts.${existingCountField}`]: FieldValue.increment(-1)
        });
      }
      result = 'unsplashed';
    }
  });

  // Optional: Ping owner if needed
  return { status: result };
});

// addPing: Send a notification ping to a user (callable from client)
exports.addPing = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { recipientUid, type, waveId, text, fromUid, fromName, fromPhoto } = req.data || {};
  if (!recipientUid || typeof recipientUid !== 'string') {
    throw new HttpsError('invalid-argument', 'recipientUid is required');
  }
  if (!type || typeof type !== 'string') {
    throw new HttpsError('invalid-argument', 'type is required');
  }

  // Send the ping notification
  await addPingModular(recipientUid, {
    type,
    waveId,
    text,
    fromUid,
    fromName,
    fromPhoto,
  });

  return { status: 'sent' };
});

// createEcho: adds comment and increments counts.echoes
exports.createEcho = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { waveId, text, fromName, fromPhoto, replyToEchoId } = req.data || {};
  if (!waveId || typeof waveId !== 'string') throw new HttpsError('invalid-argument', 'waveId is required');
  const body = (text ?? '').toString().trim();
  if (!body) throw new HttpsError('invalid-argument', 'Echo text is empty');
  if (body.length > 500) throw new HttpsError('invalid-argument', 'Echo too long (max 500)');

  const waveRef = dbMod.doc(`waves/${waveId}`);
  const echoRef = waveRef.collection('echoes').doc();

  await dbMod.runTransaction(async (tx) => {
    const waveSnap = await tx.get(waveRef);
    if (!waveSnap.exists) throw new HttpsError('not-found', 'Wave not found');
    tx.set(echoRef, {
      userUid: uid,
      userName: fromName ?? null,
      userPhoto: fromPhoto ?? null,
      text: body,
      replyToEchoId: replyToEchoId || null, // Add reply support
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Process mentions in echo text
  await processMentionsInText(body, uid, waveId, fromName || 'Someone', echoRef.id);

  return { echoId: echoRef.id };
});

// updateEcho: only author can edit; updates text and timestamp
exports.updateEcho = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { waveId, echoId, text } = req.data || {};
  if (!waveId || !echoId || !text) {
    throw new HttpsError('invalid-argument', 'waveId, echoId, and text are required');
  }
  const body = String(text).trim();
  if (!body || body.length > 500) throw new HttpsError('invalid-argument', 'Echo text is invalid');

  const echoRef = dbMod.doc(`waves/${waveId}/echoes/${echoId}`);
  const echoSnap = await echoRef.get();
  if (!echoSnap.exists) throw new HttpsError('not-found', 'Echo not found');
  if (echoSnap.get('userUid') !== uid) throw new HttpsError('permission-denied', 'You can only edit your own echo');

  await echoRef.update({ text: body, updatedAt: Timestamp.now() });

  return { status: 'updated' };
});

// deleteEcho: only author can delete; decrements counts.echoes
exports.deleteEcho = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { waveId, echoId } = req.data || {};
  if (!waveId || typeof waveId !== 'string' || !echoId || typeof echoId !== 'string') {
    throw new HttpsError('invalid-argument', 'waveId and echoId are required');
  }

  const waveRef = dbMod.doc(`waves/${waveId}`);
  const echoRef = waveRef.collection('echoes').doc(echoId);

  await dbMod.runTransaction(async (tx) => {
    const [waveSnap, echoSnap] = await Promise.all([tx.get(waveRef), tx.get(echoRef)]);
    if (!waveSnap.exists) throw new HttpsError('not-found', 'Wave not found');
    if (!echoSnap.exists) throw new HttpsError('not-found', 'Echo not found');
    const authorUid = echoSnap.get('userUid');
    if (authorUid !== uid) throw new HttpsError('permission-denied', 'You can only delete your own echo');
    tx.delete(echoRef);
    tx.update(waveRef, { 'counts.echoes': FieldValue.increment(-1) });
  });

  return { status: 'deleted' };
});

// Cloud Function to initialize counts
exports.initializeWaveCounts = onDocumentCreated('waves/{waveId}', (event) => {
  const snap = event.data;
  return snap.ref.set({
    counts: {
      splashes: 0,
      echoes: 0,
      views: 0,
    },
  }, { merge: true });
});

// Cloud Function to track recent wave posters for each user's followers
exports.trackRecentPosters = onDocumentCreated('waves/{waveId}', async (event) => {
  const snap = event.data;
  const waveData = snap.data() || {};
  const authorId = waveData.authorId || waveData.ownerUid;
  const authorName = waveData.authorName || 'Unknown';
  
  if (!authorId) return; // No author to track
  
  try {
    // Get author's profile for photo URL
    const authorSnap = await dbMod.doc(`users/${authorId}`).get();
    const authorProfile = authorSnap.data() || {};
    const photoURL = authorProfile.photoURL || null;
    
    // Get all users who follow this author
    const followersSnap = await dbMod.collection('users').doc(authorId).collection('followers').get();
    
    // Update each follower's recentPosters
    const batch = dbMod.batch();
    const timestamp = Timestamp.now();
    
    followersSnap.docs.forEach(followerDoc => {
      const followerId = followerDoc.id;
      const posterRef = dbMod.collection('users').doc(followerId).collection('recentPosters').doc(authorId);
      
      batch.set(posterRef, {
        userId: authorId,
        userName: authorName,
        photoURL: photoURL,
        lastPostedAt: timestamp,
        waveId: event.params.waveId,
      }, { merge: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error tracking recent posters:', error);
  }
});

exports.notifyWavePosted = onDocumentCreated('waves/{waveId}', async (event) => {
  const wave = event.data?.data() || {};
  const authorId = wave.authorId || wave.ownerUid;
  if (!authorId) return;

  const authorName = wave.authorName || 'Drifter';
  const summaryValue =
    (typeof wave.captionText === 'string' && wave.captionText.trim()) ||
    (wave.media && wave.media.fileName) ||
    '';
  const snippet =
    summaryValue.length > 60 ? `${summaryValue.slice(0, 57)}…` : summaryValue;

  const crewSnap = await db
    .collection('users')
    .doc(authorId)
    .collection('crew')
    .get();
  if (crewSnap.empty) return;

  const waveId = event.params.waveId;
  const text = `${authorName} posted a new wave${snippet ? ` • ${snippet}` : ''}`;
  const promises = crewSnap.docs
    .map((doc) => doc.id)
    .filter((followerUid) => followerUid && followerUid !== authorId)
    .map((followerUid) =>
      addPing(followerUid, {
        type: 'wave_post',
        text,
        waveId,
        fromUid: authorId,
        userName: authorName,
      }),
    );

  await Promise.all(promises);
});

function normalizeStoragePath(value) {
  if (!value) return null;
  let candidate = String(value);
  if (candidate.startsWith('gs://')) {
    const withoutScheme = candidate.replace(/^gs:\/\//, '');
    const parts = withoutScheme.split('/');
    return parts.slice(1).join('/');
  }
  return candidate.replace(/^\/+/, '');
}

exports.createWaveDownloadPackage = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const waveId = (req.data?.waveId || '').toString().trim();
  if (!waveId) throw new HttpsError('invalid-argument', 'waveId is required');

  const waveSnap = await dbMod.collection('waves').doc(waveId).get();
  if (!waveSnap.exists) throw new HttpsError('not-found', 'Wave not found');
  const waveData = waveSnap.data() || {};
  const rawPath =
    waveData.mediaPath ||
    waveData.storagePath ||
    waveData.uploadPath ||
    waveData.mediaStoragePath ||
    waveData.filePath ||
    '';
  const storagePath = normalizeStoragePath(rawPath);
  if (!storagePath) throw new HttpsError('failed-precondition', 'Wave does not expose a downloadable storage path');

  const bucket = DOWNLOAD_BUCKET || admin.storage().bucket();
  const baseName = path.basename(storagePath);
  const waveTempFile = path.join(os.tmpdir(), `wave-${waveId}-${Date.now()}-${baseName}`);
  const zipName = `splash-wave-${waveId}-${Date.now()}.zip`;
  const zipTempFile = path.join(os.tmpdir(), zipName);

  try {
    await bucket.file(storagePath).download({ destination: waveTempFile });
  } catch (error) {
    throw new HttpsError('not-found', 'Could not read wave media from storage');
  }

  const zip = new AdmZip();
  zip.addLocalFile(waveTempFile, '', baseName);
  try {
    zip.addLocalFile(LOGO_SOURCE_PATH, '', 'SPL-logo.jpg');
  } catch (error) {
    console.warn('Unable to include logo in wave package:', error?.message);
  }
  zip.writeZip(zipTempFile);

  const destinationPath = `${DOWNLOADS_PREFIX}/${zipName}`;
  await bucket.upload(zipTempFile, {
    destination: destinationPath,
    metadata: { contentType: 'application/zip' },
  });

  try {
    await fsPromises.unlink(waveTempFile);
    await fsPromises.unlink(zipTempFile);
  } catch {}

  const [signedUrl] = await bucket.file(destinationPath).getSignedUrl({
    action: 'read',
    expires: new Date(Date.now() + 1000 * 60 * 60),
  });

  return { downloadUrl: signedUrl, fileName: zipName };
});

// sendCrewInvitation: Send invitation to join a crew
exports.sendCrewInvitation = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { toUid, crewId, crewName, message } = req.data || {};
  if (!toUid || typeof toUid !== 'string') {
    throw new HttpsError('invalid-argument', 'toUid is required');
  }
  if (!crewId || typeof crewId !== 'string') {
    throw new HttpsError('invalid-argument', 'crewId is required');
  }

  // Get sender's info
  const senderSnap = await dbMod.collection('users').doc(uid).get();
  const senderData = senderSnap.data() || {};
  const senderName = senderData.userName || senderData.username || 'Someone';

  // Create invitation document
  const inviteRef = dbMod.collection('users').doc(toUid).collection('invitations').doc();
  await inviteRef.set({
    fromUid: uid,
    fromName: senderName,
    crewId: crewId,
    crewName: crewName || 'a crew',
    message: message || `${senderName} invited you to join ${crewName || 'their crew'}`,
    type: 'crew',
    status: 'pending',
    createdAt: Timestamp.now(),
  });

  // Send ping notification
  await addPingModular(toUid, {
    type: 'invitation',
    text: `🚢 ${senderName} invited you to join ${crewName || 'their crew'}`,
    fromUid: uid,
    crewId: crewId,
  });

  return { status: 'sent', inviteId: inviteRef.id };
});

// acceptCrewInvitation: Accept a crew invitation
exports.acceptCrewInvitation = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { inviteId } = req.data || {};
  if (!inviteId || typeof inviteId !== 'string') {
    throw new HttpsError('invalid-argument', 'inviteId is required');
  }

  const inviteRef = dbMod.collection('users').doc(uid).collection('invitations').doc(inviteId);
  const inviteSnap = await inviteRef.get();
  
  if (!inviteSnap.exists) {
    throw new HttpsError('not-found', 'Invitation not found');
  }

  const inviteData = inviteSnap.data();
  if (inviteData.status !== 'pending') {
    throw new HttpsError('failed-precondition', 'Invitation already processed');
  }

  const crewId = inviteData.crewId;
  
  // Add user to crew members
  await dbMod.collection('crews').doc(crewId).collection('members').doc(uid).set({
    userId: uid,
    joinedAt: Timestamp.now(),
    role: 'member',
  });

  // Update invitation status
  await inviteRef.update({
    status: 'accepted',
    acceptedAt: Timestamp.now(),
  });

  // Notify sender
  await addPingModular(inviteData.fromUid, {
    type: 'crew_accept',
    text: `✅ Your crew invitation was accepted!`,
    fromUid: uid,
    crewId: crewId,
  });

  return { status: 'accepted', crewId: crewId };
});

// joinCrew: Instantly join a user's crew (no invitation)
exports.joinCrew = onCall({ region: 'us-central1' }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { targetUid } = req.data || {};
  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'targetUid is required');
  }
  if (uid === targetUid) {
    throw new HttpsError('failed-precondition', 'Cannot join your own crew');
  }

  // Add to target user's crew
  await dbMod.collection('users').doc(targetUid).collection('crew').doc(uid).set({
    uid: uid,
    name: (req.auth?.token?.name || 'Anonymous'),
    photo: req.auth?.token?.picture || null,
    joinedAt: Timestamp.now(),
  });

  // Add to user's boarding (following) list
  await dbMod.collection('users').doc(uid).collection('boarding').doc(targetUid).set({
    uid: targetUid,
    joinedAt: Timestamp.now(),
  });

  // Send ping notification to target user
  await addPingModular(targetUid, {
    type: 'crew_join',
    text: `${req.auth?.token?.name || 'A drifter'} joined your tide ⚓`,
    fromUid: uid,
    userName: req.auth?.token?.name || 'A drifter',
  });

  return { success: true };
});

// Auto-set username_lc field when user is created or updated
exports.onUserWrite = onDocumentWritten('users/{userId}', async (event) => {
  const after = event.data?.after?.data();
  if (!after) return; // User deleted
  
  // Extract username from displayName or username field
  let username = after.username || after.displayName || '';
  
  // Remove leading / or @ if present
  username = username.replace(/^[@\/]/, '');
  
  // Create lowercase version
  const username_lc = username.toLowerCase();
  
  // Only update if username_lc is different or doesn't exist
  if (after.username_lc !== username_lc) {
    console.log(`Setting username_lc for user ${event.params.userId}: ${username_lc}`);
    return event.data.after.ref.update({ username_lc });
  }
  
  return null;
});

// One-time migration function - call via HTTP to update all existing users
exports.migrateUsernames = onRequest({ region: 'us-central1' }, async (req, res) => {
  try {
    const db = admin.firestore();
    console.log('Fetching all users...');
    
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users`);
    
    let updated = 0;
    let skipped = 0;
    
    // Process in batches of 500 (Firestore limit)
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      let username = data.username || data.displayName || '';
      
      // Remove leading / or @
      username = username.replace(/^[@\/]/, '');
      const username_lc = username.toLowerCase();
      
      if (data.username_lc !== username_lc) {
        currentBatch.update(doc.ref, { username_lc });
        operationCount++;
        updated++;
        
        if (operationCount === 500) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationCount = 0;
        }
      } else {
        skipped++;
      }
    }
    
    // Commit remaining operations
    if (operationCount > 0) {
      batches.push(currentBatch.commit());
    }
    
    // Wait for all batches to complete
    await Promise.all(batches);
    
    const result = {
      success: true,
      totalUsers: usersSnapshot.size,
      updated,
      skipped,
      message: `Updated ${updated} users, skipped ${skipped} users`
    };
    
    console.log(result);
    res.json(result);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect Vibe Cloud Function
exports.connectVibe = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated");
    }

    const fromUserId = context.auth.uid;
    const toUserId = data.toUserId;

    if (fromUserId === toUserId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Cannot connect your own vibe"
      );
    }

    // Get the username/handle of the person connecting
    const fromUserDoc = await admin.firestore().collection("users").doc(fromUserId).get();
    const fromUserData = fromUserDoc.data();
    const fromUserHandle = fromUserData?.handle || fromUserData?.displayName || fromUserData?.name || "Someone";

    // Add to crew collection (follower)
    await admin.firestore()
      .collection("users")
      .doc(toUserId)
      .collection("crew")
      .doc(fromUserId)
      .set({
        uid: fromUserId,
        name: fromUserHandle,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Add to boarding collection (following)
    await admin.firestore()
      .collection("users")
      .doc(fromUserId)
      .collection("boarding")
      .doc(toUserId)
      .set({
        uid: toUserId,
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    const connectionId = `${fromUserId}_${toUserId}`;

    const connectionRef = admin.firestore()
      .collection("connections")
      .doc(connectionId);

    await connectionRef.set({
      followerId: fromUserId,
      followingId: toUserId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create notification with personalized message
    await admin.firestore().collection("notifications").add({
      toUserId: toUserId,
      fromUserId: fromUserId,
      fromUserHandle: fromUserHandle,
      type: "CONNECT_VIBE",
      message: `/${fromUserHandle} connected your vibe!`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { connected: true };
  }
);

// Disconnect Vibe Cloud Function
exports.disconnectVibe = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated");
    }

    const fromUserId = context.auth.uid;
    const toUserId = data.toUserId;

    // Remove from crew collection (follower)
    await admin.firestore()
      .collection("users")
      .doc(toUserId)
      .collection("crew")
      .doc(fromUserId)
      .delete();

    // Remove from boarding collection (following)
    await admin.firestore()
      .collection("users")
      .doc(fromUserId)
      .collection("boarding")
      .doc(toUserId)
      .delete();

    const connectionId = `${fromUserId}_${toUserId}`;

    await admin.firestore()
      .collection("connections")
      .doc(connectionId)
      .delete();

    return { connected: false };
  }
);

// Record Video Reach Cloud Function
exports.recordVideoReach = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated");
    }

    const viewerId = context.auth.uid;
    const postId = data.postId;

    const postRef = admin.firestore().collection("waves").doc(postId);
    const reachRef = postRef.collection("reach").doc(viewerId);

    await admin.firestore().runTransaction(async (tx) => {
      const postSnap = await tx.get(postRef);

      if (!postSnap.exists) return;

      const post = postSnap.data();

      // ❌ Do not count owner views
      if (post.ownerUid === viewerId) return;

      // ❌ Do not count duplicate views
      const reachSnap = await tx.get(reachRef);
      if (reachSnap.exists) return;

      // ✅ Count reach
      tx.set(reachRef, {
        viewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.update(postRef, {
        reachCount: admin.firestore.FieldValue.increment(1),
      });
    });

    return { success: true };
  }
);

exports.generateAIResponse = onCall(async (data, context) => {
  // Temporarily disable auth check for testing
  // if (!context.auth) {
  //   throw new HttpsError('unauthenticated', 'User must be authenticated to use AI.');
  // }

  console.log('Received data:', data);
  console.log('Data type:', typeof data);
  console.log('Data keys:', Object.keys(data));

  const { prompt } = data;
  console.log('Extracted prompt:', prompt);
  console.log('Prompt type:', typeof prompt);
  console.log('Prompt length:', prompt ? prompt.length : 'undefined');

  if (!prompt || typeof prompt !== 'string') {
    console.error('Invalid prompt validation failed');
    throw new HttpsError('invalid-argument', 'Prompt must be a non-empty string.');
  }

  if (prompt.trim() === '') {
    console.error('Empty prompt after trim');
    throw new HttpsError('invalid-argument', 'Prompt must be a non-empty string.');
  }

  try {
    console.log('Generating AI response for prompt:', prompt.substring(0, 50) + '...');
    const vertexAI = new VertexAI({ project: 'aqualink-b5f7c', location: 'us-central1' });
    const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('AI response generated successfully');
    return { response: text };
  } catch (error) {
    console.error('AI generation error:', error);
    throw new HttpsError('internal', `Failed to generate AI response: ${error.message}`);
  }
});
