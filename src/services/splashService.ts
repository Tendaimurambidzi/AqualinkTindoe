// src/services/splashService.ts
// React Native version using @react-native-firebase packages
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { offlineQueue } from './offlineQueue';

/**
 * Result type for splash operations
 */
export interface SplashResult {
  splashed: boolean;
}

/**
 * Fetch the actual username from a user's profile
 */
async function fetchUserUsername(userId: string): Promise<string> {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData?.username || userData?.displayName || 'Unknown User';
    }
  } catch (error) {
    console.error('Error fetching user username:', error);
  }
  return 'Unknown User';
}

/**
 * Ensure the current user has splashed a wave, creating the Firestore doc if needed.
 * Server Cloud Functions will increment counts when the doc is created.
 */
export async function ensureSplash(waveId: string): Promise<SplashResult> {
  const user = auth().currentUser;
  if (!user) throw new Error('Must be signed in to splash.');

  // Fetch the actual username from the user's profile
  const actualUsername = await fetchUserUsername(user.uid);

  await offlineQueue.addAction('addSplash', {
    waveId,
    userId: user.uid,
    userName: actualUsername,
    userPhoto: user.photoURL || null,
  });

  return { splashed: true };
}

/**
 * Remove a user's splash from a wave.
 */
export async function removeSplash(waveId: string): Promise<{ removed: boolean }> {
  const user = auth().currentUser;
  if (!user) throw new Error('Must be signed in to remove splash.');

  await offlineQueue.addAction('removeSplash', {
    waveId,
    userId: user.uid,
  });

  return { removed: true };
}
