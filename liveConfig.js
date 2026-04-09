"use strict";
// Simple runtime config for live streaming.
// Note: Do NOT ship App Certificate in production apps. Keep tokens server-issued.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIBE_HUNT_SEARCH_API_KEY = exports.XAI_MODEL = exports.XAI_API_KEY = exports.ENABLE_CHARTERED_BACKEND = exports.LIVE_RECENT_ENDPOINT = exports.END_LIVE_ENDPOINT = exports.START_LIVE_ENDPOINT = exports.AGORA_TOKEN_ENDPOINT = exports.BACKEND_BASE_URL = exports.AGORA_APP_CERTIFICATE = exports.AGORA_CHANNEL_NAME = exports.AGORA_STATIC_TOKEN = exports.AGORA_APP_ID = void 0;
var react_native_1 = require("react-native");
// Optional local overrides from liveConfig.local.ts (ignored by git).
var localSecrets = {};
try {
    localSecrets = require('./liveConfig.local');
}
catch (_a) { }
// Provided App ID
exports.AGORA_APP_ID = '7381413158e74dfbaae26cbc727b4d18';
// Provided, pre-generated token for a local test channel (publisher role).
// Tokens expire; for production use a token server.
exports.AGORA_STATIC_TOKEN = '';
// Default shared live channel used by the current invite-badge flow.
exports.AGORA_CHANNEL_NAME = 'SplashlineDrift';
// Optional: App Certificate (never embed in production apps; used server-side for token generation)
exports.AGORA_APP_CERTIFICATE = '';
// Runtime backend host depends on the emulator/simulator
var BACKEND_HOST = react_native_1.Platform.select({
    android: String((localSecrets === null || localSecrets === void 0 ? void 0 : localSecrets.BACKEND_HOST_ANDROID) || '192.168.1.103'),
    ios: String((localSecrets === null || localSecrets === void 0 ? void 0 : localSecrets.BACKEND_HOST_IOS) || (localSecrets === null || localSecrets === void 0 ? void 0 : localSecrets.BACKEND_HOST_ANDROID) || '192.168.1.103'),
    default: 'localhost',
});
// Local dev token endpoint. Use 10.0.2.2 for Android emulator; localhost for iOS simulator.
// Example:
//   Android emulator: `http://10.0.2.2:4000/rtcToken`
//   iOS simulator:    `http://localhost:4000/rtcToken`
exports.BACKEND_BASE_URL = "http://".concat(BACKEND_HOST, ":4000");
exports.AGORA_TOKEN_ENDPOINT = "".concat(exports.BACKEND_BASE_URL, "/agora/token");
// Local dev backend endpoints (adjust per platform: Android emulator uses 10.0.2.2)
exports.START_LIVE_ENDPOINT = "".concat(exports.BACKEND_BASE_URL, "/live/start");
exports.END_LIVE_ENDPOINT = "".concat(exports.BACKEND_BASE_URL, "/live/end");
exports.LIVE_RECENT_ENDPOINT = "".concat(exports.BACKEND_BASE_URL, "/live/recent");
// Toggle backend registration for chartered / private drifts.
// Set to true once the backend is running and can respond.
exports.ENABLE_CHARTERED_BACKEND = true;
// xAI key for in-app AI responses.
exports.XAI_API_KEY = String((localSecrets === null || localSecrets === void 0 ? void 0 : localSecrets.XAI_API_KEY) || '');
exports.XAI_MODEL = 'grok-3-mini';
// Internet search key for VIBE HUNT web results (Brave Search API).
exports.VIBE_HUNT_SEARCH_API_KEY = String((localSecrets === null || localSecrets === void 0 ? void 0 : localSecrets.VIBE_HUNT_SEARCH_API_KEY) || '');
