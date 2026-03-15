import firestore from '@react-native-firebase/firestore';
import { DriftLiveComment, DriftLiveDoc } from './driftLiveTypes';

const LIVES = 'driftLives';
const SHARED_DRIFT_EXPO_CHANNEL = 'drift_expo_shared';

export const createLiveSession = async ({
  hostId,
  hostName,
  hostUid,
  thumbnail = null,
}: {
  hostId: string;
  hostName: string;
  hostUid: number;
  thumbnail?: string | null;
}) => {
  const liveRef = firestore().collection(LIVES).doc();
  const liveId = String(liveRef.id);
  const channelName = SHARED_DRIFT_EXPO_CHANNEL;

  const payload: DriftLiveDoc = {
    hostId,
    hostName,
    channelName,
    hostUid,
    status: 'live',
    startedAt: firestore.FieldValue.serverTimestamp(),
    endedAt: null,
    thumbnail,
    viewerCount: 0,
    allowComments: true,
  };

  await liveRef.set(payload);

  return { liveId, channelName };
};

export const getLiveSession = async (liveId: string) => {
  const snap = await firestore().collection(LIVES).doc(liveId).get();
  if (!snap.exists) {
    throw new Error('Live session not found');
  }
  return { id: snap.id, ...(snap.data() as DriftLiveDoc) };
};

export const subscribeToLiveSession = (
  liveId: string,
  callback: (data: (DriftLiveDoc & { id: string }) | null) => void,
) => {
  return firestore()
    .collection(LIVES)
    .doc(liveId)
    .onSnapshot(doc => {
      if (!doc.exists) {
        callback(null);
        return;
      }
      callback({ id: doc.id, ...(doc.data() as DriftLiveDoc) });
    });
};

export const endLiveSession = async (liveId: string) => {
  await firestore().collection(LIVES).doc(liveId).update({
    status: 'ended',
    endedAt: firestore.FieldValue.serverTimestamp(),
  });
};

export const incrementViewerCount = async (liveId: string, delta: number) => {
  await firestore().collection(LIVES).doc(liveId).set(
    {
      viewerCount: firestore.FieldValue.increment(delta),
    },
    { merge: true },
  );
};

export const sendLiveComment = async ({
  liveId,
  userId,
  userName,
  text,
  avatar = null,
  replyToId = null,
  replyToUserName = null,
  replyToText = null,
  createdAtMs = Date.now(),
  clientCommentId = null,
}: {
  liveId: string;
  userId: string;
  userName: string;
  text: string;
  avatar?: string | null;
  replyToId?: string | null;
  replyToUserName?: string | null;
  replyToText?: string | null;
  createdAtMs?: number;
  clientCommentId?: string | null;
}) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  await firestore()
    .collection(LIVES)
    .doc(liveId)
    .collection('comments')
    .add({
      userId,
      userName,
      text: trimmed,
      avatar,
      replyToId,
      replyToUserName,
      replyToText,
      createdAtMs,
      clientCommentId,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const subscribeToLiveComments = (
  liveId: string,
  callback: (comments: DriftLiveComment[]) => void,
) => {
  return firestore()
    .collection(LIVES)
    .doc(liveId)
    .collection('comments')
    .orderBy('createdAtMs', 'asc')
    .limitToLast(100)
    .onSnapshot(snapshot => {
      const comments: DriftLiveComment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<DriftLiveComment, 'id'>),
      }));
      callback(comments);
    });
};
