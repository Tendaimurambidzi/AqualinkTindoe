import express from 'express';
import cors from 'cors';
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mux } from '@mux/mux-node';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET; // optional override

let adminReady = false;
try {
  if (!admin.apps.length) {
    // Initialize with default credentials (env var GOOGLE_APPLICATION_CREDENTIALS or metadata server)
    admin.initializeApp();
  }
  adminReady = true;
  console.log('firebase-admin initialized');
} catch (e) {
  console.warn('firebase-admin not initialized:', e?.message || e);
}

let muxClient = null;
try {
  if (MUX_TOKEN_ID && MUX_TOKEN_SECRET) {
    muxClient = new Mux({
      tokenId: MUX_TOKEN_ID,
      tokenSecret: MUX_TOKEN_SECRET,
    });
    console.log('Mux client initialized');
  } else {
    console.warn('Mux client not initialized: missing MUX_TOKEN_ID or MUX_TOKEN_SECRET');
  }
} catch (e) {
  console.warn('Mux init failed:', e?.message || e);
  muxClient = null;
}

function bad(res, msg, code = 400) {
  return res.status(code).json({ error: msg });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const androidGradlePath = path.join(repoRoot, 'android', 'app', 'build.gradle');
const rootPackagePath = path.join(repoRoot, 'package.json');

function readVersionFromGradle() {
  try {
    const txt = fs.readFileSync(androidGradlePath, 'utf8');
    const nameMatch = txt.match(/versionName\\s+\"([^\"]+)\"/);
    const codeMatch = txt.match(/versionCode\\s+(\\d+)/);
    if (nameMatch && codeMatch) {
      return {
        version: nameMatch[1],
        build: codeMatch[1],
        source: 'android/app/build.gradle',
      };
    }
  } catch (err) {
    console.warn('Could not read android/app/build.gradle for version info:', err?.message || err);
  }
  return null;
}

function readVersionFromPackageJson() {
  try {
    const pkgJson = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
    if (pkgJson?.version) {
      return {
        version: String(pkgJson.version),
        build: String(pkgJson.build || pkgJson.versionCode || pkgJson.version || '1'),
        source: 'package.json',
      };
    }
  } catch (err) {
    console.warn('Could not read package.json for version info:', err?.message || err);
  }
  return null;
}

function resolveAppVersion() {
  const envVersion = process.env.APP_VERSION || process.env.APP_VERSION_NAME;
  const envBuild = process.env.APP_BUILD || process.env.APP_BUILD_NUMBER || process.env.APP_VERSION_CODE;
  if (envVersion && envBuild) {
    return {
      version: String(envVersion),
      build: String(envBuild),
      source: 'env',
    };
  }

  const gradleInfo = readVersionFromGradle();
  if (gradleInfo) return gradleInfo;

  const pkgInfo = readVersionFromPackageJson();
  if (pkgInfo) return pkgInfo;

  return {
    version: '0.0.0',
    build: '0',
    source: 'fallback',
  };
}

app.get('/app-version', (_req, res) => {
  const info = resolveAppVersion();
  return res.json({
    ok: true,
    ...info,
    retrievedAt: new Date().toISOString(),
  });
});

// -------------------- Mux merge helpers --------------------
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getSignedUrlForPath(storagePath) {
  if (!adminReady) throw new Error('firebase-admin not ready');
  if (!storagePath) throw new Error('storagePath missing');
  const bucket = admin.storage().bucket(STORAGE_BUCKET);
  const [url] = await bucket.file(String(storagePath)).getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  });
  return url;
}

async function startMuxMerge({ waveId, sourceVideoPath, overlayAudioPath, ownerUid, authorName }) {
  if (!muxClient) {
    console.warn('Mux merge skipped: mux client not initialized');
    return;
  }
  if (!adminReady) {
    console.warn('Mux merge skipped: firebase-admin not ready');
    return;
  }
  if (!waveId || !sourceVideoPath || !overlayAudioPath) {
    console.warn('Mux merge skipped: missing required fields', { waveId, sourceVideoPath, overlayAudioPath });
    return;
  }
  const db = admin.firestore();
  const docRef = db.collection('waves').doc(String(waveId));
  try {
    await docRef.set({ muxStatus: 'processing', mergeRequested: true }, { merge: true });
    const videoUrl = await getSignedUrlForPath(sourceVideoPath);
    const audioUrl = await getSignedUrlForPath(overlayAudioPath);

    const asset = await muxClient.video.assets.create({
      input: [
        { url: videoUrl, type: 'video' },
        { url: audioUrl, type: 'audio' },
      ],
      playback_policy: ['public'],
    });

    let status = asset?.status;
    let playbackId = asset?.playback_ids?.[0]?.id || null;
    let attempts = 0;
    while ((status === 'preparing' || status === 'waiting') && attempts < 24) {
      await wait(5000);
      const refreshed = await muxClient.video.assets.retrieve(asset.id);
      status = refreshed?.status;
      playbackId = refreshed?.playback_ids?.[0]?.id || playbackId;
      attempts += 1;
    }

    if (status !== 'ready' || !playbackId) {
      await docRef.set(
        {
          muxStatus: 'failed',
          muxError: `Mux asset not ready (status=${status})`,
        },
        { merge: true },
      );
      throw new Error(`Mux asset not ready (status=${status})`);
    }

    const playbackUrl = `https://stream.mux.com/${playbackId}.m3u8`;
    await docRef.set(
      {
        playbackUrl,
        mediaUrl: playbackUrl,
        muxStatus: 'ready',
        mergeRequested: false,
        mergeSourceVideoPath: admin.firestore.FieldValue.delete(),
        mergeOverlayAudioPath: admin.firestore.FieldValue.delete(),
      },
      { merge: true },
    );

    console.log('Mux merge complete for wave', waveId, 'playbackId', playbackId);
    return playbackUrl;
  } catch (e) {
    console.error('Mux merge error for wave', waveId, e);
    try {
      await docRef.set(
        {
          muxStatus: 'failed',
          muxError: String(e?.message || e),
        },
        { merge: true },
      );
    } catch {}
    throw e;
  }
}

// -------------------- Recording management --------------------
const activeRecordings = new Map(); // recordingId -> recording info

app.post('/start-recording', (req, res) => {
  const { channel, uid, token, liveId } = req.body || {};
  if (!channel) return bad(res, 'Missing channel');
  
  const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const recording = {
    id: recordingId,
    channel,
    uid: uid || 0,
    liveId: liveId || null,
    startedAt: Date.now(),
    status: 'recording',
  };
  
  activeRecordings.set(recordingId, recording);
  
  // In production, this would start Agora cloud recording
  console.log(`Recording started: ${recordingId} for channel ${channel}`);
  
  if (liveId) {
    roomBroadcast(liveId, { type: 'recording_started', recordingId });
  }
  
  return res.json({ 
    ok: true, 
    recordingId,
    status: 'recording',
    message: 'Recording started' 
  });
});

app.post('/stop-recording', (req, res) => {
  const { channel, uid, recordingId } = req.body || {};
  
  let recording = null;
  if (recordingId) {
    recording = activeRecordings.get(recordingId);
  } else if (channel) {
    // Find by channel
    for (const [id, rec] of activeRecordings.entries()) {
      if (rec.channel === channel && rec.status === 'recording') {
        recording = rec;
        break;
      }
    }
  }
  
  if (!recording) {
    return bad(res, 'Recording not found', 404);
  }
  
  recording.status = 'stopped';
  recording.stoppedAt = Date.now();
  recording.duration = recording.stoppedAt - recording.startedAt;
  
  console.log(`Recording stopped: ${recording.id} (duration: ${Math.round(recording.duration/1000)}s)`);
  
  if (recording.liveId) {
    roomBroadcast(recording.liveId, { 
      type: 'recording_stopped', 
      recordingId: recording.id,
      duration: recording.duration 
    });
  }
  
  return res.json({ 
    ok: true, 
    recordingId: recording.id,
    status: 'stopped',
    duration: recording.duration,
    message: 'Recording stopped' 
  });
});

app.get('/recording-status', (req, res) => {
  const recordingId = String(req.query?.recordingId || '').trim();
  if (!recordingId) return bad(res, 'Missing recordingId');
  
  const recording = activeRecordings.get(recordingId);
  if (!recording) return bad(res, 'Recording not found', 404);
  
  return res.json({ recording });
});

app.get('/recordings', (req, res) => {
  const liveId = String(req.query?.liveId || '').trim();
  
  let recordings = Array.from(activeRecordings.values());
  
  if (liveId) {
    recordings = recordings.filter(r => r.liveId === liveId);
  }
  
  return res.json({ recordings });
});

// -------------------- Agora token endpoint --------------------
app.get('/agora/token', (req, res) => {
  try {
    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return bad(res, 'Server not configured: missing AGORA_APP_ID or AGORA_APP_CERTIFICATE', 500);
    }
    const channel = String(req.query.channel || '').trim();
    if (!channel) return bad(res, 'Missing channel');
    const uidRaw = req.query.uid;
    const uid = !uidRaw ? 0 : Number(uidRaw);
    const roleStr = String(req.query.role || 'publisher').toLowerCase();
    const role = roleStr === 'audience' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
    const expireSeconds = Math.max(60, Math.min(86400 * 7, Number(req.query.expire || 3600))); // 1 min..7 days

    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTs + expireSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      uid,
      role,
      privilegeExpireTs
    );

    return res.json({ token, channel, uid, role: roleStr, expire: expireSeconds });
  } catch (e) {
    console.error('Token error', e);
    return bad(res, 'Failed to generate token', 500);
  }
});

// -------------------- Lightweight Live presence backend --------------------
// In-memory store suitable for local dev; replace with DB/Firestore in prod.
const liveSessions = new Map(); // id -> session
let sseClients = [];

function toPublicSession(s) {
  return {
    id: s.id,
    channel: s.channel,
    hostName: s.hostName,
    hostPhoto: s.hostPhoto || null,
    hostUid: s.hostUid || s.uid || null,
    title: s.title || s.hostName || 'Live Stream',
    startedAt: s.startedAt,
    updatedAt: s.updatedAt,
    status: s.status,
    viewerCount: s.viewerCount || 0,
  };
}

function broadcastLiveUpdate() {
  const payload = JSON.stringify({
    type: 'live_update',
    items: getRecentLive(20),
  });
  sseClients = sseClients.filter((res) => {
    try {
      res.write(`data: ${payload}\n\n`);
      return true;
    } catch {
      try { res.end(); } catch {}
      return false;
    }
  });
}

async function getRecentLive(limit = 4) {
  if (!adminReady) {
    // Fallback to in-memory
    const items = Array.from(liveSessions.values())
      .filter((s) => s.status === 'live')
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit)
      .map(toPublicSession);
    return items;
  }
  
  try {
    const snapshot = await admin.firestore().collection('live')
      .where('status', '==', 'live')
      .orderBy('startedAt', 'desc')
      .limit(limit)
      .get();
    
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (e) {
    console.error('Firestore live query error:', e);
    return [];
  }
}

app.get('/live/recent', async (_req, res) => {
  const items = await getRecentLive(4);
  return res.json({ items });
});

app.get('/live/sse', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current snapshot immediately
  const items = await getRecentLive(4);
  res.write(`data: ${JSON.stringify({ type: 'hello', items })}\n\n`);

  sseClients.push(res);
  req.on('close', () => {
    sseClients = sseClients.filter((r) => r !== res);
    try { res.end(); } catch {}
  });
});

function lookupLiveIdForUser(uid) {
  for (const session of liveSessions.values()) {
    if (session.hostUid === uid || session.uid === Number(uid)) {
      return session.id;
    }
  }
  return null;
}

app.get('/search/users', async (req, res) => {
  const term = String(req.query?.term || '').trim();
  if (!term) return bad(res, 'Missing term');
  if (!adminReady) return bad(res, 'Search unavailable', 500);

  const lowerTerm = term.toLowerCase();
  const firestoreRef = admin.firestore().collection('users');
  const seen = new Set();
  const results = [];

  const addUser = (doc) => {
    const uid = doc.id;
    if (!uid || seen.has(uid)) return;
    seen.add(uid);
    const data = doc.data() || {};
    results.push({
      uid,
      displayName: data.displayName || data.userName || data.username || '@drifter',
      username: data.username || '',
      bio: data.bio || '',
      photoURL: data.userPhoto || data.photoURL || null,
      liveId: lookupLiveIdForUser(uid),
    });
  };

  try {
    const displayNameSnap = await firestoreRef
      .where('displayName', '>=', term)
      .where('displayName', '<=', term + '\uf8ff')
      .limit(20)
      .get();
    displayNameSnap.forEach(addUser);

    if (results.length < 12) {
      const usernameSnap = await firestoreRef
        .where('username_lc', '>=', lowerTerm)
        .where('username_lc', '<=', lowerTerm + '\uf8ff')
        .limit(20)
        .get();
      usernameSnap.forEach(addUser);
    }

    return res.json({ users: results });
  } catch (e) {
    console.error('search/users error', e);
    return bad(res, 'Search failed', 500);
  }
});

app.get('/search/waves', async (req, res) => {
  const term = String(req.query?.term || '').trim();
  if (!term) return bad(res, 'Missing term');
  if (!adminReady) return bad(res, 'Search unavailable', 500);

  const lowerTerm = term.toLowerCase();
  const firestoreRef = admin.firestore().collection('waves');
  const matches = [];
  try {
    const snapshot = await firestoreRef
      .orderBy('createdAt', 'desc')
      .limit(120)
      .get();

    snapshot.docs.forEach(doc => {
      const data = doc.data() || {};
      if (data.isPublic === false) return;
      const haystack = [
        data.captionText,
        data.caption,
        data.authorName,
        data.ownerName,
        data.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(lowerTerm)) return;
      const playbackUrl = data.playbackUrl || data.mediaUrl || null;
      if (!playbackUrl) return;
      matches.push({
        id: doc.id,
        caption: data.captionText || data.caption || '',
        authorName: data.authorName || data.ownerName || '',
        ownerUid: data.ownerUid || null,
        playbackUrl,
        mediaUri: data.mediaUrl || null,
        muxStatus: data.muxStatus || null,
        audioUrl: data.audioUrl || null,
      });
    });

    return res.json({ waves: matches });
  } catch (e) {
    console.error('search/waves error', e);
    return bad(res, 'Search failed', 500);
  }
});

app.post('/live/start', async (req, res) => {
  try {
    const now = Date.now();
    const id = String(now);
    const channel = String((req.body?.channel || '').trim() || `Drift-${now}`);
    const uid = Number(req.body?.uid || 0);
    const hostUid = String(req.body?.hostUid || req.body?.uid || 'unknown');
    const hostName = String(req.body?.hostName || req.body?.title || 'drifter');
    const title = String(req.body?.title || hostName || 'Live Stream');
    const hostPhoto = req.body?.hostPhoto || null;
    
    const session = {
      id,
      channel,
      uid,
      hostUid,
      hostName,
      hostPhoto,
      title,
      startedAt: now,
      updatedAt: now,
      status: 'live',
      viewerCount: 0,
    };
    
    liveSessions.set(id, session);

    // Save to Firestore if available
    if (adminReady) {
      try {
        await admin.firestore().collection('live').doc(id).set(session);
        console.log(`Live session ${id} saved to Firestore`);
      } catch (e) {
        console.error('Failed to save live session to Firestore:', e);
      }
    }

    let token = null;
    // If Agora secrets configured and a channel provided, mint a publisher token
    if (AGORA_APP_ID && AGORA_APP_CERTIFICATE && channel) {
      const currentTs = Math.floor(now / 1000);
      const privilegeExpireTs = currentTs + 3600; // 1 hour
      token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel,
        uid,
        RtcRole.PUBLISHER,
        privilegeExpireTs
      );
    }

    broadcastLiveUpdate();
    return res.json({ liveId: id, id, channel, token });
  } catch (e) {
    console.error('live/start error', e);
    return bad(res, 'Failed to start live', 500);
  }
});

app.post('/live/end', async (req, res) => {
  try {
    const id = String(req.body?.liveId || req.body?.id || '').trim();
    if (!id) return bad(res, 'Missing liveId');
    
    const session = liveSessions.get(id);
    if (!session) {
      // Try to fetch from Firestore
      if (adminReady) {
        const doc = await admin.firestore().collection('live').doc(id).get();
        if (!doc.exists) return bad(res, 'Live not found', 404);
      } else {
        return bad(res, 'Live not found', 404);
      }
    }
    
    const now = Date.now();
    const updatedSession = {
      ...session,
      status: 'ended',
      updatedAt: now,
      endedAt: now,
    };
    
    liveSessions.set(id, updatedSession);
    
    // Update Firestore
    if (adminReady) {
      try {
        await admin.firestore().collection('live').doc(id).update({
          status: 'ended',
          updatedAt: now,
          endedAt: now,
        });
        console.log(`Live session ${id} ended in Firestore`);
      } catch (e) {
        console.error('Failed to update live session in Firestore:', e);
      }
    }
    
    broadcastLiveUpdate();
    
    // Cleanup ended sessions after some time
    setTimeout(() => { 
      try { 
        liveSessions.delete(id); 
        broadcastLiveUpdate(); 
      } catch {} 
    }, 5 * 60 * 1000);
    
    return res.json({ ok: true });
  } catch (e) {
    console.error('live/end error', e);
    return bad(res, 'Failed to end live', 500);
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// -------------------- Simple notification endpoints (stub) --------------------
app.post('/notify/wave', (req, res) => {
  try {
    const { waveId, ownerUid, authorName, merge } = req.body || {};
    if (!adminReady || !ownerUid) {
      console.log('Notify wave (stub):', { waveId, ownerUid, authorName });
      return res.json({ ok: true, stub: true });
    }
    // Fan out to owner's device tokens
    const col = admin.firestore().collection('users').doc(String(ownerUid)).collection('tokens');
    col.get().then((snap) => {
      const tokens = [];
      snap.forEach((d) => { const t = (d.data()||{}).token; if (t) tokens.push(String(t)); });
      if (tokens.length === 0) return res.json({ ok: true, sent: 0 });
      const msg = {
        notification: { title: 'New Wave', body: `${authorName || 'Someone'} posted a wave` },
        data: { type: 'wave', waveId: String(waveId || '') },
        tokens,
      };
      admin.messaging().sendEachForMulticast(msg).then((r) => res.json({ ok: true, successCount: r.successCount, failureCount: r.failureCount })).catch((e) => {
        console.error('FCM wave send error', e);
        res.status(500).json({ error: 'send failed' });
      });
    }).catch((e) => { console.error('FCM tokens fetch error', e); res.status(500).json({ error: 'token fetch failed' }); });
    // Kick off server-side merge if requested
    const mergeInfo = merge && typeof merge === 'object' ? merge : null;
    if (mergeInfo?.sourceVideoPath && mergeInfo?.overlayAudioPath) {
      startMuxMerge({
        waveId,
        sourceVideoPath: mergeInfo.sourceVideoPath,
        overlayAudioPath: mergeInfo.overlayAudioPath,
        ownerUid,
        authorName,
      }).catch((err) => console.error('Mux merge kickoff failed', err));
    }
  } catch (e) {
    return bad(res, 'notify error', 500);
  }
});

app.post('/notify/echo', (req, res) => {
  try {
    const { waveId, actorUid, text } = req.body || {};
    if (!adminReady || !waveId) {
      console.log('Notify echo (stub):', { waveId, actorUid, text });
      return res.json({ ok: true, stub: true });
    }
    // Look up wave to get ownerUid, then send
    admin.firestore().collection('waves').doc(String(waveId)).get().then((doc) => {
      const ownerUid = doc.exists ? (doc.data()||{}).ownerUid : null;
      if (!ownerUid) return res.json({ ok: true, sent: 0 });
      return admin.firestore().collection('users').doc(String(ownerUid)).collection('tokens').get().then((snap) => {
        const tokens = [];
        snap.forEach((d) => { const t = (d.data()||{}).token; if (t) tokens.push(String(t)); });
        if (tokens.length === 0) return res.json({ ok: true, sent: 0 });
        const msg = {
          notification: { title: 'New Echo', body: `${String(actorUid||'Someone')} echoed: ${String(text||'')}` },
          data: { type: 'echo', waveId: String(waveId || '') },
          tokens,
        };
        return admin.messaging().sendEachForMulticast(msg).then((r) => res.json({ ok: true, successCount: r.successCount, failureCount: r.failureCount }));
      });
    }).catch((e) => { console.error('notify/echo error', e); res.status(500).json({ error: 'notify failed' }); });
  } catch (e) {
    return bad(res, 'notify error', 500);
  }
});

app.post('/notify/splash', (req, res) => {
  try {
    const { waveId, actorUid } = req.body || {};
    if (!adminReady || !waveId) {
      console.log('Notify splash (stub):', { waveId, actorUid });
      return res.json({ ok: true, stub: true });
    }
    admin.firestore().collection('waves').doc(String(waveId)).get().then((doc) => {
      const ownerUid = doc.exists ? (doc.data()||{}).ownerUid : null;
      if (!ownerUid) return res.json({ ok: true, sent: 0 });
      return admin.firestore().collection('users').doc(String(ownerUid)).collection('tokens').get().then((snap) => {
        const tokens = [];
        snap.forEach((d) => { const t = (d.data()||{}).token; if (t) tokens.push(String(t)); });
        if (tokens.length === 0) return res.json({ ok: true, sent: 0 });
        const msg = {
          notification: { title: 'Splash!', body: `${String(actorUid||'Someone')} splashed your wave` },
          data: { type: 'splash', waveId: String(waveId || '') },
          tokens,
        };
        return admin.messaging().sendEachForMulticast(msg).then((r) => res.json({ ok: true, successCount: r.successCount, failureCount: r.failureCount }));
      });
    }).catch((e) => { console.error('notify/splash error', e); res.status(500).json({ error: 'notify failed' }); });
  } catch (e) {
    return bad(res, 'notify error', 500);
  }
});

// -------------------- Invites (in-memory dev) --------------------
const invites = new Map(); // id -> invite { id, fromUid, toUid, toEmail, message, status, createdAt }
let inviteAutoId = 1;

app.post('/invites', (req, res) => {
  try {
    const fromUid = String(req.body?.fromUid || '').trim();
    const toUid = String(req.body?.toUid || '').trim();
    const toEmail = String(req.body?.toEmail || '').trim();
    if (!fromUid || (!toUid && !toEmail)) return bad(res, 'Missing invite target');
    const id = String(inviteAutoId++);
    const invite = {
      id,
      fromUid,
      toUid: toUid || null,
      toEmail: toEmail || null,
      message: String(req.body?.message || ''),
      status: 'pending',
      createdAt: Date.now(),
    };
    invites.set(id, invite);
    // Best-effort push to recipient
    const notify = async () => {
      if (!adminReady) return;
      try {
        let targetUid = toUid;
        if (!targetUid && toEmail) {
          const qs = await admin.firestore().collection('users').where('email', '==', toEmail).limit(1).get();
          if (!qs.empty) targetUid = String(qs.docs[0].id);
        }
        if (!targetUid) return;
        const tokSnap = await admin.firestore().collection('users').doc(String(targetUid)).collection('tokens').get();
        const tokens = [];
        tokSnap.forEach((d) => { const t = (d.data()||{}).token; if (t) tokens.push(String(t)); });
        if (tokens.length === 0) return;
        const msg = {
          notification: { title: 'Invitation to Drift', body: 'You have been invited to join a Drift live' },
          data: { type: 'invite', inviteId: id, fromUid: fromUid },
          tokens,
        };
        await admin.messaging().sendEachForMulticast(msg);
      } catch (e) { console.warn('invite push failed', e); }
    };
    notify().finally(() => res.json({ ok: true, invite }));
  } catch (e) {
    console.error('invite create error', e);
    return bad(res, 'Failed to create invite', 500);
  }
});

app.get('/invites/mine', (req, res) => {
  const uid = String(req.query?.uid || '').trim();
  if (!uid) return bad(res, 'Missing uid');
  const items = Array.from(invites.values()).filter((i) => i.toUid === uid || i.fromUid === uid);
  return res.json({ items });
});

app.post('/invites/accept', (req, res) => {
  const id = String(req.body?.inviteId || '').trim();
  const uid = String(req.body?.uid || '').trim();
  if (!id || !uid) return bad(res, 'Missing inviteId/uid');
  const inv = invites.get(id);
  if (!inv) return bad(res, 'Invite not found', 404);
  inv.status = 'accepted';
  inv.updatedAt = Date.now();
  invites.set(id, inv);
  return res.json({ ok: true, invite: inv });
});

// -------------------- Drift requests + room SSE --------------------
const liveRoomSse = new Map(); // liveId -> [res]
const driftRooms = new Map(); // liveId -> { id, participants:Set<uid>, requests:Array<{uid,name}> }

function roomBroadcast(liveId, payload) {
  const list = liveRoomSse.get(liveId) || [];
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  const keep = [];
  for (const res of list) {
    try { res.write(data); keep.push(res); } catch { try { res.end(); } catch {} }
  }
  liveRoomSse.set(liveId, keep);
}

app.get('/drift/sse', (req, res) => {
  const liveId = String(req.query?.liveId || '').trim();
  if (!liveId) return bad(res, 'Missing liveId');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const room = driftRooms.get(liveId) || { id: liveId, participants: new Set(), requests: [] };
  driftRooms.set(liveId, room);
  res.write(`data: ${JSON.stringify({ type: 'hello', participants: Array.from(room.participants), requests: room.requests })}\n\n`);
  const arr = liveRoomSse.get(liveId) || [];
  arr.push(res);
  liveRoomSse.set(liveId, arr);
  req.on('close', () => {
    const cur = (liveRoomSse.get(liveId) || []).filter((r) => r !== res);
    liveRoomSse.set(liveId, cur);
    try { res.end(); } catch {}
  });
});

app.post('/drift/request', (req, res) => {
  const liveId = String(req.body?.liveId || '').trim();
  const fromUid = String(req.body?.fromUid || '').trim();
  const fromName = String(req.body?.fromName || '').trim() || 'guest';
  const hostUid = String(req.body?.hostUid || '').trim();
  if (!liveId || !fromUid) return bad(res, 'Missing liveId/fromUid');
  
  // Check if users have blocked each other
  if (hostUid) {
    const hostBlocked = blockedUsers.get(hostUid)?.has(fromUid) || false;
    const requesterBlocked = blockedUsers.get(fromUid)?.has(hostUid) || false;
    if (hostBlocked || requesterBlocked) {
      console.log(`Drift request blocked: ${hostUid} <-> ${fromUid}`);
      return bad(res, 'User is blocked', 403);
    }
  }
  
  const room = driftRooms.get(liveId) || { id: liveId, participants: new Set(), requests: [] };
  driftRooms.set(liveId, room);
  if (!room.requests.find((r) => r.uid === fromUid)) room.requests.push({ uid: fromUid, name: fromName });
  roomBroadcast(liveId, { type: 'request', uid: fromUid, name: fromName });
  return res.json({ ok: true });
});

app.post('/drift/accept', (req, res) => {
  try {
    const liveId = String(req.body?.liveId || '').trim();
    const requesterUid = Number(req.body?.requesterUid || 0);
    const channel = String(req.body?.channel || '').trim();
    const hostUid = String(req.body?.hostUid || '').trim();
    if (!liveId || !requesterUid) return bad(res, 'Missing liveId/requesterUid');
    
    // Check if users have blocked each other
    if (hostUid) {
      const hostBlocked = blockedUsers.get(hostUid)?.has(String(requesterUid)) || false;
      const requesterBlocked = blockedUsers.get(String(requesterUid))?.has(hostUid) || false;
      if (hostBlocked || requesterBlocked) {
        console.log(`Drift accept blocked: ${hostUid} <-> ${requesterUid}`);
        return bad(res, 'User is blocked', 403);
      }
    }
    
    const room = driftRooms.get(liveId) || { id: liveId, participants: new Set(), requests: [] };
    driftRooms.set(liveId, room);
    room.requests = room.requests.filter((r) => r.uid !== String(requesterUid));
    room.participants.add(String(requesterUid));
    let token = null;
    if (AGORA_APP_ID && AGORA_APP_CERTIFICATE && channel) {
      const currentTs = Math.floor(Date.now() / 1000);
      const privilegeExpireTs = currentTs + 3600;
      token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channel,
        requesterUid,
        RtcRole.SUBSCRIBER,
        privilegeExpireTs
      );
    }
    roomBroadcast(liveId, { type: 'accepted', uid: String(requesterUid) });
    return res.json({ ok: true, token });
  } catch (e) {
    console.error('drift/accept error', e);
    return bad(res, 'Failed to accept', 500);
  }
});

// Snapshot state endpoint (for clients without SSE)
app.get('/drift/state', (req, res) => {
  const liveId = String(req.query?.liveId || '').trim();
  if (!liveId) return bad(res, 'Missing liveId');
  const room = driftRooms.get(liveId) || { id: liveId, participants: new Set(), requests: [] };
  return res.json({
    id: room.id,
    participants: Array.from(room.participants || []),
    requests: room.requests || [],
  });
});

// -------------------- Real user management implementation --------------------
const blockedUsers = new Map(); // uid -> Set<blockedUid>
const mutedUsers = new Map(); // liveId -> Map<uid, mutedUntil>
const viewerCounts = new Map(); // liveId -> count

// Block user
app.post('/block-user', (req, res) => {
  const { uid, targetUid } = req.body || {};
  if (!uid || !targetUid) return bad(res, 'Missing uid/targetUid');
  
  if (!blockedUsers.has(uid)) blockedUsers.set(uid, new Set());
  blockedUsers.get(uid).add(targetUid);
  
  console.log(`User ${uid} blocked ${targetUid}`);
  return res.json({ ok: true });
});

// Unblock user
app.post('/unblock-user', (req, res) => {
  const { uid, targetUid } = req.body || {};
  if (!uid || !targetUid) return bad(res, 'Missing uid/targetUid');
  
  if (blockedUsers.has(uid)) {
    blockedUsers.get(uid).delete(targetUid);
  }
  
  console.log(`User ${uid} unblocked ${targetUid}`);
  return res.json({ ok: true });
});

// Get blocked users
app.get('/blocked-users', (req, res) => {
  const uid = String(req.query?.uid || '').trim();
  if (!uid) return bad(res, 'Missing uid');
  
  const blocked = Array.from(blockedUsers.get(uid) || []);
  return res.json({ blocked });
});

// Check if user is blocked (for drift matching)
app.post('/check-blocked', (req, res) => {
  const { uid, targetUid } = req.body || {};
  if (!uid || !targetUid) return bad(res, 'Missing uid/targetUid');
  
  const isBlocked = blockedUsers.get(uid)?.has(targetUid) || 
                    blockedUsers.get(targetUid)?.has(uid);
  
  return res.json({ blocked: isBlocked });
});

// Mute user in drift
app.post('/mute-user', (req, res) => {
  const { liveId, targetUid, duration = 300 } = req.body || {}; // default 5 min
  if (!liveId || !targetUid) return bad(res, 'Missing liveId/targetUid');
  
  if (!mutedUsers.has(liveId)) mutedUsers.set(liveId, new Map());
  const mutedUntil = Date.now() + (duration * 1000);
  mutedUsers.get(liveId).set(targetUid, mutedUntil);
  
  roomBroadcast(liveId, { type: 'user_muted', uid: targetUid, until: mutedUntil });
  console.log(`User ${targetUid} muted in ${liveId} until ${new Date(mutedUntil)}`);
  return res.json({ ok: true, mutedUntil });
});

// Unmute user in drift
app.post('/unmute-user', (req, res) => {
  const { liveId, targetUid } = req.body || {};
  if (!liveId || !targetUid) return bad(res, 'Missing liveId/targetUid');
  
  if (mutedUsers.has(liveId)) {
    mutedUsers.get(liveId).delete(targetUid);
  }
  
  roomBroadcast(liveId, { type: 'user_unmuted', uid: targetUid });
  console.log(`User ${targetUid} unmuted in ${liveId}`);
  return res.json({ ok: true });
});

// Remove user from drift
app.post('/remove-from-drift', (req, res) => {
  const { liveId, targetUid } = req.body || {};
  if (!liveId || !targetUid) return bad(res, 'Missing liveId/targetUid');
  
  const room = driftRooms.get(liveId);
  if (room) {
    room.participants.delete(String(targetUid));
    room.requests = room.requests.filter(r => r.uid !== String(targetUid));
  }
  
  roomBroadcast(liveId, { type: 'user_removed', uid: targetUid });
  console.log(`User ${targetUid} removed from ${liveId}`);
  return res.json({ ok: true });
});

// Update viewer count
app.post('/drift/viewer-join', (req, res) => {
  const { liveId } = req.body || {};
  if (!liveId) return bad(res, 'Missing liveId');
  
  const current = viewerCounts.get(liveId) || 0;
  viewerCounts.set(liveId, current + 1);
  
  roomBroadcast(liveId, { type: 'viewer_count', count: current + 1 });
  return res.json({ ok: true, count: current + 1 });
});

app.post('/drift/viewer-leave', (req, res) => {
  const { liveId } = req.body || {};
  if (!liveId) return bad(res, 'Missing liveId');
  
  const current = viewerCounts.get(liveId) || 0;
  const newCount = Math.max(0, current - 1);
  viewerCounts.set(liveId, newCount);
  
  roomBroadcast(liveId, { type: 'viewer_count', count: newCount });
  return res.json({ ok: true, count: newCount });
});

app.get('/drift/viewer-count', (req, res) => {
  const liveId = String(req.query?.liveId || '').trim();
  if (!liveId) return bad(res, 'Missing liveId');
  
  const count = viewerCounts.get(liveId) || 0;
  return res.json({ count });
});

// -------------------- Drift link sharing --------------------
app.post('/drift/share-link', (req, res) => {
  const { liveId, channel, title } = req.body || {};
  if (!liveId) return bad(res, 'Missing liveId');
  
  const shareLink = `drift://join/${liveId}?channel=${encodeURIComponent(channel || '')}`;
  const webLink = `https://drift.app/live/${liveId}`;
  
  return res.json({ 
    ok: true, 
    shareLink, 
    webLink,
    message: `Join my Drift: ${title || 'Live Stream'}! ${webLink}` 
  });
});

// -------------------- Notice Board Registration --------------------
const noticeRegistrations = new Map(); // id -> registration
let noticeRegId = 1;

app.post('/notice-board/register', (req, res) => {
  const { orgName, orgType, email, phone, bio, uid } = req.body || {};
  if (!orgName || !email) return bad(res, 'Missing organization name or email');
  
  const id = String(noticeRegId++);
  const registration = {
    id,
    orgName: String(orgName),
    orgType: String(orgType || 'Public'),
    email: String(email),
    phone: String(phone || ''),
    bio: String(bio || ''),
    uid: String(uid || ''),
    status: 'pending_payment', // Stop at payment as requested
    createdAt: Date.now(),
  };
  
  noticeRegistrations.set(id, registration);
  console.log('Notice Board registration:', registration);
  
  return res.json({ 
    ok: true, 
    registrationId: id,
    status: 'pending_payment',
    message: 'Registration received. Please proceed to payment to complete.' 
  });
});

app.get('/notice-board/registrations', (req, res) => {
  const uid = String(req.query?.uid || '').trim();
  const items = Array.from(noticeRegistrations.values())
    .filter(r => !uid || r.uid === uid);
  return res.json({ items });
});

// -------------------- School Mode - Zimbabwe Schools --------------------
const zimbabweSchools = [
  'Prince Edward School', 'St Georges College', 'Arundel School', 'Churchill Boys High',
  'Hellenic Academy', 'Dominican Convent High School', 'Queens High School', 
  'Cranborne Boys High', 'Allan Wilson High', 'Roosevelt Girls High',
  'Mabelreign Girls High', 'Harare High School', 'Oriel Boys High School',
  'St Johns College', 'Peterhouse', 'Falcon College', 'Heritage School',
  'Watershed College', 'Springvale House', 'Gateway High School'
];

const schoolAccounts = new Map(); // schoolId -> school data
const teacherAccounts = new Map(); // teacherId -> teacher data
let schoolAutoId = 1;
let teacherAutoId = 1;

app.post('/school/register', (req, res) => {
  const { schoolName, email, phone, address, principalName, uid } = req.body || {};
  
  if (!schoolName || !email) {
    return bad(res, 'Missing school name or email');
  }
  
  // Check if it's a registered Zimbabwe school
  const isRegistered = zimbabweSchools.some(s => 
    s.toLowerCase().includes(schoolName.toLowerCase()) || 
    schoolName.toLowerCase().includes(s.toLowerCase())
  );
  
  if (!isRegistered) {
    return res.json({
      ok: false,
      error: 'School not in registered Zimbabwe schools list',
      suggestion: 'Please contact support to add your school'
    });
  }
  
  const id = String(schoolAutoId++);
  const school = {
    id,
    schoolName: String(schoolName),
    email: String(email),
    phone: String(phone || ''),
    address: String(address || ''),
    principalName: String(principalName || ''),
    uid: String(uid || ''),
    status: 'active',
    createdAt: Date.now(),
  };
  
  schoolAccounts.set(id, school);
  console.log('School registered:', school);
  
  return res.json({ 
    ok: true, 
    schoolId: id,
    school,
    message: 'School account created successfully!' 
  });
});

app.get('/school/list-zimbabwe', (_req, res) => {
  return res.json({ schools: zimbabweSchools });
});

app.get('/school/info', (req, res) => {
  const schoolId = String(req.query?.schoolId || '').trim();
  if (!schoolId) return bad(res, 'Missing schoolId');
  
  const school = schoolAccounts.get(schoolId);
  if (!school) return bad(res, 'School not found', 404);
  
  return res.json({ school });
});

// -------------------- Teacher's Dock --------------------
app.post('/teacher/register', (req, res) => {
  const { schoolId, name, email, subject, teacherId, uid } = req.body || {};
  
  if (!schoolId || !name || !email) {
    return bad(res, 'Missing required teacher information');
  }
  
  const school = schoolAccounts.get(schoolId);
  if (!school) {
    return bad(res, 'School not found. Please register school first.', 404);
  }
  
  const id = String(teacherAutoId++);
  const teacher = {
    id,
    schoolId: String(schoolId),
    name: String(name),
    email: String(email),
    subject: String(subject || ''),
    teacherId: String(teacherId || ''),
    uid: String(uid || ''),
    status: 'active',
    createdAt: Date.now(),
  };
  
  teacherAccounts.set(id, teacher);
  console.log('Teacher registered:', teacher);
  
  return res.json({ 
    ok: true, 
    teacherId: id,
    teacher,
    message: 'Teacher account created successfully!' 
  });
});

app.post('/teacher/create-lesson', (req, res) => {
  const { teacherId, title, subject, description, scheduledTime } = req.body || {};
  
  if (!teacherId || !title) {
    return bad(res, 'Missing teacher ID or lesson title');
  }
  
  const teacher = teacherAccounts.get(teacherId);
  if (!teacher) {
    return bad(res, 'Teacher not found', 404);
  }
  
  const lessonId = `lesson_${Date.now()}`;
  const lesson = {
    id: lessonId,
    teacherId: String(teacherId),
    schoolId: teacher.schoolId,
    title: String(title),
    subject: String(subject || teacher.subject),
    description: String(description || ''),
    scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
    createdAt: Date.now(),
    status: 'scheduled',
  };
  
  console.log('Lesson created:', lesson);
  
  return res.json({ 
    ok: true, 
    lessonId,
    lesson,
    message: 'Lesson created successfully!' 
  });
});

app.get('/teacher/lessons', (req, res) => {
  const teacherId = String(req.query?.teacherId || '').trim();
  const schoolId = String(req.query?.schoolId || '').trim();
  
  // In production, this would query a database
  // For now, return a success response indicating the endpoint is ready
  return res.json({ 
    ok: true,
    lessons: [],
    message: 'Teacher lessons endpoint ready (database integration pending)'
  });
});

// -------------------- Wave Download --------------------
app.post('/wave/download', async (req, res) => {
  const { waveId, uid } = req.body || {};
  
  if (!waveId) {
    return bad(res, 'Missing waveId');
  }
  
  try {
    if (!adminReady) {
      console.log('Wave download (stub):', { waveId, uid });
      return res.json({ 
        ok: true, 
        stub: true,
        downloadUrl: `https://storage.example.com/waves/${waveId}.mp4`,
        message: 'Download ready (Firebase not configured)' 
      });
    }
    
    // Get wave document
    const waveDoc = await admin.firestore().collection('waves').doc(waveId).get();
    
    if (!waveDoc.exists) {
      return bad(res, 'Wave not found', 404);
    }
    
    const waveData = waveDoc.data() || {};
    const mediaPath = waveData.mediaPath || waveData.playbackUrl || waveData.mediaUrl;
    
    if (!mediaPath) {
      return bad(res, 'No media found for this wave', 404);
    }
    
    // Track download
    await admin.firestore().collection('waves').doc(waveId).update({
      downloadCount: admin.firestore.FieldValue.increment(1),
      lastDownloadedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return res.json({ 
      ok: true, 
      downloadUrl: mediaPath,
      waveId,
      message: 'Wave ready for download' 
    });
  } catch (e) {
    console.error('Wave download error:', e);
    return bad(res, 'Failed to prepare download', 500);
  }
});

// -------------------- Chartered Sea Drift (Paid Live Rooms) --------------------
const charteredDrifts = new Map(); // driftId -> drift session
const driftPasses = new Map(); // driftId -> Set<uid>
const driftEarnings = new Map(); // driftId -> { total, ticketsSold }
let charteredDriftId = 1;

// Start a chartered drift
app.post('/chartered-drift/start', (req, res) => {
  const { title, ticketNumber, priceUSD, durationMins, access, hostUid, hostName } = req.body || {};
  
  if (!title || !ticketNumber || !priceUSD) {
    return bad(res, 'Missing required chartered drift parameters');
  }
  
  const id = `chartered_${charteredDriftId++}`;
  const channel = `CharteredDrift_${ticketNumber}_${Date.now()}`;
  const now = Date.now();
  
  const drift = {
    id,
    title: String(title),
    ticketNumber: String(ticketNumber),
    priceUSD: Number(priceUSD),
    durationMins: Number(durationMins || 60),
    access: String(access || 'paid-only'),
    hostUid: String(hostUid || ''),
    hostName: String(hostName || 'Host'),
    channel,
    startedAt: now,
    endsAt: now + (Number(durationMins || 60) * 60 * 1000),
    status: 'live',
    chatEnabled: true,
  };
  
  charteredDrifts.set(id, drift);
  driftPasses.set(id, new Set([String(hostUid)])); // Host gets auto pass
  driftEarnings.set(id, { total: 0, ticketsSold: 0 });
  
  // Generate Agora token for host
  let token = null;
  if (AGORA_APP_ID && AGORA_APP_CERTIFICATE && channel) {
    const currentTs = Math.floor(now / 1000);
    const privilegeExpireTs = currentTs + (Number(durationMins || 60) * 60);
    const uid = Number(hostUid) || 0;
    token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpireTs
    );
  }
  
  console.log('Chartered drift started:', drift);
  
  return res.json({
    ok: true,
    driftId: id,
    drift,
    channel,
    token,
    message: 'Chartered drift started successfully!'
  });
});

// End a chartered drift
app.post('/chartered-drift/end', (req, res) => {
  const { driftId } = req.body || {};
  
  if (!driftId) return bad(res, 'Missing driftId');
  
  const drift = charteredDrifts.get(driftId);
  if (!drift) return bad(res, 'Drift not found', 404);
  
  drift.status = 'ended';
  drift.endedAt = Date.now();
  charteredDrifts.set(driftId, drift);
  
  const earnings = driftEarnings.get(driftId) || { total: 0, ticketsSold: 0 };
  
  console.log('Chartered drift ended:', { driftId, earnings });
  
  return res.json({
    ok: true,
    drift,
    earnings,
    message: 'Chartered drift ended successfully!'
  });
});

// View passes (ticket holders)
app.get('/chartered-drift/passes', (req, res) => {
  const driftId = String(req.query?.driftId || '').trim();
  
  if (!driftId) return bad(res, 'Missing driftId');
  
  const drift = charteredDrifts.get(driftId);
  if (!drift) return bad(res, 'Drift not found', 404);
  
  const passes = Array.from(driftPasses.get(driftId) || []);
  
  return res.json({
    ok: true,
    driftId,
    passes,
    count: passes.length
  });
});

// Toggle chat in chartered drift
app.post('/chartered-drift/toggle-chat', (req, res) => {
  const { driftId, enabled } = req.body || {};
  
  if (!driftId) return bad(res, 'Missing driftId');
  
  const drift = charteredDrifts.get(driftId);
  if (!drift) return bad(res, 'Drift not found', 404);
  
  drift.chatEnabled = Boolean(enabled);
  charteredDrifts.set(driftId, drift);
  
  console.log(`Chat ${enabled ? 'enabled' : 'disabled'} for drift ${driftId}`);
  
  return res.json({
    ok: true,
    chatEnabled: drift.chatEnabled
  });
});

// View earnings
app.get('/chartered-drift/earnings', (req, res) => {
  const driftId = String(req.query?.driftId || '').trim();
  const hostUid = String(req.query?.hostUid || '').trim();
  
  if (driftId) {
    const earnings = driftEarnings.get(driftId) || { total: 0, ticketsSold: 0 };
    const drift = charteredDrifts.get(driftId);
    
    return res.json({
      ok: true,
      driftId,
      earnings,
      drift: drift || null
    });
  }
  
  if (hostUid) {
    // Get all earnings for a host
    const allEarnings = [];
    let totalEarnings = 0;
    
    charteredDrifts.forEach((drift, id) => {
      if (drift.hostUid === hostUid) {
        const earnings = driftEarnings.get(id) || { total: 0, ticketsSold: 0 };
        allEarnings.push({
          driftId: id,
          title: drift.title,
          earnings,
          status: drift.status
        });
        totalEarnings += earnings.total;
      }
    });
    
    return res.json({
      ok: true,
      hostUid,
      drifts: allEarnings,
      totalEarnings
    });
  }
  
  return bad(res, 'Missing driftId or hostUid');
});

// Share promo link
app.post('/chartered-drift/share-promo', (req, res) => {
  const { driftId, title, priceUSD } = req.body || {};
  
  if (!driftId) return bad(res, 'Missing driftId');
  
  const drift = charteredDrifts.get(driftId);
  if (!drift) return bad(res, 'Drift not found', 404);
  
  const shareUrl = `drift://join-chartered/${driftId}`;
  const webUrl = `https://drift.app/chartered/${driftId}`;
  const message = `🎟 Join my Chartered Sea Drift: "${title || drift.title}"!\n💰 Tickets: $${priceUSD || drift.priceUSD}\n🔗 ${webUrl}`;
  
  return res.json({
    ok: true,
    shareUrl,
    webUrl,
    message,
    drift
  });
});

// Purchase pass (ticket)
app.post('/chartered-drift/purchase-pass', (req, res) => {
  const { driftId, uid, paymentMethod } = req.body || {};
  
  if (!driftId || !uid) return bad(res, 'Missing driftId or uid');
  
  const drift = charteredDrifts.get(driftId);
  if (!drift) return bad(res, 'Drift not found', 404);
  
  if (drift.status !== 'live') {
    return bad(res, 'Drift is not currently active', 400);
  }
  
  // Add user to passes
  const passes = driftPasses.get(driftId) || new Set();
  passes.add(String(uid));
  driftPasses.set(driftId, passes);
  
  // Update earnings
  const earnings = driftEarnings.get(driftId) || { total: 0, ticketsSold: 0 };
  earnings.total += drift.priceUSD;
  earnings.ticketsSold += 1;
  driftEarnings.set(driftId, earnings);
  
  // Generate viewer token
  let token = null;
  if (AGORA_APP_ID && AGORA_APP_CERTIFICATE && drift.channel) {
    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTs + 7200; // 2 hours
    token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      drift.channel,
      Number(uid) || 0,
      RtcRole.SUBSCRIBER,
      privilegeExpireTs
    );
  }
  
  console.log(`Pass purchased for drift ${driftId} by user ${uid}`);
  
  return res.json({
    ok: true,
    drift,
    token,
    channel: drift.channel,
    message: 'Pass purchased successfully! You can now join the drift.'
  });
});

// -------------------- Legacy stubs for remaining features --------------------
// Moderator management
const liveModerators = new Map(); // liveId -> Set<userId>

app.post('/make-moderator', (req, res) => {
  const { liveId, userId, username } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  if (!liveModerators.has(liveId)) liveModerators.set(liveId, new Set());
  liveModerators.get(liveId).add(userId);
  
  roomBroadcast(liveId, { type: 'moderator_added', userId, username });
  console.log(`User ${userId} (${username}) made moderator in ${liveId}`);
  return res.json({ ok: true });
});

app.post('/remove-moderator', (req, res) => {
  const { liveId, userId } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  if (liveModerators.has(liveId)) {
    liveModerators.get(liveId).delete(userId);
  }
  
  roomBroadcast(liveId, { type: 'moderator_removed', userId });
  console.log(`User ${userId} removed as moderator from ${liveId}`);
  return res.json({ ok: true });
});

app.get('/moderators', (req, res) => {
  const liveId = String(req.query?.liveId || '').trim();
  if (!liveId) return bad(res, 'Missing liveId');
  
  const mods = Array.from(liveModerators.get(liveId) || []);
  return res.json({ moderators: mods });
});

// Timeout users
const timeouts = new Map(); // liveId -> Map<userId, timeoutUntil>

app.post('/timeout-user', (req, res) => {
  const { liveId, userId, username, duration = 5, channel } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  if (!timeouts.has(liveId)) timeouts.set(liveId, new Map());
  const timeoutUntil = Date.now() + (duration * 60 * 1000);
  timeouts.get(liveId).set(userId, timeoutUntil);
  
  // Remove from participants
  const room = driftRooms.get(liveId);
  if (room) {
    room.participants.delete(String(userId));
  }
  
  roomBroadcast(liveId, { type: 'user_timeout', userId, username, until: timeoutUntil, duration });
  console.log(`User ${userId} timed out in ${liveId} for ${duration} minutes`);
  
  // Auto-remove timeout
  setTimeout(() => {
    if (timeouts.has(liveId)) {
      timeouts.get(liveId).delete(userId);
      roomBroadcast(liveId, { type: 'timeout_expired', userId });
    }
  }, duration * 60 * 1000);
  
  return res.json({ ok: true, timeoutUntil });
});

// Pin/unpin user
const pinnedUsers = new Map(); // liveId -> userId

app.post('/pin-user', (req, res) => {
  const { liveId, userId, username } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  pinnedUsers.set(liveId, userId);
  roomBroadcast(liveId, { type: 'user_pinned', userId, username });
  console.log(`User ${userId} pinned in ${liveId}`);
  return res.json({ ok: true });
});

app.post('/unpin-user', (req, res) => {
  const { liveId, userId } = req.body || {};
  if (!liveId) return bad(res, 'Missing liveId');
  
  pinnedUsers.delete(liveId);
  roomBroadcast(liveId, { type: 'user_unpinned', userId });
  console.log(`User unpinned in ${liveId}`);
  return res.json({ ok: true });
});

// Kick user
app.post('/kick-user', (req, res) => {
  const { liveId, userId, username, channel, kickerId, notifyViaRTM } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  const room = driftRooms.get(liveId);
  if (room) {
    room.participants.delete(String(userId));
    room.requests = room.requests.filter(r => r.uid !== String(userId));
  }
  
  const kickData = { 
    type: 'user_kicked', 
    userId, 
    username,
    kickerId: kickerId || null,
    notifyViaRTM: notifyViaRTM || false
  };
  
  roomBroadcast(liveId, kickData);
  console.log(`User ${userId} kicked from ${liveId} by ${kickerId || 'system'}`);
  return res.json({ ok: true });
});

// Co-host management
const coHosts = new Map(); // liveId -> Set<userId>

app.post('/invite-cohost', async (req, res) => {
  const { liveId, userId, username, channel } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  if (!coHosts.has(liveId)) coHosts.set(liveId, new Set());
  coHosts.get(liveId).add(userId);
  
  // Generate co-host token (publisher role)
  let token = null;
  if (AGORA_APP_ID && AGORA_APP_CERTIFICATE && channel) {
    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTs + 7200; // 2 hours
    token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      Number(userId) || 0,
      RtcRole.PUBLISHER,
      privilegeExpireTs
    );
  }
  
  roomBroadcast(liveId, { type: 'cohost_invited', userId, username });
  console.log(`User ${userId} invited as co-host to ${liveId}`);
  
  // Send notification to user
  if (adminReady) {
    try {
      const db = admin.firestore();
      const tokSnap = await db.collection('users').doc(String(userId)).collection('tokens').get();
      const tokens = [];
      tokSnap.forEach((d) => { const t = (d.data()||{}).token; if (t) tokens.push(String(t)); });
      if (tokens.length > 0) {
        await admin.messaging().sendEachForMulticast({
          notification: { title: 'Co-host Invitation', body: 'You\'ve been invited as a co-host!' },
          data: { type: 'cohost_invite', liveId, channel: channel || '' },
          tokens,
        });
      }
    } catch (e) { console.warn('Co-host notification failed:', e); }
  }
  
  return res.json({ ok: true, token, channel });
});

app.post('/remove-cohost', (req, res) => {
  const { liveId, userId } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  if (coHosts.has(liveId)) {
    coHosts.get(liveId).delete(userId);
  }
  
  roomBroadcast(liveId, { type: 'cohost_removed', userId });
  console.log(`User ${userId} removed as co-host from ${liveId}`);
  return res.json({ ok: true });
});

app.get('/cohosts', (req, res) => {
  const liveId = String(req.query?.liveId || '').trim();
  if (!liveId) return bad(res, 'Missing liveId');
  
  const hosts = Array.from(coHosts.get(liveId) || []);
  return res.json({ coHosts: hosts });
});

// Transfer host
app.post('/transfer-host', (req, res) => {
  const { liveId, newHostId, newHostName, channel } = req.body || {};
  if (!liveId || !newHostId) return bad(res, 'Missing liveId or newHostId');
  
  // Generate new publisher token for new host
  let token = null;
  if (AGORA_APP_ID && AGORA_APP_CERTIFICATE && channel) {
    const currentTs = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = currentTs + 7200;
    token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channel,
      Number(newHostId) || 0,
      RtcRole.PUBLISHER,
      privilegeExpireTs
    );
  }
  
  roomBroadcast(liveId, { type: 'host_transferred', newHostId, newHostName });
  console.log(`Host transferred to ${newHostId} in ${liveId}`);
  return res.json({ ok: true, token });
});

// Chat controls
app.post('/disable-chat', (req, res) => {
  const { liveId } = req.body || {};
  if (!liveId) return bad(res, 'Missing liveId');
  
  roomBroadcast(liveId, { type: 'chat_disabled' });
  console.log(`Chat disabled in ${liveId}`);
  return res.json({ ok: true });
});

app.post('/enable-chat', (req, res) => {
  const { liveId } = req.body || {};
  if (!liveId) return bad(res, 'Missing liveId');
  
  roomBroadcast(liveId, { type: 'chat_enabled' });
  console.log(`Chat enabled in ${liveId}`);
  return res.json({ ok: true });
});

// Private messages in live
const privateMessages = new Map(); // messageId -> message

app.post('/send-private-message', (req, res) => {
  const { liveId, fromId, toId, message, fromName } = req.body || {};
  if (!fromId || !toId || !message) return bad(res, 'Missing required fields');
  
  const msgId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const msg = {
    id: msgId,
    liveId,
    fromId,
    toId,
    message,
    fromName,
    createdAt: Date.now(),
  };
  
  privateMessages.set(msgId, msg);
  
  // Notify recipient
  if (adminReady) {
    admin.firestore().collection('users').doc(String(toId)).collection('tokens').get()
      .then(snap => {
        const tokens = [];
        snap.forEach((d) => { const t = (d.data()||{}).token; if (t) tokens.push(String(t)); });
        if (tokens.length > 0) {
          admin.messaging().sendEachForMulticast({
            notification: { title: `Message from ${fromName}`, body: message },
            data: { type: 'private_message', messageId: msgId, fromId, liveId: liveId || '' },
            tokens,
          });
        }
      })
      .catch(e => console.warn('PM notification failed:', e));
  }
  
  console.log(`Private message sent from ${fromId} to ${toId}`);
  return res.json({ ok: true, messageId: msgId });
});

// Shoutouts
app.post('/give-shoutout', (req, res) => {
  const { liveId, userId, username, message } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  const shoutout = {
    userId,
    username,
    message: message || `Shoutout to ${username}!`,
    timestamp: Date.now(),
  };
  
  roomBroadcast(liveId, { type: 'shoutout', ...shoutout });
  console.log(`Shoutout given to ${username} in ${liveId}`);
  return res.json({ ok: true });
});

// Badges
const userBadges = new Map(); // userId -> Set<badge>

app.post('/award-badge', (req, res) => {
  const { liveId, userId, username, badge } = req.body || {};
  if (!userId || !badge) return bad(res, 'Missing userId or badge');
  
  if (!userBadges.has(userId)) userBadges.set(userId, new Set());
  userBadges.get(userId).add(badge);
  
  if (liveId) {
    roomBroadcast(liveId, { type: 'badge_awarded', userId, username, badge });
  }
  
  console.log(`Badge "${badge}" awarded to ${userId}`);
  return res.json({ ok: true });
});

app.get('/user-badges', (req, res) => {
  const userId = String(req.query?.userId || '').trim();
  if (!userId) return bad(res, 'Missing userId');
  
  const badges = Array.from(userBadges.get(userId) || []);
  return res.json({ badges });
});

// Feature supporter
app.post('/feature-supporter', (req, res) => {
  const { liveId, userId, username, amount } = req.body || {};
  if (!liveId || !userId) return bad(res, 'Missing liveId or userId');
  
  roomBroadcast(liveId, { 
    type: 'supporter_featured', 
    userId, 
    username,
    amount: amount || 0,
    timestamp: Date.now(),
  });
  
  console.log(`Supporter ${username} featured in ${liveId}`);
  return res.json({ ok: true });
});


// ============================================================================
// CREW (Follow/Unfollow) ENDPOINTS
// ============================================================================

// Join a crew (follow someone)
app.post('/crew/join', async (req, res) => {
  try {
    const { fromUid, targetUid, fromName, fromPhoto } = req.body;
    if (!fromUid || !targetUid) return bad(res, 'fromUid and targetUid required');
    if (fromUid === targetUid) return bad(res, 'Cannot join your own crew');

    if (!adminReady) return bad(res, 'Firebase admin not initialized', 503);

    const db = admin.firestore();
    
    // Add to target user's crew
    await db.collection('users').doc(targetUid).collection('crew').doc(fromUid).set({
      uid: fromUid,
      name: fromName || 'Anonymous',
      photo: fromPhoto || null,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add to user's boarding (following) list
    await db.collection('users').doc(fromUid).collection('boarding').doc(targetUid).set({
      uid: targetUid,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: 'Joined crew successfully' });
  } catch (e) {
    console.error('Join crew error:', e);
    res.status(500).json({ error: e?.message || 'Failed to join crew' });
  }
});

// Leave a crew (unfollow someone)
app.post('/crew/leave', async (req, res) => {
  try {
    const { fromUid, targetUid } = req.body;
    if (!fromUid || !targetUid) return bad(res, 'fromUid and targetUid required');

    if (!adminReady) return bad(res, 'Firebase admin not initialized', 503);

    const db = admin.firestore();
    
    // Remove from target user's crew
    await db.collection('users').doc(targetUid).collection('crew').doc(fromUid).delete();

    // Remove from user's boarding (following) list
    await db.collection('users').doc(fromUid).collection('boarding').doc(targetUid).delete();

    res.json({ success: true, message: 'Left crew successfully' });
  } catch (e) {
    console.error('Leave crew error:', e);
    res.status(500).json({ error: e?.message || 'Failed to leave crew' });
  }
});

// Check if user is in a crew
app.get('/crew/check/:targetUid/:fromUid', async (req, res) => {
  try {
    const { targetUid, fromUid } = req.params;
    if (!adminReady) return bad(res, 'Firebase admin not initialized', 503);

    const db = admin.firestore();
    const doc = await db.collection('users').doc(targetUid).collection('crew').doc(fromUid).get();
    
    res.json({ inCrew: doc.exists });
  } catch (e) {
    console.error('Check crew error:', e);
    res.status(500).json({ error: e?.message || 'Failed to check crew status' });
  }
});

// Get crew members (followers)
app.get('/crew/:targetUid', async (req, res) => {
  try {
    const { targetUid } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    if (!adminReady) return bad(res, 'Firebase admin not initialized', 503);

    const db = admin.firestore();
    const snapshot = await db.collection('users')
      .doc(targetUid)
      .collection('crew')
      .orderBy('joinedAt', 'desc')
      .limit(limit)
      .get();

    const crew = snapshot.docs.map(doc => ({
      uid: doc.id,
      name: doc.data().name || 'Anonymous',
      photo: doc.data().photo || null,
      joinedAt: doc.data().joinedAt,
    }));

    res.json({ crew, count: crew.length });
  } catch (e) {
    console.error('Get crew error:', e);
    res.status(500).json({ error: e?.message || 'Failed to get crew' });
  }
});

// Get boarding (following) list
app.get('/boarding/:fromUid', async (req, res) => {
  try {
    const { fromUid } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    if (!adminReady) return bad(res, 'Firebase admin not initialized', 503);

    const db = admin.firestore();
    const snapshot = await db.collection('users')
      .doc(fromUid)
      .collection('boarding')
      .orderBy('joinedAt', 'desc')
      .limit(limit)
      .get();

    const boarding = snapshot.docs.map(doc => ({
      uid: doc.id,
      joinedAt: doc.data().joinedAt,
    }));

    res.json({ boarding, count: boarding.length });
  } catch (e) {
    console.error('Get boarding error:', e);
    res.status(500).json({ error: e?.message || 'Failed to get boarding' });
  }
});

// -------------------- Virtual Background Management --------------------
const liveBackgrounds = new Map(); // channel -> { uid, background, backgroundName, timestamp }

app.post('/live/set-background', (req, res) => {
  const { uid, channel, background, backgroundName } = req.body || {};
  if (!uid || !channel) return bad(res, 'Missing uid or channel');

  liveBackgrounds.set(channel, {
    uid,
    background: background || null,
    backgroundName: backgroundName || 'None',
    timestamp: Date.now(),
  });

  console.log(`[Background] ${uid} in ${channel} set to: ${backgroundName}`);
  
  res.json({
    ok: true,
    background,
    backgroundName,
    message: `Background set to ${backgroundName}`,
  });
});

app.get('/live/get-background/:channel', (req, res) => {
  const { channel } = req.params;
  const bgInfo = liveBackgrounds.get(channel);
  
  if (!bgInfo) {
    return res.json({
      ok: true,
      background: null,
      backgroundName: 'None',
      message: 'No background set',
    });
  }

  res.json({
    ok: true,
    ...bgInfo,
  });
});

app.listen(PORT, () => {
  console.log(`Drift backend listening on :${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  - /agora/token`);
  console.log(`  - /live/recent, /live/start, /live/end`);
  console.log(`  - /drift/request, /drift/accept, /drift/share-link`);
  console.log(`  - /chartered-drift/* (start, end, passes, earnings, toggle-chat, share-promo, purchase-pass)`);
  console.log(`  - /block-user, /unblock-user, /mute-user, /unmute-user`);
  console.log(`  - /remove-from-drift, /kick-user, /drift/viewer-*`);
  console.log(`  - /make-moderator, /remove-moderator, /moderators`);
  console.log(`  - /timeout-user, /pin-user, /unpin-user`);
  console.log(`  - /invite-cohost, /remove-cohost, /cohosts, /transfer-host`);
  console.log(`  - /disable-chat, /enable-chat`);
  console.log(`  - /send-private-message, /give-shoutout`);
  console.log(`  - /award-badge, /user-badges, /feature-supporter`);
  console.log(`  - /start-recording, /stop-recording, /recording-status, /recordings`);
  console.log(`  - /notice-board/register`);
  console.log(`  - /school/register, /school/list-zimbabwe, /school/info`);
  console.log(`  - /teacher/register, /teacher/create-lesson, /teacher/lessons`);
  console.log(`  - /wave/download`);
  console.log(`  - /crew/join, /crew/leave, /crew/check`);
  console.log(`  - /crew/:targetUid, /boarding/:fromUid`);
  console.log(`  - /live/set-background, /live/get-background/:channel`);
});
