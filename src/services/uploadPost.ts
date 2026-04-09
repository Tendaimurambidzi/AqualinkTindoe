// src/services/uploadPost.ts
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';
import { Video as MediaVideoCompressor } from 'react-native-compressor';

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
const MAX_SAFE_POST_MEDIA_BYTES = 120 * 1024 * 1024;
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

const maybeCompressVideoForUpload = async (localPath: string, mimeType?: string | null) => {
  const type = String(mimeType || '').toLowerCase();
  if (!type.startsWith('video/')) return localPath;

  let resolvedPath = String(localPath || '').trim();
  if (!resolvedPath) return localPath;
  if (Platform.OS === 'android' && resolvedPath.startsWith('file://')) {
    resolvedPath = resolvedPath.replace('file://', '');
  }

  try {
    const rnfs = resolveRNFS();
    const stats = rnfs ? await rnfs.stat(resolvedPath) : null;
    const sizeBytes = Math.max(0, Number((stats as any)?.size || 0));
    if (sizeBytes <= 8 * 1024 * 1024) {
      return resolvedPath;
    }

    const compressedUri = await MediaVideoCompressor.compress(
      Platform.OS === 'android' && !/^file:\/\//i.test(resolvedPath)
        ? `file://${resolvedPath}`
        : resolvedPath,
      {
        compressionMethod: 'auto',
        maxSize: 960,
        minimumFileSizeForCompress: 8,
      },
    );
    if (!compressedUri) {
      return resolvedPath;
    }
    return Platform.OS === 'android' && compressedUri.startsWith('file://')
      ? compressedUri.replace('file://', '')
      : compressedUri;
  } catch (error) {
    console.warn('Video compression failed in uploadPost, using original file:', error);
    return resolvedPath;
  }
};

const isRecoverableStorageUploadError = (error: any) => {
  const raw = String(error?.message || error?.code || error || '').toLowerCase();
  return (
    raw.includes('server has terminated the upload session') ||
    raw.includes('storage/unknown') ||
    raw.includes('network request failed') ||
    raw.includes('retry-limit-exceeded') ||
    raw.includes('timeout') ||
    raw.includes('unavailable')
  );
};

const uploadFileWithRecovery = async (
  filePath: string,
  localPath: string,
  metadata?: Record<string, any>,
  maxAttempts: number = 3,
) => {
  const fileRef = storage().ref(filePath);
  let lastError: any = null;
  const tryRecoverDownloadUrl = async () => {
    for (let recoveryAttempt = 1; recoveryAttempt <= 3; recoveryAttempt += 1) {
      try {
        const recoveredUrl = await fileRef.getDownloadURL();
        if (recoveredUrl) return recoveredUrl;
      } catch {}
      if (recoveryAttempt < 3) {
        await new Promise(resolve => setTimeout(resolve, recoveryAttempt * 1200));
      }
    }
    return null;
  };
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await fileRef.putFile(localPath, metadata || {});
      const completedUrl = await tryRecoverDownloadUrl();
      if (completedUrl) return completedUrl;
      throw new Error('Upload completed but no download URL was available yet.');
    } catch (error: any) {
      lastError = error;
      const recoveredUrl = await tryRecoverDownloadUrl();
      if (recoveredUrl) return recoveredUrl;
      if (!isRecoverableStorageUploadError(error) || attempt >= maxAttempts) {
        throw error;
      }
      console.warn(`uploadPost retry ${attempt} for ${filePath}`, error);
      await new Promise(resolve => setTimeout(resolve, Math.min(4000, attempt * 900)));
    }
  }
  throw lastError || new Error('Upload failed');
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
    const declaredSize = Math.max(0, Number((media as any)?.fileSize || 0));
    if (declaredSize > MAX_SAFE_POST_MEDIA_BYTES) {
      throw new Error('This media file is too large to upload safely on a phone. Keep it under 120 MB.');
    }
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

    try {
      const rnfs = resolveRNFS();
      const stats = rnfs ? await rnfs.stat(localPath) : null;
      const resolvedSize = Math.max(0, Number((stats as any)?.size || 0));
      if (resolvedSize > MAX_SAFE_POST_MEDIA_BYTES) {
        throw new Error('This media file is too large to upload safely on a phone. Keep it under 120 MB.');
      }
    } catch (error: any) {
      if (String(error?.message || '').includes('too large')) {
        throw error;
      }
    }
    localPath = await maybeCompressVideoForUpload(localPath, type || mediaType);

    const uploadContentType =
      type && (type.startsWith('video/') || type.startsWith('image/'))
        ? type
        : 'application/octet-stream';

    mediaUrl = await uploadFileWithRecovery(filePath, localPath, {
      contentType: uploadContentType,
    });
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
