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
var SwimmingFishLoader = function () {
    var fish1X = (0, react_1.useRef)(new react_native_1.Animated.Value(-100)).current;
    var fish2X = (0, react_1.useRef)(new react_native_1.Animated.Value(-150)).current;
    var fish3X = (0, react_1.useRef)(new react_native_1.Animated.Value(-200)).current;
    var fish1Y = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var fish2Y = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var fish3Y = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        var swimAcross = function (fishX, fishY, delay) {
            return react_native_1.Animated.loop(react_native_1.Animated.sequence([
                react_native_1.Animated.delay(delay),
                react_native_1.Animated.parallel([
                    react_native_1.Animated.timing(fishX, {
                        toValue: 400,
                        duration: 3000,
                        easing: react_native_1.Easing.linear,
                        useNativeDriver: true,
                    }),
                    react_native_1.Animated.sequence([
                        react_native_1.Animated.timing(fishY, {
                            toValue: -20,
                            duration: 750,
                            easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                            useNativeDriver: true,
                        }),
                        react_native_1.Animated.timing(fishY, {
                            toValue: 20,
                            duration: 1500,
                            easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                            useNativeDriver: true,
                        }),
                        react_native_1.Animated.timing(fishY, {
                            toValue: 0,
                            duration: 750,
                            easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
                react_native_1.Animated.timing(fishX, {
                    toValue: -100,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]));
        };
        var anim1 = swimAcross(fish1X, fish1Y, 0);
        var anim2 = swimAcross(fish2X, fish2Y, 800);
        var anim3 = swimAcross(fish3X, fish3Y, 1600);
        anim1.start();
        anim2.start();
        anim3.start();
        return function () {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, []);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Animated.Text style={[
            styles.fish,
            {
                transform: [
                    { translateX: fish1X },
                    { translateY: fish1Y },
                    { scaleX: -1 },
                ],
            },
        ]}>
        🐠
      </react_native_1.Animated.Text>
      <react_native_1.Animated.Text style={[
            styles.fish,
            {
                transform: [
                    { translateX: fish2X },
                    { translateY: fish2Y },
                    { scaleX: -1 },
                ],
            },
        ]}>
        🐟
      </react_native_1.Animated.Text>
      <react_native_1.Animated.Text style={[
            styles.fish,
            {
                transform: [
                    { translateX: fish3X },
                    { translateY: fish3Y },
                    { scaleX: -1 },
                ],
            },
        ]}>
        🐡
      </react_native_1.Animated.Text>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        width: 300,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    fish: {
        fontSize: 32,
        position: 'absolute',
    },
});
exports.default = SwimmingFishLoader;
