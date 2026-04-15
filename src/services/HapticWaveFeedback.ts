import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppState, Vibration } from 'react-native';

let appIsActive = true;
let lastVibrateTime = 0;
const VIBRATE_DEBOUNCE_MS = 200;

const safeCancelVibration = () => {
  try {
    Vibration.cancel();
  } catch (error) {
    console.warn('Vibration cancel failed:', error);
  }
};

// AppState listener for background handling
const setupAppStateListener = () => {
  const subscription = AppState.addEventListener('change', nextAppState => {
    appIsActive = nextAppState === 'active';
    if (!appIsActive) {
      safeCancelVibration();
    }
  });
  return () => subscription?.remove();
};

export type HapticPattern = 'wave' | 'splash' | 'fish' | 'storm' | 'dolphin' | 'gentle' | 'strong';

class HapticWaveFeedback {
  private static safeVibrate(pattern: number | number[]) {
    if (!appIsActive) return;
    const now = Date.now();
    if (now - lastVibrateTime < VIBRATE_DEBOUNCE_MS) return;
    lastVibrateTime = now;
    Vibration.vibrate(pattern, appIsActive);
  }

  static wave() {
    this.safeVibrate([0, 30, 50, 30, 50, 30]);
  }

  static splash() {
    this.safeVibrate([0, 20, 10, 40]);
  }

  static fish() {
    this.safeVibrate([0, 15, 15, 15, 15, 15, 15, 15]);
  }

  static storm() {
    this.safeVibrate([0, 100, 50, 150, 50, 100, 50, 200]);
  }

  static dolphin() {
    this.safeVibrate([0, 40, 40, 40, 40, 80, 40, 40]);
  }

  static gentle() {
    this.safeVibrate(20);
  }

  static strong() {
    this.safeVibrate(50);
  }

  static custom(pattern: number[]) {
    this.safeVibrate(pattern);
  }

  static success() {
    this.safeVibrate([0, 30, 20, 30, 20, 60]);
  }

  static error() {
    this.safeVibrate([0, 100, 50, 100]);
  }

  static notification() {
    this.safeVibrate([0, 40, 40, 40, 40, 40]);
  }

  static levelUp() {
    this.safeVibrate([0, 50, 30, 50, 30, 50, 30, 100]);
  }

  static crewJoin() {
    this.safeVibrate([0, 30, 20, 30, 20, 30, 20, 80]);
  }

  static scroll() {
    this.safeVibrate(10);
  }

  static longPress() {
    this.safeVibrate([0, 50]);
  }

  static cancel() {
    safeCancelVibration();
  }
}

// Global setup (call once in App.tsx)
export const initHapticSafety = () => {
  setupAppStateListener();
};

// Safe hook
export const useHapticFeedback = () => {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setIsActive(nextAppState === 'active');
      if (nextAppState !== 'active') {
        safeCancelVibration();
      }
    });

    return () => subscription?.remove();
  }, []);

  const safeVibrate = useCallback((pattern: number | number[]) => {
    if (!isActive) return;
    const now = Date.now();
    if (now - lastVibrateTime < VIBRATE_DEBOUNCE_MS) return;
    lastVibrateTime = now;
    Vibration.vibrate(pattern, false);
  }, [isActive]);

  return {
    wave: () => safeVibrate([0, 30, 50, 30, 50, 30]),
    splash: () => safeVibrate([0, 20, 10, 40]),
    fish: () => safeVibrate([0, 15, 15, 15, 15, 15, 15, 15]),
    storm: () => safeVibrate([0, 100, 50, 150, 50, 100, 50, 200]),
    dolphin: () => safeVibrate([0, 40, 40, 40, 40, 80, 40, 40]),
    gentle: () => safeVibrate(20),
    strong: () => safeVibrate(50),
    success: () => safeVibrate([0, 30, 20, 30, 20, 60]),
    error: () => safeVibrate([0, 100, 50, 100]),
    notification: () => safeVibrate([0, 40, 40, 40, 40, 40]),
    levelUp: () => safeVibrate([0, 50, 30, 50, 30, 50, 30, 100]),
    crewJoin: () => safeVibrate([0, 30, 20, 30, 20, 30, 20, 80]),
    scroll: () => safeVibrate(10),
    longPress: () => safeVibrate([0, 50]),
    custom: (pattern: number[]) => safeVibrate(pattern),
    cancel: () => safeCancelVibration(),
  };
};

export default HapticWaveFeedback;

