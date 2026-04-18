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
// @ts-nocheck
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_sensors_1 = require("react-native-sensors");
var _a = react_native_1.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var InteractiveWavePhysics = function (_a) {
    var enabled = _a.enabled;
    var _b = (0, react_1.useState)([]), ripples = _b[0], setRipples = _b[1];
    var _c = (0, react_1.useState)([]), bubbles = _c[0], setBubbles = _c[1];
    var _d = (0, react_1.useState)(false), stormActive = _d[0], setStormActive = _d[1];
    var stormAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var driftX = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var driftY = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    // Shake detection for storms
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        var subscription;
        try {
            (0, react_native_sensors_1.setUpdateIntervalForType)(react_native_sensors_1.SensorTypes.accelerometer, 100);
            subscription = react_native_sensors_1.accelerometer.subscribe(function (_a) {
                var x = _a.x, y = _a.y, z = _a.z;
                var acceleration = Math.sqrt(x * x + y * y + z * z);
                if (acceleration > 20) {
                    triggerStorm();
                }
            });
        }
        catch (e) {
            console.log('Accelerometer not available');
        }
        return function () {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [enabled]);
    // Tilt to drift
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        var subscription;
        try {
            subscription = react_native_sensors_1.accelerometer.subscribe(function (_a) {
                var x = _a.x, y = _a.y;
                react_native_1.Animated.spring(driftX, {
                    toValue: x * 10,
                    friction: 5,
                    useNativeDriver: true,
                }).start();
                react_native_1.Animated.spring(driftY, {
                    toValue: y * 10,
                    friction: 5,
                    useNativeDriver: true,
                }).start();
            });
        }
        catch (e) {
            console.log('Tilt sensor not available');
        }
        return function () {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [enabled]);
    var triggerStorm = function () {
        if (stormActive)
            return;
        setStormActive(true);
        react_native_1.Vibration.vibrate([0, 100, 50, 100, 50, 200]);
        react_native_1.Animated.sequence([
            react_native_1.Animated.timing(stormAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(stormAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(function () { return setStormActive(false); });
        // Create lightning effect
        react_native_1.DeviceEventEmitter.emit('storm-triggered');
    };
    var createRipple = function (x, y) {
        var newRipple = {
            id: Date.now() + Math.random(),
            x: x,
            y: y,
            anim: new react_native_1.Animated.Value(0),
        };
        setRipples(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newRipple], false); });
        react_native_1.Animated.timing(newRipple.anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        }).start(function () {
            setRipples(function (prev) { return prev.filter(function (r) { return r.id !== newRipple.id; }); });
        });
        react_native_1.Vibration.vibrate(10);
    };
    var createBubble = function (x, y) {
        var newBubble = {
            id: Date.now() + Math.random(),
            x: x,
            y: y,
            anim: new react_native_1.Animated.Value(0),
        };
        setBubbles(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newBubble], false); });
        react_native_1.Animated.timing(newBubble.anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start(function () {
            setBubbles(function (prev) { return prev.filter(function (b) { return b.id !== newBubble.id; }); });
        });
    };
    var panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: function () { return enabled; },
        onMoveShouldSetPanResponder: function () { return enabled; },
        onPanResponderGrant: function (evt) {
            var _a = evt.nativeEvent, locationX = _a.locationX, locationY = _a.locationY;
            createRipple(locationX, locationY);
        },
        onPanResponderMove: function (evt) {
            var _a = evt.nativeEvent, locationX = _a.locationX, locationY = _a.locationY;
            createBubble(locationX, locationY);
        },
    })).current;
    if (!enabled)
        return null;
    var stormOpacity = stormAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.3],
    });
    return (<react_native_1.View style={styles.container} {...panResponder.panHandlers}>
      {/* Storm overlay */}
      {stormActive && (<react_native_1.Animated.View style={[
                styles.stormOverlay,
                { opacity: stormOpacity, backgroundColor: '#FFFFFF' },
            ]}/>)}

      {/* Drift container */}
      <react_native_1.Animated.View style={[
            styles.driftContainer,
            {
                transform: [
                    { translateX: driftX },
                    { translateY: driftY },
                ],
            },
        ]}>
        {/* Ripples */}
        {ripples.map(function (ripple) {
            var scale = ripple.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 3],
            });
            var opacity = ripple.anim.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0.8, 0.6, 0],
            });
            return (<react_native_1.Animated.View key={ripple.id} style={[
                    styles.ripple,
                    {
                        left: ripple.x - 50,
                        top: ripple.y - 50,
                        transform: [{ scale: scale }],
                        opacity: opacity,
                    },
                ]}/>);
        })}

        {/* Bubbles */}
        {bubbles.map(function (bubble) {
            var translateY = bubble.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -200],
            });
            var opacity = bubble.anim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [0.6, 0.6, 0],
            });
            var scale = bubble.anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1, 1.2],
            });
            return (<react_native_1.Animated.View key={bubble.id} style={[
                    styles.bubble,
                    {
                        left: bubble.x - 10,
                        top: bubble.y - 10,
                        transform: [{ translateY: translateY }, { scale: scale }],
                        opacity: opacity,
                    },
                ]}/>);
        })}
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
    },
    stormOverlay: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 200 }),
    driftContainer: {
        flex: 1,
    },
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#00C2FF',
        backgroundColor: 'transparent',
    },
    bubble: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 194, 255, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
    },
});
exports.default = InteractiveWavePhysics;
