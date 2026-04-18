"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CharteredSeaDriftButton;
var react_1 = __importStar(require("react"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var react_native_1 = require("react-native");
var premiumService_1 = require("./src/services/premiumService");
var SCREEN_HEIGHT = react_native_1.Dimensions.get('window').height;
var minutesOptions = [30, 60, 120];
function CharteredSeaDriftButton(props) {
    var _this = this;
    var onStartPaidDrift = props.onStartPaidDrift, onJoinPremiumShow = props.onJoinPremiumShow, onEndPaidDrift = props.onEndPaidDrift, onViewPasses = props.onViewPasses, onToggleChat = props.onToggleChat, onViewEarnings = props.onViewEarnings, onSharePromo = props.onSharePromo, buttonStyle = props.buttonStyle, buttonTextStyle = props.buttonTextStyle, hitSlop = props.hitSlop;
    var _a = (0, react_1.useState)(false), open = _a[0], setOpen = _a[1];
    var _b = (0, react_1.useState)('host'), mode = _b[0], setMode = _b[1];
    var _c = (0, react_1.useState)('Aqua Premium Show'), title = _c[0], setTitle = _c[1];
    var _d = (0, react_1.useState)(''), description = _d[0], setDescription = _d[1];
    var _e = (0, react_1.useState)('1.00'), price = _e[0], setPrice = _e[1];
    var _f = (0, react_1.useState)('AQUA001'), ticketNumber = _f[0], setTicketNumber = _f[1];
    var _g = (0, react_1.useState)(''), tokenCount = _g[0], setTokenCount = _g[1];
    var _h = (0, react_1.useState)('General'), category = _h[0], setCategory = _h[1];
    var access = (0, react_1.useState)('paid-only')[0];
    var _j = (0, react_1.useState)(60), duration = _j[0], setDuration = _j[1];
    var _k = (0, react_1.useState)(true), chatEnabled = _k[0], setChatEnabled = _k[1];
    var _l = (0, react_1.useState)(null), activeShowId = _l[0], setActiveShowId = _l[1];
    var _m = (0, react_1.useState)([]), generatedTokens = _m[0], setGeneratedTokens = _m[1];
    var _o = (0, react_1.useState)(''), redeemCode = _o[0], setRedeemCode = _o[1];
    var _p = (0, react_1.useState)([]), myAccess = _p[0], setMyAccess = _p[1];
    var _q = (0, react_1.useState)(false), busy = _q[0], setBusy = _q[1];
    var categories = [
        'General',
        'Music',
        'Gaming',
        'Education',
        'Business',
        'Entertainment',
        'Sports',
        'Technology',
        'Art',
        'Other',
    ];
    var priceNumber = (0, react_1.useMemo)(function () {
        var n = Number(price.replace(',', '.'));
        return Number.isFinite(n) && n >= 0 ? n : 0;
    }, [price]);
    var loadMyAccess = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var rows, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, premiumService_1.listMyPremiumAccess)()];
                case 1:
                    rows = _b.sent();
                    setMyAccess(rows);
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    setMyAccess([]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var resolvePremiumLiveRoom = (0, react_1.useCallback)(function (showId) { return __awaiter(_this, void 0, void 0, function () {
        var snap, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('live')
                        .where('premiumShowId', '==', showId)
                        .limit(6)
                        .get()];
                case 1:
                    snap = _a.sent();
                    rows = ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                        var data = doc.data() || {};
                        return {
                            liveId: doc.id,
                            status: String(data.status || '').toLowerCase(),
                            title: String(data.title || data.liveTitle || 'Aqua Premium Show'),
                            channel: data.channel ? String(data.channel) : data.liveChannel ? String(data.liveChannel) : null,
                            hostName: data.hostName ? String(data.hostName) : null,
                        };
                    });
                    return [2 /*return*/, (rows.find(function (item) { return item.status === 'live'; }) ||
                            rows.find(function (item) { return item.status !== 'ended' && item.status !== 'cancelled'; }) ||
                            null)];
            }
        });
    }); }, []);
    var validateConfig = (0, react_1.useCallback)(function () {
        if (!title.trim()) {
            react_native_1.Alert.alert('Title Required', 'Please enter a title for your Aqua Premium show.');
            return false;
        }
        if (!ticketNumber.trim()) {
            react_native_1.Alert.alert('Ticket Label Required', 'Please enter a ticket label such as AQUA001.');
            return false;
        }
        if (priceNumber <= 0) {
            react_native_1.Alert.alert('Invalid Price', 'Price must be greater than $0.');
            return false;
        }
        var tokens = parseInt(tokenCount, 10);
        if (!tokens || tokens < 1) {
            react_native_1.Alert.alert('Invalid Token Count', 'Please enter how many tokens to generate.');
            return false;
        }
        return true;
    }, [priceNumber, ticketNumber, title, tokenCount]);
    var ensureShowAndTokens = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var existing, created;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!validateConfig())
                        return [2 /*return*/, null];
                    if (!activeShowId) return [3 /*break*/, 3];
                    if (!(generatedTokens.length === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, premiumService_1.listPremiumTokens)(activeShowId)];
                case 1:
                    existing = _a.sent();
                    setGeneratedTokens(existing);
                    _a.label = 2;
                case 2: return [2 /*return*/, {
                        showId: activeShowId,
                        tokens: generatedTokens,
                    }];
                case 3: return [4 /*yield*/, (0, premiumService_1.createPremiumShowWithTokens)({
                        title: title,
                        description: description,
                        priceUSD: priceNumber,
                        durationMins: duration,
                        capacity: parseInt(tokenCount, 10),
                        tokenCount: parseInt(tokenCount, 10),
                        category: category,
                    })];
                case 4:
                    created = _a.sent();
                    setActiveShowId(created.show.id);
                    setGeneratedTokens(created.tokens);
                    return [2 /*return*/, {
                            showId: created.show.id,
                            tokens: created.tokens,
                        }];
            }
        });
    }); }, [
        activeShowId,
        category,
        description,
        duration,
        generatedTokens,
        priceNumber,
        title,
        tokenCount,
        validateConfig,
    ]);
    var handleGenerateTokens = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setBusy(true);
                    return [4 /*yield*/, ensureShowAndTokens()];
                case 1:
                    result = _a.sent();
                    if (!result)
                        return [2 /*return*/];
                    react_native_1.Alert.alert('Tokens Generated', "".concat(result.tokens.length || parseInt(tokenCount, 10), " Tokens Generated."));
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _a.sent();
                    react_native_1.Alert.alert('Token generation failed', String((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Try again.'));
                    return [3 /*break*/, 4];
                case 3:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [ensureShowAndTokens, tokenCount]);
    var handleStart = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setBusy(true);
                    return [4 /*yield*/, ensureShowAndTokens()];
                case 1:
                    result = _a.sent();
                    if (!(result === null || result === void 0 ? void 0 : result.showId))
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, premiumService_1.startPremiumShow)(result.showId)];
                case 2:
                    _a.sent();
                    onStartPaidDrift === null || onStartPaidDrift === void 0 ? void 0 : onStartPaidDrift({
                        title: title.trim(),
                        priceUSD: priceNumber,
                        durationMins: duration,
                        access: access,
                        startLive: function () { },
                        ticketNumber: ticketNumber.trim(),
                        premiumShowId: result.showId,
                    });
                    setOpen(false);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    react_native_1.Alert.alert('Could not start Aqua Premium', String((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || 'Try again.'));
                    return [3 /*break*/, 5];
                case 4:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [
        access,
        duration,
        ensureShowAndTokens,
        onStartPaidDrift,
        priceNumber,
        ticketNumber,
        title,
    ]);
    var handleEnd = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setBusy(true);
                    if (!activeShowId) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, premiumService_1.endPremiumShow)(activeShowId)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    onEndPaidDrift === null || onEndPaidDrift === void 0 ? void 0 : onEndPaidDrift();
                    react_native_1.Alert.alert('Aqua Premium ended', 'The premium show has been closed.');
                    setOpen(false);
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    react_native_1.Alert.alert('Could not end Aqua Premium', String((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || 'Try again.'));
                    return [3 /*break*/, 5];
                case 4:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [activeShowId, onEndPaidDrift]);
    var handleRedeem = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, liveRoom, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 6]);
                    setBusy(true);
                    return [4 /*yield*/, (0, premiumService_1.redeemPremiumCode)(redeemCode)];
                case 1:
                    result = _a.sent();
                    setRedeemCode('');
                    return [4 /*yield*/, loadMyAccess()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, resolvePremiumLiveRoom(result.showId)];
                case 3:
                    liveRoom = _a.sent();
                    if (liveRoom && onJoinPremiumShow) {
                        onJoinPremiumShow({
                            liveId: liveRoom.liveId,
                            premiumShowId: result.showId,
                            title: liveRoom.title || result.showTitle,
                            channel: liveRoom.channel,
                            hostName: liveRoom.hostName,
                            skipPremiumValidation: true,
                        });
                        setOpen(false);
                        return [2 /*return*/];
                    }
                    react_native_1.Alert.alert('Access granted', "".concat(result.showTitle, " is now unlocked. Tap Join Aqua Premium Show when the host opens the camera."));
                    return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    react_native_1.Alert.alert('Redeem failed', String((error_4 === null || error_4 === void 0 ? void 0 : error_4.message) || 'Try another token.'));
                    return [3 /*break*/, 6];
                case 5:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [loadMyAccess, onJoinPremiumShow, redeemCode, resolvePremiumLiveRoom]);
    var handleJoinPremiumShow = (0, react_1.useCallback)(function (item) { return __awaiter(_this, void 0, void 0, function () {
        var liveRoom, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setBusy(true);
                    return [4 /*yield*/, resolvePremiumLiveRoom(item.showId)];
                case 1:
                    liveRoom = _a.sent();
                    if (!liveRoom) {
                        react_native_1.Alert.alert('Show not live yet', 'Your access is active. The Join Aqua Premium Show button will work once the host starts the premium camera.');
                        return [2 /*return*/];
                    }
                    if (!onJoinPremiumShow) {
                        react_native_1.Alert.alert('Join unavailable', 'This build is missing the Aqua Premium join callback.');
                        return [2 /*return*/];
                    }
                    onJoinPremiumShow({
                        liveId: liveRoom.liveId,
                        premiumShowId: item.showId,
                        title: liveRoom.title || item.showTitle || 'Aqua Premium Show',
                        channel: liveRoom.channel,
                        hostName: liveRoom.hostName,
                        skipPremiumValidation: true,
                    });
                    setOpen(false);
                    return [3 /*break*/, 4];
                case 2:
                    error_5 = _a.sent();
                    react_native_1.Alert.alert('Could not join Aqua Premium', String((error_5 === null || error_5 === void 0 ? void 0 : error_5.message) || 'Try again.'));
                    return [3 /*break*/, 4];
                case 3:
                    setBusy(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [onJoinPremiumShow, resolvePremiumLiveRoom]);
    var handleShareToken = (0, react_1.useCallback)(function (token) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, react_native_1.Share.share({
                            title: "Aqua Premium token for ".concat(title.trim()),
                            message: "Aqua Premium access code for \"".concat(title.trim(), "\": ").concat(token.code),
                        })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [title]);
    var handleSharePromo = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!activeShowId) {
                        react_native_1.Alert.alert('Generate tokens first', 'Create the Aqua Premium show and tokens before sharing.');
                        return [2 /*return*/];
                    }
                    onSharePromo === null || onSharePromo === void 0 ? void 0 : onSharePromo({
                        title: title.trim(),
                        priceUSD: priceNumber,
                        premiumShowId: activeShowId,
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, react_native_1.Share.share({
                            title: "Join ".concat(title.trim()),
                            message: "Aqua Premium: \"".concat(title.trim(), "\"\n") +
                                "".concat(description ? "".concat(description, "\n") : '') +
                                "Price: $".concat(priceNumber.toFixed(2), "\n") +
                                "Use the access token I send you in the Aqua Premium screen.",
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [activeShowId, description, onSharePromo, priceNumber, title]);
    var handleToggleChat = (0, react_1.useCallback)(function () {
        var next = !chatEnabled;
        setChatEnabled(next);
        onToggleChat === null || onToggleChat === void 0 ? void 0 : onToggleChat(next);
    }, [chatEnabled, onToggleChat]);
    var handleOpen = (0, react_1.useCallback)(function () {
        setOpen(true);
        void loadMyAccess();
        void (function () { return __awaiter(_this, void 0, void 0, function () {
            var reusable, reusableDuration_1, nearestDuration, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, premiumService_1.findReusablePremiumShowForCurrentHost)()];
                    case 1:
                        reusable = _b.sent();
                        if (!reusable)
                            return [2 /*return*/];
                        reusableDuration_1 = Math.max(30, Number(Math.round((reusable.show.endsAtMs - reusable.show.startsAtMs) / 60000)) || 60);
                        nearestDuration = minutesOptions.find(function (option) { return option >= reusableDuration_1; }) || minutesOptions[minutesOptions.length - 1];
                        setActiveShowId(reusable.show.id);
                        setGeneratedTokens(reusable.tokens);
                        setTitle(reusable.show.title || 'Aqua Premium Show');
                        setDescription(reusable.show.description || '');
                        setDuration(nearestDuration);
                        setTokenCount(String(reusable.tokens.length || reusable.show.capacity || ''));
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, [loadMyAccess]);
    return (<>
      <react_native_1.Pressable style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.logbookAction,
                buttonStyle,
                pressed && styles.buttonPressed,
            ];
        }} onPress={handleOpen} hitSlop={hitSlop || { top: 200, left: 200, bottom: 200, right: 200 }}>
        <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <react_native_1.View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF2D8' }}/>
          <react_native_1.Text style={[styles.logbookActionText, styles.logbookActionLabelStrong, buttonTextStyle]}>Aqua Premium</react_native_1.Text>
          <react_native_1.Text style={[styles.logbookActionText, { color: '#FFFFFF', fontWeight: '900', fontSize: 17 }]}>◆</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Pressable>

      <react_native_1.Modal visible={open} animationType="fade" transparent onRequestClose={function () { return setOpen(false); }}>
        <react_native_1.View style={[styles.modalRoot, { justifyContent: 'center', padding: 24 }]}>
          <react_native_1.View style={[
            styles.logbookContainer,
            {
                maxHeight: SCREEN_HEIGHT * 0.88,
                borderRadius: 16,
                overflow: 'hidden',
            },
        ]}>
            <react_native_1.View style={styles.logbookPage}>
              <react_native_1.View style={styles.modalHeaderRow}>
                <react_native_1.Text style={styles.modalTitle}>Aqua Premium</react_native_1.Text>
                <react_native_1.Pressable onPress={function () { return setOpen(false); }} style={styles.closeBtn}>
                  <react_native_1.Text style={styles.closeText}>Close</react_native_1.Text>
                </react_native_1.Pressable>
              </react_native_1.View>

              <react_native_1.View style={styles.modeRow}>
                {[
            { key: 'host', label: 'Host Show' },
            { key: 'redeem', label: 'Enter Code' },
        ].map(function (item) { return (<react_native_1.Pressable key={item.key} onPress={function () { return setMode(item.key); }} style={[
                styles.modeChip,
                item.key === 'host' ? styles.hostModeChip : styles.redeemModeChip,
                mode === item.key &&
                    (item.key === 'host' ? styles.hostModeChipActive : styles.redeemModeChipActive),
            ]}>
                    <react_native_1.Text style={item.key === 'host'
                ? styles.hostModeChipText
                : styles.redeemModeChipText}>
                      {item.label}
                    </react_native_1.Text>
                  </react_native_1.Pressable>); })}
              </react_native_1.View>

              <react_native_1.ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {mode === 'host' ? (<>
                    <react_native_1.Text style={styles.sectionLabel}>Host Setup</react_native_1.Text>
                    <react_native_1.Text style={styles.inputLabel}>Show Title *</react_native_1.Text>
                    <react_native_1.TextInput value={title} onChangeText={setTitle} placeholder="Give your show a title" placeholderTextColor="rgba(255,255,255,0.4)" style={styles.input}/>

                    <react_native_1.Text style={styles.inputLabel}>Description</react_native_1.Text>
                    <react_native_1.TextInput value={description} onChangeText={setDescription} placeholder="Describe the premium show" placeholderTextColor="rgba(255,255,255,0.4)" style={[styles.input, styles.textArea]} multiline numberOfLines={3}/>

                    <react_native_1.Text style={styles.inputLabel}>Ticket Label *</react_native_1.Text>
                    <react_native_1.TextInput value={ticketNumber} onChangeText={setTicketNumber} placeholder="e.g. AQUA001" placeholderTextColor="rgba(255,255,255,0.4)" style={styles.input} autoCapitalize="characters"/>

                    <react_native_1.Text style={styles.inputLabel}>Price (USD) *</react_native_1.Text>
                    <react_native_1.TextInput value={price} onChangeText={setPrice} keyboardType={react_native_1.Platform.select({ ios: 'decimal-pad', android: 'decimal-pad' })} placeholder="1.00" placeholderTextColor="rgba(255,255,255,0.4)" style={styles.input}/>

                    <react_native_1.Text style={styles.inputLabel}>How Many Tokens *</react_native_1.Text>
                    <react_native_1.TextInput value={tokenCount} onChangeText={setTokenCount} keyboardType="number-pad" placeholder="Enter token count" placeholderTextColor="rgba(255,255,255,0.4)" style={styles.input}/>

                    <react_native_1.Text style={styles.inputLabel}>Category</react_native_1.Text>
                    <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <react_native_1.View style={styles.rowWrap}>
                        {categories.map(function (cat) { return (<react_native_1.Pressable key={cat} onPress={function () { return setCategory(cat); }} style={[styles.pill, category === cat && styles.pillActive]}>
                            <react_native_1.Text style={category === cat ? styles.pillTxtActive : styles.pillTxt}>
                              {cat}
                            </react_native_1.Text>
                          </react_native_1.Pressable>); })}
                      </react_native_1.View>
                    </react_native_1.ScrollView>

                    <react_native_1.Text style={styles.inputLabel}>Duration</react_native_1.Text>
                    <react_native_1.View style={styles.rowWrap}>
                      {minutesOptions.map(function (m) { return (<react_native_1.Pressable key={m} onPress={function () { return setDuration(m); }} style={[styles.pill, duration === m && styles.pillActive]}>
                          <react_native_1.Text style={duration === m ? styles.pillTxtActive : styles.pillTxt}>
                            {m} min
                          </react_native_1.Text>
                        </react_native_1.Pressable>); })}
                    </react_native_1.View>

                    <react_native_1.View style={styles.actionStack}>
                      <react_native_1.Pressable onPress={handleGenerateTokens} style={styles.hostSecondaryAction} disabled={busy}>
                        <react_native_1.Text numberOfLines={1} style={styles.hostSecondaryActionText}>Generate Tokens</react_native_1.Text>
                      </react_native_1.Pressable>
                      <react_native_1.Pressable onPress={handleStart} style={styles.hostPrimaryAction} disabled={busy}>
                        <react_native_1.Text numberOfLines={1} style={styles.hostPrimaryActionText}>Start Aqua Premium Show</react_native_1.Text>
                      </react_native_1.Pressable>
                    </react_native_1.View>

                    {busy ? <react_native_1.ActivityIndicator color="#8D0000" style={{ marginTop: 10 }}/> : null}

                    {activeShowId ? (<react_native_1.Text style={styles.infoText}>Show ID: {activeShowId}</react_native_1.Text>) : null}

                    {generatedTokens.length > 0 ? (<>
                        <react_native_1.Text style={[styles.sectionLabel, { marginTop: 14 }]}>Generated Tokens</react_native_1.Text>
                        {generatedTokens.map(function (token) { return (<react_native_1.View key={token.ticketId} style={styles.tokenRow}>
                            <react_native_1.View style={{ flex: 1 }}>
                              <react_native_1.Text style={styles.tokenCode}>{token.code}</react_native_1.Text>
                              <react_native_1.Text style={styles.tokenMeta}>
                                {token.status === 'claimed'
                        ? "Claimed by ".concat(token.claimedByUid || 'viewer')
                        : 'Ready to send'}
                              </react_native_1.Text>
                            </react_native_1.View>
                            <react_native_1.Pressable onPress={function () { return handleShareToken(token); }} style={styles.tokenSendBtn}>
                              <react_native_1.Text style={styles.tokenSendText}>Send</react_native_1.Text>
                            </react_native_1.Pressable>
                          </react_native_1.View>); })}
                      </>) : null}

                    <react_native_1.Text style={[styles.sectionLabel, { marginTop: 16 }]}>Controls</react_native_1.Text>
                    <react_native_1.View style={styles.grid}>
                      <LineButton icon="🎟" text="View Passes" onPress={onViewPasses}/>
                      <LineButton icon={chatEnabled ? '💬' : '🔇'} text={chatEnabled ? 'Chat On' : 'Chat Off'} onPress={handleToggleChat}/>
                      <LineButton icon="🪙" text="View Earnings" onPress={onViewEarnings}/>
                      <LineButton icon="📣" text="Share Promo" onPress={handleSharePromo}/>
                      <LineButton icon="🛑" text="End Show" onPress={handleEnd}/>
                    </react_native_1.View>
                  </>) : (<>
                    <react_native_1.Text style={styles.sectionLabel}>Redeem Aqua Premium Access</react_native_1.Text>
                    <react_native_1.Text style={styles.helperText}>
                      Enter the token the host sent you. Access is linked to your account for the show period.
                    </react_native_1.Text>
                    <react_native_1.TextInput value={redeemCode} onChangeText={setRedeemCode} placeholder="ABCD-EFGH" placeholderTextColor="rgba(255,255,255,0.4)" style={styles.input} autoCapitalize="characters"/>
                    <react_native_1.Pressable onPress={handleRedeem} style={styles.redeemPrimaryAction} disabled={busy}>
                      <react_native_1.Text style={styles.redeemPrimaryActionText}>Enter Code</react_native_1.Text>
                    </react_native_1.Pressable>
                    {busy ? <react_native_1.ActivityIndicator color="#00C2FF" style={{ marginTop: 10 }}/> : null}
                    <react_native_1.Text style={[styles.sectionLabel, { marginTop: 18 }]}>My Premium Access</react_native_1.Text>
                    {myAccess.length === 0 ? (<react_native_1.Text style={styles.helperText}>No active Aqua Premium access yet.</react_native_1.Text>) : (myAccess.map(function (item) { return (<react_native_1.View key={"".concat(item.showId, "_").concat(item.ticketId)} style={styles.accessCard}>
                          <react_native_1.Text style={styles.accessTitle}>{item.showTitle}</react_native_1.Text>
                          <react_native_1.Text style={styles.accessMeta}>Status: {item.status}</react_native_1.Text>
                          <react_native_1.Text style={styles.accessMeta}>
                            Valid until:{' '}
                            {item.validUntilMs ? new Date(item.validUntilMs).toLocaleString() : 'Unknown'}
                          </react_native_1.Text>
                          <react_native_1.Pressable onPress={function () { return handleJoinPremiumShow(item); }} style={styles.joinPremiumAction} disabled={busy}>
                            <react_native_1.Text style={styles.joinPremiumActionText}>Join Aqua Premium Show</react_native_1.Text>
                          </react_native_1.Pressable>
                        </react_native_1.View>); }))}
                  </>)}
              </react_native_1.ScrollView>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.Modal>
    </>);
}
function LineButton(_a) {
    var icon = _a.icon, text = _a.text, onPress = _a.onPress, style = _a.style;
    return (<react_native_1.Pressable onPress={onPress} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.logbookAction,
                styles.lineButton,
                pressed && styles.buttonPressed,
                style,
            ];
        }}>
      <react_native_1.Text style={styles.lineButtonIcon}>{icon}</react_native_1.Text>
      <react_native_1.Text style={[styles.logbookActionText, styles.lineButtonText]}>{text}</react_native_1.Text>
    </react_native_1.Pressable>);
}
var styles = react_native_1.StyleSheet.create({
    modalRoot: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    logbookContainer: {
        width: '100%',
        backgroundColor: 'rgba(11,18,36,0.98)',
    },
    logbookPage: {
        padding: 16,
        paddingTop: 20,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeBtn: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#8D0000',
        borderWidth: 1,
        borderColor: '#8D0000',
    },
    closeText: { color: '#FFFFFF', fontWeight: '900' },
    content: {
        paddingBottom: 32,
        gap: 12,
    },
    logbookAction: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
    },
    logbookActionText: {
        color: 'rgba(220,220,240,0.9)',
        fontSize: 18,
        fontWeight: '600',
        fontFamily: react_native_1.Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    logbookActionLabelStrong: {
        fontSize: 19,
        fontWeight: '800',
    },
    buttonPressed: {
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    modeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    modeChip: {
        flex: 1,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        paddingVertical: 10,
        alignItems: 'center',
    },
    hostModeChip: {
        borderColor: '#8D0000',
        backgroundColor: '#8D0000',
    },
    redeemModeChip: {
        borderColor: '#0EA5D9',
        backgroundColor: '#0EA5D9',
    },
    modeChipActive: {
        borderColor: '#00C2FF',
        backgroundColor: 'rgba(0,194,255,0.12)',
    },
    hostModeChipActive: {
        borderColor: '#8D0000',
        backgroundColor: '#8D0000',
    },
    redeemModeChipActive: {
        borderColor: '#00C2FF',
        backgroundColor: 'rgba(0,194,255,0.12)',
    },
    modeChipText: {
        color: '#C9D3DF',
        fontWeight: '700',
    },
    hostModeChipText: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    redeemModeChipText: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    modeChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    sectionLabel: { color: '#B30000', fontSize: 12, marginBottom: 4, fontWeight: '800' },
    helperText: { color: 'rgba(255,255,255,0.68)', fontSize: 12, lineHeight: 18 },
    inputLabel: { color: '#B30000', fontSize: 13, marginTop: 14, marginBottom: 4, fontWeight: '900' },
    input: {
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.35)',
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: react_native_1.Platform.OS === 'ios' ? 'Courier New' : 'monospace',
        paddingVertical: 8,
    },
    textArea: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    pillActive: {
        borderColor: '#8D0000',
        backgroundColor: '#8D0000',
    },
    pillTxt: { color: '#C9D3DF', fontSize: 12, fontWeight: '600' },
    pillTxtActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    actionStack: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    primaryAction: {
        flex: 1,
        backgroundColor: '#006FBD',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#006FBD',
    },
    primaryActionText: { color: '#FFFFFF', fontWeight: '800' },
    secondaryAction: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    secondaryActionText: { color: '#FFFFFF', fontWeight: '700' },
    hostSecondaryAction: {
        flex: 1,
        backgroundColor: '#0EA5D9',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0EA5D9',
    },
    hostSecondaryActionText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 13,
        textAlign: 'center',
    },
    hostPrimaryAction: {
        flex: 1,
        backgroundColor: '#8D0000',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#8D0000',
    },
    hostPrimaryActionText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 12,
        textAlign: 'center',
    },
    redeemPrimaryAction: {
        marginTop: 8,
        backgroundColor: '#0EA5D9',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#0EA5D9',
    },
    redeemPrimaryActionText: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    infoText: {
        color: 'rgba(157,230,255,0.82)',
        fontSize: 11,
        marginTop: 8,
    },
    tokenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    tokenCode: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    tokenMeta: {
        color: 'rgba(255,255,255,0.62)',
        fontSize: 11,
        marginTop: 3,
    },
    tokenSendBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: 'rgba(0,194,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(0,194,255,0.34)',
    },
    tokenSendText: {
        color: '#CFF6FF',
        fontWeight: '800',
        fontSize: 12,
    },
    accessCard: {
        paddingVertical: 12,
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    accessTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    accessMeta: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 12,
        marginTop: 4,
    },
    joinPremiumAction: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#8D0000',
        marginTop: 12,
    },
    joinPremiumActionText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    grid: {
        gap: 10,
    },
    lineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 0,
    },
    lineButtonIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    lineButtonText: {
        textTransform: 'none',
    },
});
