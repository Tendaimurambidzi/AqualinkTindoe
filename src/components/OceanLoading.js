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
    o.default = v;
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var OceanLoading = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 60 : _b, _c = _a.color, color = _c === void 0 ? '#00C2FF' : _c;
    var wave1 = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var wave2 = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var wave3 = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var rotation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        // Wave animations
        var waveAnimation = react_native_1.Animated.loop(react_native_1.Animated.stagger(200, [
            react_native_1.Animated.sequence([
                react_native_1.Animated.timing(wave1, {
                    toValue: 1,
                    duration: 800,
                    easing: react_native_1.Easing.bezier(0.45, 0.05, 0.55, 0.95),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(wave1, {
                    toValue: 0,
                    duration: 800,
                    easing: react_native_1.Easing.bezier(0.45, 0.05, 0.55, 0.95),
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.sequence([
                react_native_1.Animated.timing(wave2, {
                    toValue: 1,
                    duration: 800,
                    easing: react_native_1.Easing.bezier(0.45, 0.05, 0.55, 0.95),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(wave2, {
                    toValue: 0,
                    duration: 800,
                    easing: react_native_1.Easing.bezier(0.45, 0.05, 0.55, 0.95),
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.sequence([
                react_native_1.Animated.timing(wave3, {
                    toValue: 1,
                    duration: 800,
                    easing: react_native_1.Easing.bezier(0.45, 0.05, 0.55, 0.95),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(wave3, {
                    toValue: 0,
                    duration: 800,
                    easing: react_native_1.Easing.bezier(0.45, 0.05, 0.55, 0.95),
                    useNativeDriver: true,
                }),
            ]),
        ]));
        // Rotation animation
        var rotateAnimation = react_native_1.Animated.loop(react_native_1.Animated.timing(rotation, {
            toValue: 1,
            duration: 3000,
            easing: react_native_1.Easing.linear,
            useNativeDriver: true,
        }));
        waveAnimation.start();
        rotateAnimation.start();
        return function () {
            waveAnimation.stop();
            rotateAnimation.stop();
        };
    }, []);
    var getWaveStyle = function (animValue) {
        var translateY = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -size * 0.3],
        });
        var opacity = animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.4, 1, 0.4],
        });
        return {
            transform: [{ translateY: translateY }],
            opacity: opacity,
        };
    };
    var rotate = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    return (<react_native_1.View style={[styles.container, { width: size, height: size }]}>
      {/* Rotating outer ring */}
      <react_native_1.Animated.View style={[
            styles.ring,
            {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderColor: color,
                transform: [{ rotate: rotate }],
            },
        ]}/>

      {/* Wave dots */}
      <react_native_1.View style={styles.wavesContainer}>
        <react_native_1.Animated.View style={[
            styles.waveDot,
            {
                backgroundColor: color,
                width: size * 0.15,
                height: size * 0.15,
                borderRadius: size * 0.075,
            },
            getWaveStyle(wave1),
        ]}/>
        <react_native_1.Animated.View style={[
            styles.waveDot,
            {
                backgroundColor: color,
                width: size * 0.15,
                height: size * 0.15,
                borderRadius: size * 0.075,
            },
            getWaveStyle(wave2),
        ]}/>
        <react_native_1.Animated.View style={[
            styles.waveDot,
            {
                backgroundColor: color,
                width: size * 0.15,
                height: size * 0.15,
                borderRadius: size * 0.075,
            },
            getWaveStyle(wave3),
        ]}/>
      </react_native_1.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ring: {
        position: 'absolute',
        borderWidth: 2,
        opacity: 0.3,
    },
    wavesContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    waveDot: {
        shadowColor: '#00C2FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 6,
        elevation: 4,
    },
});
exports.default = OceanLoading;
