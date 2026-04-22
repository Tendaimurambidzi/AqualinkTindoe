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
exports.uploadPost = uploadPost;
// src/services/uploadPost.ts
var storage_1 = __importDefault(require("@react-native-firebase/storage"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var functions_1 = __importDefault(require("@react-native-firebase/functions"));
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var react_native_1 = require("react-native");
var react_native_compressor_1 = require("react-native-compressor");
var RNFS = null;
var MAX_SAFE_POST_MEDIA_BYTES = 120 * 1024 * 1024;
var resolveRNFS = function () {
    if (RNFS)
        return RNFS;
    try {
        // eslint-disable-next-line import/no-extraneous-dependencies
        RNFS = require('react-native-fs');
    }
    catch (err) {
        console.warn('react-native-fs is unavailable in uploadPost:', (err === null || err === void 0 ? void 0 : err.message) || err);
        RNFS = null;
    }
    return RNFS;
};
var maybeCompressVideoForUpload = function (localPath, mimeType) { return __awaiter(void 0, void 0, void 0, function () {
    var type, resolvedPath, rnfs, stats, _a, sizeBytes, compressedUri, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                type = String(mimeType || '').toLowerCase();
                if (!type.startsWith('video/'))
                    return [2 /*return*/, localPath];
                resolvedPath = String(localPath || '').trim();
                if (!resolvedPath)
                    return [2 /*return*/, localPath];
                if (react_native_1.Platform.OS === 'android' && resolvedPath.startsWith('file://')) {
                    resolvedPath = resolvedPath.replace('file://', '');
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                rnfs = resolveRNFS();
                if (!rnfs) return [3 /*break*/, 3];
                return [4 /*yield*/, rnfs.stat(resolvedPath)];
            case 2:
                _a = _b.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = null;
                _b.label = 4;
            case 4:
                stats = _a;
                sizeBytes = Math.max(0, Number((stats === null || stats === void 0 ? void 0 : stats.size) || 0));
                // Reduce compression threshold to prevent over-compression
                if (sizeBytes <= 15 * 1024 * 1024) {
                    return [2 /*return*/, resolvedPath];
                }
                return [4 /*yield*/, react_native_compressor_1.Video.compress(react_native_1.Platform.OS === 'android' && !/^file:\/\//i.test(resolvedPath)
                        ? "file://".concat(resolvedPath)
                        : resolvedPath, {
                        compressionMethod: 'auto',
                        maxSize: 1280, // Increased from 960 to reduce compression
                        minimumFileSizeForCompress: 5, // Reduced from 8 to compress smaller files
                        bitrate: 2000000, // Set reasonable bitrate for smooth playback
                    })];
            case 5:
                compressedUri = _b.sent();
                if (!compressedUri) {
                    return [2 /*return*/, resolvedPath];
                }
                return [2 /*return*/, react_native_1.Platform.OS === 'android' && compressedUri.startsWith('file://')
                        ? compressedUri.replace('file://', '')
                        : compressedUri];
            case 6:
                error_1 = _b.sent();
                console.warn('Video compression failed in uploadPost, using original file:', error_1);
                return [2 /*return*/, resolvedPath];
            case 7: return [2 /*return*/];
        }
    });
}); };
var isRecoverableStorageUploadError = function (error) {
    var raw = String((error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error.code) || error || '').toLowerCase();
    return (raw.includes('server has terminated the upload session') ||
        raw.includes('storage/unknown') ||
        raw.includes('network request failed') ||
        raw.includes('retry-limit-exceeded') ||
        raw.includes('timeout') ||
        raw.includes('unavailable'));
};
var uploadFileWithRecovery = function (filePath_1, localPath_1, metadata_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([filePath_1, localPath_1, metadata_1], args_1, true), void 0, function (filePath, localPath, metadata, maxAttempts) {
        var fileRef, lastError, tryRecoverDownloadUrl, _loop_1, attempt, state_1;
        if (maxAttempts === void 0) { maxAttempts = 3; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileRef = (0, storage_1.default)().ref(filePath);
                    lastError = null;
                    tryRecoverDownloadUrl = function () { return __awaiter(void 0, void 0, void 0, function () {
                        var _loop_2, recoveryAttempt, state_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _loop_2 = function (recoveryAttempt) {
                                        var recoveredUrl, _b;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0:
                                                    _c.trys.push([0, 2, , 3]);
                                                    return [4 /*yield*/, fileRef.getDownloadURL()];
                                                case 1:
                                                    recoveredUrl = _c.sent();
                                                    if (recoveredUrl)
                                                        return [2 /*return*/, { value: recoveredUrl }];
                                                    return [3 /*break*/, 3];
                                                case 2:
                                                    _b = _c.sent();
                                                    return [3 /*break*/, 3];
                                                case 3:
                                                    if (!(recoveryAttempt < 3)) return [3 /*break*/, 5];
                                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, recoveryAttempt * 1200); })];
                                                case 4:
                                                    _c.sent();
                                                    _c.label = 5;
                                                case 5: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    recoveryAttempt = 1;
                                    _a.label = 1;
                                case 1:
                                    if (!(recoveryAttempt <= 3)) return [3 /*break*/, 4];
                                    return [5 /*yield**/, _loop_2(recoveryAttempt)];
                                case 2:
                                    state_2 = _a.sent();
                                    if (typeof state_2 === "object")
                                        return [2 /*return*/, state_2.value];
                                    _a.label = 3;
                                case 3:
                                    recoveryAttempt += 1;
                                    return [3 /*break*/, 1];
                                case 4: return [2 /*return*/, null];
                            }
                        });
                    }); };
                    _loop_1 = function (attempt) {
                        var completedUrl, error_2, recoveredUrl;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 6]);
                                    return [4 /*yield*/, fileRef.putFile(localPath, metadata || {})];
                                case 1:
                                    _b.sent();
                                    return [4 /*yield*/, tryRecoverDownloadUrl()];
                                case 2:
                                    completedUrl = _b.sent();
                                    if (completedUrl)
                                        return [2 /*return*/, { value: completedUrl }];
                                    throw new Error('Upload completed but no download URL was available yet.');
                                case 3:
                                    error_2 = _b.sent();
                                    lastError = error_2;
                                    return [4 /*yield*/, tryRecoverDownloadUrl()];
                                case 4:
                                    recoveredUrl = _b.sent();
                                    if (recoveredUrl)
                                        return [2 /*return*/, { value: recoveredUrl }];
                                    if (!isRecoverableStorageUploadError(error_2) || attempt >= maxAttempts) {
                                        throw error_2;
                                    }
                                    console.warn("uploadPost retry ".concat(attempt, " for ").concat(filePath), error_2);
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, Math.min(4000, attempt * 900)); })];
                                case 5:
                                    _b.sent();
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= maxAttempts)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt += 1;
                    return [3 /*break*/, 1];
                case 4: throw lastError || new Error('Upload failed');
            }
        });
    });
};
/**
 * uploadPost
 * - Takes media from image/video picker (optional)
 * - Uploads it to Firebase Storage only if present
 * - Creates a Firestore document in "posts"
 * - Returns { id, mediaUrl }
 */
function uploadPost(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var a, uid, mediaUri, hasMedia, mediaUrl, mediaPath, mediaType, nameGuessRaw, type, sanitizedBase, baseNoExt, ext, filePath, localPath, declaredSize, rnfs, safeExt, copyDest, rnfs, stats, _c, resolvedSize, error_3, uploadContentType, docRef;
        var _d, _e, _f;
        var media = _b.media, caption = _b.caption, link = _b.link, authorName = _b.authorName;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    a = (0, auth_1.default)();
                    uid = (_d = a.currentUser) === null || _d === void 0 ? void 0 : _d.uid;
                    if (!uid) {
                        throw new Error('Please sign in to upload a post.');
                    }
                    mediaUri = String((media === null || media === void 0 ? void 0 : media.uri) || '').trim();
                    hasMedia = Boolean(mediaUri);
                    mediaUrl = null;
                    mediaPath = null;
                    mediaType = (media === null || media === void 0 ? void 0 : media.type) || null;
                    if (!hasMedia) return [3 /*break*/, 11];
                    nameGuessRaw = (media === null || media === void 0 ? void 0 : media.fileName) || 'post';
                    type = ((media === null || media === void 0 ? void 0 : media.type) || '').toLowerCase();
                    sanitizedBase = nameGuessRaw
                        .replace(/[^A-Za-z0-9._-]/g, '_')
                        .replace(/_{2,}/g, '_');
                    baseNoExt = sanitizedBase.includes('.')
                        ? sanitizedBase.substring(0, sanitizedBase.lastIndexOf('.'))
                        : sanitizedBase;
                    ext = sanitizedBase.includes('.')
                        ? sanitizedBase.substring(sanitizedBase.lastIndexOf('.') + 1)
                        : type.startsWith('video/')
                            ? 'mp4'
                            : type.startsWith('image/')
                                ? 'jpg'
                                : 'dat';
                    filePath = "posts/".concat(uid, "/").concat(Date.now(), "_").concat(baseNoExt, ".").concat(ext);
                    localPath = mediaUri;
                    declaredSize = Math.max(0, Number((media === null || media === void 0 ? void 0 : media.fileSize) || 0));
                    if (declaredSize > MAX_SAFE_POST_MEDIA_BYTES) {
                        throw new Error('This media file is too large to upload safely on a phone. Keep it under 120 MB.');
                    }
                    try {
                        localPath = decodeURI(localPath);
                    }
                    catch (_h) { }
                    if (react_native_1.Platform.OS === 'android' && localPath.startsWith('file://')) {
                        localPath = localPath.replace('file://', '');
                    }
                    if (!(react_native_1.Platform.OS === 'android' && /^content:/.test(localPath))) return [3 /*break*/, 2];
                    rnfs = resolveRNFS();
                    if (!rnfs) {
                        throw new Error('react-native-fs is required to upload content:// media on Android.');
                    }
                    safeExt = (ext || (type.startsWith('video/') ? 'mp4' : 'dat')).replace(/[^A-Za-z0-9]/g, '');
                    copyDest = "".concat(rnfs.CachesDirectoryPath, "/post_").concat(Date.now(), ".").concat(safeExt);
                    return [4 /*yield*/, rnfs.copyFile(String(mediaUri), copyDest)];
                case 1:
                    _g.sent();
                    localPath = copyDest;
                    _g.label = 2;
                case 2:
                    if (!localPath) {
                        throw new Error('Could not resolve a local path for the selected media.');
                    }
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 7, , 8]);
                    rnfs = resolveRNFS();
                    if (!rnfs) return [3 /*break*/, 5];
                    return [4 /*yield*/, rnfs.stat(localPath)];
                case 4:
                    _c = _g.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _c = null;
                    _g.label = 6;
                case 6:
                    stats = _c;
                    resolvedSize = Math.max(0, Number((stats === null || stats === void 0 ? void 0 : stats.size) || 0));
                    if (resolvedSize > MAX_SAFE_POST_MEDIA_BYTES) {
                        throw new Error('This media file is too large to upload safely on a phone. Keep it under 120 MB.');
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _g.sent();
                    if (String((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || '').includes('too large')) {
                        throw error_3;
                    }
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, maybeCompressVideoForUpload(localPath, type || mediaType)];
                case 9:
                    localPath = _g.sent();
                    uploadContentType = type && (type.startsWith('video/') || type.startsWith('image/'))
                        ? type
                        : 'application/octet-stream';
                    return [4 /*yield*/, uploadFileWithRecovery(filePath, localPath, {
                            contentType: uploadContentType,
                        })];
                case 10:
                    mediaUrl = _g.sent();
                    mediaPath = filePath;
                    mediaType = type || mediaType;
                    _g.label = 11;
                case 11: return [4 /*yield*/, (0, firestore_1.default)().collection('waves').add({
                        ownerUid: uid,
                        authorId: uid,
                        authorName: authorName || ((_e = a.currentUser) === null || _e === void 0 ? void 0 : _e.displayName) || null,
                        text: caption, // vibes use 'text' for caption
                        link: link || null,
                        mediaUrl: mediaUrl,
                        mediaPath: mediaPath,
                        mediaType: mediaType,
                        createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                        // Add default caption position
                        caption: { x: 0, y: 0 },
                    })];
                case 12:
                    docRef = _g.sent();
                    if (!caption) return [3 /*break*/, 14];
                    return [4 /*yield*/, processMentionsInText(caption, uid, docRef.id, authorName || ((_f = a.currentUser) === null || _f === void 0 ? void 0 : _f.displayName) || 'Someone')];
                case 13:
                    _g.sent();
                    _g.label = 14;
                case 14: return [2 /*return*/, { id: docRef.id, mediaUrl: mediaUrl }];
            }
        });
    });
}
// Helper function to process mentions in text
function processMentionsInText(text, authorUid, waveId, authorName) {
    return __awaiter(this, void 0, void 0, function () {
        var mentionRegex, mentions, match, uniqueMentions, _i, uniqueMentions_1, username, userQuery, userDoc, mentionedUserId, mentionedUserData, addPingFn, error_4, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    mentionRegex = /@([a-zA-Z0-9_-]+)/g;
                    mentions = [];
                    match = void 0;
                    while ((match = mentionRegex.exec(text)) !== null) {
                        mentions.push(match[1]); // Extract username without @
                    }
                    if (mentions.length === 0)
                        return [2 /*return*/];
                    uniqueMentions = __spreadArray([], new Set(mentions), true);
                    _i = 0, uniqueMentions_1 = uniqueMentions;
                    _a.label = 1;
                case 1:
                    if (!(_i < uniqueMentions_1.length)) return [3 /*break*/, 9];
                    username = uniqueMentions_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('users')
                            .where('username', '==', username)
                            .limit(1)
                            .get()];
                case 3:
                    userQuery = _a.sent();
                    if (userQuery.empty) return [3 /*break*/, 6];
                    userDoc = userQuery.docs[0];
                    mentionedUserId = userDoc.id;
                    mentionedUserData = userDoc.data();
                    // Don't send notification to self
                    if (mentionedUserId === authorUid)
                        return [3 /*break*/, 8];
                    addPingFn = (0, functions_1.default)().httpsCallable('addPing');
                    return [4 /*yield*/, addPingFn({
                            recipientUid: mentionedUserId,
                            type: 'mention',
                            waveId: waveId,
                            text: "".concat(authorName, " mentioned you in a post"),
                            fromUid: authorUid,
                            fromName: authorName,
                        })];
                case 4:
                    _a.sent();
                    // Also add to mentions collection for the mentioned user
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("users/".concat(mentionedUserId, "/mentions"))
                            .add({
                            text: "".concat(authorName, " mentioned you in a post"),
                            fromUid: authorUid,
                            fromName: authorName,
                            waveId: waveId,
                            type: 'post_mention',
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                        })];
                case 5:
                    // Also add to mentions collection for the mentioned user
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_4 = _a.sent();
                    console.warn("Failed to process mention for @".concat(username, ":"), error_4);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_5 = _a.sent();
                    console.warn('Error processing mentions:', error_5);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
