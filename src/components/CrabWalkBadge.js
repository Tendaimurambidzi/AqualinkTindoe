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
var CrabWalkBadge = function (_a) {
    var children = _a.children;
    var walkX = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var rotation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        var walk = react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(walkX, {
                    toValue: 10,
                    duration: 400,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(rotation, {
                    toValue: 1,
                    duration: 400,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(walkX, {
                    toValue: -10,
                    duration: 400,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(rotation, {
                    toValue: -1,
                    duration: 400,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(walkX, {
                    toValue: 0,
                    duration: 400,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
                react_native_1.Animated.timing(rotation, {
                    toValue: 0,
                    duration: 400,
                    easing: react_native_1.Easing.inOut(react_native_1.Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
            react_native_1.Animated.delay(2000),
        ]));
        walk.start();
        return function () { return walk.stop(); };
    }, []);
    var rotate = rotation.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-3deg', '3deg'],
    });
    return (<react_native_1.Animated.View style={{
            transform: [{ translateX: walkX }, { rotate: rotate }],
        }}>
      {children}
      <react_native_1.View style={styles.crabContainer}>
        <react_native_1.Animated.Text style={[
            styles.crab,
            {
                transform: [{ translateX: walkX }, { rotate: rotate }],
            },
        ]}>
          🦀
        </react_native_1.Animated.Text>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    crabContainer: {
        position: 'absolute',
        bottom: -12,
        right: -8,
    },
    crab: {
        fontSize: 20,
    },
});
exports.default = CrabWalkBadge;
