// src/services/splashService.ts
// React Native version using @react-native-firebase packages
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type SplashResult = { splashed: boolean };

/**
 * Ensure the current user has splashed a wave, creating the Firestore doc if needed.
 * Server Cloud Functions will increment counts when the doc is created.
 */
export async function ensureSplash(waveId: string): Promise<SplashResult> {
  const user = auth().currentUser;
  if (!user) throw new Error('Must be signed in to splash.');

  const splashRef = firestore()
    .collection('waves')
    .doc(waveId)
    .collection('splashes')
    .doc(user.uid);

  const snap = await splashRef.get();
  const exists =
    (snap as any)?.exists === true || (typeof (snap as any)?.exists === 'function' && (snap as any).exists());
  if (exists) {
    return { splashed: true };
  }

  await splashRef.set(
    {
      userUid: user.uid, // matches Firestore rules
      waveId,
      userName: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || null,
      createdAt: firestore.FieldValue?.serverTimestamp
        ? firestore.FieldValue.serverTimestamp()
        : new Date(),
    },
    { merge: true }
  );
  return { splashed: true };
}

/**
 * Remove a user's splash from a wave.
 */
export async function removeSplash(waveId: string): Promise<{ removed: boolean }> {
  const user = auth().currentUser;
  if (!user) throw new Error('Must be signed in to remove splash.');

  const splashRef = firestore()
    .collection('waves')
    .doc(waveId)
    .collection('splashes')
    .doc(user.uid);

  await splashRef.delete();
  return { removed: true };
}
