// src/services/uploadPost.ts
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface SimpleMedia {
  uri: string;
  fileName?: string | null;
  type?: string | null; // e.g. "image/jpeg" or "video/mp4"
}

interface UploadPostParams {
  media: SimpleMedia;
  caption: string;
}

/**
 * uploadPost
 * - Takes media from image/video picker
 * - Uploads it to Firebase Storage
 * - Creates a Firestore document in "posts"
 * - Returns { id, mediaUrl }
 */
export async function uploadPost({ media, caption }: UploadPostParams) {
  const a = auth();
  const uid = a.currentUser?.uid;

  if (!uid) {
    throw new Error('Please sign in to upload a post.');
  }

  if (!media?.uri) {
    throw new Error('No media URI provided.');
  }

  // ----- 1. Build a safe filename (based on your onPostWave logic) -----
  const nameGuessRaw = media.fileName || 'post';
  const type = (media.type || '').toLowerCase();

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

  // ----- 2. Normalize local path (same idea as in onPostWave) -----
  let localPath = String(media.uri);

  try {
    localPath = decodeURI(localPath);
  } catch {}

  // Remove file:// on Android
  if (Platform.OS === 'android' && localPath.startsWith('file://')) {
    localPath = localPath.replace('file://', '');
  }

  // Handle content:// by copying to cache (from your original code)
  if (Platform.OS === 'android' && /^content:/.test(localPath)) {
    const safeExt = (ext || (type.startsWith('video/') ? 'mp4' : 'dat')).replace(
      /[^A-Za-z0-9]/g,
      '',
    );
    const copyDest = `${RNFS.CachesDirectoryPath}/post_${Date.now()}.${safeExt}`;
    await RNFS.copyFile(String(media.uri), copyDest);
    localPath = copyDest;
  }

  if (!localPath) {
    throw new Error('Could not resolve a local path for the selected media.');
  }

  // ----- 3. Choose a contentType (like your uploadContentType) -----
  const uploadContentType =
    type && (type.startsWith('video/') || type.startsWith('image/'))
      ? type
      : 'application/octet-stream';

  // ----- 4. Upload to Storage -----
  await storage().ref(filePath).putFile(localPath, {
    contentType: uploadContentType,
  });

  const mediaUrl = await storage().ref(filePath).getDownloadURL();

  // ----- 5. Create Firestore document (Facebook-style "posts") -----
  const docRef = await firestore().collection('posts').add({
    ownerUid: uid,
    authorId: uid,
    authorName: a.currentUser?.displayName || null,
    caption,
    mediaUrl,
    mediaPath: filePath,
    createdAt: firestore.FieldValue.serverTimestamp(),
    // You can add more fields: likesCount, commentsCount, etc.
  });

  return { id: docRef.id, mediaUrl };
}
