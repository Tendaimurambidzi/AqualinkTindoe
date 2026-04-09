"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var SectionHeaderRow = function (_a) {
    var title = _a.title, actionLabel = _a.actionLabel, onActionPress = _a.onActionPress, containerStyle = _a.containerStyle, titleStyle = _a.titleStyle, actionStyle = _a.actionStyle;
    return (<react_native_1.View style={containerStyle}>
      <react_native_1.Text style={titleStyle}>{title}</react_native_1.Text>
      {actionLabel && onActionPress ? (<react_native_1.Pressable onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <react_native_1.Text style={actionStyle}>{actionLabel}</react_native_1.Text>
        </react_native_1.Pressable>) : null}
    </react_native_1.View>);
};
exports.default = SectionHeaderRow;
