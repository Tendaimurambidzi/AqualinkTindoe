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
    o["default"] = v;
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
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var auth_1 = __importDefault(require("@react-native-firebase/auth"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var functions_1 = __importDefault(require("@react-native-firebase/functions"));
var storage_1 = __importDefault(require("@react-native-firebase/storage"));
var react_native_fs_1 = __importDefault(require("react-native-fs"));
var react_native_sound_1 = __importDefault(require("react-native-sound"));
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var premiumService_1 = require("../services/premiumService");
var SCREEN_HEIGHT = react_native_1.Dimensions.get('window').height;
var LIVE_INVITE_WINDOW_MS = 3 * 60 * 1000;
var COMMENT_FLOAT_MAX = 5;
var COMMENT_FLOAT_LIFETIME_MS = 6800;
var COMMENT_STACK_GAP = 58;
var REACTION_EMOJIS = [
    '❤️',
    '💙',
    '🩵',
    '🫶',
    '🫂',
    '🤗',
    '💕',
    '💖',
    '😍',
    '😘',
    '🔥',
    '✨',
    '👏',
    '🙌',
    '💯',
    '😂',
    '🌊',
    '💎',
];
var LIVE_SOUND_EFFECTS = [
    {
        id: 'underwater_explosion',
        label: 'Large Underwater Explosion',
        icon: '🌊',
        file: 'large_underwater_explosion_190270',
    },
    {
        id: 'downfall',
        label: 'Downfall',
        icon: '💥',
        file: 'downfall_3_208028',
    },
    {
        id: 'falcon',
        label: 'Falcon',
        icon: '🦅',
        file: 'falcon',
    },
    {
        id: 'sci_fi',
        label: 'Sci-Fi',
        icon: '🛸',
        file: 'sci_fi_sound_effect_designed_circuits_hum_10_200831',
    },
];
var PREMIUM_LIVE_VIDEO_DIMENSIONS = { width: 960, height: 540 };
var PREMIUM_LIVE_VIDEO_BITRATE = 1000000;
var PREMIUM_LIVE_VIDEO_MIN_BITRATE = 450000;
var PREMIUM_LIVE_VIDEO_FRAME_RATE = 24;
var PREMIUM_LIVE_VIDEO_MIN_FRAME_RATE = 12;
var PREMIUM_SCREEN_SHARE_DIMENSIONS = { width: 1280, height: 720 };
var PREMIUM_SCREEN_SHARE_BITRATE = 2200;
var PREMIUM_SCREEN_SHARE_FRAME_RATE = 15;
var DRIFT_EXPO_VIDEO_DIMENSIONS = { width: 854, height: 480 };
var DRIFT_EXPO_VIDEO_BITRATE = 1100000;
var DRIFT_EXPO_VIDEO_MIN_BITRATE = 650000;
var DRIFT_EXPO_VIDEO_FRAME_RATE = 20;
var DRIFT_EXPO_VIDEO_MIN_FRAME_RATE = 15;
var LARGE_SHARED_FILE_BYTES = 24 * 1024 * 1024;
var VERY_LARGE_SHARED_FILE_BYTES = 80 * 1024 * 1024;
var MAX_SHARED_FILE_BYTES = 180 * 1024 * 1024;
var MAX_CONVERTIBLE_FILE_BYTES = 48 * 1024 * 1024;
var MAX_VISIBLE_PREMIUM_GALLERY_TILES = 4;
var mapRtcUidFromUserId = function (value) {
    var seed = String(value || '').trim() || '0';
    var hash = 0;
    for (var i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return (hash % 2147483646) + 1;
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
var formatTimestamp = function (value) {
    if (!value)
        return '';
    try {
        return new Date(value).toLocaleString();
    }
    catch (_a) {
        return '';
    }
};
var DEFAULT_PRESENTATION_SLIDE_SECONDS = 10;
var SHARED_DOC_MAX_INK_POINTS = 480;
var SHARED_DOC_INK_POINT_SPACING_PX = 2;
var SHARED_DOC_ERASER_RADIUS_PX = 52;
var formatCountdown = function (diffMs) {
    var totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    if (hours > 0) {
        return "".concat(hours, "h ").concat(String(minutes).padStart(2, '0'), "m ").concat(String(seconds).padStart(2, '0'), "s");
    }
    return "".concat(minutes, "m ").concat(String(seconds).padStart(2, '0'), "s");
};
var normalizeSearchResult = function (entry) {
    var kind = String((entry === null || entry === void 0 ? void 0 : entry.kind) || '').trim().toLowerCase();
    if (kind && kind !== 'user')
        return null;
    var source = (entry === null || entry === void 0 ? void 0 : entry.extra) && typeof entry.extra === 'object' ? entry.extra : entry;
    var uid = String((source === null || source === void 0 ? void 0 : source.uid) || (entry === null || entry === void 0 ? void 0 : entry.uid) || (source === null || source === void 0 ? void 0 : source.id) || (entry === null || entry === void 0 ? void 0 : entry.id) || (source === null || source === void 0 ? void 0 : source.userId) || (entry === null || entry === void 0 ? void 0 : entry.userId) || '').trim();
    if (!uid)
        return null;
    var displayName = String((source === null || source === void 0 ? void 0 : source.displayName) ||
        (source === null || source === void 0 ? void 0 : source.name) ||
        (source === null || source === void 0 ? void 0 : source.userName) ||
        (entry === null || entry === void 0 ? void 0 : entry.label) ||
        (source === null || source === void 0 ? void 0 : source.username) ||
        (source === null || source === void 0 ? void 0 : source.handle) ||
        'User').trim();
    var username = String((source === null || source === void 0 ? void 0 : source.username) || (source === null || source === void 0 ? void 0 : source.handle) || (source === null || source === void 0 ? void 0 : source.userName) || '').trim();
    return {
        uid: uid,
        name: displayName || 'User',
        username: username || null,
        secondary: username && username !== displayName
            ? "@".concat(username.replace(/^[@/]+/, ''))
            : null,
        photo: (source === null || source === void 0 ? void 0 : source.photo) ||
            (source === null || source === void 0 ? void 0 : source.photoURL) ||
            (source === null || source === void 0 ? void 0 : source.avatar) ||
            (source === null || source === void 0 ? void 0 : source.userPhoto) ||
            null,
    };
};
var FreshDriftExpoModal = function (_a) {
    var visible = _a.visible, onClose = _a.onClose, isChartered = _a.isChartered, premiumShowId = _a.premiumShowId, inviteJoinPreset = _a.inviteJoinPreset, searchOceanEntities = _a.searchOceanEntities;
    var _b = react_native_1.NativeModules, AudioPicker = _b.AudioPicker, PdfRenderer = _b.PdfRenderer, AgoraRtcNg = _b.AgoraRtcNg;
    var insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    var Agora = (0, react_1.useMemo)(function () {
        try {
            return require('react-native-agora');
        }
        catch (_a) {
            return null;
        }
    }, []);
    var cfg = (0, react_1.useMemo)(function () {
        try {
            return require('../../liveConfig');
        }
        catch (_a) {
            return null;
        }
    }, []);
    var RNVideo = (0, react_1.useMemo)(function () {
        try {
            return require('react-native-video').default;
        }
        catch (_a) {
            return null;
        }
    }, []);
    var appId = String((cfg === null || cfg === void 0 ? void 0 : cfg.AGORA_APP_ID) || '').trim();
    var defaultChannel = String((cfg === null || cfg === void 0 ? void 0 : cfg.AGORA_CHANNEL_NAME) || 'MoMoDrift').trim();
    var engineRef = (0, react_1.useRef)(null);
    var joinedChannelRef = (0, react_1.useRef)(null);
    var joiningChannelRef = (0, react_1.useRef)(null);
    var premiumValidationBypassShowIdRef = (0, react_1.useRef)(null);
    var reactionTrayTimerRef = (0, react_1.useRef)(null);
    var roomRef = (0, react_1.useRef)(null);
    var activeInkPointRef = (0, react_1.useRef)(null);
    var activeInkStrokeIdRef = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(false), isBusy = _c[0], setIsBusy = _c[1];
    var _d = (0, react_1.useState)('Ready'), statusText = _d[0], setStatusText = _d[1];
    var _e = (0, react_1.useState)(null), roomId = _e[0], setRoomId = _e[1];
    var _f = (0, react_1.useState)(''), roomChannel = _f[0], setRoomChannel = _f[1];
    var _g = (0, react_1.useState)('Drift Expo'), roomTitle = _g[0], setRoomTitle = _g[1];
    var _h = (0, react_1.useState)(null), roomHostUid = _h[0], setRoomHostUid = _h[1];
    var _j = (0, react_1.useState)(null), roomPremiumShowId = _j[0], setRoomPremiumShowId = _j[1];
    var _k = (0, react_1.useState)(null), premiumMeta = _k[0], setPremiumMeta = _k[1];
    var _l = (0, react_1.useState)(Date.now()), clockNowMs = _l[0], setClockNowMs = _l[1];
    var _m = (0, react_1.useState)(null), pendingPremiumJoin = _m[0], setPendingPremiumJoin = _m[1];
    var _o = (0, react_1.useState)('Host'), roomHostName = _o[0], setRoomHostName = _o[1];
    var _p = (0, react_1.useState)(0), myRtcUid = _p[0], setMyRtcUid = _p[1];
    var _q = (0, react_1.useState)(false), joined = _q[0], setJoined = _q[1];
    var _r = (0, react_1.useState)([]), remoteUids = _r[0], setRemoteUids = _r[1];
    var _s = (0, react_1.useState)({}), recentSpeakerAt = _s[0], setRecentSpeakerAt = _s[1];
    var _t = (0, react_1.useState)([]), participants = _t[0], setParticipants = _t[1];
    var _u = (0, react_1.useState)(false), showAudiencePanel = _u[0], setShowAudiencePanel = _u[1];
    var _v = (0, react_1.useState)({}), participantTicketLabels = _v[0], setParticipantTicketLabels = _v[1];
    var _w = (0, react_1.useState)([]), comments = _w[0], setComments = _w[1];
    var _x = (0, react_1.useState)(''), commentText = _x[0], setCommentText = _x[1];
    var _y = (0, react_1.useState)(null), replyTarget = _y[0], setReplyTarget = _y[1];
    var _z = (0, react_1.useState)(false), micMuted = _z[0], setMicMuted = _z[1];
    var _0 = (0, react_1.useState)(false), cameraOff = _0[0], setCameraOff = _0[1];
    var _1 = (0, react_1.useState)(false), handRaised = _1[0], setHandRaised = _1[1];
    var _2 = (0, react_1.useState)(null), networkWarning = _2[0], setNetworkWarning = _2[1];
    var _3 = (0, react_1.useState)(true), showComments = _3[0], setShowComments = _3[1];
    var _4 = (0, react_1.useState)(false), showInvitePanel = _4[0], setShowInvitePanel = _4[1];
    var _5 = (0, react_1.useState)(''), inviteQuery = _5[0], setInviteQuery = _5[1];
    var _6 = (0, react_1.useState)([]), inviteResults = _6[0], setInviteResults = _6[1];
    var _7 = (0, react_1.useState)([]), onlineInvitees = _7[0], setOnlineInvitees = _7[1];
    var _8 = (0, react_1.useState)(false), inviteLoading = _8[0], setInviteLoading = _8[1];
    var _9 = (0, react_1.useState)(null), inviteBusyUid = _9[0], setInviteBusyUid = _9[1];
    var _10 = (0, react_1.useState)(false), showReactionPicker = _10[0], setShowReactionPicker = _10[1];
    var _11 = (0, react_1.useState)(null), soundBadgeLabel = _11[0], setSoundBadgeLabel = _11[1];
    var _12 = (0, react_1.useState)(false), showDocsPanel = _12[0], setShowDocsPanel = _12[1];
    var _13 = (0, react_1.useState)([]), sharedDocs = _13[0], setSharedDocs = _13[1];
    var _14 = (0, react_1.useState)(null), currentSharedDocId = _14[0], setCurrentSharedDocId = _14[1];
    var _15 = (0, react_1.useState)(null), currentSharedDocStage = _15[0], setCurrentSharedDocStage = _15[1];
    var _16 = (0, react_1.useState)(null), currentSharedDocPreviewTitle = _16[0], setCurrentSharedDocPreviewTitle = _16[1];
    var _17 = (0, react_1.useState)(null), currentSharedDocPreviewKind = _17[0], setCurrentSharedDocPreviewKind = _17[1];
    var _18 = (0, react_1.useState)(null), currentSharedDocDownloadUrl = _18[0], setCurrentSharedDocDownloadUrl = _18[1];
    var _19 = (0, react_1.useState)(null), currentSharedDocStoragePath = _19[0], setCurrentSharedDocStoragePath = _19[1];
    var _20 = (0, react_1.useState)(null), currentSharedDocFileName = _20[0], setCurrentSharedDocFileName = _20[1];
    var _21 = (0, react_1.useState)(null), currentSharedDocFileSizeBytes = _21[0], setCurrentSharedDocFileSizeBytes = _21[1];
    var _22 = (0, react_1.useState)(0), currentSharedDocPage = _22[0], setCurrentSharedDocPage = _22[1];
    var _23 = (0, react_1.useState)(false), currentSharedDocSlideShow = _23[0], setCurrentSharedDocSlideShow = _23[1];
    var _24 = (0, react_1.useState)(DEFAULT_PRESENTATION_SLIDE_SECONDS), currentSharedDocSlideSeconds = _24[0], setCurrentSharedDocSlideSeconds = _24[1];
    var _25 = (0, react_1.useState)(null), currentPresentationTool = _25[0], setCurrentPresentationTool = _25[1];
    var _26 = (0, react_1.useState)(null), sharedDocMarker = _26[0], setSharedDocMarker = _26[1];
    var _27 = (0, react_1.useState)(null), sharedDocStatusText = _27[0], setSharedDocStatusText = _27[1];
    var _28 = (0, react_1.useState)(false), docBusy = _28[0], setDocBusy = _28[1];
    var _29 = (0, react_1.useState)(null), activeDoc = _29[0], setActiveDoc = _29[1];
    var _30 = (0, react_1.useState)(false), isDocMinimized = _30[0], setIsDocMinimized = _30[1];
    var _31 = (0, react_1.useState)(false), screenShareActive = _31[0], setScreenShareActive = _31[1];
    var _32 = (0, react_1.useState)(null), screenShareOwnerUid = _32[0], setScreenShareOwnerUid = _32[1];
    var _33 = (0, react_1.useState)(null), screenShareOwnerName = _33[0], setScreenShareOwnerName = _33[1];
    var _34 = (0, react_1.useState)(0), screenShareOwnerRtcUid = _34[0], setScreenShareOwnerRtcUid = _34[1];
    var _35 = (0, react_1.useState)(false), screenShareStarting = _35[0], setScreenShareStarting = _35[1];
    var _36 = (0, react_1.useState)(false), localScreenShareActive = _36[0], setLocalScreenShareActive = _36[1];
    var allowPremiumScreenShare = false;
    var _37 = (0, react_1.useState)(null), pdfLocalPath = _37[0], setPdfLocalPath = _37[1];
    var _38 = (0, react_1.useState)(0), pdfPageCount = _38[0], setPdfPageCount = _38[1];
    var _39 = (0, react_1.useState)(0), pdfPageIndex = _39[0], setPdfPageIndex = _39[1];
    var _40 = (0, react_1.useState)(null), pdfPreviewUri = _40[0], setPdfPreviewUri = _40[1];
    var _41 = (0, react_1.useState)(0), pdfPreviewWidth = _41[0], setPdfPreviewWidth = _41[1];
    var _42 = (0, react_1.useState)(0), pdfPreviewHeight = _42[0], setPdfPreviewHeight = _42[1];
    var _43 = (0, react_1.useState)(1), pdfZoomLevel = _43[0], setPdfZoomLevel = _43[1];
    var _44 = (0, react_1.useState)(1), currentSharedDocZoom = _44[0], setCurrentSharedDocZoom = _44[1];
    var _45 = (0, react_1.useState)(0), currentSharedDocPanX = _45[0], setCurrentSharedDocPanX = _45[1];
    var _46 = (0, react_1.useState)(0), currentSharedDocPanY = _46[0], setCurrentSharedDocPanY = _46[1];
    var _47 = (0, react_1.useState)([]), sharedDocInkPoints = _47[0], setSharedDocInkPoints = _47[1];
    var _48 = (0, react_1.useState)(0), pdfFrameWidth = _48[0], setPdfFrameWidth = _48[1];
    var _49 = (0, react_1.useState)(0), pdfFrameHeight = _49[0], setPdfFrameHeight = _49[1];
    var _50 = (0, react_1.useState)([]), recentDrifts = _50[0], setRecentDrifts = _50[1];
    var _51 = (0, react_1.useState)(null), replayItem = _51[0], setReplayItem = _51[1];
    var _52 = (0, react_1.useState)(false), engineReady = _52[0], setEngineReady = _52[1];
    var _53 = (0, react_1.useState)([]), floatingComments = _53[0], setFloatingComments = _53[1];
    var _54 = (0, react_1.useState)([]), floatingReactions = _54[0], setFloatingReactions = _54[1];
    var seenCommentIdsRef = (0, react_1.useRef)(new Set());
    var seenReactionIdsRef = (0, react_1.useRef)(new Set());
    var handledSoundEventIdsRef = (0, react_1.useRef)(new Set());
    var soundBadgeTimerRef = (0, react_1.useRef)(null);
    var docsStatusPulseAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var lastAutoOpenedDocIdRef = (0, react_1.useRef)(null);
    var slideshowTimerRef = (0, react_1.useRef)(null);
    var openingPdfDocIdRef = (0, react_1.useRef)(null);
    var currentShareUploadTaskRef = (0, react_1.useRef)(null);
    var currentShareAttemptIdRef = (0, react_1.useRef)(0);
    var docsPanelAutoOpenedRef = (0, react_1.useRef)(false);
    var localSharedDocPathRef = (0, react_1.useRef)({});
    var primedPdfDocIdsRef = (0, react_1.useRef)(new Set());
    var pdfPageCacheRef = (0, react_1.useRef)({});
    var pdfPagePrefetchingRef = (0, react_1.useRef)({});
    var pendingScreenShareStartRef = (0, react_1.useRef)(false);
    var pdfVerticalScrollRef = (0, react_1.useRef)(null);
    var pdfHorizontalScrollRef = (0, react_1.useRef)(null);
    var pendingViewportRef = (0, react_1.useRef)({ x: 0, y: 0 });
    var viewportSyncTimerRef = (0, react_1.useRef)(null);
    var me = (0, auth_1.default)().currentUser;
    var meUid = (me === null || me === void 0 ? void 0 : me.uid) || '';
    var meName = String((me === null || me === void 0 ? void 0 : me.displayName) || ((me === null || me === void 0 ? void 0 : me.email) ? me.email.split('@')[0] : '') || 'Viber');
    var mePhoto = (me === null || me === void 0 ? void 0 : me.photoURL) || null;
    var isPremiumRoom = !!roomPremiumShowId;
    var isPremiumHost = !!(roomPremiumShowId && roomHostUid && meUid && roomHostUid === meUid);
    var resolvedPremiumShowId = roomPremiumShowId || premiumShowId || null;
    var isCurrentUserScreenSharer = (0, react_1.useMemo)(function () { return !!(screenShareActive && screenShareOwnerUid && meUid && screenShareOwnerUid === meUid); }, [meUid, screenShareActive, screenShareOwnerUid]);
    var screenShareRenderRtcUid = (0, react_1.useMemo)(function () {
        var _a;
        if (screenShareOwnerRtcUid > 0)
            return screenShareOwnerRtcUid;
        if (!screenShareOwnerUid)
            return 0;
        return Number(((_a = participants.find(function (item) { return item.uid === screenShareOwnerUid; })) === null || _a === void 0 ? void 0 : _a.rtcUid) ||
            mapRtcUidFromUserId(screenShareOwnerUid) ||
            0);
    }, [participants, screenShareOwnerRtcUid, screenShareOwnerUid]);
    var rtcConnection = (0, react_1.useMemo)(function () {
        return roomChannel
            ? {
                channelId: roomChannel,
                localUid: myRtcUid || 0,
            }
            : undefined;
    }, [myRtcUid, roomChannel]);
    var canControlCurrentSharedDoc = (0, react_1.useMemo)(function () {
        return !!(meUid &&
            currentSharedDocId &&
            activeDoc &&
            activeDoc.id === currentSharedDocId &&
            activeDoc.sharedByUid &&
            activeDoc.sharedByUid === meUid);
    }, [activeDoc, currentSharedDocId, meUid]);
    var premiumCountdownLabel = (0, react_1.useMemo)(function () {
        if (!premiumMeta)
            return null;
        if (premiumMeta.status === 'scheduled' && premiumMeta.startsAtMs > clockNowMs) {
            return "Starts ".concat(formatCountdown(premiumMeta.startsAtMs - clockNowMs));
        }
        if (premiumMeta.endsAtMs > clockNowMs) {
            return "Ends ".concat(formatCountdown(premiumMeta.endsAtMs - clockNowMs));
        }
        return premiumMeta.status === 'ended' ? 'Show ended' : 'Closing soon';
    }, [clockNowMs, premiumMeta]);
    var premiumStatusLine = (0, react_1.useMemo)(function () {
        if (!premiumMeta)
            return null;
        var viewerLabel = isPremiumHost ? 'Host view' : 'Guest view';
        var windowLabel = premiumMeta.endsAtMs
            ? "Window: ".concat(formatTimestamp(premiumMeta.startsAtMs), " - ").concat(formatTimestamp(premiumMeta.endsAtMs))
            : null;
        return [viewerLabel, windowLabel].filter(Boolean).join(' | ');
    }, [isPremiumHost, premiumMeta]);
    var audienceRows = (0, react_1.useMemo)(function () {
        return participants.map(function (item) { return ({
            uid: item.uid,
            label: item.isHost || item.uid === roomHostUid
                ? 'Host'
                : "".concat(participantTicketLabels[item.uid] || "Ticket ".concat(String(item.uid || '').slice(-4).toUpperCase())).concat(item.muted ? ' • muted' : ''),
        }); });
    }, [participantTicketLabels, participants, roomHostUid]);
    var premiumChatRows = (0, react_1.useMemo)(function () { return comments.slice(-12); }, [comments]);
    var raisedHandParticipants = (0, react_1.useMemo)(function () { return participants.filter(function (item) { return item.raisedHand && item.uid !== meUid; }); }, [meUid, participants]);
    var isGuestViewingSharedDoc = (0, react_1.useMemo)(function () { return !!currentSharedDocId && !canControlCurrentSharedDoc; }, [canControlCurrentSharedDoc, currentSharedDocId]);
    var sharedDocProgressCard = (0, react_1.useMemo)(function () {
        if (!sharedDocStatusText || activeDoc)
            return null;
        var stage = currentSharedDocStage || (currentSharedDocId ? 'uploading' : 'selected');
        var title = String(currentSharedDocPreviewTitle || '').trim();
        var kind = String(currentSharedDocPreviewKind || '').trim().toUpperCase();
        var detail = sharedDocStatusText;
        if (stage === 'choosing')
            detail = "".concat(meUid === roomHostUid ? 'Choosing a file...' : sharedDocStatusText);
        if (stage === 'selected' && title)
            detail = "Selected ".concat(title).concat(kind ? " (".concat(kind, ")") : '');
        if (stage === 'uploading' && title)
            detail = "Uploading ".concat(title).concat(kind ? " (".concat(kind, ")") : '');
        if (stage === 'converting' && title)
            detail = "Converting ".concat(title).concat(kind ? " (".concat(kind, ")") : '');
        if (stage === 'ready' && title)
            detail = "".concat(title, " is ready to open");
        return {
            title: title || 'Shared file',
            detail: detail,
        };
    }, [
        activeDoc,
        currentSharedDocId,
        currentSharedDocPreviewKind,
        currentSharedDocPreviewTitle,
        currentSharedDocStage,
        meUid,
        roomHostUid,
        sharedDocStatusText,
    ]);
    var applyStrongRtcProfile = (0, react_1.useCallback)(function (engine, opts) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23;
        if (!engine)
            return;
        var isPremiumProfile = isPremiumRoom;
        var presentationAudioOnly = !!(opts === null || opts === void 0 ? void 0 : opts.presentationAudioOnly);
        var videoDimensions = isPremiumProfile
            ? PREMIUM_LIVE_VIDEO_DIMENSIONS
            : DRIFT_EXPO_VIDEO_DIMENSIONS;
        var videoBitrate = isPremiumProfile
            ? PREMIUM_LIVE_VIDEO_BITRATE
            : DRIFT_EXPO_VIDEO_BITRATE;
        var videoMinBitrate = isPremiumProfile
            ? PREMIUM_LIVE_VIDEO_MIN_BITRATE
            : DRIFT_EXPO_VIDEO_MIN_BITRATE;
        var videoFrameRate = isPremiumProfile
            ? PREMIUM_LIVE_VIDEO_FRAME_RATE
            : DRIFT_EXPO_VIDEO_FRAME_RATE;
        var videoMinFrameRate = isPremiumProfile
            ? PREMIUM_LIVE_VIDEO_MIN_FRAME_RATE
            : DRIFT_EXPO_VIDEO_MIN_FRAME_RATE;
        var config = {
            dimensions: videoDimensions,
            frameRate: videoFrameRate,
            minFrameRate: videoMinFrameRate,
            bitrate: videoBitrate,
            minBitrate: videoMinBitrate,
            orientationMode: (_b = (_a = Agora === null || Agora === void 0 ? void 0 : Agora.OrientationMode) === null || _a === void 0 ? void 0 : _a.OrientationModeAdaptive) !== null && _b !== void 0 ? _b : 0,
            degradationPreference: (_f = (_d = (_c = Agora === null || Agora === void 0 ? void 0 : Agora.DegradationPreference) === null || _c === void 0 ? void 0 : _c.MaintainBalanced) !== null && _d !== void 0 ? _d : (_e = Agora === null || Agora === void 0 ? void 0 : Agora.DegradationPreference) === null || _e === void 0 ? void 0 : _e.MaintainQuality) !== null && _f !== void 0 ? _f : 0,
        };
        var audioProfile = (_t = (_r = (_p = (_m = (_k = (_h = (_g = Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfileType) === null || _g === void 0 ? void 0 : _g.AudioProfileMusicHighQualityStereo) !== null && _h !== void 0 ? _h : (_j = Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfileType) === null || _j === void 0 ? void 0 : _j.AudioProfileMusicHighQuality) !== null && _k !== void 0 ? _k : (_l = Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfileType) === null || _l === void 0 ? void 0 : _l.AudioProfileDefault) !== null && _m !== void 0 ? _m : (_o = Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfile) === null || _o === void 0 ? void 0 : _o.MusicHighQualityStereo) !== null && _p !== void 0 ? _p : (_q = Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfile) === null || _q === void 0 ? void 0 : _q.MusicHighQuality) !== null && _r !== void 0 ? _r : (_s = Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfile) === null || _s === void 0 ? void 0 : _s.Default) !== null && _t !== void 0 ? _t : 0;
        var audioScenario = (_3 = (_1 = (_y = (_w = (isPremiumProfile
            ? (_u = Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenarioType) === null || _u === void 0 ? void 0 : _u.AudioScenarioMeeting
            : (_v = Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenarioType) === null || _v === void 0 ? void 0 : _v.AudioScenarioChatroom)) !== null && _w !== void 0 ? _w : (_x = Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenarioType) === null || _x === void 0 ? void 0 : _x.AudioScenarioDefault) !== null && _y !== void 0 ? _y : (isPremiumProfile
            ? (_z = Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenario) === null || _z === void 0 ? void 0 : _z.Meeting
            : (_0 = Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenario) === null || _0 === void 0 ? void 0 : _0.Chatroom)) !== null && _1 !== void 0 ? _1 : (_2 = Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenario) === null || _2 === void 0 ? void 0 : _2.Default) !== null && _3 !== void 0 ? _3 : 0;
        try {
            (_4 = engine.setVideoEncoderConfiguration) === null || _4 === void 0 ? void 0 : _4.call(engine, config);
        }
        catch (_24) { }
        try {
            (_5 = engine.enableDualStreamMode) === null || _5 === void 0 ? void 0 : _5.call(engine, true, {
                width: isPremiumProfile ? 480 : 360,
                height: isPremiumProfile ? 270 : 202,
                framerate: 12,
                bitrate: isPremiumProfile ? 320 : 240,
            });
        }
        catch (_25) { }
        try {
            (_6 = engine.setRemoteSubscribeFallbackOption) === null || _6 === void 0 ? void 0 : _6.call(engine, (_8 = (_7 = Agora === null || Agora === void 0 ? void 0 : Agora.StreamFallbackOptions) === null || _7 === void 0 ? void 0 : _7.StreamFallbackOptionVideoStreamLow) !== null && _8 !== void 0 ? _8 : 1);
        }
        catch (_26) { }
        try {
            (_9 = engine.setRemoteDefaultVideoStreamType) === null || _9 === void 0 ? void 0 : _9.call(engine, 1);
        }
        catch (_27) { }
        try {
            (_10 = engine.setLocalPublishFallbackOption) === null || _10 === void 0 ? void 0 : _10.call(engine, presentationAudioOnly
                ? (_12 = (_11 = Agora === null || Agora === void 0 ? void 0 : Agora.StreamFallbackOptions) === null || _11 === void 0 ? void 0 : _11.StreamFallbackOptionDisabled) !== null && _12 !== void 0 ? _12 : 0
                : (_14 = (_13 = Agora === null || Agora === void 0 ? void 0 : Agora.StreamFallbackOptions) === null || _13 === void 0 ? void 0 : _13.StreamFallbackOptionVideoStreamLow) !== null && _14 !== void 0 ? _14 : 1);
        }
        catch (_28) { }
        try {
            (_15 = engine.setAudioProfile) === null || _15 === void 0 ? void 0 : _15.call(engine, audioProfile, audioScenario);
        }
        catch (_29) { }
        try {
            (_16 = engine.setAudioScenario) === null || _16 === void 0 ? void 0 : _16.call(engine, audioScenario);
        }
        catch (_30) { }
        try {
            (_17 = engine.setAINSMode) === null || _17 === void 0 ? void 0 : _17.call(engine, true, (_19 = (_18 = Agora === null || Agora === void 0 ? void 0 : Agora.AudioAinsMode) === null || _18 === void 0 ? void 0 : _18.AINSModeAggressive) !== null && _19 !== void 0 ? _19 : 2);
        }
        catch (_31) { }
        try {
            (_20 = engine.setParameters) === null || _20 === void 0 ? void 0 : _20.call(engine, '{"che.video.adaptive_bitrate":true}');
        }
        catch (_32) { }
        try {
            (_21 = engine.setParameters) === null || _21 === void 0 ? void 0 : _21.call(engine, '{"rtc.video.enable_hw_encoder":true}');
        }
        catch (_33) { }
        try {
            (_22 = engine.setParameters) === null || _22 === void 0 ? void 0 : _22.call(engine, '{"rtc.video.enable_hw_decoder":true}');
        }
        catch (_34) { }
        try {
            (_23 = engine.setParameters) === null || _23 === void 0 ? void 0 : _23.call(engine, '{"che.audio.force_bluetooth_a2dp":false}');
        }
        catch (_35) { }
    }, [
        Agora === null || Agora === void 0 ? void 0 : Agora.AudioAinsMode,
        Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfile,
        Agora === null || Agora === void 0 ? void 0 : Agora.AudioProfileType,
        Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenario,
        Agora === null || Agora === void 0 ? void 0 : Agora.AudioScenarioType,
        Agora === null || Agora === void 0 ? void 0 : Agora.DegradationPreference,
        Agora === null || Agora === void 0 ? void 0 : Agora.OrientationMode,
        Agora === null || Agora === void 0 ? void 0 : Agora.StreamFallbackOptions,
        isPremiumRoom,
    ]);
    var sharedDocInkSegments = (0, react_1.useMemo)(function () {
        var segments = [];
        for (var index = 1; index < sharedDocInkPoints.length; index += 1) {
            var previous = sharedDocInkPoints[index - 1];
            var current = sharedDocInkPoints[index];
            var sameStroke = (previous === null || previous === void 0 ? void 0 : previous.strokeId) && (current === null || current === void 0 ? void 0 : current.strokeId)
                ? previous.strokeId === current.strokeId
                : Math.abs(previous.x - current.x) * pdfFrameWidth <= 18 &&
                    Math.abs(previous.y - current.y) * pdfFrameHeight <= 18;
            if (!sameStroke)
                continue;
            var fromX = previous.x * pdfFrameWidth;
            var fromY = previous.y * pdfFrameHeight;
            var toX = current.x * pdfFrameWidth;
            var toY = current.y * pdfFrameHeight;
            var deltaX = toX - fromX;
            var deltaY = toY - fromY;
            var width = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (width < 1)
                continue;
            var thickness = Math.max(previous.size, current.size);
            segments.push({
                id: "".concat(previous.id, "_").concat(current.id),
                left: (fromX + toX) / 2 - width / 2,
                top: (fromY + toY) / 2 - thickness / 2,
                width: width,
                angle: "".concat((Math.atan2(deltaY, deltaX) * 180) / Math.PI, "deg"),
                color: current.color || previous.color || '#E11D48',
                thickness: thickness,
            });
        }
        return segments;
    }, [pdfFrameHeight, pdfFrameWidth, sharedDocInkPoints]);
    var currentSharedDocEntry = (0, react_1.useMemo)(function () {
        if (!currentSharedDocId)
            return null;
        var fromList = sharedDocs.find(function (doc) { return doc.id === currentSharedDocId; }) || null;
        if (fromList)
            return fromList;
        if (!currentSharedDocPreviewTitle && !currentSharedDocFileName)
            return null;
        return {
            id: currentSharedDocId,
            title: String(currentSharedDocPreviewTitle || currentSharedDocFileName || 'Shared PDF'),
            fileName: String(currentSharedDocFileName || 'shared.pdf'),
            downloadUrl: String(currentSharedDocDownloadUrl || ''),
            storagePath: String(currentSharedDocStoragePath || ''),
            fileSizeBytes: currentSharedDocFileSizeBytes,
            sharedByName: 'Host',
            createdAtMs: Date.now(),
            status: String(currentSharedDocStage || 'uploading'),
            sourceKind: currentSharedDocPreviewKind,
            errorMessage: null,
        };
    }, [
        currentSharedDocDownloadUrl,
        currentSharedDocFileName,
        currentSharedDocFileSizeBytes,
        currentSharedDocId,
        currentSharedDocPreviewKind,
        currentSharedDocPreviewTitle,
        currentSharedDocStage,
        currentSharedDocStoragePath,
        sharedDocs,
    ]);
    var visibleSharedDocs = (0, react_1.useMemo)(function () { return []; }, []);
    var pdfDisplayMetrics = (0, react_1.useMemo)(function () {
        var frameWidth = Math.max(0, pdfFrameWidth - 20);
        var frameHeight = Math.max(0, pdfFrameHeight - 20);
        if (!pdfPreviewWidth || !pdfPreviewHeight || !frameWidth || !frameHeight) {
            return {
                width: '100%',
                height: '100%',
            };
        }
        var fitScale = Math.min(frameWidth / pdfPreviewWidth, frameHeight / pdfPreviewHeight);
        var safeScale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1;
        return {
            width: Math.max(220, Math.round(pdfPreviewWidth * safeScale * pdfZoomLevel)),
            height: Math.max(300, Math.round(pdfPreviewHeight * safeScale * pdfZoomLevel)),
        };
    }, [pdfFrameHeight, pdfFrameWidth, pdfPreviewHeight, pdfPreviewWidth, pdfZoomLevel]);
    (0, react_1.useEffect)(function () {
        roomRef.current =
            roomId && roomChannel
                ? { id: roomId, channel: roomChannel, title: roomTitle, hostUid: roomHostUid }
                : null;
    }, [roomChannel, roomHostUid, roomId, roomTitle]);
    var resetState = (0, react_1.useCallback)(function () {
        setIsBusy(false);
        setStatusText('Ready');
        setRoomId(null);
        setRoomChannel('');
        setRoomTitle('Drift Expo');
        setRoomHostUid(null);
        setRoomPremiumShowId(null);
        setPremiumMeta(null);
        setClockNowMs(Date.now());
        setPendingPremiumJoin(null);
        setRoomHostName('Host');
        setMyRtcUid(0);
        setJoined(false);
        setRemoteUids([]);
        setParticipants([]);
        setShowAudiencePanel(false);
        setParticipantTicketLabels({});
        setComments([]);
        setCommentText('');
        setReplyTarget(null);
        setMicMuted(false);
        setCameraOff(false);
        setNetworkWarning(null);
        setShowComments(true);
        setShowInvitePanel(false);
        setInviteQuery('');
        setInviteResults([]);
        setOnlineInvitees([]);
        setInviteLoading(false);
        setInviteBusyUid(null);
        setShowReactionPicker(false);
        setSoundBadgeLabel(null);
        setShowDocsPanel(false);
        setSharedDocs([]);
        setSharedDocStatusText(null);
        setScreenShareActive(false);
        setScreenShareOwnerUid(null);
        setScreenShareOwnerName(null);
        setScreenShareOwnerRtcUid(0);
        setScreenShareStarting(false);
        setLocalScreenShareActive(false);
        pendingScreenShareStartRef.current = false;
        setCurrentSharedDocId(null);
        setCurrentSharedDocStage(null);
        setCurrentSharedDocPreviewTitle(null);
        setCurrentSharedDocPreviewKind(null);
        setCurrentSharedDocPage(0);
        setCurrentSharedDocSlideShow(false);
        setDocBusy(false);
        setActiveDoc(null);
        setPdfLocalPath(null);
        setPdfPageCount(0);
        setPdfPageIndex(0);
        setPdfPreviewUri(null);
        setPdfPreviewWidth(0);
        setPdfPreviewHeight(0);
        setPdfZoomLevel(1);
        setCurrentSharedDocZoom(1);
        setCurrentSharedDocPanX(0);
        setCurrentSharedDocPanY(0);
        setSharedDocInkPoints([]);
        setCurrentPresentationTool(null);
        setSharedDocMarker(null);
        setPdfFrameWidth(0);
        setPdfFrameHeight(0);
        setRecentDrifts([]);
        setReplayItem(null);
        setEngineReady(false);
        setFloatingComments([]);
        setFloatingReactions([]);
        docsPanelAutoOpenedRef.current = false;
        seenCommentIdsRef.current = new Set();
        seenReactionIdsRef.current = new Set();
        handledSoundEventIdsRef.current = new Set();
        lastAutoOpenedDocIdRef.current = null;
        activeInkPointRef.current = null;
        activeInkStrokeIdRef.current = null;
        if (reactionTrayTimerRef.current) {
            clearTimeout(reactionTrayTimerRef.current);
            reactionTrayTimerRef.current = null;
        }
        if (soundBadgeTimerRef.current) {
            clearTimeout(soundBadgeTimerRef.current);
            soundBadgeTimerRef.current = null;
        }
        if (slideshowTimerRef.current) {
            clearInterval(slideshowTimerRef.current);
            slideshowTimerRef.current = null;
        }
        if (viewportSyncTimerRef.current) {
            clearTimeout(viewportSyncTimerRef.current);
            viewportSyncTimerRef.current = null;
        }
        pdfPageCacheRef.current = {};
        pdfPagePrefetchingRef.current = {};
        joinedChannelRef.current = null;
        joiningChannelRef.current = null;
    }, []);
    (0, react_1.useEffect)(function () {
        react_native_sound_1.default.setCategory('Playback');
    }, []);
    var playRoomSoundEffect = (0, react_1.useCallback)(function (effectId) {
        var effect = LIVE_SOUND_EFFECTS.find(function (item) { return item.id === effectId; });
        if (!effect)
            return;
        var player = new react_native_sound_1.default(effect.file, react_native_sound_1.default.MAIN_BUNDLE, function (error) {
            if (error) {
                console.log('live sound load failed', effect.label, error);
                return;
            }
            player.setVolume(1);
            player.play(function () {
                player.release();
            });
        });
        setSoundBadgeLabel(null);
    }, []);
    var triggerRoomSoundEffect = (0, react_1.useCallback)(function (effectId) { return __awaiter(void 0, void 0, void 0, function () {
        var effect, eventId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!roomId || !meUid)
                        return [2 /*return*/];
                    effect = LIVE_SOUND_EFFECTS.find(function (item) { return item.id === effectId; });
                    if (!effect)
                        return [2 /*return*/];
                    eventId = "".concat(effect.id, "_").concat(Date.now(), "_").concat(meUid.slice(-5));
                    handledSoundEventIdsRef.current.add(eventId);
                    playRoomSoundEffect(effect.id);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            lastSoundEffect: {
                                eventId: eventId,
                                effectId: effect.id,
                                effectLabel: effect.label,
                                triggeredByUid: meUid,
                                triggeredByName: meName,
                                createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                                createdAtMs: Date.now(),
                            },
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    handledSoundEventIdsRef.current.delete(eventId);
                    react_native_1.Alert.alert('Sound failed', String((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Could not trigger sound.'));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [meName, meUid, playRoomSoundEffect, roomId]);
    var openSoundBoard = (0, react_1.useCallback)(function () {
        react_native_1.Alert.alert('Live Sounds', 'Choose a room sound:', __spreadArray(__spreadArray([], LIVE_SOUND_EFFECTS.map(function (effect) { return ({
            text: "".concat(effect.icon, " ").concat(effect.label),
            onPress: function () {
                void triggerRoomSoundEffect(effect.id);
            },
        }); }), true), [
            { text: 'Cancel', style: 'cancel' },
        ], false));
    }, [triggerRoomSoundEffect]);
    var resolvePdfCachePath = (0, react_1.useCallback)(function (doc) {
        var safeName = (doc.fileName || doc.id || 'shared.pdf').replace(/[^A-Za-z0-9._-]/g, '_');
        return "".concat(react_native_fs_1.default.CachesDirectoryPath, "/").concat(roomId || 'live', "_").concat(doc.id, "_").concat(safeName);
    }, [roomId]);
    var getPdfPageCacheKey = (0, react_1.useCallback)(function (docId, localPath, pageIndex) {
        return "".concat(String(docId || 'doc'), "::").concat(String(localPath || ''), "::").concat(Math.max(0, Number(pageIndex || 0)));
    }, []);
    var normalizePdfUploadPath = (0, react_1.useCallback)(function (rawUri, fileName, localFilePath) { return __awaiter(void 0, void 0, void 0, function () {
        var localPath, stats, originalPath, _a, safeName, copyDest;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localPath = String(localFilePath || rawUri || '').trim();
                    try {
                        localPath = decodeURI(localPath);
                    }
                    catch (_c) { }
                    if (react_native_1.Platform.OS === 'android' && localPath.startsWith('file://')) {
                        localPath = localPath.replace('file://', '');
                    }
                    if (!(react_native_1.Platform.OS === 'android' && /^content:/.test(localPath))) return [3 /*break*/, 6];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, react_native_fs_1.default.stat(String(rawUri || localPath))];
                case 2:
                    stats = _b.sent();
                    originalPath = String((stats === null || stats === void 0 ? void 0 : stats.originalFilepath) || '').trim();
                    if (originalPath) {
                        localPath = originalPath.startsWith('file://')
                            ? originalPath.replace('file://', '')
                            : originalPath;
                        return [2 /*return*/, localPath];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    safeName = (fileName || 'shared.pdf').replace(/[^A-Za-z0-9._-]/g, '_');
                    copyDest = "".concat(react_native_fs_1.default.CachesDirectoryPath, "/premium_pdf_").concat(Date.now(), "_").concat(safeName);
                    return [4 /*yield*/, react_native_fs_1.default.copyFile(String(rawUri), copyDest)];
                case 5:
                    _b.sent();
                    localPath = copyDest;
                    _b.label = 6;
                case 6: return [2 /*return*/, localPath];
            }
        });
    }); }, []);
    var getSharedFileSizeBytes = (0, react_1.useCallback)(function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
        var normalizedPath, stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    normalizedPath = String(filePath || '').trim();
                    if (!normalizedPath)
                        return [2 /*return*/, 0];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, react_native_fs_1.default.stat(normalizedPath)];
                case 2:
                    stats = _b.sent();
                    return [2 /*return*/, Math.max(0, Number((stats === null || stats === void 0 ? void 0 : stats.size) || 0))];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var getPdfRenderSize = (0, react_1.useCallback)(function (sizeBytes) {
        var normalizedSize = Math.max(0, Number(sizeBytes || 0));
        if (normalizedSize >= VERY_LARGE_SHARED_FILE_BYTES)
            return 980;
        if (normalizedSize >= LARGE_SHARED_FILE_BYTES)
            return 1160;
        return 1440;
    }, []);
    var markSpeakerActivity = (0, react_1.useCallback)(function (uids) {
        var normalizedUids = Array.from(new Set(uids
            .map(function (uid) { return Number(uid || 0); })
            .filter(function (uid) { return Number.isFinite(uid) && uid > 0; })));
        if (normalizedUids.length === 0)
            return;
        var now = Date.now();
        setRecentSpeakerAt(function (prev) {
            var next = __assign({}, prev);
            normalizedUids.forEach(function (uid) {
                next[uid] = now;
            });
            return next;
        });
    }, []);
    var ensureSharedPdfCached = (0, react_1.useCallback)(function (doc) { return __awaiter(void 0, void 0, void 0, function () {
        var localPath, exists, download, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    localPath = resolvePdfCachePath(doc);
                    return [4 /*yield*/, react_native_fs_1.default.exists(localPath)];
                case 1:
                    exists = _a.sent();
                    if (!!exists) return [3 /*break*/, 3];
                    download = react_native_fs_1.default.downloadFile({
                        fromUrl: doc.downloadUrl,
                        toFile: localPath,
                        background: true,
                    });
                    return [4 /*yield*/, download.promise];
                case 2:
                    result = _a.sent();
                    if (Number((result === null || result === void 0 ? void 0 : result.statusCode) || 0) >= 400) {
                        throw new Error('Could not download PDF.');
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, localPath];
            }
        });
    }); }, [resolvePdfCachePath]);
    var renderActivePdfPage = (0, react_1.useCallback)(function (localPath, pageIndex, options) { return __awaiter(void 0, void 0, void 0, function () {
        var normalizedPageIndex, cacheKey, cachedPage, applyPage, renderSize, page, normalizedPage, totalPages_1, neighbors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(PdfRenderer === null || PdfRenderer === void 0 ? void 0 : PdfRenderer.renderPage)) {
                        throw new Error('PDF renderer is not available on this device.');
                    }
                    normalizedPageIndex = Math.max(0, Number(pageIndex || 0));
                    cacheKey = getPdfPageCacheKey(options === null || options === void 0 ? void 0 : options.docId, localPath, normalizedPageIndex);
                    cachedPage = (options === null || options === void 0 ? void 0 : options.preferCache) ? pdfPageCacheRef.current[cacheKey] : null;
                    applyPage = function (page) {
                        setPdfPreviewUri(String((page === null || page === void 0 ? void 0 : page.uri) || ''));
                        setPdfPageCount(Number((page === null || page === void 0 ? void 0 : page.pageCount) || 0));
                        setPdfPageIndex(Number((page === null || page === void 0 ? void 0 : page.pageIndex) || normalizedPageIndex));
                        setPdfPreviewWidth(Number((page === null || page === void 0 ? void 0 : page.width) || 0));
                        setPdfPreviewHeight(Number((page === null || page === void 0 ? void 0 : page.height) || 0));
                    };
                    if (cachedPage) {
                        applyPage(cachedPage);
                        return [2 /*return*/];
                    }
                    renderSize = Math.max(920, Math.min(1560, Number((options === null || options === void 0 ? void 0 : options.renderSize) || 1440)));
                    return [4 /*yield*/, PdfRenderer.renderPage(localPath, normalizedPageIndex, renderSize)];
                case 1:
                    page = _a.sent();
                    normalizedPage = {
                        uri: String((page === null || page === void 0 ? void 0 : page.uri) || ''),
                        pageCount: Number((page === null || page === void 0 ? void 0 : page.pageCount) || 0),
                        pageIndex: Number((page === null || page === void 0 ? void 0 : page.pageIndex) || normalizedPageIndex),
                        width: Number((page === null || page === void 0 ? void 0 : page.width) || 0),
                        height: Number((page === null || page === void 0 ? void 0 : page.height) || 0),
                    };
                    pdfPageCacheRef.current[cacheKey] = normalizedPage;
                    applyPage(normalizedPage);
                    if ((options === null || options === void 0 ? void 0 : options.prefetchAdjacent) && (options === null || options === void 0 ? void 0 : options.docId)) {
                        totalPages_1 = Math.max(0, normalizedPage.pageCount || 0);
                        neighbors = [normalizedPage.pageIndex - 1, normalizedPage.pageIndex + 1].filter(function (candidate) { return candidate >= 0 && candidate < totalPages_1; });
                        neighbors.forEach(function (candidate) {
                            var neighborKey = getPdfPageCacheKey(options.docId, localPath, candidate);
                            if (pdfPageCacheRef.current[neighborKey] || pdfPagePrefetchingRef.current[neighborKey]) {
                                return;
                            }
                            pdfPagePrefetchingRef.current[neighborKey] = true;
                            Promise.resolve()
                                .then(function () { return __awaiter(void 0, void 0, void 0, function () {
                                var prefetched;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, PdfRenderer.renderPage(localPath, candidate, renderSize)];
                                        case 1:
                                            prefetched = _a.sent();
                                            pdfPageCacheRef.current[neighborKey] = {
                                                uri: String((prefetched === null || prefetched === void 0 ? void 0 : prefetched.uri) || ''),
                                                pageCount: Number((prefetched === null || prefetched === void 0 ? void 0 : prefetched.pageCount) || normalizedPage.pageCount || 0),
                                                pageIndex: Number((prefetched === null || prefetched === void 0 ? void 0 : prefetched.pageIndex) || candidate),
                                                width: Number((prefetched === null || prefetched === void 0 ? void 0 : prefetched.width) || normalizedPage.width || 0),
                                                height: Number((prefetched === null || prefetched === void 0 ? void 0 : prefetched.height) || normalizedPage.height || 0),
                                            };
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .catch(function () { })
                                .finally(function () {
                                delete pdfPagePrefetchingRef.current[neighborKey];
                            });
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [PdfRenderer, getPdfPageCacheKey]);
    var isBenignPdfOpenError = (0, react_1.useCallback)(function (error) {
        var message = String((error === null || error === void 0 ? void 0 : error.message) || error || '').toLowerCase();
        return (message.includes('not in pdf format') ||
            message.includes('corrupt') ||
            message.includes('corrupted') ||
            message.includes('file not found') ||
            message.includes('pdf file not found'));
    }, []);
    var openSharedPdf = (0, react_1.useCallback)(function (doc, options) { return __awaiter(void 0, void 0, void 0, function () {
        var normalizedSourceKind, localPath, localBytes, _a, _b, _c, renderSize, meta, targetPage, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    normalizedSourceKind = String(doc.sourceKind || '').toLowerCase();
                    if (normalizedSourceKind === 'blank') {
                        setIsDocMinimized(false);
                        setActiveDoc(doc);
                        setPdfLocalPath(null);
                        setPdfPreviewUri(null);
                        setPdfPreviewWidth(1080);
                        setPdfPreviewHeight(1440);
                        setPdfPageCount(1);
                        setPdfPageIndex(0);
                        setPdfZoomLevel(currentSharedDocZoom || 1);
                        return [2 /*return*/, true];
                    }
                    if (!doc.downloadUrl) {
                        if (!(options === null || options === void 0 ? void 0 : options.silentIfPending)) {
                            react_native_1.Alert.alert('Not ready', 'This file is still converting to PDF.');
                        }
                        return [2 /*return*/, false];
                    }
                    if (!(PdfRenderer === null || PdfRenderer === void 0 ? void 0 : PdfRenderer.getPageCount) || !(PdfRenderer === null || PdfRenderer === void 0 ? void 0 : PdfRenderer.renderPage)) {
                        react_native_1.Alert.alert('PDF unavailable', 'This build does not include the in-app PDF viewer.');
                        return [2 /*return*/, false];
                    }
                    if (openingPdfDocIdRef.current === doc.id) {
                        return [2 /*return*/, false];
                    }
                    openingPdfDocIdRef.current = doc.id;
                    setDocBusy(true);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, ensureSharedPdfCached(doc)];
                case 2:
                    localPath = _d.sent();
                    _b = (_a = Math).max;
                    _c = [Number(doc.fileSizeBytes || 0)];
                    return [4 /*yield*/, getSharedFileSizeBytes(localPath)];
                case 3:
                    localBytes = _b.apply(_a, _c.concat([_d.sent()]));
                    if (localBytes > MAX_SHARED_FILE_BYTES) {
                        throw new Error('This file is too large to render safely on this device.');
                    }
                    renderSize = getPdfRenderSize(localBytes);
                    return [4 /*yield*/, PdfRenderer.getPageCount(localPath)];
                case 4:
                    meta = _d.sent();
                    targetPage = currentSharedDocId && currentSharedDocId === doc.id
                        ? Math.max(0, Math.min(currentSharedDocPage, Math.max(0, Number((meta === null || meta === void 0 ? void 0 : meta.pageCount) || 1) - 1)))
                        : 0;
                    return [4 /*yield*/, renderActivePdfPage(localPath, targetPage, {
                            docId: doc.id,
                            preferCache: true,
                            prefetchAdjacent: localBytes < VERY_LARGE_SHARED_FILE_BYTES,
                            renderSize: renderSize,
                        })];
                case 5:
                    _d.sent();
                    setIsDocMinimized(false);
                    setActiveDoc(__assign(__assign({}, doc), { sourceKind: 'pdf' }));
                    setPdfLocalPath(localPath);
                    setPdfZoomLevel(1);
                    setPdfPageCount(Number((meta === null || meta === void 0 ? void 0 : meta.pageCount) || 0));
                    return [2 /*return*/, true];
                case 6:
                    error_2 = _d.sent();
                    setActiveDoc(null);
                    setPdfLocalPath(null);
                    setPdfPreviewUri(null);
                    if (!isBenignPdfOpenError(error_2)) {
                        react_native_1.Alert.alert('PDF open failed', String((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || 'Could not open PDF.'));
                    }
                    return [2 /*return*/, false];
                case 7:
                    openingPdfDocIdRef.current = null;
                    setDocBusy(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); }, [
        PdfRenderer,
        currentSharedDocId,
        currentSharedDocPage,
        ensureSharedPdfCached,
        getPdfRenderSize,
        getSharedFileSizeBytes,
        isBenignPdfOpenError,
        renderActivePdfPage,
    ]);
    var resetSharedDocLocalState = (0, react_1.useCallback)(function () {
        setIsDocMinimized(false);
        setActiveDoc(null);
        setPdfLocalPath(null);
        setPdfPageCount(0);
        setPdfPageIndex(0);
        setPdfPreviewUri(null);
        setPdfPreviewWidth(0);
        setPdfPreviewHeight(0);
        setPdfZoomLevel(1);
        setCurrentSharedDocId(null);
        setCurrentSharedDocStage(null);
        setCurrentSharedDocPreviewTitle(null);
        setCurrentSharedDocPreviewKind(null);
        setCurrentSharedDocPage(0);
        setCurrentSharedDocSlideShow(false);
        setCurrentSharedDocSlideSeconds(DEFAULT_PRESENTATION_SLIDE_SECONDS);
        setCurrentSharedDocZoom(1);
        setCurrentSharedDocPanX(0);
        setCurrentSharedDocPanY(0);
        setSharedDocInkPoints([]);
        setCurrentPresentationTool(null);
        setSharedDocMarker(null);
        setSharedDocStatusText(null);
    }, []);
    var clearCurrentSharedDocSession = (0, react_1.useCallback)(function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var activeDocId, shouldDeleteCurrentDoc, uploadTask, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    activeDocId = String(currentSharedDocId || '').trim();
                    shouldDeleteCurrentDoc = (_b = options === null || options === void 0 ? void 0 : options.deleteCurrentDoc) !== null && _b !== void 0 ? _b : !!activeDocId;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, , 9, 10]);
                    setDocBusy(true);
                    uploadTask = currentShareUploadTaskRef.current;
                    currentShareUploadTaskRef.current = null;
                    currentShareAttemptIdRef.current += 1;
                    if (!(uploadTask && typeof uploadTask.cancel === 'function')) return [3 /*break*/, 5];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, uploadTask.cancel()];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    openingPdfDocIdRef.current = null;
                    lastAutoOpenedDocIdRef.current = null;
                    if (activeDocId) {
                        delete localSharedDocPathRef.current[activeDocId];
                    }
                    resetSharedDocLocalState();
                    setShowDocsPanel(!!(options === null || options === void 0 ? void 0 : options.keepPanelOpen));
                    if (!roomId)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            currentSharedDocId: null,
                            currentSharedDocStage: firestore_1.default.FieldValue.delete(),
                            currentSharedDocPreviewTitle: firestore_1.default.FieldValue.delete(),
                            currentSharedDocPreviewKind: firestore_1.default.FieldValue.delete(),
                            currentSharedDocDownloadUrl: firestore_1.default.FieldValue.delete(),
                            currentSharedDocStoragePath: firestore_1.default.FieldValue.delete(),
                            currentSharedDocFileName: firestore_1.default.FieldValue.delete(),
                            currentSharedDocFileSizeBytes: firestore_1.default.FieldValue.delete(),
                            currentSharedDocStatusText: null,
                            currentSharedDocPage: 0,
                            currentSharedDocSlideShow: false,
                            currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
                            currentSharedDocZoom: 1,
                            currentSharedDocPanX: 0,
                            currentSharedDocPanY: 0,
                            currentSharedDocInkPoints: [],
                            currentSharedDocMarker: null,
                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 6:
                    _c.sent();
                    if (!(activeDocId && shouldDeleteCurrentDoc)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("live/".concat(roomId, "/shared_docs"))
                            .doc(activeDocId)
                            .delete()
                            .catch(function () { })];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    setDocBusy(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [currentSharedDocId, currentSharedDocStage, resetSharedDocLocalState, roomId]);
    var syncScreenShareRoomState = (0, react_1.useCallback)(function (active, ownerRtcUid) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!roomId)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set(active
                            ? {
                                currentScreenShareActive: true,
                                currentScreenShareOwnerUid: meUid,
                                currentScreenShareOwnerName: meName,
                                currentScreenShareOwnerRtcUid: Number(ownerRtcUid || myRtcUid || mapRtcUidFromUserId(meUid)),
                                currentScreenShareStartedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            }
                            : {
                                currentScreenShareActive: false,
                                currentScreenShareOwnerUid: firestore_1.default.FieldValue.delete(),
                                currentScreenShareOwnerName: firestore_1.default.FieldValue.delete(),
                                currentScreenShareOwnerRtcUid: firestore_1.default.FieldValue.delete(),
                                currentScreenShareStartedAt: firestore_1.default.FieldValue.delete(),
                                updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            }, { merge: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [meName, meUid, myRtcUid, roomId]);
    var handleLocalScreenShareReady = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (!pendingScreenShareStartRef.current)
            return;
        pendingScreenShareStartRef.current = false;
        try {
            (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.updateChannelMediaOptions) === null || _b === void 0 ? void 0 : _b.call(_a, {
                publishCameraTrack: false,
                publishMicrophoneTrack: !micMuted,
                publishScreenCaptureVideo: true,
                publishScreenCaptureAudio: false,
                publishScreenTrack: true,
                publishSecondaryScreenTrack: false,
                autoSubscribeAudio: true,
                autoSubscribeVideo: true,
            });
        }
        catch (_c) { }
        setScreenShareActive(true);
        setScreenShareOwnerUid(meUid);
        setScreenShareOwnerName(meName);
        setScreenShareOwnerRtcUid(myRtcUid || mapRtcUidFromUserId(meUid));
        setStatusText('Screen sharing is live');
        void syncScreenShareRoomState(true, myRtcUid || mapRtcUidFromUserId(meUid));
    }, [meName, meUid, micMuted, myRtcUid, syncScreenShareRoomState]);
    var handleLocalScreenShareFailure = (0, react_1.useCallback)(function (reason) {
        if (!pendingScreenShareStartRef.current && !localScreenShareActive)
            return;
        pendingScreenShareStartRef.current = false;
        setLocalScreenShareActive(false);
        setScreenShareActive(false);
        setScreenShareOwnerUid(null);
        setScreenShareOwnerName(null);
        setScreenShareOwnerRtcUid(0);
        setStatusText('Screen share failed');
        void syncScreenShareRoomState(false);
        react_native_1.Alert.alert('Screen share failed', reason === 22
            ? 'MoMo could not start screen sharing after permission was granted. Please try again.'
            : 'MoMo could not start screen sharing on this device. Please try again.');
    }, [localScreenShareActive, syncScreenShareRoomState]);
    var stopScreenShare = (0, react_1.useCallback)(function (options) { return __awaiter(void 0, void 0, void 0, function () {
        var engine;
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!allowPremiumScreenShare) {
                        return [2 /*return*/];
                    }
                    engine = engineRef.current;
                    try {
                        (_a = engine === null || engine === void 0 ? void 0 : engine.stopScreenCapture) === null || _a === void 0 ? void 0 : _a.call(engine);
                    }
                    catch (_j) { }
                    try {
                        (_b = engine === null || engine === void 0 ? void 0 : engine.stopPreview) === null || _b === void 0 ? void 0 : _b.call(engine, (_d = (_c = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _c === void 0 ? void 0 : _c.VideoSourceScreenPrimary) !== null && _d !== void 0 ? _d : 2);
                    }
                    catch (_k) { }
                    try {
                        (_e = engine === null || engine === void 0 ? void 0 : engine.updateChannelMediaOptions) === null || _e === void 0 ? void 0 : _e.call(engine, {
                            publishCameraTrack: !(!!activeDoc || cameraOff),
                            publishMicrophoneTrack: !micMuted,
                            publishScreenCaptureVideo: false,
                            publishScreenCaptureAudio: false,
                            publishScreenTrack: false,
                            publishSecondaryScreenTrack: false,
                            autoSubscribeAudio: true,
                            autoSubscribeVideo: true,
                        });
                    }
                    catch (_l) { }
                    setLocalScreenShareActive(false);
                    pendingScreenShareStartRef.current = false;
                    if (!((options === null || options === void 0 ? void 0 : options.syncRoom) !== false && isCurrentUserScreenSharer)) return [3 /*break*/, 2];
                    return [4 /*yield*/, syncScreenShareRoomState(false).catch(function () { })];
                case 1:
                    _h.sent();
                    _h.label = 2;
                case 2:
                    if (!activeDoc && !cameraOff) {
                        try {
                            (_f = engine === null || engine === void 0 ? void 0 : engine.enableLocalVideo) === null || _f === void 0 ? void 0 : _f.call(engine, true);
                            (_g = engine === null || engine === void 0 ? void 0 : engine.startPreview) === null || _g === void 0 ? void 0 : _g.call(engine);
                        }
                        catch (_m) { }
                    }
                    setStatusText('Live');
                    return [2 /*return*/];
            }
        });
    }); }, [
        Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType,
        activeDoc,
        allowPremiumScreenShare,
        cameraOff,
        isCurrentUserScreenSharer,
        micMuted,
        syncScreenShareRoomState,
    ]);
    var startScreenShare = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var engine, projectionResult, parsedProjectionResult, captureResult, error_3;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    if (!allowPremiumScreenShare) {
                        react_native_1.Alert.alert('Screen share disabled', 'Screen sharing has been removed from Aqua Premium. Use Share Files instead.');
                        return [2 /*return*/];
                    }
                    if (!isPremiumRoom || !joined)
                        return [2 /*return*/];
                    if (react_native_1.Platform.OS !== 'android') {
                        react_native_1.Alert.alert('Screen sharing unavailable', 'Aqua Premium screen sharing is currently available on Android only.');
                        return [2 /*return*/];
                    }
                    if (activeDoc || currentSharedDocId) {
                        react_native_1.Alert.alert('Close shared file first', 'Stop the current shared file before starting screen sharing.');
                        return [2 /*return*/];
                    }
                    if (screenShareActive && !isCurrentUserScreenSharer) {
                        react_native_1.Alert.alert('Screen already shared', "".concat(screenShareOwnerName || 'Another guest', " is already sharing a screen in this Aqua Premium room."));
                        return [2 /*return*/];
                    }
                    engine = engineRef.current;
                    if (!engine) {
                        react_native_1.Alert.alert('Screen sharing unavailable', 'The live engine is not ready yet.');
                        return [2 /*return*/];
                    }
                    setScreenShareStarting(true);
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 3, 4, 5]);
                    pendingScreenShareStartRef.current = true;
                    return [4 /*yield*/, ((_a = AgoraRtcNg === null || AgoraRtcNg === void 0 ? void 0 : AgoraRtcNg.requestAndroidScreenProjection) === null || _a === void 0 ? void 0 : _a.call(AgoraRtcNg))];
                case 2:
                    projectionResult = _o.sent();
                    if (typeof projectionResult === 'string' && projectionResult.trim()) {
                        try {
                            parsedProjectionResult = JSON.parse(projectionResult);
                            if (typeof (parsedProjectionResult === null || parsedProjectionResult === void 0 ? void 0 : parsedProjectionResult.result) === 'number' && parsedProjectionResult.result < 0) {
                                throw new Error("Screen projection could not attach (".concat(parsedProjectionResult.result, ")."));
                            }
                        }
                        catch (parseError) {
                            if (parseError instanceof Error) {
                                throw parseError;
                            }
                        }
                    }
                    captureResult = (_b = engine.startScreenCapture) === null || _b === void 0 ? void 0 : _b.call(engine, {
                        captureAudio: false,
                        captureVideo: true,
                        videoParams: {
                            dimensions: PREMIUM_SCREEN_SHARE_DIMENSIONS,
                            frameRate: PREMIUM_SCREEN_SHARE_FRAME_RATE,
                            bitrate: PREMIUM_SCREEN_SHARE_BITRATE,
                        },
                    });
                    if (typeof captureResult === 'number' && captureResult < 0) {
                        throw new Error('Screen capture could not start (' + captureResult + ').');
                    }
                    try {
                        (_c = engine.setScreenCaptureOrientation) === null || _c === void 0 ? void 0 : _c.call(engine, (_e = (_d = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _d === void 0 ? void 0 : _d.VideoSourceScreenPrimary) !== null && _e !== void 0 ? _e : 2, (_g = (_f = Agora === null || Agora === void 0 ? void 0 : Agora.VideoOrientation) === null || _f === void 0 ? void 0 : _f.VideoOrientationPortrait) !== null && _g !== void 0 ? _g : 0);
                    }
                    catch (_p) { }
                    try {
                        (_h = engine.startPreview) === null || _h === void 0 ? void 0 : _h.call(engine, (_k = (_j = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _j === void 0 ? void 0 : _j.VideoSourceScreenPrimary) !== null && _k !== void 0 ? _k : 2);
                    }
                    catch (_q) { }
                    try {
                        (_l = engine.updateChannelMediaOptions) === null || _l === void 0 ? void 0 : _l.call(engine, {
                            publishCameraTrack: false,
                            publishMicrophoneTrack: !micMuted,
                            publishScreenCaptureVideo: true,
                            publishScreenCaptureAudio: false,
                            publishScreenTrack: true,
                            publishSecondaryScreenTrack: false,
                            autoSubscribeAudio: true,
                            autoSubscribeVideo: true,
                        });
                    }
                    catch (_r) { }
                    setLocalScreenShareActive(true);
                    setScreenShareActive(true);
                    setScreenShareOwnerUid(meUid);
                    setScreenShareOwnerName(meName);
                    setScreenShareOwnerRtcUid(myRtcUid || mapRtcUidFromUserId(meUid));
                    void syncScreenShareRoomState(true, myRtcUid || mapRtcUidFromUserId(meUid));
                    setStatusText('Waiting for screen share...');
                    react_native_1.Alert.alert('Screen sharing started', 'Open any app on your phone. Everyone in Aqua Premium will see your screen.');
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _o.sent();
                    pendingScreenShareStartRef.current = false;
                    try {
                        (_m = engine.stopScreenCapture) === null || _m === void 0 ? void 0 : _m.call(engine);
                    }
                    catch (_s) { }
                    setLocalScreenShareActive(false);
                    setScreenShareActive(false);
                    setStatusText('Live');
                    react_native_1.Alert.alert('Screen share failed', String((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || 'Could not start screen sharing.'));
                    return [3 /*break*/, 5];
                case 4:
                    setScreenShareStarting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [
        Agora === null || Agora === void 0 ? void 0 : Agora.VideoOrientation,
        Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType,
        AgoraRtcNg,
        activeDoc,
        currentSharedDocId,
        isCurrentUserScreenSharer,
        isPremiumRoom,
        joined,
        meName,
        meUid,
        micMuted,
        myRtcUid,
        screenShareActive,
        screenShareOwnerName,
        syncScreenShareRoomState,
    ]);
    var closePdfViewer = (0, react_1.useCallback)(function () {
        setIsDocMinimized(false);
        setActiveDoc(null);
        setPdfLocalPath(null);
        setPdfPageCount(0);
        setPdfPageIndex(0);
        setPdfPreviewUri(null);
        setPdfPreviewWidth(0);
        setPdfPreviewHeight(0);
        setPdfZoomLevel(1);
        setCurrentSharedDocZoom(1);
        setCurrentSharedDocPanX(0);
        setCurrentSharedDocPanY(0);
        setSharedDocInkPoints([]);
        setCurrentSharedDocSlideShow(false);
        setCurrentPresentationTool(null);
        setSharedDocMarker(null);
        if (canControlCurrentSharedDoc && activeDoc && currentSharedDocId && activeDoc.id === currentSharedDocId) {
            void clearCurrentSharedDocSession({ keepPanelOpen: true, deleteCurrentDoc: true });
        }
    }, [activeDoc, canControlCurrentSharedDoc, clearCurrentSharedDocSession, currentSharedDocId]);
    var pushSharedDocState = (0, react_1.useCallback)(function (next) { return __awaiter(void 0, void 0, void 0, function () {
        var payload;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!roomId)
                        return [2 /*return*/];
                    payload = {
                        currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    };
                    if (typeof next.docId !== 'undefined') {
                        payload.currentSharedDocId = next.docId;
                    }
                    if (typeof next.shareStage !== 'undefined') {
                        payload.currentSharedDocStage = next.shareStage || firestore_1.default.FieldValue.delete();
                    }
                    if (typeof next.shareTitle !== 'undefined') {
                        payload.currentSharedDocPreviewTitle = next.shareTitle || firestore_1.default.FieldValue.delete();
                    }
                    if (typeof next.shareKind !== 'undefined') {
                        payload.currentSharedDocPreviewKind = next.shareKind || firestore_1.default.FieldValue.delete();
                    }
                    if (typeof next.page === 'number') {
                        payload.currentSharedDocPage = Math.max(0, next.page);
                    }
                    if (typeof next.slideShow === 'boolean') {
                        payload.currentSharedDocSlideShow = next.slideShow;
                    }
                    if (typeof next.slideSeconds === 'number') {
                        payload.currentSharedDocSlideSeconds = Math.max(6, Math.min(20, Math.round(next.slideSeconds)));
                    }
                    if (typeof next.marker !== 'undefined') {
                        payload.currentSharedDocMarker = next.marker
                            ? {
                                mode: next.marker.mode,
                                x: Math.max(0, Math.min(1, next.marker.x)),
                                y: Math.max(0, Math.min(1, next.marker.y)),
                            }
                            : firestore_1.default.FieldValue.delete();
                    }
                    if (typeof next.zoom === 'number') {
                        payload.currentSharedDocZoom = Math.max(1, Math.min(3, Number(next.zoom)));
                    }
                    if (typeof next.panX === 'number') {
                        payload.currentSharedDocPanX = Math.max(0, Math.min(1, Number(next.panX)));
                    }
                    if (typeof next.panY === 'number') {
                        payload.currentSharedDocPanY = Math.max(0, Math.min(1, Number(next.panY)));
                    }
                    if (typeof next.inkPoints !== 'undefined') {
                        payload.currentSharedDocInkPoints = Array.isArray(next.inkPoints)
                            ? next.inkPoints.slice(-SHARED_DOC_MAX_INK_POINTS).map(function (point) { return ({
                                id: String(point.id || "".concat(Date.now())),
                                x: Math.max(0, Math.min(1, Number(point.x))),
                                y: Math.max(0, Math.min(1, Number(point.y))),
                                size: Math.max(2, Math.min(12, Number(point.size || 4))),
                                color: String(point.color || '#EF4444'),
                                strokeId: point.strokeId ? String(point.strokeId) : null,
                            }); })
                            : [];
                    }
                    if (typeof next.statusText !== 'undefined') {
                        payload.currentSharedDocStatusText = next.statusText;
                    }
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set(payload, { merge: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [roomId]);
    var changePdfPage = (0, react_1.useCallback)(function (direction) { return __awaiter(void 0, void 0, void 0, function () {
        var nextIndex, error_4, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pdfLocalPath)
                        return [2 /*return*/];
                    nextIndex = pdfPageIndex + direction;
                    if (nextIndex < 0 || nextIndex >= pdfPageCount)
                        return [2 /*return*/];
                    if (!canControlCurrentSharedDoc) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pushSharedDocState({ page: nextIndex })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    react_native_1.Alert.alert('PDF page failed', String((error_4 === null || error_4 === void 0 ? void 0 : error_4.message) || 'Could not turn page.'));
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 10];
                case 5:
                    setDocBusy(true);
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, 9, 10]);
                    return [4 /*yield*/, renderActivePdfPage(pdfLocalPath, nextIndex, {
                            docId: (activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.id) || currentSharedDocId,
                            preferCache: true,
                            prefetchAdjacent: true,
                            renderSize: getPdfRenderSize(activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.fileSizeBytes),
                        })];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    error_5 = _a.sent();
                    react_native_1.Alert.alert('PDF page failed', String((error_5 === null || error_5 === void 0 ? void 0 : error_5.message) || 'Could not turn page.'));
                    return [3 /*break*/, 10];
                case 9:
                    setDocBusy(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); }, [
        activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.id,
        canControlCurrentSharedDoc,
        currentSharedDocId,
        pdfLocalPath,
        pdfPageCount,
        pdfPageIndex,
        pushSharedDocState,
        renderActivePdfPage,
        getPdfRenderSize,
    ]);
    var queueSharedViewportSync = (0, react_1.useCallback)(function (nextX, nextY, nextZoom) {
        if (nextZoom === void 0) { nextZoom = pdfZoomLevel; }
        pendingViewportRef.current = {
            x: Math.max(0, Math.min(1, nextX)),
            y: Math.max(0, Math.min(1, nextY)),
        };
        if (viewportSyncTimerRef.current) {
            clearTimeout(viewportSyncTimerRef.current);
        }
        viewportSyncTimerRef.current = setTimeout(function () {
            viewportSyncTimerRef.current = null;
            void pushSharedDocState({
                zoom: nextZoom,
                panX: pendingViewportRef.current.x,
                panY: pendingViewportRef.current.y,
            });
        }, 90);
    }, [pdfZoomLevel, pushSharedDocState]);
    var applySharedInkAtPoint = (0, react_1.useCallback)(function (x, y) {
        if (!canControlCurrentSharedDoc || !currentPresentationTool || pdfFrameWidth <= 0 || pdfFrameHeight <= 0) {
            return;
        }
        var normalizedX = Math.max(0, Math.min(1, x / pdfFrameWidth));
        var normalizedY = Math.max(0, Math.min(1, y / pdfFrameHeight));
        if (currentPresentationTool === 'pointer' || currentPresentationTool === 'highlight') {
            var marker = {
                mode: currentPresentationTool,
                x: normalizedX,
                y: normalizedY,
            };
            setSharedDocMarker(marker);
            void pushSharedDocState({ marker: marker });
            return;
        }
        if (currentPresentationTool === 'pen') {
            var lastPoint = activeInkPointRef.current;
            var strokeId = activeInkStrokeIdRef.current ||
                "".concat(Date.now(), "_").concat(Math.random().toString(36).slice(2, 10));
            activeInkStrokeIdRef.current = strokeId;
            var distancePx = lastPoint
                ? Math.sqrt(Math.pow((normalizedX - lastPoint.x) * pdfFrameWidth, 2) +
                    Math.pow((normalizedY - lastPoint.y) * pdfFrameHeight, 2))
                : 0;
            var steps = lastPoint
                ? Math.max(1, Math.ceil(distancePx / SHARED_DOC_INK_POINT_SPACING_PX))
                : 1;
            var appendedPoints = [];
            for (var step = 1; step <= steps; step += 1) {
                var ratio = step / steps;
                var pointX = lastPoint ? lastPoint.x + (normalizedX - lastPoint.x) * ratio : normalizedX;
                var pointY = lastPoint ? lastPoint.y + (normalizedY - lastPoint.y) * ratio : normalizedY;
                appendedPoints.push({
                    id: "".concat(Date.now(), "_").concat(step, "_").concat(Math.random()),
                    x: pointX,
                    y: pointY,
                    size: 4,
                    color: '#E11D48',
                    strokeId: strokeId,
                });
            }
            var nextPoints = __spreadArray(__spreadArray([], sharedDocInkPoints, true), appendedPoints, true).slice(-SHARED_DOC_MAX_INK_POINTS);
            activeInkPointRef.current = { x: normalizedX, y: normalizedY };
            setSharedDocInkPoints(nextPoints);
            void pushSharedDocState({ inkPoints: nextPoints });
            return;
        }
        if (currentPresentationTool === 'eraser') {
            var nextPoints = sharedDocInkPoints.filter(function (point) {
                var dx = (point.x - normalizedX) * pdfFrameWidth;
                var dy = (point.y - normalizedY) * pdfFrameHeight;
                return Math.sqrt(dx * dx + dy * dy) > SHARED_DOC_ERASER_RADIUS_PX;
            });
            activeInkPointRef.current = { x: normalizedX, y: normalizedY };
            setSharedDocInkPoints(nextPoints);
            void pushSharedDocState({ inkPoints: nextPoints });
        }
    }, [
        canControlCurrentSharedDoc,
        currentPresentationTool,
        pdfFrameHeight,
        pdfFrameWidth,
        pushSharedDocState,
        sharedDocInkPoints,
    ]);
    (0, react_1.useEffect)(function () {
        activeInkPointRef.current = null;
        activeInkStrokeIdRef.current = null;
    }, [currentPresentationTool, currentSharedDocId]);
    var pauseSharedDocSlideShow = (0, react_1.useCallback)(function () {
        if (slideshowTimerRef.current) {
            clearInterval(slideshowTimerRef.current);
            slideshowTimerRef.current = null;
        }
        if (canControlCurrentSharedDoc) {
            void pushSharedDocState({ slideShow: false });
        }
    }, [canControlCurrentSharedDoc, pushSharedDocState]);
    var startSharedDocSlideShow = (0, react_1.useCallback)(function () {
        if (!canControlCurrentSharedDoc || pdfPageCount <= 1)
            return;
        void pushSharedDocState({ slideShow: true });
    }, [canControlCurrentSharedDoc, pdfPageCount, pushSharedDocState]);
    var togglePresentationTool = (0, react_1.useCallback)(function (mode) {
        if (!canControlCurrentSharedDoc)
            return;
        setCurrentPresentationTool(function (prev) {
            var nextMode = prev === mode ? null : mode;
            if (!nextMode) {
                void pushSharedDocState({ marker: null });
            }
            return nextMode;
        });
    }, [canControlCurrentSharedDoc, pushSharedDocState]);
    var placePresentationMarker = (0, react_1.useCallback)(function (x, y) {
        applySharedInkAtPoint(x, y);
    }, [applySharedInkAtPoint]);
    var ensureParticipantPresenceForShare = (0, react_1.useCallback)(function (rtcUid) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!roomId || !meUid)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("live/".concat(roomId, "/participants"))
                            .doc(meUid)
                            .set({
                            uid: meUid,
                            name: meName,
                            photo: mePhoto,
                            rtcUid: rtcUid,
                            isHost: !!(roomHostUid && meUid && roomHostUid === meUid),
                            muted: false,
                            purged: false,
                            raisedHand: false,
                            cameraOff: false,
                            channel: roomChannel || 'premium_room',
                            joinedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [meName, mePhoto, meUid, roomChannel, roomHostUid, roomId]);
    var handleShareFile = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var shareAttemptId, createdDocId, result, pickedItems, selectedEntry, localUri, fileName_1, isPdf, sourceKind_1, title, docRef_1, pickedSizeBytes, uploadPath_1, sourceSizeBytes_1, sharedDocPayloadBase_1, storagePath_1, uploadRef, uploadTask, downloadUrl, sharedDocPayload_1, localCachePath, exists, _a, requestConversion, error_6, message;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!roomId || !isPremiumRoom)
                        return [2 /*return*/];
                    if (currentSharedDocId || currentSharedDocStage) {
                        react_native_1.Alert.alert('File already sharing', 'Close the current shared file before sharing another one.');
                        return [2 /*return*/];
                    }
                    if (!(AudioPicker === null || AudioPicker === void 0 ? void 0 : AudioPicker.pickFiles)) {
                        react_native_1.Alert.alert('File picker unavailable', 'This build cannot pick PDF files yet.');
                        return [2 /*return*/];
                    }
                    shareAttemptId = currentShareAttemptIdRef.current + 1;
                    currentShareAttemptIdRef.current = shareAttemptId;
                    createdDocId = null;
                    setDocBusy(true);
                    setShowDocsPanel(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 24, 28, 29]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            currentSharedDocId: null,
                            currentSharedDocStage: 'choosing',
                            currentSharedDocPreviewTitle: null,
                            currentSharedDocPreviewKind: null,
                            currentSharedDocDownloadUrl: null,
                            currentSharedDocStoragePath: null,
                            currentSharedDocFileName: null,
                            currentSharedDocFileSizeBytes: null,
                            currentSharedDocStatusText: "".concat(meName, " is choosing a file"),
                            currentSharedDocPage: 0,
                            currentSharedDocSlideShow: false,
                            currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
                            currentSharedDocZoom: 1,
                            currentSharedDocPanX: 0,
                            currentSharedDocPanY: 0,
                            currentSharedDocInkPoints: [],
                            currentSharedDocMarker: null,
                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, AudioPicker.pickFiles()];
                case 3:
                    result = _c.sent();
                    pickedItems = (Array.isArray(result) ? result : result ? [result] : []);
                    selectedEntry = pickedItems.find(function (entry) {
                        var name = String((entry === null || entry === void 0 ? void 0 : entry.name) || (entry === null || entry === void 0 ? void 0 : entry.uri) || '').trim();
                        var type = String((entry === null || entry === void 0 ? void 0 : entry.type) || '').trim().toLowerCase();
                        return (type === 'application/pdf' ||
                            /\.pdf$/i.test(name) ||
                            /\.ppt$/i.test(name) ||
                            /\.pptx$/i.test(name) ||
                            /\.doc$/i.test(name) ||
                            /\.docx$/i.test(name));
                    });
                    if (!!(selectedEntry === null || selectedEntry === void 0 ? void 0 : selectedEntry.uri)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            currentSharedDocId: null,
                            currentSharedDocStage: firestore_1.default.FieldValue.delete(),
                            currentSharedDocPreviewTitle: firestore_1.default.FieldValue.delete(),
                            currentSharedDocPreviewKind: firestore_1.default.FieldValue.delete(),
                            currentSharedDocDownloadUrl: firestore_1.default.FieldValue.delete(),
                            currentSharedDocStoragePath: firestore_1.default.FieldValue.delete(),
                            currentSharedDocFileName: firestore_1.default.FieldValue.delete(),
                            currentSharedDocFileSizeBytes: firestore_1.default.FieldValue.delete(),
                            currentSharedDocStatusText: null,
                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })
                            .catch(function () { })];
                case 4:
                    _c.sent();
                    react_native_1.Alert.alert('Supported files only', 'Choose a PDF, PPT, PPTX, DOC, or DOCX file.');
                    return [2 /*return*/];
                case 5:
                    localUri = String(selectedEntry.uri);
                    fileName_1 = String(selectedEntry.name || 'shared_file').trim() || 'shared_file';
                    isPdf = /\.pdf$/i.test(fileName_1) || String(selectedEntry.type || '').toLowerCase() === 'application/pdf';
                    sourceKind_1 = /\.pptx$/i.test(fileName_1)
                        ? 'pptx'
                        : /\.ppt$/i.test(fileName_1)
                            ? 'ppt'
                            : /\.docx$/i.test(fileName_1)
                                ? 'docx'
                                : /\.doc$/i.test(fileName_1)
                                    ? 'doc'
                                    : 'pdf';
                    title = fileName_1.replace(/\.(pdf|ppt|pptx|doc|docx)$/i, '');
                    docRef_1 = (0, firestore_1.default)().collection("live/".concat(roomId, "/shared_docs")).doc();
                    createdDocId = docRef_1.id;
                    pickedSizeBytes = Math.max(0, Number(selectedEntry.size || 0));
                    if (pickedSizeBytes > MAX_SHARED_FILE_BYTES) {
                        react_native_1.Alert.alert('File too large', 'This file is too large to open safely on phones. Choose a smaller file or split it first.');
                        return [2 /*return*/];
                    }
                    if (!isPdf && pickedSizeBytes > MAX_CONVERTIBLE_FILE_BYTES) {
                        react_native_1.Alert.alert('Presentation too large', 'Large PowerPoint and Word files can crash phones during conversion. Keep presentation files under 48 MB.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, normalizePdfUploadPath(localUri, fileName_1)];
                case 6:
                    uploadPath_1 = _c.sent();
                    return [4 /*yield*/, getSharedFileSizeBytes(uploadPath_1)];
                case 7:
                    sourceSizeBytes_1 = _c.sent();
                    if (sourceSizeBytes_1 > MAX_SHARED_FILE_BYTES) {
                        react_native_1.Alert.alert('File too large', 'This file is too large to open safely on phones. Choose a smaller file or split it first.');
                        return [2 /*return*/];
                    }
                    if (!isPdf && sourceSizeBytes_1 > MAX_CONVERTIBLE_FILE_BYTES) {
                        react_native_1.Alert.alert('Presentation too large', 'Large PowerPoint and Word files can crash phones during conversion. Keep presentation files under 48 MB.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all([
                            docRef_1.set({
                                title: title,
                                fileName: fileName_1,
                                downloadUrl: '',
                                storagePath: '',
                                sourcePath: '',
                                sourceKind: sourceKind_1,
                                status: 'uploading',
                                sharedByUid: meUid,
                                sharedByName: meName,
                                fileSizeBytes: sourceSizeBytes_1,
                                createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                                createdAtMs: Date.now(),
                                updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                updatedAtMs: Date.now(),
                            }),
                            (0, firestore_1.default)()
                                .collection('live')
                                .doc(roomId)
                                .set({
                                currentSharedDocId: docRef_1.id,
                                currentSharedDocStage: 'selected',
                                currentSharedDocPreviewTitle: title,
                                currentSharedDocPreviewKind: sourceKind_1,
                                currentSharedDocDownloadUrl: null,
                                currentSharedDocStoragePath: null,
                                currentSharedDocFileName: fileName_1,
                                currentSharedDocFileSizeBytes: sourceSizeBytes_1,
                                currentSharedDocStatusText: "".concat(meName, " selected ").concat(title),
                                currentSharedDocPage: 0,
                                currentSharedDocSlideShow: false,
                                currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
                                currentSharedDocZoom: 1,
                                currentSharedDocPanX: 0,
                                currentSharedDocPanY: 0,
                                currentSharedDocInkPoints: [],
                                currentSharedDocMarker: null,
                                currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            }, { merge: true }),
                        ])];
                case 8:
                    _c.sent();
                    sharedDocPayloadBase_1 = {
                        id: docRef_1.id,
                        title: title,
                        fileName: fileName_1,
                        downloadUrl: '',
                        storagePath: '',
                        sharedByName: meName,
                        createdAtMs: Date.now(),
                        status: isPdf ? 'uploading' : 'converting',
                        sourceKind: sourceKind_1,
                        fileSizeBytes: sourceSizeBytes_1,
                        errorMessage: null,
                    };
                    storagePath_1 = isPdf
                        ? "premium_docs/".concat(roomId, "/").concat(Date.now(), "_").concat(fileName_1.replace(/[^A-Za-z0-9._-]/g, '_'))
                        : "premium_presentations/".concat(roomId, "/").concat(Date.now(), "_").concat(fileName_1.replace(/[^A-Za-z0-9._-]/g, '_'));
                    uploadRef = (0, storage_1.default)().ref(storagePath_1);
                    uploadTask = uploadRef.putFile(uploadPath_1, {
                        contentType: isPdf
                            ? 'application/pdf'
                            : /\.pptx$/i.test(fileName_1)
                                ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                : /\.ppt$/i.test(fileName_1)
                                    ? 'application/vnd.ms-powerpoint'
                                    : /\.docx$/i.test(fileName_1)
                                        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                        : 'application/msword',
                    });
                    currentShareUploadTaskRef.current = uploadTask;
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            currentSharedDocId: docRef_1.id,
                            currentSharedDocStage: 'uploading',
                            currentSharedDocPreviewTitle: title,
                            currentSharedDocPreviewKind: sourceKind_1,
                            currentSharedDocDownloadUrl: null,
                            currentSharedDocStoragePath: storagePath_1,
                            currentSharedDocFileName: fileName_1,
                            currentSharedDocFileSizeBytes: sourceSizeBytes_1,
                            currentSharedDocStatusText: "".concat(meName, " is uploading ").concat(title),
                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 9:
                    _c.sent();
                    if (isPdf) {
                        void (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var localCachePath, exists, renderSize, meta, _a;
                            var _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 6, , 7]);
                                        localCachePath = resolvePdfCachePath(sharedDocPayloadBase_1);
                                        return [4 /*yield*/, react_native_fs_1.default.exists(localCachePath)];
                                    case 1:
                                        exists = _c.sent();
                                        if (!!exists) return [3 /*break*/, 3];
                                        return [4 /*yield*/, react_native_fs_1.default.copyFile(uploadPath_1, localCachePath)];
                                    case 2:
                                        _c.sent();
                                        _c.label = 3;
                                    case 3:
                                        primedPdfDocIdsRef.current.add(sharedDocPayloadBase_1.id);
                                        renderSize = getPdfRenderSize(sourceSizeBytes_1);
                                        return [4 /*yield*/, ((_b = PdfRenderer === null || PdfRenderer === void 0 ? void 0 : PdfRenderer.getPageCount) === null || _b === void 0 ? void 0 : _b.call(PdfRenderer, localCachePath))];
                                    case 4:
                                        meta = _c.sent();
                                        return [4 /*yield*/, renderActivePdfPage(localCachePath, 0, {
                                                docId: sharedDocPayloadBase_1.id,
                                                preferCache: true,
                                                prefetchAdjacent: sourceSizeBytes_1 < VERY_LARGE_SHARED_FILE_BYTES,
                                                renderSize: renderSize,
                                            })];
                                    case 5:
                                        _c.sent();
                                        setIsDocMinimized(false);
                                        setActiveDoc(__assign(__assign({}, sharedDocPayloadBase_1), { sourceKind: 'pdf' }));
                                        setPdfLocalPath(localCachePath);
                                        setPdfZoomLevel(1);
                                        setPdfPageCount(Number((meta === null || meta === void 0 ? void 0 : meta.pageCount) || 0));
                                        return [3 /*break*/, 7];
                                    case 6:
                                        _a = _c.sent();
                                        return [3 /*break*/, 7];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); })();
                    }
                    return [4 /*yield*/, uploadTask];
                case 10:
                    _c.sent();
                    if (currentShareUploadTaskRef.current === uploadTask) {
                        currentShareUploadTaskRef.current = null;
                    }
                    return [4 /*yield*/, uploadRef.getDownloadURL()];
                case 11:
                    downloadUrl = _c.sent();
                    sharedDocPayload_1 = {
                        id: docRef_1.id,
                        title: title,
                        fileName: fileName_1,
                        downloadUrl: isPdf ? downloadUrl : '',
                        storagePath: isPdf ? storagePath_1 : '',
                        sharedByName: meName,
                        createdAtMs: Date.now(),
                        status: isPdf ? 'ready' : 'converting',
                        sourceKind: sourceKind_1,
                        fileSizeBytes: sourceSizeBytes_1,
                        errorMessage: null,
                    };
                    return [4 /*yield*/, docRef_1.set({
                            title: sharedDocPayload_1.title,
                            fileName: fileName_1,
                            downloadUrl: isPdf ? downloadUrl : '',
                            storagePath: isPdf ? storagePath_1 : '',
                            sourcePath: !isPdf ? storagePath_1 : '',
                            sourceKind: sourceKind_1,
                            status: isPdf ? 'ready' : 'converting',
                            sharedByUid: meUid,
                            sharedByName: meName,
                            fileSizeBytes: sourceSizeBytes_1,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            createdAtMs: Date.now(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAtMs: Date.now(),
                        })];
                case 12:
                    _c.sent();
                    if (!isPdf) return [3 /*break*/, 21];
                    _c.label = 13;
                case 13:
                    _c.trys.push([13, 18, , 19]);
                    localCachePath = resolvePdfCachePath(sharedDocPayload_1);
                    return [4 /*yield*/, react_native_fs_1.default.exists(localCachePath)];
                case 14:
                    exists = _c.sent();
                    if (!!exists) return [3 /*break*/, 16];
                    return [4 /*yield*/, react_native_fs_1.default.copyFile(uploadPath_1, localCachePath)];
                case 15:
                    _c.sent();
                    _c.label = 16;
                case 16:
                    primedPdfDocIdsRef.current.add(sharedDocPayload_1.id);
                    return [4 /*yield*/, Promise.all([
                            (_b = PdfRenderer === null || PdfRenderer === void 0 ? void 0 : PdfRenderer.getPageCount) === null || _b === void 0 ? void 0 : _b.call(PdfRenderer, localCachePath),
                            renderActivePdfPage(localCachePath, 0, {
                                docId: sharedDocPayload_1.id,
                                preferCache: true,
                                prefetchAdjacent: sourceSizeBytes_1 < VERY_LARGE_SHARED_FILE_BYTES,
                                renderSize: getPdfRenderSize(sourceSizeBytes_1),
                            }),
                        ])];
                case 17:
                    _c.sent();
                    return [3 /*break*/, 19];
                case 18:
                    _a = _c.sent();
                    return [3 /*break*/, 19];
                case 19: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('live')
                        .doc(roomId)
                        .set({
                        currentSharedDocId: docRef_1.id,
                        currentSharedDocStage: 'ready',
                        currentSharedDocPreviewTitle: sharedDocPayload_1.title,
                        currentSharedDocPreviewKind: 'pdf',
                        currentSharedDocDownloadUrl: downloadUrl,
                        currentSharedDocStoragePath: storagePath_1,
                        currentSharedDocFileName: fileName_1,
                        currentSharedDocFileSizeBytes: sourceSizeBytes_1,
                        currentSharedDocStatusText: "".concat(meName, " shared ").concat(sharedDocPayload_1.title),
                        currentSharedDocPage: 0,
                        currentSharedDocSlideShow: false,
                        currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    }, { merge: true })];
                case 20:
                    _c.sent();
                    return [3 /*break*/, 23];
                case 21: return [4 /*yield*/, (0, firestore_1.default)()
                        .collection('live')
                        .doc(roomId)
                        .set({
                        currentSharedDocId: docRef_1.id,
                        currentSharedDocStage: 'converting',
                        currentSharedDocPreviewTitle: sharedDocPayload_1.title,
                        currentSharedDocPreviewKind: 'pdf',
                        currentSharedDocDownloadUrl: null,
                        currentSharedDocStoragePath: storagePath_1,
                        currentSharedDocFileName: fileName_1,
                        currentSharedDocFileSizeBytes: sourceSizeBytes_1,
                        currentSharedDocStatusText: "".concat(meName, " is preparing ").concat(sharedDocPayload_1.title),
                        currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    }, { merge: true })];
                case 22:
                    _c.sent();
                    requestConversion = (0, functions_1.default)().httpsCallable('requestPresentationConversion');
                    requestConversion({
                        roomId: roomId,
                        docId: docRef_1.id,
                        sourcePath: storagePath_1,
                        fileName: fileName_1,
                        sourceKind: sourceKind_1,
                    }).catch(function (error) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.all([
                                        docRef_1.set({
                                            status: 'error',
                                            errorMessage: String((error === null || error === void 0 ? void 0 : error.message) || 'Presentation conversion failed.'),
                                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                            updatedAtMs: Date.now(),
                                        }, { merge: true }),
                                        (0, firestore_1.default)()
                                            .collection('live')
                                            .doc(roomId)
                                            .set({
                                            currentSharedDocId: docRef_1.id,
                                            currentSharedDocStage: 'error',
                                            currentSharedDocPreviewTitle: sharedDocPayload_1.title,
                                            currentSharedDocPreviewKind: sourceKind_1,
                                            currentSharedDocDownloadUrl: firestore_1.default.FieldValue.delete(),
                                            currentSharedDocStoragePath: storagePath_1,
                                            currentSharedDocFileName: fileName_1,
                                            currentSharedDocFileSizeBytes: sourceSizeBytes_1,
                                            currentSharedDocStatusText: "".concat(meName, "'s file could not be shared"),
                                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                        }, { merge: true }),
                                    ])];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    _c.label = 23;
                case 23:
                    setShowDocsPanel(true);
                    return [3 /*break*/, 29];
                case 24:
                    error_6 = _c.sent();
                    currentShareUploadTaskRef.current = null;
                    if (!(shareAttemptId === currentShareAttemptIdRef.current && roomId)) return [3 /*break*/, 27];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            currentSharedDocId: null,
                            currentSharedDocStage: firestore_1.default.FieldValue.delete(),
                            currentSharedDocPreviewTitle: firestore_1.default.FieldValue.delete(),
                            currentSharedDocPreviewKind: firestore_1.default.FieldValue.delete(),
                            currentSharedDocDownloadUrl: firestore_1.default.FieldValue.delete(),
                            currentSharedDocStoragePath: firestore_1.default.FieldValue.delete(),
                            currentSharedDocFileName: firestore_1.default.FieldValue.delete(),
                            currentSharedDocFileSizeBytes: firestore_1.default.FieldValue.delete(),
                            currentSharedDocStatusText: null,
                            currentSharedDocPage: 0,
                            currentSharedDocSlideShow: false,
                            currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
                            currentSharedDocZoom: 1,
                            currentSharedDocPanX: 0,
                            currentSharedDocPanY: 0,
                            currentSharedDocInkPoints: [],
                            currentSharedDocMarker: null,
                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })
                            .catch(function () { })];
                case 25:
                    _c.sent();
                    if (!createdDocId) return [3 /*break*/, 27];
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("live/".concat(roomId, "/shared_docs"))
                            .doc(createdDocId)
                            .delete()
                            .catch(function () { })];
                case 26:
                    _c.sent();
                    _c.label = 27;
                case 27:
                    message = String((error_6 === null || error_6 === void 0 ? void 0 : error_6.message) || error_6 || '');
                    if (!/cancel/i.test(message)) {
                        react_native_1.Alert.alert('Share failed', message || 'Could not share the PDF.');
                    }
                    return [3 /*break*/, 29];
                case 28:
                    setDocBusy(false);
                    return [7 /*endfinally*/];
                case 29: return [2 /*return*/];
            }
        });
    }); }, [
        AudioPicker,
        PdfRenderer,
        isPremiumRoom,
        currentSharedDocId,
        currentSharedDocStage,
        meName,
        meUid,
        normalizePdfUploadPath,
        renderActivePdfPage,
        resolvePdfCachePath,
        roomId,
        getPdfRenderSize,
        getSharedFileSizeBytes,
    ]);
    var handleShareBlankDoc = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var participantRtcUid, docRef, title, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (allowPremiumScreenShare && screenShareActive) {
                        react_native_1.Alert.alert('Stop screen sharing first', 'End the live screen share before starting the in-room file presenter.');
                        return [2 /*return*/];
                    }
                    if (!roomId || !isPremiumRoom || currentSharedDocId || currentSharedDocStage)
                        return [2 /*return*/];
                    setDocBusy(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    participantRtcUid = myRtcUid || mapRtcUidFromUserId(meUid);
                    return [4 /*yield*/, ensureParticipantPresenceForShare(participantRtcUid)];
                case 2:
                    _a.sent();
                    docRef = (0, firestore_1.default)().collection("live/".concat(roomId, "/shared_docs")).doc();
                    title = 'Blank Page';
                    return [4 /*yield*/, docRef.set({
                            title: title,
                            fileName: 'blank-page.pdf',
                            downloadUrl: '',
                            storagePath: '',
                            sourceKind: 'blank',
                            status: 'ready',
                            sharedByUid: meUid,
                            sharedByName: meName,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            createdAtMs: Date.now(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAtMs: Date.now(),
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('live')
                            .doc(roomId)
                            .set({
                            currentSharedDocId: docRef.id,
                            currentSharedDocStage: 'ready',
                            currentSharedDocPreviewTitle: title,
                            currentSharedDocPreviewKind: 'blank',
                            currentSharedDocPage: 0,
                            currentSharedDocSlideShow: false,
                            currentSharedDocSlideSeconds: DEFAULT_PRESENTATION_SLIDE_SECONDS,
                            currentSharedDocStatusText: "".concat(meName, " shared a blank page"),
                            currentSharedDocZoom: 1,
                            currentSharedDocPanX: 0,
                            currentSharedDocPanY: 0,
                            currentSharedDocInkPoints: [],
                            currentSharedDocUpdatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 4:
                    _a.sent();
                    setShowDocsPanel(true);
                    return [3 /*break*/, 7];
                case 5:
                    error_7 = _a.sent();
                    react_native_1.Alert.alert('Blank page failed', String((error_7 === null || error_7 === void 0 ? void 0 : error_7.message) || 'Could not start a blank page.'));
                    return [3 /*break*/, 7];
                case 6:
                    setDocBusy(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [
        allowPremiumScreenShare,
        currentSharedDocId,
        currentSharedDocStage,
        ensureParticipantPresenceForShare,
        isPremiumRoom,
        meName,
        meUid,
        myRtcUid,
        roomChannel,
        roomHostUid,
        roomId,
        screenShareActive,
    ]);
    var handleCloseSharedPresentation = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!roomId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, clearCurrentSharedDocSession({ keepPanelOpen: true, deleteCurrentDoc: false })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _a.sent();
                    react_native_1.Alert.alert('Could not close shared file', String((error_8 === null || error_8 === void 0 ? void 0 : error_8.message) || 'Try again.'));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [clearCurrentSharedDocSession, roomId]);
    var autoOpenSharedPdf = (0, react_1.useCallback)(function (docId) { return __awaiter(void 0, void 0, void 0, function () {
        var normalizedDocId, targetDoc, snap, data, _a, opened;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    normalizedDocId = String(docId || '').trim();
                    if (!normalizedDocId)
                        return [2 /*return*/];
                    if (lastAutoOpenedDocIdRef.current === normalizedDocId)
                        return [2 /*return*/];
                    targetDoc = (currentSharedDocEntry && currentSharedDocEntry.id === normalizedDocId
                        ? currentSharedDocEntry
                        : null) ||
                        sharedDocs.find(function (item) { return item.id === normalizedDocId; }) ||
                        null;
                    if (!(!targetDoc && roomId)) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("live/".concat(roomId, "/shared_docs"))
                            .doc(normalizedDocId)
                            .get()];
                case 2:
                    snap = _b.sent();
                    if (snap.exists) {
                        data = snap.data() || {};
                        targetDoc = {
                            id: snap.id,
                            title: String(data.title || data.fileName || 'Shared PDF'),
                            fileName: String(data.fileName || 'shared.pdf'),
                            downloadUrl: String(data.downloadUrl || ''),
                            storagePath: String(data.storagePath || ''),
                            fileSizeBytes: Math.max(0, Number(data.fileSizeBytes || 0)) || null,
                            sharedByUid: data.sharedByUid ? String(data.sharedByUid) : null,
                            sharedByName: String(data.sharedByName || 'Host'),
                            createdAtMs: Number(data.createdAtMs || 0) || Date.now(),
                            status: String(data.status || 'ready'),
                            sourceKind: data.sourceKind ? String(data.sourceKind) : null,
                            errorMessage: data.errorMessage ? String(data.errorMessage) : null,
                        };
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (!targetDoc)
                        return [2 /*return*/];
                    return [4 /*yield*/, openSharedPdf(targetDoc, { silentIfPending: true })];
                case 5:
                    opened = _b.sent();
                    if (!opened) {
                        setShowDocsPanel(true);
                        return [2 /*return*/];
                    }
                    lastAutoOpenedDocIdRef.current = normalizedDocId;
                    setShowDocsPanel(false);
                    return [2 /*return*/];
            }
        });
    }); }, [currentSharedDocEntry, openSharedPdf, roomId, sharedDocs]);
    var cleanupEngine = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d, engine;
        var _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    if (!localScreenShareActive) return [3 /*break*/, 4];
                    _l.label = 1;
                case 1:
                    _l.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, stopScreenShare({ syncRoom: false })];
                case 2:
                    _l.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _l.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (!(((_e = roomRef.current) === null || _e === void 0 ? void 0 : _e.id) && meUid)) return [3 /*break*/, 17];
                    _l.label = 5;
                case 5:
                    _l.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("live/".concat(roomRef.current.id, "/participants"))
                            .doc(meUid)
                            .delete()];
                case 6:
                    _l.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _b = _l.sent();
                    return [3 /*break*/, 8];
                case 8:
                    if (!(roomHostUid === meUid)) return [3 /*break*/, 13];
                    _l.label = 9;
                case 9:
                    _l.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, firestore_1.default)().collection('live').doc(roomRef.current.id).set({
                            status: 'live',
                            hostDisconnectedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 10:
                    _l.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _c = _l.sent();
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 17];
                case 13:
                    if (!(screenShareOwnerUid === meUid)) return [3 /*break*/, 17];
                    _l.label = 14;
                case 14:
                    _l.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, (0, firestore_1.default)().collection('live').doc(roomRef.current.id).set({
                            currentScreenShareActive: false,
                            currentScreenShareOwnerUid: firestore_1.default.FieldValue.delete(),
                            currentScreenShareOwnerName: firestore_1.default.FieldValue.delete(),
                            currentScreenShareOwnerRtcUid: firestore_1.default.FieldValue.delete(),
                            currentScreenShareStartedAt: firestore_1.default.FieldValue.delete(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 15:
                    _l.sent();
                    return [3 /*break*/, 17];
                case 16:
                    _d = _l.sent();
                    return [3 /*break*/, 17];
                case 17:
                    engine = engineRef.current;
                    if (engine) {
                        try {
                            (_f = engine.stopPreview) === null || _f === void 0 ? void 0 : _f.call(engine);
                        }
                        catch (_m) { }
                        try {
                            if (typeof engine.leaveChannelEx === 'function' &&
                                ((_g = roomRef.current) === null || _g === void 0 ? void 0 : _g.channel) &&
                                myRtcUid) {
                                engine.leaveChannelEx({
                                    channelId: roomRef.current.channel,
                                    localUid: myRtcUid,
                                });
                            }
                        }
                        catch (_o) { }
                        try {
                            (_h = engine.leaveChannel) === null || _h === void 0 ? void 0 : _h.call(engine);
                        }
                        catch (_p) { }
                        try {
                            (_k = ((_j = engine.destroy) !== null && _j !== void 0 ? _j : engine.release)) === null || _k === void 0 ? void 0 : _k();
                        }
                        catch (_q) { }
                        engineRef.current = null;
                    }
                    joinedChannelRef.current = null;
                    joiningChannelRef.current = null;
                    return [2 /*return*/];
            }
        });
    }); }, [localScreenShareActive, meUid, myRtcUid, roomHostUid, screenShareOwnerUid, stopScreenShare]);
    (0, react_1.useEffect)(function () {
        if (visible)
            return;
        cleanupEngine().catch(function () { });
        resetState();
    }, [cleanupEngine, resetState, visible]);
    var ensurePermissions = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var PermissionsAndroid, permissions, _i, permissions_1, permission, granted, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (react_native_1.Platform.OS !== 'android')
                        return [2 /*return*/, true];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    PermissionsAndroid = require('react-native').PermissionsAndroid;
                    permissions = [
                        'android.permission.CAMERA',
                        'android.permission.RECORD_AUDIO',
                    ];
                    _i = 0, permissions_1 = permissions;
                    _b.label = 2;
                case 2:
                    if (!(_i < permissions_1.length)) return [3 /*break*/, 5];
                    permission = permissions_1[_i];
                    return [4 /*yield*/, PermissionsAndroid.request(permission)];
                case 3:
                    granted = _b.sent();
                    if (granted !== 'granted')
                        return [2 /*return*/, false];
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, true];
                case 6:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    var minimizePdfViewer = (0, react_1.useCallback)(function () {
        if (!activeDoc)
            return;
        setIsDocMinimized(true);
    }, [activeDoc]);
    var upsertParticipant = (0, react_1.useCallback)(function (liveId, channel, rtcUid, isHost) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!meUid)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("live/".concat(liveId, "/participants"))
                            .doc(meUid)
                            .set({
                            uid: meUid,
                            name: meName,
                            photo: mePhoto,
                            rtcUid: rtcUid,
                            isHost: isHost,
                            muted: false,
                            purged: false,
                            raisedHand: false,
                            cameraOff: false,
                            channel: channel,
                            joinedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [meName, mePhoto, meUid]);
    var updateMyParticipantState = (0, react_1.useCallback)(function (patch) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!roomId || !meUid)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .doc("live/".concat(roomId, "/participants/").concat(meUid))
                            .set(__assign(__assign({}, patch), { updatedAt: firestore_1.default.FieldValue.serverTimestamp() }), { merge: true })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [meUid, roomId]);
    var toggleRaisedHand = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    next = !handRaised;
                    setHandRaised(next);
                    return [4 /*yield*/, updateMyParticipantState({ raisedHand: next })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [handRaised, updateMyParticipantState]);
    var hydrateRoom = (0, react_1.useCallback)(function (liveId) { return __awaiter(void 0, void 0, void 0, function () {
        var snap, data, premiumRequired, nextPremiumShowId, nextHostUid, skipPremiumValidation, access, channel, uid, fallbackTitle;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, firestore_1.default)().collection('live').doc(liveId).get()];
                case 1:
                    snap = _b.sent();
                    data = ((_a = snap === null || snap === void 0 ? void 0 : snap.data) === null || _a === void 0 ? void 0 : _a.call(snap)) || {};
                    premiumRequired = !!data.premiumRequired;
                    nextPremiumShowId = data.premiumShowId ? String(data.premiumShowId) : null;
                    nextHostUid = String(data.hostUid || '');
                    skipPremiumValidation = (inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.skipPremiumValidation) ||
                        (nextPremiumShowId &&
                            premiumValidationBypassShowIdRef.current === nextPremiumShowId);
                    if (!(premiumRequired && nextPremiumShowId && !skipPremiumValidation)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, premiumService_1.canCurrentUserJoinPremiumShow)(nextPremiumShowId, nextHostUid || null)];
                case 2:
                    access = _b.sent();
                    if (!access.allowed) {
                        setPendingPremiumJoin({ liveId: liveId, showId: nextPremiumShowId });
                        setStatusText(access.reason || 'Redeem an Aqua Premium token to continue.');
                        return [2 /*return*/];
                    }
                    _b.label = 3;
                case 3:
                    setPendingPremiumJoin(null);
                    channel = String(data.channel || data.liveChannel || defaultChannel || '')
                        .trim()
                        .replace(/[^A-Za-z0-9_]/g, '_')
                        .slice(0, 64);
                    if (!channel) {
                        throw new Error('This Drift Expo room is missing a channel.');
                    }
                    uid = mapRtcUidFromUserId(meUid);
                    fallbackTitle = nextPremiumShowId ? 'Aqua Premium Show' : 'Drift Expo';
                    setRoomId(liveId);
                    setRoomChannel(channel);
                    setRoomTitle(String(data.title || data.liveTitle || (inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.title) || fallbackTitle));
                    setRoomHostUid(nextHostUid);
                    setRoomPremiumShowId(nextPremiumShowId);
                    setRoomHostName(String(data.hostName || (inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.fromName) || 'Host'));
                    setMyRtcUid(uid);
                    setJoined(false);
                    setRemoteUids([]);
                    (0, firestore_1.default)()
                        .collection("live/".concat(liveId, "/participants"))
                        .limit(12)
                        .get()
                        .then(function (participantSnap) {
                        var seededRemoteUids = ((participantSnap === null || participantSnap === void 0 ? void 0 : participantSnap.docs) || [])
                            .map(function (doc) { return Number((doc.data() || {}).rtcUid || 0); })
                            .filter(function (rtcUid) { return Number.isFinite(rtcUid) && rtcUid > 0 && rtcUid !== uid; });
                        setRemoteUids(Array.from(new Set(seededRemoteUids)));
                    })
                        .catch(function () {
                        setRemoteUids([]);
                    });
                    joinedChannelRef.current = null;
                    joiningChannelRef.current = null;
                    if (nextPremiumShowId && premiumValidationBypassShowIdRef.current === nextPremiumShowId) {
                        premiumValidationBypassShowIdRef.current = null;
                    }
                    setStatusText('Joining room');
                    return [2 /*return*/];
            }
        });
    }); }, [
        defaultChannel,
        inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.fromName,
        inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.skipPremiumValidation,
        inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.title,
        meUid,
    ]);
    (0, react_1.useEffect)(function () {
        if (!visible || !(pendingPremiumJoin === null || pendingPremiumJoin === void 0 ? void 0 : pendingPremiumJoin.showId) || !pendingPremiumJoin.liveId || !meUid)
            return;
        var accessRef = (0, firestore_1.default)().doc("users/".concat(meUid, "/premium_access/").concat(pendingPremiumJoin.showId));
        var unsub = accessRef.onSnapshot(function (snap) {
            var _a;
            var data = ((_a = snap === null || snap === void 0 ? void 0 : snap.data) === null || _a === void 0 ? void 0 : _a.call(snap)) || {};
            if (!snap.exists)
                return;
            if (String(data.status || 'active') !== 'active')
                return;
            setStatusText('Access granted');
            premiumValidationBypassShowIdRef.current = String(pendingPremiumJoin.showId);
            setPendingPremiumJoin(null);
            hydrateRoom(String(pendingPremiumJoin.liveId)).catch(function (error) {
                setStatusText(String((error === null || error === void 0 ? void 0 : error.message) || 'Could not open room'));
            });
        });
        return function () {
            try {
                unsub();
            }
            catch (_a) { }
        };
    }, [hydrateRoom, meUid, pendingPremiumJoin, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !resolvedPremiumShowId)
            return;
        setClockNowMs(Date.now());
        var timer = setInterval(function () {
            setClockNowMs(Date.now());
        }, 1000);
        return function () {
            clearInterval(timer);
        };
    }, [resolvedPremiumShowId, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !resolvedPremiumShowId) {
            setPremiumMeta(null);
            return;
        }
        var unsub = (0, firestore_1.default)()
            .collection('premium_shows')
            .doc(resolvedPremiumShowId)
            .onSnapshot(function (snap) {
            var _a;
            var data = ((_a = snap === null || snap === void 0 ? void 0 : snap.data) === null || _a === void 0 ? void 0 : _a.call(snap)) || {};
            var nextTitle = String(data.title || 'Aqua Premium Show');
            setPremiumMeta({
                title: nextTitle,
                description: data.description ? String(data.description) : null,
                status: String(data.status || 'live'),
                startsAtMs: toMillis(data.startsAt),
                endsAtMs: toMillis(data.endsAt),
                hostName: data.hostName ? String(data.hostName) : null,
            });
            setRoomTitle(function (currentTitle) {
                return currentTitle && currentTitle !== 'Drift Expo' ? currentTitle : nextTitle;
            });
            if (data.hostName) {
                setRoomHostName(function (currentName) {
                    return currentName && currentName !== 'Host' ? currentName : String(data.hostName || 'Host');
                });
            }
        });
        return function () {
            try {
                unsub();
            }
            catch (_a) { }
        };
    }, [resolvedPremiumShowId, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !resolvedPremiumShowId || (inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.liveId) || roomId)
            return;
        var cancelled = false;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var premiumSnap, premiumData, premiumHostUid, liveSnap, liveRows, activeLive, error_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('premium_shows')
                                .doc(resolvedPremiumShowId)
                                .get()];
                    case 1:
                        premiumSnap = _b.sent();
                        if (cancelled)
                            return [2 /*return*/];
                        premiumData = ((_a = premiumSnap === null || premiumSnap === void 0 ? void 0 : premiumSnap.data) === null || _a === void 0 ? void 0 : _a.call(premiumSnap)) || {};
                        premiumHostUid = String(premiumData.hostUid || '').trim();
                        if (premiumHostUid && premiumHostUid === meUid) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('live')
                                .where('premiumShowId', '==', resolvedPremiumShowId)
                                .limit(8)
                                .get()];
                    case 2:
                        liveSnap = _b.sent();
                        if (cancelled)
                            return [2 /*return*/];
                        liveRows = ((liveSnap === null || liveSnap === void 0 ? void 0 : liveSnap.docs) || []).map(function (doc) {
                            var data = doc.data() || {};
                            return {
                                liveId: doc.id,
                                status: String(data.status || '').toLowerCase(),
                                updatedAtMs: toMillis(data.updatedAt) || toMillis(data.createdAt) || Date.now(),
                            };
                        });
                        activeLive = liveRows.find(function (item) { return item.status === 'live'; }) ||
                            liveRows
                                .filter(function (item) { return item.status !== 'ended' && item.status !== 'cancelled'; })
                                .sort(function (a, b) { return b.updatedAtMs - a.updatedAtMs; })[0] ||
                            null;
                        if (!(activeLive === null || activeLive === void 0 ? void 0 : activeLive.liveId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, hydrateRoom(activeLive.liveId)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        setStatusText('Waiting for the host to open Aqua Premium.');
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_9 = _b.sent();
                        if (!cancelled) {
                            setStatusText(String((error_9 === null || error_9 === void 0 ? void 0 : error_9.message) || 'Could not find the Aqua Premium room.'));
                        }
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
        };
    }, [hydrateRoom, inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.liveId, meUid, resolvedPremiumShowId, roomId, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !resolvedPremiumShowId) {
            setParticipantTicketLabels({});
            return;
        }
        var unsub = (0, firestore_1.default)()
            .collection("premium_shows/".concat(resolvedPremiumShowId, "/tickets"))
            .onSnapshot(function (snap) {
            var nextLabels = {};
            ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).forEach(function (doc) {
                var data = doc.data() || {};
                var claimedByUid = String(data.claimedByUid || '').trim();
                if (!claimedByUid)
                    return;
                var rawCode = String(data.code || '').trim();
                var codeLast4 = String(data.codeLast4 || '').trim();
                nextLabels[claimedByUid] =
                    rawCode ||
                        (codeLast4
                            ? "Ticket ".concat(codeLast4)
                            : "Ticket ".concat(doc.id.slice(-4).toUpperCase()));
            });
            setParticipantTicketLabels(nextLabels);
        });
        return function () {
            try {
                unsub();
            }
            catch (_a) { }
        };
    }, [resolvedPremiumShowId, visible]);
    var startFreshRoom = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var ref, premiumTitle, premiumSnap, premiumData, _a, channelPrefix, channel, uid, title, error_10;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!meUid) {
                        react_native_1.Alert.alert('Sign in required', 'Please sign in to start Drift Expo.');
                        return [2 /*return*/];
                    }
                    setIsBusy(true);
                    setStatusText(engineReady
                        ? isChartered && premiumShowId
                            ? 'Creating Aqua Premium show'
                            : 'Creating room'
                        : 'Preparing camera');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 7, 8, 9]);
                    ref = (0, firestore_1.default)().collection('live').doc();
                    premiumTitle = 'Aqua Premium Show';
                    if (!(isChartered && premiumShowId)) return [3 /*break*/, 5];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, firestore_1.default)().collection('premium_shows').doc(premiumShowId).get()];
                case 3:
                    premiumSnap = _c.sent();
                    premiumData = ((_b = premiumSnap === null || premiumSnap === void 0 ? void 0 : premiumSnap.data) === null || _b === void 0 ? void 0 : _b.call(premiumSnap)) || {};
                    premiumTitle = String(premiumData.title || premiumTitle);
                    setPremiumMeta({
                        title: premiumTitle,
                        description: premiumData.description ? String(premiumData.description) : null,
                        status: String(premiumData.status || 'live'),
                        startsAtMs: toMillis(premiumData.startsAt),
                        endsAtMs: toMillis(premiumData.endsAt),
                        hostName: premiumData.hostName ? String(premiumData.hostName) : meName,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    channelPrefix = isChartered && premiumShowId ? 'aqua_premium' : 'drift';
                    channel = "".concat(channelPrefix, "_").concat(ref.id).replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64);
                    uid = mapRtcUidFromUserId(meUid);
                    title = isChartered && premiumShowId ? premiumTitle : 'Drift Expo';
                    return [4 /*yield*/, ref.set({
                            title: title,
                            liveTitle: title,
                            channel: channel,
                            liveChannel: channel,
                            hostUid: meUid,
                            hostName: meName,
                            hostPhoto: mePhoto,
                            roomKind: isChartered && premiumShowId ? 'aqua-premium' : 'drift-expo',
                            premiumRequired: !!(isChartered && premiumShowId),
                            premiumShowId: isChartered ? premiumShowId || null : null,
                            status: 'live',
                            appId: appId,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        })];
                case 6:
                    _c.sent();
                    setRoomId(ref.id);
                    setRoomChannel(channel);
                    setRoomTitle(title);
                    setRoomHostUid(meUid);
                    setRoomPremiumShowId(isChartered ? premiumShowId || null : null);
                    setRoomHostName(meName);
                    setMyRtcUid(uid);
                    setJoined(false);
                    setRemoteUids([]);
                    upsertParticipant(ref.id, channel, uid, true).catch(function () { });
                    joinedChannelRef.current = null;
                    joiningChannelRef.current = null;
                    setStatusText(engineReady
                        ? isChartered && premiumShowId
                            ? 'Opening Aqua Premium camera'
                            : 'Joining room'
                        : 'Camera warming up');
                    return [3 /*break*/, 9];
                case 7:
                    error_10 = _c.sent();
                    react_native_1.Alert.alert('Could not start Drift Expo', String((error_10 === null || error_10 === void 0 ? void 0 : error_10.message) || 'Try again.'));
                    return [3 /*break*/, 9];
                case 8:
                    setIsBusy(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, [appId, engineReady, isChartered, meName, mePhoto, meUid, premiumShowId, upsertParticipant]);
    (0, react_1.useEffect)(function () {
        if (!visible)
            return;
        if (!(inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.liveId))
            return;
        hydrateRoom(String(inviteJoinPreset.liveId)).catch(function (error) {
            react_native_1.Alert.alert('Could not open invite', String((error === null || error === void 0 ? void 0 : error.message) || 'This room is unavailable.'));
        });
    }, [hydrateRoom, inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.liveId, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible)
            return;
        var cancelled = false;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var snap, rows, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('live')
                                .orderBy('updatedAt', 'desc')
                                .limit(12)
                                .get()];
                    case 1:
                        snap = _b.sent();
                        if (cancelled)
                            return [2 /*return*/];
                        rows = ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                            var data = doc.data() || {};
                            return {
                                id: doc.id,
                                title: String(data.title || data.liveTitle || 'Drift Expo'),
                                hostName: String(data.hostName || 'Host'),
                                playbackUrl: String(data.playbackUrl || data.recordingUrl || '').trim() || null,
                                status: String(data.status || ''),
                                updatedAtMs: toMillis(data.updatedAt) || toMillis(data.endedAt) || toMillis(data.createdAt),
                            };
                        });
                        setRecentDrifts(rows);
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
        };
    }, [visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !showInvitePanel)
            return;
        var cancelled = false;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var snap, rows, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, firestore_1.default)()
                                .collection('users')
                                .orderBy('lastActiveAt', 'desc')
                                .limit(24)
                                .get()];
                    case 1:
                        snap = _b.sent();
                        if (cancelled)
                            return [2 /*return*/];
                        rows = ((snap === null || snap === void 0 ? void 0 : snap.docs) || [])
                            .map(function (doc) {
                            var data = doc.data() || {};
                            if (doc.id === meUid)
                                return null;
                            if ((data === null || data === void 0 ? void 0 : data.online) !== true)
                                return null;
                            return normalizeSearchResult({
                                kind: 'user',
                                id: doc.id,
                                label: data.displayName || data.name || data.username || 'User',
                                extra: {
                                    uid: doc.id,
                                    displayName: data.displayName || data.name || null,
                                    username: data.username || data.userName || null,
                                    photoURL: data.userPhoto || data.photoURL || null,
                                },
                            });
                        })
                            .filter(Boolean);
                        setOnlineInvitees(rows);
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        if (!cancelled)
                            setOnlineInvitees([]);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
        };
    }, [meUid, showInvitePanel, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !Agora || !appId || engineRef.current)
            return;
        var cancelled = false;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var ok, isV4, liveProfile, broadcasterRole, engine, engine, error_11;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23;
            return __generator(this, function (_24) {
                switch (_24.label) {
                    case 0:
                        _24.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, ensurePermissions()];
                    case 1:
                        ok = _24.sent();
                        if (!ok) {
                            setStatusText('Camera or mic permission denied');
                            return [2 /*return*/];
                        }
                        isV4 = typeof (Agora === null || Agora === void 0 ? void 0 : Agora.createAgoraRtcEngine) === 'function';
                        liveProfile = (_d = (_b = (_a = Agora.ChannelProfileType) === null || _a === void 0 ? void 0 : _a.ChannelProfileLiveBroadcasting) !== null && _b !== void 0 ? _b : (_c = Agora.ChannelProfileType) === null || _c === void 0 ? void 0 : _c.ChannelProfileCommunication) !== null && _d !== void 0 ? _d : 1;
                        broadcasterRole = (_h = (_f = (_e = Agora.ClientRoleType) === null || _e === void 0 ? void 0 : _e.ClientRoleBroadcaster) !== null && _f !== void 0 ? _f : (_g = Agora.ClientRole) === null || _g === void 0 ? void 0 : _g.Broadcaster) !== null && _h !== void 0 ? _h : 1;
                        if (!isV4) return [3 /*break*/, 2];
                        engine = Agora.createAgoraRtcEngine();
                        (_j = engine.initialize) === null || _j === void 0 ? void 0 : _j.call(engine, {
                            appId: appId,
                            channelProfile: liveProfile,
                        });
                        (_k = engine.enableVideo) === null || _k === void 0 ? void 0 : _k.call(engine);
                        (_l = engine.enableAudio) === null || _l === void 0 ? void 0 : _l.call(engine);
                        (_m = engine.setDefaultAudioRouteToSpeakerphone) === null || _m === void 0 ? void 0 : _m.call(engine, true);
                        (_o = engine.setEnableSpeakerphone) === null || _o === void 0 ? void 0 : _o.call(engine, true);
                        (_p = engine.setDefaultMuteAllRemoteAudioStreams) === null || _p === void 0 ? void 0 : _p.call(engine, false);
                        (_q = engine.setDefaultMuteAllRemoteVideoStreams) === null || _q === void 0 ? void 0 : _q.call(engine, false);
                        (_r = engine.adjustPlaybackSignalVolume) === null || _r === void 0 ? void 0 : _r.call(engine, 100);
                        (_s = engine.adjustRecordingSignalVolume) === null || _s === void 0 ? void 0 : _s.call(engine, 100);
                        (_t = engine.enableAudioVolumeIndication) === null || _t === void 0 ? void 0 : _t.call(engine, 300, 3, false);
                        (_u = engine.enableLocalVideo) === null || _u === void 0 ? void 0 : _u.call(engine, true);
                        (_v = engine.setClientRole) === null || _v === void 0 ? void 0 : _v.call(engine, broadcasterRole);
                        applyStrongRtcProfile(engine);
                        (_w = engine.registerEventHandler) === null || _w === void 0 ? void 0 : _w.call(engine, {
                            onJoinChannelSuccess: function (connection) {
                                if (!cancelled) {
                                    setJoined(true);
                                    setStatusText('Live');
                                    if (connection === null || connection === void 0 ? void 0 : connection.localUid) {
                                        setMyRtcUid(Number(connection.localUid) || 0);
                                    }
                                }
                            },
                            onFirstLocalVideoFrame: function (source) {
                                var _a, _b;
                                var screenSource = (_b = (_a = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _a === void 0 ? void 0 : _a.VideoSourceScreenPrimary) !== null && _b !== void 0 ? _b : 2;
                                if (Number(source) !== Number(screenSource))
                                    return;
                                handleLocalScreenShareReady();
                            },
                            onLocalVideoStateChanged: function (source, state, reason) {
                                var _a, _b;
                                var screenSource = (_b = (_a = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _a === void 0 ? void 0 : _a.VideoSourceScreenPrimary) !== null && _b !== void 0 ? _b : 2;
                                if (Number(source) !== Number(screenSource))
                                    return;
                                if (Number(state) === 1 || Number(state) === 2) {
                                    handleLocalScreenShareReady();
                                    return;
                                }
                                if (Number(state) === 3) {
                                    handleLocalScreenShareFailure(Number(reason));
                                }
                            },
                            onUserJoined: function (connection, uid) {
                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                                var next = Number(uid);
                                if (!Number.isFinite(next) || next <= 0)
                                    return;
                                if (connection === null || connection === void 0 ? void 0 : connection.localUid) {
                                    setMyRtcUid(function (prev) { return prev || Number(connection.localUid) || 0; });
                                }
                                try {
                                    (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.muteRemoteAudioStream) === null || _b === void 0 ? void 0 : _b.call(_a, next, false);
                                    (_d = (_c = engineRef.current) === null || _c === void 0 ? void 0 : _c.muteRemoteVideoStream) === null || _d === void 0 ? void 0 : _d.call(_c, next, false);
                                    (_f = (_e = engineRef.current) === null || _e === void 0 ? void 0 : _e.subscribeRemoteAudioStream) === null || _f === void 0 ? void 0 : _f.call(_e, next, true);
                                    (_h = (_g = engineRef.current) === null || _g === void 0 ? void 0 : _g.subscribeRemoteVideoStream) === null || _h === void 0 ? void 0 : _h.call(_g, next, true);
                                    (_k = (_j = engineRef.current) === null || _j === void 0 ? void 0 : _j.setRemoteVideoStreamType) === null || _k === void 0 ? void 0 : _k.call(_j, next, 0);
                                    // Also subscribe to screen share stream if this user is screen sharing
                                    try {
                                        (_m = (_l = engineRef.current) === null || _l === void 0 ? void 0 : _l.subscribeRemoteVideoStream) === null || _m === void 0 ? void 0 : _m.call(_l, next, true);
                                        (_p = (_o = engineRef.current) === null || _o === void 0 ? void 0 : _o.setRemoteVideoStreamType) === null || _p === void 0 ? void 0 : _p.call(_o, next, 0);
                                    }
                                    catch (_q) { }
                                }
                                catch (_r) { }
                                setRemoteUids(function (prev) { return (prev.includes(next) ? prev : __spreadArray(__spreadArray([], prev, true), [next], false)); });
                            },
                            onUserOffline: function (_conn, uid) {
                                var next = Number(uid);
                                setRemoteUids(function (prev) { return prev.filter(function (item) { return item !== next; }); });
                            },
                            onNetworkQuality: function (_conn, _uid, txQuality, rxQuality) {
                                var worstQuality = Math.max(Number(txQuality), Number(rxQuality));
                                if (worstQuality >= 5) {
                                    setNetworkWarning('Your network is poor to support livestreaming.');
                                }
                                else if (worstQuality <= 3) {
                                    setNetworkWarning(null);
                                }
                                if (worstQuality >= 4) {
                                    setStatusText('Connection is unstable. Keeping audio on.');
                                }
                            },
                            onRemoteVideoStateChanged: function (_conn, remoteUid, state, reason) {
                                var _a, _b, _c, _d;
                                if (Number(state) === 3 || Number(state) === 4) {
                                    try {
                                        (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.setRemoteVideoStreamType) === null || _b === void 0 ? void 0 : _b.call(_a, Number(remoteUid), 0);
                                        (_d = (_c = engineRef.current) === null || _c === void 0 ? void 0 : _c.subscribeRemoteVideoStream) === null || _d === void 0 ? void 0 : _d.call(_c, Number(remoteUid), true);
                                    }
                                    catch (_e) { }
                                    setStatusText(Number(reason) === 1 ? 'Video is recovering from network strain.' : 'Refreshing remote video...');
                                }
                                else if (Number(state) === 2) {
                                    setStatusText('Live');
                                }
                            },
                            onRemoteAudioStateChanged: function (_conn, _remoteUid, state) {
                                if (Number(state) === 3 || Number(state) === 4) {
                                    setStatusText('Audio is recovering...');
                                }
                            },
                            onAudioVolumeIndication: function (_conn, speakers) {
                                var activeUids = Array.isArray(speakers)
                                    ? speakers
                                        .filter(function (item) { return Number((item === null || item === void 0 ? void 0 : item.volume) || 0) >= 8; })
                                        .map(function (item) { return Number((item === null || item === void 0 ? void 0 : item.uid) || 0); })
                                    : [];
                                markSpeakerActivity(activeUids);
                            },
                            onConnectionStateChanged: function (_connection, state) {
                                var next = Number(state);
                                if (next === 2) {
                                    setNetworkWarning(null);
                                    setStatusText('Live');
                                }
                                else if (next === 3 || next === 4) {
                                    setStatusText('Reconnecting video...');
                                }
                            },
                            onError: function (err) {
                                if (Number(err) === 1052) {
                                    return;
                                }
                                setStatusText("Agora error ".concat(err));
                            },
                        });
                        engineRef.current = engine;
                        if (!cancelled)
                            setEngineReady(true);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!((Agora === null || Agora === void 0 ? void 0 : Agora.RtcEngine) && typeof Agora.RtcEngine.create === 'function')) return [3 /*break*/, 4];
                        return [4 /*yield*/, Agora.RtcEngine.create(appId)];
                    case 3:
                        engine = _24.sent();
                        (_x = engine.enableVideo) === null || _x === void 0 ? void 0 : _x.call(engine);
                        (_y = engine.enableAudio) === null || _y === void 0 ? void 0 : _y.call(engine);
                        (_z = engine.setDefaultAudioRouteToSpeakerphone) === null || _z === void 0 ? void 0 : _z.call(engine, true);
                        (_0 = engine.setEnableSpeakerphone) === null || _0 === void 0 ? void 0 : _0.call(engine, true);
                        (_1 = engine.adjustPlaybackSignalVolume) === null || _1 === void 0 ? void 0 : _1.call(engine, 100);
                        (_2 = engine.adjustRecordingSignalVolume) === null || _2 === void 0 ? void 0 : _2.call(engine, 100);
                        (_3 = engine.enableAudioVolumeIndication) === null || _3 === void 0 ? void 0 : _3.call(engine, 300, 3, false);
                        (_4 = engine.enableLocalVideo) === null || _4 === void 0 ? void 0 : _4.call(engine, true);
                        (_5 = engine.startPreview) === null || _5 === void 0 ? void 0 : _5.call(engine);
                        applyStrongRtcProfile(engine);
                        (_6 = engine.setChannelProfile) === null || _6 === void 0 ? void 0 : _6.call(engine, (_10 = (_8 = (_7 = Agora.ChannelProfile) === null || _7 === void 0 ? void 0 : _7.LiveBroadcasting) !== null && _8 !== void 0 ? _8 : (_9 = Agora.ChannelProfile) === null || _9 === void 0 ? void 0 : _9.Communication) !== null && _10 !== void 0 ? _10 : Agora.ChannelProfile);
                        (_11 = engine.setClientRole) === null || _11 === void 0 ? void 0 : _11.call(engine, (_13 = (_12 = Agora.ClientRole) === null || _12 === void 0 ? void 0 : _12.Broadcaster) !== null && _13 !== void 0 ? _13 : Agora.ClientRole);
                        (_14 = engine.addListener) === null || _14 === void 0 ? void 0 : _14.call(engine, 'JoinChannelSuccess', function () {
                            if (!cancelled) {
                                setJoined(true);
                                setStatusText('Live');
                            }
                        });
                        (_15 = engine.addListener) === null || _15 === void 0 ? void 0 : _15.call(engine, 'FirstLocalVideoFrame', function (source) {
                            var _a, _b;
                            var screenSource = (_b = (_a = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _a === void 0 ? void 0 : _a.VideoSourceScreenPrimary) !== null && _b !== void 0 ? _b : 2;
                            if (Number(source) !== Number(screenSource))
                                return;
                            if (!pendingScreenShareStartRef.current)
                                return;
                            pendingScreenShareStartRef.current = false;
                            setScreenShareActive(true);
                            setScreenShareOwnerUid(meUid);
                            setScreenShareOwnerName(meName);
                            setScreenShareOwnerRtcUid(myRtcUid || mapRtcUidFromUserId(meUid));
                            setStatusText('Screen sharing is live');
                            handleLocalScreenShareReady();
                        });
                        (_16 = engine.addListener) === null || _16 === void 0 ? void 0 : _16.call(engine, 'LocalVideoStateChanged', function (source, state, reason) {
                            var _a, _b;
                            var screenSource = (_b = (_a = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _a === void 0 ? void 0 : _a.VideoSourceScreenPrimary) !== null && _b !== void 0 ? _b : 2;
                            if (Number(source) !== Number(screenSource))
                                return;
                            if (Number(state) === 1 || Number(state) === 2) {
                                handleLocalScreenShareReady();
                                return;
                            }
                            if (Number(state) === 3) {
                                handleLocalScreenShareFailure(Number(reason));
                            }
                        });
                        (_17 = engine.addListener) === null || _17 === void 0 ? void 0 : _17.call(engine, 'UserJoined', function (uid) {
                            var _a, _b, _c, _d, _e, _f;
                            var next = Number(uid);
                            if (!Number.isFinite(next) || next <= 0)
                                return;
                            try {
                                (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.muteRemoteAudioStream) === null || _b === void 0 ? void 0 : _b.call(_a, next, false);
                                (_d = (_c = engineRef.current) === null || _c === void 0 ? void 0 : _c.muteRemoteVideoStream) === null || _d === void 0 ? void 0 : _d.call(_c, next, false);
                                (_f = (_e = engineRef.current) === null || _e === void 0 ? void 0 : _e.setRemoteVideoStreamType) === null || _f === void 0 ? void 0 : _f.call(_e, next, 0);
                            }
                            catch (_g) { }
                            setRemoteUids(function (prev) { return (prev.includes(next) ? prev : __spreadArray(__spreadArray([], prev, true), [next], false)); });
                        });
                        (_18 = engine.addListener) === null || _18 === void 0 ? void 0 : _18.call(engine, 'UserOffline', function (uid) {
                            var next = Number(uid);
                            setRemoteUids(function (prev) { return prev.filter(function (item) { return item !== next; }); });
                        });
                        (_19 = engine.addListener) === null || _19 === void 0 ? void 0 : _19.call(engine, 'NetworkQuality', function (_uid, txQuality, rxQuality) {
                            var worstQuality = Math.max(Number(txQuality), Number(rxQuality));
                            if (worstQuality >= 5) {
                                setNetworkWarning('Your network is poor to support livestreaming.');
                            }
                            else if (worstQuality <= 3) {
                                setNetworkWarning(null);
                            }
                            if (worstQuality >= 4) {
                                setStatusText('Connection is unstable. Keeping audio on.');
                            }
                        });
                        (_20 = engine.addListener) === null || _20 === void 0 ? void 0 : _20.call(engine, 'RemoteVideoStateChanged', function (uid, state, reason) {
                            var _a, _b, _c, _d;
                            if (Number(state) === 3 || Number(state) === 4) {
                                try {
                                    (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.setRemoteVideoStreamType) === null || _b === void 0 ? void 0 : _b.call(_a, Number(uid), 0);
                                    (_d = (_c = engineRef.current) === null || _c === void 0 ? void 0 : _c.subscribeRemoteVideoStream) === null || _d === void 0 ? void 0 : _d.call(_c, Number(uid), true);
                                }
                                catch (_e) { }
                                setStatusText(Number(reason) === 1 ? 'Video is recovering from network strain.' : 'Refreshing remote video...');
                            }
                            else if (Number(state) === 2) {
                                setStatusText('Live');
                            }
                        });
                        (_21 = engine.addListener) === null || _21 === void 0 ? void 0 : _21.call(engine, 'RemoteAudioStateChanged', function (_uid, state) {
                            if (Number(state) === 3 || Number(state) === 4) {
                                setStatusText('Audio is recovering...');
                            }
                        });
                        (_22 = engine.addListener) === null || _22 === void 0 ? void 0 : _22.call(engine, 'AudioVolumeIndication', function (speakers) {
                            var activeUids = Array.isArray(speakers)
                                ? speakers
                                    .filter(function (item) { return Number((item === null || item === void 0 ? void 0 : item.volume) || 0) >= 8; })
                                    .map(function (item) { return Number((item === null || item === void 0 ? void 0 : item.uid) || 0); })
                                : [];
                            markSpeakerActivity(activeUids);
                        });
                        (_23 = engine.addListener) === null || _23 === void 0 ? void 0 : _23.call(engine, 'ConnectionStateChanged', function (state) {
                            var next = Number(state);
                            if (next === 2) {
                                setStatusText('Live');
                            }
                            else if (next === 3 || next === 4) {
                                setStatusText('Reconnecting video...');
                            }
                        });
                        engineRef.current = engine;
                        if (!cancelled)
                            setEngineReady(true);
                        _24.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_11 = _24.sent();
                        if (!cancelled) {
                            setStatusText(String((error_11 === null || error_11 === void 0 ? void 0 : error_11.message) || 'Agora init failed'));
                        }
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
        };
    }, [Agora, appId, applyStrongRtcProfile, ensurePermissions, markSpeakerActivity, myRtcUid, roomChannel, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !roomId || !roomChannel || !myRtcUid || !engineRef.current)
            return;
        if (joinedChannelRef.current === roomChannel)
            return;
        if (joiningChannelRef.current === roomChannel)
            return;
        var cancelled = false;
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var engine, isHost, isV4, mediaOptions, error_12;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        _m.trys.push([0, 8, , 9]);
                        engine = engineRef.current;
                        isHost = roomHostUid === meUid;
                        isV4 = typeof (Agora === null || Agora === void 0 ? void 0 : Agora.createAgoraRtcEngine) === 'function';
                        joiningChannelRef.current = roomChannel;
                        if (!isV4) return [3 /*break*/, 2];
                        mediaOptions = {
                            clientRoleType: (_d = (_b = (_a = Agora.ClientRoleType) === null || _a === void 0 ? void 0 : _a.ClientRoleBroadcaster) !== null && _b !== void 0 ? _b : (_c = Agora.ClientRole) === null || _c === void 0 ? void 0 : _c.Broadcaster) !== null && _d !== void 0 ? _d : 1,
                            publishCameraTrack: true,
                            publishMicrophoneTrack: true,
                            autoSubscribeAudio: true,
                            autoSubscribeVideo: true,
                        };
                        (_e = engine.enableLocalVideo) === null || _e === void 0 ? void 0 : _e.call(engine, true);
                        (_f = engine.startPreview) === null || _f === void 0 ? void 0 : _f.call(engine);
                        applyStrongRtcProfile(engine);
                        (_g = engine.updateChannelMediaOptions) === null || _g === void 0 ? void 0 : _g.call(engine, mediaOptions);
                        return [4 /*yield*/, engine.joinChannel(null, roomChannel, myRtcUid, mediaOptions)];
                    case 1:
                        _m.sent();
                        (_h = engine.muteAllRemoteAudioStreams) === null || _h === void 0 ? void 0 : _h.call(engine, false);
                        return [3 /*break*/, 4];
                    case 2:
                        (_j = engine.enableLocalVideo) === null || _j === void 0 ? void 0 : _j.call(engine, true);
                        (_k = engine.startPreview) === null || _k === void 0 ? void 0 : _k.call(engine);
                        applyStrongRtcProfile(engine);
                        return [4 /*yield*/, engine.joinChannel(null, roomChannel, myRtcUid)];
                    case 3:
                        _m.sent();
                        (_l = engine.muteAllRemoteAudioStreams) === null || _l === void 0 ? void 0 : _l.call(engine, false);
                        _m.label = 4;
                    case 4:
                        if (cancelled)
                            return [2 /*return*/];
                        joinedChannelRef.current = roomChannel;
                        joiningChannelRef.current = null;
                        setJoined(true);
                        setStatusText('Live');
                        return [4 /*yield*/, upsertParticipant(roomId, roomChannel, myRtcUid, isHost)];
                    case 5:
                        _m.sent();
                        if (!roomPremiumShowId) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, premiumService_1.recordPremiumEntry)(roomPremiumShowId).catch(function () { })];
                    case 6:
                        _m.sent();
                        _m.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_12 = _m.sent();
                        joiningChannelRef.current = null;
                        if (!cancelled) {
                            setStatusText(String((error_12 === null || error_12 === void 0 ? void 0 : error_12.message) || 'Could not join channel'));
                        }
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
            if (joiningChannelRef.current === roomChannel) {
                joiningChannelRef.current = null;
            }
        };
    }, [Agora, applyStrongRtcProfile, meUid, myRtcUid, roomChannel, roomHostUid, roomId, roomPremiumShowId, upsertParticipant, visible]);
    (0, react_1.useEffect)(function () {
        if (!visible || !roomId)
            return;
        var unsubRoom = (0, firestore_1.default)()
            .collection('live')
            .doc(roomId)
            .onSnapshot(function (snap) {
            var _a;
            var data = ((_a = snap === null || snap === void 0 ? void 0 : snap.data) === null || _a === void 0 ? void 0 : _a.call(snap)) || {};
            var nextStatus = String(data.status || 'live');
            if (nextStatus === 'ended' && roomHostUid !== meUid) {
                setStatusText('This drift has ended');
            }
            if (nextStatus === 'ended') {
                setScreenShareActive(false);
                setScreenShareOwnerUid(null);
                setScreenShareOwnerName(null);
                setScreenShareOwnerRtcUid(0);
                setLocalScreenShareActive(false);
                pendingScreenShareStartRef.current = false;
            }
            if (data.channel) {
                setRoomChannel(String(data.channel).trim().replace(/[^A-Za-z0-9_]/g, '_').slice(0, 64));
            }
            setRoomPremiumShowId(data.premiumShowId ? String(data.premiumShowId) : null);
            var currentSharedDocIdValue = String(data.currentSharedDocId || '').trim();
            setCurrentSharedDocId(currentSharedDocIdValue || null);
            var nextSharedDocStage = String(data.currentSharedDocStage || '').trim().toLowerCase();
            setCurrentSharedDocStage(nextSharedDocStage === 'choosing' ||
                nextSharedDocStage === 'selected' ||
                nextSharedDocStage === 'uploading' ||
                nextSharedDocStage === 'converting' ||
                nextSharedDocStage === 'ready' ||
                nextSharedDocStage === 'error'
                ? nextSharedDocStage
                : null);
            if (isPremiumRoom &&
                ((currentSharedDocIdValue &&
                    (nextSharedDocStage === 'selected' ||
                        nextSharedDocStage === 'uploading' ||
                        nextSharedDocStage === 'converting' ||
                        nextSharedDocStage === 'ready' ||
                        nextSharedDocStage === 'error')) ||
                    nextSharedDocStage === 'choosing')) {
                docsPanelAutoOpenedRef.current = true;
                setShowDocsPanel(true);
            }
            else if (isPremiumRoom &&
                !currentSharedDocIdValue &&
                !nextSharedDocStage &&
                docsPanelAutoOpenedRef.current) {
                docsPanelAutoOpenedRef.current = false;
                setShowDocsPanel(false);
            }
            setCurrentSharedDocPreviewTitle(data.currentSharedDocPreviewTitle
                ? String(data.currentSharedDocPreviewTitle)
                : null);
            setCurrentSharedDocPreviewKind(data.currentSharedDocPreviewKind
                ? String(data.currentSharedDocPreviewKind)
                : null);
            setCurrentSharedDocDownloadUrl(data.currentSharedDocDownloadUrl
                ? String(data.currentSharedDocDownloadUrl)
                : null);
            setCurrentSharedDocStoragePath(data.currentSharedDocStoragePath
                ? String(data.currentSharedDocStoragePath)
                : null);
            setCurrentSharedDocFileName(data.currentSharedDocFileName
                ? String(data.currentSharedDocFileName)
                : null);
            setCurrentSharedDocFileSizeBytes(Math.max(0, Number(data.currentSharedDocFileSizeBytes || 0)) || null);
            setScreenShareActive(!!data.currentScreenShareActive);
            setScreenShareOwnerUid(data.currentScreenShareOwnerUid ? String(data.currentScreenShareOwnerUid) : null);
            setScreenShareOwnerName(data.currentScreenShareOwnerName ? String(data.currentScreenShareOwnerName) : null);
            setScreenShareOwnerRtcUid(Math.max(0, Number(data.currentScreenShareOwnerRtcUid || 0)));
            setCurrentSharedDocPage(Math.max(0, Number(data.currentSharedDocPage || 0)));
            setCurrentSharedDocSlideShow(!!data.currentSharedDocSlideShow);
            setCurrentSharedDocZoom(Math.max(1, Math.min(3, Number(data.currentSharedDocZoom || 1))));
            setCurrentSharedDocPanX(Math.max(0, Math.min(1, Number(data.currentSharedDocPanX || 0))));
            setCurrentSharedDocPanY(Math.max(0, Math.min(1, Number(data.currentSharedDocPanY || 0))));
            setSharedDocStatusText(data.currentSharedDocStatusText ? String(data.currentSharedDocStatusText) : null);
            setCurrentSharedDocSlideSeconds(Math.max(6, Math.min(20, Number(data.currentSharedDocSlideSeconds || DEFAULT_PRESENTATION_SLIDE_SECONDS))));
            var markerData = data.currentSharedDocMarker && typeof data.currentSharedDocMarker === 'object'
                ? data.currentSharedDocMarker
                : null;
            if (markerData &&
                (markerData.mode === 'pointer' || markerData.mode === 'highlight')) {
                setSharedDocMarker({
                    mode: markerData.mode,
                    x: Math.max(0, Math.min(1, Number(markerData.x || 0))),
                    y: Math.max(0, Math.min(1, Number(markerData.y || 0))),
                });
            }
            else {
                setSharedDocMarker(null);
            }
            var inkPoints = Array.isArray(data.currentSharedDocInkPoints)
                ? data.currentSharedDocInkPoints
                    .map(function (point) { return ({
                    id: String((point === null || point === void 0 ? void 0 : point.id) || "".concat(Date.now())),
                    x: Math.max(0, Math.min(1, Number((point === null || point === void 0 ? void 0 : point.x) || 0))),
                    y: Math.max(0, Math.min(1, Number((point === null || point === void 0 ? void 0 : point.y) || 0))),
                    size: Math.max(2, Math.min(12, Number((point === null || point === void 0 ? void 0 : point.size) || 4))),
                    color: String((point === null || point === void 0 ? void 0 : point.color) || '#EF4444'),
                    strokeId: (point === null || point === void 0 ? void 0 : point.strokeId) ? String(point.strokeId) : undefined,
                }); })
                    .slice(-SHARED_DOC_MAX_INK_POINTS)
                : [];
            setSharedDocInkPoints(inkPoints);
            var previewKind = String(data.currentSharedDocPreviewKind || '').trim().toLowerCase();
            if (currentSharedDocIdValue && (nextSharedDocStage === 'ready' || previewKind === 'blank')) {
                setTimeout(function () {
                    autoOpenSharedPdf(currentSharedDocIdValue).catch(function () { });
                }, 0);
            }
            var soundEvent = data.lastSoundEffect && typeof data.lastSoundEffect === 'object'
                ? data.lastSoundEffect
                : null;
            var soundEventId = String((soundEvent === null || soundEvent === void 0 ? void 0 : soundEvent.eventId) || '').trim();
            var soundEffectId = String((soundEvent === null || soundEvent === void 0 ? void 0 : soundEvent.effectId) || '').trim();
            if (soundEventId &&
                soundEffectId &&
                !handledSoundEventIdsRef.current.has(soundEventId)) {
                handledSoundEventIdsRef.current.add(soundEventId);
                playRoomSoundEffect(soundEffectId);
            }
        });
        var unsubParticipants = (0, firestore_1.default)()
            .collection("live/".concat(roomId, "/participants"))
            .onSnapshot(function (snap) {
            var _a, _b;
            var rows = ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                var data = doc.data() || {};
                return {
                    uid: String(data.uid || doc.id),
                    name: String(data.name || 'Viber'),
                    photo: data.photo || null,
                    rtcUid: Number(data.rtcUid || 0),
                    isHost: !!data.isHost,
                    muted: !!data.muted,
                    purged: !!data.purged,
                    raisedHand: !!data.raisedHand,
                    cameraOff: !!data.cameraOff,
                };
            });
            setParticipants(rows);
            var meRow = rows.find(function (item) { return item.uid === meUid; });
            if ((meRow === null || meRow === void 0 ? void 0 : meRow.purged) && !meRow.isHost) {
                react_native_1.Alert.alert('Removed by host', 'The host removed you from this Aqua Premium room.');
                onClose();
                return;
            }
            if (meRow) {
                setHandRaised(!!meRow.raisedHand);
            }
            if (meRow && !meRow.isHost) {
                var shouldMute = !!meRow.muted;
                setMicMuted(shouldMute);
                try {
                    (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.muteLocalAudioStream) === null || _b === void 0 ? void 0 : _b.call(_a, shouldMute);
                }
                catch (_c) { }
            }
        });
        var unsubComments = (0, firestore_1.default)()
            .collection("live/".concat(roomId, "/comments"))
            .orderBy('createdAt', 'asc')
            .limit(200)
            .onSnapshot(function (snap) {
            var rows = ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                var data = doc.data() || {};
                return {
                    id: doc.id,
                    text: String(data.text || ''),
                    fromUid: String(data.fromUid || ''),
                    fromName: String(data.fromName || 'User'),
                    fromPhoto: data.fromPhoto || null,
                    replyToId: data.replyToId ? String(data.replyToId) : null,
                    replyToText: data.replyToText ? String(data.replyToText) : null,
                    replyToName: data.replyToName ? String(data.replyToName) : null,
                    createdAtMs: toMillis(data.createdAt) || Number(data.createdAtMs || 0) || Date.now(),
                };
            });
            setComments(rows);
        });
        var unsubReactions = (0, firestore_1.default)()
            .collection("live/".concat(roomId, "/reactions"))
            .orderBy('createdAt', 'asc')
            .limit(120)
            .onSnapshot(function (snap) {
            ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).forEach(function (doc, index) {
                if (seenReactionIdsRef.current.has(doc.id))
                    return;
                seenReactionIdsRef.current.add(doc.id);
                var data = doc.data() || {};
                var emoji = String(data.emoji || '').trim();
                if (!emoji)
                    return;
                var anim = new react_native_1.Animated.Value(0);
                var lane = index % 6;
                var xOffsets = [-118, -72, -28, 28, 72, 118];
                setFloatingReactions(function (prev) {
                    return __spreadArray(__spreadArray([], prev, true), [{ id: doc.id, emoji: emoji, anim: anim, lane: lane, xOffset: xOffsets[lane] }], false).slice(-6);
                });
                react_native_1.Animated.timing(anim, {
                    toValue: 1,
                    duration: 3600,
                    useNativeDriver: true,
                }).start(function () {
                    setFloatingReactions(function (prev) { return prev.filter(function (item) { return item.id !== doc.id; }); });
                });
            });
        });
        var unsubSharedDocs = (0, firestore_1.default)()
            .collection("live/".concat(roomId, "/shared_docs"))
            .orderBy('createdAt', 'desc')
            .limit(24)
            .onSnapshot(function (snap) {
            var rows = ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).map(function (doc) {
                var data = doc.data() || {};
                return {
                    id: doc.id,
                    title: String(data.title || data.fileName || 'Shared PDF'),
                    fileName: String(data.fileName || 'shared.pdf'),
                    downloadUrl: String(data.downloadUrl || ''),
                    storagePath: String(data.storagePath || ''),
                    fileSizeBytes: Math.max(0, Number(data.fileSizeBytes || 0)) || null,
                    sharedByUid: data.sharedByUid ? String(data.sharedByUid) : null,
                    sharedByName: String(data.sharedByName || 'Host'),
                    createdAtMs: toMillis(data.createdAt) || Number(data.createdAtMs || 0) || 0,
                    status: String(data.status || 'ready'),
                    sourceKind: data.sourceKind ? String(data.sourceKind) : null,
                    errorMessage: data.errorMessage ? String(data.errorMessage) : null,
                };
            });
            setSharedDocs(rows);
        });
        return function () {
            try {
                unsubRoom();
            }
            catch (_a) { }
            try {
                unsubParticipants();
            }
            catch (_b) { }
            try {
                unsubComments();
            }
            catch (_c) { }
            try {
                unsubReactions();
            }
            catch (_d) { }
            try {
                unsubSharedDocs();
            }
            catch (_e) { }
        };
    }, [autoOpenSharedPdf, isPremiumRoom, meUid, playRoomSoundEffect, roomHostUid, roomId, visible]);
    (0, react_1.useEffect)(function () {
        if (!currentSharedDocId || sharedDocs.length === 0)
            return;
        var currentDoc = sharedDocs.find(function (item) { return item.id === currentSharedDocId; });
        if (!currentDoc)
            return;
        var sourceKind = String(currentDoc.sourceKind || '').toLowerCase();
        if (currentDoc.status !== 'ready' && sourceKind !== 'blank')
            return;
        autoOpenSharedPdf(currentSharedDocId).catch(function () { });
    }, [autoOpenSharedPdf, currentSharedDocId, sharedDocs]);
    (0, react_1.useEffect)(function () {
        if (!isPremiumRoom)
            return;
        if (!currentSharedDocId && !currentSharedDocStage) {
            if (showDocsPanel && docsPanelAutoOpenedRef.current) {
                docsPanelAutoOpenedRef.current = false;
                setShowDocsPanel(false);
            }
            return;
        }
        if (showDocsPanel)
            return;
        if (((currentSharedDocId &&
            (currentSharedDocStage === 'selected' ||
                currentSharedDocStage === 'uploading' ||
                currentSharedDocStage === 'converting' ||
                currentSharedDocStage === 'ready' ||
                currentSharedDocStage === 'error')) ||
            currentSharedDocStage === 'choosing')) {
            docsPanelAutoOpenedRef.current = true;
            setShowDocsPanel(true);
        }
    }, [currentSharedDocId, currentSharedDocStage, isPremiumRoom, showDocsPanel]);
    (0, react_1.useEffect)(function () {
        if (currentSharedDocId)
            return;
        if (!activeDoc)
            return;
        setIsDocMinimized(false);
        setActiveDoc(null);
        setPdfLocalPath(null);
        setPdfPageCount(0);
        setPdfPageIndex(0);
        setPdfPreviewUri(null);
        setPdfPreviewWidth(0);
        setPdfPreviewHeight(0);
        setPdfZoomLevel(1);
        setCurrentSharedDocZoom(1);
        setCurrentSharedDocPanX(0);
        setCurrentSharedDocPanY(0);
        setSharedDocInkPoints([]);
        setCurrentSharedDocSlideShow(false);
        setCurrentPresentationTool(null);
        setSharedDocMarker(null);
        lastAutoOpenedDocIdRef.current = null;
    }, [activeDoc, currentSharedDocId]);
    (0, react_1.useEffect)(function () {
        if (!activeDoc || !pdfLocalPath)
            return;
        if (!currentSharedDocId || activeDoc.id !== currentSharedDocId)
            return;
        if (pdfPageIndex === currentSharedDocPage)
            return;
        setDocBusy(true);
        renderActivePdfPage(pdfLocalPath, currentSharedDocPage, {
            docId: activeDoc.id,
            preferCache: true,
            prefetchAdjacent: true,
            renderSize: getPdfRenderSize(activeDoc.fileSizeBytes),
        })
            .catch(function () { })
            .finally(function () {
            setDocBusy(false);
        });
    }, [
        activeDoc,
        currentSharedDocId,
        currentSharedDocPage,
        pdfLocalPath,
        pdfPageIndex,
        renderActivePdfPage,
        getPdfRenderSize,
    ]);
    (0, react_1.useEffect)(function () {
        if (!activeDoc || activeDoc.id !== currentSharedDocId)
            return;
        if (Math.abs(pdfZoomLevel - currentSharedDocZoom) < 0.01)
            return;
        setPdfZoomLevel(currentSharedDocZoom);
    }, [activeDoc, currentSharedDocId, currentSharedDocZoom, pdfZoomLevel]);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (!activeDoc || activeDoc.id !== currentSharedDocId)
            return;
        var previewWidth = typeof pdfDisplayMetrics.width === 'number' ? pdfDisplayMetrics.width : pdfFrameWidth;
        var previewHeight = typeof pdfDisplayMetrics.height === 'number' ? pdfDisplayMetrics.height : pdfFrameHeight;
        var maxX = Math.max(0, previewWidth - pdfFrameWidth);
        var maxY = Math.max(0, previewHeight - pdfFrameHeight);
        var targetX = maxX * currentSharedDocPanX;
        var targetY = maxY * currentSharedDocPanY;
        try {
            (_a = pdfHorizontalScrollRef.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ x: targetX, animated: false });
            (_b = pdfVerticalScrollRef.current) === null || _b === void 0 ? void 0 : _b.scrollTo({ y: targetY, animated: false });
        }
        catch (_c) { }
    }, [
        activeDoc,
        currentSharedDocId,
        currentSharedDocPanX,
        currentSharedDocPanY,
        pdfDisplayMetrics.height,
        pdfDisplayMetrics.width,
        pdfFrameHeight,
        pdfFrameWidth,
    ]);
    (0, react_1.useEffect)(function () {
        if (!isPremiumRoom)
            return;
        setShowInvitePanel(false);
        setShowReactionPicker(false);
        setShowComments(false);
    }, [isPremiumRoom]);
    (0, react_1.useEffect)(function () {
        if (!sharedDocStatusText || !!activeDoc) {
            docsStatusPulseAnim.stopAnimation();
            docsStatusPulseAnim.setValue(0);
            return;
        }
        var loop = react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.timing(docsStatusPulseAnim, {
                toValue: 1,
                duration: 650,
                useNativeDriver: false,
            }),
            react_native_1.Animated.timing(docsStatusPulseAnim, {
                toValue: 0,
                duration: 650,
                useNativeDriver: false,
            }),
        ]));
        loop.start();
        return function () {
            loop.stop();
            docsStatusPulseAnim.stopAnimation();
            docsStatusPulseAnim.setValue(0);
        };
    }, [activeDoc, docsStatusPulseAnim, sharedDocStatusText]);
    (0, react_1.useEffect)(function () {
        var _a, _b, _c, _d;
        var shouldHideCamera = !!activeDoc || !!localScreenShareActive;
        try {
            (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.muteLocalVideoStream) === null || _b === void 0 ? void 0 : _b.call(_a, shouldHideCamera || cameraOff);
            (_d = (_c = engineRef.current) === null || _c === void 0 ? void 0 : _c.enableLocalVideo) === null || _d === void 0 ? void 0 : _d.call(_c, !(shouldHideCamera || cameraOff));
        }
        catch (_e) { }
    }, [activeDoc, cameraOff, localScreenShareActive]);
    (0, react_1.useEffect)(function () {
        var engine = engineRef.current;
        if (!engine || !joined)
            return;
        applyStrongRtcProfile(engine, { presentationAudioOnly: !!activeDoc });
    }, [
        activeDoc,
        applyStrongRtcProfile,
        joined,
    ]);
    (0, react_1.useEffect)(function () {
        var _a;
        var engine = engineRef.current;
        if (!engine || !joined)
            return;
        try {
            (_a = engine.updateChannelMediaOptions) === null || _a === void 0 ? void 0 : _a.call(engine, {
                publishCameraTrack: !(!!activeDoc || cameraOff || localScreenShareActive),
                publishMicrophoneTrack: !micMuted,
                publishScreenCaptureVideo: !!localScreenShareActive,
                publishScreenCaptureAudio: false,
                publishScreenTrack: !!localScreenShareActive,
                publishSecondaryScreenTrack: false,
                autoSubscribeAudio: true,
                autoSubscribeVideo: true,
            });
        }
        catch (_b) { }
    }, [activeDoc, cameraOff, joined, localScreenShareActive, micMuted]);
    (0, react_1.useEffect)(function () {
        if (react_native_1.Platform.OS !== 'android')
            return;
        if (!visible || !joined || !localScreenShareActive)
            return;
        var subscription = react_native_1.AppState.addEventListener('change', function (nextState) {
            var _a, _b, _c, _d, _e;
            var engine = engineRef.current;
            if (!engine)
                return;
            try {
                (_a = engine.updateChannelMediaOptions) === null || _a === void 0 ? void 0 : _a.call(engine, {
                    publishCameraTrack: false,
                    publishMicrophoneTrack: !micMuted,
                    publishScreenCaptureVideo: true,
                    publishScreenCaptureAudio: false,
                    publishScreenTrack: true,
                    publishSecondaryScreenTrack: false,
                    autoSubscribeAudio: true,
                    autoSubscribeVideo: true,
                });
            }
            catch (_f) { }
            if (nextState === 'active') {
                try {
                    (_b = engine.updateScreenCapture) === null || _b === void 0 ? void 0 : _b.call(engine, {
                        captureAudio: false,
                        captureVideo: true,
                        videoParams: {
                            dimensions: PREMIUM_SCREEN_SHARE_DIMENSIONS,
                            frameRate: PREMIUM_SCREEN_SHARE_FRAME_RATE,
                            bitrate: PREMIUM_SCREEN_SHARE_BITRATE,
                        },
                    });
                }
                catch (_g) { }
                try {
                    (_c = engine.startPreview) === null || _c === void 0 ? void 0 : _c.call(engine, (_e = (_d = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _d === void 0 ? void 0 : _d.VideoSourceScreenPrimary) !== null && _e !== void 0 ? _e : 2);
                }
                catch (_h) { }
                setStatusText('Screen sharing is live');
                void syncScreenShareRoomState(true, myRtcUid || mapRtcUidFromUserId(meUid));
            }
        });
        return function () {
            subscription.remove();
        };
    }, [
        Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType,
        joined,
        localScreenShareActive,
        meUid,
        micMuted,
        myRtcUid,
        syncScreenShareRoomState,
        visible,
    ]);
    (0, react_1.useEffect)(function () {
        if (!roomId || !meUid)
            return;
        updateMyParticipantState({
            muted: !!micMuted,
            cameraOff: !!cameraOff || !!activeDoc || !!localScreenShareActive,
            raisedHand: !!handRaised,
            rtcUid: myRtcUid || 0,
        });
    }, [
        activeDoc,
        cameraOff,
        handRaised,
        localScreenShareActive,
        meUid,
        micMuted,
        myRtcUid,
        roomId,
        updateMyParticipantState,
    ]);
    (0, react_1.useEffect)(function () {
        if (!canControlCurrentSharedDoc || !activeDoc || activeDoc.id !== currentSharedDocId) {
            if (slideshowTimerRef.current) {
                clearInterval(slideshowTimerRef.current);
                slideshowTimerRef.current = null;
            }
            return;
        }
        if (!currentSharedDocSlideShow) {
            if (slideshowTimerRef.current) {
                clearInterval(slideshowTimerRef.current);
                slideshowTimerRef.current = null;
            }
            return;
        }
        if (slideshowTimerRef.current) {
            clearInterval(slideshowTimerRef.current);
        }
        slideshowTimerRef.current = setInterval(function () {
            var nextPage = currentSharedDocPage + 1;
            if (nextPage >= pdfPageCount) {
                pushSharedDocState({ slideShow: false }).catch(function () { });
                return;
            }
            pushSharedDocState({ page: nextPage }).catch(function () { });
        }, Math.max(6, currentSharedDocSlideSeconds) * 1000);
        return function () {
            if (slideshowTimerRef.current) {
                clearInterval(slideshowTimerRef.current);
                slideshowTimerRef.current = null;
            }
        };
    }, [
        activeDoc,
        currentSharedDocId,
        currentSharedDocPage,
        currentSharedDocSlideSeconds,
        currentSharedDocSlideShow,
        canControlCurrentSharedDoc,
        pdfPageCount,
        pushSharedDocState,
    ]);
    var sendComment = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var text, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = commentText.trim();
                    if (!text || !roomId || !meUid)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)().collection("live/".concat(roomId, "/comments")).add({
                            text: text,
                            fromUid: meUid,
                            fromName: meName,
                            fromPhoto: mePhoto,
                            replyToId: (replyTarget === null || replyTarget === void 0 ? void 0 : replyTarget.id) || null,
                            replyToText: (replyTarget === null || replyTarget === void 0 ? void 0 : replyTarget.text) || null,
                            replyToName: (replyTarget === null || replyTarget === void 0 ? void 0 : replyTarget.fromName) || null,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                            createdAtMs: Date.now(),
                        })];
                case 2:
                    _a.sent();
                    setCommentText('');
                    setReplyTarget(null);
                    return [3 /*break*/, 4];
                case 3:
                    error_13 = _a.sent();
                    react_native_1.Alert.alert('Comment failed', String((error_13 === null || error_13 === void 0 ? void 0 : error_13.message) || 'Try again.'));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [commentText, meName, mePhoto, meUid, replyTarget, roomId]);
    var moderateParticipant = (0, react_1.useCallback)(function (participant, action) { return __awaiter(void 0, void 0, void 0, function () {
        var participantRef;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!roomId || !isPremiumHost)
                        return [2 /*return*/];
                    participantRef = (0, firestore_1.default)().doc("live/".concat(roomId, "/participants/").concat(participant.uid));
                    if (!(action === 'purge')) return [3 /*break*/, 2];
                    return [4 /*yield*/, participantRef.set({
                            purged: true,
                            purgedAt: firestore_1.default.FieldValue.serverTimestamp(),
                            purgedByUid: meUid,
                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        }, { merge: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, participantRef.set({
                        muted: action === 'mute',
                        mutedAt: firestore_1.default.FieldValue.serverTimestamp(),
                        mutedByUid: meUid,
                        updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                    }, { merge: true })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [isPremiumHost, meUid, roomId]);
    var restackFloatingComments = (0, react_1.useCallback)(function (items) {
        items.forEach(function (item, index) {
            var stackIndex = items.length - 1 - index;
            react_native_1.Animated.spring(item.stack, {
                toValue: stackIndex,
                damping: 18,
                mass: 0.75,
                stiffness: 180,
                useNativeDriver: true,
            }).start();
        });
    }, []);
    (0, react_1.useEffect)(function () {
        comments.forEach(function (comment) {
            if (seenCommentIdsRef.current.has(comment.id))
                return;
            seenCommentIdsRef.current.add(comment.id);
            var nextItem = {
                id: comment.id,
                text: comment.text,
                fromName: comment.fromName,
                replyToName: comment.replyToName || null,
                replyToText: comment.replyToText || null,
                stack: new react_native_1.Animated.Value(0),
                fade: new react_native_1.Animated.Value(0),
            };
            setFloatingComments(function (prev) {
                var next = __spreadArray(__spreadArray([], prev, true), [nextItem], false).slice(-COMMENT_FLOAT_MAX);
                restackFloatingComments(next);
                return next;
            });
            react_native_1.Animated.sequence([
                react_native_1.Animated.timing(nextItem.fade, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                react_native_1.Animated.delay(COMMENT_FLOAT_LIFETIME_MS),
                react_native_1.Animated.timing(nextItem.fade, {
                    toValue: 0,
                    duration: 260,
                    useNativeDriver: true,
                }),
            ]).start(function () {
                setFloatingComments(function (prev) {
                    var next = prev.filter(function (item) { return item.id !== comment.id; });
                    restackFloatingComments(next);
                    return next;
                });
            });
        });
    }, [comments, restackFloatingComments]);
    var sendReaction = (0, react_1.useCallback)(function (emoji) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!roomId || !meUid)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, firestore_1.default)().collection("live/".concat(roomId, "/reactions")).add({
                            emoji: emoji,
                            fromUid: meUid,
                            fromName: meName,
                            createdAt: firestore_1.default.FieldValue.serverTimestamp(),
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
    }); }, [meName, meUid, roomId]);
    (0, react_1.useEffect)(function () {
        if (!showReactionPicker) {
            if (reactionTrayTimerRef.current) {
                clearTimeout(reactionTrayTimerRef.current);
                reactionTrayTimerRef.current = null;
            }
            return;
        }
        if (reactionTrayTimerRef.current) {
            clearTimeout(reactionTrayTimerRef.current);
        }
        reactionTrayTimerRef.current = setTimeout(function () {
            setShowReactionPicker(false);
            reactionTrayTimerRef.current = null;
        }, 4000);
        return function () {
            if (reactionTrayTimerRef.current) {
                clearTimeout(reactionTrayTimerRef.current);
                reactionTrayTimerRef.current = null;
            }
        };
    }, [showReactionPicker]);
    var searchInviteTargets = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var query, raw, next, lower_1, fallbackSnap, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    query = inviteQuery.trim();
                    if (!query) {
                        setInviteResults([]);
                        return [2 /*return*/];
                    }
                    setInviteLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, searchOceanEntities(query)];
                case 2:
                    raw = _b.sent();
                    next = (raw || [])
                        .filter(function (entry) { return String((entry === null || entry === void 0 ? void 0 : entry.kind) || 'user').toLowerCase() === 'user'; })
                        .map(normalizeSearchResult)
                        .filter(Boolean)
                        .filter(function (entry) { return entry.uid !== meUid; });
                    if (!(next.length === 0)) return [3 /*break*/, 4];
                    lower_1 = query.toLowerCase();
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection('users')
                            .orderBy('lastActiveAt', 'desc')
                            .limit(60)
                            .get()];
                case 3:
                    fallbackSnap = _b.sent();
                    next = ((fallbackSnap === null || fallbackSnap === void 0 ? void 0 : fallbackSnap.docs) || [])
                        .map(function (doc) {
                        var data = doc.data() || {};
                        var haystack = [
                            data.displayName,
                            data.name,
                            data.username,
                            data.userName,
                            doc.id,
                        ]
                            .filter(Boolean)
                            .join(' ')
                            .toLowerCase();
                        if (!haystack.includes(lower_1))
                            return null;
                        return normalizeSearchResult({
                            kind: 'user',
                            id: doc.id,
                            label: data.displayName || data.name || data.username || 'User',
                            extra: {
                                uid: doc.id,
                                displayName: data.displayName || data.name || null,
                                username: data.username || data.userName || null,
                                photoURL: data.userPhoto || data.photoURL || null,
                            },
                        });
                    })
                        .filter(Boolean)
                        .filter(function (entry) { return entry.uid !== meUid; });
                    _b.label = 4;
                case 4:
                    setInviteResults(next);
                    return [3 /*break*/, 7];
                case 5:
                    _a = _b.sent();
                    setInviteResults([]);
                    return [3 /*break*/, 7];
                case 6:
                    setInviteLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [inviteQuery, meUid, searchOceanEntities]);
    var sendInvite = (0, react_1.useCallback)(function (target) { return __awaiter(void 0, void 0, void 0, function () {
        var liveInvitesRef, prunePendingFromMe, payload, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!roomId || !roomChannel || !meUid)
                        return [2 /*return*/];
                    setInviteBusyUid(target.uid);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    liveInvitesRef = (0, firestore_1.default)().collection("users/".concat(target.uid, "/live_invites"));
                    prunePendingFromMe = function (path) { return __awaiter(void 0, void 0, void 0, function () {
                        var snap, matches, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, (0, firestore_1.default)().collection(path).limit(50).get()];
                                case 1:
                                    snap = _b.sent();
                                    matches = ((snap === null || snap === void 0 ? void 0 : snap.docs) || []).filter(function (doc) {
                                        var data = doc.data() || {};
                                        return (String(data.status || 'pending').toLowerCase() === 'pending' &&
                                            String(data.fromUid || '') === meUid);
                                    });
                                    return [4 /*yield*/, Promise.all(matches.map(function (doc) { return doc.ref.delete().catch(function () { }); }))];
                                case 2:
                                    _b.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    _a = _b.sent();
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, prunePendingFromMe("users/".concat(target.uid, "/live_invites"))];
                case 2:
                    _a.sent();
                    payload = {
                        liveId: roomId,
                        liveChannel: roomChannel,
                        liveTitle: roomTitle,
                        fromUid: meUid,
                        fromName: meName,
                        fromPhoto: mePhoto,
                        badgeVariant: 'drift_room',
                        status: 'pending',
                        createdAt: firestore_1.default.FieldValue.serverTimestamp(),
                        createdAtMs: Date.now(),
                        expiresAtMs: Date.now() + LIVE_INVITE_WINDOW_MS,
                    };
                    return [4 /*yield*/, liveInvitesRef.add(payload)];
                case 3:
                    _a.sent();
                    react_native_1.Alert.alert('Invite sent', "".concat(target.name, " will get the drift badge."));
                    return [3 /*break*/, 6];
                case 4:
                    error_14 = _a.sent();
                    react_native_1.Alert.alert('Invite failed', String((error_14 === null || error_14 === void 0 ? void 0 : error_14.message) || 'Try again.'));
                    return [3 /*break*/, 6];
                case 5:
                    setInviteBusyUid(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [meName, mePhoto, meUid, roomChannel, roomId, roomTitle]);
    var renderLocalView = (0, react_1.useCallback)(function (fullScreen) {
        var _a, _b, _c;
        var AVView = Agora === null || Agora === void 0 ? void 0 : Agora.AgoraVideoView;
        var RtcSurfaceView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcSurfaceView;
        var RtcTextureView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcTextureView;
        var RtcLocalView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcLocalView;
        var VideoRenderMode = Agora === null || Agora === void 0 ? void 0 : Agora.VideoRenderMode;
        var VideoSourceType = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType;
        var filledRenderMode = (_b = (_a = VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Hidden) !== null && _a !== void 0 ? _a : VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Fit) !== null && _b !== void 0 ? _b : 1;
        var style = fullScreen ? styles.videoFill : styles.pictureInPictureVideo;
        if (AVView) {
            return (<AVView style={style} showLocalVideo={true} videoSourceType={(VideoSourceType &&
                    ((_c = VideoSourceType.VideoSourceCameraPrimary) !== null && _c !== void 0 ? _c : VideoSourceType.VideoSourceCamera)) ||
                    0} renderMode={filledRenderMode}/>);
        }
        if (RtcSurfaceView) {
            return react_1.default.createElement(RtcSurfaceView, {
                style: style,
                canvas: {
                    uid: 0,
                    renderMode: filledRenderMode,
                },
                zOrderMediaOverlay: true,
            });
        }
        if (RtcTextureView) {
            return react_1.default.createElement(RtcTextureView, {
                style: style,
                canvas: {
                    uid: 0,
                    renderMode: filledRenderMode,
                },
            });
        }
        if (RtcLocalView === null || RtcLocalView === void 0 ? void 0 : RtcLocalView.SurfaceView) {
            return react_1.default.createElement(RtcLocalView.SurfaceView, {
                style: style,
                renderMode: filledRenderMode,
            });
        }
        return (<react_native_1.View style={[style, styles.videoFallback]}>
          <react_native_1.Text style={styles.videoFallbackText}>Starting camera...</react_native_1.Text>
        </react_native_1.View>);
    }, [Agora]);
    var renderRemoteView = (0, react_1.useCallback)(function (uid) {
        var _a, _b, _c;
        var RtcRemoteView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcRemoteView;
        var RtcSurfaceView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcSurfaceView;
        var RtcTextureView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcTextureView;
        var VideoRenderMode = Agora === null || Agora === void 0 ? void 0 : Agora.VideoRenderMode;
        var filledRenderMode = (_b = (_a = VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Hidden) !== null && _a !== void 0 ? _a : VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Fit) !== null && _b !== void 0 ? _b : 1;
        var remoteCanvas = {
            uid: uid,
            channelId: roomChannel || undefined,
            renderMode: filledRenderMode,
            sourceType: (_c = Agora === null || Agora === void 0 ? void 0 : Agora.VideoSourceType) === null || _c === void 0 ? void 0 : _c.VideoSourceRemote,
        };
        if (RtcTextureView) {
            return react_1.default.createElement(RtcTextureView, {
                key: "remote_texture_".concat(uid),
                style: styles.videoFill,
                connection: rtcConnection,
                canvas: remoteCanvas,
            });
        }
        if (RtcSurfaceView) {
            return react_1.default.createElement(RtcSurfaceView, {
                key: "remote_surface_".concat(uid),
                style: styles.videoFill,
                connection: rtcConnection,
                canvas: remoteCanvas,
            });
        }
        if (RtcRemoteView === null || RtcRemoteView === void 0 ? void 0 : RtcRemoteView.SurfaceView) {
            return react_1.default.createElement(RtcRemoteView.SurfaceView, {
                key: "remote_legacy_".concat(uid),
                style: styles.videoFill,
                uid: uid,
                channelId: roomChannel || undefined,
                renderMode: filledRenderMode,
            });
        }
        return (<react_native_1.View style={[styles.videoFill, styles.videoFallback]}>
          <react_native_1.Text style={styles.videoFallbackText}>Connecting remote video...</react_native_1.Text>
        </react_native_1.View>);
    }, [Agora, roomChannel, rtcConnection]);
    var renderLocalScreenShareView = (0, react_1.useCallback)(function () { return (<react_native_1.View style={[styles.videoFill, styles.screenShareHostStage]}>
      <react_native_1.Text style={styles.screenShareHostTitle}>
        {screenShareStarting && !screenShareActive ? 'Starting screen share...' : 'Screen sharing is live'}
      </react_native_1.Text>
      <react_native_1.Text style={styles.screenShareHostMeta}>
        {screenShareStarting && !screenShareActive
            ? 'Grant permission, then open any app or file on your phone.'
            : 'Open any app or file on your phone. Other users will see your screen.'}
      </react_native_1.Text>
    </react_native_1.View>); }, [screenShareActive, screenShareStarting]);
    var renderRemoteScreenShareView = (0, react_1.useCallback)(function (uid) {
        var _a, _b, _c;
        var RtcRemoteView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcRemoteView;
        var RtcSurfaceView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcSurfaceView;
        var RtcTextureView = Agora === null || Agora === void 0 ? void 0 : Agora.RtcTextureView;
        var VideoRenderMode = Agora === null || Agora === void 0 ? void 0 : Agora.VideoRenderMode;
        // Render the sender's active published video stream directly. On Android,
        // this screen-share path replaces the active video stream with the shared screen.
        if (RtcSurfaceView) {
            return react_1.default.createElement(RtcSurfaceView, {
                style: styles.videoFill,
                connection: rtcConnection,
                canvas: {
                    uid: uid,
                    channelId: roomChannel || undefined,
                    renderMode: (_a = VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Fit) !== null && _a !== void 0 ? _a : 2,
                },
            });
        }
        if (RtcTextureView) {
            return react_1.default.createElement(RtcTextureView, {
                style: styles.videoFill,
                connection: rtcConnection,
                canvas: {
                    uid: uid,
                    channelId: roomChannel || undefined,
                    renderMode: (_b = VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Fit) !== null && _b !== void 0 ? _b : 2,
                },
            });
        }
        // v3 fallback - render normally
        if (RtcRemoteView === null || RtcRemoteView === void 0 ? void 0 : RtcRemoteView.SurfaceView) {
            return react_1.default.createElement(RtcRemoteView.SurfaceView, {
                style: styles.videoFill,
                uid: uid,
                channelId: roomChannel || undefined,
                renderMode: (_c = VideoRenderMode === null || VideoRenderMode === void 0 ? void 0 : VideoRenderMode.Fit) !== null && _c !== void 0 ? _c : 2,
            });
        }
        return renderRemoteView(uid);
    }, [Agora, renderRemoteView, roomChannel, rtcConnection]);
    var remoteRenderUids = (0, react_1.useMemo)(function () {
        return Array.from(new Set(remoteUids.filter(function (uid) { return Number.isFinite(uid) && uid > 0 && uid !== myRtcUid; })));
    }, [myRtcUid, remoteUids]);
    var roomHostRtcUid = (0, react_1.useMemo)(function () {
        var _a;
        if (!roomHostUid)
            return 0;
        return Number(((_a = participants.find(function (item) { return item.uid === roomHostUid; })) === null || _a === void 0 ? void 0 : _a.rtcUid) ||
            mapRtcUidFromUserId(roomHostUid) ||
            0);
    }, [participants, roomHostUid]);
    var prioritizedRemoteRenderUids = (0, react_1.useMemo)(function () {
        return __spreadArray([], remoteRenderUids, true).sort(function (a, b) {
            var aIsHost = a === roomHostRtcUid ? 1 : 0;
            var bIsHost = b === roomHostRtcUid ? 1 : 0;
            if (aIsHost !== bIsHost)
                return bIsHost - aIsHost;
            var aSpeakerAt = recentSpeakerAt[a] || 0;
            var bSpeakerAt = recentSpeakerAt[b] || 0;
            if (aSpeakerAt !== bSpeakerAt)
                return bSpeakerAt - aSpeakerAt;
            return a - b;
        });
    }, [recentSpeakerAt, remoteRenderUids, roomHostRtcUid]);
    var visibleRemoteVideoUids = (0, react_1.useMemo)(function () {
        var limit = Math.max(1, MAX_VISIBLE_PREMIUM_GALLERY_TILES - 1);
        var visible = prioritizedRemoteRenderUids.slice(0, limit);
        if (allowPremiumScreenShare &&
            screenShareOwnerRtcUid > 0 &&
            !visible.includes(screenShareOwnerRtcUid)) {
            return __spreadArray(__spreadArray([], visible, true), [screenShareOwnerRtcUid], false);
        }
        return visible;
    }, [allowPremiumScreenShare, prioritizedRemoteRenderUids, screenShareOwnerRtcUid]);
    var premiumGalleryTiles = (0, react_1.useMemo)(function () {
        var remoteTiles = prioritizedRemoteRenderUids.map(function (uid) { return ({ kind: 'remote', uid: uid }); });
        var localTile = { kind: 'local', uid: myRtcUid || 0 };
        return __spreadArray(__spreadArray([], remoteTiles, true), [localTile], false);
    }, [myRtcUid, prioritizedRemoteRenderUids]);
    var screenShareStageVisible = (0, react_1.useMemo)(function () {
        return !!(allowPremiumScreenShare &&
            isPremiumRoom &&
            ((screenShareActive && screenShareRenderRtcUid > 0) ||
                (localScreenShareActive && isCurrentUserScreenSharer)));
    }, [
        allowPremiumScreenShare,
        isCurrentUserScreenSharer,
        isPremiumRoom,
        localScreenShareActive,
        screenShareActive,
        screenShareRenderRtcUid,
    ]);
    var sharedFileStageVisible = (0, react_1.useMemo)(function () {
        return !!(isPremiumRoom &&
            !activeDoc &&
            !screenShareStageVisible &&
            !localScreenShareStageVisible &&
            currentSharedDocStage &&
            (currentSharedDocId || currentSharedDocPreviewTitle || sharedDocStatusText));
    }, [
        activeDoc,
        currentSharedDocId,
        currentSharedDocPreviewTitle,
        currentSharedDocStage,
        isPremiumRoom,
        localScreenShareStageVisible,
        screenShareStageVisible,
        sharedDocStatusText,
    ]);
    var screenShareInsetUid = (0, react_1.useMemo)(function () {
        if (!screenShareStageVisible)
            return 0;
        return prioritizedRemoteRenderUids.find(function (uid) { return uid !== screenShareRenderRtcUid; }) || 0;
    }, [prioritizedRemoteRenderUids, screenShareRenderRtcUid, screenShareStageVisible]);
    var localScreenShareStageVisible = (0, react_1.useMemo)(function () { return !!(allowPremiumScreenShare && isPremiumRoom && (screenShareStarting || localScreenShareActive)); }, [allowPremiumScreenShare, isPremiumRoom, localScreenShareActive, screenShareStarting]);
    var renderPremiumGallery = (0, react_1.useCallback)(function () {
        var visibleTiles = premiumGalleryTiles.slice(0, MAX_VISIBLE_PREMIUM_GALLERY_TILES);
        var hiddenCount = Math.max(0, premiumGalleryTiles.length - visibleTiles.length);
        var tileCount = visibleTiles.length;
        var columns = tileCount <= 1 ? 1 : 2;
        var tileWidth = columns === 1 ? '100%' : '50%';
        var tileHeight = tileCount <= 1 ? '100%' : tileCount === 2 ? '44%' : '36%';
        return (<react_native_1.View style={styles.galleryGrid}>
        {visibleTiles.map(function (tile, index) {
                var _a;
                var isLastVisible = index === visibleTiles.length - 1 && hiddenCount > 0;
                return (<react_native_1.View key={"".concat(tile.kind, "_").concat(tile.uid)} style={[
                        styles.galleryTile,
                        {
                            width: tileWidth,
                            height: tileHeight,
                        },
                    ]}>
                <react_native_1.View style={styles.galleryTileInner}>
                  {tile.kind === 'remote'
                        ? renderRemoteView(tile.uid)
                        : cameraOff
                            ? (<react_native_1.View style={[styles.videoFill, styles.cameraOffStage]}>
                      <react_native_1.Text style={styles.cameraOffText}>Camera off</react_native_1.Text>
                    </react_native_1.View>)
                            : renderLocalView(true)}
                <react_native_1.View style={styles.galleryTileLabelWrap}>
                  <react_native_1.Text style={styles.galleryTileLabel}>
                    {tile.kind === 'remote'
                        ? ((_a = participants.find(function (item) { return Number(item.rtcUid || 0) === tile.uid; })) === null || _a === void 0 ? void 0 : _a.name) || "Guest ".concat(tile.uid)
                        : 'You'}
                  </react_native_1.Text>
                </react_native_1.View>
                {isLastVisible ? (<react_native_1.View style={styles.galleryOverflowBadge}>
                    <react_native_1.Text style={styles.galleryOverflowText}>+{hiddenCount}</react_native_1.Text>
                  </react_native_1.View>) : null}
              </react_native_1.View>
            </react_native_1.View>);
            })}
      </react_native_1.View>);
    }, [cameraOff, participants, premiumGalleryTiles, renderLocalView, renderRemoteView]);
    var renderSharedFileStage = (0, react_1.useCallback)(function () {
        var title = String(currentSharedDocPreviewTitle || (currentSharedDocEntry === null || currentSharedDocEntry === void 0 ? void 0 : currentSharedDocEntry.title) || currentSharedDocFileName || 'Shared file').trim();
        var stage = String(currentSharedDocStage || 'uploading').trim().toLowerCase();
        var detail = sharedDocStatusText ||
            (stage === 'choosing'
                ? 'Choosing file...'
                : stage === 'selected'
                    ? 'Preparing upload...'
                    : stage === 'uploading'
                        ? 'Uploading to everyone now...'
                        : stage === 'converting'
                            ? 'Converting to PDF for all devices...'
                            : stage === 'error'
                                ? 'File share failed.'
                                : 'Opening shared file...');
        var badgeText = stage === 'error'
            ? 'Share failed'
            : stage === 'ready'
                ? 'Opening file'
                : 'File sharing live';
        return (<react_native_1.View style={[styles.videoFill, styles.sharedFileStage]}>
        <react_native_1.View style={styles.sharedFileStageBadge}>
          <react_native_1.Text style={styles.sharedFileStageBadgeText}>{badgeText}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.Text style={styles.sharedFileStageTitle} numberOfLines={2}>
          {title || 'Shared file'}
        </react_native_1.Text>
        <react_native_1.Text style={styles.sharedFileStageMeta} numberOfLines={2}>
          {detail}
        </react_native_1.Text>
      </react_native_1.View>);
    }, [
        currentSharedDocEntry === null || currentSharedDocEntry === void 0 ? void 0 : currentSharedDocEntry.title,
        currentSharedDocFileName,
        currentSharedDocPreviewTitle,
        currentSharedDocStage,
        sharedDocStatusText,
    ]);
    (0, react_1.useEffect)(function () {
        if (!roomId || !joined)
            return;
        var participantRemoteUids = participants
            .map(function (item) { return Number(item.rtcUid || 0); })
            .filter(function (uid) { return Number.isFinite(uid) && uid > 0 && uid !== myRtcUid; });
        if (!participantRemoteUids.length)
            return;
        setRemoteUids(function (prev) { return Array.from(new Set(__spreadArray(__spreadArray([], participantRemoteUids, true), prev, true))); });
    }, [joined, myRtcUid, participants, roomId]);
    (0, react_1.useEffect)(function () {
        var engine = engineRef.current;
        if (!engine || !joined || remoteRenderUids.length === 0)
            return;
        var visibleSet = new Set(visibleRemoteVideoUids);
        remoteRenderUids.forEach(function (uid) {
            var _a, _b, _c, _d, _e, _f;
            try {
                (_a = engine.muteRemoteAudioStream) === null || _a === void 0 ? void 0 : _a.call(engine, uid, false);
                (_b = engine === null || engine === void 0 ? void 0 : engine.subscribeRemoteAudioStream) === null || _b === void 0 ? void 0 : _b.call(engine, uid, true);
                if (visibleSet.has(uid)) {
                    (_c = engine.muteRemoteVideoStream) === null || _c === void 0 ? void 0 : _c.call(engine, uid, false);
                    (_d = engine === null || engine === void 0 ? void 0 : engine.subscribeRemoteVideoStream) === null || _d === void 0 ? void 0 : _d.call(engine, uid, true);
                    (_e = engine.setRemoteVideoStreamType) === null || _e === void 0 ? void 0 : _e.call(engine, uid, 0);
                }
                else {
                    (_f = engine.muteRemoteVideoStream) === null || _f === void 0 ? void 0 : _f.call(engine, uid, true);
                }
            }
            catch (_g) { }
        });
    }, [joined, remoteRenderUids, visibleRemoteVideoUids]);
    (0, react_1.useEffect)(function () {
        if (!localScreenShareActive)
            return;
        if (screenShareActive && screenShareOwnerUid === meUid)
            return;
        void stopScreenShare({ syncRoom: false });
    }, [localScreenShareActive, meUid, screenShareActive, screenShareOwnerUid, stopScreenShare]);
    // When remote screen share activates, force-subscribe to that user's video stream
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        if (!screenShareActive || !screenShareOwnerRtcUid || screenShareOwnerUid === meUid)
            return;
        var engine = engineRef.current;
        if (!engine)
            return;
        try {
            (_a = engine.muteRemoteVideoStream) === null || _a === void 0 ? void 0 : _a.call(engine, screenShareOwnerRtcUid, false);
            (_b = engine === null || engine === void 0 ? void 0 : engine.subscribeRemoteVideoStream) === null || _b === void 0 ? void 0 : _b.call(engine, screenShareOwnerRtcUid, true);
            (_c = engine.setRemoteVideoStreamType) === null || _c === void 0 ? void 0 : _c.call(engine, screenShareOwnerRtcUid, 0);
        }
        catch (_d) { }
    }, [meUid, screenShareActive, screenShareOwnerRtcUid, screenShareOwnerUid]);
    (0, react_1.useEffect)(function () {
        if (!roomId || !screenShareActive || !screenShareOwnerUid)
            return;
        if (screenShareOwnerUid === meUid)
            return;
        var ownerStillPresent = participants.some(function (item) { return item.uid === screenShareOwnerUid; });
        if (ownerStillPresent)
            return;
        void (0, firestore_1.default)()
            .collection('live')
            .doc(roomId)
            .set({
            currentScreenShareActive: false,
            currentScreenShareOwnerUid: firestore_1.default.FieldValue.delete(),
            currentScreenShareOwnerName: firestore_1.default.FieldValue.delete(),
            currentScreenShareOwnerRtcUid: firestore_1.default.FieldValue.delete(),
            currentScreenShareStartedAt: firestore_1.default.FieldValue.delete(),
            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
        }, { merge: true })
            .catch(function () { });
    }, [meUid, participants, roomId, screenShareActive, screenShareOwnerUid]);
    (0, react_1.useEffect)(function () {
        if (!roomId || !screenShareActive)
            return;
        if (screenShareOwnerUid)
            return;
        void (0, firestore_1.default)()
            .collection('live')
            .doc(roomId)
            .set({
            currentScreenShareActive: false,
            currentScreenShareOwnerUid: firestore_1.default.FieldValue.delete(),
            currentScreenShareOwnerName: firestore_1.default.FieldValue.delete(),
            currentScreenShareOwnerRtcUid: firestore_1.default.FieldValue.delete(),
            currentScreenShareStartedAt: firestore_1.default.FieldValue.delete(),
            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
        }, { merge: true })
            .catch(function () { });
    }, [roomId, screenShareActive, screenShareOwnerUid]);
    (0, react_1.useEffect)(function () {
        if (joined)
            return;
        if (!roomId || !roomChannel || !myRtcUid)
            return;
        if (remoteRenderUids.length === 0)
            return;
        setJoined(true);
        setStatusText('Live');
    }, [joined, myRtcUid, remoteRenderUids.length, roomChannel, roomId]);
    var handleClose = (0, react_1.useCallback)(function () {
        onClose();
    }, [onClose]);
    if (!visible)
        return null;
    return (<react_native_1.Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <react_native_1.View style={styles.root}>
        {roomId ? (<>
            <react_native_1.View style={styles.videoStage}>
              {screenShareStageVisible || localScreenShareStageVisible ? (isCurrentUserScreenSharer || localScreenShareStageVisible
                ? renderLocalScreenShareView()
                : renderRemoteScreenShareView(screenShareRenderRtcUid)) : sharedFileStageVisible ? (renderSharedFileStage()) : !activeDoc && premiumGalleryTiles.length > 1 ? (renderPremiumGallery()) : prioritizedRemoteRenderUids.length > 0 ? (renderRemoteView(prioritizedRemoteRenderUids[0])) : cameraOff ? (<react_native_1.View style={[styles.videoFill, styles.cameraOffStage]}>
                  <react_native_1.Text style={styles.cameraOffText}>Camera off</react_native_1.Text>
                </react_native_1.View>) : (renderLocalView(true))}
              {screenShareStageVisible || localScreenShareStageVisible ? (<react_native_1.View style={[
                    styles.pictureInPicture,
                    {
                        right: insets.right + 4,
                        bottom: insets.bottom + 316,
                    },
                ]}>
                  {screenShareInsetUid > 0
                    ? renderRemoteView(screenShareInsetUid)
                    : cameraOff
                        ? (<react_native_1.View style={[styles.pictureInPictureVideo, styles.cameraOffStage]}>
                        <react_native_1.Text style={styles.cameraOffText}>Camera off</react_native_1.Text>
                      </react_native_1.View>)
                        : isCurrentUserScreenSharer || localScreenShareStageVisible
                            ? (<react_native_1.View style={[styles.pictureInPictureVideo, styles.screenShareInsetStage]}>
                        <react_native_1.Text style={styles.screenShareInsetText}>Live</react_native_1.Text>
                      </react_native_1.View>)
                            : renderLocalView(false)}
                </react_native_1.View>) : sharedFileStageVisible ? null : prioritizedRemoteRenderUids.length > 0 && !(!activeDoc && premiumGalleryTiles.length > 1) ? (<react_native_1.View style={[
                    styles.pictureInPicture,
                    {
                        right: insets.right + 4,
                        bottom: insets.bottom + 316,
                    },
                ]}>
                  {cameraOff ? (<react_native_1.View style={[styles.pictureInPictureVideo, styles.cameraOffStage]}>
                      <react_native_1.Text style={styles.cameraOffText}>Camera off</react_native_1.Text>
                    </react_native_1.View>) : (renderLocalView(false))}
                </react_native_1.View>) : null}
              <react_native_1.View style={[
                styles.topBar,
                {
                    paddingTop: insets.top + 10,
                    paddingLeft: insets.left + 12,
                    paddingRight: insets.right + 12,
                },
            ]}>
                <react_native_1.View style={styles.topBarTitleWrap}>
                  <react_native_1.Text numberOfLines={1} ellipsizeMode="tail" style={[
                styles.roomTitle,
                isPremiumRoom ? styles.premiumRoomTitle : styles.driftRoomTitle,
            ]}>
                    {roomTitle}
                  </react_native_1.Text>
                </react_native_1.View>
                <react_native_1.View style={styles.topBarCenter}>
                  {isPremiumRoom ? (<react_native_1.View style={styles.premiumCountdownPill}>
                      <react_native_1.Text numberOfLines={1} ellipsizeMode="tail" style={styles.premiumCountdownText}>
                        {screenShareStageVisible
                    || localScreenShareStageVisible
                    ? 'Screen sharing live'
                    : premiumCountdownLabel || 'Premium stream active'}
                      </react_native_1.Text>
                    </react_native_1.View>) : null}
                </react_native_1.View>
                <react_native_1.View style={styles.topBarActions}>
                  {activeDoc && isDocMinimized ? (<react_native_1.Pressable onPress={function () { return setIsDocMinimized(false); }} style={styles.topIconChip}>
                      <react_native_1.Text style={styles.topIconChipText}>+</react_native_1.Text>
                    </react_native_1.Pressable>) : null}
                  <react_native_1.Pressable onPress={handleClose} style={styles.closeChip}>
                    <react_native_1.Text style={styles.closeChipText}>x</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </react_native_1.View>
              <react_native_1.View style={[styles.stageBrandChip, { left: insets.left + 12, top: insets.top + 54 }]}>
                <react_native_1.Text style={styles.stageBrandChipText}>MoMo</react_native_1.Text>
              </react_native_1.View>
              {networkWarning ? (<react_native_1.View style={[
                    styles.networkWarningBanner,
                    {
                        top: insets.top + 88,
                        left: insets.left + 12,
                        right: insets.right + 12,
                    },
                ]}>
                  <react_native_1.Text style={styles.networkWarningText}>{networkWarning}</react_native_1.Text>
                </react_native_1.View>) : null}
              {activeDoc && isDocMinimized ? (<react_native_1.Pressable style={[styles.maximizeDocChip, { left: insets.left + 14, bottom: insets.bottom + 92 }]} onPress={function () { return setIsDocMinimized(false); }}>
                  <react_native_1.Text style={styles.maximizeDocChipText}>Maximize File</react_native_1.Text>
                </react_native_1.Pressable>) : null}
              <react_native_1.View style={[styles.rightRail, { right: insets.right + 8, bottom: insets.bottom + 78 }]}>
                {!isPremiumRoom ? <react_native_1.Pressable style={styles.railButton} onPress={function () { return setShowInvitePanel(true); }}>
                  <react_native_1.Text style={styles.railIcon}>Invite</react_native_1.Text>
                </react_native_1.Pressable> : <react_native_1.Pressable style={styles.railButton} onPress={function () { return setShowComments(function (v) { return !v; }); }}>
                  <react_native_1.Text style={styles.railIcon}>{"Chat (".concat(comments.length, ")")}</react_native_1.Text>
                </react_native_1.Pressable>}
                {!isPremiumRoom ? <react_native_1.Pressable style={styles.railButton} onPress={function () { return setShowReactionPicker(function (v) { return !v; }); }}>
                  <react_native_1.Text style={styles.railIcon}>React</react_native_1.Text>
                  <react_native_1.Text style={styles.railEmojiLine}>💙 🫶 ❤️ ✨ 🤗</react_native_1.Text>
                </react_native_1.Pressable> : null}
                <react_native_1.Pressable style={styles.railButton} onPress={function () { return setShowAudiencePanel(function (v) { return !v; }); }}>
                  <react_native_1.Text style={styles.railIcon}>👥 ({participants.length})</react_native_1.Text>
                </react_native_1.Pressable>
                {isPremiumRoom ? (<react_native_1.Pressable style={styles.railButton} onPress={function () { return void toggleRaisedHand(); }}>
                    <react_native_1.Text style={styles.railIcon}>{handRaised ? 'Lower Hand' : 'Raise Hand'}</react_native_1.Text>
                  </react_native_1.Pressable>) : null}
                <react_native_1.Pressable style={styles.railButton} onPress={function () {
                var _a, _b;
                var next = !micMuted;
                setMicMuted(next);
                try {
                    (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.muteLocalAudioStream) === null || _b === void 0 ? void 0 : _b.call(_a, next);
                }
                catch (_c) { }
            }}>
                  <react_native_1.Text style={styles.railIcon}>{micMuted ? 'Join Audio' : 'Mute Audio'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.railButton} onPress={function () {
                var _a, _b, _c, _d;
                var next = !cameraOff;
                setCameraOff(next);
                try {
                    (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.muteLocalVideoStream) === null || _b === void 0 ? void 0 : _b.call(_a, next);
                    (_d = (_c = engineRef.current) === null || _c === void 0 ? void 0 : _c.enableLocalVideo) === null || _d === void 0 ? void 0 : _d.call(_c, !next);
                }
                catch (_e) { }
            }}>
                  <react_native_1.Text style={styles.railIcon}>{cameraOff ? 'Start Video' : 'Stop Video'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={styles.railButton} onPress={function () {
                var _a, _b;
                try {
                    (_b = (_a = engineRef.current) === null || _a === void 0 ? void 0 : _a.switchCamera) === null || _b === void 0 ? void 0 : _b.call(_a);
                }
                catch (_c) { }
            }}>
                  <react_native_1.Text style={styles.railIcon}>Flip</react_native_1.Text>
                </react_native_1.Pressable>
                {!isPremiumRoom ? <react_native_1.Pressable style={styles.railButton} onPress={openSoundBoard}>
                  <react_native_1.Text style={styles.railIcon}>Sounds</react_native_1.Text>
                </react_native_1.Pressable> : null}
                {isPremiumRoom ? (<react_native_1.Pressable style={styles.railButton} onPress={function () {
                    docsPanelAutoOpenedRef.current = false;
                    setShowDocsPanel(true);
                }}>
                    <react_native_1.Text style={styles.railIcon}>Share Files</react_native_1.Text>
                  </react_native_1.Pressable>) : null}
                {null}
              </react_native_1.View>
              {soundBadgeLabel && !isPremiumRoom ? (<react_native_1.View style={styles.soundBadge}>
                  <react_native_1.Text style={styles.soundBadgeText}>{soundBadgeLabel}</react_native_1.Text>
                </react_native_1.View>) : null}
              {isPremiumRoom && raisedHandParticipants.length > 0 ? (<react_native_1.View style={styles.meetingStatusOverlay}>
                  {raisedHandParticipants.length > 0 ? (<react_native_1.Text style={styles.meetingStatusText}>
                      {raisedHandParticipants.length} hand{raisedHandParticipants.length === 1 ? '' : 's'} raised
                    </react_native_1.Text>) : null}
                </react_native_1.View>) : null}
              {showAudiencePanel ? (<react_native_1.View style={[styles.audiencePanel, { top: insets.top + 132, right: insets.right + 14 }]}>
                  <react_native_1.Text style={styles.audiencePanelTitle}>In The Room</react_native_1.Text>
                  {premiumStatusLine ? (<react_native_1.Text style={styles.audiencePanelMeta}>{premiumStatusLine}</react_native_1.Text>) : null}
                  <react_native_1.ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                    {audienceRows.map(function (item) { return (<react_native_1.Pressable key={item.uid} style={styles.audienceRow} disabled={!isPremiumHost || item.uid === meUid || item.label === 'Host'} onPress={function () {
                        if (!isPremiumHost)
                            return;
                        var participant = participants.find(function (row) { return row.uid === item.uid; });
                        if (!participant || participant.uid === meUid || participant.isHost)
                            return;
                        react_native_1.Alert.alert('Participant controls', item.label, __spreadArray(__spreadArray([
                            {
                                text: participant.muted ? 'Unmute' : 'Mute',
                                onPress: function () {
                                    void moderateParticipant(participant, participant.muted ? 'unmute' : 'mute');
                                },
                            }
                        ], (participant.raisedHand
                            ? [
                                {
                                    text: 'Lower Hand',
                                    onPress: function () {
                                        void (0, firestore_1.default)()
                                            .doc("live/".concat(roomId, "/participants/").concat(participant.uid))
                                            .set({
                                            raisedHand: false,
                                            updatedAt: firestore_1.default.FieldValue.serverTimestamp(),
                                        }, { merge: true });
                                    },
                                },
                            ]
                            : []), true), [
                            {
                                text: 'Purge',
                                style: 'destructive',
                                onPress: function () {
                                    void moderateParticipant(participant, 'purge');
                                },
                            },
                            { text: 'Cancel', style: 'cancel' },
                        ], false));
                    }}>
                        <react_native_1.Text style={styles.audienceRowText}>{item.label}</react_native_1.Text>
                      </react_native_1.Pressable>); })}
                  </react_native_1.ScrollView>
                  {raisedHandParticipants.length > 0 ? (<react_native_1.View style={styles.raisedHandsWrap}>
                      <react_native_1.Text style={styles.raisedHandsTitle}>Raised Hands</react_native_1.Text>
                      {raisedHandParticipants.slice(0, 4).map(function (item) { return (<react_native_1.Text key={item.uid} style={styles.raisedHandsText}>
                          {item.name || 'Guest'} wants to speak
                        </react_native_1.Text>); })}
                    </react_native_1.View>) : null}
                </react_native_1.View>) : null}
              {showComments && isPremiumRoom ? (<react_native_1.View style={[
                    styles.premiumCommentPanel,
                    {
                        left: insets.left + 12,
                        right: insets.right + 96,
                        bottom: insets.bottom + 92,
                    },
                ]}>
                  <react_native_1.View style={styles.premiumCommentHeader}>
                    <react_native_1.Text style={styles.premiumCommentTitle}>Chat</react_native_1.Text>
                    <react_native_1.Pressable onPress={function () { return setShowComments(false); }}>
                      <react_native_1.Text style={styles.premiumCommentClose}>Hide</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>
                  <react_native_1.ScrollView style={styles.premiumCommentScroll} contentContainerStyle={styles.premiumCommentScrollContent} showsVerticalScrollIndicator={false}>
                    {premiumChatRows.length === 0 ? (<react_native_1.Text style={styles.premiumCommentEmpty}>No messages yet.</react_native_1.Text>) : (premiumChatRows.map(function (item) { return (<react_native_1.Pressable key={item.id} style={styles.premiumCommentBubble} onPress={function () { return setReplyTarget(item); }}>
                          <react_native_1.Text style={styles.premiumCommentAuthor}>{item.fromName}</react_native_1.Text>
                          {item.replyToName || item.replyToText ? (<react_native_1.Text style={styles.premiumCommentReply} numberOfLines={1}>
                              Reply to {item.replyToName || 'message'}: {item.replyToText || ''}
                            </react_native_1.Text>) : null}
                          <react_native_1.Text style={styles.premiumCommentText}>{item.text}</react_native_1.Text>
                        </react_native_1.Pressable>); }))}
                  </react_native_1.ScrollView>
                </react_native_1.View>) : null}
              {showDocsPanel && isPremiumRoom ? (<react_native_1.View style={[styles.docsPanel, { top: insets.top + 114, left: insets.left + 6 }]}>
                  <react_native_1.View style={styles.docsPanelHeader}>
                    <react_native_1.Pressable onPress={function () {
                    docsPanelAutoOpenedRef.current = false;
                    setShowDocsPanel(false);
                }} hitSlop={10}>
                      <react_native_1.Text style={styles.docsPanelClose}>x</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>
                  {!activeDoc ? (<>
                      <react_native_1.Animated.View style={[
                        styles.docsShareButtonWrap,
                        {
                            borderColor: docsStatusPulseAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['rgba(255,255,255,0.14)', '#FFD7D7'],
                            }),
                        },
                    ]}>
                        <react_native_1.Pressable style={styles.docsShareButton} onPress={function () { return void handleShareFile(); }}>
                          <react_native_1.Text numberOfLines={1} style={styles.docsShareButtonText}>{docBusy ? 'Sharing...' : 'Share File'}</react_native_1.Text>
                        </react_native_1.Pressable>
                      </react_native_1.Animated.View>
                      <react_native_1.Pressable style={[styles.docsShareButton, { marginTop: 8, backgroundColor: '#2563EB' }]} onPress={function () { return void handleShareBlankDoc(); }}>
                        <react_native_1.Text numberOfLines={1} style={styles.docsShareButtonText}>Share Blank PDF</react_native_1.Text>
                      </react_native_1.Pressable>
                      {currentSharedDocId ? (<react_native_1.Pressable style={[styles.docsShareButton, { marginTop: 8, backgroundColor: '#8D0000' }]} onPress={function () {
                            return void clearCurrentSharedDocSession({
                                keepPanelOpen: true,
                                deleteCurrentDoc: true,
                            });
                        }}>
                          <react_native_1.Text numberOfLines={1} style={styles.docsShareButtonText}>
                            {currentSharedDocStage === 'uploading' || currentSharedDocStage === 'selected'
                            ? 'Stop Current Upload'
                            : currentSharedDocStage === 'error'
                                ? 'Clear Failed Share'
                                : 'Close Shared File'}
                          </react_native_1.Text>
                        </react_native_1.Pressable>) : null}
                      {sharedDocProgressCard ? (<react_native_1.View style={styles.docsProgressCard}>
                          <react_native_1.Text style={styles.docsProgressTitle} numberOfLines={1}>
                            {sharedDocProgressCard.title}
                          </react_native_1.Text>
                          <react_native_1.Text style={styles.docsProgressMeta} numberOfLines={2}>
                            {sharedDocProgressCard.detail}
                          </react_native_1.Text>
                        </react_native_1.View>) : null}
                      {currentSharedDocEntry ? (<react_native_1.View style={styles.docsProgressCard}>
                          <react_native_1.Text style={styles.docsProgressTitle} numberOfLines={1}>
                            {currentSharedDocEntry.title}
                          </react_native_1.Text>
                          <react_native_1.Text style={styles.docsProgressMeta} numberOfLines={2}>
                            {currentSharedDocEntry.status === 'uploading'
                            ? 'Uploading now...'
                            : currentSharedDocEntry.status === 'converting'
                                ? 'Preparing PDF...'
                                : currentSharedDocEntry.status === 'error'
                                    ? currentSharedDocEntry.errorMessage || 'Share failed'
                                    : 'Current shared file'}
                          </react_native_1.Text>
                        </react_native_1.View>) : null}
                    </>) : null}
                  <react_native_1.ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                    {visibleSharedDocs.length === 0 ? (<react_native_1.Text style={styles.docsEmptyText}>Ready to share a file.</react_native_1.Text>) : (visibleSharedDocs.map(function (doc) { return (<react_native_1.Pressable key={doc.id} style={styles.docsRow} onPress={function () {
                        if (doc.status === 'ready') {
                            void openSharedPdf(doc);
                        }
                    }} disabled={docBusy || doc.status !== 'ready'}>
                          <react_native_1.Text style={styles.docsRowTitle} numberOfLines={1}>{doc.title}</react_native_1.Text>
                          <react_native_1.Text style={styles.docsRowMeta} numberOfLines={1}>
                            {doc.status === 'uploading'
                        ? "Uploading ".concat(String(doc.sourceKind || '').toUpperCase(), "...")
                        : doc.status === 'converting'
                            ? "Converting ".concat(String(doc.sourceKind || '').toUpperCase(), "...")
                            : doc.status === 'error'
                                ? doc.errorMessage || 'Conversion failed'
                                : "".concat(doc.sharedByName, " \u00B7 ").concat(formatTimestamp(doc.createdAtMs))}
                          </react_native_1.Text>
                        </react_native_1.Pressable>); }))}
                  </react_native_1.ScrollView>
                </react_native_1.View>) : null}
              {showReactionPicker && !isPremiumRoom ? (<react_native_1.View style={styles.reactionTray}>
                  {REACTION_EMOJIS.map(function (emoji) { return (<react_native_1.Pressable key={"react-".concat(emoji)} style={styles.reactionChip} onPress={function () { return sendReaction(emoji); }}>
                      <react_native_1.Text style={styles.reactionChipText}>{emoji}</react_native_1.Text>
                    </react_native_1.Pressable>); })}
                </react_native_1.View>) : null}
              {showComments && !isPremiumRoom ? (<react_native_1.View pointerEvents="box-none" style={styles.commentLane}>
                  <react_native_1.View style={styles.commentGuide}/>
                  {floatingComments.map(function (comment) { return (<react_native_1.Animated.View key={comment.id} style={[
                        styles.floatingCommentWrap,
                        {
                            bottom: 148,
                            opacity: comment.fade,
                            transform: [
                                {
                                    translateY: react_native_1.Animated.multiply(comment.stack, -COMMENT_STACK_GAP),
                                },
                            ],
                        },
                    ]}>
                      <react_native_1.Pressable style={styles.floatingCommentBubble} onPress={function () {
                        var full = comments.find(function (item) { return item.id === comment.id; });
                        if (full)
                            setReplyTarget(full);
                    }}>
                        <react_native_1.Text style={styles.floatingCommentAuthor}>{comment.fromName}</react_native_1.Text>
                        {comment.replyToName || comment.replyToText ? (<react_native_1.Text style={styles.floatingReplyText} numberOfLines={1}>
                            Reply to {comment.replyToName || 'comment'}: {comment.replyToText || ''}
                          </react_native_1.Text>) : null}
                        <react_native_1.Text style={styles.floatingCommentText} numberOfLines={3}>
                          {comment.text}
                        </react_native_1.Text>
                      </react_native_1.Pressable>
                    </react_native_1.Animated.View>); })}
                </react_native_1.View>) : null}
              {!isPremiumRoom ? floatingReactions.map(function (item) { return (<react_native_1.Animated.Text key={item.id} style={[
                    styles.floatingReaction,
                    {
                        left: '50%',
                        marginLeft: -18,
                        bottom: SCREEN_HEIGHT * 0.26,
                        opacity: item.anim.interpolate({
                            inputRange: [0, 0.08, 0.9, 1],
                            outputRange: [0, 1, 1, 0],
                        }),
                        transform: [
                            {
                                translateX: item.anim.interpolate({
                                    inputRange: [0, 0.25, 1],
                                    outputRange: [0, item.xOffset * 0.35, item.xOffset],
                                }),
                            },
                            {
                                translateY: item.anim.interpolate({
                                    inputRange: [0, 0.22, 1],
                                    outputRange: [0, -18, -(SCREEN_HEIGHT * 0.78)],
                                }),
                            },
                            {
                                scale: item.anim.interpolate({
                                    inputRange: [0, 0.2, 1],
                                    outputRange: [0.7, 1.08, 0.92],
                                }),
                            },
                            {
                                rotate: item.anim.interpolate({
                                    inputRange: [0, 0.5, 1],
                                    outputRange: ['-10deg', '6deg', '-4deg'],
                                }),
                            },
                        ],
                    },
                ]}>
                  {item.emoji}
                </react_native_1.Animated.Text>); }) : null}
              {!joined ? (<react_native_1.View style={styles.roomJoiningOverlay}>
                  <react_native_1.ActivityIndicator color="#10c9ff"/>
                </react_native_1.View>) : null}
              <react_native_1.View style={[styles.bottomComposer, { paddingBottom: insets.bottom + 14 }]}>
                {replyTarget ? (<react_native_1.View style={styles.replyPill}>
                    <react_native_1.Text style={styles.replyPillText} numberOfLines={1}>
                      Replying to {replyTarget.fromName}: {replyTarget.text}
                    </react_native_1.Text>
                    <react_native_1.Pressable onPress={function () { return setReplyTarget(null); }}>
                      <react_native_1.Text style={styles.replyPillDismiss}>x</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>) : null}
                <react_native_1.KeyboardAvoidingView behavior={react_native_1.Platform.OS === 'ios' ? 'padding' : undefined}>
                  <react_native_1.View style={styles.composerRow}>
                    <react_native_1.TextInput value={commentText} onChangeText={setCommentText} placeholder={isPremiumRoom ? 'Message the room' : 'Say something to the room'} placeholderTextColor="rgba(255,255,255,0.55)" style={styles.commentInput}/>
                    <react_native_1.Pressable style={styles.sendButton} onPress={sendComment}>
                      <react_native_1.Text numberOfLines={1} style={styles.sendButtonText}>Send</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>
                </react_native_1.KeyboardAvoidingView>
              </react_native_1.View>
            </react_native_1.View>
            {!isPremiumRoom ? (<react_native_1.Modal visible={showInvitePanel} transparent animationType="fade" onRequestClose={function () { return setShowInvitePanel(false); }}>
              <react_native_1.View style={styles.inviteBackdrop}>
                <react_native_1.View style={[styles.invitePanel, { paddingBottom: insets.bottom + 18 }]}>
                  <react_native_1.Text style={styles.inviteTitle}>Invite to this Drift Expo</react_native_1.Text>
                  <react_native_1.View style={styles.inviteSearchRow}>
                    <react_native_1.TextInput value={inviteQuery} onChangeText={setInviteQuery} placeholder="Search a user" placeholderTextColor="#7b8a9e" style={styles.inviteInput}/>
                    <react_native_1.Pressable style={styles.inviteSearchButton} onPress={searchInviteTargets}>
                      <react_native_1.Text numberOfLines={1} style={styles.inviteSearchButtonText}>Find</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>
                  {onlineInvitees.length > 0 ? (<react_native_1.View style={styles.onlineSection}>
                      <react_native_1.Text style={styles.onlineSectionTitle}>Online now</react_native_1.Text>
                      <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <react_native_1.View style={styles.onlineInviteRow}>
                          {onlineInvitees.map(function (item) { return (<react_native_1.Pressable key={"online-".concat(item.uid)} style={styles.onlineInviteChip} onPress={function () { return sendInvite(item); }} disabled={inviteBusyUid === item.uid}>
                              {item.photo ? (<react_native_1.Image source={{ uri: item.photo }} style={styles.onlineInviteAvatar}/>) : (<react_native_1.View style={[styles.onlineInviteAvatar, styles.commentAvatarFallback]}>
                                  <react_native_1.Text style={styles.commentAvatarFallbackText}>
                                    {item.name.charAt(0).toUpperCase()}
                                  </react_native_1.Text>
                                </react_native_1.View>)}
                              <react_native_1.Text style={styles.onlineInviteName} numberOfLines={1}>
                                {item.name}
                              </react_native_1.Text>
                              <react_native_1.Text style={styles.onlineInviteHandle} numberOfLines={1}>
                                {inviteBusyUid === item.uid ? '...' : item.secondary || 'Invite'}
                              </react_native_1.Text>
                            </react_native_1.Pressable>); })}
                        </react_native_1.View>
                      </react_native_1.ScrollView>
                    </react_native_1.View>) : null}
                  {inviteLoading ? <react_native_1.ActivityIndicator color="#10c9ff" style={{ marginVertical: 12 }}/> : null}
                  <react_native_1.ScrollView style={{ maxHeight: 320 }}>
                    {inviteResults.map(function (item) { return (<react_native_1.View key={item.uid} style={styles.inviteRow}>
                        <react_native_1.View style={{ flex: 1 }}>
                          <react_native_1.Text style={styles.inviteResultName}>{item.name}</react_native_1.Text>
                          <react_native_1.Text style={styles.inviteResultUid}>
                            {item.secondary || item.uid}
                          </react_native_1.Text>
                        </react_native_1.View>
                        <react_native_1.Pressable style={styles.inviteResultButton} disabled={inviteBusyUid === item.uid} onPress={function () { return sendInvite(item); }}>
                          <react_native_1.Text numberOfLines={1} style={styles.inviteResultButtonText}>
                            {inviteBusyUid === item.uid ? '...' : 'Invite'}
                          </react_native_1.Text>
                        </react_native_1.Pressable>
                      </react_native_1.View>); })}
                  </react_native_1.ScrollView>
                  <react_native_1.Pressable style={styles.inviteCloseButton} onPress={function () { return setShowInvitePanel(false); }}>
                    <react_native_1.Text numberOfLines={1} style={styles.inviteCloseButtonText}>Close</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </react_native_1.View>
            </react_native_1.Modal>) : null}
          </>) : (<react_native_1.View style={[styles.lobby, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}>
            <react_native_1.View style={{
                width: '100%',
                minHeight: 220,
                borderRadius: 28,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
                backgroundColor: 'rgba(8,18,32,0.72)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 22,
                overflow: 'hidden',
            }}>
              <react_native_1.Text style={{ fontSize: 58, letterSpacing: 6 }}>🧑🏾‍💼 👩🏽‍💼 👨🏿‍💼</react_native_1.Text>
              <react_native_1.Text style={{ fontSize: 52, marginTop: 10, letterSpacing: 8 }}>💬 🎥 💬</react_native_1.Text>
              <react_native_1.Text style={{ fontSize: 58, marginTop: 10, letterSpacing: 6 }}>👩🏻‍💼 👨🏾‍💼 🧑🏼‍💼</react_native_1.Text>
            </react_native_1.View>
            {!!statusText && statusText !== 'Ready' ? (<react_native_1.Text style={[styles.lobbyBody, { marginBottom: 14 }]}>
                {statusText}
              </react_native_1.Text>) : null}
            {isBusy ? <react_native_1.ActivityIndicator color="#10c9ff" style={{ marginTop: 20 }}/> : null}
            <react_native_1.Pressable style={[styles.primaryStartButton, premiumShowId ? styles.premiumPrimaryStartButton : null]} onPress={function () {
                if (inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.liveId) {
                    hydrateRoom(String(inviteJoinPreset.liveId)).catch(function () { });
                    return;
                }
                startFreshRoom();
            }}>
              <react_native_1.Text numberOfLines={1} style={[
                styles.primaryStartButtonText,
                premiumShowId ? styles.premiumPrimaryStartButtonText : null,
            ]}>
                {(inviteJoinPreset === null || inviteJoinPreset === void 0 ? void 0 : inviteJoinPreset.liveId)
                ? premiumShowId
                    ? 'Join Aqua Premium Show'
                    : 'Join room'
                : premiumShowId
                    ? 'Start Aqua Premium Show'
                    : 'Start new Drift Expo'}
              </react_native_1.Text>
            </react_native_1.Pressable>
            {recentDrifts.length > 0 ? (<react_native_1.View style={styles.recentSection}>
                <react_native_1.Text style={styles.recentSectionTitle}>Recent Drift Expos</react_native_1.Text>
                <react_native_1.ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                  {recentDrifts.map(function (item) { return (<react_native_1.Pressable key={item.id} style={styles.recentCard} onPress={function () {
                        if (item.playbackUrl && RNVideo) {
                            setReplayItem(item);
                        }
                    }}>
                      <react_native_1.View style={{ flex: 1 }}>
                        <react_native_1.Text style={styles.recentCardTitle}>
                          {item.hostName} was live
                        </react_native_1.Text>
                        <react_native_1.Text style={styles.recentCardMeta}>
                          {item.title}
                        </react_native_1.Text>
                      </react_native_1.View>
                      <react_native_1.Text style={styles.recentCardAction}>
                        {item.playbackUrl && RNVideo ? 'Play' : 'No replay'}
                      </react_native_1.Text>
                    </react_native_1.Pressable>); })}
                </react_native_1.ScrollView>
              </react_native_1.View>) : null}
            <react_native_1.Pressable style={styles.secondaryStartButton} onPress={handleClose}>
              <react_native_1.Text numberOfLines={1} style={styles.secondaryStartButtonText}>Close</react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>)}
        <react_native_1.Modal visible={!!replayItem} transparent animationType="fade" onRequestClose={function () { return setReplayItem(null); }}>
          <react_native_1.View style={styles.replayBackdrop}>
            <react_native_1.View style={styles.replayCard}>
              <react_native_1.Text style={styles.replayTitle}>{(replayItem === null || replayItem === void 0 ? void 0 : replayItem.hostName) || 'Drift replay'}</react_native_1.Text>
              {(replayItem === null || replayItem === void 0 ? void 0 : replayItem.playbackUrl) && RNVideo ? (<RNVideo source={{ uri: replayItem.playbackUrl }} style={styles.replayVideo} resizeMode="contain" controls paused={false}/>) : (<react_native_1.Text style={styles.replayEmpty}>No replay file is available for this Drift Expo.</react_native_1.Text>)}
              <react_native_1.Pressable style={styles.inviteCloseButton} onPress={function () { return setReplayItem(null); }}>
                <react_native_1.Text numberOfLines={1} style={styles.inviteCloseButtonText}>Close</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.Modal>
        <react_native_1.Modal visible={!!activeDoc && !isDocMinimized} transparent animationType="fade" onRequestClose={closePdfViewer}>
          <react_native_1.View style={styles.pdfBackdrop}>
              <react_native_1.View style={styles.pdfCard}>
                <react_native_1.View style={styles.pdfHeader}>
                <react_native_1.Text style={styles.pdfTitle} numberOfLines={1}>
                  {(activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.title) || 'Shared PDF'}
                </react_native_1.Text>
                <react_native_1.View style={styles.pdfHeaderActions}>
                  <react_native_1.Pressable style={styles.pdfIconButton} onPress={minimizePdfViewer}>
                    <react_native_1.Text style={styles.pdfIconButtonText}>-</react_native_1.Text>
                  </react_native_1.Pressable>
                  <react_native_1.Pressable style={styles.pdfCloseButton} onPress={closePdfViewer}>
                    <react_native_1.Text style={styles.pdfCloseButtonText}>x</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
              </react_native_1.View>
                <react_native_1.View style={styles.pdfPreviewFrame} onLayout={function (event) {
            var _a = event.nativeEvent.layout, width = _a.width, height = _a.height;
            setPdfFrameWidth(width);
            setPdfFrameHeight(height);
        }}>
                  <react_native_1.View style={styles.pdfBrandChip}>
                    <react_native_1.Text style={styles.pdfBrandChipText}>MoMo</react_native_1.Text>
                  </react_native_1.View>
                  {docBusy ? <react_native_1.ActivityIndicator color="#8D0000" size="large"/> : null}
                {!docBusy && (pdfPreviewUri || String((activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.sourceKind) || '').toLowerCase() === 'blank') ? (<react_native_1.ScrollView ref={function (ref) {
                pdfVerticalScrollRef.current = ref;
            }} style={styles.pdfPreviewScroll} contentContainerStyle={styles.pdfPreviewScrollContent} maximumZoomScale={1} minimumZoomScale={1} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={function (event) {
                if (!canControlCurrentSharedDoc)
                    return;
                var previewHeight = typeof pdfDisplayMetrics.height === 'number'
                    ? pdfDisplayMetrics.height
                    : pdfFrameHeight;
                var maxY = Math.max(0, previewHeight - pdfFrameHeight);
                var nextY = maxY > 0 ? event.nativeEvent.contentOffset.y / maxY : 0;
                queueSharedViewportSync(currentSharedDocPanX, nextY, pdfZoomLevel);
            }}>
                    <react_native_1.ScrollView ref={function (ref) {
                pdfHorizontalScrollRef.current = ref;
            }} horizontal contentContainerStyle={styles.pdfPreviewScrollContent} showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={function (event) {
                if (!canControlCurrentSharedDoc)
                    return;
                var previewWidth = typeof pdfDisplayMetrics.width === 'number'
                    ? pdfDisplayMetrics.width
                    : pdfFrameWidth;
                var maxX = Math.max(0, previewWidth - pdfFrameWidth);
                var nextX = maxX > 0 ? event.nativeEvent.contentOffset.x / maxX : 0;
                queueSharedViewportSync(nextX, currentSharedDocPanY, pdfZoomLevel);
            }}>
                      {String((activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.sourceKind) || '').toLowerCase() === 'blank' ? (<react_native_1.View style={[
                    styles.pdfPreviewImage,
                    {
                        width: pdfDisplayMetrics.width,
                        height: pdfDisplayMetrics.height,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 14,
                    },
                ]}/>) : (<react_native_1.Image source={{ uri: pdfPreviewUri || '' }} style={[
                    styles.pdfPreviewImage,
                    {
                        width: pdfDisplayMetrics.width,
                        height: pdfDisplayMetrics.height,
                    },
                ]} resizeMode="contain"/>)}
                    </react_native_1.ScrollView>
                  </react_native_1.ScrollView>) : !docBusy && activeDoc ? (<react_native_1.View style={styles.sharedFileFallbackCard}>
                    <react_native_1.Text style={styles.sharedFileFallbackType}>
                      {String(activeDoc.sourceKind || 'file').toUpperCase()}
                    </react_native_1.Text>
                    <react_native_1.Text style={styles.sharedFileFallbackTitle} numberOfLines={2}>
                      {activeDoc.title || activeDoc.fileName || 'Shared File'}
                    </react_native_1.Text>
                    <react_native_1.Text style={styles.sharedFileFallbackMeta} numberOfLines={2}>
                      {activeDoc.fileName || 'File shared in this Aqua Premium room'}
                    </react_native_1.Text>
                    <react_native_1.Text style={styles.sharedFileFallbackHint}>
                      Everyone in this show can now see this shared file on screen.
                    </react_native_1.Text>
                  </react_native_1.View>) : null}
                {sharedDocInkSegments.map(function (segment) { return (<react_native_1.View key={segment.id} pointerEvents="none" style={[
                styles.pdfInkSegment,
                {
                    left: segment.left,
                    top: segment.top,
                    width: segment.width,
                    height: segment.thickness,
                    borderRadius: segment.thickness / 2,
                    backgroundColor: segment.color,
                    transform: [{ rotate: segment.angle }],
                },
            ]}/>); })}
                {sharedDocInkPoints.map(function (point) { return (<react_native_1.View key={point.id} pointerEvents="none" style={[
                styles.pdfInkPoint,
                {
                    left: Math.max(8, Math.min(Math.max(8, pdfFrameWidth - 20), point.x * pdfFrameWidth - point.size / 2)),
                    top: Math.max(8, Math.min(Math.max(8, pdfFrameHeight - 20), point.y * pdfFrameHeight - point.size / 2)),
                    width: point.size,
                    height: point.size,
                    borderRadius: point.size / 2,
                    backgroundColor: point.color,
                },
            ]}/>); })}
                {sharedDocMarker ? (<react_native_1.View pointerEvents="none" style={[
                sharedDocMarker.mode === 'highlight'
                    ? styles.pdfHighlightMarker
                    : styles.pdfPointerMarker,
                {
                    left: sharedDocMarker.mode === 'highlight'
                        ? Math.max(12, Math.min(Math.max(12, pdfFrameWidth - 164), sharedDocMarker.x * pdfFrameWidth - 76))
                        : Math.max(12, Math.min(Math.max(12, pdfFrameWidth - 32), sharedDocMarker.x * pdfFrameWidth - 10)),
                    top: sharedDocMarker.mode === 'highlight'
                        ? Math.max(12, Math.min(Math.max(12, pdfFrameHeight - 58), sharedDocMarker.y * pdfFrameHeight - 18))
                        : Math.max(12, Math.min(Math.max(12, pdfFrameHeight - 32), sharedDocMarker.y * pdfFrameHeight - 10)),
                },
            ]}/>) : null}
                {canControlCurrentSharedDoc && currentPresentationTool ? (<react_native_1.View style={react_native_1.StyleSheet.absoluteFill} onStartShouldSetResponder={function () { return true; }} onMoveShouldSetResponder={function () { return true; }} onResponderGrant={function (event) {
                if (currentPresentationTool === 'pen') {
                    activeInkStrokeIdRef.current = "".concat(Date.now(), "_").concat(Math.random()
                        .toString(36)
                        .slice(2, 10));
                }
                placePresentationMarker(event.nativeEvent.locationX, event.nativeEvent.locationY);
            }} onResponderMove={function (event) {
                placePresentationMarker(event.nativeEvent.locationX, event.nativeEvent.locationY);
            }} onResponderRelease={function () {
                activeInkPointRef.current = null;
                activeInkStrokeIdRef.current = null;
            }} onResponderTerminate={function () {
                activeInkPointRef.current = null;
                activeInkStrokeIdRef.current = null;
            }}/>) : null}
              </react_native_1.View>
              {['pdf', 'blank', 'image'].includes(String((activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.sourceKind) || '').toLowerCase()) ? (<react_native_1.View style={styles.pdfPagerRow}>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                (!canControlCurrentSharedDoc || pdfPageIndex <= 0 || isGuestViewingSharedDoc)
                    ? styles.pdfPagerButtonDisabled
                    : null,
            ]} onPress={function () {
                if (canControlCurrentSharedDoc) {
                    void pushSharedDocState({ page: 0, slideShow: false });
                }
            }} disabled={!canControlCurrentSharedDoc || docBusy || pdfPageIndex <= 0 || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'|<'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                pdfPageIndex <= 0 || isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={function () { return void changePdfPage(-1); }} disabled={docBusy || pdfPageIndex <= 0 || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'<'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                !canControlCurrentSharedDoc || isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={startSharedDocSlideShow} disabled={!canControlCurrentSharedDoc || docBusy || pdfPageCount <= 1 || currentSharedDocSlideShow || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'▶'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                (!canControlCurrentSharedDoc || !currentSharedDocSlideShow || isGuestViewingSharedDoc)
                    ? styles.pdfPagerButtonDisabled
                    : null,
            ]} onPress={pauseSharedDocSlideShow} disabled={!canControlCurrentSharedDoc || !currentSharedDocSlideShow || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'⏸'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={function () { return void changePdfPage(1); }} disabled={docBusy || pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'>'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                (!canControlCurrentSharedDoc || pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc)
                    ? styles.pdfPagerButtonDisabled
                    : null,
            ]} onPress={function () {
                if (canControlCurrentSharedDoc && pdfPageCount > 0) {
                    void pushSharedDocState({ page: Math.max(0, pdfPageCount - 1), slideShow: false });
                }
            }} disabled={!canControlCurrentSharedDoc || docBusy || pdfPageIndex >= pdfPageCount - 1 || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'>|'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.pdfPagerButton, isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null]} onPress={function () {
                var nextZoom = Math.max(1, Number((pdfZoomLevel - 0.25).toFixed(2)));
                setPdfZoomLevel(nextZoom);
                if (canControlCurrentSharedDoc) {
                    void pushSharedDocState({ zoom: nextZoom });
                }
            }} disabled={docBusy || pdfZoomLevel <= 1 || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>−</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[styles.pdfPagerButton, isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null]} onPress={function () {
                var nextZoom = Math.min(3, Number((pdfZoomLevel + 0.25).toFixed(2)));
                setPdfZoomLevel(nextZoom);
                if (canControlCurrentSharedDoc) {
                    void pushSharedDocState({ zoom: nextZoom });
                }
            }} disabled={docBusy || pdfZoomLevel >= 3 || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>+</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                currentPresentationTool === 'pointer' ? styles.pdfPagerButtonActive : null,
                isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={function () { return togglePresentationTool('pointer'); }} disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'⌖'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                currentPresentationTool === 'highlight' ? styles.pdfPagerButtonActive : null,
                isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={function () { return togglePresentationTool('highlight'); }} disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'✎'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                currentPresentationTool === 'pen' ? styles.pdfPagerButtonActive : null,
                isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={function () { return togglePresentationTool('pen'); }} disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'🖊'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Pressable style={[
                styles.pdfPagerButton,
                currentPresentationTool === 'eraser' ? styles.pdfPagerButtonActive : null,
                isGuestViewingSharedDoc ? styles.pdfPagerButtonDisabled : null,
            ]} onPress={function () { return togglePresentationTool('eraser'); }} disabled={!canControlCurrentSharedDoc || isGuestViewingSharedDoc}>
                  <react_native_1.Text style={styles.pdfPagerButtonText}>{'⌫'}</react_native_1.Text>
                </react_native_1.Pressable>
                <react_native_1.Text style={styles.pdfPageCounterText}>
                  {Math.min(pdfPageCount || 0, pdfPageIndex + 1)} / {pdfPageCount || 0}
                </react_native_1.Text>
                <react_native_1.Text style={styles.pdfSlideSpeedText}>{currentSharedDocSlideSeconds}s</react_native_1.Text>
              </react_native_1.View>) : null}
              {!canControlCurrentSharedDoc && currentSharedDocId && ['pdf', 'blank', 'image'].includes(String((activeDoc === null || activeDoc === void 0 ? void 0 : activeDoc.sourceKind) || '').toLowerCase()) ? (<>
                  <react_native_1.View style={styles.pdfGuestUtilityRow}>
                    <react_native_1.Pressable style={styles.pdfGuestUtilityButton} onPress={function () {
                if (activeDoc) {
                    void openSharedPdf(activeDoc, { silentIfPending: true });
                }
            }}>
                      <react_native_1.Text numberOfLines={1} style={styles.pdfGuestUtilityButtonText}>Refresh</react_native_1.Text>
                    </react_native_1.Pressable>
                  </react_native_1.View>
                  <react_native_1.Text style={styles.pdfGuestHint}>
                    Live presenter controls stay with the sharer. Your view follows the live document.
                  </react_native_1.Text>
                </>) : null}
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.Modal>
      </react_native_1.View>
    </react_native_1.Modal>);
};
var styles = react_native_1.StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#05070d',
    },
    videoStage: {
        flex: 1,
        backgroundColor: '#000',
    },
    galleryGrid: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 92, paddingHorizontal: 8, paddingBottom: 132, alignContent: 'flex-start' }),
    galleryTile: {
        padding: 4,
    },
    galleryTileInner: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#081019',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    galleryTileLabelWrap: {
        position: 'absolute',
        left: 8,
        bottom: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: 'rgba(4,10,16,0.72)',
    },
    tileBrandChip: {
        position: 'absolute',
        left: 8,
        top: 8,
        zIndex: 2,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(6,16,27,0.74)',
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.34)',
    },
    tileBrandChipText: {
        color: '#E0F2FE',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    galleryTileLabel: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
    },
    galleryOverflowBadge: {
        position: 'absolute',
        right: 8,
        top: 8,
        backgroundColor: 'rgba(8,20,36,0.92)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(80,146,255,0.28)',
    },
    galleryOverflowText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
    },
    videoFill: __assign({}, react_native_1.StyleSheet.absoluteFillObject),
    pictureInPicture: {
        position: 'absolute',
        width: 92,
        height: 136,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: '#0c111a',
    },
    pictureInPictureVideo: {
        width: '100%',
        height: '100%',
    },
    videoFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10141d',
    },
    videoFallbackText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    topBar: {
        position: 'absolute',
        left: 16,
        right: 16,
        top: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topBarTitleWrap: {
        flex: 1,
        paddingRight: 8,
        minWidth: 0,
    },
    topBarCenter: {
        flexShrink: 0,
        minWidth: 0,
        maxWidth: 144,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    topBarActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 12,
    },
    livePill: {
        color: '#061117',
        backgroundColor: '#30e6b6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        fontWeight: '900',
        alignSelf: 'flex-start',
        overflow: 'hidden',
        marginBottom: 8,
    },
    roomTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
        flexShrink: 1,
    },
    premiumRoomTitle: {
        color: '#B30000',
        fontSize: 12,
        fontWeight: '900',
        lineHeight: 14,
    },
    driftRoomTitle: {
        color: '#30e6b6',
        fontSize: 16,
        fontWeight: '900',
        lineHeight: 18,
        letterSpacing: 0.3,
    },
    premiumCountdownPill: {
        minWidth: 0,
        maxWidth: 144,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: '#0EA5D9',
        borderWidth: 1,
        borderColor: '#0EA5D9',
    },
    premiumCountdownText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '900',
        lineHeight: 14,
        flexShrink: 1,
    },
    closeChip: {
        backgroundColor: '#111827',
        minWidth: 50,
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.28)',
        alignItems: 'center',
    },
    closeChipText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18,
        lineHeight: 18,
    },
    topIconChip: {
        minWidth: 50,
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.3)',
        backgroundColor: '#0F172A',
        alignItems: 'center',
    },
    topIconChipText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18,
        lineHeight: 18,
    },
    rightRail: {
        position: 'absolute',
        gap: 8,
    },
    railButton: {
        minWidth: 108,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(125,211,252,0.18)',
        backgroundColor: 'rgba(7,18,29,0.78)',
        shadowColor: '#020617',
        shadowOpacity: 0.28,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        alignItems: 'center',
    },
    railIcon: {
        color: '#E2E8F0',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    railEmojiLine: {
        color: '#7DD3FC',
        fontSize: 10,
        fontWeight: '700',
        marginTop: 3,
    },
    soundBadge: {
        position: 'absolute',
        left: 14,
        right: 96,
        bottom: 134,
        borderRadius: 16,
        backgroundColor: 'rgba(141,0,0,0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignItems: 'center',
    },
    soundBadgeText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
        textAlign: 'center',
    },
    screenShareBanner: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 132,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: 'rgba(4,18,32,0.84)',
        borderWidth: 1,
        borderColor: 'rgba(59,130,246,0.45)',
    },
    screenShareBannerText: {
        color: '#E0F2FE',
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center',
    },
    meetingStatusOverlay: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 182,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(4,18,32,0.82)',
        borderWidth: 1,
        borderColor: 'rgba(14,165,233,0.4)',
        gap: 4,
    },
    meetingStatusText: {
        color: '#E0F2FE',
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center',
    },
    audiencePanel: {
        position: 'absolute',
        width: 200,
        borderRadius: 18,
        backgroundColor: 'rgba(10,16,24,0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 12,
    },
    audiencePanelTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
    },
    audiencePanelMeta: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 11,
        marginTop: 4,
        marginBottom: 8,
    },
    audienceRow: {
        paddingVertical: 8,
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    audienceRowText: {
        color: '#FFDADA',
        fontSize: 13,
        fontWeight: '700',
    },
    raisedHandsWrap: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: react_native_1.StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(255,255,255,0.1)',
        gap: 6,
    },
    raisedHandsTitle: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
    },
    raisedHandsText: {
        color: '#BAE6FD',
        fontSize: 12,
        fontWeight: '700',
    },
    docsPanel: {
        position: 'absolute',
        width: 260,
        zIndex: 14,
        elevation: 14,
        borderRadius: 18,
        backgroundColor: 'rgba(10,16,24,0.95)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 12,
    },
    docsPanelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 4,
    },
    docsPanelClose: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '900',
        paddingHorizontal: 4,
    },
    docsPanelStatusText: {
        color: '#FFFFFF',
        fontSize: 12,
        lineHeight: 16,
        textAlign: 'center',
    },
    docsShareButtonWrap: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
    },
    roomJoiningOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 58,
        height: 58,
        marginLeft: -29,
        marginTop: -29,
        borderRadius: 29,
        backgroundColor: 'rgba(6,13,22,0.58)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 8,
    },
    docsShareButton: {
        backgroundColor: '#0F172A',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.24)',
        paddingVertical: 8,
        paddingHorizontal: 14,
        alignItems: 'center',
        marginBottom: 10,
    },
    docsShareButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.3,
        flexShrink: 1,
    },
    docsProgressCard: {
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
    },
    docsProgressTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    docsProgressMeta: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: 11,
        marginTop: 4,
        lineHeight: 15,
    },
    docsEmptyText: {
        color: 'rgba(255,255,255,0.68)',
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 16,
    },
    screenShareHostStage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0B1220',
        paddingHorizontal: 28,
    },
    sharedFileStage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#07111D',
        paddingHorizontal: 28,
    },
    sharedFileStageBadge: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.36)',
        backgroundColor: 'rgba(15,23,42,0.92)',
        marginBottom: 14,
    },
    sharedFileStageBadgeText: {
        color: '#BAE6FD',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    sharedFileStageTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        maxWidth: 340,
    },
    sharedFileStageMeta: {
        color: '#CBD5E1',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 10,
        maxWidth: 340,
    },
    screenShareHostTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
    screenShareHostMeta: {
        color: '#CBD5E1',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 10,
        maxWidth: 320,
    },
    screenShareInsetStage: {
        backgroundColor: 'rgba(11,18,32,0.94)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    screenShareInsetText: {
        color: '#E0F2FE',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    sharedFileFallbackCard: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 22,
        paddingVertical: 28,
        gap: 10,
    },
    sharedFileFallbackType: {
        color: '#8D0000',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
    sharedFileFallbackTitle: {
        color: '#0F172A',
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
    sharedFileFallbackMeta: {
        color: '#334155',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    sharedFileFallbackHint: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    docsRow: {
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    docsRowTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    docsRowMeta: {
        color: 'rgba(255,255,255,0.66)',
        fontSize: 11,
        marginTop: 4,
    },
    premiumCommentPanel: {
        position: 'absolute',
        borderRadius: 16,
        backgroundColor: 'rgba(6,13,22,0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        padding: 10,
        maxHeight: SCREEN_HEIGHT * 0.24,
    },
    premiumCommentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    premiumCommentTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '900',
    },
    premiumCommentClose: {
        color: '#9de8ff',
        fontSize: 11,
        fontWeight: '800',
    },
    premiumCommentScroll: {
        maxHeight: SCREEN_HEIGHT * 0.18,
    },
    premiumCommentScrollContent: {
        paddingBottom: 4,
    },
    premiumCommentEmpty: {
        color: 'rgba(255,255,255,0.62)',
        fontSize: 12,
        textAlign: 'center',
        paddingVertical: 14,
    },
    premiumCommentBubble: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 7,
    },
    premiumCommentAuthor: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
        marginBottom: 2,
    },
    premiumCommentReply: {
        color: '#8fdcff',
        fontSize: 11,
        marginBottom: 4,
    },
    premiumCommentText: {
        color: '#F7FBFF',
        fontSize: 12,
        lineHeight: 17,
        fontWeight: '700',
    },
    reactionTray: {
        position: 'absolute',
        right: 82,
        bottom: 250,
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 244,
        gap: 8,
        backgroundColor: 'rgba(10,16,24,0.82)',
        borderRadius: 18,
        padding: 10,
    },
    reactionChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reactionChipText: {
        fontSize: 22,
    },
    commentLane: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 220,
    },
    commentGuide: {
        position: 'absolute',
        left: 8,
        bottom: 130,
        width: 2,
        height: SCREEN_HEIGHT * 0.38,
        backgroundColor: 'rgba(255,255,255,0.22)',
    },
    floatingCommentWrap: {
        position: 'absolute',
        left: 16,
        maxWidth: 218,
    },
    floatingCommentBubble: {
        backgroundColor: 'rgba(6,16,27,0.82)',
        borderColor: 'rgba(158,232,255,0.24)',
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    floatingCommentAuthor: {
        color: '#9de8ff',
        fontWeight: '800',
        marginBottom: 2,
    },
    floatingReplyText: {
        color: 'rgba(143,220,255,0.82)',
        fontSize: 11,
        marginBottom: 5,
    },
    floatingCommentText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    floatingReaction: {
        position: 'absolute',
        fontSize: 28,
    },
    commentAvatarWrap: {
        paddingTop: 2,
    },
    commentAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },
    commentAvatarFallback: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#243140',
    },
    commentAvatarFallbackText: {
        color: 'white',
        fontWeight: '800',
    },
    commentName: {
        color: 'white',
        fontWeight: '800',
        marginBottom: 2,
    },
    replySnippet: {
        color: '#8fdcff',
        fontSize: 11,
        marginBottom: 3,
    },
    commentText: {
        color: 'rgba(255,255,255,0.88)',
    },
    commentTime: {
        color: 'rgba(255,255,255,0.48)',
        fontSize: 10,
        marginTop: 4,
    },
    bottomComposer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 14,
        paddingTop: 10,
        backgroundColor: 'rgba(4,8,13,0.88)',
    },
    replyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(31,61,89,0.95)',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    replyPillText: {
        color: '#d8f4ff',
        flex: 1,
        marginRight: 10,
    },
    replyPillDismiss: {
        color: 'white',
        fontWeight: '900',
    },
    composerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: 'white',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sendButton: {
        backgroundColor: '#10c9ff',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sendButtonText: {
        color: '#03131e',
        fontWeight: '900',
        flexShrink: 1,
    },
    participantStrip: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
    participantChip: {
        width: 58,
        alignItems: 'center',
    },
    participantAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginBottom: 4,
    },
    participantName: {
        color: 'white',
        fontSize: 10,
    },
    inviteBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    invitePanel: {
        backgroundColor: '#091019',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 18,
    },
    inviteTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 14,
    },
    inviteSearchRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    inviteInput: {
        flex: 1,
        backgroundColor: '#101b28',
        color: 'white',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    inviteSearchButton: {
        backgroundColor: '#10c9ff',
        borderRadius: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inviteSearchButtonText: {
        color: '#03131e',
        fontWeight: '900',
        flexShrink: 1,
    },
    onlineSection: {
        marginBottom: 12,
    },
    onlineSectionTitle: {
        color: '#8fdcff',
        fontWeight: '800',
        marginBottom: 8,
    },
    onlineInviteRow: {
        flexDirection: 'row',
        gap: 10,
        paddingRight: 8,
    },
    onlineInviteChip: {
        width: 96,
        borderRadius: 16,
        backgroundColor: '#101b28',
        paddingHorizontal: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    onlineInviteAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginBottom: 8,
    },
    onlineInviteName: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },
    onlineInviteHandle: {
        color: '#7ab9d2',
        fontSize: 10,
        marginTop: 4,
        textAlign: 'center',
    },
    inviteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: react_native_1.StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    inviteResultName: {
        color: 'white',
        fontWeight: '700',
    },
    inviteResultUid: {
        color: 'rgba(255,255,255,0.56)',
        fontSize: 11,
        marginTop: 3,
    },
    inviteResultButton: {
        backgroundColor: '#0fd08f',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    inviteResultButtonText: {
        color: '#031313',
        fontWeight: '900',
        flexShrink: 1,
    },
    inviteCloseButton: {
        marginTop: 14,
        backgroundColor: '#0EA5D9',
        borderRadius: 16,
        alignItems: 'center',
        paddingVertical: 14,
    },
    inviteCloseButtonText: {
        color: 'white',
        fontWeight: '800',
        flexShrink: 1,
    },
    lobby: {
        flex: 1,
        backgroundColor: '#07101a',
        paddingHorizontal: 22,
        justifyContent: 'center',
    },
    lobbyEyebrow: {
        color: '#10c9ff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    lobbyTitle: {
        color: 'white',
        fontSize: 34,
        fontWeight: '900',
        marginBottom: 12,
    },
    lobbyBody: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 18,
    },
    lobbyCard: {
        backgroundColor: '#0d1825',
        borderRadius: 22,
        padding: 18,
        marginBottom: 20,
    },
    lobbyMetaLabel: {
        color: '#7ab9d2',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    lobbyMetaValue: {
        color: 'white',
        fontWeight: '700',
        marginBottom: 12,
    },
    primaryStartButton: {
        backgroundColor: '#0F172A',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.28)',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginBottom: 12,
    },
    primaryStartButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '900',
        flexShrink: 1,
    },
    premiumPrimaryStartButton: {
        backgroundColor: '#8D0000',
    },
    premiumPrimaryStartButtonText: {
        color: '#FFFFFF',
    },
    secondaryStartButton: {
        backgroundColor: '#111827',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.26)',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginBottom: 10,
    },
    secondaryStartButtonText: {
        color: '#FFFFFF',
        fontWeight: '800',
        flexShrink: 1,
    },
    recentSection: {
        marginBottom: 12,
    },
    recentSectionTitle: {
        color: '#9de8ff',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
    },
    recentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#0d1825',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 8,
    },
    recentCardTitle: {
        color: 'white',
        fontWeight: '800',
        marginBottom: 2,
    },
    recentCardMeta: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: 12,
    },
    recentCardAction: {
        color: '#10c9ff',
        fontWeight: '800',
    },
    replayBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.78)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    replayCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#091019',
        borderRadius: 24,
        padding: 18,
    },
    pdfBackdrop: {
        flex: 1,
        backgroundColor: '#05070d',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    pdfCard: {
        width: '100%',
        maxWidth: 980,
        height: '100%',
        backgroundColor: '#05070d',
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 14,
    },
    pdfHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 10,
    },
    pdfHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 12,
    },
    pdfTitle: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '900',
    },
    pdfIconButton: {
        backgroundColor: '#0F172A',
        minWidth: 52,
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.32)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfIconButtonText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18,
        lineHeight: 18,
    },
    pdfCloseButton: {
        backgroundColor: '#1E293B',
        minWidth: 52,
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.32)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfCloseButtonText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18,
        lineHeight: 18,
    },
    pdfPreviewFrame: {
        flex: 1,
        minHeight: 420,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: 12,
    },
    pdfBrandChip: {
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 3,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(6,16,27,0.78)',
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.28)',
    },
    pdfBrandChipText: {
        color: '#0EA5E9',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    pdfPreviewScroll: {
        width: '100%',
        flex: 1,
    },
    pdfPreviewScrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfPreviewImage: {
        borderRadius: 12,
    },
    pdfPagerRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    pdfPagerRowDisabled: {
        opacity: 0.46,
    },
    pdfPagerButton: {
        backgroundColor: '#0F172A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.22)',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 62,
        paddingVertical: 7,
        paddingHorizontal: 16,
    },
    pdfPagerButtonDisabled: {
        backgroundColor: 'rgba(15,23,42,0.38)',
        borderColor: 'rgba(148,163,184,0.14)',
    },
    pdfPagerButtonActive: {
        backgroundColor: '#0B3B57',
        borderColor: 'rgba(34,211,238,0.38)',
    },
    pdfPagerButtonText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 14,
    },
    pdfPageCounterText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 15,
        marginLeft: 8,
    },
    pdfSlideSpeedText: {
        color: 'rgba(255,255,255,0.88)',
        fontWeight: '800',
        fontSize: 13,
        marginLeft: 4,
    },
    pdfGuestHint: {
        color: 'rgba(255,255,255,0.72)',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    pdfGuestUtilityRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginTop: 10,
    },
    pdfGuestUtilityButton: {
        backgroundColor: '#0F172A',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.22)',
        paddingHorizontal: 16,
        paddingVertical: 7,
    },
    pdfGuestUtilityButtonText: {
        color: '#E2E8F0',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.2,
        flexShrink: 1,
    },
    stageBrandChip: {
        position: 'absolute',
        zIndex: 6,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(6,16,27,0.78)',
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.28)',
    },
    stageBrandChipText: {
        color: '#E0F2FE',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    networkWarningBanner: {
        position: 'absolute',
        zIndex: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(127,29,29,0.92)',
        borderWidth: 1,
        borderColor: 'rgba(254,202,202,0.34)',
    },
    networkWarningText: {
        color: '#FEE2E2',
        fontSize: 12,
        fontWeight: '800',
        textAlign: 'center',
    },
    maximizeDocChip: {
        position: 'absolute',
        backgroundColor: 'rgba(14,165,217,0.96)',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 9,
        zIndex: 6,
    },
    maximizeDocChipText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
    },
    pdfPointerMarker: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#D30000',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOpacity: 0.28,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    pdfHighlightMarker: {
        position: 'absolute',
        width: 152,
        height: 36,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 230, 0, 0.34)',
        borderWidth: 1,
        borderColor: 'rgba(255, 204, 0, 0.72)',
    },
    pdfInkSegment: {
        position: 'absolute',
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
    },
    pdfInkPoint: {
        position: 'absolute',
        shadowColor: '#000000',
        shadowOpacity: 0.14,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    replayTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    replayVideo: {
        width: '100%',
        height: 320,
        backgroundColor: '#000',
        borderRadius: 16,
        marginBottom: 14,
    },
    replayEmpty: {
        color: 'rgba(255,255,255,0.72)',
        marginBottom: 14,
    },
    cameraOffStage: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#131a24',
    },
    cameraOffText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
});
exports.default = FreshDriftExpoModal;
