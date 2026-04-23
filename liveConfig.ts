// Simple runtime config for live streaming.
// Note: Do NOT ship App Certificate in production apps. Keep tokens server-issued.

import { Platform } from 'react-native';

// Optional local overrides from liveConfig.local.ts (ignored by git).
let localSecrets: Record<string, any> = {};
try {
  localSecrets = require('./liveConfig.local');
} catch {}

// Provided App ID
export const AGORA_APP_ID = '7381413158e74dfbaae26cbc727b4d18';

// Provided, pre-generated token for a local test channel (publisher role).
// Tokens expire; for production use a token server.
export const AGORA_STATIC_TOKEN = '';

// Default shared live channel used by the current invite-badge flow.
export const AGORA_CHANNEL_NAME = 'SplashlineDrift';

// Optional: App Certificate (never embed in production apps; used server-side for token generation)
export const AGORA_APP_CERTIFICATE = '';

// Runtime backend host depends on the emulator/simulator
const BACKEND_HOST = Platform.select({
  android: String(localSecrets?.BACKEND_HOST_ANDROID || '192.168.1.103'),
  ios: String(
    localSecrets?.BACKEND_HOST_IOS ||
      localSecrets?.BACKEND_HOST_ANDROID ||
      '192.168.1.103',
  ),
  default: 'localhost',
});

// Local dev token endpoint. Use 10.0.2.2 for Android emulator; localhost for iOS simulator.
// Example:
//   Android emulator: `http://10.0.2.2:4000/rtcToken`
//   iOS simulator:    `http://localhost:4000/rtcToken`
export const BACKEND_BASE_URL = `http://${BACKEND_HOST}:4000`;
export const AGORA_TOKEN_ENDPOINT = `${BACKEND_BASE_URL}/agora/token`;
// Local dev backend endpoints (adjust per platform: Android emulator uses 10.0.2.2)
export const START_LIVE_ENDPOINT = `${BACKEND_BASE_URL}/live/start`;
export const END_LIVE_ENDPOINT = `${BACKEND_BASE_URL}/live/end`;
export const LIVE_RECENT_ENDPOINT = `${BACKEND_BASE_URL}/live/recent`;
// Toggle backend registration for chartered / private drifts.
// Set to true once the backend is running and can respond.
export const ENABLE_CHARTERED_BACKEND = true;

// xAI key for in-app AI responses. Set in liveConfig.local.ts (gitignored).
// export const XAI_API_KEY = localSecrets?.XAI_API_KEY || '';
// If not set, AI caption/echo features will be disabled.
export const XAI_API_KEY = localSecrets?.XAI_API_KEY || '';
export const XAI_MODEL = localSecrets?.XAI_MODEL || 'grok-3-mini';

// Internet search key for VIBE HUNT web results (Brave Search API).
export const VIBE_HUNT_SEARCH_API_KEY = String(
  localSecrets?.VIBE_HUNT_SEARCH_API_KEY || '',
);
