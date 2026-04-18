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
var SCREEN_WIDTH = react_native_1.Dimensions.get('window').width;
var OceanDialog = function (_a) {
    var visible = _a.visible, title = _a.title, message = _a.message, _b = _a.buttons, buttons = _b === void 0 ? [] : _b, onDismiss = _a.onDismiss;
    var fadeAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var scaleAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0.8)).current;
    var ripples = (0, react_1.useRef)([new react_native_1.Animated.Value(0), new react_native_1.Animated.Value(0)]).current;
    (0, react_1.useEffect)(function () {
        if (visible) {
            ripples.forEach(function (r) { return r.setValue(0); });
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            react_native_1.Animated.parallel([
                react_native_1.Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
                react_native_1.Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
            ]).start();
            // Background ripple animation
            react_native_1.Animated.loop(react_native_1.Animated.stagger(1200, [
                react_native_1.Animated.timing(ripples[0], { toValue: 1, duration: 2400, useNativeDriver: true }),
                react_native_1.Animated.timing(ripples[1], { toValue: 1, duration: 2400, useNativeDriver: true }),
            ])).start();
        }
        else {
            ripples.forEach(function (r) { return r.setValue(0); });
        }
    }, [visible]);
    var handleDismiss = function () {
        if (onDismiss)
            onDismiss();
    };
    var handleButtonPress = function (onPress) {
        if (onPress)
            onPress();
        handleDismiss();
    };
    var defaultButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: handleDismiss }];
    return (<react_native_1.Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss}>
      <react_native_1.Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Animated ripples in background */}
        {ripples.map(function (ripple, i) {
            var scale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] });
            var opacity = ripple.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.15, 0] });
            return (<react_native_1.Animated.View key={i} style={[
                    styles.ripple,
                    {
                        transform: [{ scale: scale }],
                        opacity: opacity,
                    },
                ]}/>);
        })}

        <react_native_1.Animated.View style={[styles.dialog, { transform: [{ scale: scaleAnim }] }]}>
          {/* Wave decoration at top */}
          <react_native_1.View style={styles.waveDecoration}>
            <react_native_1.Text style={styles.waveIcon}>〰️</react_native_1.Text>
          </react_native_1.View>

          <react_native_1.Text style={styles.title}>{title}</react_native_1.Text>
          <react_native_1.Text style={styles.message}>{message}</react_native_1.Text>

          <react_native_1.View style={styles.buttonContainer}>
            {defaultButtons.map(function (btn, idx) { return (<react_native_1.Pressable key={idx} style={[
                styles.button,
                btn.style === 'cancel' && styles.cancelButton,
                btn.style === 'destructive' && styles.destructiveButton,
                defaultButtons.length === 1 && styles.singleButton,
            ]} onPress={function () { return handleButtonPress(btn.onPress); }}>
                <react_native_1.Text style={[
                styles.buttonText,
                btn.style === 'destructive' && styles.destructiveText,
            ]}>
                  {btn.text}
                </react_native_1.Text>
              </react_native_1.Pressable>); })}
          </react_native_1.View>
        </react_native_1.Animated.View>
      </react_native_1.Animated.View>
    </react_native_1.Modal>);
};
var styles = react_native_1.StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 10, 20, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    ripple: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 2,
        borderColor: '#00C2FF',
    },
    dialog: {
        width: Math.min(SCREEN_WIDTH - 40, 320),
        backgroundColor: '#0A1929',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#00C2FF',
        shadowColor: '#00C2FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    waveDecoration: {
        alignItems: 'center',
        marginBottom: 12,
    },
    waveIcon: {
        fontSize: 24,
        opacity: 0.6,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00C2FF',
        textAlign: 'center',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 194, 255, 0.5)',
        textShadowRadius: 8,
    },
    message: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 194, 255, 0.2)',
        borderWidth: 1,
        borderColor: '#00C2FF',
        alignItems: 'center',
    },
    singleButton: {
        flex: 0,
        minWidth: 120,
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    destructiveButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        borderColor: '#FF3B30',
    },
    buttonText: {
        color: '#00C2FF',
        fontSize: 16,
        fontWeight: '600',
    },
    destructiveText: {
        color: '#FF6B6B',
    },
});
exports.default = OceanDialog;
