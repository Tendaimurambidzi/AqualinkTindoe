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
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var OctopusHug = function (_a) {
    var _b = _a.enabled, enabled = _b === void 0 ? true : _b;
    var _c = (0, react_1.useState)(false), isHugging = _c[0], setIsHugging = _c[1];
    var tentacleAnims = (0, react_1.useState)(function () {
        return Array.from({ length: 8 }, function () { return new react_native_1.Animated.Value(0); });
    })[0];
    var octopusScale = (0, react_1.useState)(new react_native_1.Animated.Value(0))[0];
    var startHug = function () {
        setIsHugging(true);
        // Octopus appears
        react_native_1.Animated.spring(octopusScale, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
        // Animate tentacles wrapping around screen
        var tentacleAnimations = tentacleAnims.map(function (anim, index) {
            return react_native_1.Animated.sequence([
                react_native_1.Animated.delay(index * 100),
                react_native_1.Animated.spring(anim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]);
        });
        react_native_1.Animated.parallel(tentacleAnimations).start(function () {
            // Hold for 2 seconds then release
            setTimeout(function () {
                react_native_1.Animated.parallel(__spreadArray([
                    react_native_1.Animated.timing(octopusScale, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    })
                ], tentacleAnims.map(function (anim) {
                    return react_native_1.Animated.timing(anim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    });
                }), true)).start(function () {
                    setIsHugging(false);
                });
            }, 2000);
        });
    };
    if (!enabled)
        return null;
    return (<>
      {/* Octopus hug button */}
      {!isHugging && (<react_native_1.Pressable onPress={startHug} style={styles.hugButton}>
          <react_native_1.Text style={styles.hugButtonText}>🐙</react_native_1.Text>
        </react_native_1.Pressable>)}

      {/* Octopus and tentacles */}
      {isHugging && (<react_native_1.View style={styles.container} pointerEvents="none">
          {/* Octopus body */}
          <react_native_1.Animated.View style={[
                styles.octopusBody,
                {
                    transform: [{ scale: octopusScale }],
                },
            ]}>
            <react_native_1.Text style={styles.octopusEmoji}>🐙</react_native_1.Text>
          </react_native_1.Animated.View>

          {/* Tentacles */}
          {tentacleAnims.map(function (anim, index) { return (<react_native_1.Animated.View key={index} style={[
                    styles.tentacle,
                    {
                        transform: [
                            {
                                translateX: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, getTentacleX(index)],
                                }),
                            },
                            {
                                translateY: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, getTentacleY(index)],
                                }),
                            },
                            {
                                rotate: anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', "".concat(getTentacleRotation(index), "deg")],
                                }),
                            },
                        ],
                        opacity: anim,
                    },
                ]}/>); })}
        </react_native_1.View>)}
    </>);
};
// Helper functions for tentacle positions
var getTentacleX = function (index) {
    var angle = (index / 8) * Math.PI * 2;
    return Math.cos(angle) * 150;
};
var getTentacleY = function (index) {
    var angle = (index / 8) * Math.PI * 2;
    return Math.sin(angle) * 150;
};
var getTentacleRotation = function (index) {
    return (index / 8) * 360;
};
var styles = react_native_1.StyleSheet.create({
    hugButton: {
        position: 'absolute',
        bottom: 140,
        left: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(138, 43, 226, 0.2)',
        borderWidth: 2,
        borderColor: '#8A2BE2',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    },
    hugButtonText: {
        fontSize: 32,
    },
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 180, justifyContent: 'center', alignItems: 'center' }),
    octopusBody: {
        position: 'absolute',
    },
    octopusEmoji: {
        fontSize: 100,
    },
    tentacle: {
        position: 'absolute',
        width: 30,
        height: 120,
        backgroundColor: 'rgba(138, 43, 226, 0.6)',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: 'rgba(186, 85, 211, 0.8)',
    },
});
exports.default = OctopusHug;
