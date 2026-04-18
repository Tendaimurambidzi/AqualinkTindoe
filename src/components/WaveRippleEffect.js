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
var SCREEN_HEIGHT = react_native_1.Dimensions.get('window').height;
var WaveRippleEffect = function () {
    var _a = (0, react_1.useState)([]), ripples = _a[0], setRipples = _a[1];
    (0, react_1.useEffect)(function () {
        // Create ripples from bottom at 15 minute intervals (900000ms)
        var interval = setInterval(function () {
            var x = Math.random() * 300 + 50;
            var y = SCREEN_HEIGHT; // Start from bottom
            addRipple(x, y);
        }, 900000); // 15 minutes
        return function () { return clearInterval(interval); };
    }, []);
    var addRipple = function (x, y) {
        var anim = new react_native_1.Animated.Value(0);
        var id = Date.now();
        setRipples(function (prev) { return __spreadArray(__spreadArray([], prev.slice(-4), true), [{ id: id, x: x, y: y, anim: anim }], false); }); // Keep last 5 ripples
        react_native_1.Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start(function () {
            // Remove ripple after animation
            setRipples(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });
        });
    };
    return (<react_native_1.View style={styles.container} pointerEvents="none">
      {ripples.map(function (ripple) {
            var scale = ripple.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 3.5],
            });
            var opacity = ripple.anim.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [0.8, 0.6, 0.3, 0],
            });
            return (<react_native_1.Animated.View key={ripple.id} style={[
                    styles.ripple,
                    {
                        left: ripple.x - 40,
                        top: ripple.y - 40,
                        opacity: opacity,
                        transform: [{ scale: scale }],
                    },
                ]}/>);
        })}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 999 }),
    ripple: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#00C2FF',
        backgroundColor: 'rgba(0, 194, 255, 0.15)',
    },
});
exports.default = WaveRippleEffect;
