import { getAgoraEngine } from './driftAgora';

let streamId: number | null = null;

export const createCommentDataStream = () => {
  const rtc = getAgoraEngine();

  if (streamId !== null) {
    return streamId;
  }

  streamId = rtc.createDataStream({
    ordered: true,
    syncWithAudio: false,
  });

  return streamId;
};

export const sendOverlayComment = (payload: {
  userId: string;
  userName: string;
  text: string;
}) => {
  const rtc = getAgoraEngine();
  const id = createCommentDataStream();
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const result = rtc.sendStreamMessage(id, encoded, encoded.length);

  if (result < 0) {
    throw new Error(`sendStreamMessage failed: ${result}`);
  }
};
