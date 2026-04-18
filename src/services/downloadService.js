"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadWave = downloadWave;
exports.shareDriftLink = shareDriftLink;
var react_native_1 = require("react-native");
/**
 * Downloads a wave (video/image) to external storage
 */
function downloadWave(waveId, mediaUrl, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var RNFS, timestamp, extension, finalFileName, downloadResult, downloadDir, downloadPath, downloadPath, cfg, backendBase, e_1, locationMsg, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 12, , 13]);
                    RNFS = void 0;
                    try {
                        RNFS = require('react-native-fs');
                    }
                    catch (e) {
                        react_native_1.Alert.alert('Error', 'Download feature not available. Please update the app.');
                        return [2 /*return*/, false];
                    }
                    timestamp = Date.now();
                    extension = getFileExtension(mediaUrl);
                    finalFileName = fileName || "Drift_Wave_".concat(waveId, "_").concat(timestamp, ".").concat(extension);
                    downloadResult = void 0;
                    if (!(react_native_1.Platform.OS === 'android')) return [3 /*break*/, 2];
                    downloadDir = RNFS.DownloadDirectoryPath || RNFS.ExternalDirectoryPath;
                    downloadPath = "".concat(downloadDir, "/").concat(finalFileName);
                    return [4 /*yield*/, RNFS.downloadFile({
                            fromUrl: mediaUrl,
                            toFile: downloadPath,
                            background: true,
                            discretionary: true,
                            progress: function (res) {
                                var total = Number(res.contentLength || 0);
                                if (!total)
                                    return;
                                var progress = (Number(res.bytesWritten || 0) / total) * 100;
                                console.log("Download progress: ".concat(progress.toFixed(0), "%"));
                            },
                            addAndroidDownloads: {
                                useDownloadManager: true,
                                notification: true,
                                mediaScannable: true,
                                title: finalFileName,
                                description: 'Downloading MoMo',
                                path: downloadPath,
                            },
                        }).promise];
                case 1:
                    downloadResult = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    downloadPath = "".concat(RNFS.DocumentDirectoryPath, "/").concat(finalFileName);
                    return [4 /*yield*/, RNFS.downloadFile({
                            fromUrl: mediaUrl,
                            toFile: downloadPath,
                            background: true,
                            discretionary: true,
                            progress: function (res) {
                                var total = Number(res.contentLength || 0);
                                if (!total)
                                    return;
                                var progress = (Number(res.bytesWritten || 0) / total) * 100;
                                console.log("Download progress: ".concat(progress.toFixed(0), "%"));
                            },
                        }).promise];
                case 3:
                    downloadResult = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!(downloadResult.statusCode === 200)) return [3 /*break*/, 10];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 9]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) return [3 /*break*/, 7];
                    return [4 /*yield*/, fetch("".concat(backendBase, "/wave/download"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ waveId: waveId }),
                        })];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    console.warn('Failed to notify backend of download:', e_1);
                    return [3 /*break*/, 9];
                case 9:
                    locationMsg = react_native_1.Platform.OS === 'ios' ? 'Files app' : 'Downloads folder';
                    react_native_1.Alert.alert('Download Complete', "Wave saved to ".concat(locationMsg, "\n").concat(finalFileName), [{ text: 'OK' }]);
                    return [2 /*return*/, true];
                case 10: throw new Error("Download failed with status ".concat(downloadResult.statusCode));
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    console.error('Download wave error:', error_1);
                    react_native_1.Alert.alert('Download Failed', 'Could not download wave. Please try again.');
                    return [2 /*return*/, false];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get file extension from URL
 */
function getFileExtension(url) {
    var urlLower = url.toLowerCase();
    if (urlLower.includes('.mp4'))
        return 'mp4';
    if (urlLower.includes('.mov'))
        return 'mov';
    if (urlLower.includes('.m4v'))
        return 'm4v';
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg'))
        return 'jpg';
    if (urlLower.includes('.png'))
        return 'png';
    if (urlLower.includes('.webp'))
        return 'webp';
    // Check if URL suggests video or image
    if (urlLower.includes('video'))
        return 'mp4';
    if (urlLower.includes('image'))
        return 'jpg';
    // Default
    return 'mp4';
}
/**
 * Share a drift link
 */
function shareDriftLink(liveId, channel, title) {
    return __awaiter(this, void 0, void 0, function () {
        var Share, shareMessage, cfg, backendBase, response, data, e_2, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    Share = require('react-native').Share;
                    shareMessage = "Join my Drift live session!";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetch("".concat(backendBase, "/drift/share-link"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, channel: channel, title: title }),
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    shareMessage = data.message || shareMessage;
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_2 = _a.sent();
                    console.warn('Failed to get share link from backend:', e_2);
                    // Fallback to basic message
                    shareMessage = "Join my Drift: ".concat(title || 'Live Stream', "!\nChannel: ").concat(channel);
                    return [3 /*break*/, 6];
                case 6: return [4 /*yield*/, Share.share({
                        message: shareMessage,
                        title: title || 'Join my Drift',
                    })];
                case 7:
                    result = _a.sent();
                    if (result.action === Share.sharedAction) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
                case 8:
                    error_2 = _a.sent();
                    console.error('Share drift link error:', error_2);
                    react_native_1.Alert.alert('Share Failed', 'Could not share drift link.');
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    });
}
