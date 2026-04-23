/**
 * Private groups: posts live under `private_groups/{groupId}/waves` only,
 * not in the public `waves` collection.
 */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { Platform } from 'react-native';

export type PrivateGroupRow = {
  id: string;
  name: string;
  role: 'admin' | 'member';
  joinedAt?: unknown;
};

function randomInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/** Live list of groups the signed-in user belongs to (from `users/{uid}/privateGroups`). */
export function subscribeMyPrivateGroupSummaries(
  uid: string,
  onNext: (rows: PrivateGroupRow[]) => void,
  onError?: (e: Error) => void,
): () => void {
  return firestore()
    .collection('users')
    .doc(uid)
    .collection('privateGroups')
    .onSnapshot(
      snap => {
        const rows = snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: String(data?.name || 'Group'),
            role: (data?.role as 'admin' | 'member') || 'member',
            joinedAt: data?.joinedAt ?? null,
          };
        });
        rows.sort((a, b) => {
          const ta = a.joinedAt?.toMillis?.() ?? 0;
          const tb = b.joinedAt?.toMillis?.() ?? 0;
          return tb - ta;
        });
        onNext(rows);
      },
      err => onError?.(err as Error),
    );
}

/** Create a group, add caller as admin, and mirror membership on `users/{uid}/privateGroups`. */
export async function createPrivateGroup(name: string): Promise<{
  groupId: string;
  inviteCode: string;
}> {
  const u = auth().currentUser;
  if (!u?.uid) {
    throw new Error('Sign in to create a group.');
  }
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Name your group.');
  }
  const groupRef = firestore().collection('private_groups').doc();
  const gid = groupRef.id;
  const inviteCode = randomInviteCode();
  const batch = firestore().batch();
  batch.set(groupRef, {
    name: trimmed,
    createdBy: u.uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
    inviteCode,
  });
  batch.set(groupRef.collection('members').doc(u.uid), {
    role: 'admin',
    joinedAt: firestore.FieldValue.serverTimestamp(),
  });
  batch.set(
    firestore()
      .collection('users')
      .doc(u.uid)
      .collection('privateGroups')
      .doc(gid),
    {
      name: trimmed,
      role: 'admin',
      joinedAt: firestore.FieldValue.serverTimestamp(),
    },
  );
  await batch.commit();
  return { groupId: gid, inviteCode };
}

/** Join with group id + invite code (writes member + user index). */
export async function joinPrivateGroupWithInvite(
  groupId: string,
  inviteCode: string,
): Promise<void> {
  const u = auth().currentUser;
  if (!u?.uid) {
    throw new Error('Sign in to join.');
  }
  const gid = groupId.trim();
  const code = inviteCode.trim().toUpperCase();
  if (!gid || !code) {
    throw new Error('Enter group id and invite code.');
  }
  const gref = firestore().collection('private_groups').doc(gid);
  const snap = await gref.get();
  if (!snap.exists) {
    throw new Error('Group not found.');
  }
  const data = snap.data() as any;
  if (String(data?.inviteCode || '').toUpperCase() !== code) {
    throw new Error('Invite code does not match.');
  }
  const memberRef = gref.collection('members').doc(u.uid);
  const existing = await memberRef.get();
  if (existing.exists) {
    throw new Error('You are already in this group.');
  }
  const batch = firestore().batch();
  batch.set(memberRef, {
    role: 'member',
    joinedAt: firestore.FieldValue.serverTimestamp(),
    joinInviteCode: code,
  });
  batch.set(
    firestore()
      .collection('users')
      .doc(u.uid)
      .collection('privateGroups')
      .doc(gid),
    {
      name: String(data?.name || 'Group'),
      role: 'member',
      joinedAt: firestore.FieldValue.serverTimestamp(),
    },
  );
  await batch.commit();
}

export async function fetchPrivateGroupMeta(groupId: string): Promise<{
  name: string;
  inviteCode: string;
  createdBy: string;
} | null> {
  const snap = await firestore()
    .collection('private_groups')
    .doc(groupId.trim())
    .get();
  if (!snap.exists) {
    return null;
  }
  const d = snap.data() as any;
  return {
    name: String(d?.name || 'Group'),
    inviteCode: String(d?.inviteCode || ''),
    createdBy: String(d?.createdBy || ''),
  };
}

/** Posts for one group (newest first). */
export function subscribePrivateGroupWaves(
  groupId: string,
  onNext: (waves: Array<{ id: string; [key: string]: unknown }>) => void,
  onError?: (e: Error) => void,
): () => void {
  return firestore()
    .collection('private_groups')
    .doc(groupId)
    .collection('waves')
    .orderBy('createdAt', 'desc')
    .limit(80)
    .onSnapshot(
      q => {
        onNext(q.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      err => onError?.(err as Error),
    );
}

/** Add a document to the group feed (e.g. cast/repost from main feed). */
export async function addWaveToPrivateGroupFeed(
  groupId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await firestore()
    .collection('private_groups')
    .doc(groupId)
    .collection('waves')
    .add(payload);
}

export async function uploadNewGroupWaveMedia(params: {
  groupId: string;
  localUri: string;
  mimeType?: string | null;
  caption: string;
  authorName?: string | null;
}): Promise<string> {
  const u = auth().currentUser;
  if (!u?.uid) {
    throw new Error('Sign in to post.');
  }
  const { groupId, caption } = params;
  const mime = String(params.mimeType || '').toLowerCase();
  let localPath = String(params.localUri || '').trim();
  if (!localPath) {
    throw new Error('Missing media.');
  }
  try {
    localPath = decodeURI(localPath);
  } catch {}
  if (Platform.OS === 'android' && localPath.startsWith('file://')) {
    localPath = localPath.replace('file://', '');
  }
  if (Platform.OS === 'android' && /^content:/.test(localPath)) {
    const RNFS = require('react-native-fs');
    const ext = mime.startsWith('video/') ? 'mp4' : 'jpg';
    const copyDest = `${RNFS.CachesDirectoryPath}/grp_${Date.now()}.${ext}`;
    await RNFS.copyFile(String(params.localUri), copyDest);
    localPath = copyDest;
  }
  const ext = mime.startsWith('video/')
    ? 'mp4'
    : mime.startsWith('image/')
      ? 'jpg'
      : 'dat';
  const filePath = `posts/${u.uid}/private_group_${groupId}_${Date.now()}.${ext}`;
  const contentType =
    mime && (mime.startsWith('video/') || mime.startsWith('image/'))
      ? mime
      : 'application/octet-stream';
  await storage().ref(filePath).putFile(localPath, { contentType });
  const mediaUrl = await storage().ref(filePath).getDownloadURL();
  const docRef = await firestore()
    .collection('private_groups')
    .doc(groupId)
    .collection('waves')
    .add({
      ownerUid: u.uid,
      authorId: u.uid,
      authorName: params.authorName || u.displayName || null,
      text: caption,
      captionText: caption,
      mediaUrl,
      mediaPath: filePath,
      mediaType: contentType,
      audience: 'private_group',
      groupId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      muxStatus: 'ready',
      isPublic: false,
    });
  return docRef.id;
}
