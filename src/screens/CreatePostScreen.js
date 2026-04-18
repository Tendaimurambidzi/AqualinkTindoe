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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g.throw = verb(1), g.return = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y.return : op[0] ? y.throw || ((t = y.return) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var react_native_image_picker_1 = require("react-native-image-picker");
var CreatePostScreen = function (_a) {
    var _b, _c, _d;
    var navigation = _a.navigation, route = _a.route;
    var setCapturedMedia = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.setCapturedMedia;
    var handleSDCardPicker = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.handleSDCardPicker;
    var onBackToMakeWaves = (_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.onBackToMakeWaves;
    var handleBack = function () {
        if (typeof onBackToMakeWaves === 'function') {
            onBackToMakeWaves();
        }
        navigation.goBack();
    };
    var pickerOptions = {
        mediaType: 'mixed',
        selectionLimit: 1,
        presentationStyle: 'fullScreen',
        videoQuality: 'medium',
        assetRepresentationMode: 'compatible',
    };
    var handleCamera = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, asset, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, react_native_image_picker_1.launchCamera)(__assign(__assign({}, pickerOptions), { saveToPhotos: true }))];
                case 1:
                    result = _b.sent();
                    if (result.didCancel)
                        return [2 /*return*/];
                    if (result.errorCode) {
                        react_native_1.Alert.alert('Error', result.errorMessage || 'Camera failed');
                        return [2 /*return*/];
                    }
                    asset = (_a = result.assets) === null || _a === void 0 ? void 0 : _a[0];
                    if ((asset === null || asset === void 0 ? void 0 : asset.uri) && setCapturedMedia) {
                        setCapturedMedia(asset);
                        handleBack();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    react_native_1.Alert.alert('Error', 'Failed to open camera');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleGallery = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, asset, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, react_native_image_picker_1.launchImageLibrary)(pickerOptions)];
                case 1:
                    result = _b.sent();
                    if (result.didCancel)
                        return [2 /*return*/];
                    if (result.errorCode) {
                        react_native_1.Alert.alert('Error', result.errorMessage || 'Gallery failed');
                        return [2 /*return*/];
                    }
                    asset = (_a = result.assets) === null || _a === void 0 ? void 0 : _a[0];
                    if ((asset === null || asset === void 0 ? void 0 : asset.uri) && setCapturedMedia) {
                        setCapturedMedia(asset);
                        handleBack();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    react_native_1.Alert.alert('Error', 'Failed to open gallery');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSDCard = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!handleSDCardPicker) return [3 /*break*/, 2];
                    return [4 /*yield*/, handleSDCardPicker()];
                case 1:
                    _a.sent();
                    handleBack();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.title}>Select Media Source</react_native_1.Text>

      <react_native_1.Pressable style={styles.button} onPress={handleCamera}>
        <react_native_1.Text style={styles.icon}>📷</react_native_1.Text>
        <react_native_1.Text style={styles.label}>Camera</react_native_1.Text>
      </react_native_1.Pressable>

      <react_native_1.Pressable style={styles.button} onPress={handleGallery}>
        <react_native_1.Text style={styles.icon}>🖼️</react_native_1.Text>
        <react_native_1.Text style={styles.label}>Gallery</react_native_1.Text>
      </react_native_1.Pressable>

      <react_native_1.Pressable style={styles.button} onPress={handleSDCard}>
        <react_native_1.Text style={styles.icon}>💾</react_native_1.Text>
        <react_native_1.Text style={styles.label}>SD Card</react_native_1.Text>
      </react_native_1.Pressable>

      <react_native_1.Pressable style={styles.cancelButton} onPress={handleBack}>
        <react_native_1.Text style={styles.cancelText}>Back</react_native_1.Text>
      </react_native_1.Pressable>
    </react_native_1.View>);
};
exports.default = CreatePostScreen;
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#0A1929',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    icon: {
        fontSize: 32,
        marginRight: 16,
    },
    label: {
        fontSize: 18,
        color: 'white',
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 16,
        padding: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 16,
    },
});
