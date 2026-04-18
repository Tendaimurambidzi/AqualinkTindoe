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
var BioluminescentTapEffect = function (_a) {
    var x = _a.x, y = _a.y, onComplete = _a.onComplete;
    var particles = (0, react_1.useRef)(Array.from({ length: 12 }, function () { return ({
        opacity: new react_native_1.Animated.Value(1),
        scale: new react_native_1.Animated.Value(0.3),
        translateX: new react_native_1.Animated.Value(0),
        translateY: new react_native_1.Animated.Value(0),
        angle: Math.random() * Math.PI * 2,
    }); })).current;
    (0, react_1.useEffect)(function () {
        var animations = particles.map(function (particle, i) {
            var distance = 40 + Math.random() * 60;
            return react_native_1.Animated.parallel([
                react_native_1.Animated.timing(particle.opacity, {
                    toValue: 0,
                    duration: 800 + Math.random() * 400,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(particle.scale, {
                    toValue: 1 + Math.random() * 0.5,
                    duration: 800 + Math.random() * 400,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(particle.translateX, {
                    toValue: Math.cos(particle.angle) * distance,
                    duration: 800 + Math.random() * 400,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(particle.translateY, {
                    toValue: Math.sin(particle.angle) * distance,
                    duration: 800 + Math.random() * 400,
                    useNativeDriver: true,
                }),
            ]);
        });
        react_native_1.Animated.parallel(animations).start(onComplete);
    }, []);
    return (<react_native_1.View style={[styles.container, { left: x - 6, top: y - 6 }]} pointerEvents="none">
      {particles.map(function (particle, i) { return (<react_native_1.Animated.View key={i} style={[
                styles.particle,
                {
                    opacity: particle.opacity,
                    transform: [
                        { translateX: particle.translateX },
                        { translateY: particle.translateY },
                        { scale: particle.scale },
                    ],
                },
            ]}/>); })}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        width: 12,
        height: 12,
        zIndex: 9999,
    },
    particle: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#00FFE6',
        shadowColor: '#00FFE6',
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 5,
    },
});
exports.default = BioluminescentTapEffect;
