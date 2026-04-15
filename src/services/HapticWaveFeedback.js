"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHapticFeedback = void 0;
var react_native_1 = require("react-native");
var safeCancelVibration = function () {
    try {
        react_native_1.Vibration.cancel();
    }
    catch (error) {
        console.warn('Vibration cancel failed:', error);
    }
};
var HapticWaveFeedback = /** @class */ (function () {
    function HapticWaveFeedback() {
    }
    HapticWaveFeedback.wave = function () {
        // Gentle rolling wave pattern
        react_native_1.Vibration.vibrate([0, 30, 50, 30, 50, 30]);
    };
    HapticWaveFeedback.splash = function () {
        // Quick burst for splash interaction
        react_native_1.Vibration.vibrate([0, 20, 10, 40]);
    };
    HapticWaveFeedback.fish = function () {
        // Rapid taps like fish swimming
        react_native_1.Vibration.vibrate([0, 15, 15, 15, 15, 15, 15, 15]);
    };
    HapticWaveFeedback.storm = function () {
        // Intense rumbling pattern
        react_native_1.Vibration.vibrate([0, 100, 50, 150, 50, 100, 50, 200]);
    };
    HapticWaveFeedback.dolphin = function () {
        // Playful bouncing pattern
        react_native_1.Vibration.vibrate([0, 40, 40, 40, 40, 80, 40, 40]);
    };
    HapticWaveFeedback.gentle = function () {
        // Soft single pulse
        react_native_1.Vibration.vibrate(20);
    };
    HapticWaveFeedback.strong = function () {
        // Strong single pulse
        react_native_1.Vibration.vibrate(50);
    };
    HapticWaveFeedback.custom = function (pattern) {
        react_native_1.Vibration.vibrate(pattern);
    };
    HapticWaveFeedback.success = function () {
        // Positive feedback pattern
        react_native_1.Vibration.vibrate([0, 30, 20, 30, 20, 60]);
    };
    HapticWaveFeedback.error = function () {
        // Negative feedback pattern
        react_native_1.Vibration.vibrate([0, 100, 50, 100]);
    };
    HapticWaveFeedback.notification = function () {
        // Attention-getting pattern
        react_native_1.Vibration.vibrate([0, 40, 40, 40, 40, 40]);
    };
    HapticWaveFeedback.levelUp = function () {
        // Celebration pattern
        react_native_1.Vibration.vibrate([0, 50, 30, 50, 30, 50, 30, 100]);
    };
    HapticWaveFeedback.crewJoin = function () {
        // Welcome pattern
        react_native_1.Vibration.vibrate([0, 30, 20, 30, 20, 30, 20, 80]);
    };
    HapticWaveFeedback.scroll = function () {
        // Subtle feedback for scrolling through vibes
        react_native_1.Vibration.vibrate(10);
    };
    HapticWaveFeedback.longPress = function () {
        // Feedback for long press actions
        react_native_1.Vibration.vibrate([0, 50]);
    };
    HapticWaveFeedback.cancel = function () {
        safeCancelVibration();
    };
    return HapticWaveFeedback;
}());
exports.default = HapticWaveFeedback;
// React Hook for easy usage
var useHapticFeedback = function () {
    return {
        wave: function () { return HapticWaveFeedback.wave(); },
        splash: function () { return HapticWaveFeedback.splash(); },
        fish: function () { return HapticWaveFeedback.fish(); },
        storm: function () { return HapticWaveFeedback.storm(); },
        dolphin: function () { return HapticWaveFeedback.dolphin(); },
        gentle: function () { return HapticWaveFeedback.gentle(); },
        strong: function () { return HapticWaveFeedback.strong(); },
        success: function () { return HapticWaveFeedback.success(); },
        error: function () { return HapticWaveFeedback.error(); },
        notification: function () { return HapticWaveFeedback.notification(); },
        levelUp: function () { return HapticWaveFeedback.levelUp(); },
        crewJoin: function () { return HapticWaveFeedback.crewJoin(); },
        scroll: function () { return HapticWaveFeedback.scroll(); },
        longPress: function () { return HapticWaveFeedback.longPress(); },
        custom: function (pattern) { return HapticWaveFeedback.custom(pattern); },
        cancel: function () { return HapticWaveFeedback.cancel(); },
    };
};
exports.useHapticFeedback = useHapticFeedback;
