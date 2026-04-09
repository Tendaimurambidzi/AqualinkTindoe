"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
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
exports.ensureVideoCacheDir = ensureVideoCacheDir;
exports.getCachedVideoPath = getCachedVideoPath;
exports.cacheVideo = cacheVideo;
exports.saveVideoManifest = saveVideoManifest;
exports.getVideoManifest = getVideoManifest;
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var react_native_fs_1 = __importDefault(require("react-native-fs"));
var VIDEO_CACHE_DIR = react_native_fs_1.default.CachesDirectoryPath + '/video_cache';
var MANIFEST_CACHE_PREFIX = '@drift_video_manifest_';
function ensureVideoCacheDir() {
    return __awaiter(this, void 0, void 0, function () {
        var exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_fs_1.default.exists(VIDEO_CACHE_DIR)];
                case 1:
                    exists = _a.sent();
                    if (!!exists) return [3 /*break*/, 3];
                    return [4 /*yield*/, react_native_fs_1.default.mkdir(VIDEO_CACHE_DIR)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getCachedVideoPath(url) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, filePath, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileName = encodeURIComponent(url);
                    filePath = "".concat(VIDEO_CACHE_DIR, "/").concat(fileName);
                    return [4 /*yield*/, react_native_fs_1.default.exists(filePath)];
                case 1:
                    exists = _a.sent();
                    return [2 /*return*/, exists ? filePath : null];
            }
        });
    });
}
function cacheVideo(url) {
    return __awaiter(this, void 0, void 0, function () {
        var fileName, filePath, exists, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureVideoCacheDir()];
                case 1:
                    _a.sent();
                    fileName = encodeURIComponent(url);
                    filePath = "".concat(VIDEO_CACHE_DIR, "/").concat(fileName);
                    return [4 /*yield*/, react_native_fs_1.default.exists(filePath)];
                case 2:
                    exists = _a.sent();
                    if (exists)
                        return [2 /*return*/, filePath];
                    return [4 /*yield*/, react_native_fs_1.default.downloadFile({ fromUrl: url, toFile: filePath }).promise];
                case 3:
                    result = _a.sent();
                    if (result.statusCode === 200)
                        return [2 /*return*/, filePath];
                    throw new Error('Failed to cache video');
            }
        });
    });
}
function saveVideoManifest(videoId, manifest) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, async_storage_1.default.setItem("".concat(MANIFEST_CACHE_PREFIX).concat(videoId), JSON.stringify(manifest))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.warn('Failed to cache video manifest', err_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getVideoManifest(videoId) {
    return __awaiter(this, void 0, void 0, function () {
        var stored, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, async_storage_1.default.getItem("".concat(MANIFEST_CACHE_PREFIX).concat(videoId))];
                case 1:
                    stored = _a.sent();
                    if (!stored)
                        return [2 /*return*/, null];
                    return [2 /*return*/, JSON.parse(stored)];
                case 2:
                    err_2 = _a.sent();
                    console.warn('Failed to load cached video manifest', err_2);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
