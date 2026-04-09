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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DraggableTextBox;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
function DraggableTextBox(_a) {
    var text = _a.text, _b = _a.initialX, initialX = _b === void 0 ? 24 : _b, _c = _a.initialY, initialY = _c === void 0 ? 100 : _c, containerWidth = _a.containerWidth, containerHeight = _a.containerHeight, onPositionChange = _a.onPositionChange;
    var pan = (0, react_1.useRef)(new react_native_1.Animated.ValueXY({ x: initialX, y: initialY })).current;
    var lastPosition = (0, react_1.useRef)({ x: initialX, y: initialY });
    var panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: function () { return true; },
        onMoveShouldSetPanResponder: function () { return true; },
        onPanResponderGrant: function () {
            pan.setOffset({
                x: lastPosition.current.x,
                y: lastPosition.current.y,
            });
            pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: react_native_1.Animated.event([null, { dx: pan.x, dy: pan.y }], {
            useNativeDriver: false,
        }),
        onPanResponderRelease: function (_, gesture) {
            pan.flattenOffset();
            // Calculate final position
            var finalX = lastPosition.current.x + gesture.dx;
            var finalY = lastPosition.current.y + gesture.dy;
            // Constrain within bounds (with padding)
            var textBoxWidth = 200; // Approximate width
            var textBoxHeight = 60; // Approximate height
            var padding = 10;
            finalX = Math.max(padding, Math.min(containerWidth - textBoxWidth - padding, finalX));
            finalY = Math.max(padding, Math.min(containerHeight - textBoxHeight - padding, finalY));
            // Update position
            lastPosition.current = { x: finalX, y: finalY };
            // Animate to constrained position
            react_native_1.Animated.spring(pan, {
                toValue: { x: finalX, y: finalY },
                useNativeDriver: false,
                tension: 50,
                friction: 7,
            }).start();
            // Notify parent
            onPositionChange === null || onPositionChange === void 0 ? void 0 : onPositionChange(finalX, finalY);
        },
    })).current;
    return (<react_native_1.Animated.View {...panResponder.panHandlers} style={[
            styles.draggable,
            {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
        ]}>
      <react_native_1.View style={styles.textContainer}>
        <react_native_1.Text style={styles.text}>{text}</react_native_1.Text>
      </react_native_1.View>
    </react_native_1.Animated.View>);
}
var styles = react_native_1.StyleSheet.create({
    draggable: {
        position: 'absolute',
        zIndex: 1000,
    },
    textContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minWidth: 100,
        maxWidth: 300,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
