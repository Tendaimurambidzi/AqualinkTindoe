import axios from 'axios';
import {
  AGORA_TOKEN_ENDPOINT,
  BACKEND_BASE_URL,
} from '../../liveConfig';

const tokenEndpoints = [
  AGORA_TOKEN_ENDPOINT,
  `${BACKEND_BASE_URL}/agora/rtc-token`,
  `${BACKEND_BASE_URL}/agora/token`,
].filter(Boolean);

export const fetchRtcToken = async ({
  channelName,
  uid,
  role,
}: {
  channelName: string;
  uid: number;
  role: 'host' | 'audience';
}) => {
  let lastError: unknown = null;
  for (const endpoint of tokenEndpoints) {
    try {
      const res = await axios.post(endpoint, {
        channelName,
        channel: channelName,
        uid,
        role,
      });
      const token = res.data?.token;
      if (token) return String(token);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Token not returned by backend');
};
