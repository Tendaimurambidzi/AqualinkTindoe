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
exports.joinCrew = joinCrew;
exports.leaveCrew = leaveCrew;
exports.isInCrew = isInCrew;
exports.getCrew = getCrew;
exports.getBoarding = getBoarding;
exports.getCrewCount = getCrewCount;
exports.getBoardingCount = getBoardingCount;
// src/services/crewService.ts
// Service for crew (follow/unfollow) operations using ocean-based terms
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var functions_1 = __importDefault(require("@react-native-firebase/functions"));
/**
 * Join a user's crew (follow them)
 */
function joinCrew(targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var user, joinCrewFn, result, fnError_1, meDoc, meData, myName, myPhoto, now, fallbackError_1, code, msg;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        throw new Error('Must be signed in to join a crew.');
                    if (user.uid === targetUid)
                        throw new Error('Cannot join your own crew.');
                    console.log("[DEBUG] crewService.joinCrew: Calling Firebase function for ".concat(user.uid, " -> ").concat(targetUid));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 10]);
                    joinCrewFn = (0, functions_1.default)('us-central1').httpsCallable('joinCrew');
                    return [4 /*yield*/, joinCrewFn({ targetUid: targetUid })];
                case 2:
                    result = _c.sent();
                    console.log("[DEBUG] crewService.joinCrew: Firebase function returned:", result === null || result === void 0 ? void 0 : result.data);
                    if ((_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.success) {
                        return [2 /*return*/, { success: true }];
                    }
                    throw new Error(((_b = result === null || result === void 0 ? void 0 : result.data) === null || _b === void 0 ? void 0 : _b.message) || 'Failed to join crew');
                case 3:
                    fnError_1 = _c.sent();
                    console.warn('[DEBUG] crewService.joinCrew callable failed, applying Firestore fallback:', fnError_1);
                    return [4 /*yield*/, (0, firestore_1.default)().collection('users').doc(user.uid).get()];
                case 4:
                    meDoc = _c.sent();
                    meData = meDoc.data() || {};
                    myName = (meData === null || meData === void 0 ? void 0 : meData.displayName) ||
                        (meData === null || meData === void 0 ? void 0 : meData.username) ||
                        (meData === null || meData === void 0 ? void 0 : meData.name) ||
                        user.displayName ||
                        'Anonymous';
                    myPhoto = (meData === null || meData === void 0 ? void 0 : meData.userPhoto) || (meData === null || meData === void 0 ? void 0 : meData.photoURL) || null;
                    now = firestore_1.default.FieldValue.serverTimestamp();
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('users')
                            .doc(targetUid)
                            .collection('crew')
                            .doc(user.uid)
                            .set({
                            uid: user.uid,
                            name: myName,
                            photo: myPhoto,
                            joinedAt: now,
                        }, { merge: true })];
                case 6:
                    _c.sent();
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('users')
                            .doc(user.uid)
                            .collection('following')
                            .doc(targetUid)
                            .set({
                            uid: targetUid,
                            joinedAt: now,
                        }, { merge: true })];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    fallbackError_1 = _c.sent();
                    code = String((fallbackError_1 === null || fallbackError_1 === void 0 ? void 0 : fallbackError_1.code) || '');
                    msg = String((fallbackError_1 === null || fallbackError_1 === void 0 ? void 0 : fallbackError_1.message) || '');
                    if (code.includes('permission-denied') || msg.includes('permission-denied')) {
                        console.warn('[DEBUG] crewService.joinCrew fallback permission denied; treating as soft-success');
                        return [2 /*return*/, { success: true }];
                    }
                    throw fallbackError_1;
                case 9: return [2 /*return*/, { success: true }];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Leave a user's crew (unfollow them)
 */
function leaveCrew(targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var user, crewRef, error_1, code, msg, followingRef, error_2, code, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        throw new Error('Must be signed in to leave a crew.');
                    crewRef = (0, firestore_1.default)()
                        .collection('users')
                        .doc(targetUid)
                        .collection('crew')
                        .doc(user.uid);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, crewRef.delete()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    code = String((error_1 === null || error_1 === void 0 ? void 0 : error_1.code) || '');
                    msg = String((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || '');
                    if (!code.includes('permission-denied') && !msg.includes('permission-denied')) {
                        throw error_1;
                    }
                    return [3 /*break*/, 4];
                case 4:
                    followingRef = (0, firestore_1.default)()
                        .collection('users')
                        .doc(user.uid)
                        .collection('following')
                        .doc(targetUid);
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, followingRef.delete()];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    code = String((error_2 === null || error_2 === void 0 ? void 0 : error_2.code) || '');
                    msg = String((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || '');
                    if (!code.includes('permission-denied') && !msg.includes('permission-denied')) {
                        throw error_2;
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, { success: true }];
            }
        });
    });
}
/**
 * Check if current user is in a user's crew
 */
function isInCrew(targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var user, crewRef, doc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        return [2 /*return*/, false];
                    crewRef = (0, firestore_1.default)()
                        .collection('users')
                        .doc(targetUid)
                        .collection('crew')
                        .doc(user.uid);
                    return [4 /*yield*/, crewRef.get()];
                case 1:
                    doc = _a.sent();
                    return [2 /*return*/, !!(doc === null || doc === void 0 ? void 0 : doc.exists)];
            }
        });
    });
}
/**
 * Get a user's crew (followers)
 */
function getCrew(targetUid_1) {
    return __awaiter(this, arguments, void 0, function (targetUid, limit) {
        var crewSnapshot;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('users')
                        .doc(targetUid)
                        .collection('crew')
                        .orderBy('joinedAt', 'desc')
                        .limit(limit)
                        .get()];
                case 1:
                    crewSnapshot = _a.sent();
                    return [2 /*return*/, crewSnapshot.docs.map(function (doc) {
                            var _a;
                            return ({
                                uid: doc.id,
                                name: doc.data().name || 'Anonymous',
                                photo: doc.data().photo || null,
                                joinedAt: ((_a = doc.data().joinedAt) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
                            });
                        })];
            }
        });
    });
}
/**
 * Get users that the current user is boarding (following)
 */
function getBoarding() {
    return __awaiter(this, arguments, void 0, function (limit) {
        var user, followingSnapshot;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = (0, auth_1.default)().currentUser;
                    if (!user)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('users')
                            .doc(user.uid)
                            .collection('following')
                            .orderBy('joinedAt', 'desc')
                            .limit(limit)
                            .get()];
                case 1:
                    followingSnapshot = _a.sent();
                    return [2 /*return*/, followingSnapshot.docs.map(function (doc) { return doc.id; })];
            }
        });
    });
}
/**
 * Get crew count for a user
 */
function getCrewCount(targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var crewSnapshot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('users')
                        .doc(targetUid)
                        .collection('crew')
                        .get()];
                case 1:
                    crewSnapshot = _a.sent();
                    return [2 /*return*/, crewSnapshot.size];
            }
        });
    });
}
/**
 * Get boarding count for a user (how many they're following)
 */
function getBoardingCount(targetUid) {
    return __awaiter(this, void 0, void 0, function () {
        var followingSnapshot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('users')
                        .doc(targetUid)
                        .collection('following')
                        .get()];
                case 1:
                    followingSnapshot = _a.sent();
                    return [2 /*return*/, followingSnapshot.size];
            }
        });
    });
}
