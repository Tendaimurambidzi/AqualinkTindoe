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
var FloatingWaterAnimation = function () {
    var bubbles = [
        { id: 1, x: 10, size: 40, duration: 4000, delay: 0 },
        { id: 2, x: 30, size: 25, duration: 5000, delay: 500 },
        { id: 3, x: 50, size: 35, duration: 4500, delay: 1000 },
        { id: 4, x: 70, size: 30, duration: 5500, delay: 1500 },
        { id: 5, x: 85, size: 20, duration: 4200, delay: 800 },
        { id: 6, x: 15, size: 28, duration: 4800, delay: 1200 },
        { id: 7, x: 60, size: 22, duration: 5200, delay: 600 },
        { id: 8, x: 40, size: 32, duration: 4600, delay: 1400 },
    ];
    return (<react_native_1.View style={styles.container} pointerEvents="none">
      {bubbles.map(function (bubble) { return (<BubbleAnimation key={bubble.id} bubble={bubble}/>); })}
    </react_native_1.View>);
};
var BubbleAnimation = function (_a) {
    var bubble = _a.bubble;
    var animY = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    var animX = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var opacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        var animate = function () {
            // Fade in
            react_native_1.Animated.timing(opacity, {
                toValue: 0.6,
                duration: 500,
                delay: bubble.delay,
                useNativeDriver: true,
            }).start();
            // Float up and sway
            react_native_1.Animated.loop(react_native_1.Animated.parallel([
                react_native_1.Animated.timing(animY, {
                    toValue: 0,
                    duration: bubble.duration,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(animX, {
                        toValue: 1,
                        duration: bubble.duration / 2,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(animX, {
                        toValue: -1,
                        duration: bubble.duration / 2,
                        useNativeDriver: true,
                    }),
                ]),
            ])).start();
        };
        animate();
    }, []);
    return (<react_native_1.Animated.View style={[
            styles.bubble,
            {
                left: "".concat(bubble.x, "%"),
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                opacity: opacity,
                transform: [
                    {
                        translateY: animY.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-800, 0],
                        }),
                    },
                    {
                        translateX: animX.interpolate({
                            inputRange: [-1, 1],
                            outputRange: [-20, 20],
                        }),
                    },
                ],
            },
        ]}/>);
};
var styles = react_native_1.StyleSheet.create({
    container: __assign({}, react_native_1.StyleSheet.absoluteFillObject),
    bubble: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'rgba(178, 0, 0, 0.7)', // blood red
        borderWidth: 2,
        borderColor: 'rgba(120, 0, 0, 0.9)', // darker blood red
    },
});
exports.default = FloatingWaterAnimation;
