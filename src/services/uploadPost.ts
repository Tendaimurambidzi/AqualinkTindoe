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
  media?: SimpleMedia | null;
  caption: string;
}

/**
 * uploadPost
 * - Takes media from image/video picker (optional)
 * - Uploads it to Firebase Storage only if present
 * - Creates a Firestore document in "posts"
 * - Returns { id, mediaUrl }
 */
export async function uploadPost({ media, caption }: UploadPostParams) {
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
      const safeExt = (
        ext || (type.startsWith('video/') ? 'mp4' : 'dat')
      ).replace(/[^A-Za-z0-9]/g, '');
      const copyDest = `${RNFS.CachesDirectoryPath}/post_${Date.now()}.${safeExt}`;
      await RNFS.copyFile(String(mediaUri), copyDest);
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

  const docRef = await firestore().collection('posts').add({
    ownerUid: uid,
    authorId: uid,
    authorName: a.currentUser?.displayName || null,
    caption,
    mediaUrl,
    mediaPath,
    mediaType,
    createdAt: firestore.FieldValue.serverTimestamp(),
    // You can add more fields: likesCount, commentsCount, etc.
  });

  return { id: docRef.id, mediaUrl };
}
