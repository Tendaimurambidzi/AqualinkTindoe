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
exports.offlineQueueService = void 0;
// src/services/offlineQueueService.ts
// Offline queue service for handling actions when connectivity is poor
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var QUEUE_KEY = 'offline_action_queue';
var MAX_RETRY_COUNT = 5;
var OfflineQueueService = /** @class */ (function () {
    function OfflineQueueService() {
        this.isProcessing = false;
        this.queue = [];
        this.loadQueue();
        this.startProcessing();
    }
    OfflineQueueService.prototype.loadQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stored, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, async_storage_1.default.getItem(QUEUE_KEY)];
                    case 1:
                        stored = _a.sent();
                        if (stored) {
                            this.queue = JSON.parse(stored);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Failed to load offline queue:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.saveQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, async_storage_1.default.setItem(QUEUE_KEY, JSON.stringify(this.queue))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to save offline queue:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.startProcessing = function () {
        var _this = this;
        // Process queue every 30 seconds when online
        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, netinfo_1.default.fetch()];
                    case 1:
                        state = _a.sent();
                        if (state.isConnected && !this.isProcessing) {
                            this.processQueue();
                        }
                        return [2 /*return*/];
                }
            });
        }); }, 30000);
    };
    OfflineQueueService.prototype.addAction = function (type, waveId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var user, action, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = (0, auth_1.default)().currentUser;
                        if (!user)
                            return [2 /*return*/];
                        action = {
                            id: "".concat(type, "_").concat(waveId, "_").concat(Date.now()),
                            type: type,
                            waveId: waveId,
                            userId: user.uid,
                            timestamp: Date.now(),
                            retryCount: 0,
                            data: data
                        };
                        this.queue.push(action);
                        return [4 /*yield*/, this.saveQueue()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, netinfo_1.default.fetch()];
                    case 2:
                        state = _a.sent();
                        if (state.isConnected && !this.isProcessing) {
                            this.processQueue();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, actionsToProcess, successfulActions_1, _i, actionsToProcess_1, action, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isProcessing || this.queue.length === 0)
                            return [2 /*return*/];
                        this.isProcessing = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, 11, 12]);
                        return [4 /*yield*/, netinfo_1.default.fetch()];
                    case 2:
                        state = _a.sent();
                        if (!state.isConnected) {
                            this.isProcessing = false;
                            return [2 /*return*/];
                        }
                        actionsToProcess = __spreadArray([], this.queue, true);
                        successfulActions_1 = [];
                        _i = 0, actionsToProcess_1 = actionsToProcess;
                        _a.label = 3;
                    case 3:
                        if (!(_i < actionsToProcess_1.length)) return [3 /*break*/, 8];
                        action = actionsToProcess_1[_i];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.executeAction(action)];
                    case 5:
                        _a.sent();
                        successfulActions_1.push(action.id);
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        console.error("Failed to execute queued action ".concat(action.type, ":"), error_3);
                        action.retryCount++;
                        if (action.retryCount >= MAX_RETRY_COUNT) {
                            console.warn("Removing action ".concat(action.id, " after ").concat(MAX_RETRY_COUNT, " retries"));
                            successfulActions_1.push(action.id);
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        // Remove successful actions from queue
                        this.queue = this.queue.filter(function (action) { return !successfulActions_1.includes(action.id); });
                        return [4 /*yield*/, this.saveQueue()];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 10:
                        error_4 = _a.sent();
                        console.error('Error processing offline queue:', error_4);
                        return [3 /*break*/, 12];
                    case 11:
                        this.isProcessing = false;
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.executeAction = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var type, waveId, userId, data, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        type = action.type, waveId = action.waveId, userId = action.userId, data = action.data;
                        _a = type;
                        switch (_a) {
                            case 'splash': return [3 /*break*/, 1];
                            case 'unsplash': return [3 /*break*/, 3];
                            case 'echo': return [3 /*break*/, 5];
                            case 'connect': return [3 /*break*/, 7];
                            case 'disconnect': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.executeSplash(waveId, userId)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 3: return [4 /*yield*/, this.executeUnsplash(waveId, userId)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.executeEcho(waveId, userId, data)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 7: return [4 /*yield*/, this.executeConnect(waveId, userId)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, this.executeDisconnect(waveId, userId)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.executeSplash = function (waveId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var splashRef, userDoc, userData, username;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        splashRef = (0, firestore_1.default)()
                            .collection('waves')
                            .doc(waveId)
                            .collection('splashes')
                            .doc(userId);
                        return [4 /*yield*/, (0, firestore_1.default)().collection('users').doc(userId).get()];
                    case 1:
                        userDoc = _a.sent();
                        userData = userDoc.data();
                        username = (userData === null || userData === void 0 ? void 0 : userData.username) || (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'Unknown User';
                        return [4 /*yield*/, splashRef.set({
                                userUid: userId,
                                waveId: waveId,
                                userName: username,
                                userPhoto: (userData === null || userData === void 0 ? void 0 : userData.userPhoto) || (userData === null || userData === void 0 ? void 0 : userData.photoURL) || null,
                                createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            }, { merge: true })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.executeUnsplash = function (waveId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var splashRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        splashRef = (0, firestore_1.default)()
                            .collection('waves')
                            .doc(waveId)
                            .collection('splashes')
                            .doc(userId);
                        return [4 /*yield*/, splashRef.delete()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.executeEcho = function (waveId, userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var echoRef, userDoc, userData, username;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        echoRef = (0, firestore_1.default)()
                            .collection('waves')
                            .doc(waveId)
                            .collection('echoes')
                            .doc();
                        return [4 /*yield*/, (0, firestore_1.default)().collection('users').doc(userId).get()];
                    case 1:
                        userDoc = _a.sent();
                        userData = userDoc.data();
                        username = (userData === null || userData === void 0 ? void 0 : userData.username) || (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'Unknown User';
                        return [4 /*yield*/, echoRef.set({
                                userUid: userId,
                                waveId: waveId,
                                text: (data === null || data === void 0 ? void 0 : data.text) || '',
                                userName: username,
                                userPhoto: (userData === null || userData === void 0 ? void 0 : userData.userPhoto) || (userData === null || userData === void 0 ? void 0 : userData.photoURL) || null,
                                createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.executeConnect = function (waveId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var waveDoc, waveData, creatorId, userDoc, userData, followerName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, firestore_1.default)().collection('waves').doc(waveId).get()];
                    case 1:
                        waveDoc = _a.sent();
                        if (!waveDoc.exists)
                            return [2 /*return*/];
                        waveData = waveDoc.data();
                        creatorId = waveData === null || waveData === void 0 ? void 0 : waveData.ownerUid;
                        if (!creatorId || creatorId === userId)
                            return [2 /*return*/];
                        // Add to following
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('users')
                                .doc(userId)
                                .collection('following')
                                .doc(creatorId)
                                .set({
                                userId: creatorId,
                                followedAt: firestore_1.default.FieldValue.serverTimestamp()
                            })];
                    case 2:
                        // Add to following
                        _a.sent();
                        return [4 /*yield*/, (0, firestore_1.default)().collection('users').doc(userId).get()];
                    case 3:
                        userDoc = _a.sent();
                        userData = userDoc.data();
                        followerName = (userData === null || userData === void 0 ? void 0 : userData.username) || (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'Unknown User';
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('users')
                                .doc(creatorId)
                                .collection('followers')
                                .doc(userId)
                                .set({
                                userId: userId,
                                followedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                followerName: followerName
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.executeDisconnect = function (waveId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var waveDoc, waveData, creatorId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, firestore_1.default)().collection('waves').doc(waveId).get()];
                    case 1:
                        waveDoc = _a.sent();
                        if (!waveDoc.exists)
                            return [2 /*return*/];
                        waveData = waveDoc.data();
                        creatorId = waveData === null || waveData === void 0 ? void 0 : waveData.ownerUid;
                        if (!creatorId)
                            return [2 /*return*/];
                        // Remove from following
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('users')
                                .doc(userId)
                                .collection('following')
                                .doc(creatorId)
                                .delete()];
                    case 2:
                        // Remove from following
                        _a.sent();
                        // Remove from followers
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('users')
                                .doc(creatorId)
                                .collection('followers')
                                .doc(userId)
                                .delete()];
                    case 3:
                        // Remove from followers
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OfflineQueueService.prototype.getQueueLength = function () {
        return this.queue.length;
    };
    OfflineQueueService.prototype.clearQueue = function () {
        this.queue = [];
        async_storage_1.default.removeItem(QUEUE_KEY);
    };
    return OfflineQueueService;
}());
exports.offlineQueueService = new OfflineQueueService();
