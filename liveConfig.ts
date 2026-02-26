// Simple runtime config for live streaming.
// Note: Do NOT ship App Certificate in production apps. Keep tokens server-issued.

import { Platform } from 'react-native';

// Provided App ID
export const AGORA_APP_ID = '02c4691ff2124a5997025c736f9d6ccf';

// Provided, pre-generated token for a local test channel (publisher role).
// Tokens expire; for production use a token server.
export const AGORA_STATIC_TOKEN = '007eJxTYLjA8HTaraUnPPf+XKEe/+KGbpfaigOdZdG9FpPzm/4f3r5LgcHAKNnEzNIwLc3I0Mgk0dTS0tzAyDTZ3NgszTLFLDk57de/vxkNgYwM7dfvMzMyQCCIz8YQkpmXkp/KwAAAs6Mk9Q==';

// Default channel name to join when going live (empty so hosts must pick their own)
export const AGORA_CHANNEL_NAME = '';

// Optional: App Certificate (never embed in production apps; used server-side for token generation)
export const AGORA_APP_CERTIFICATE = '1a85bc3d65704dc7b49d259c40d0c58f';

// Runtime backend host depends on the emulator/simulator
const BACKEND_HOST = Platform.select({
  android: '10.2.25.213',  // Updated to user's actual local IP for physical device
  ios: '10.2.25.213',      // Updated for iOS devices
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

// Optional local overrides from liveConfig.local.ts (ignored by git).
let localSecrets: Record<string, any> = {};
try {
  localSecrets = require('./liveConfig.local');
} catch {}

// xAI key for in-app AI responses.
export const XAI_API_KEY = String(localSecrets?.XAI_API_KEY || '');
export const XAI_MODEL = 'grok-3-mini';

// Internet search key for VIBE HUNT web results (Brave Search API).
export const VIBE_HUNT_SEARCH_API_KEY = String(localSecrets?.VIBE_HUNT_SEARCH_API_KEY || '');
