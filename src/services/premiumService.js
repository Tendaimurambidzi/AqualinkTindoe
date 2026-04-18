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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserIdentity = void 0;
exports.findReusablePremiumShowForCurrentHost = findReusablePremiumShowForCurrentHost;
exports.createPremiumShowWithTokens = createPremiumShowWithTokens;
exports.listPremiumTokens = listPremiumTokens;
exports.redeemPremiumCode = redeemPremiumCode;
exports.listMyPremiumAccess = listMyPremiumAccess;
exports.startPremiumShow = startPremiumShow;
exports.endPremiumShow = endPremiumShow;
exports.canCurrentUserJoinPremiumShow = canCurrentUserJoinPremiumShow;
exports.recordPremiumEntry = recordPremiumEntry;
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var PREMIUM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var PREMIUM_TOKEN_GRACE_MS = 5 * 60 * 1000;
var nowMs = function () { return Date.now(); };
var isFirestorePermissionError = function (error) {
    var code = String((error === null || error === void 0 ? void 0 : error.code) || '').toLowerCase();
    var message = String((error === null || error === void 0 ? void 0 : error.message) || '').toLowerCase();
    return (code.includes('permission-denied') ||
        message.includes('permission-denied') ||
        message.includes('permission denied'));
};
var toFriendlyPremiumError = function (error, fallback, stage) {
    var code = String((error === null || error === void 0 ? void 0 : error.code) || '').trim() || 'unknown';
    var message = String((error === null || error === void 0 ? void 0 : error.message) || '').trim();
    if (isFirestorePermissionError(error)) {
        console.warn('Aqua Premium Firestore permission error', {
            stage: stage || null,
            code: (error === null || error === void 0 ? void 0 : error.code) || null,
            message: (error === null || error === void 0 ? void 0 : error.message) || null,
        });
        return new Error("Aqua Premium Firestore denied ".concat(stage || 'request', " (").concat(code, "). ").concat(message || fallback));
    }
    return new Error(message || fallback);
};
var toMillis = function (value) {
    try {
        if (!value)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof (value === null || value === void 0 ? void 0 : value.toMillis) === 'function')
            return Number(value.toMillis()) || 0;
        if (typeof (value === null || value === void 0 ? void 0 : value.toDate) === 'function')
            return Number(value.toDate().getTime()) || 0;
        if (typeof (value === null || value === void 0 ? void 0 : value.seconds) === 'number')
            return value.seconds * 1000;
        return Number(new Date(value).getTime()) || 0;
    }
    catch (_a) {
        return 0;
    }
};
var getPremiumShowAccessEndsAtMs = function (showData) {
    var endsAtMs = toMillis(showData === null || showData === void 0 ? void 0 : showData.endsAt);
    var redeemCloseAtMs = toMillis(showData === null || showData === void 0 ? void 0 : showData.redeemCloseAt);
    var entryCloseAtMs = toMillis(showData === null || showData === void 0 ? void 0 : showData.entryCloseAt);
    var graceEndsAtMs = endsAtMs ? endsAtMs + PREMIUM_TOKEN_GRACE_MS : 0;
    return Math.max(endsAtMs, redeemCloseAtMs, entryCloseAtMs, graceEndsAtMs);
};
var getPremiumAccessValidUntilMs = function (accessOrTicketData, showData) {
    return Math.max(toMillis(accessOrTicketData === null || accessOrTicketData === void 0 ? void 0 : accessOrTicketData.validUntil), getPremiumShowAccessEndsAtMs(showData));
};
var hashToken = function (input) {
    var hash = 2166136261;
    for (var i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash +=
            (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return "fnv_".concat((hash >>> 0).toString(16));
};
var generateTokenCode = function () {
    var left = '';
    var right = '';
    for (var i = 0; i < 4; i += 1) {
        left += PREMIUM_CODE_ALPHABET[Math.floor(Math.random() * PREMIUM_CODE_ALPHABET.length)];
        right += PREMIUM_CODE_ALPHABET[Math.floor(Math.random() * PREMIUM_CODE_ALPHABET.length)];
    }
    return "".concat(left, "-").concat(right);
};
var getCurrentUserIdentity = function () {
    var me = (0, auth_1.default)().currentUser;
    return {
        uid: (me === null || me === void 0 ? void 0 : me.uid) || '',
        name: (me === null || me === void 0 ? void 0 : me.displayName) ||
            ((me === null || me === void 0 ? void 0 : me.email) ? String(me.email).split('@')[0] : '') ||
            'Viber',
    };
};
exports.getCurrentUserIdentity = getCurrentUserIdentity;
function findReusablePremiumShowForCurrentHost() {
    return __awaiter(this, void 0, void 0, function () {
        var me, snap, candidate, data, tokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    me = (0, auth_1.default)().currentUser;
                    if (!(me === null || me === void 0 ? void 0 : me.uid))
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('premium_shows')
                            .where('hostUid', '==', me.uid)
                            .get()];
                case 1:
                    snap = _a.sent();
                    candidate = ((snap === null || snap === void 0 ? void 0 : snap.docs) || [])
                        .sort(function (a, b) {
                        var aData = a.data() || {};
                        var bData = b.data() || {};
                        return (toMillis(bData.createdAt) || 0) - (toMillis(aData.createdAt) || 0);
                    })
                        .find(function (doc) {
                        var data = doc.data() || {};
                        var status = String(data.status || 'scheduled');
                        var endsAtMs = getPremiumShowAccessEndsAtMs(data);
                        return status !== 'ended' && status !== 'cancelled' && (!endsAtMs || endsAtMs > nowMs());
                    });
                    if (!candidate)
                        return [2 /*return*/, null];
                    data = candidate.data() || {};
                    return [4 /*yield*/, listPremiumTokens(candidate.id)];
                case 2:
                    tokens = _a.sent();
                    return [2 /*return*/, {
                            show: {
                                id: candidate.id,
                                hostUid: String(data.hostUid || me.uid),
                                hostName: data.hostName ? String(data.hostName) : null,
                                title: String(data.title || 'Aqua Premium Show'),
                                description: data.description ? String(data.description) : null,
                                status: String(data.status || 'scheduled'),
                                startsAtMs: toMillis(data.startsAt),
                                endsAtMs: toMillis(data.endsAt),
                                capacity: Math.max(1, Number(data.capacity || tokens.length || 1)),
                                ticketStats: data.ticketStats || undefined,
                            },
                            tokens: tokens,
                        }];
            }
        });
    });
}
function createPremiumShowWithTokens(params) {
    return __awaiter(this, void 0, void 0, function () {
        var me, reusable, startsAtMs, endsAtMs, accessEndsAtMs, showRef, tokens, batch, i, code, ticketRef;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    me = (0, auth_1.default)().currentUser;
                    if (!(me === null || me === void 0 ? void 0 : me.uid))
                        throw new Error('Sign in required');
                    return [4 /*yield*/, findReusablePremiumShowForCurrentHost()];
                case 1:
                    reusable = _c.sent();
                    if (reusable) {
                        return [2 /*return*/, reusable];
                    }
                    startsAtMs = nowMs();
                    endsAtMs = startsAtMs + Math.max(15, Number(params.durationMins || 60)) * 60 * 1000;
                    accessEndsAtMs = endsAtMs + PREMIUM_TOKEN_GRACE_MS;
                    showRef = (0, firestore_1.default)().collection('premium_shows').doc();
                    tokens = [];
                    return [4 /*yield*/, showRef.set({
                            hostUid: me.uid,
                            hostName: me.displayName ||
                                (me.email ? String(me.email).split('@')[0] : '') ||
                                'Viber',
                            title: params.title.trim(),
                            description: ((_a = params.description) === null || _a === void 0 ? void 0 : _a.trim()) || null,
                            priceUSD: Number(params.priceUSD || 0),
                            category: params.category || null,
                            status: 'scheduled',
                            startsAt: new Date(startsAtMs),
                            endsAt: new Date(endsAtMs),
                            redeemOpenAt: new Date(startsAtMs),
                            redeemCloseAt: new Date(accessEndsAtMs),
                            entryOpenAt: new Date(startsAtMs),
                            entryCloseAt: new Date(accessEndsAtMs),
                            capacity: Math.max(1, Number(params.capacity || params.tokenCount || 1)),
                            requiresTicket: true,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            createdByUid: me.uid,
                            ticketStats: {
                                generated: Math.max(0, Number(params.tokenCount || 0)),
                                claimed: 0,
                                active: 0,
                                used: 0,
                                expired: 0,
                                revoked: 0,
                            },
                        })];
                case 2:
                    _c.sent();
                    batch = (0, firestore_1.default)().batch();
                    for (i = 0; i < params.tokenCount; i += 1) {
                        code = generateTokenCode();
                        ticketRef = showRef.collection('tickets').doc();
                        tokens.push({
                            ticketId: ticketRef.id,
                            code: code,
                            codeLast4: code.slice(-4),
                            status: 'generated',
                            claimedByUid: null,
                            intendedName: null,
                        });
                        batch.set(ticketRef, {
                            code: code,
                            codeHash: hashToken(code),
                            codeLast4: code.slice(-4),
                            issuedByUid: me.uid,
                            intendedUid: null,
                            intendedName: null,
                            claimedByUid: null,
                            claimedAt: null,
                            validFrom: new Date(startsAtMs),
                            validUntil: new Date(accessEndsAtMs),
                            maxUses: 1,
                            useCount: 0,
                            status: 'generated',
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            notes: null,
                        });
                    }
                    return [4 /*yield*/, batch.commit()];
                case 3:
                    _c.sent();
                    return [2 /*return*/, {
                            show: {
                                id: showRef.id,
                                hostUid: me.uid,
                                hostName: me.displayName ||
                                    (me.email ? String(me.email).split('@')[0] : '') ||
                                    'Viber',
                                title: params.title.trim(),
                                description: ((_b = params.description) === null || _b === void 0 ? void 0 : _b.trim()) || null,
                                status: 'scheduled',
                                startsAtMs: startsAtMs,
                                endsAtMs: accessEndsAtMs,
                                capacity: Math.max(1, Number(params.capacity || params.tokenCount || 1)),
                                ticketStats: {
                                    generated: tokens.length,
                                    claimed: 0,
                                    active: 0,
                                    used: 0,
                                    expired: 0,
                                    revoked: 0,
                                },
                            },
                            tokens: tokens,
                        }];
            }
        });
    });
}
function listPremiumTokens(showId) {
    return __awaiter(this, void 0, void 0, function () {
        var snap, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("premium_shows/".concat(showId, "/tickets"))
                            .orderBy('createdAt', 'asc')
                            .get()];
                case 1:
                    snap = _a.sent();
                    return [2 /*return*/, ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                            var data = doc.data() || {};
                            return {
                                ticketId: doc.id,
                                code: String(data.code || ''),
                                codeLast4: String(data.codeLast4 || ''),
                                status: String(data.status || 'generated'),
                                claimedByUid: data.claimedByUid ? String(data.claimedByUid) : null,
                                intendedName: data.intendedName ? String(data.intendedName) : null,
                            };
                        })];
                case 2:
                    error_1 = _a.sent();
                    throw toFriendlyPremiumError(error_1, 'Could not load Aqua Premium tokens.', 'premium_shows.tickets.list');
                case 3: return [2 /*return*/];
            }
        });
    });
}
function redeemPremiumCode(rawCode) {
    return __awaiter(this, void 0, void 0, function () {
        var me, code, codeHash, snap, error_2, match, ticketData, showRef, showSnap, error_3, showData, validUntilMs, validFromMs, status, resolvedValidUntilMs, batch, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    me = (0, auth_1.default)().currentUser;
                    if (!(me === null || me === void 0 ? void 0 : me.uid))
                        throw new Error('Sign in required');
                    code = String(rawCode || '').trim().toUpperCase();
                    if (!code)
                        throw new Error('Enter a token');
                    codeHash = hashToken(code);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collectionGroup('tickets')
                            .where('codeHash', '==', codeHash)
                            .limit(2)
                            .get()];
                case 2:
                    snap = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    throw toFriendlyPremiumError(error_2, 'Could not redeem Aqua Premium token.', 'tickets.collectionGroup.lookup');
                case 4:
                    match = (_a = snap === null || snap === void 0 ? void 0 : snap.docs) === null || _a === void 0 ? void 0 : _a[0];
                    if (!match)
                        throw new Error('Token not found');
                    ticketData = match.data() || {};
                    showRef = match.ref.parent.parent;
                    if (!showRef)
                        throw new Error('Show not found');
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, showRef.get()];
                case 6:
                    showSnap = _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _b.sent();
                    throw toFriendlyPremiumError(error_3, 'Could not load Premium show.', 'premium_shows.doc.get');
                case 8:
                    showData = showSnap.data() || {};
                    validUntilMs = getPremiumAccessValidUntilMs(ticketData, showData);
                    validFromMs = toMillis(ticketData.validFrom) || toMillis(showData.startsAt);
                    status = String(ticketData.status || 'generated');
                    if (status === 'revoked' || status === 'expired') {
                        throw new Error('This token is no longer valid');
                    }
                    if (ticketData.claimedByUid && String(ticketData.claimedByUid) !== me.uid) {
                        throw new Error('This token has already been claimed');
                    }
                    if (validFromMs && nowMs() < validFromMs - 24 * 60 * 60 * 1000) {
                        throw new Error('This token is not active yet');
                    }
                    if (validUntilMs && nowMs() > validUntilMs) {
                        throw new Error('This token has expired');
                    }
                    resolvedValidUntilMs = validUntilMs || nowMs() + PREMIUM_TOKEN_GRACE_MS;
                    batch = (0, firestore_1.default)().batch();
                    batch.set(match.ref, {
                        claimedByUid: me.uid,
                        claimedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        status: 'claimed',
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    }, { merge: true });
                    batch.set((0, firestore_1.default)().doc("users/".concat(me.uid, "/premium_access/").concat(showRef.id)), {
                        showId: showRef.id,
                        ticketId: match.id,
                        grantedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        validFrom: ticketData.validFrom || showData.startsAt || new Date(),
                        validUntil: new Date(resolvedValidUntilMs),
                        status: 'active',
                        hostUid: String(showData.hostUid || ''),
                        showTitle: String(showData.title || 'Aqua Premium'),
                    }, { merge: true });
                    batch.set((0, firestore_1.default)().doc("users/".concat(me.uid, "/premium_redemptions/").concat(match.id)), {
                        showId: showRef.id,
                        ticketId: match.id,
                        redeemedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        codeLast4: String(ticketData.codeLast4 || code.slice(-4)),
                        status: 'success',
                    });
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, batch.commit()];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_4 = _b.sent();
                    throw toFriendlyPremiumError(error_4, 'Could not save Premium access.', 'premium.batch.commit');
                case 12: return [2 /*return*/, {
                        showId: showRef.id,
                        showTitle: String(showData.title || 'Aqua Premium'),
                    }];
            }
        });
    });
}
function listMyPremiumAccess() {
    return __awaiter(this, void 0, void 0, function () {
        var me, snap, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    me = (0, auth_1.default)().currentUser;
                    if (!(me === null || me === void 0 ? void 0 : me.uid))
                        return [2 /*return*/, []];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("users/".concat(me.uid, "/premium_access"))
                            .orderBy('grantedAt', 'desc')
                            .limit(20)
                            .get()];
                case 2:
                    snap = _a.sent();
                    return [2 /*return*/, ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                            var data = doc.data() || {};
                            return {
                                showId: doc.id,
                                showTitle: String(data.showTitle || 'Aqua Premium'),
                                hostUid: String(data.hostUid || ''),
                                status: String(data.status || 'active'),
                                validFromMs: toMillis(data.validFrom),
                                validUntilMs: toMillis(data.validUntil),
                                ticketId: String(data.ticketId || ''),
                            };
                        })];
                case 3:
                    error_5 = _a.sent();
                    throw toFriendlyPremiumError(error_5, 'Could not load Aqua Premium access.', 'users.premium_access.list');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function startPremiumShow(showId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)().collection('premium_shows').doc(showId).set({
                        status: 'live',
                        startsAt: firestore_1.default.FieldValue.serverTimestamp(),
                        entryOpenAt: firestore_1.default.FieldValue.serverTimestamp(),
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    }, { merge: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function endPremiumShow(showId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)().collection('premium_shows').doc(showId).set({
                        status: 'ended',
                        endsAt: firestore_1.default.FieldValue.serverTimestamp(),
                        entryCloseAt: firestore_1.default.FieldValue.serverTimestamp(),
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    }, { merge: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function canCurrentUserJoinPremiumShow(showId, hostUid) {
    return __awaiter(this, void 0, void 0, function () {
        var me, accessSnap, accessData, status_1, showData, showSnap, _a, validUntilMs, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    me = (0, auth_1.default)().currentUser;
                    if (!(me === null || me === void 0 ? void 0 : me.uid)) {
                        return [2 /*return*/, { allowed: false, reason: 'Sign in required' }];
                    }
                    if (hostUid && me.uid === hostUid) {
                        return [2 /*return*/, { allowed: true, reason: null, ticketId: null }];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, (0, firestore_1.default)().doc("users/".concat(me.uid, "/premium_access/").concat(showId)).get()];
                case 2:
                    accessSnap = _b.sent();
                    if (!accessSnap.exists) {
                        return [2 /*return*/, { allowed: false, reason: 'Enter a valid Aqua Premium token first.' }];
                    }
                    accessData = accessSnap.data() || {};
                    status_1 = String(accessData.status || 'active');
                    if (status_1 !== 'active') {
                        return [2 /*return*/, { allowed: false, reason: 'Your Aqua Premium access is not active.' }];
                    }
                    showData = null;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, firestore_1.default)().doc("premium_shows/".concat(showId)).get()];
                case 4:
                    showSnap = _b.sent();
                    showData = showSnap.data() || null;
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    validUntilMs = getPremiumAccessValidUntilMs(accessData, showData);
                    if (validUntilMs && nowMs() > validUntilMs) {
                        return [2 /*return*/, { allowed: false, reason: 'Your Aqua Premium access has expired.' }];
                    }
                    if (validUntilMs && validUntilMs > toMillis(accessData.validUntil)) {
                        (0, firestore_1.default)()
                            .doc("users/".concat(me.uid, "/premium_access/").concat(showId))
                            .set({
                            validUntil: new Date(validUntilMs),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })
                            .catch(function () { });
                    }
                    return [2 /*return*/, {
                            allowed: true,
                            reason: null,
                            ticketId: String(accessData.ticketId || ''),
                        }];
                case 7:
                    error_6 = _b.sent();
                    if (isFirestorePermissionError(error_6)) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: "Aqua Premium Firestore denied users.premium_access.get (".concat(String((error_6 === null || error_6 === void 0 ? void 0 : error_6.code) || 'unknown'), "). ").concat(String((error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || '').trim()),
                            }];
                    }
                    throw error_6;
                case 8: return [2 /*return*/];
            }
        });
    });
}
function recordPremiumEntry(showId) {
    return __awaiter(this, void 0, void 0, function () {
        var me, accessSnap, accessData, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    me = (0, auth_1.default)().currentUser;
                    if (!(me === null || me === void 0 ? void 0 : me.uid))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, firestore_1.default)().doc("users/".concat(me.uid, "/premium_access/").concat(showId)).get()];
                case 2:
                    accessSnap = _a.sent();
                    accessData = accessSnap.data() || {};
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("premium_shows/".concat(showId, "/entries"))
                            .add({
                            uid: me.uid,
                            ticketId: String(accessData.ticketId || ''),
                            enteredAt: firestore_1.default.FieldValue.serverTimestamp(),
                            exitedAt: null,
                            deviceId: null,
                            status: 'entered',
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_7 = _a.sent();
                    throw toFriendlyPremiumError(error_7, 'Could not record Aqua Premium entry.', 'premium_shows.entries.add');
                case 5: return [2 /*return*/];
            }
        });
    });
}
