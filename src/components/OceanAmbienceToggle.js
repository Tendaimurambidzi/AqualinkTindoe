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
var OceanAmbienceToggle = function (_a) {
    var enabled = _a.enabled, onToggle = _a.onToggle;
    var waveAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        if (enabled) {
            // Animate wave pulsing when enabled
            react_native_1.Animated.loop(react_native_1.Animated.sequence([
                react_native_1.Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 1500,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
            ])).start();
        }
        else {
            waveAnim.setValue(0);
        }
    }, [enabled]);
    var scale = waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2],
    });
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Pressable style={[
            styles.button,
            enabled && styles.buttonActive,
        ]} onPress={function () { return onToggle(!enabled); }}>
        <react_native_1.Animated.Text style={[
            styles.icon,
            {
                transform: [{ scale: scale }],
            },
        ]}>
          {enabled ? '🌊' : '🔇'}
        </react_native_1.Animated.Text>
        <react_native_1.Text style={[styles.label, enabled && { color: '#00FFFF' }]}>
          {enabled ? 'Waves On' : 'Silent'}
        </react_native_1.Text>
      </react_native_1.Pressable>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 140,
        right: 16,
        zIndex: 500,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#8B0000', // deep red
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#5A0000', // deeper red
    },
    buttonActive: {
        backgroundColor: '#8B0000', // deep red
        borderColor: '#5A0000', // deeper red
        shadowColor: '#8B0000', // deep red
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    icon: {
        fontSize: 24,
    },
    label: {
        position: 'absolute',
        bottom: -20,
        fontSize: 9,
        color: '#00C2FF',
        fontWeight: '600',
    },
});
exports.default = OceanAmbienceToggle;
