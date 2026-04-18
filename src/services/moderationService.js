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
exports.blockUser = blockUser;
exports.unblockUser = unblockUser;
exports.muteUser = muteUser;
exports.unmuteUser = unmuteUser;
exports.removeFromDrift = removeFromDrift;
exports.getViewerCount = getViewerCount;
exports.notifyViewerJoin = notifyViewerJoin;
exports.notifyViewerLeave = notifyViewerLeave;
exports.getBlockedUsers = getBlockedUsers;
var react_native_1 = require("react-native");
/**
 * Block a user
 */
function blockUser(uid, targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Error', 'Backend not configured');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/block-user"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uid: uid, targetUid: targetUid }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('User Blocked', 'User has been blocked successfully');
                        return [2 /*return*/, true];
                    }
                    else {
                        react_native_1.Alert.alert('Block Failed', 'Could not block user');
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Block user error:', error_1);
                    react_native_1.Alert.alert('Error', 'Could not block user. Please try again.');
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Unblock a user
 */
function unblockUser(uid, targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Error', 'Backend not configured');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/unblock-user"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uid: uid, targetUid: targetUid }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('User Unblocked', 'User has been unblocked');
                        return [2 /*return*/, true];
                    }
                    else {
                        react_native_1.Alert.alert('Unblock Failed', 'Could not unblock user');
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Unblock user error:', error_2);
                    react_native_1.Alert.alert('Error', 'Could not unblock user. Please try again.');
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Mute a user in drift
 */
function muteUser(liveId_1, targetUid_1) {
    return __awaiter(this, arguments, void 0, function (liveId, targetUid, duration) {
        var cfg, backendBase, response, result, minutes, error_3;
        if (duration === void 0) { duration = 300; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Error', 'Backend not configured');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/mute-user"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, targetUid: targetUid, duration: duration }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        minutes = Math.floor(duration / 60);
                        react_native_1.Alert.alert('User Muted', "User has been muted for ".concat(minutes, " minute(s)"));
                        return [2 /*return*/, true];
                    }
                    else {
                        react_native_1.Alert.alert('Mute Failed', 'Could not mute user');
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Mute user error:', error_3);
                    react_native_1.Alert.alert('Error', 'Could not mute user. Please try again.');
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Unmute a user in drift
 */
function unmuteUser(liveId, targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Error', 'Backend not configured');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/unmute-user"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, targetUid: targetUid }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('User Unmuted', 'User can now participate again');
                        return [2 /*return*/, true];
                    }
                    else {
                        react_native_1.Alert.alert('Unmute Failed', 'Could not unmute user');
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error('Unmute user error:', error_4);
                    react_native_1.Alert.alert('Error', 'Could not unmute user. Please try again.');
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Remove a user from drift
 */
function removeFromDrift(liveId, targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        react_native_1.Alert.alert('Error', 'Backend not configured');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/remove-from-drift"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, targetUid: targetUid }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && result.ok) {
                        react_native_1.Alert.alert('User Removed', 'User has been removed from the drift');
                        return [2 /*return*/, true];
                    }
                    else {
                        react_native_1.Alert.alert('Remove Failed', 'Could not remove user');
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Remove from drift error:', error_5);
                    react_native_1.Alert.alert('Error', 'Could not remove user. Please try again.');
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get viewer count for a drift
 */
function getViewerCount(liveId) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        return [2 /*return*/, 0];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/drift/viewer-count?liveId=").concat(encodeURIComponent(liveId)))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && typeof result.count === 'number') {
                        return [2 /*return*/, result.count];
                    }
                    return [2 /*return*/, 0];
                case 3:
                    error_6 = _a.sent();
                    console.error('Get viewer count error:', error_6);
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Notify backend when viewer joins
 */
function notifyViewerJoin(liveId) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase)
                        return [2 /*return*/];
                    return [4 /*yield*/, fetch("".concat(backendBase, "/drift/viewer-join"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId }),
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error('Notify viewer join error:', error_7);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Notify backend when viewer leaves
 */
function notifyViewerLeave(liveId) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase)
                        return [2 /*return*/];
                    return [4 /*yield*/, fetch("".concat(backendBase, "/drift/viewer-leave"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId }),
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    console.error('Notify viewer leave error:', error_8);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get blocked users list
 */
function getBlockedUsers(uid) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, backendBase, response, result, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    cfg = require('../../liveConfig');
                    backendBase = (cfg === null || cfg === void 0 ? void 0 : cfg.BACKEND_BASE_URL) || '';
                    if (!backendBase) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, fetch("".concat(backendBase, "/blocked-users?uid=").concat(encodeURIComponent(uid)))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (response.ok && Array.isArray(result.blocked)) {
                        return [2 /*return*/, result.blocked];
                    }
                    return [2 /*return*/, []];
                case 3:
                    error_9 = _a.sent();
                    console.error('Get blocked users error:', error_9);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
