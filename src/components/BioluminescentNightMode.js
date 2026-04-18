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
var _a = react_native_1.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var BioluminescentNightMode = function (_a) {
    var enabled = _a.enabled;
    var _b = (0, react_1.useState)(false), isNightTime = _b[0], setIsNightTime = _b[1];
    var _c = (0, react_1.useState)([]), planktons = _c[0], setPlanktons = _c[1];
    var glowAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        var checkNightTime = function () {
            var hour = new Date().getHours();
            // Night time: 8pm (20:00) to 6am (6:00)
            var isNight = hour >= 20 || hour < 6;
            setIsNightTime(isNight && enabled !== false);
        };
        checkNightTime();
        var interval = setInterval(checkNightTime, 60000); // Check every minute
        return function () { return clearInterval(interval); };
    }, [enabled]);
    (0, react_1.useEffect)(function () {
        if (isNightTime) {
            // Create plankton particles
            var newPlanktons = Array.from({ length: 30 }, function (_, i) { return ({
                id: i,
                x: Math.random() * SCREEN_WIDTH,
                y: Math.random() * SCREEN_HEIGHT,
                anim: new react_native_1.Animated.Value(0),
                size: 2 + Math.random() * 4,
            }); });
            setPlanktons(newPlanktons);
            // Animate planktons
            newPlanktons.forEach(function (plankton, index) {
                react_native_1.Animated.loop(react_native_1.Animated.sequence([
                    react_native_1.Animated.timing(plankton.anim, {
                        toValue: 1,
                        duration: 1000 + Math.random() * 2000,
                        delay: index * 100,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.timing(plankton.anim, {
                        toValue: 0,
                        duration: 1000 + Math.random() * 2000,
                        useNativeDriver: true,
                    }),
                ])).start();
            });
            // Global glow animation
            react_native_1.Animated.loop(react_native_1.Animated.sequence([
                react_native_1.Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])).start();
        }
        return function () {
            setPlanktons([]);
        };
    }, [isNightTime]);
    if (!isNightTime)
        return null;
    var glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.05, 0.15],
    });
    return (<react_native_1.View style={styles.container} pointerEvents="none">
      {/* Global bioluminescent glow */}
      <react_native_1.Animated.View style={[
            styles.globalGlow,
            {
                opacity: glowOpacity,
                backgroundColor: '#00FFD1',
            },
        ]}/>

      {/* Plankton particles */}
      {planktons.map(function (plankton) {
            var opacity = plankton.anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 1, 0.2],
            });
            var scale = plankton.anim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.2, 0.8],
            });
            return (<react_native_1.Animated.View key={plankton.id} style={[
                    styles.plankton,
                    {
                        left: plankton.x,
                        top: plankton.y,
                        width: plankton.size,
                        height: plankton.size,
                        borderRadius: plankton.size / 2,
                        opacity: opacity,
                        transform: [{ scale: scale }],
                    },
                ]}/>);
        })}

      {/* Edge glow effect */}
      <react_native_1.View style={styles.edgeGlow}/>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
    },
    globalGlow: __assign({}, react_native_1.StyleSheet.absoluteFillObject),
    plankton: {
        position: 'absolute',
        backgroundColor: '#00FFD1',
        shadowColor: '#00FFD1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
    },
    edgeGlow: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { borderWidth: 2, borderColor: 'rgba(0, 255, 209, 0.3)', borderRadius: 0 }),
});
exports.default = BioluminescentNightMode;
