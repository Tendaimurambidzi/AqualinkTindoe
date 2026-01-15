// src/services/crewService.ts
// Service for crew (follow/unfollow) operations using ocean-based terms
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

export type CrewMember = {
  uid: string;
  name: string;
  photo: string | null;
  joinedAt: Date;
};

/**
 * Join a user's crew (follow them)
 */
export async function joinCrew(targetUid: string): Promise<{ success: boolean }> {
  const user = auth().currentUser;
  if (!user) throw new Error('Must be signed in to join a crew.');
  if (user.uid === targetUid) throw new Error('Cannot join your own crew.');

  console.log(`[DEBUG] crewService.joinCrew: Calling Firebase function for ${user.uid} -> ${targetUid}`);
  
  const joinCrewFn = functions().httpsCallable('joinCrew');
  const result = await joinCrewFn({ targetUid });
  
  console.log(`[DEBUG] crewService.joinCrew: Firebase function returned:`, result?.data);
  
  if (result?.data?.success) {
    return { success: true };
  } else {
    throw new Error(result?.data?.message || 'Failed to join crew');
  }
}

/**
 * Leave a user's crew (unfollow them)
 */
export async function leaveCrew(targetUid: string): Promise<{ success: boolean }> {
  const user = auth().currentUser;
  if (!user) throw new Error('Must be signed in to leave a crew.');

  const crewRef = firestore()
    .collection('users')
    .doc(targetUid)
    .collection('crew')
    .doc(user.uid);

  await crewRef.delete();

  // Also remove from current user's "following" list
  const followingRef = firestore()
    .collection('users')
    .doc(user.uid)
    .collection('following')
    .doc(targetUid);

  await followingRef.delete();

  return { success: true };
}

/**
 * Check if current user is in a user's crew
 */
export async function isInCrew(targetUid: string): Promise<boolean> {
  const user = auth().currentUser;
  if (!user) return false;

  const crewRef = firestore()
    .collection('users')
    .doc(targetUid)
    .collection('crew')
    .doc(user.uid);

  const doc = await crewRef.get();
  return !!(doc as any)?.exists;
}

/**
 * Get a user's crew (followers)
 */
export async function getCrew(targetUid: string, limit: number = 50): Promise<CrewMember[]> {
  const crewSnapshot = await firestore()
    .collection('users')
    .doc(targetUid)
    .collection('crew')
    .orderBy('joinedAt', 'desc')
    .limit(limit)
    .get();

  return crewSnapshot.docs.map(doc => ({
    uid: doc.id,
    name: doc.data().name || 'Anonymous',
    photo: doc.data().photo || null,
    joinedAt: doc.data().joinedAt?.toDate() || new Date(),
  }));
}

/**
 * Get users that the current user is boarding (following)
 */
export async function getBoarding(limit: number = 50): Promise<string[]> {
  const user = auth().currentUser;
  if (!user) return [];

  const followingSnapshot = await firestore()
    .collection('users')
    .doc(user.uid)
    .collection('following')
    .orderBy('joinedAt', 'desc')
    .limit(limit)
    .get();

  return boardingSnapshot.docs.map(doc => doc.id);
}

/**
 * Get crew count for a user
 */
export async function getCrewCount(targetUid: string): Promise<number> {
  const crewSnapshot = await firestore()
    .collection('users')
    .doc(targetUid)
    .collection('crew')
    .get();

  return crewSnapshot.size;
}

/**
 * Get boarding count for a user (how many they're following)
 */
export async function getBoardingCount(targetUid: string): Promise<number> {
  const followingSnapshot = await firestore()
    .collection('users')
    .doc(targetUid)
    .collection('following')
    .get();

  return boardingSnapshot.size;
}
