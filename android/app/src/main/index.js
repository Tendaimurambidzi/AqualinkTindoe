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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldPings = exports.onMentionCreate = exports.onMessageCreate = exports.onFollowCreate = exports.onEchoCreate = exports.onSplashCreate = void 0;
// @ts-nocheck
var app_1 = require("firebase-admin/app");
var firestore_1 = require("firebase-admin/firestore");
var messaging_1 = require("firebase-admin/messaging");
var firestore_2 = require("firebase-functions/v2/firestore");
var scheduler_1 = require("firebase-functions/v2/scheduler");
(0, app_1.initializeApp)();
var db = (0, firestore_1.getFirestore)();
var msg = (0, messaging_1.getMessaging)();
// ---- helper: write ping + push ----
function sendPing(toUid, data) {
    return __awaiter(this, void 0, void 0, function () {
        var settingsSnap, settings, pingRef, createdAt, devicesSnap, tokens, titleMap, title, body;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, db.doc("users/".concat(toUid)).get()];
                case 1:
                    settingsSnap = _c.sent();
                    settings = settingsSnap.get("settings.notifications") || {};
                    if (settings[data.type] === false)
                        return [2 /*return*/];
                    pingRef = db.collection("users/".concat(toUid, "/pings")).doc();
                    createdAt = new Date();
                    return [4 /*yield*/, pingRef.set(__assign(__assign({}, data), { createdAt: createdAt, read: false }))];
                case 2:
                    _c.sent();
                    // unread counter
                    return [4 /*yield*/, db.doc("users/".concat(toUid)).set({
                            counters: { unreadPings: (settingsSnap.get("counters.unreadPings") || 0) + 1 },
                        }, { merge: true })];
                case 3:
                    // unread counter
                    _c.sent();
                    return [4 /*yield*/, db.collection("users/".concat(toUid, "/devices")).get()];
                case 4:
                    devicesSnap = _c.sent();
                    tokens = devicesSnap.docs.map(function (d) { return d.get("fcmToken"); }).filter(Boolean);
                    if (!tokens.length)
                        return [2 /*return*/];
                    titleMap = {
                        splash: "New Splash",
                        echo: "New Echo",
                        hug: "New Hug",
                        follow: "New Crew Member",
                        mention: "You were mentioned",
                        message: "New message from ".concat(data.fromName || "someone"),
                        system: "Notice",
                    };
                    title = titleMap[data.type] || "Update";
                    body = data.type === "splash" && data.fromName ? "".concat(data.fromName, " splashed your wave") :
                        data.type === "echo" && data.fromName ? "".concat(data.fromName, " echoed: ").concat((_a = data.text) !== null && _a !== void 0 ? _a : "").trim() :
                            data.type === "hug" && data.fromName ? "".concat(data.fromName, " hugged your vibe") :
                                data.type === "message" ? (_b = data.text) !== null && _b !== void 0 ? _b : "You have a new message" :
                                    data.type === "follow" && data.fromName ? "".concat(data.fromName, " joined your crew") :
                                        data.type === "mention" && data.fromName ? "".concat(data.fromName, " mentioned you") :
                                            data.text || "Open Pings";
                    return [4 /*yield*/, msg.sendEachForMulticast({
                            tokens: tokens,
                            notification: { title: title, body: body },
                            data: {
                                pingType: data.type,
                                waveId: data.waveId || "",
                                fromUid: data.fromUid,
                                pingId: pingRef.id,
                                route: "Pings", // so the app can navigate on tap
                            },
                            android: { priority: "high" },
                        })];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ---- triggers (adapt paths to your schema) ----
// Splash (like) created
exports.onSplashCreate = (0, firestore_2.onDocumentCreated)("waves/{waveId}/splashes/{splashId}", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var splash, waveSnap, toUid;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                splash = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
                if (!splash)
                    return [2 /*return*/];
                return [4 /*yield*/, db.doc("waves/".concat(event.params.waveId)).get()];
            case 1:
                waveSnap = _b.sent();
                toUid = waveSnap.get("ownerUid");
                if (!toUid || toUid === splash.userUid)
                    return [2 /*return*/];
                return [4 /*yield*/, sendPing(toUid, {
                        type: "splash",
                        fromUid: splash.userUid,
                        fromName: splash.userName,
                        fromPhoto: splash.userPhoto,
                        waveId: event.params.waveId,
                        aggKey: "wave:".concat(event.params.waveId, ":splash"),
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
// Echo (comment) created
exports.onEchoCreate = (0, firestore_2.onDocumentCreated)("waves/{waveId}/echoes/{echoId}", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var echo, waveSnap, toUid;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                echo = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
                if (!echo)
                    return [2 /*return*/];
                return [4 /*yield*/, db.doc("waves/".concat(event.params.waveId)).get()];
            case 1:
                waveSnap = _d.sent();
                toUid = waveSnap.get("ownerUid");
                if (!toUid || toUid === echo.userUid)
                    return [2 /*return*/];
                return [4 /*yield*/, sendPing(toUid, {
                        type: "echo",
                        fromUid: echo.userUid,
                        fromName: echo.userName,
                        fromPhoto: echo.userPhoto,
                        waveId: event.params.waveId,
                        text: (_c = (_b = echo.text) === null || _b === void 0 ? void 0 : _b.slice(0, 120)) !== null && _c !== void 0 ? _c : "",
                    })];
            case 2:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
// Follow created
exports.onFollowCreate = (0, firestore_2.onDocumentCreated)("follows/{toUid}/followers/{fromUid}", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var toUid, follower;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                toUid = event.params.toUid;
                follower = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
                if (!follower)
                    return [2 /*return*/];
                return [4 /*yield*/, sendPing(toUid, {
                        type: "follow",
                        fromUid: event.params.fromUid,
                        fromName: follower.userName,
                        fromPhoto: follower.userPhoto,
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
// Direct Message created
exports.onMessageCreate = (0, firestore_2.onDocumentCreated)("users/{toUid}/messages/{messageId}", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var message, toUid;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                message = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
                if (!message)
                    return [2 /*return*/];
                toUid = event.params.toUid;
                if (!toUid || toUid === message.fromUid)
                    return [2 /*return*/];
                return [4 /*yield*/, sendPing(toUid, {
                        type: "message",
                        fromUid: message.fromUid,
                        fromName: message.fromName,
                        fromPhoto: message.fromPhoto,
                        text: (_c = (_b = message.text) === null || _b === void 0 ? void 0 : _b.slice(0, 120)) !== null && _c !== void 0 ? _c : "",
                    })];
            case 1:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
// Mention created (e.g. in a reply or direct message)
exports.onMentionCreate = (0, firestore_2.onDocumentCreated)("users/{toUid}/mentions/{mentionId}", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var mention, toUid;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                mention = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
                if (!mention)
                    return [2 /*return*/];
                toUid = event.params.toUid;
                if (!toUid || toUid === mention.fromUid)
                    return [2 /*return*/];
                return [4 /*yield*/, sendPing(toUid, {
                        type: "message", // Use 'message' type for DMs
                        fromUid: mention.fromUid,
                        fromName: mention.fromName,
                        fromPhoto: mention.fromPhoto,
                        text: (_c = (_b = mention.text) === null || _b === void 0 ? void 0 : _b.slice(0, 120)) !== null && _c !== void 0 ? _c : "",
                    })];
            case 1:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); });
// Optional: clean up old pings (e.g., 90 days)
exports.cleanupOldPings = (0, scheduler_1.onSchedule)("every 24 hours", function () { return __awaiter(void 0, void 0, void 0, function () {
    var cutoff, users, _loop_1, _i, _a, u;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
                return [4 /*yield*/, db.collection("users").get()];
            case 1:
                users = _b.sent();
                _loop_1 = function (u) {
                    var snaps, batch;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, db.collection("users/".concat(u.id, "/pings"))
                                    .where("createdAt", "<", new Date(cutoff))
                                    .limit(300).get()];
                            case 1:
                                snaps = _c.sent();
                                batch = db.batch();
                                snaps.docs.forEach(function (d) { return batch.delete(d.ref); });
                                if (snaps.empty) return [3 /*break*/, 3];
                                return [4 /*yield*/, batch.commit()];
                            case 2:
                                _c.sent();
                                _c.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = users.docs;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                u = _a[_i];
                return [5 /*yield**/, _loop_1(u)];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); });
