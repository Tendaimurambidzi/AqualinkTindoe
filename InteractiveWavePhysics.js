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
var _a = react_native_1.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var InteractiveWavePhysics = function (_a) {
    var _b = _a.enabled, enabled = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)([]), ripples = _c[0], setRipples = _c[1];
    var _d = (0, react_1.useState)([]), bubbles = _d[0], setBubbles = _d[1];
    var rippleIdRef = (0, react_1.useRef)(0);
    var bubbleIdRef = (0, react_1.useRef)(0);
    var createRipple = function (x, y) {
        if (!enabled)
            return;
        var anim = new react_native_1.Animated.Value(0);
        var id = rippleIdRef.current++;
        setRipples(function (prev) { return __spreadArray(__spreadArray([], prev.slice(-4), true), [{ id: id, x: x, y: y, anim: anim }], false); });
        react_native_1.Animated.timing(anim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start(function () {
            setRipples(function (prev) { return prev.filter(function (r) { return r.id !== id; }); });
        });
    };
    var createBubble = function (x, y) {
        if (!enabled)
            return;
        var anim = new react_native_1.Animated.Value(0);
        var id = bubbleIdRef.current++;
        setBubbles(function (prev) { return __spreadArray(__spreadArray([], prev.slice(-8), true), [{ id: id, x: x, y: y, anim: anim }], false); });
        react_native_1.Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start(function () {
            setBubbles(function (prev) { return prev.filter(function (b) { return b.id !== id; }); });
        });
    };
    var panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: function () { return enabled; },
        onMoveShouldSetPanResponder: function () { return enabled; },
        onPanResponderGrant: function (evt) {
            var _a = evt.nativeEvent, locationX = _a.locationX, locationY = _a.locationY;
            createRipple(locationX, locationY);
            createBubble(locationX, locationY);
        },
        onPanResponderMove: function (evt, gestureState) {
            var moveX = gestureState.moveX, moveY = gestureState.moveY;
            createBubble(moveX, moveY);
        },
    })).current;
    if (!enabled)
        return null;
    return (<react_native_1.View style={styles.container} {...panResponder.panHandlers}>
      {ripples.map(function (ripple) { return (<react_native_1.Animated.View key={ripple.id} style={[
                styles.ripple,
                {
                    left: ripple.x - 50,
                    top: ripple.y - 50,
                    opacity: ripple.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0],
                    }),
                    transform: [
                        {
                            scale: ripple.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.3, 3],
                            }),
                        },
                    ],
                },
            ]}/>); })}
      {bubbles.map(function (bubble) { return (<react_native_1.Animated.View key={bubble.id} style={[
                styles.bubble,
                {
                    left: bubble.x - 8,
                    top: bubble.y - 8,
                    opacity: bubble.anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 0],
                    }),
                    transform: [
                        {
                            translateY: bubble.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -100],
                            }),
                        },
                        {
                            scale: bubble.anim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0.5, 1, 0.8],
                            }),
                        },
                    ],
                },
            ]}/>); })}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 100, pointerEvents: 'box-none' }),
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#00C2FF',
        backgroundColor: 'rgba(0, 194, 255, 0.25)',
    },
    bubble: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(173, 216, 230, 0.9)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
});
exports.default = InteractiveWavePhysics;
