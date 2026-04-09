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
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_sensors_1 = require("react-native-sensors");
var TiltToDrift = function (_a) {
    var _b = _a.enabled, enabled = _b === void 0 ? true : _b;
    var offsetX = (0, react_1.useState)(new react_native_1.Animated.Value(0))[0];
    var offsetY = (0, react_1.useState)(new react_native_1.Animated.Value(0))[0];
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        try {
            (0, react_native_sensors_1.setUpdateIntervalForType)(react_native_sensors_1.SensorTypes.gyroscope, 50);
            var subscription_1 = react_native_sensors_1.gyroscope.subscribe(function (_a) {
                var x = _a.x, y = _a.y;
                react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(offsetX, {
                        toValue: Math.max(-30, Math.min(30, y * 50)),
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(offsetY, {
                        toValue: Math.max(-30, Math.min(30, x * 50)),
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
            return function () { return subscription_1.unsubscribe(); };
        }
        catch (error) {
            console.log('Gyroscope not available');
        }
    }, [enabled, offsetX, offsetY]);
    if (!enabled)
        return null;
    return (<react_native_1.Animated.View style={[
            styles.container,
            {
                transform: [
                    { translateX: offsetX },
                    { translateY: offsetY },
                ],
            },
        ]} pointerEvents="none">
      <react_native_1.View style={styles.oceanFloor}>
        <react_native_1.Text style={styles.coral}>🪸</react_native_1.Text>
        <react_native_1.Text style={[styles.coral, styles.coral2]}>🪸</react_native_1.Text>
        <react_native_1.Text style={styles.shell}>🐚</react_native_1.Text>
        <react_native_1.Text style={[styles.shell, styles.shell2]}>🐚</react_native_1.Text>
        <react_native_1.Text style={styles.starfish}>⭐</react_native_1.Text>
        <react_native_1.Text style={[styles.starfish, styles.starfish2]}>⭐</react_native_1.Text>
        <react_native_1.Text style={styles.seaweed}>🌿</react_native_1.Text>
        <react_native_1.Text style={[styles.seaweed, styles.seaweed2]}>🌿</react_native_1.Text>
        <react_native_1.Text style={[styles.seaweed, styles.seaweed3]}>🌿</react_native_1.Text>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 1 }),
    oceanFloor: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
        backgroundColor: 'rgba(0, 50, 100, 0.15)',
    },
    coral: {
        position: 'absolute',
        fontSize: 40,
        bottom: 20,
        left: '10%',
    },
    coral2: {
        left: '70%',
        bottom: 30,
        fontSize: 35,
    },
    shell: {
        position: 'absolute',
        fontSize: 25,
        bottom: 15,
        left: '30%',
    },
    shell2: {
        left: '85%',
        bottom: 10,
        fontSize: 30,
    },
    starfish: {
        position: 'absolute',
        fontSize: 30,
        bottom: 25,
        left: '50%',
    },
    starfish2: {
        left: '90%',
        bottom: 35,
        fontSize: 25,
    },
    seaweed: {
        position: 'absolute',
        fontSize: 45,
        bottom: 0,
        left: '20%',
        opacity: 0.7,
    },
    seaweed2: {
        left: '60%',
        fontSize: 50,
    },
    seaweed3: {
        left: '80%',
        fontSize: 40,
    },
});
exports.default = TiltToDrift;
