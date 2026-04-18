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
var MoonNightMode = function () {
    var _a = (0, react_1.useState)(false), isNight = _a[0], setIsNight = _a[1];
    var moonOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        // Check time of day - simplified to avoid crashes
        try {
            var hour = new Date().getHours();
            var shouldBeNight = hour >= 19 || hour < 6; // 7pm to 6am
            setIsNight(shouldBeNight);
            react_native_1.Animated.timing(moonOpacity, {
                toValue: shouldBeNight ? 0.8 : 0,
                duration: 2000,
                useNativeDriver: true,
            }).start();
        }
        catch (err) {
            console.log('Night mode check error:', err);
        }
    }, []);
    return (<react_native_1.View style={styles.container} pointerEvents="none">
      {/* Moon */}
      <react_native_1.Animated.View style={[styles.moonContainer, { opacity: moonOpacity }]}>
        <react_native_1.Text style={styles.moon}>🌙</react_native_1.Text>
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: -1 }),
    moonContainer: {
        position: 'absolute',
        top: 60,
        right: 40,
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moon: {
        fontSize: 60,
    },
});
exports.default = MoonNightMode;
