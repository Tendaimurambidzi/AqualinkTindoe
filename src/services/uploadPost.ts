// src/services/uploadPost.ts
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

export interface SimpleMedia {
  uri: string;
  fileName?: string | null;
  type?: string | null; // e.g. "image/jpeg" or "video/mp4"
}

interface UploadPostParams {
  media?: SimpleMedia | null;
  caption: string;
  link?: string;
  authorName?: string;
}

let RNFS: typeof import('react-native-fs') | null = null;
const resolveRNFS = () => {
  if (RNFS) return RNFS;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    RNFS = require('react-native-fs');
  } catch (err) {
    console.warn('react-native-fs is unavailable in uploadPost:', err?.message || err);
    RNFS = null;
  }
  return RNFS;
};

/**
 * uploadPost
 * - Takes media from image/video picker (optional)
 * - Uploads it to Firebase Storage only if present
 * - Creates a Firestore document in "posts"
 * - Returns { id, mediaUrl }
 */
export async function uploadPost({ media, caption, link, authorName }: UploadPostParams) {
  const a = auth();
  const uid = a.currentUser?.uid;

  if (!uid) {
    throw new Error('Please sign in to upload a post.');
  }

  const mediaUri = String(media?.uri || '').trim();
  const hasMedia = Boolean(mediaUri);

  let mediaUrl: string | null = null;
  let mediaPath: string | null = null;
  let mediaType: string | null = media?.type || null;

  if (hasMedia) {
    const nameGuessRaw = media?.fileName || 'post';
    const type = (media?.type || '').toLowerCase();

    const sanitizedBase = nameGuessRaw
      .replace(/[^A-Za-z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');

    const baseNoExt = sanitizedBase.includes('.')
      ? sanitizedBase.substring(0, sanitizedBase.lastIndexOf('.'))
      : sanitizedBase;

    const ext = sanitizedBase.includes('.')
      ? sanitizedBase.substring(sanitizedBase.lastIndexOf('.') + 1)
      : type.startsWith('video/')
      ? 'mp4'
      : type.startsWith('image/')
      ? 'jpg'
      : 'dat';

    const filePath = `posts/${uid}/${Date.now()}_${baseNoExt}.${ext}`;

    let localPath = mediaUri;
    try {
      localPath = decodeURI(localPath);
    } catch {}

    if (Platform.OS === 'android' && localPath.startsWith('file://')) {
      localPath = localPath.replace('file://', '');
    }

    if (Platform.OS === 'android' && /^content:/.test(localPath)) {
      const rnfs = resolveRNFS();
      if (!rnfs) {
        throw new Error(
          'react-native-fs is required to upload content:// media on Android.',
        );
      }
      const safeExt = (
        ext || (type.startsWith('video/') ? 'mp4' : 'dat')
      ).replace(/[^A-Za-z0-9]/g, '');
      const copyDest = `${rnfs.CachesDirectoryPath}/post_${Date.now()}.${safeExt}`;
      await rnfs.copyFile(String(mediaUri), copyDest);
      localPath = copyDest;
    }

    if (!localPath) {
      throw new Error('Could not resolve a local path for the selected media.');
    }

    const uploadContentType =
      type && (type.startsWith('video/') || type.startsWith('image/'))
        ? type
        : 'application/octet-stream';

    await storage().ref(filePath).putFile(localPath, {
      contentType: uploadContentType,
    });

    mediaUrl = await storage().ref(filePath).getDownloadURL();
    mediaPath = filePath;
    mediaType = type || mediaType;
  }

  const docRef = await firestore().collection('waves').add({
    ownerUid: uid,
    authorId: uid,
    authorName: authorName || a.currentUser?.displayName || null,
    text: caption, // vibes use 'text' for caption
    link: link || null,
    mediaUrl,
    mediaPath,
    mediaType,
    createdAt: firestore.FieldValue.serverTimestamp(),
    // Add default caption position
    caption: { x: 0, y: 0 },
  });

  // Process mentions in caption
  if (caption) {
    await processMentionsInText(caption, uid, docRef.id, authorName || a.currentUser?.displayName || 'Someone');
  }

  return { id: docRef.id, mediaUrl };
}

// Helper function to process mentions in text
async function processMentionsInText(text: string, authorUid: string, waveId: string, authorName: string) {
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
        // Search for user by username (this is a simple lookup - you might need to adjust based on your user schema)
        const userQuery = await firestore()
          .collection('users')
          .where('username', '==', username)
          .limit(1)
          .get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          const mentionedUserId = userDoc.id;
          const mentionedUserData = userDoc.data();

          // Don't send notification to self
          if (mentionedUserId === authorUid) continue;

          // Send mention notification
          const addPingFn = functions().httpsCallable('addPing');
          await addPingFn({
            recipientUid: mentionedUserId,
            type: 'mention',
            waveId: waveId,
            text: `${authorName} mentioned you in a post`,
            fromUid: authorUid,
            fromName: authorName,
          });

          // Also add to mentions collection for the mentioned user
          await firestore()
            .collection(`users/${mentionedUserId}/mentions`)
            .add({
              text: `${authorName} mentioned you in a post`,
              fromUid: authorUid,
              fromName: authorName,
              waveId: waveId,
              type: 'post_mention',
              createdAt: firestore.FieldValue.serverTimestamp(),
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
