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
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var NotificationToast = function (_a) {
    var visible = _a.visible, message = _a.message, kind = _a.kind, logo = _a.logo;
    var _b = (0, react_native_1.useWindowDimensions)(), width = _b.width, height = _b.height;
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    var anim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        react_native_1.Animated.timing(anim, {
            toValue: visible ? 1 : 0,
            duration: 400,
            easing: react_native_1.Easing.out(react_native_1.Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [visible, anim]);
    // Position at top like Android notification bar/message inbox
    var translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, insets.top + 10], // Position below status bar
    });
    var opacity = anim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 1],
    });
    var containerStyle = [
        styles.container,
        { transform: [{ translateY: translateY }], opacity: opacity, width: width - 32 },
        kind === 'positive' ? styles.positive : styles.negative,
    ];
    return (<react_native_1.Animated.View style={containerStyle} pointerEvents="box-none">
      {logo && (typeof logo === 'object' && 'text' in logo ? (
        // Text-based avatar (initials) - larger for inbox style
        <react_native_1.View style={[styles.avatar, { backgroundColor: logo.backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
            <react_native_1.Text style={[styles.initialsText, { color: logo.color }]}>{logo.text}</react_native_1.Text>
          </react_native_1.View>) : (
        // Image-based avatar - larger for inbox style
        <react_native_1.Image source={logo} style={styles.avatar}/>))}
      <react_native_1.View style={styles.messageContainer}>
        <react_native_1.Text style={styles.message} numberOfLines={2}>{message}</react_native_1.Text>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8, // Less rounded for inbox style
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    positive: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Light background like Gmail
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    negative: {
        backgroundColor: 'rgba(255, 248, 248, 0.95)', // Light red tint for errors
        borderWidth: 1,
        borderColor: 'rgba(255, 80, 80, 0.3)',
    },
    avatar: {
        width: 40, // Larger avatar like inbox style
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    initialsText: {
        fontSize: 14, // Larger text for bigger avatar
        fontWeight: 'bold',
    },
    message: {
        color: '#333', // Dark text on light background
        fontWeight: '500', // Medium weight like inbox items
        fontSize: 14,
        lineHeight: 18,
    },
});
exports.default = NotificationToast;
