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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextOverlayPresetStyle = exports.defaultMediaEdits = void 0;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_image_crop_picker_1 = __importDefault(require("react-native-image-crop-picker"));
var RNVideo = null;
try {
    RNVideo = require('react-native-video').default;
}
catch (_a) { }
exports.defaultMediaEdits = {
    filter: 'none',
    brightness: 0,
    contrast: 0,
    vignette: 0,
    mirror: false,
    flipVertical: false,
    playbackRate: 1,
    volumeBoost: 1,
    voiceMode: 'normal',
    stickers: [],
    textOverlay: null,
    mediaTextOverlays: [],
};
var getTextOverlayPresetStyle = function (overlay) {
    var preset = (overlay === null || overlay === void 0 ? void 0 : overlay.stylePreset) || 'plain';
    switch (preset) {
        case 'white_on_black':
            return {
                textColor: '#FFFFFF',
                backgroundColor: '#0B0F17',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 14,
                shadow: false,
            };
        case 'black_on_white':
            return {
                textColor: '#0B0F17',
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 14,
                shadow: false,
            };
        case 'soft_box':
            return {
                textColor: '#F8FBFF',
                backgroundColor: 'rgba(9, 16, 28, 0.62)',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 16,
                shadow: true,
            };
        case 'highlight':
            return {
                textColor: '#201200',
                backgroundColor: '#FFD36C',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 16,
                shadow: false,
            };
        case 'blue_glow':
            return {
                textColor: '#F4FBFF',
                backgroundColor: 'rgba(0, 119, 200, 0.42)',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 18,
                shadow: true,
                animationPreset: 'pulse',
            };
        case 'rounded_bubble':
            return {
                textColor: '#172033',
                backgroundColor: '#EAF7FF',
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 999,
                shadow: true,
                animationPreset: 'none',
            };
        case 'rugged_label':
            return {
                textColor: '#FFF6DA',
                backgroundColor: '#773F14',
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 8,
                shadow: true,
                animationPreset: 'none',
            };
        case 'sunset_chip':
            return {
                textColor: '#FFF8F1',
                backgroundColor: '#C24E24',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 22,
                shadow: true,
                animationPreset: 'none',
            };
        case 'pulse_round':
            return {
                textColor: '#F5FBFF',
                backgroundColor: 'rgba(18, 68, 148, 0.78)',
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 999,
                shadow: true,
                animationPreset: 'pulse',
            };
        case 'float_cloud':
            return {
                textColor: '#10324D',
                backgroundColor: 'rgba(255,255,255,0.92)',
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 20,
                shadow: true,
                animationPreset: 'float',
            };
        case 'neon_pink':
            return {
                textColor: '#FFF6FF',
                backgroundColor: 'rgba(255, 45, 129, 0.78)',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 18,
                shadow: true,
                animationPreset: 'pulse',
            };
        case 'mint_frame':
            return {
                textColor: '#042B24',
                backgroundColor: '#B8FFE6',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                shadow: false,
            };
        case 'noir_stripe':
            return {
                textColor: '#FFFFFF',
                backgroundColor: 'rgba(0,0,0,0.82)',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 6,
                shadow: true,
            };
        case 'royal_badge':
            return {
                textColor: '#FFF8DF',
                backgroundColor: '#3521A1',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 999,
                shadow: true,
            };
        case 'coral_tag':
            return {
                textColor: '#FFF9F5',
                backgroundColor: '#FF6F61',
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 10,
                shadow: true,
            };
        case 'midnight_glass':
            return {
                textColor: '#EAF6FF',
                backgroundColor: 'rgba(11, 23, 41, 0.62)',
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 18,
                shadow: true,
            };
        case 'lemon_pop':
            return {
                textColor: '#292100',
                backgroundColor: '#FFF06A',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 999,
                shadow: false,
            };
        case 'lilac_mist':
            return {
                textColor: '#2A1847',
                backgroundColor: '#E8D7FF',
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 16,
                shadow: true,
            };
        case 'ocean_stamp':
            return {
                textColor: '#EFFFFF',
                backgroundColor: '#007C91',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                shadow: true,
            };
        case 'pearl_pill':
            return {
                textColor: '#21303D',
                backgroundColor: '#F6FBFF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                shadow: true,
            };
        case 'danger_tape':
            return {
                textColor: '#1A1300',
                backgroundColor: '#FFC83D',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 4,
                shadow: false,
            };
        case 'cinema_bar':
            return {
                textColor: '#FFF8F2',
                backgroundColor: '#3A1108',
                paddingHorizontal: 22,
                paddingVertical: 9,
                borderRadius: 2,
                shadow: true,
            };
        case 'aqua_outline':
            return {
                textColor: '#E9FDFF',
                backgroundColor: 'rgba(0, 194, 255, 0.18)',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 18,
                shadow: true,
                animationPreset: 'pulse',
            };
        case 'cherry_chip':
            return {
                textColor: '#FFF7FA',
                backgroundColor: '#B42348',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 22,
                shadow: true,
            };
        case 'gold_frame':
            return {
                textColor: '#2D1F00',
                backgroundColor: '#F8D77B',
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 12,
                shadow: true,
            };
        case 'storm_panel':
            return {
                textColor: '#F3F7FF',
                backgroundColor: '#32435E',
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 14,
                shadow: true,
                animationPreset: 'float',
            };
        case 'plain':
        default:
            return {
                textColor: '#FFFFFF',
                backgroundColor: 'transparent',
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 0,
                shadow: true,
                animationPreset: 'none',
            };
    }
};
exports.getTextOverlayPresetStyle = getTextOverlayPresetStyle;
var isImage = function (m) {
    return !!m &&
        String(m.mime || m.type || '')
            .toLowerCase()
            .startsWith('image/');
};
var isVideo = function (m) {
    return !!m &&
        String(m.mime || m.type || '')
            .toLowerCase()
            .startsWith('video/');
};
var toAsset = function (m) { return ({
    uri: String(m.path || ''),
    type: m.mime || undefined,
    fileName: m.filename || (m.path ? String(m.path).split('/').pop() : undefined),
    fileSize: typeof m.size === 'number' ? m.size : undefined,
    width: typeof m.width === 'number' ? m.width : undefined,
    height: typeof m.height === 'number' ? m.height : undefined,
    duration: typeof m.duration === 'number' && Number.isFinite(m.duration)
        ? Math.round(m.duration)
        : undefined,
}); };
var FILTERS = ['none', 'warm', 'cool', 'mono', 'vivid'];
var FUNNY_EMOJIS = ["\uD83E\uDD21", "\uD83E\uDD78", "\uD83D\uDE0E", "\uD83D\uDC35", "\uD83D\uDC7D", "\uD83E\uDD84", "\uD83D\uDC38", "\uD83D\uDC7A", "\uD83E\uDD2A", "\uD83D\uDC19", "\uD83E\uDD16", "\uD83D\uDC7B"];
var VOICE_PRESETS = [
    { id: 'normal', label: 'Voice: Normal', rate: 1, volume: 1 },
    { id: 'chipmunk', label: 'Voice: Chipmunk', rate: 1.3, volume: 1 },
    { id: 'deep', label: 'Voice: Deep', rate: 0.82, volume: 1.15 },
    { id: 'robot', label: 'Voice: Robot', rate: 1.08, volume: 1.3 },
];
var filterOverlayStyle = function (filter) {
    switch (filter) {
        case 'warm':
            return { backgroundColor: 'rgba(255,155,84,0.20)' };
        case 'cool':
            return { backgroundColor: 'rgba(90,170,255,0.18)' };
        case 'mono':
            return { backgroundColor: 'rgba(0,0,0,0.30)' };
        case 'vivid':
            return { backgroundColor: 'rgba(255,0,120,0.10)' };
        default:
            return null;
    }
};
var MediaEditor = function (_a) {
    var _b;
    var visible = _a.visible, initialMedia = _a.initialMedia, _c = _a.initialEdits, initialEdits = _c === void 0 ? exports.defaultMediaEdits : _c, onApply = _a.onApply, onClose = _a.onClose;
    var _d = (0, react_1.useState)(initialMedia), media = _d[0], setMedia = _d[1];
    var _e = (0, react_1.useState)(false), busy = _e[0], setBusy = _e[1];
    var _f = (0, react_1.useState)("\uD83E\uDD21"), selectedEmoji = _f[0], setSelectedEmoji = _f[1];
    var _g = (0, react_1.useState)(52), stickerSize = _g[0], setStickerSize = _g[1];
    var _h = (0, react_1.useState)(null), selectedStickerId = _h[0], setSelectedStickerId = _h[1];
    var _j = (0, react_1.useState)(initialEdits), edits = _j[0], setEdits = _j[1];
    (0, react_1.useEffect)(function () {
        if (visible) {
            setMedia(initialMedia);
            setEdits(initialEdits || exports.defaultMediaEdits);
            setSelectedStickerId(null);
            setStickerSize(52);
        }
    }, [visible, initialMedia, initialEdits]);
    var canCrop = (0, react_1.useMemo)(function () { return isImage(media); }, [media]);
    var canRotate = (0, react_1.useMemo)(function () { return isImage(media); }, [media]);
    var canApply = !!(media === null || media === void 0 ? void 0 : media.uri);
    var pickMedia = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setBusy(true);
                    return [4 /*yield*/, react_native_image_crop_picker_1.default.openPicker({
                            mediaType: 'any',
                        })];
                case 1:
                    result = (_a.sent());
                    if (result === null || result === void 0 ? void 0 : result.path) {
                        setMedia(toAsset(result));
                        setEdits(exports.defaultMediaEdits);
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_1 = _a.sent();
                    if ((err_1 === null || err_1 === void 0 ? void 0 : err_1.code) !== 'E_PICKER_CANCELLED') {
                        react_native_1.Alert.alert('Media Error', (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Could not pick media.');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var cropPreset = function (preset) { return __awaiter(void 0, void 0, void 0, function () {
        var width, height, cropped, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(media === null || media === void 0 ? void 0 : media.uri) || !canCrop)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setBusy(true);
                    width = preset === 'story' ? 1080 : preset === 'square' ? 1080 : media.width || 1200;
                    height = preset === 'story' ? 1920 : preset === 'square' ? 1080 : media.height || 1200;
                    return [4 /*yield*/, react_native_image_crop_picker_1.default.openCropper({
                            path: media.uri,
                            mediaType: 'photo',
                            width: width,
                            height: height,
                            cropping: true,
                            freeStyleCropEnabled: preset === 'free',
                            compressImageQuality: 0.95,
                        })];
                case 2:
                    cropped = (_a.sent());
                    if (cropped === null || cropped === void 0 ? void 0 : cropped.path)
                        setMedia(toAsset(cropped));
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    if ((err_2 === null || err_2 === void 0 ? void 0 : err_2.code) !== 'E_PICKER_CANCELLED') {
                        react_native_1.Alert.alert('Crop Error', (err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || 'Could not crop media.');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var rotateMedia = function () { return __awaiter(void 0, void 0, void 0, function () {
        var rotated, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(media === null || media === void 0 ? void 0 : media.uri) || !canRotate)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    setBusy(true);
                    return [4 /*yield*/, react_native_image_crop_picker_1.default.openCropper({
                            path: media.uri,
                            mediaType: 'photo',
                            width: media.width || 1080,
                            height: media.height || 1080,
                            cropping: true,
                            freeStyleCropEnabled: true,
                            enableRotationGesture: true,
                            compressImageQuality: 0.95,
                        })];
                case 2:
                    rotated = (_a.sent());
                    if (rotated === null || rotated === void 0 ? void 0 : rotated.path)
                        setMedia(toAsset(rotated));
                    return [3 /*break*/, 5];
                case 3:
                    err_3 = _a.sent();
                    if ((err_3 === null || err_3 === void 0 ? void 0 : err_3.code) !== 'E_PICKER_CANCELLED') {
                        react_native_1.Alert.alert('Rotate Error', (err_3 === null || err_3 === void 0 ? void 0 : err_3.message) || 'Could not rotate media.');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var addStickerAt = function (xRatio, yRatio) {
        var id = "".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7));
        setEdits(function (prev) { return (__assign(__assign({}, prev), { stickers: __spreadArray(__spreadArray([], prev.stickers, true), [
                {
                    id: id,
                    emoji: selectedEmoji,
                    x: Math.max(0, Math.min(1, xRatio)),
                    y: Math.max(0, Math.min(1, yRatio)),
                    size: stickerSize,
                    rotation: 0,
                },
            ], false) })); });
        setSelectedStickerId(id);
    };
    var updateSelectedSticker = function (updater) {
        setEdits(function (prev) {
            if (!selectedStickerId)
                return prev;
            return __assign(__assign({}, prev), { stickers: prev.stickers.map(function (s) { return (s.id === selectedStickerId ? updater(s) : s); }) });
        });
    };
    var nudgeSelectedSticker = function (dx, dy) {
        updateSelectedSticker(function (s) { return (__assign(__assign({}, s), { x: Math.max(0, Math.min(1, s.x + dx)), y: Math.max(0, Math.min(1, s.y + dy)) })); });
    };
    var changeSelectedRotation = function (delta) {
        updateSelectedSticker(function (s) { return (__assign(__assign({}, s), { rotation: ((s.rotation || 0) + delta) % 360 })); });
    };
    var applyStickerSize = function (next) {
        var clamped = Math.max(32, Math.min(120, next));
        setStickerSize(clamped);
        updateSelectedSticker(function (s) { return (__assign(__assign({}, s), { size: clamped })); });
    };
    var duplicateSelectedSticker = function () {
        setEdits(function (prev) {
            if (!selectedStickerId)
                return prev;
            var target = prev.stickers.find(function (s) { return s.id === selectedStickerId; });
            if (!target)
                return prev;
            var id = "".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7));
            var dup = __assign(__assign({}, target), { id: id, x: Math.max(0.05, Math.min(0.95, target.x + 0.07)), y: Math.max(0.05, Math.min(0.95, target.y + 0.07)) });
            setSelectedStickerId(id);
            return __assign(__assign({}, prev), { stickers: __spreadArray(__spreadArray([], prev.stickers, true), [dup], false) });
        });
    };
    var removeSelectedSticker = function () {
        if (!selectedStickerId)
            return;
        setEdits(function (prev) { return (__assign(__assign({}, prev), { stickers: prev.stickers.filter(function (s) { return s.id !== selectedStickerId; }) })); });
        setSelectedStickerId(null);
    };
    var addFacePack = function () {
        var baseSize = Math.max(42, stickerSize);
        var points = [
            { x: 0.38, y: 0.38, emoji: selectedEmoji, size: baseSize },
            { x: 0.62, y: 0.38, emoji: selectedEmoji, size: baseSize },
            { x: 0.5, y: 0.6, emoji: "\uD83E\uDD2A", size: Math.round(baseSize * 1.15) },
        ];
        setEdits(function (prev) { return (__assign(__assign({}, prev), { stickers: __spreadArray(__spreadArray([], prev.stickers, true), points.map(function (p) { return ({
                id: "".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 7)),
                x: p.x,
                y: p.y,
                emoji: p.emoji,
                size: p.size,
                rotation: 0,
            }); }), true) })); });
    };
    var cycleVoice = function () {
        setEdits(function (prev) {
            var current = prev.voiceMode || 'normal';
            var index = Math.max(0, VOICE_PRESETS.findIndex(function (v) { return v.id === current; }));
            var next = VOICE_PRESETS[(index + 1) % VOICE_PRESETS.length];
            return __assign(__assign({}, prev), { voiceMode: next.id, playbackRate: next.rate, volumeBoost: next.volume });
        });
    };
    return (<react_native_1.Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <react_native_1.View style={styles.backdrop}>
        <react_native_1.View style={styles.sheet}>
          <react_native_1.Text style={styles.title}>Media Editor</react_native_1.Text>
          <react_native_1.ScrollView contentContainerStyle={styles.content}>
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>Frame</react_native_1.Text>
              <react_native_1.View style={styles.toolRow}>
                <react_native_1.Pressable style={styles.chip} onPress={pickMedia} disabled={busy}>
                  <react_native_1.Text style={styles.chipText}>Pick</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !canCrop && styles.disabled]} onPress={function () { return cropPreset('square'); }} disabled={!canCrop || busy}>
                  <react_native_1.Text style={styles.chipText}>1:1</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !canCrop && styles.disabled]} onPress={function () { return cropPreset('story'); }} disabled={!canCrop || busy}>
                  <react_native_1.Text style={styles.chipText}>9:16</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !canCrop && styles.disabled]} onPress={function () { return cropPreset('free'); }} disabled={!canCrop || busy}>
                  <react_native_1.Text style={styles.chipText}>Free Crop</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !canRotate && styles.disabled]} onPress={rotateMedia} disabled={!canRotate || busy}>
                  <react_native_1.Text style={styles.chipText}>Rotate</react_native_1.Text>
                </react_native_1.Pressable>
              </react_native_1.View>
            </react_native_1.View>

            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>Look</react_native_1.Text>
              <react_native_1.View style={styles.toolRow}>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { mirror: !prev.mirror })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Mirror</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { flipVertical: !prev.flipVertical })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Flip Y</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { filter: FILTERS[(FILTERS.indexOf(prev.filter) + 1) % FILTERS.length] })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Filter: {edits.filter}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { brightness: Math.max(-40, prev.brightness - 10) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>-Light</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { brightness: Math.min(40, prev.brightness + 10) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>+Light</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () { return setEdits(function (prev) { return (__assign(__assign({}, prev), { brightness: 0 })); }); }}>
                  <react_native_1.Text style={styles.chipText}>Reset Light</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { contrast: Math.max(-40, Number(prev.contrast || 0) - 10) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>-Contrast</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { contrast: Math.min(40, Number(prev.contrast || 0) + 10) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>+Contrast</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { vignette: Math.max(0, Number(prev.vignette || 0) - 10) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>-Vignette</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { vignette: Math.min(60, Number(prev.vignette || 0) + 10) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>+Vignette</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { playbackRate: Math.max(0.5, Number((Number(prev.playbackRate || 1) - 0.1).toFixed(2))) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Speed -</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { playbackRate: Math.min(2, Number((Number(prev.playbackRate || 1) + 0.1).toFixed(2))) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Speed +</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { volumeBoost: Math.max(0, Number((Number(prev.volumeBoost || 1) - 0.1).toFixed(2))) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Vol -</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { volumeBoost: Math.min(2, Number((Number(prev.volumeBoost || 1) + 0.1).toFixed(2))) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Vol +</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={cycleVoice}>
                  <react_native_1.Text style={styles.chipText}>Voice FX</react_native_1.Text>
                </react_native_1.Pressable>
              </react_native_1.View>
              <react_native_1.Text style={styles.hint}>
                Speed {Number(edits.playbackRate || 1).toFixed(2)}x | Volume {Number(edits.volumeBoost || 1).toFixed(2)}x | {((_b = VOICE_PRESETS.find(function (v) { return v.id === (edits.voiceMode || 'normal'); })) === null || _b === void 0 ? void 0 : _b.label) || 'Voice: Normal'}
              </react_native_1.Text>
            </react_native_1.View>

            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>Funny Face Studio</react_native_1.Text>
              <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                {FUNNY_EMOJIS.map(function (emoji) { return (<react_native_1.Pressable key={emoji} style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiSelected]} onPress={function () { return setSelectedEmoji(emoji); }}>
                    <react_native_1.Text style={styles.emojiText}>{emoji}</react_native_1.Text>
                  </react_native_1.Pressable>); })}
              </react_native_1.ScrollView>

              <react_native_1.View style={styles.toolRow}>
                <react_native_1.Pressable style={styles.chip} onPress={function () { return addStickerAt(Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1); }}>
                  <react_native_1.Text style={styles.chipText}>Random Funny</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={addFacePack}>
                  <react_native_1.Text style={styles.chipText}>Face Pack</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () { return applyStickerSize(stickerSize - 6); }}>
                  <react_native_1.Text style={styles.chipText}>Sticker -</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () { return applyStickerSize(stickerSize + 6); }}>
                  <react_native_1.Text style={styles.chipText}>Sticker +</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={duplicateSelectedSticker} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Duplicate</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={removeSelectedSticker} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Remove</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={function () { return changeSelectedRotation(-15); }} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Rotate -</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={function () { return changeSelectedRotation(15); }} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Rotate +</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={function () { return nudgeSelectedSticker(0, -0.02); }} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Move Up</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={function () { return nudgeSelectedSticker(0, 0.02); }} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Move Down</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={function () { return nudgeSelectedSticker(-0.02, 0); }} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Move Left</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, !selectedStickerId && styles.disabled]} onPress={function () { return nudgeSelectedSticker(0.02, 0); }} disabled={!selectedStickerId}>
                  <react_native_1.Text style={styles.chipText}>Move Right</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, edits.stickers.length === 0 && styles.disabled]} onPress={function () {
            return setEdits(function (prev) { return (__assign(__assign({}, prev), { stickers: prev.stickers.slice(0, -1) })); });
        }}>
                  <react_native_1.Text style={styles.chipText}>Undo Sticker</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.chip, edits.stickers.length === 0 && styles.disabled]} onPress={function () {
            setEdits(function (prev) { return (__assign(__assign({}, prev), { stickers: [] })); });
            setSelectedStickerId(null);
        }}>
                  <react_native_1.Text style={styles.chipText}>Clear Stickers</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.chip} onPress={function () {
            setEdits(exports.defaultMediaEdits);
            setSelectedStickerId(null);
            setStickerSize(52);
        }}>
                  <react_native_1.Text style={styles.chipText}>Reset All</react_native_1.Text>
                </react_native_1.Pressable>
              </react_native_1.View>
            </react_native_1.View>

            {(media === null || media === void 0 ? void 0 : media.uri) ? (<react_native_1.Pressable style={styles.previewWrap} onPress={function (e) {
                var _a = e.nativeEvent, locationX = _a.locationX, locationY = _a.locationY;
                addStickerAt(locationX / 320, locationY / 320);
            }}>
                <react_native_1.View style={{
                flex: 1,
                transform: [
                    { scaleX: edits.mirror ? -1 : 1 },
                    { scaleY: edits.flipVertical ? -1 : 1 },
                ],
            }}>
                  {isImage(media) ? (<react_native_1.Image source={{ uri: media.uri }} style={styles.preview} resizeMode="contain"/>) : isVideo(media) && RNVideo ? (<RNVideo source={{ uri: String(media.uri) }} style={styles.preview} controls paused rate={Math.max(0.5, Math.min(2, Number(edits.playbackRate || 1)))} volume={Math.max(0, Math.min(2, Number(edits.volumeBoost || 1)))} resizeMode="contain"/>) : (<react_native_1.Text style={styles.hint}>Preview unavailable for this format.</react_native_1.Text>)}
                </react_native_1.View>

                {filterOverlayStyle(edits.filter) ? (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFillObject, filterOverlayStyle(edits.filter)]} pointerEvents="none"/>) : null}
                {edits.brightness !== 0 ? (<react_native_1.View style={[
                    react_native_1.StyleSheet.absoluteFillObject,
                    {
                        backgroundColor: edits.brightness > 0
                            ? "rgba(255,255,255,".concat(Math.min(0.4, edits.brightness / 100), ")")
                            : "rgba(0,0,0,".concat(Math.min(0.45, Math.abs(edits.brightness) / 90), ")"),
                    },
                ]} pointerEvents="none"/>) : null}
                {Number(edits.contrast || 0) !== 0 ? (<react_native_1.View style={[
                    react_native_1.StyleSheet.absoluteFillObject,
                    {
                        backgroundColor: Number(edits.contrast) > 0
                            ? "rgba(255,255,255,".concat(Math.min(0.22, Number(edits.contrast) / 260), ")")
                            : "rgba(0,0,0,".concat(Math.min(0.28, Math.abs(Number(edits.contrast)) / 220), ")"),
                    },
                ]} pointerEvents="none"/>) : null}
                {Number(edits.vignette || 0) > 0 ? (<react_native_1.View style={[
                    react_native_1.StyleSheet.absoluteFillObject,
                    {
                        backgroundColor: "rgba(0,0,0,".concat(Math.min(0.34, Number(edits.vignette) / 180), ")"),
                    },
                ]} pointerEvents="none"/>) : null}
                {edits.stickers.map(function (s) { return (<react_native_1.Text key={s.id} onPress={function () {
                    setSelectedStickerId(s.id);
                    setStickerSize(s.size || 52);
                }} style={{
                    position: 'absolute',
                    left: "".concat(s.x * 100, "%"),
                    top: "".concat(s.y * 100, "%"),
                    fontSize: s.size,
                    transform: [
                        { translateX: -s.size / 2 },
                        { translateY: -s.size / 2 },
                        { rotate: "".concat(s.rotation || 0, "deg") },
                    ],
                    borderWidth: selectedStickerId === s.id ? 1 : 0,
                    borderColor: '#8be9ff',
                    borderRadius: 6,
                }}>
                    {s.emoji}
                  </react_native_1.Text>); })}
              </react_native_1.Pressable>) : (<react_native_1.Text style={styles.hint}>Select a photo or video first.</react_native_1.Text>)}
            <react_native_1.Text style={styles.hint}>
              Tap preview to place stickers. Tap a sticker to edit size, move, rotate, or duplicate.
            </react_native_1.Text>
            {busy ? <react_native_1.ActivityIndicator color="#00C2FF" style={{ marginTop: 8 }}/> : null}
          </react_native_1.ScrollView>

          <react_native_1.View style={styles.footer}>
            <react_native_1.Pressable style={[styles.footerBtn, styles.cancel]} onPress={onClose} disabled={busy}>
              <react_native_1.Text style={styles.footerText}>Close</react_native_1.Text>
            </react_native_1.Pressable>
            <react_native_1.Pressable style={[styles.footerBtn, !canApply && styles.disabled]} onPress={function () {
            if (!media)
                return;
            onApply(media, edits);
            onClose();
        }} disabled={!canApply || busy}>
              <react_native_1.Text style={styles.footerText}>Apply</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
};
var styles = react_native_1.StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.70)',
        justifyContent: 'center',
        padding: 10,
    },
    sheet: {
        backgroundColor: '#091722',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        maxHeight: '92%',
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 10,
    },
    content: {
        padding: 10,
        paddingBottom: 14,
    },
    section: {
        marginTop: 9,
        backgroundColor: 'rgba(10,43,61,0.35)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(139,233,255,0.18)',
        padding: 9,
    },
    sectionTitle: {
        color: '#8be9ff',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 2,
        fontWeight: '700',
    },
    toolRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    chip: {
        backgroundColor: '#00B4EA',
        borderRadius: 14,
        paddingHorizontal: 9,
        paddingVertical: 6,
    },
    chipText: {
        color: '#032534',
        fontSize: 10,
        fontWeight: '700',
    },
    emojiRow: {
        marginTop: 6,
    },
    emojiBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#123447',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 7,
    },
    emojiSelected: {
        borderWidth: 2,
        borderColor: '#00B4EA',
    },
    emojiText: {
        fontSize: 24,
    },
    previewWrap: {
        width: 320,
        height: 320,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#05101a',
        alignSelf: 'center',
        marginTop: 10,
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    hint: {
        color: 'rgba(255,255,255,0.82)',
        marginTop: 7,
        textAlign: 'center',
        fontSize: 12,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.16)',
    },
    footerBtn: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 10,
        backgroundColor: '#00B4EA',
        alignItems: 'center',
    },
    cancel: {
        backgroundColor: '#6a7f95',
    },
    footerText: {
        color: '#032534',
        fontWeight: '700',
    },
    disabled: {
        opacity: 0.45,
    },
});
exports.default = MediaEditor;
