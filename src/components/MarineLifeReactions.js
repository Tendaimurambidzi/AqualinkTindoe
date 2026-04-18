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
var _a = react_native_1.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var MarineLifeReactions = function (_a) {
    var reactionType = _a.reactionType, count = _a.count, onAnimationComplete = _a.onAnimationComplete;
    var _b = (0, react_1.useState)([]), creatures = _b[0], setCreatures = _b[1];
    (0, react_1.useEffect)(function () {
        // Generate creatures based on count
        var newCreatures = Array.from({ length: Math.min(count, 20) }, function (_, i) { return ({
            id: Date.now() + i,
            anim: new react_native_1.Animated.Value(0),
        }); });
        setCreatures(newCreatures);
        // Animate each creature
        newCreatures.forEach(function (creature, index) {
            react_native_1.Animated.timing(creature.anim, {
                toValue: 1,
                duration: 2000 + Math.random() * 1000,
                delay: index * 100,
                useNativeDriver: true,
            }).start(function () {
                if (index === newCreatures.length - 1) {
                    onAnimationComplete === null || onAnimationComplete === void 0 ? void 0 : onAnimationComplete();
                    setTimeout(function () { return setCreatures([]); }, 500);
                }
            });
        });
        // Haptic feedback
        if (reactionType === 'whale') {
            react_native_1.Vibration.vibrate([0, 100, 50, 100]);
        }
        else if (reactionType === 'octopus') {
            react_native_1.Vibration.vibrate([0, 30, 30, 30, 30, 30]);
        }
        else {
            react_native_1.Vibration.vibrate(20);
        }
    }, [count, reactionType]);
    var getCreatureEmoji = function () {
        switch (reactionType) {
            case 'fish': return '🐠';
            case 'octopus': return '🐙';
            case 'shell': return '🐚';
            case 'crab': return '🦀';
            case 'whale': return '🐳';
            default: return '🐠';
        }
    };
    var getAnimationStyle = function (creature, index) {
        var startX = reactionType === 'crab' ? -50 : Math.random() * SCREEN_WIDTH;
        var endX = reactionType === 'crab' ? SCREEN_WIDTH + 50 : Math.random() * SCREEN_WIDTH;
        var startY = reactionType === 'whale' ? SCREEN_HEIGHT : Math.random() * SCREEN_HEIGHT * 0.6;
        var endY = reactionType === 'whale' ? -100 : Math.random() * SCREEN_HEIGHT * 0.4;
        var translateX = creature.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [startX, endX],
        });
        var translateY = creature.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [startY, endY],
        });
        var opacity = creature.anim.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 1, 1, 0],
        });
        var scale = creature.anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.5, 1.2, 0.8],
        });
        var rotate = creature.anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', reactionType === 'fish' ? '360deg' : '0deg'],
        });
        return {
            transform: [
                { translateX: translateX },
                { translateY: translateY },
                { scale: scale },
                { rotate: rotate },
            ],
            opacity: opacity,
        };
    };
    return (<react_native_1.View style={styles.container} pointerEvents="none">
      {creatures.map(function (creature, index) { return (<react_native_1.Animated.Text key={creature.id} style={[
                styles.creature,
                getAnimationStyle(creature, index),
                { fontSize: reactionType === 'whale' ? 48 : 32 },
            ]}>
          {getCreatureEmoji()}
        </react_native_1.Animated.Text>); })}
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    creature: {
        position: 'absolute',
        fontSize: 32,
    },
});
exports.default = MarineLifeReactions;
