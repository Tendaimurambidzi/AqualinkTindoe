"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var TapSplashEffect_1 = __importDefault(require("./TapSplashEffect"));
// Try to use react-native-video for playing a short audio cue
var RNVideo = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNVideo = require('react-native-video').default;
}
catch (_a) { }
var _b = react_native_1.Dimensions.get('window'), SCREEN_W = _b.width, SCREEN_H = _b.height;
// Asset injection: pass local images/sound via props or drop files into Drift/assets and wire them up later.
// Avoid require() so the app runs even if assets are not present yet.
var UNUSED;
var styles = react_native_1.StyleSheet.create({
    root: { flex: 1, backgroundColor: 'black' },
    sky: { flex: 1, backgroundColor: '#070914' },
    ocean: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(120, SCREEN_H * 0.32) },
    moon: { position: 'absolute' },
    falcon: { position: 'absolute' },
    hint: { position: 'absolute', bottom: 8, alignSelf: 'center', color: '#5b6a85', fontSize: 12 },
});
var SplashMoonFalcon = function (_a) {
    var onDone = _a.onDone, moonSource = _a.moonSource, falconSource = _a.falconSource, soundSource = _a.soundSource;
    // Animation values
    var moonDiameter = SCREEN_W; // cover full width
    var moonX = 0;
    // When fully risen, center the moon vertically
    var moonYBase = (SCREEN_H - moonDiameter) / 2;
    // Start just below the bottom edge, then rise to center (translateY -> 0)
    var initialMoonTranslate = Math.max(0, SCREEN_H - moonYBase);
    var moonY = (0, react_1.useRef)(new react_native_1.Animated.Value(initialMoonTranslate)).current;
    var birdX = (0, react_1.useRef)(new react_native_1.Animated.Value(SCREEN_W * 0.6)).current; // start off to the right
    var birdY = (0, react_1.useRef)(new react_native_1.Animated.Value(-SCREEN_H * 0.05)).current; // slight descent path
    var birdScale = (0, react_1.useRef)(new react_native_1.Animated.Value(0.85)).current; // scale up a bit while flying in
    var _b = (0, react_1.useState)(false), playSound = _b[0], setPlaySound = _b[1];
    var _c = (0, react_1.useState)(false), showBird = _c[0], setShowBird = _c[1];
    var tapSplashRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Sequence: moon rises to center (>=10s based on distance) -> reveal bird and fly in (6s)
        var baseSpeedPxPerSec = SCREEN_H / 10; // 1 screen height over 10s
        var computedMs = Math.round((initialMoonTranslate / baseSpeedPxPerSec) * 1000);
        var moonDurationMs = Math.max(10000, computedMs);
        react_native_1.Animated.timing(moonY, {
            toValue: 0,
            duration: moonDurationMs,
            easing: react_native_1.Easing.out(react_native_1.Easing.cubic),
            useNativeDriver: true,
        }).start(function () {
            setShowBird(true);
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(birdX, { toValue: 0, duration: 6000, easing: react_native_1.Easing.out(react_native_1.Easing.cubic), useNativeDriver: true }),
                react_native_1.Animated.timing(birdY, { toValue: 0, duration: 6000, easing: react_native_1.Easing.out(react_native_1.Easing.cubic), useNativeDriver: true }),
                react_native_1.Animated.timing(birdScale, { toValue: 1, duration: 6000, easing: react_native_1.Easing.out(react_native_1.Easing.quad), useNativeDriver: true }),
            ]).start(function () {
                // When bird animation finishes, play the sound.
                if (RNVideo && soundSource)
                    setPlaySound(true);
                // If no sound, proceed immediately.
                else
                    onDone();
            });
        });
    }, [birdScale, birdX, birdY, moonY, onDone]);
    // Sizes/positions
    var birdSize = Math.min(SCREEN_W * 0.62, SCREEN_H * 0.62); // slightly larger to partly obscure the moon
    var birdXBase = (SCREEN_W - birdSize) / 2; // center horizontally over the moon
    var birdYBase = moonYBase + (moonDiameter - birdSize) / 2; // center vertically over the moon
    return (<react_native_1.Pressable style={styles.root} onPress={function (e) {
            var _a;
            (_a = tapSplashRef.current) === null || _a === void 0 ? void 0 : _a.spawnAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
        }}>
      {/* Night sky */}
      <react_native_1.View style={styles.sky}/>

      {/* Moon rising behind the ocean horizon: we use layering with an ocean bar masking the lower part */}
      <react_native_1.Animated.View style={{ position: 'absolute', left: moonX, top: moonYBase, transform: [{ translateY: moonY }], zIndex: 1 }}>
        {moonSource ? (<react_native_1.Image source={moonSource} style={{ width: moonDiameter, height: moonDiameter, resizeMode: 'cover' }}/>) : (<react_native_1.View style={{ width: moonDiameter, height: moonDiameter, borderRadius: moonDiameter / 2, backgroundColor: '#b20000' }}/>)}
      </react_native_1.Animated.View>

      {/* Ocean removed as requested */}

      {/* Falcon flying in to center */}
      {showBird && (<react_native_1.Animated.View style={{
                position: 'absolute',
                left: birdXBase,
                top: birdYBase,
                transform: [
                    { translateX: birdX },
                    { translateY: birdY },
                    { scale: birdScale },
                ],
                zIndex: 3, // ensure falcon sits above the moon to partly obscure it
            }}>
        {falconSource ? (<react_native_1.Image source={falconSource} style={{ width: birdSize, height: birdSize, resizeMode: 'contain' }}/>) : null}
      </react_native_1.Animated.View>)}

      {/* Play short landing sound once */}
      {RNVideo && soundSource && playSound ? (<RNVideo source={soundSource} audioOnly paused={!playSound} onEnd={function () {
                // Proceed to next screen as soon as sound finishes.
                onDone();
            }} style={{ width: 0, height: 0 }}/>) : null}

      {/* Hint if assets missing in dev */}
      {__DEV__ && (!moonSource || !falconSource) ? (<react_native_1.Text style={styles.hint}>Place moon.png, falcon.png and falcon.mp3 in Drift/assets and pass to SplashMoonFalcon</react_native_1.Text>) : null}

      {/* Interactive tap effect overlay */}
      <TapSplashEffect_1.default ref={tapSplashRef}/>
    </react_native_1.Pressable>);
};
exports.default = SplashMoonFalcon;
