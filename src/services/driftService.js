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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCharteredDrift = startCharteredDrift;
exports.endCharteredDrift = endCharteredDrift;
exports.getCharteredDriftPasses = getCharteredDriftPasses;
exports.toggleCharteredDriftChat = toggleCharteredDriftChat;
exports.getCharteredDriftEarnings = getCharteredDriftEarnings;
exports.shareCharteredDriftPromo = shareCharteredDriftPromo;
exports.purchaseCharteredDriftPass = purchaseCharteredDriftPass;
exports.requestToJoinDrift = requestToJoinDrift;
exports.acceptDriftRequest = acceptDriftRequest;
exports.shareDriftLink = shareDriftLink;
var liveConfig_1 = require("../../liveConfig");
/**
 * Start a chartered (paid) drift session
 */
function startCharteredDrift(config) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/start"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(config),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to start chartered drift');
                    }
                    return [2 /*return*/, {
                            driftId: data.driftId,
                            drift: data.drift,
                            channel: data.channel,
                            token: data.token,
                        }];
                case 3:
                    error_1 = _a.sent();
                    console.error('Start chartered drift error:', error_1);
                    // Don't show alert - let caller handle the error
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * End a chartered drift session
 */
function endCharteredDrift(driftId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/end"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ driftId: driftId }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to end chartered drift');
                    }
                    return [2 /*return*/, {
                            drift: data.drift,
                            earnings: data.earnings,
                        }];
                case 3:
                    error_2 = _a.sent();
                    console.error('End chartered drift error:', error_2);
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get list of pass holders (ticket holders) for a drift
 */
function getCharteredDriftPasses(driftId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/passes?driftId=").concat(encodeURIComponent(driftId)))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to get passes');
                    }
                    return [2 /*return*/, data.passes || []];
                case 3:
                    error_3 = _a.sent();
                    console.error('Get passes error:', error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Toggle chat in a chartered drift
 */
function toggleCharteredDriftChat(driftId, enabled) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/toggle-chat"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ driftId: driftId, enabled: enabled }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to toggle chat');
                    }
                    return [2 /*return*/, data.chatEnabled];
                case 3:
                    error_4 = _a.sent();
                    console.error('Toggle chat error:', error_4);
                    throw error_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get earnings for a specific drift or all drifts by a host
 */
function getCharteredDriftEarnings(params) {
    return __awaiter(this, void 0, void 0, function () {
        var queryParam, response, data, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    queryParam = 'driftId' in params
                        ? "driftId=".concat(encodeURIComponent(params.driftId))
                        : "hostUid=".concat(encodeURIComponent(params.hostUid));
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/earnings?").concat(queryParam))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to get earnings');
                    }
                    return [2 /*return*/, data];
                case 3:
                    error_5 = _a.sent();
                    console.error('Get earnings error:', error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Share a promo link for a chartered drift
 */
function shareCharteredDriftPromo(driftId, title, priceUSD) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/share-promo"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ driftId: driftId, title: title, priceUSD: priceUSD }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to get promo link');
                    }
                    return [2 /*return*/, {
                            shareUrl: data.shareUrl,
                            webUrl: data.webUrl,
                            message: data.message,
                        }];
                case 3:
                    error_6 = _a.sent();
                    console.error('Share promo error:', error_6);
                    throw error_6;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Purchase a pass (ticket) to join a chartered drift
 */
function purchaseCharteredDriftPass(driftId, uid, paymentMethod) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/chartered-drift/purchase-pass"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ driftId: driftId, uid: uid, paymentMethod: paymentMethod }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to purchase pass');
                    }
                    return [2 /*return*/, {
                            drift: data.drift,
                            token: data.token,
                            channel: data.channel,
                        }];
                case 3:
                    error_7 = _a.sent();
                    console.error('Purchase pass error:', error_7);
                    throw error_7;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Request to join an open sea drift
 */
function requestToJoinDrift(liveId, fromUid, fromName) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/drift/request"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, fromUid: fromUid, fromName: fromName }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to request drift access');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    console.error('Request drift error:', error_8);
                    throw error_8;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Accept a drift request
 */
function acceptDriftRequest(liveId, requesterUid, channel) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/drift/accept"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, requesterUid: requesterUid, channel: channel }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to accept request');
                    }
                    return [2 /*return*/, data.token || null];
                case 3:
                    error_9 = _a.sent();
                    console.error('Accept drift request error:', error_9);
                    throw error_9;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Share a drift link
 */
function shareDriftLink(liveId, channel, title) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("".concat(liveConfig_1.BACKEND_BASE_URL, "/drift/share-link"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ liveId: liveId, channel: channel, title: title }),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to get share link');
                    }
                    return [2 /*return*/, {
                            shareLink: data.shareLink,
                            webLink: data.webLink,
                            message: data.message,
                        }];
                case 3:
                    error_10 = _a.sent();
                    console.error('Share drift link error:', error_10);
                    throw error_10;
                case 4: return [2 /*return*/];
            }
        });
    });
}
