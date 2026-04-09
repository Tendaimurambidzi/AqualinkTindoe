import React from 'react';
import { Vibration } from 'react-native';

export type HapticPattern = 'wave' | 'splash' | 'fish' | 'storm' | 'dolphin' | 'gentle' | 'strong';

class HapticWaveFeedback {
  static wave() {
    // Gentle rolling wave pattern
    Vibration.vibrate([0, 30, 50, 30, 50, 30]);
  }

  static splash() {
    // Quick burst for splash interaction
    Vibration.vibrate([0, 20, 10, 40]);
  }

  static fish() {
    // Rapid taps like fish swimming
    Vibration.vibrate([0, 15, 15, 15, 15, 15, 15, 15]);
  }

  static storm() {
    // Intense rumbling pattern
    Vibration.vibrate([0, 100, 50, 150, 50, 100, 50, 200]);
  }

  static dolphin() {
    // Playful bouncing pattern
    Vibration.vibrate([0, 40, 40, 40, 40, 80, 40, 40]);
  }

  static gentle() {
    // Soft single pulse
    Vibration.vibrate(20);
  }

  static strong() {
    // Strong single pulse
    Vibration.vibrate(50);
  }

  static custom(pattern: number[]) {
    Vibration.vibrate(pattern);
  }

  static success() {
    // Positive feedback pattern
    Vibration.vibrate([0, 30, 20, 30, 20, 60]);
  }

  static error() {
    // Negative feedback pattern
    Vibration.vibrate([0, 100, 50, 100]);
  }

  static notification() {
    // Attention-getting pattern
    Vibration.vibrate([0, 40, 40, 40, 40, 40]);
  }

  static levelUp() {
    // Celebration pattern
    Vibration.vibrate([0, 50, 30, 50, 30, 50, 30, 100]);
  }

  static crewJoin() {
    // Welcome pattern
    Vibration.vibrate([0, 30, 20, 30, 20, 30, 20, 80]);
  }

  static scroll() {
    // Subtle feedback for scrolling through vibes
    Vibration.vibrate(10);
  }

  static longPress() {
    // Feedback for long press actions
    Vibration.vibrate([0, 50]);
  }

  static cancel() {
    Vibration.cancel();
  }
}

export default HapticWaveFeedback;

// React Hook for easy usage
export const useHapticFeedback = () => {
  return {
    wave: () => HapticWaveFeedback.wave(),
    splash: () => HapticWaveFeedback.splash(),
    fish: () => HapticWaveFeedback.fish(),
    storm: () => HapticWaveFeedback.storm(),
    dolphin: () => HapticWaveFeedback.dolphin(),
    gentle: () => HapticWaveFeedback.gentle(),
    strong: () => HapticWaveFeedback.strong(),
    success: () => HapticWaveFeedback.success(),
    error: () => HapticWaveFeedback.error(),
    notification: () => HapticWaveFeedback.notification(),
    levelUp: () => HapticWaveFeedback.levelUp(),
    crewJoin: () => HapticWaveFeedback.crewJoin(),
    scroll: () => HapticWaveFeedback.scroll(),
    longPress: () => HapticWaveFeedback.longPress(),
    custom: (pattern: number[]) => HapticWaveFeedback.custom(pattern),
    cancel: () => HapticWaveFeedback.cancel(),
  };
};
