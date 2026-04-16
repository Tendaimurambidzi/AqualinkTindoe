"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var crashlyticsService_1 = require("../services/crashlyticsService");
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.handleReload = function () {
            _this.setState({ hasError: false, error: null });
        };
        _this.state = { hasError: false, error: null };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        return { hasError: true, error: error };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, info) {
        console.error('ErrorBoundary caught error:', error);
        console.error('Error info:', info);
        (0, crashlyticsService_1.recordCrashError)(error, {
            source: 'ErrorBoundary',
            componentStack: (info === null || info === void 0 ? void 0 : info.componentStack) || '',
        });
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            return (<react_native_1.View style={styles.container}>
          <react_native_1.View style={styles.card}>
            <react_native_1.Text style={styles.title}>Something went wrong</react_native_1.Text>
            <react_native_1.Text style={styles.message}>
              We hit a problem opening this screen. Please try again.
            </react_native_1.Text>
            <react_native_1.Pressable onPress={this.handleReload} style={function (_a) {
                    var pressed = _a.pressed;
                    return [
                        styles.button,
                        pressed ? styles.buttonPressed : null,
                    ];
                }}>
              <react_native_1.Text style={styles.buttonText}>Try Again</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>
        </react_native_1.View>);
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.default.Component));
exports.default = ErrorBoundary;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#08131f',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 28,
        backgroundColor: 'rgba(11, 25, 39, 0.96)',
        borderWidth: 1,
        borderColor: 'rgba(123, 216, 255, 0.22)',
        alignItems: 'center',
    },
    title: {
        color: '#F5FBFF',
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
    },
    message: {
        marginTop: 10,
        color: '#B8D4E6',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    button: {
        marginTop: 22,
        minWidth: 140,
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 11,
        backgroundColor: '#0F5F8F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPressed: {
        opacity: 0.86,
    },
    buttonText: {
        color: '#F8FDFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
