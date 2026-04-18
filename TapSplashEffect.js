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
var _a = react_native_1.Dimensions.get('window'), width = _a.width, height = _a.height;
function makeParticle(kind, x, y, id) {
    return {
        id: id,
        x: x,
        y: y,
        kind: kind,
        scale: new react_native_1.Animated.Value(kind === 'bubble' ? 0.8 : 0.6),
        opacity: new react_native_1.Animated.Value(0.9),
        translateY: new react_native_1.Animated.Value(0),
        translateX: new react_native_1.Animated.Value(0),
        rotate: new react_native_1.Animated.Value((Math.random() * 2 - 1) * 0.6),
    };
}
function animateParticle(p, onEnd) {
    var floatUp = -60 - Math.random() * 60;
    var driftX = (Math.random() * 2 - 1) * 30;
    var dur = 900 + Math.random() * 500;
    react_native_1.Animated.parallel([
        react_native_1.Animated.timing(p.translateY, { toValue: floatUp, duration: dur, easing: react_native_1.Easing.out(react_native_1.Easing.quad), useNativeDriver: true }),
        react_native_1.Animated.timing(p.translateX, { toValue: driftX, duration: dur, easing: react_native_1.Easing.inOut(react_native_1.Easing.quad), useNativeDriver: true }),
        react_native_1.Animated.sequence([
            react_native_1.Animated.timing(p.scale, { toValue: 1.1, duration: dur * 0.3, easing: react_native_1.Easing.out(react_native_1.Easing.quad), useNativeDriver: true }),
            react_native_1.Animated.timing(p.scale, { toValue: 0.9, duration: dur * 0.4, easing: react_native_1.Easing.inOut(react_native_1.Easing.quad), useNativeDriver: true }),
        ]),
        react_native_1.Animated.timing(p.opacity, { toValue: 0, duration: dur, delay: 100, easing: react_native_1.Easing.out(react_native_1.Easing.quad), useNativeDriver: true }),
    ]).start(function () { return onEnd(); });
}
var TapSplashEffect = (0, react_1.forwardRef)(function (props, ref) {
    var _a = props.maxParticles, maxParticles = _a === void 0 ? 80 : _a;
    var _b = (0, react_1.useState)([]), particles = _b[0], setParticles = _b[1];
    var idRef = (0, react_1.useRef)(0);
    var cleanup = (0, react_1.useCallback)(function (id) {
        setParticles(function (prev) { return prev.filter(function (pp) { return pp.id !== id; }); });
    }, []);
    var spawnAt = (0, react_1.useCallback)(function (x, y) {
        setParticles(function (prev) {
            if (prev.length > maxParticles)
                return prev;
            var next = __spreadArray([], prev, true);
            // 3–5 bubbles
            var bubbleCount = 3 + Math.floor(Math.random() * 3);
            var _loop_1 = function (i) {
                var pid = ++idRef.current;
                var px = x + (Math.random() * 2 - 1) * 10;
                var py = y + (Math.random() * 2 - 1) * 6;
                var p = makeParticle('bubble', px, py, pid);
                next.push(p);
                requestAnimationFrame(function () { return animateParticle(p, function () { return cleanup(pid); }); });
            };
            for (var i = 0; i < bubbleCount; i++) {
                _loop_1(i);
            }
            // 30% chance shell glint
            if (Math.random() < 0.3) {
                var pid_1 = ++idRef.current;
                var p_1 = makeParticle('shell', x, y, pid_1);
                next.push(p_1);
                requestAnimationFrame(function () { return animateParticle(p_1, function () { return cleanup(pid_1); }); });
            }
            return next;
        });
    }, [cleanup, maxParticles]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({ spawnAt: spawnAt }); }, [spawnAt]);
    return (<react_native_1.View pointerEvents="none" style={styles.fill}>
      {particles.map(function (p) {
            var rotateDeg = p.rotate.interpolate({ inputRange: [-1, 1], outputRange: ['-25deg', '25deg'] });
            return (<react_native_1.Animated.View key={p.id} style={[
                    styles.particle,
                    {
                        left: p.x,
                        top: p.y,
                        transform: [
                            { translateX: p.translateX },
                            { translateY: p.translateY },
                            { rotate: rotateDeg },
                            { scale: p.scale },
                        ],
                        opacity: p.opacity,
                    },
                ]}>
            {p.kind === 'bubble' ? (<react_native_1.View style={styles.bubble}/>) : (<react_native_1.Text style={styles.shell}>🐚</react_native_1.Text>)}
          </react_native_1.Animated.View>);
        })}
    </react_native_1.View>);
});
exports.default = TapSplashEffect;
var styles = react_native_1.StyleSheet.create({
    fill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    particle: { position: 'absolute' },
    bubble: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(233,245,255,0.9)',
        borderWidth: 1,
        borderColor: 'rgba(0,200,255,0.5)',
    },
    shell: { fontSize: 18, textShadowColor: 'rgba(10,30,47,0.35)', textShadowRadius: 4 },
});
