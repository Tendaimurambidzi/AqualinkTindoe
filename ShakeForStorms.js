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
// @ts-nocheck
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_sensors_1 = require("react-native-sensors");
var ShakeForStorms = function (_a) {
    var _b = _a.enabled, enabled = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)(0), stormStrength = _c[0], setStormStrength = _c[1];
    var _d = (0, react_1.useState)([]), raindrops = _d[0], setRaindrops = _d[1];
    var raindropIdRef = (0, react_1.useRef)(0);
    var stormTimeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        try {
            (0, react_native_sensors_1.setUpdateIntervalForType)(react_native_sensors_1.SensorTypes.accelerometer, 100);
            var subscription_1 = react_native_sensors_1.accelerometer.subscribe(function (_a) {
                var x = _a.x, y = _a.y, z = _a.z;
                var acceleration = Math.sqrt(x * x + y * y + z * z);
                var base = 9;
                var peak = 35;
                var strength = Math.max(0, Math.min(1, (acceleration - base) / (peak - base)));
                if (strength > 0) {
                    setStormStrength(strength);
                    if (stormTimeoutRef.current) {
                        clearTimeout(stormTimeoutRef.current);
                    }
                    stormTimeoutRef.current = setTimeout(function () {
                        setStormStrength(0);
                    }, 2000);
                }
            });
            return function () {
                subscription_1.unsubscribe();
                if (stormTimeoutRef.current) {
                    clearTimeout(stormTimeoutRef.current);
                }
            };
        }
        catch (error) {
            console.log('Shake sensor not available');
        }
    }, [enabled]);
    (0, react_1.useEffect)(function () {
        if (!enabled || stormStrength <= 0) {
            setRaindrops([]);
            return;
        }
        var intervalDuration = Math.max(100, 420 - stormStrength * 260);
        var interval = setInterval(function () {
            var dropCount = Math.max(4, Math.round(12 * stormStrength));
            var newDrops = [];
            for (var i = 0; i < dropCount; i++) {
                var anim = new react_native_1.Animated.Value(0);
                var id = raindropIdRef.current++;
                var delay = Math.random() * 200;
                newDrops.push({
                    id: id,
                    x: Math.random() * 100,
                    anim: anim,
                    delay: delay,
                });
                react_native_1.Animated.timing(anim, {
                    toValue: 1,
                    duration: Math.max(600, 1200 - stormStrength * 400),
                    delay: delay,
                    useNativeDriver: true,
                }).start();
            }
            setRaindrops(function (prev) { return __spreadArray(__spreadArray([], prev.slice(-60), true), newDrops, true); });
        }, intervalDuration);
        return function () { return clearInterval(interval); };
    }, [stormStrength, enabled]);
    if (!enabled)
        return null;
    return (<react_native_1.View style={styles.container} pointerEvents="none">
      {stormStrength > 0 && (<>
          {raindrops.map(function (drop) { return (<react_native_1.Animated.View key={drop.id} style={[
                    styles.raindrop,
                    {
                        left: "".concat(drop.x, "%"),
                        opacity: drop.anim.interpolate({
                            inputRange: [0, 0.1, 0.9, 1],
                            outputRange: [0, 0.6, 0.6, 0],
                        }),
                        transform: [
                            {
                                translateY: drop.anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 800],
                                }),
                            },
                        ],
                    },
                ]}/>); })}
        </>)}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 150 }),
    raindrop: {
        position: 'absolute',
        width: 3,
        height: 25,
        backgroundColor: 'rgba(173, 216, 230, 0.8)',
        borderRadius: 2,
        top: -20,
    },
});
exports.default = ShakeForStorms;
