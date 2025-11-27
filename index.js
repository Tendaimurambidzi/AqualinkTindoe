/**
 * @format
 */
import 'react-native-gesture-handler';
// Ensure Reanimated's UI runtime is installed before any app code executes.
// This fixes "[runtime not ready]" errors from worklets-driven libraries.
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app component immediately for faster startup
AppRegistry.registerComponent(appName, () => App);

// TrackPlayer service removed (library uninstalled)

// Ensure an anonymous Firebase Auth session exists on startup (no UI)
// Run asynchronously without blocking app registration
setTimeout(() => {
  ensureAnon().catch(e => console.warn('Firebase init failed:', e));
}, 0);

async function ensureAnon() {
  try {
    // Lazy-load Firebase Auth so the app doesn't crash
    // if RNFB isn't installed/linked yet.
    let auth = null;
    try {
      auth = require('@react-native-firebase/auth').default;
    } catch (_) {
      auth = null;
    }
    if (auth) {
      const current = auth().currentUser;
      if (!current) {
        await auth().signInAnonymously();
      }
    }
  } catch (e) {
    console.warn('Firebase anonymous sign-in failed', e);
  }
}

// Background FCM handler (Android): receives data messages when app is killed/backgrounded
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    try {
      console.log('BG FCM:', remoteMessage?.data || {});
      // Keep light: avoid heavy work. Consider writing a small flag to AsyncStorage
      // or triggering a local notification here if needed.
    } catch {}
  });
} catch {}

// Global JS error handler to avoid hard crashes in release
try {
  const prev = (global.ErrorUtils && global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler()) || null;
  if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
    global.ErrorUtils.setGlobalHandler((err, isFatal) => {
      try { console.warn('GlobalError', err?.message || err); } catch {}
      if (typeof prev === 'function') {
        try { prev(err, isFatal); } catch {}
      }
    });
  }
} catch {}
