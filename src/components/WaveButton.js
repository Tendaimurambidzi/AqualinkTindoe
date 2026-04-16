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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var WaveButton = function (_a) {
    var onPress = _a.onPress, style = _a.style, children = _a.children, hitSlop = _a.hitSlop;
    var ripple1 = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var ripple2 = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var scale = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    var _b = (0, react_1.useState)(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var handlePressIn = function () {
        // Scale down slightly
        react_native_1.Animated.spring(scale, {
            toValue: 0.95,
            friction: 3,
            useNativeDriver: true,
        }).start();
        // Ripple effect
        ripple1.setValue(0);
        ripple2.setValue(0);
        react_native_1.Animated.stagger(100, [
            react_native_1.Animated.timing(ripple1, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(ripple2, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    };
    var handlePressOut = function () {
        // Scale back to normal
        react_native_1.Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };
    var getRippleStyle = function (rippleAnim) {
        var rippleScale = rippleAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 2],
        });
        var rippleOpacity = rippleAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.5, 0.3, 0],
        });
        return {
            transform: [{ scale: rippleScale }],
            opacity: rippleOpacity,
        };
    };
    var handlePress = function () {
        if (isProcessing)
            return;
        setIsProcessing(true);
        Promise.resolve(onPress()).finally(function () {
            setIsProcessing(false);
        });
    };
    return (<react_native_1.Pressable onPress={function () {
            void handlePress();
        }} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isProcessing} hitSlop={hitSlop} style={style}>
      <react_native_1.Animated.View style={{ transform: [{ scale: scale }], position: 'relative', opacity: isProcessing ? 0.7 : 1 }}>
        {children}
        {/* Ripple effects */}
        <react_native_1.Animated.View style={[styles.ripple, getRippleStyle(ripple1)]} pointerEvents="none"/>
        <react_native_1.Animated.View style={[styles.ripple, getRippleStyle(ripple2)]} pointerEvents="none"/>
      </react_native_1.Animated.View>
    </react_native_1.Pressable>);
};
var styles = react_native_1.StyleSheet.create({
    ripple: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 20,
        height: 20,
        borderRadius: 10,
        marginLeft: -10,
        marginTop: -10,
        borderWidth: 2,
        borderColor: '#00C2FF',
        backgroundColor: 'transparent',
    },
});
exports.default = WaveButton;
