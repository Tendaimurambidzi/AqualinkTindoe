// Lightweight client examples without hard imports, so your app builds
// even if Firestore/Storage SDKs are not installed yet.
// Pass the SDK instances from '@react-native-firebase/*' when you have them.

/**
 * Example: Upload a local file to Firebase Storage using a user-scoped path.
 *
 * Usage (after installing @react-native-firebase/storage and auth):
 *   import storage from '@react-native-firebase/storage';
 *   import auth from '@react-native-firebase/auth';
 *   await uploadWave(storage(), auth(), localPath);
 */
export async function uploadWave(
  storage: { ref: (p: string) => any },
  auth: { currentUser?: { uid: string } | null },
  localFilePath: string,
) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('No user available for upload');
  const filePath = `posts/${userId}/${Date.now()}_wave.mp4`;
  await storage.ref(filePath).putFile(localFilePath);
  return filePath;
}

/**
 * Example: Create a Firestore document for a Wave.
 *
 * Usage (after installing @react-native-firebase/firestore and auth):
 *   import firestore from '@react-native-firebase/firestore';
 *   import auth from '@react-native-firebase/auth';
 *   await createWaveDoc(firestore(), auth(), mediaPath, 'First wave 🌊');
 */
export async function createWaveDoc(
  firestore: {
    collection: (name: string) => { add: (data: any) => Promise<any> };
    FieldValue?: { serverTimestamp: () => any };
  },
  auth: { currentUser?: { uid: string } | null },
  mediaPath: string,
  text: string,
) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('No user available for Firestore write');
  // Try to use provided FieldValue if present; otherwise fall back to server-side timestamp string
  const createdAt = (firestore as any).FieldValue?.serverTimestamp
    ? (firestore as any).FieldValue.serverTimestamp()
    : new Date();
  await firestore.collection('waves').add({
    authorId: userId,
    mediaPath,
    text,
    createdAt,
  });
}

