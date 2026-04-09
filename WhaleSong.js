"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
// Try to use react-native-video for whale song sound
var RNVideo = null;
try {
    RNVideo = require('react-native-video').default;
}
catch (_a) { }
// Whale song sound (using hawk sound as placeholder - replace with whale.mp3 when available)
var whaleSound = null;
try {
    whaleSound = require('./assets/hawk-call-sound-effect-hawk-cry-364472.mp3');
}
catch (_b) { }
var WhaleSong = function (_a) {
    var _b = _a.enabled, enabled = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)(false), isSinging = _c[0], setIsSinging = _c[1];
    var _d = (0, react_1.useState)([]), soundWaves = _d[0], setSoundWaves = _d[1];
    var whaleAnim = (0, react_1.useState)(new react_native_1.Animated.Value(0))[0];
    var _e = (0, react_1.useState)(false), playSound = _e[0], setPlaySound = _e[1];
    var waveIdRef = react_1.default.useRef(0);
    var startSong = function () {
        setIsSinging(true);
        setPlaySound(true); // Start playing whale song
        // Whale swims in
        react_native_1.Animated.timing(whaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
        // Create sound waves
        var waveInterval = setInterval(function () {
            var newWave = {
                id: waveIdRef.current++,
                anim: new react_native_1.Animated.Value(0),
            };
            setSoundWaves(function (prev) { return __spreadArray(__spreadArray([], prev.slice(-3), true), [newWave], false); });
            react_native_1.Animated.timing(newWave.anim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }).start(function () {
                setSoundWaves(function (prev) { return prev.filter(function (w) { return w.id !== newWave.id; }); });
            });
        }, 500);
        // Stop after 4 seconds
        setTimeout(function () {
            clearInterval(waveInterval);
            react_native_1.Animated.timing(whaleAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(function () {
                setIsSinging(false);
                setSoundWaves([]);
                setPlaySound(false); // Stop whale song
            });
        }, 4000);
    };
    if (!enabled)
        return null;
    return (<>
      {/* Whale song button */}
      {!isSinging && (<react_native_1.Pressable onPress={startSong} style={styles.songButton}>
          <react_native_1.Text style={styles.songButtonText}>🐋</react_native_1.Text>
        </react_native_1.Pressable>)}

      {/* Whale and sound waves */}
      {isSinging && (<react_native_1.View style={styles.container} pointerEvents="none">
          {/* Whale */}
          <react_native_1.Animated.View style={[
                styles.whale,
                {
                    opacity: whaleAnim,
                    transform: [
                        {
                            translateX: whaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-200, 0],
                            }),
                        },
                        {
                            scale: whaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                            }),
                        },
                    ],
                },
            ]}>
            <react_native_1.Text style={styles.whaleEmoji}>🐋</react_native_1.Text>
          </react_native_1.Animated.View>

          {/* Sound waves */}
          {soundWaves.map(function (wave, index) { return (<react_native_1.Animated.View key={wave.id} style={[
                    styles.soundWave,
                    {
                        opacity: wave.anim.interpolate({
                            inputRange: [0, 0.2, 1],
                            outputRange: [0, 0.8, 0],
                        }),
                        transform: [
                            {
                                scale: wave.anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 3],
                                }),
                            },
                        ],
                    },
                ]}>
              <react_native_1.Text style={styles.noteEmoji}>🎵</react_native_1.Text>
            </react_native_1.Animated.View>); })}
        </react_native_1.View>)}

      {/* Whale song audio */}
      {RNVideo && whaleSound && playSound && (<RNVideo source={whaleSound} audioOnly paused={!playSound} volume={1.0} ignoreSilentSwitch="ignore" style={{ width: 0, height: 0 }} onEnd={function () { return setPlaySound(false); }}/>)}
    </>);
};
var styles = react_native_1.StyleSheet.create({
    songButton: {
        position: 'absolute',
        bottom: 200,
        left: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 119, 190, 0.2)',
        borderWidth: 2,
        borderColor: '#0077BE',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    songButtonText: {
        fontSize: 32,
    },
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 170, justifyContent: 'center', alignItems: 'center' }),
    whale: {
        position: 'absolute',
        left: '20%',
    },
    whaleEmoji: {
        fontSize: 120,
    },
    soundWave: {
        position: 'absolute',
        left: '40%',
    },
    noteEmoji: {
        fontSize: 50,
    },
});
exports.default = WhaleSong;
