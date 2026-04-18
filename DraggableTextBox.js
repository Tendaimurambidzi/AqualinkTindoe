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
var DraggableTextBox = function (_a) {
    var containerWidth = _a.containerWidth, containerHeight = _a.containerHeight, _b = _a.initialX, initialX = _b === void 0 ? 50 : _b, _c = _a.initialY, initialY = _c === void 0 ? 50 : _c, _d = _a.text, text = _d === void 0 ? 'Sonar captions' : _d;
    var _e = (0, react_1.useState)({ x: initialX, y: initialY }), position = _e[0], setPosition = _e[1];
    var lastPosition = (0, react_1.useRef)({ x: initialX, y: initialY });
    var canDragRef = (0, react_1.useRef)(false); // only true after long press
    // Reset position if container size changes (e.g., new media)
    react_1.default.useEffect(function () {
        setPosition({ x: initialX, y: initialY });
        lastPosition.current = { x: initialX, y: initialY };
    }, [containerWidth, containerHeight, initialX, initialY]);
    var clampPos = function (x, y) {
        var padding = 10;
        var clampedX = Math.max(padding, Math.min(x, containerWidth - padding));
        var clampedY = Math.max(padding, Math.min(y, containerHeight - padding));
        return { x: clampedX, y: clampedY };
    };
    var panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: function () { return true; },
        onMoveShouldSetPanResponder: function () { return true; },
        onPanResponderMove: function (_evt, gestureState) {
            if (!canDragRef.current)
                return; // only drag after long press
            var newX = lastPosition.current.x + gestureState.dx;
            var newY = lastPosition.current.y + gestureState.dy;
            var clamped = clampPos(newX, newY);
            setPosition(clamped);
        },
        onPanResponderRelease: function (_evt, gestureState) {
            if (!canDragRef.current)
                return;
            var newX = lastPosition.current.x + gestureState.dx;
            var newY = lastPosition.current.y + gestureState.dy;
            var clamped = clampPos(newX, newY);
            lastPosition.current = clamped;
            setPosition(clamped);
            // lock dragging again until next long press
            canDragRef.current = false;
        },
    })).current;
    // Always clamp position if container size changes
    react_1.default.useEffect(function () {
        setPosition(function (pos) { return clampPos(pos.x, pos.y); });
        lastPosition.current = clampPos(lastPosition.current.x, lastPosition.current.y);
    }, [containerWidth, containerHeight]);
    return (<react_native_1.View {...panResponder.panHandlers} style={[
            styles.boxContainer,
            {
                left: position.x,
                top: position.y,
                zIndex: 10,
            },
        ]} pointerEvents="box-only">
      <react_native_1.Pressable onLongPress={function () {
            // after long press, allow dragging
            canDragRef.current = true;
        }} delayLongPress={250}>
        <react_native_1.View style={styles.textBox}>
          <react_native_1.Text style={styles.text}>{text}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Pressable>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    boxContainer: {
        position: 'absolute',
    },
    textBox: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
exports.default = DraggableTextBox;
