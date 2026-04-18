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
var react_native_2 = require("react-native");
var react_native_linear_gradient_1 = __importDefault(require("react-native-linear-gradient"));
var ProfileAvatarWithCrew_1 = __importDefault(require("../components/ProfileAvatarWithCrew"));
var PosterActionBar_1 = __importDefault(require("../components/PosterActionBar"));
var VideoWithTapControls_1 = __importDefault(require("../components/VideoWithTapControls"));
var ClickableTextWithLinks_1 = __importDefault(require("../components/ClickableTextWithLinks"));
var OnlineUsersList_1 = __importDefault(require("../components/OnlineUsersList"));
var ProfilePreviewModal_1 = __importDefault(require("../components/ProfilePreviewModal"));
var database_1 = __importDefault(require("@react-native-firebase/database"));
var firestore_1 = __importDefault(require("@react-native-firebase/firestore"));
var timeUtils_1 = require("../services/timeUtils");
var tokens_1 = require("../theme/tokens");
var MediaEditor_1 = require("../components/MediaEditor");
var _a = react_native_2.Dimensions.get('window'), SCREEN_WIDTH = _a.width, SCREEN_HEIGHT = _a.height;
var ui = {
    colors: {
        card: tokens_1.appTokens.colors.surface,
        border: tokens_1.appTokens.colors.border,
        heading: tokens_1.appTokens.colors.heading,
        body: tokens_1.appTokens.colors.body,
        subtle: tokens_1.appTokens.colors.subtle,
        link: tokens_1.appTokens.colors.link,
        accent: tokens_1.appTokens.colors.accent,
        accentSoft: tokens_1.appTokens.colors.surfaceMuted,
        success: tokens_1.appTokens.colors.success,
        danger: tokens_1.appTokens.colors.danger,
    },
    radius: { md: tokens_1.appTokens.radius.md, lg: tokens_1.appTokens.radius.lg, xl: tokens_1.appTokens.radius.xl },
    spacing: { xs: tokens_1.appTokens.spacing.xs, sm: tokens_1.appTokens.spacing.sm, md: tokens_1.appTokens.spacing.md, lg: tokens_1.appTokens.spacing.lg },
    type: { title: tokens_1.appTokens.type.title, body: tokens_1.appTokens.type.body, caption: tokens_1.appTokens.type.caption, meta: tokens_1.appTokens.type.meta },
};
var RNVideo = null;
try {
    RNVideo = require('react-native-video').default;
}
catch (_b) { }
var STORY_THEMES = [
    { colors: ['#0f172a', '#1e3a8a'], accent: '#bfdbfe' },
    { colors: ['#1f2937', '#0f766e'], accent: '#99f6e4' },
    { colors: ['#312e81', '#6d28d9'], accent: '#ddd6fe' },
    { colors: ['#3f1d2e', '#9a3412'], accent: '#fed7aa' },
];
var isAudioAsset = function (asset) {
    if (!asset)
        return false;
    var t = String(asset.type || '').toLowerCase();
    if (t.includes('audio'))
        return true;
    var uri = String(asset.uri || '').toLowerCase();
    return /(\.(mp3|m4a|aac|wav|ogg|flac))($|\?)/i.test(uri);
};
var isImageAsset = function (asset) {
    if (!asset)
        return false;
    var t = String(asset.type || '').toLowerCase();
    if (t.includes('image'))
        return true;
    var uri = String(asset.uri || '').toLowerCase();
    return /(\.(jpg|jpeg|png|gif|webp|heic))($|\?)/i.test(uri);
};
var MainFeedItem = (0, react_1.memo)(function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var item = _a.item, index = _a.index, myUid = _a.myUid, profileName = _a.profileName, profileBio = _a.profileBio, profileMinuteFameTitle = _a.profileMinuteFameTitle, userData = _a.userData, ensureUserData = _a.ensureUserData, waveStats = _a.waveStats, isInUserCrew = _a.isInUserCrew, optimisticCrewCounts = _a.optimisticCrewCounts, expandedPosts = _a.expandedPosts, revealedImages = _a.revealedImages, isCurrentUserOnline = _a.isCurrentUserOnline, bufferingMap = _a.bufferingMap, postEchoLists = _a.postEchoLists, expandedEchoes = _a.expandedEchoes, echoesPageSize = _a.echoesPageSize, echoExpansionInProgress = _a.echoExpansionInProgress, reachCounts = _a.reachCounts, isPaused = _a.isPaused, allowPlayback = _a.allowPlayback, showMakeWaves = _a.showMakeWaves, showAudioModal = _a.showAudioModal, capturedMedia = _a.capturedMedia, showLive = _a.showLive, activeVideoId = _a.activeVideoId, preloadedVideoIds = _a.preloadedVideoIds, overlayReadyMap = _a.overlayReadyMap, isWifi = _a.isWifi, bridge = _a.bridge, currentIndex = _a.currentIndex, displayHandle = _a.displayHandle, formatDefiniteTime = _a.formatDefiniteTime, translate = _a.translate, openWaveOptions = _a.openWaveOptions, handleToggleVibe = _a.handleToggleVibe, setExpandedPosts = _a.setExpandedPosts, setRevealedImages = _a.setRevealedImages, recordVideoReach = _a.recordVideoReach, recordImageReach = _a.recordImageReach, markBuffering = _a.markBuffering, onVideoPlaybackError = _a.onVideoPlaybackError, setPreservedScrollPosition = _a.setPreservedScrollPosition, navigation = _a.navigation, ensureSplash = _a.ensureSplash, removeSplash = _a.removeSplash, setWavesFeed = _a.setWavesFeed, setVibesFeed = _a.setVibesFeed, setPublicFeed = _a.setPublicFeed, setPostFeed = _a.setPostFeed, setEchoWaveId = _a.setEchoWaveId, setCurrentIndex = _a.setCurrentIndex, setShowEchoes = _a.setShowEchoes, setShowPearls = _a.setShowPearls, anchorWave = _a.anchorWave, onShareWave = _a.onShareWave, setEchoExpansionInProgress = _a.setEchoExpansionInProgress, setExpandedEchoes = _a.setExpandedEchoes, setEchoesPageSize = _a.setEchoesPageSize, videoStyleFor = _a.videoStyleFor, isVideoAsset = _a.isVideoAsset, onReplyToEcho = _a.onReplyToEcho, onOpenCreatorProfile = _a.onOpenCreatorProfile, onOpenProfilePicture = _a.onOpenProfilePicture, onOpenFleetDeck = _a.onOpenFleetDeck, _b0 = _a.fleetDeckBadgeCount, fleetDeckBadgeCount = _b0 === void 0 ? 0 : _b0;
    var _s = (0, react_1.useState)(''), status = _s[0], setStatus = _s[1];
    var _t = (0, react_1.useState)(false), isHereNow = _t[0], setIsHereNow = _t[1];
    var _u = (0, react_1.useState)(null), activeEchoActionId = _u[0], setActiveEchoActionId = _u[1];
    var _v = (0, react_1.useState)({}), localEchoHugs = _v[0], setLocalEchoHugs = _v[1];
    var _w = (0, react_1.useState)({}), expandedReplies = _w[0], setExpandedReplies = _w[1];
    var _x = (0, react_1.useState)({}), echoReplies = _x[0], setEchoReplies = _x[1];
    var _y = (0, react_1.useState)({}), replyPreviews = _y[0], setReplyPreviews = _y[1];
    var _z = (0, react_1.useState)(false), showProfilePreview = _z[0], setShowProfilePreview = _z[1];
    var _0 = (0, react_1.useState)(null), selectedUserId = _0[0], setSelectedUserId = _0[1];
    var _1 = (0, react_1.useState)(false), audioControlsVisible = _1[0], setAudioControlsVisible = _1[1];
    var _2 = (0, react_1.useState)(false), overlayAudioLoaded = _2[0], setOverlayAudioLoaded = _2[1];
    var _3 = (0, react_1.useState)(false), overlayAudioStarted = _3[0], setOverlayAudioStarted = _3[1];
    var _4 = (0, react_1.useState)(false), viewerVisible = _4[0], setViewerVisible = _4[1];
    var _5 = (0, react_1.useState)(0), viewerIndex = _5[0], setViewerIndex = _5[1];
    var _6 = (0, react_1.useState)(1), viewerZoom = _6[0], setViewerZoom = _6[1];
    var _7 = (0, react_1.useState)(-1), activeGridVideoIndex = _7[0], setActiveGridVideoIndex = _7[1];
    var _8 = (0, react_1.useState)(0), activeGridMediaIndex = _8[0], setActiveGridMediaIndex = _8[1];
    var _9 = (0, react_1.useState)({}), mediaActionCounts = _9[0], setMediaActionCounts = _9[1];
    var _10 = (0, react_1.useState)('idle'), splashSyncStatus = _10[0], setSplashSyncStatus = _10[1];
    var _11 = (0, react_1.useState)(null), lastSplashAction = _11[0], setLastSplashAction = _11[1];
    var _12 = (0, react_1.useState)(false), preferFallbackVideoSource = _12[0], setPreferFallbackVideoSource = _12[1];
    var renderMoMoBadge = (0, react_1.useCallback)(function () { return null; }, []);
    var audioControlsTimerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        setPreferFallbackVideoSource(false);
    }, [item.id, item.playbackUrl, (_b = item.media) === null || _b === void 0 ? void 0 : _b.uri]);
    (0, react_1.useEffect)(function () {
        setOverlayAudioLoaded(false);
        setOverlayAudioStarted(false);
    }, [item.id, (_c = item.audio) === null || _c === void 0 ? void 0 : _c.uri]);
    var revealAudioControlsTemporarily = (0, react_1.useCallback)(function () {
        setAudioControlsVisible(true);
        if (audioControlsTimerRef.current) {
            try {
                clearTimeout(audioControlsTimerRef.current);
            }
            catch (_a) { }
        }
        audioControlsTimerRef.current = setTimeout(function () {
            setAudioControlsVisible(false);
            audioControlsTimerRef.current = null;
        }, 4000);
    }, []);
    (0, react_1.useEffect)(function () {
        return function () {
            if (audioControlsTimerRef.current) {
                try {
                    clearTimeout(audioControlsTimerRef.current);
                }
                catch (_a) { }
            }
        };
    }, []);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        var ownerUid = item.ownerUid;
        if (ownerUid === myUid) {
            setIsHereNow(false);
            setStatus('');
            return;
        }
        var ONLINE_GRACE_MS = 60 * 1000;
        var postFallbackTs = (item === null || item === void 0 ? void 0 : item.createdAt) || (item === null || item === void 0 ? void 0 : item.timestamp) || new Date();
        var toMillis = function (input) {
            if (!input)
                return 0;
            if (typeof (input === null || input === void 0 ? void 0 : input.toDate) === 'function')
                return input.toDate().getTime();
            if (typeof input === 'number')
                return input < 1e12 ? input * 1000 : input;
            if (typeof input === 'object') {
                var seconds = typeof input.seconds === 'number'
                    ? input.seconds
                    : typeof input._seconds === 'number'
                        ? input._seconds
                        : null;
                var nanoseconds = typeof input.nanoseconds === 'number'
                    ? input.nanoseconds
                    : typeof input._nanoseconds === 'number'
                        ? input._nanoseconds
                        : 0;
                if (seconds !== null)
                    return seconds * 1000 + Math.floor(nanoseconds / 1e6);
            }
            var d = new Date(input);
            return Number.isNaN(d.getTime()) ? 0 : d.getTime();
        };
        if (!ownerUid) {
            setIsHereNow(false);
            setStatus(translate('feed.awayUnknown'));
            return;
        }
        var fallbackLastSeen = ((_a = userData[ownerUid]) === null || _a === void 0 ? void 0 : _a.lastSeen) || postFallbackTs;
        var firestoreOnline = ((_b = userData[ownerUid]) === null || _b === void 0 ? void 0 : _b.online) === true;
        var rtdbOnline = false;
        var firestoreLastSeen = fallbackLastSeen;
        var rtdbLastSeen = null;
        var firestoreLastActiveAt = null;
        var rtdbLastActiveAt = null;
        var chooseMostRecent = function (a, b) {
            return toMillis(a) >= toMillis(b) ? a : b;
        };
        var refreshStatus = function () {
            var _a;
            var mostRecentLastSeen = chooseMostRecent(firestoreLastSeen, rtdbLastSeen);
            var mostRecentActive = chooseMostRecent(firestoreLastActiveAt, rtdbLastActiveAt);
            var referenceActiveTs = mostRecentActive || mostRecentLastSeen;
            var onlineByFreshSignal = (rtdbOnline || firestoreOnline) &&
                toMillis(referenceActiveTs) > 0 &&
                Date.now() - toMillis(referenceActiveTs) <= ONLINE_GRACE_MS;
            var online = onlineByFreshSignal;
            if (online) {
                setIsHereNow(true);
                setStatus(translate('feed.hereNow'));
                return;
            }
            var resolvedLastSeen = mostRecentLastSeen || mostRecentActive || null;
            var exact = (0, timeUtils_1.formatPresenceLastSeenExact)(resolvedLastSeen) ||
                (0, timeUtils_1.formatPresenceLastSeenExact)(((_a = userData[ownerUid]) === null || _a === void 0 ? void 0 : _a.lastSeen) || null);
            setIsHereNow(false);
            setStatus(exact
                ? translate('feed.awaySince', { time: exact })
                : translate('feed.awayUnknown'));
        };
        refreshStatus();
        var freshnessTimer = setInterval(refreshStatus, 30000);
        var unsubscribeFs = (0, firestore_1.default)().doc("users/".concat(ownerUid)).onSnapshot(function (doc) {
            var data = (doc === null || doc === void 0 ? void 0 : doc.data()) || {};
            firestoreOnline = (data === null || data === void 0 ? void 0 : data.online) === true;
            firestoreLastSeen = (data === null || data === void 0 ? void 0 : data.lastSeen) || fallbackLastSeen;
            firestoreLastActiveAt = (data === null || data === void 0 ? void 0 : data.lastActiveAt) || (data === null || data === void 0 ? void 0 : data.lastHeartbeat) || null;
            refreshStatus();
        });
        var presenceRef = (0, database_1.default)().ref("/presence/".concat(ownerUid));
        var onPresence = presenceRef.on('value', function (snap) {
            var val = snap.val() || {};
            rtdbOnline = (val === null || val === void 0 ? void 0 : val.online) === true;
            rtdbLastSeen = (val === null || val === void 0 ? void 0 : val.lastSeen) || null;
            rtdbLastActiveAt = (val === null || val === void 0 ? void 0 : val.lastActiveAt) || (val === null || val === void 0 ? void 0 : val.lastHeartbeat) || null;
            refreshStatus();
        });
        return function () {
            clearInterval(freshnessTimer);
            unsubscribeFs();
            presenceRef.off('value', onPresence);
        };
    }, [item.ownerUid, myUid, translate, userData]);
    // Calculate play conditions
    var isAnyModalOpen = showMakeWaves || showAudioModal || !!capturedMedia || showLive;
    var shouldPlay = !isPaused && allowPlayback && !isAnyModalOpen;
    var maxBr = isWifi
        ? 1500000
        : Math.min(bridge.dataSaverDefaultOnCell
            ? Math.min(bridge.cellularMaxBitrateH264, bridge.cellularMaxBitrateHEVC)
            : bridge.cellularMaxBitrateH264, 600000);
    var galleryMediaItems = (0, react_1.useMemo)(function () {
        var _a;
        if (Array.isArray(item.mediaItems) && item.mediaItems.length > 0) {
            return item.mediaItems.filter(function (asset) { return !!(asset === null || asset === void 0 ? void 0 : asset.uri); });
        }
        if (Array.isArray(item.galleryItems) && item.galleryItems.length > 0) {
            return item.galleryItems.filter(function (asset) { return !!(asset === null || asset === void 0 ? void 0 : asset.uri); });
        }
        return ((_a = item.media) === null || _a === void 0 ? void 0 : _a.uri) ? [item.media] : [];
    }, [item.media, item.mediaItems, item.galleryItems]);
    var primaryMedia = (galleryMediaItems[0] || item.media || null);
    var mediaUri = String((primaryMedia === null || primaryMedia === void 0 ? void 0 : primaryMedia.uri) || '').trim();
    var mediaType = String((primaryMedia === null || primaryMedia === void 0 ? void 0 : primaryMedia.type) || '').toLowerCase();
    var hasMultiMediaGrid = galleryMediaItems.length > 1;
    (0, react_1.useEffect)(function () {
        var baseSplashes = Math.max(0, Number(((_a = item.counts) === null || _a === void 0 ? void 0 : _a.splashes) || 0));
        var baseEchoes = Math.max(0, Number(((_b = item.counts) === null || _b === void 0 ? void 0 : _b.echoes) || 0));
        var next = {};
        var length = Math.max(1, galleryMediaItems.length);
        for (var i = 0; i < length; i += 1) {
            next[i] = { splashes: i === 0 ? baseSplashes : 0, echoes: i === 0 ? baseEchoes : 0 };
        }
        setMediaActionCounts(next);
        setActiveGridMediaIndex(0);
    }, [item.id, (item.counts || {}).splashes, (item.counts || {}).echoes, galleryMediaItems.length]);
    var selectedMediaIndex = hasMultiMediaGrid
        ? Math.max(0, Math.min(activeGridMediaIndex, Math.max(0, galleryMediaItems.length - 1)))
        : 0;
    var selectedMediaCounts = mediaActionCounts[selectedMediaIndex] || { splashes: 0, echoes: 0 };
    (0, react_1.useEffect)(function () {
        if (!hasMultiMediaGrid)
            return;
        setActiveGridMediaIndex(function (prev) { return (prev === viewerIndex ? prev : viewerIndex); });
    }, [hasMultiMediaGrid, viewerIndex]);
    (0, react_1.useEffect)(function () {
        if (!hasMultiMediaGrid)
            return;
        if (activeGridVideoIndex < 0)
            return;
        setActiveGridMediaIndex(function (prev) { return (prev === activeGridVideoIndex ? prev : activeGridVideoIndex); });
    }, [activeGridVideoIndex, hasMultiMediaGrid]);
    var previewGridItems = galleryMediaItems.slice(0, 6);
    var hiddenGridCount = Math.max(0, galleryMediaItems.length - 6);
    var latestGridVideoIndex = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = __spreadArray([], galleryMediaItems, true).map(function (mediaItem, mediaIndex) { return (isVideoAsset(mediaItem) ? mediaIndex : -1); })
            .filter(function (mediaIndex) { return mediaIndex >= 0; })
            .pop()) !== null && _a !== void 0 ? _a : -1;
    }, [galleryMediaItems, isVideoAsset]);
    var gridVideoCount = (0, react_1.useMemo)(function () { return galleryMediaItems.filter(function (mediaItem) { return isVideoAsset(mediaItem); }).length; }, [galleryMediaItems, isVideoAsset]);
    var explicitPostType = String(item.postType || '').toLowerCase();
    var isExplicitVideo = explicitPostType === 'video';
    var isExplicitImage = explicitPostType === 'image';
    var isExplicitAudio = explicitPostType === 'audio';
    var playbackUri = String(item.playbackUrl || '');
    var playbackLooksVideo = isExplicitVideo ||
        /(\.m3u8|\.mp4|\.mov|\.webm|\.mkv)(\?|$)/i.test(playbackUri.toLowerCase()) ||
        /\/video\//i.test(playbackUri) ||
        mediaType.includes('video/');
    var hasVideoMedia = isExplicitVideo ||
        isVideoAsset(primaryMedia) ||
        (!isExplicitImage && !isImageAsset(primaryMedia) && !!item.playbackUrl && playbackLooksVideo) ||
        (mediaUri.length > 0 && mediaType.startsWith('video/'));
    var hasImageMedia = mediaUri.length > 0 &&
        (isExplicitImage || isImageAsset(primaryMedia) || (!hasVideoMedia && mediaType.startsWith('image/')));
    var audioOnlyPost = (isExplicitAudio ||
        (!item.playbackUrl && !!((_d = item.audio) === null || _d === void 0 ? void 0 : _d.uri) && !hasVideoMedia && !hasImageMedia) ||
        (!item.playbackUrl && !!primaryMedia && isAudioAsset(primaryMedia) && !hasVideoMedia && !hasImageMedia)) &&
        !hasVideoMedia &&
        !hasImageMedia;
    var primaryVideoSource = item.playbackUrl && playbackLooksVideo ? String(item.playbackUrl) : String((primaryMedia === null || primaryMedia === void 0 ? void 0 : primaryMedia.uri) || '');
    var fallbackVideoSource = item.playbackUrl && playbackLooksVideo && (primaryMedia === null || primaryMedia === void 0 ? void 0 : primaryMedia.uri) && primaryMedia.uri !== item.playbackUrl
        ? String(primaryMedia.uri)
        : '';
    var videoSourceUri = (preferFallbackVideoSource ? fallbackVideoSource || primaryVideoSource : primaryVideoSource || fallbackVideoSource) ||
        '';
    // Always honor overlay audio on visual posts so image/video + audio plays as intended.
    var hasOverlayAudio = !!((_e = item.audio) === null || _e === void 0 ? void 0 : _e.uri) && !audioOnlyPost && (hasVideoMedia || hasImageMedia);
    var overlayReady = !hasOverlayAudio || overlayAudioLoaded;
    var audioPlaySynced = shouldPlay && item.id === activeVideoId && overlayReady;
    var videoPlaySynced = shouldPlay &&
        item.id === activeVideoId &&
        (!hasOverlayAudio || !hasVideoMedia || overlayAudioStarted);
    var shouldPreload = preloadedVideoIds.has(item.id);
    var near = Math.abs(index - currentIndex) <= 1;
    var isGridPostInFocus = shouldPlay && index === currentIndex;
    var hasUnknownMediaFile = !!primaryMedia && mediaUri.length > 0 && !hasVideoMedia && !hasImageMedia && !audioOnlyPost;
    var hasRenderableMedia = hasVideoMedia || audioOnlyPost || hasImageMedia || hasUnknownMediaFile;
    var textOnlyStory = !primaryMedia && !item.image && !((_f = item.audio) === null || _f === void 0 ? void 0 : _f.uri);
    var mediaEdits = item.mediaEdits || null;
    var fallbackAwayText = (function () {
        var _a;
        var exact = (0, timeUtils_1.formatPresenceLastSeenExact)(((_a = userData[item.ownerUid || '']) === null || _a === void 0 ? void 0 : _a.lastSeen) || null);
        return exact
            ? translate('feed.awaySince', { time: exact })
            : translate('feed.awayUnknown');
    })();
    var storyTheme = (0, react_1.useMemo)(function () {
        var seed = String(item.id || '')
            .split('')
            .reduce(function (sum, ch) { return sum + ch.charCodeAt(0); }, 0);
        return STORY_THEMES[seed % STORY_THEMES.length];
    }, [item.id]);
    (0, react_1.useEffect)(function () {
        setActiveGridVideoIndex(latestGridVideoIndex);
    }, [item.id, latestGridVideoIndex]);
    var filterOverlayStyle = (function () {
        var f = (mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.filter) || 'none';
        if (f === 'warm')
            return { backgroundColor: 'rgba(255,155,84,0.20)' };
        if (f === 'cool')
            return { backgroundColor: 'rgba(90,170,255,0.18)' };
        if (f === 'mono')
            return { backgroundColor: 'rgba(0,0,0,0.30)' };
        if (f === 'vivid')
            return { backgroundColor: 'rgba(255,0,120,0.10)' };
        return null;
    })();
    var brightnessOverlayStyle = mediaEdits && Number(mediaEdits.brightness || 0) !== 0
        ? {
            backgroundColor: Number(mediaEdits.brightness) > 0
                ? "rgba(255,255,255,".concat(Math.min(0.4, Number(mediaEdits.brightness) / 100), ")")
                : "rgba(0,0,0,".concat(Math.min(0.45, Math.abs(Number(mediaEdits.brightness)) / 90), ")"),
        }
        : null;
    var contrastOverlayStyle = mediaEdits && Number(mediaEdits.contrast || 0) !== 0
        ? {
            backgroundColor: Number(mediaEdits.contrast) > 0
                ? "rgba(255,255,255,".concat(Math.min(0.22, Number(mediaEdits.contrast) / 260), ")")
                : "rgba(0,0,0,".concat(Math.min(0.28, Math.abs(Number(mediaEdits.contrast)) / 220), ")"),
        }
        : null;
    var vignetteOverlayStyle = mediaEdits && Number(mediaEdits.vignette || 0) > 0
        ? {
            backgroundColor: "rgba(0,0,0,".concat(Math.min(0.34, Number(mediaEdits.vignette) / 180), ")"),
        }
        : null;
    var textOverlay = mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.textOverlay;
    var buildFeedTextOverlay = (0, react_1.useCallback)(function (overlay, frameWidth, frameHeight) {
        var _a, _b, _c, _d, _e, _f, _g;
        var presetStyle = (0, MediaEditor_1.getTextOverlayPresetStyle)(overlay || undefined);
        var overlayWidth = Math.max(96, Math.min(frameWidth * 0.8, frameWidth - 16));
        return {
            containerStyle: {
                position: 'absolute',
                left: Math.max(8, Math.min(frameWidth - overlayWidth - 8, Number((_a = overlay === null || overlay === void 0 ? void 0 : overlay.x) !== null && _a !== void 0 ? _a : 0.5) * frameWidth - overlayWidth / 2)),
                top: Math.max(8, Math.min(frameHeight - 56, Number((_b = overlay === null || overlay === void 0 ? void 0 : overlay.y) !== null && _b !== void 0 ? _b : 0.72) * frameHeight - ((overlay === null || overlay === void 0 ? void 0 : overlay.fontSize) || 28))),
                width: overlayWidth,
                alignItems: 'center',
                paddingHorizontal: (_c = overlay === null || overlay === void 0 ? void 0 : overlay.paddingHorizontal) !== null && _c !== void 0 ? _c : presetStyle.paddingHorizontal,
                paddingVertical: (_d = overlay === null || overlay === void 0 ? void 0 : overlay.paddingVertical) !== null && _d !== void 0 ? _d : presetStyle.paddingVertical,
                borderRadius: (_e = overlay === null || overlay === void 0 ? void 0 : overlay.borderRadius) !== null && _e !== void 0 ? _e : presetStyle.borderRadius,
                backgroundColor: (_g = (_f = overlay === null || overlay === void 0 ? void 0 : overlay.backgroundColor) !== null && _f !== void 0 ? _f : presetStyle.backgroundColor) !== null && _g !== void 0 ? _g : 'transparent',
            },
            textStyle: {
                color: (overlay === null || overlay === void 0 ? void 0 : overlay.color) || presetStyle.textColor,
                fontSize: (overlay === null || overlay === void 0 ? void 0 : overlay.fontSize) || 28,
                fontWeight: (overlay === null || overlay === void 0 ? void 0 : overlay.fontWeight) || '800',
                textAlign: (overlay === null || overlay === void 0 ? void 0 : overlay.textAlign) || 'center',
                lineHeight: Math.round(((overlay === null || overlay === void 0 ? void 0 : overlay.fontSize) || 28) * 1.18),
                transform: [{ rotate: "".concat(Number((overlay === null || overlay === void 0 ? void 0 : overlay.rotation) || 0), "deg") }],
                textShadowColor: typeof (overlay === null || overlay === void 0 ? void 0 : overlay.shadow) === 'boolean'
                    ? overlay.shadow
                        ? 'rgba(0,0,0,0.45)'
                        : 'transparent'
                    : presetStyle.shadow
                        ? 'rgba(0,0,0,0.45)'
                        : 'transparent',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: typeof (overlay === null || overlay === void 0 ? void 0 : overlay.shadow) === 'boolean'
                    ? overlay.shadow
                        ? 10
                        : 0
                    : presetStyle.shadow
                        ? 10
                        : 0,
            },
        };
    }, []);
    var handleProfilePress = (0, react_1.useCallback)(function () {
        var _a;
        if (!item.ownerUid)
            return;
        if (item.ownerUid === myUid) {
            navigation.navigate('Profile');
        }
        else {
            onOpenCreatorProfile(item.ownerUid, item.authorName || ((_a = item.user) === null || _a === void 0 ? void 0 : _a.name) || null);
        }
    }, [item.authorName, item.ownerUid, (_g = item.user) === null || _g === void 0 ? void 0 : _g.name, myUid, navigation, onOpenCreatorProfile]);
    var handleAvatarPress = (0, react_1.useCallback)(function () {
        handleProfilePress();
    }, [handleProfilePress]);
    var handleAvatarLongPress = (0, react_1.useCallback)(function () {
        var _a, _b;
        var avatarUri = (item.ownerUid ? (_a = userData[item.ownerUid]) === null || _a === void 0 ? void 0 : _a.avatar : null) ||
            ((_b = item.user) === null || _b === void 0 ? void 0 : _b.avatar) ||
            null;
        if (avatarUri) {
            onOpenProfilePicture(avatarUri);
        }
    }, [item.ownerUid, (_h = item.user) === null || _h === void 0 ? void 0 : _h.avatar, onOpenProfilePicture, userData]);
    var normalizeHandleLabel = (0, react_1.useCallback)(function (raw) {
        var cleaned = String(raw || '').trim().replace(/^[@/]+/, '');
        return cleaned ? displayHandle(item.ownerUid, cleaned) : '@User';
    }, [displayHandle, item.ownerUid]);
    var handleOnlineUserPress = (0, react_1.useCallback)(function (user) {
        setSelectedUserId(user.uid);
        setShowProfilePreview(true);
    }, []);
    var handleChatWithUser = (0, react_1.useCallback)(function (userId, userName) { return __awaiter(void 0, void 0, void 0, function () {
        var userRef, snapshot, userData_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userRef = (0, database_1.default)().ref("/users/".concat(userId));
                    return [4 /*yield*/, userRef.once('value')];
                case 1:
                    snapshot = _a.sent();
                    userData_1 = snapshot.val();
                    // Navigate to inbox with this user's thread
                    // This will be handled by the parent component (App.tsx)
                    // For now, we'll just log it
                    console.log('Opening chat with:', userId, userName);
                    // You'll need to pass a callback from App.tsx to handle this
                    // For now, let's just show an alert
                    react_native_1.Alert.alert('Chat', "Opening chat with ".concat(userName));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.log('Error opening chat:', error_1);
                    react_native_1.Alert.alert(translate('feed.openChatFailedTitle'), translate('feed.openChatFailedBody'));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [translate]);
    // Ensure user data is fetched for the post owner
    (0, react_1.useEffect)(function () {
        if (item.ownerUid && !userData[item.ownerUid]) {
            ensureUserData(item.ownerUid);
        }
    }, [item.ownerUid, userData, ensureUserData]);
    var handleReadMore = (0, react_1.useCallback)(function () {
        setExpandedPosts(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = !prev[item.id], _a)));
        });
    }, [item.id, setExpandedPosts]);
    var handleImageReveal = (0, react_1.useCallback)(function () {
        if (!hasImageMedia)
            return;
        if (!revealedImages.has(item.id)) {
            setRevealedImages(function (prev) { return new Set(prev).add(item.id); });
            recordImageReach(item.id).catch(function (error) {
                console.log('Image reach recording failed:', error.message);
            });
        }
    }, [hasImageMedia, item.id, revealedImages, setRevealedImages, recordImageReach]);
    var openMediaViewer = (0, react_1.useCallback)(function (startIndex) {
        setViewerIndex(Math.max(0, Math.min(startIndex, galleryMediaItems.length - 1)));
        setViewerZoom(1);
        setViewerVisible(true);
    }, [galleryMediaItems.length]);
    var handleTextPostPress = (0, react_1.useCallback)(function () {
        setPreservedScrollPosition(currentIndex);
        navigation.navigate('PostDetail', { post: item });
    }, [currentIndex, item, navigation, setPreservedScrollPosition]);
    var handleLinkPress = (0, react_1.useCallback)(function () {
        if (item.link) {
            react_native_1.Linking.openURL(item.link).catch(function (err) { return console.log('Failed to open link:', err); });
        }
    }, [item.link]);
    var handleAddSplash = (0, react_1.useCallback)(function () {
        setLastSplashAction('add');
        setSplashSyncStatus('saving');
        // IMMEDIATE UI UPDATE - no delay
        var updateFeeds = function (feed) {
            return feed.map(function (v) { var _a; return v.id === item.id ? __assign(__assign({}, v), { counts: __assign(__assign({}, v.counts), { splashes: (((_a = v.counts) === null || _a === void 0 ? void 0 : _a.splashes) || 0) + 1 }) }) : v; });
        };
        setWavesFeed(updateFeeds);
        setVibesFeed(updateFeeds);
        setPublicFeed(updateFeeds);
        setPostFeed(updateFeeds);
        // Database operation in background
        ensureSplash(item.id)
            .then(function () {
            setSplashSyncStatus('idle');
        })
            .catch(function (error) {
            console.error('Error adding splash:', error);
            // Revert UI on error
            var revertFeeds = function (feed) {
                return feed.map(function (v) { var _a; return v.id === item.id ? __assign(__assign({}, v), { counts: __assign(__assign({}, v.counts), { splashes: Math.max(0, (((_a = v.counts) === null || _a === void 0 ? void 0 : _a.splashes) || 0) - 1) }) }) : v; });
            };
            setWavesFeed(revertFeeds);
            setVibesFeed(revertFeeds);
            setPublicFeed(revertFeeds);
            setPostFeed(revertFeeds);
            setSplashSyncStatus('error');
        });
    }, [item.id, ensureSplash, setWavesFeed, setVibesFeed, setPublicFeed, setPostFeed]);
    var handleRemoveSplash = (0, react_1.useCallback)(function () {
        setLastSplashAction('remove');
        setSplashSyncStatus('saving');
        // IMMEDIATE UI UPDATE - no delay
        var updateFeeds = function (feed) {
            return feed.map(function (v) { var _a; return v.id === item.id ? __assign(__assign({}, v), { counts: __assign(__assign({}, v.counts), { splashes: Math.max(0, (((_a = v.counts) === null || _a === void 0 ? void 0 : _a.splashes) || 0) - 1) }) }) : v; });
        };
        setWavesFeed(updateFeeds);
        setVibesFeed(updateFeeds);
        setPublicFeed(updateFeeds);
        setPostFeed(updateFeeds);
        // Database operation in background
        removeSplash(item.id)
            .then(function () {
            setSplashSyncStatus('idle');
        })
            .catch(function (error) {
            console.error('Error removing splash:', error);
            // Revert UI on error
            var revertFeeds = function (feed) {
                return feed.map(function (v) { var _a; return v.id === item.id ? __assign(__assign({}, v), { counts: __assign(__assign({}, v.counts), { splashes: (((_a = v.counts) === null || _a === void 0 ? void 0 : _a.splashes) || 0) + 1 }) }) : v; });
            };
            setWavesFeed(revertFeeds);
            setVibesFeed(revertFeeds);
            setPublicFeed(revertFeeds);
            setPostFeed(revertFeeds);
            setSplashSyncStatus('error');
        });
    }, [item.id, removeSplash, setWavesFeed, setVibesFeed, setPublicFeed, setPostFeed]);
    var handleRetrySplashSync = (0, react_1.useCallback)(function () {
        if (lastSplashAction === 'add') {
            handleAddSplash();
        }
        else if (lastSplashAction === 'remove') {
            handleRemoveSplash();
        }
    }, [lastSplashAction, handleAddSplash, handleRemoveSplash]);
    var handleEcho = (0, react_1.useCallback)(function () {
        setEchoWaveId(item.id);
        setCurrentIndex(index);
        setShowEchoes(true);
    }, [item.id, index, setEchoWaveId, setCurrentIndex, setShowEchoes]);
    var handleAddSplashForSelectedMedia = (0, react_1.useCallback)(function () {
        setMediaActionCounts(function (prev) {
            var _a;
            var current = prev[selectedMediaIndex] || { splashes: 0, echoes: 0 };
            return __assign(__assign({}, prev), (_a = {}, _a[selectedMediaIndex] = { splashes: current.splashes + 1, echoes: current.echoes }, _a));
        });
        handleAddSplash();
    }, [handleAddSplash, selectedMediaIndex]);
    var handleRemoveSplashForSelectedMedia = (0, react_1.useCallback)(function () {
        setMediaActionCounts(function (prev) {
            var _a;
            var current = prev[selectedMediaIndex] || { splashes: 0, echoes: 0 };
            return __assign(__assign({}, prev), (_a = {}, _a[selectedMediaIndex] = { splashes: Math.max(0, current.splashes - 1), echoes: current.echoes }, _a));
        });
        handleRemoveSplash();
    }, [handleRemoveSplash, selectedMediaIndex]);
    var handleEchoForSelectedMedia = (0, react_1.useCallback)(function () {
        setMediaActionCounts(function (prev) {
            var _a;
            var current = prev[selectedMediaIndex] || { splashes: 0, echoes: 0 };
            return __assign(__assign({}, prev), (_a = {}, _a[selectedMediaIndex] = { splashes: current.splashes, echoes: current.echoes + 1 }, _a));
        });
        handleEcho();
    }, [handleEcho, selectedMediaIndex]);
    var handlePearl = (0, react_1.useCallback)(function () {
        setShowPearls(true);
    }, [setShowPearls]);
    var handleAnchor = (0, react_1.useCallback)(function () {
        anchorWave(item);
    }, [item, anchorWave]);
    var handleCast = (0, react_1.useCallback)(function () {
        onShareWave(item);
    }, [item, onShareWave]);
    var handleReachPress = (0, react_1.useCallback)(function () {
        recordVideoReach(item.id).catch(function (error) {
            console.log('Reach recording failed:', error.message);
        });
    }, [item.id, recordVideoReach]);
    var handleEchoToggle = (0, react_1.useCallback)(function () {
        if (echoExpansionInProgress[item.id])
            return;
        setEchoExpansionInProgress(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = true, _a)));
        });
        setExpandedEchoes(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = !prev[item.id], _a)));
        });
        setTimeout(function () {
            setEchoExpansionInProgress(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = false, _a)));
            });
        }, 300);
    }, [item.id, echoExpansionInProgress, setEchoExpansionInProgress, setExpandedEchoes]);
    var handleLoadMoreEchoes = (0, react_1.useCallback)(function () {
        if (echoExpansionInProgress[item.id])
            return;
        setEchoExpansionInProgress(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = true, _a)));
        });
        setEchoesPageSize(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = (prev[item.id] || 5) + 5, _a)));
        });
        setTimeout(function () {
            setEchoExpansionInProgress(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), (_a = {}, _a[item.id] = false, _a)));
            });
        }, 200);
    }, [item.id, echoExpansionInProgress, setEchoExpansionInProgress, setEchoesPageSize]);
    var getEchoHugState = (0, react_1.useCallback)(function (echo) {
        var local = (echo === null || echo === void 0 ? void 0 : echo.id) ? localEchoHugs[echo.id] : null;
        if (local) {
            return { hugs: Math.max(0, local.hugs), hugged: !!local.hugged };
        }
        var hugs = Math.max(0, Number((echo === null || echo === void 0 ? void 0 : echo.hugs) || 0));
        var hugged = !!(myUid && (echo === null || echo === void 0 ? void 0 : echo.huggedBy) && echo.huggedBy[myUid]);
        return { hugs: hugs, hugged: hugged };
    }, [localEchoHugs, myUid]);
    var toggleEchoHug = (0, react_1.useCallback)(function (echo) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, hugs, hugged, nextHugs, ref, FieldValue, e_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(echo === null || echo === void 0 ? void 0 : echo.id) || !myUid)
                        return [2 /*return*/];
                    _a = getEchoHugState(echo), hugs = _a.hugs, hugged = _a.hugged;
                    nextHugs = Math.max(0, hugs + (hugged ? -1 : 1));
                    setLocalEchoHugs(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[echo.id] = { hugs: nextHugs, hugged: !hugged }, _a)));
                    });
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, , 7]);
                    ref = (0, firestore_1.default)()
                        .collection("waves/".concat(item.id, "/echoes"))
                        .doc(echo.id);
                    FieldValue = firestore_1.default.FieldValue;
                    if (!hugged) return [3 /*break*/, 3];
                    return [4 /*yield*/, ref.update((_b = {
                                hugs: FieldValue.increment(-1)
                            },
                            _b["huggedBy.".concat(myUid)] = FieldValue.delete(),
                            _b))];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, ref.set({
                        hugs: FieldValue.increment(1),
                        huggedBy: (_c = {}, _c[myUid] = true, _c),
                    }, { merge: true })];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    console.log('Hug state persisted successfully');
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _d.sent();
                    console.log('Hug persistence error:', e_1);
                    // Revert UI on error
                    setLocalEchoHugs(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[echo.id] = { hugs: hugs, hugged: hugged }, _a)));
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, [getEchoHugState, item.id, myUid]);
    var handleEchoReply = (0, react_1.useCallback)(function (echo) {
        onReplyToEcho(item.id, echo);
    }, [item.id, onReplyToEcho]);
    // Fetch replies for a specific echo
    var fetchRepliesForEcho = (0, react_1.useCallback)(function (echoId) { return __awaiter(void 0, void 0, void 0, function () {
        var repliesSnap, replies_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, firestore_1.default)()
                            .collection("waves/".concat(item.id, "/echoes"))
                            .where('replyToEchoId', '==', echoId)
                            .orderBy('createdAt', 'desc')
                            .get()];
                case 1:
                    repliesSnap = _a.sent();
                    replies_1 = repliesSnap.docs.map(function (doc) { return (__assign(__assign({ id: doc.id }, doc.data()), { uid: doc.data().userUid })); });
                    setEchoReplies(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[echoId] = replies_1, _a)));
                    });
                    // Set most recent reply as preview
                    if (replies_1.length > 0) {
                        setReplyPreviews(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[echoId] = replies_1[0], _a)));
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.log('Error fetching replies:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [item.id]);
    // Toggle replies expansion
    var toggleReplies = (0, react_1.useCallback)(function (echoId) {
        setExpandedReplies(function (prev) {
            var _a;
            var isExpanding = !prev[echoId];
            if (isExpanding && !echoReplies[echoId]) {
                fetchRepliesForEcho(echoId);
            }
            return __assign(__assign({}, prev), (_a = {}, _a[echoId] = isExpanding, _a));
        });
    }, [echoReplies, fetchRepliesForEcho]);
    // Fetch reply previews for all echoes
    (0, react_1.useEffect)(function () {
        var echoes = postEchoLists[item.id] || [];
        echoes.forEach(function (echo) {
            if (echo.replyCount > 0 && !replyPreviews[echo.id]) {
                fetchRepliesForEcho(echo.id);
            }
        });
    }, [postEchoLists, item.id, replyPreviews, fetchRepliesForEcho]);
    var renderEchoItem = (0, react_1.useCallback)(function (echo, idx) {
        var _a = getEchoHugState(echo), hugs = _a.hugs, hugged = _a.hugged;
        var showActions = activeEchoActionId === echo.id;
        var replies = echoReplies[echo.id] || [];
        var hasReplies = (echo.replyCount || 0) > 0;
        var isExpanded = expandedReplies[echo.id];
        var replyCountLabel = "".concat(translate('feed.replyAction'), "(").concat(echo.replyCount || 0, ")");
        var hugCountLabel = "".concat(translate('feed.hugAction'), "(").concat(hugs, ")");
        return (<react_native_1.View key={echo.id || idx} style={{
                marginBottom: 8,
                padding: 8,
                backgroundColor: 'rgba(255,235,59,0.95)',
                borderRadius: 8,
            }}>
        <react_native_1.Pressable onPress={function () {
                var nextIsActive = activeEchoActionId !== echo.id;
                setActiveEchoActionId(function (prev) { return (prev === echo.id ? null : echo.id); });
                if (hasReplies && nextIsActive) {
                    setExpandedReplies(function (prev) {
                        var _a;
                        var isExpanding = !prev[echo.id];
                        if (isExpanding && !echoReplies[echo.id]) {
                            fetchRepliesForEcho(echo.id);
                        }
                        return __assign(__assign({}, prev), (_a = {}, _a[echo.id] = isExpanding, _a));
                    });
                }
                else if (hasReplies && !nextIsActive) {
                    setExpandedReplies(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[echo.id] = false, _a)));
                    });
                }
            }}>
          <react_native_1.Text style={{ color: 'black', fontSize: 12, fontWeight: '600', marginBottom: 2 }}>
            {displayHandle(echo.uid, echo.userName || echo.uid)}
          </react_native_1.Text>
          <react_native_1.Text style={{ color: 'black', fontSize: 14 }}>
            {echo.text}
          </react_native_1.Text>
          <react_native_1.Text style={{ color: 'gray', fontSize: 10 }}>
            {echo.createdAt ? formatDefiniteTime(echo.createdAt) : translate('feed.justNow')}
          </react_native_1.Text>
        </react_native_1.Pressable>

        {/* Expanded Replies */}
        {isExpanded && replies.length > 0 && (<react_native_1.View style={{ marginTop: 8, marginLeft: 16, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 10, paddingVertical: 8, paddingRight: 10 }}>
            {replies.map(function (reply, replyIdx) { return (<react_native_1.View key={reply.id || replyIdx} style={{
                        marginBottom: 6,
                        paddingLeft: 12,
                        borderLeftWidth: 2,
                        borderLeftColor: '#1e88e5',
                    }}>
                <react_native_1.Text style={{ color: '#555', fontSize: 11, fontWeight: '600' }}>
                  {displayHandle(reply.uid, reply.userName || reply.uid)}
                </react_native_1.Text>
                <react_native_1.Text style={{ color: '#666', fontSize: 12 }}>
                  {reply.text}
                </react_native_1.Text>
                <react_native_1.Text style={{ color: 'gray', fontSize: 9 }}>
                  {reply.createdAt ? formatDefiniteTime(reply.createdAt) : translate('feed.justNow')}
                </react_native_1.Text>
              </react_native_1.View>); })}
          </react_native_1.View>)}

        {showActions && (<react_native_1.View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <react_native_1.Pressable onPress={function () { return toggleEchoHug(echo); }} style={{
                    backgroundColor: 'rgba(255,235,59,0.95)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                }}>
              <react_native_1.Text style={{ fontSize: 12, fontWeight: '700', color: hugged ? '#1e88e5' : '#d32f2f' }}>
                {hugCountLabel}
              </react_native_1.Text>
            </react_native_1.Pressable>
            <react_native_1.Pressable onPress={function () { return handleEchoReply(echo); }} style={{
                    backgroundColor: 'rgba(255,235,59,0.95)',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                }}>
              <react_native_1.Text style={{ fontSize: 12, fontWeight: '700', color: '#1e88e5' }}>
                {replyCountLabel}
              </react_native_1.Text>
            </react_native_1.Pressable>
          </react_native_1.View>)}
      </react_native_1.View>);
    }, [activeEchoActionId, displayHandle, echoReplies, expandedReplies, fetchRepliesForEcho, formatDefiniteTime, getEchoHugState, handleEchoReply, toggleEchoHug, translate]);
    return (<react_native_1.Pressable>
      <react_native_1.View style={styles.feedCard}>
        {/* Online Users List - Only show on video posts */}
        {hasVideoMedia && (<OnlineUsersList_1.default myUid={myUid} onUserPress={handleOnlineUserPress}/>)}

        {/* Profile Preview Modal */}
        <ProfilePreviewModal_1.default visible={showProfilePreview} userId={selectedUserId} onClose={function () { return setShowProfilePreview(false); }} onChat={handleChatWithUser}/>
        <react_native_1.View style={styles.postBody}>
          {/* Post Header */}
          <react_native_1.View style={styles.postHeader}>
            {/* Menu button positioned absolutely in top-right */}
            <react_native_1.View pointerEvents="box-none" style={styles.menuButtonWrap}>
              <react_native_1.Pressable onPress={function () { return openWaveOptions(item); }} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.iconPress,
                pressed && styles.iconPressActive,
            ];
        }} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} delayPressIn={0} delayPressOut={0}>
                <react_native_1.Text style={styles.menuIcon}>⋮</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.View>

            {/* Centered Profile Info */}
            <react_native_1.Pressable style={styles.centeredHeader} onPress={handleProfilePress} hitSlop={{ top: 14, bottom: 14, left: 18, right: 18 }} android_ripple={{ color: 'rgba(255, 255, 255, 0.14)', borderless: false }}>
              <react_native_1.View style={styles.headerTopRow}>
                {item.ownerUid === myUid ? (<react_native_1.View style={styles.sideButtonRail}><react_native_1.Pressable onPress={onOpenFleetDeck} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    {
                        backgroundColor: '#00C2FF',
                        borderRadius: 18,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        marginRight: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 44,
                        position: 'relative',
                    },
                    pressed && { opacity: 0.7 },
                ];
            }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <react_native_1.Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Fleet Deck</react_native_1.Text>
                    {fleetDeckBadgeCount > 0 ? (<react_native_1.View style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    paddingHorizontal: 5,
                    backgroundColor: '#FFD54A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(8, 51, 88, 0.22)',
                }}>
                        <react_native_1.Text style={{ color: '#111827', fontWeight: '900', fontSize: 10 }}>
                          {fleetDeckBadgeCount > 99 ? '99+' : fleetDeckBadgeCount}
                        </react_native_1.Text>
                      </react_native_1.View>) : null}
                  </react_native_1.Pressable></react_native_1.View>) : null}
                {/* Connect/Disconnect Button */}
                {item.ownerUid !== myUid && (<react_native_1.View style={styles.sideButtonRail}><react_native_1.Pressable onPress={function () { var _a; return handleToggleVibe(item.ownerUid, item.authorName || ((_a = item.user) === null || _a === void 0 ? void 0 : _a.name)); }} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.joinButton,
                    isInUserCrew[item.ownerUid] ? styles.joinButtonLeave : styles.joinButtonJoin,
                    pressed && styles.buttonPressed,
                ];
            }} hitSlop={{ top: 30, bottom: 30, left: 20, right: 20 }} delayPressIn={0} delayPressOut={0} activeOpacity={0.7} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
                    <react_native_1.Text style={styles.joinButtonText}>
                      {isInUserCrew[item.ownerUid]
                ? translate('feed.leaveTide')
                : translate('feed.joinTide')}
                    </react_native_1.Text>
                  </react_native_1.Pressable></react_native_1.View>)}

                <react_native_1.View style={styles.profileColumn}>
                <react_native_1.Pressable onPress={handleProfilePress} onLongPress={handleAvatarLongPress} delayLongPress={320} style={styles.avatarRail} hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }} delayPressIn={0} delayPressOut={0} android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}>
                  <ProfileAvatarWithCrew_1.default key={item.ownerUid} userId={item.ownerUid} size={50} showCrewCount={true} showFleetCount={false} optimisticCrewCount={optimisticCrewCounts[item.ownerUid]}/>
                </react_native_1.Pressable>
                <react_native_1.View style={styles.profileTextWrap}>
                  <react_native_1.Text style={{
            fontWeight: '700',
            fontSize: ui.type.title,
            color: ui.colors.heading,
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 2
        }}>
                {(function () {
            var isCurrentUserPost = item.ownerUid === myUid;
            if (isCurrentUserPost) {
                return normalizeHandleLabel(profileName || 'User');
            }
            var userInfo = userData[item.ownerUid];
            var displayName = (userInfo === null || userInfo === void 0 ? void 0 : userInfo.name) || item.authorName || 'User';
            return normalizeHandleLabel(displayName);
        })()}
                  </react_native_1.Text>
              {(function () {
            var _a;
            var isCurrentUserPost = item.ownerUid === myUid;
            var titleToShow = isCurrentUserPost
                ? profileMinuteFameTitle
                : (_a = userData[item.ownerUid]) === null || _a === void 0 ? void 0 : _a.minuteFameTitle;
            var rawTitle = String(titleToShow || '').trim().toLowerCase();
            var badgeToShow = rawTitle === 'fresh_face' || rawTitle.includes('fresh face')
                ? '✨'
                : rawTitle === 'rising_star' || rawTitle.includes('rising star')
                    ? '⭐'
                    : rawTitle === 'crowd_favorite' || rawTitle.includes('crowd favorite')
                        ? '🔥'
                        : rawTitle === 'wave_king' || rawTitle.includes('wave king')
                            ? '👑'
                            : rawTitle === 'trend_storm' || rawTitle.includes('trend storm')
                                ? '⚡'
                                : rawTitle === 'ocean_legend' || rawTitle.includes('ocean legend')
                                    ? '🦈'
                                    : String(titleToShow || '').trim().split(/\s+/)[0] || '';
            return badgeToShow ? (<react_native_1.Text style={{
                    color: '#FFFFFF',
                    fontSize: 17,
                    fontWeight: '900',
                    marginBottom: 4,
                }}>
                    {badgeToShow}
                  </react_native_1.Text>) : null;
        })()}
              {(function () {
            var _a;
            var isCurrentUserPost = item.ownerUid === myUid;
            var bioToShow = isCurrentUserPost ? profileBio : (_a = userData[item.ownerUid]) === null || _a === void 0 ? void 0 : _a.bio;
            return bioToShow ? (<react_native_1.View style={{ marginTop: 2 }}>
                    <react_native_1.Text style={{
                    color: ui.colors.subtle,
                    fontSize: ui.type.caption,
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                      {bioToShow}
                    </react_native_1.Text>
                  </react_native_1.View>) : null;
        })()}
              <react_native_1.Text style={{
            color: ui.colors.subtle,
            fontSize: ui.type.caption,
            textAlign: 'center'
        }}>
                {formatDefiniteTime(((_j = waveStats[item.id]) === null || _j === void 0 ? void 0 : _j.createdAt) || item.createdAt || null)}
              </react_native_1.Text>
                </react_native_1.View>
                </react_native_1.View>
              </react_native_1.View>
            </react_native_1.Pressable>
          </react_native_1.View>

          {/* Post Content - Text or Media */}
          {hasRenderableMedia ? (<>
              {/* Post Text (if any) */}
              {item.captionText && (<react_native_1.View style={styles.captionWrap}>
                  <ClickableTextWithLinks_1.default text={expandedPosts[item.id]
                    ? item.captionText
                    : item.captionText.length > 500
                        ? item.captionText.substring(0, 500) + '...'
                        : item.captionText} style={styles.captionText}/>
                </react_native_1.View>)}

              {/* Post Link (if any) */}
              {item.link && (<react_native_1.View style={styles.linkWrap}>
                  <react_native_1.Pressable onPress={handleLinkPress} style={function (_a) {
                var pressed = _a.pressed;
                return [styles.linkPill, pressed && styles.buttonPressed];
            }}>
                    <react_native_1.Text style={styles.linkText}>
                      {item.link}
                    </react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>)}

              {/* Post Media */}
              {hasMultiMediaGrid ? (<react_native_1.View style={{ marginHorizontal: 0, width: SCREEN_WIDTH, backgroundColor: '#000', paddingHorizontal: 4, paddingVertical: 4 }}>
                  <react_native_1.View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {previewGridItems.map(function (mediaItem, mediaIndex) {
                    var _a, _b, _c;
                    var isImage = isImageAsset(mediaItem);
                    var isVideo = isVideoAsset(mediaItem);
                    var isLastVisibleTile = mediaIndex === previewGridItems.length - 1 && hiddenGridCount > 0;
                    var tileOverlay = ((_a = mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.mediaTextOverlays) === null || _a === void 0 ? void 0 : _a[mediaIndex]) || null;
                    var tileOverlayRender = ((_b = tileOverlay === null || tileOverlay === void 0 ? void 0 : tileOverlay.text) === null || _b === void 0 ? void 0 : _b.trim())
                        ? buildFeedTextOverlay(tileOverlay, SCREEN_WIDTH / 2 - 10, SCREEN_WIDTH / 2 - 10)
                        : null;
                    return (<react_native_1.View key={"".concat(mediaItem.uri || 'media', "_").concat(mediaIndex)} style={{
                            width: '50%',
                            flexBasis: '50%',
                            maxWidth: '50%',
                            padding: 2,
                        }}>
                          <react_native_1.View style={{
                            width: '100%',
                            aspectRatio: 1,
                            backgroundColor: '#111',
                            borderRadius: 10,
                            overflow: 'hidden',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {renderMoMoBadge()}
                            {isImage ? (<react_native_1.Pressable onPress={function () { return openMediaViewer(mediaIndex); }} style={{ width: '100%', height: '100%' }}>
                                <react_native_1.Image source={{ uri: String(mediaItem.uri) }} style={{ width: '100%', height: '100%' }} resizeMode="cover"/>
                              </react_native_1.Pressable>) : isVideo ? (<VideoWithTapControls_1.default source={{ uri: String(mediaItem.uri) }} style={{ width: '100%', height: '100%' }} resizeMode="cover" paused={!(isGridPostInFocus && activeGridVideoIndex === mediaIndex)} isActive={isGridPostInFocus && activeGridVideoIndex === mediaIndex} shouldPreload={near || mediaIndex === latestGridVideoIndex} hideTimeout={4000} muted={activeGridVideoIndex !== mediaIndex} onTap={function () { return setActiveGridVideoIndex(mediaIndex); }}/>) : (<react_native_1.Pressable onPress={function () { return openMediaViewer(mediaIndex); }} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                                <react_native_1.Text style={{ fontSize: 28, color: '#fff' }}>File</react_native_1.Text>
                                <react_native_1.Text style={{ color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center' }} numberOfLines={2}>
                                  {mediaItem.fileName || "Item ".concat(mediaIndex + 1)}
                                </react_native_1.Text>
                              </react_native_1.Pressable>)}
                            {isLastVisibleTile ? (<react_native_1.View style={__assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { backgroundColor: 'rgba(0,0,0,0.56)', alignItems: 'center', justifyContent: 'center' })}>
                                <react_native_1.Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>+{hiddenGridCount}</react_native_1.Text>
                              </react_native_1.View>) : null}
                            {mediaIndex === 0 && galleryMediaItems.length > 1 ? (<react_native_1.View style={{
                                position: 'absolute',
                                left: 8,
                                bottom: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 999,
                                backgroundColor: 'rgba(0,0,0,0.52)',
                            }}>
                                <react_native_1.Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                                  {galleryMediaItems.length} media{gridVideoCount > 0 ? " \u2022 ".concat(gridVideoCount, " video").concat(gridVideoCount > 1 ? 's' : '') : ''}
                                </react_native_1.Text>
                              </react_native_1.View>) : null}
                            {isVideo && mediaIndex !== activeGridVideoIndex ? (<react_native_1.Pressable onPress={function () { return setActiveGridVideoIndex(mediaIndex); }} style={{
                                position: 'absolute',
                                right: 8,
                                bottom: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 999,
                                backgroundColor: 'rgba(3,7,18,0.64)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.14)',
                            }}>
                                <react_native_1.Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Play</react_native_1.Text>
                              </react_native_1.Pressable>) : null}
                            {isVideo && mediaIndex === activeGridVideoIndex ? (<react_native_1.View style={{
                                position: 'absolute',
                                left: 8,
                                top: 8,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 999,
                                backgroundColor: isGridPostInFocus ? 'rgba(14,165,233,0.88)' : 'rgba(15,23,42,0.82)',
                            }}>
                                <react_native_1.Text style={{ color: isGridPostInFocus ? '#082f49' : '#e2e8f0', fontSize: 10, fontWeight: '900' }}>
                                  {isGridPostInFocus ? 'Playing' : 'Ready'}
                                </react_native_1.Text>
                              </react_native_1.View>) : null}
                            {tileOverlayRender ? (<react_native_1.View pointerEvents="none" style={tileOverlayRender.containerStyle}>
                                <react_native_1.Text style={tileOverlayRender.textStyle}>
                                  {(_c = tileOverlay === null || tileOverlay === void 0 ? void 0 : tileOverlay.text) === null || _c === void 0 ? void 0 : _c.trim()}
                                </react_native_1.Text>
                              </react_native_1.View>) : null}
                          </react_native_1.View>
                        </react_native_1.View>);
                })}
                  </react_native_1.View>
                </react_native_1.View>) : hasVideoMedia ? (<react_native_1.View style={{ marginHorizontal: 0, position: 'relative', backgroundColor: '#000' }}>
                  {renderMoMoBadge()}
                  {!allowPlayback ? (<react_native_1.View style={[
                        videoStyleFor(item.id),
                        { maxHeight: SCREEN_HEIGHT * 0.68, alignItems: 'center', justifyContent: 'center' },
                    ]}>
                      {item.image ? (<react_native_1.Image source={{ uri: String(item.image) }} style={[react_native_1.StyleSheet.absoluteFillObject, { opacity: 0.35 }]} resizeMode="cover"/>) : null}
                      <react_native_1.Text style={{ color: '#fff', fontSize: 28, marginBottom: 8 }}>📴</react_native_1.Text>
                      <react_native_1.Text style={{ color: '#fff', fontWeight: '800' }}>Video unavailable offline</react_native_1.Text>
                    </react_native_1.View>) : videoSourceUri ? (<VideoWithTapControls_1.default source={{ uri: videoSourceUri }} style={[
                        videoStyleFor(item.id),
                        { maxHeight: SCREEN_HEIGHT * 0.68 },
                        {
                            transform: [
                                { scaleX: (mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.mirror) ? -1 : 1 },
                                { scaleY: (mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.flipVertical) ? -1 : 1 },
                            ],
                        },
                    ]} resizeMode={'cover'} paused={!videoPlaySynced} playbackRate={Math.max(0.5, Math.min(2, Number((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.playbackRate) || 1)))} audioVolume={Math.max(0, Math.min(2, Number((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.volumeBoost) || 1)))} muted={hasOverlayAudio} playInBackground={false} isActive={item.id === activeVideoId} videoId={item.id} shouldPreload={shouldPreload} poster={item.image || undefined} posterResizeMode="cover" bufferConfig={{
                        minBufferMs: 3500,
                        maxBufferMs: 30000,
                        bufferForPlaybackMs: 220,
                        bufferForPlaybackAfterRebufferMs: 500,
                    }} onBuffer={function (bufferData) {
                        markBuffering(item.id, !!(bufferData === null || bufferData === void 0 ? void 0 : bufferData.isBuffering));
                    }} onLoad={function () {
                        markBuffering(item.id, false);
                    }} onError={function (err) {
                        var _a, _b;
                        markBuffering(item.id, false);
                        if (!preferFallbackVideoSource && fallbackVideoSource) {
                            setPreferFallbackVideoSource(true);
                            return;
                        }
                        var code = String(((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.errorCode) ||
                            ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.code) ||
                            (err === null || err === void 0 ? void 0 : err.errorString) ||
                            (err === null || err === void 0 ? void 0 : err.code) ||
                            '').trim();
                        onVideoPlaybackError(item.id, code || undefined);
                    }} onPlay={function () {
                        recordVideoReach(item.id).catch(function (error) {
                            console.log('Video reach recording failed:', error.message);
                        });
                    }}/>) : (<react_native_1.View style={[
                        videoStyleFor(item.id),
                        { maxHeight: SCREEN_HEIGHT * 0.68 },
                        {
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#000',
                        },
                    ]}>
                      <react_native_1.Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
                        Video source unavailable
                      </react_native_1.Text>
                    </react_native_1.View>)}
                  {filterOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, filterOverlayStyle]}/>) : null}
                  {brightnessOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, brightnessOverlayStyle]}/>) : null}
                  {contrastOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, contrastOverlayStyle]}/>) : null}
                  {vignetteOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, vignetteOverlayStyle]}/>) : null}
                  {((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.stickers) || []).map(function (s) { return (<react_native_1.Text key={s.id} pointerEvents="none" style={{
                        position: 'absolute',
                        left: "".concat(s.x * 100, "%"),
                        top: "".concat(s.y * 100, "%"),
                        fontSize: s.size || 34,
                        transform: [
                            { translateX: -(s.size || 34) / 2 },
                            { translateY: -(s.size || 34) / 2 },
                            { rotate: "".concat(s.rotation || 0, "deg") },
                        ],
                    }}>
                      {s.emoji}
                    </react_native_1.Text>); })}
                  {(function () {
                    var _a;
                    if (!((_a = textOverlay === null || textOverlay === void 0 ? void 0 : textOverlay.text) === null || _a === void 0 ? void 0 : _a.trim()))
                        return null;
                    var overlayRender = buildFeedTextOverlay(textOverlay, SCREEN_WIDTH, Math.min(SCREEN_HEIGHT * 0.68, SCREEN_WIDTH * 1.28));
                    return (<react_native_1.View pointerEvents="none" style={overlayRender.containerStyle}>
                        <react_native_1.Text style={overlayRender.textStyle}>
                          {textOverlay.text.trim()}
                        </react_native_1.Text>
                      </react_native_1.View>);
                })()}
                  {hasOverlayAudio && RNVideo ? (<RNVideo source={{ uri: String(((_k = item.audio) === null || _k === void 0 ? void 0 : _k.uri) || '') }} audioOnly paused={!audioPlaySynced} rate={Math.max(0.5, Math.min(2, Number((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.playbackRate) || 1)))} volume={Math.max(0, Math.min(2, Number((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.volumeBoost) || 1)))} style={{ width: 1, height: 1, opacity: 0 }} playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore" onLoad={function () { return setOverlayAudioLoaded(true); }} onError={function () { return setOverlayAudioLoaded(true); }} onProgress={function (e) {
                        if (!overlayAudioStarted && Number((e === null || e === void 0 ? void 0 : e.currentTime) || 0) > 0) {
                            setOverlayAudioStarted(true);
                        }
                    }}/>) : null}
                </react_native_1.View>) : audioOnlyPost ? (<react_native_1.Pressable onPress={revealAudioControlsTemporarily} style={{
                    marginHorizontal: 0,
                    width: SCREEN_WIDTH,
                    minHeight: 180,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    paddingVertical: 20,
                    paddingHorizontal: 14,
                }}>
                  <react_native_1.Text style={{ fontSize: 40, marginBottom: 10 }}>🎵</react_native_1.Text>
                  {renderMoMoBadge()}
                  {RNVideo ? (<RNVideo source={{ uri: String(((_l = item.audio) === null || _l === void 0 ? void 0 : _l.uri) || (primaryMedia === null || primaryMedia === void 0 ? void 0 : primaryMedia.uri) || '') }} audioOnly controls={audioControlsVisible} paused={!audioPlaySynced} rate={Math.max(0.5, Math.min(2, Number((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.playbackRate) || 1)))} volume={Math.max(0, Math.min(2, Number((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.volumeBoost) || 1)))} style={{ width: SCREEN_WIDTH - 28, height: 64 }} playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore"/>) : (<react_native_1.Text style={{ color: '#9ab4cf' }}>Audio player unavailable</react_native_1.Text>)}
                </react_native_1.Pressable>) : hasUnknownMediaFile ? (<react_native_1.View style={{
                    marginHorizontal: 0,
                    width: SCREEN_WIDTH,
                    minHeight: 180,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    paddingVertical: 20,
                    paddingHorizontal: 14,
                }}>
                  {renderMoMoBadge()}
                  <react_native_1.Text style={{ fontSize: 40 }}>📄</react_native_1.Text>
                </react_native_1.View>) : (<react_native_1.Pressable onPress={function () {
                    handleImageReveal();
                    openMediaViewer(0);
                }}>
                  <react_native_1.View style={{
                    position: 'relative',
                    marginHorizontal: 0,
                    width: SCREEN_WIDTH,
                    backgroundColor: '#000',
                }}>
                    {renderMoMoBadge()}
                    <react_native_1.Image source={{ uri: mediaUri }} style={[
                    videoStyleFor(item.id),
                    { backgroundColor: '#000' },
                    {
                        transform: [
                            { scaleX: (mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.mirror) ? -1 : 1 },
                            { scaleY: (mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.flipVertical) ? -1 : 1 },
                        ],
                    },
                ]} resizeMode="contain"/>
                    {filterOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, filterOverlayStyle]}/>) : null}
                    {brightnessOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, brightnessOverlayStyle]}/>) : null}
                    {contrastOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, contrastOverlayStyle]}/>) : null}
                    {vignetteOverlayStyle ? (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFillObject, vignetteOverlayStyle]}/>) : null}
                    {((mediaEdits === null || mediaEdits === void 0 ? void 0 : mediaEdits.stickers) || []).map(function (s) { return (<react_native_1.Text key={s.id} pointerEvents="none" style={{
                        position: 'absolute',
                        left: "".concat(s.x * 100, "%"),
                        top: "".concat(s.y * 100, "%"),
                        fontSize: s.size || 34,
                        transform: [
                            { translateX: -(s.size || 34) / 2 },
                            { translateY: -(s.size || 34) / 2 },
                            { rotate: "".concat(s.rotation || 0, "deg") },
                        ],
                    }}>
                        {s.emoji}
                      </react_native_1.Text>); })}
                    {(function () {
                    var _a;
                    if (!((_a = textOverlay === null || textOverlay === void 0 ? void 0 : textOverlay.text) === null || _a === void 0 ? void 0 : _a.trim()))
                        return null;
                    var overlayRender = buildFeedTextOverlay(textOverlay, SCREEN_WIDTH, Math.min(SCREEN_HEIGHT * 0.68, SCREEN_WIDTH * 1.28));
                    return (<react_native_1.View pointerEvents="none" style={overlayRender.containerStyle}>
                          <react_native_1.Text style={overlayRender.textStyle}>
                            {textOverlay.text.trim()}
                          </react_native_1.Text>
                        </react_native_1.View>);
                })()}
                  </react_native_1.View>
                  {hasOverlayAudio && RNVideo ? (<RNVideo source={{ uri: String(((_m = item.audio) === null || _m === void 0 ? void 0 : _m.uri) || '') }} audioOnly paused={!audioPlaySynced} style={{ width: 1, height: 1, opacity: 0 }} playInBackground={false} playWhenInactive={false} ignoreSilentSwitch="ignore" onLoad={function () { return setOverlayAudioLoaded(true); }} onError={function () { return setOverlayAudioLoaded(true); }} onProgress={function (e) {
                        if (!overlayAudioStarted && Number((e === null || e === void 0 ? void 0 : e.currentTime) || 0) > 0) {
                            setOverlayAudioStarted(true);
                        }
                    }}/>) : null}
                </react_native_1.Pressable>)}
            </>) : (
        /* Text-only posts */
        <react_native_1.Pressable onPress={handleTextPostPress} style={[
                styles.textStoryWrap,
                expandedPosts[item.id] ? styles.textStoryWrapExpanded : null,
            ]}>
              <react_native_linear_gradient_1.default colors={storyTheme.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.textStoryCard}>
                {renderMoMoBadge()}
                <ClickableTextWithLinks_1.default text={expandedPosts[item.id]
                ? item.captionText
                : item.captionText.length > 500
                    ? item.captionText.substring(0, 500) + '...'
                    : item.captionText} style={styles.textStoryBody}/>
                {item.captionText && item.captionText.length > 500 && !expandedPosts[item.id] ? (<react_native_1.Pressable onPress={handleReadMore}>
                    <react_native_1.Text style={[styles.textStoryMore, { color: storyTheme.accent }]}>Read More</react_native_1.Text>
                  </react_native_1.Pressable>) : null}
              </react_native_linear_gradient_1.default>
            </react_native_1.Pressable>)}

          {bufferingMap[item.id] && shouldPlay && (<react_native_1.View style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
              <react_native_1.ActivityIndicator size="large" color="#00C2FF"/>
            </react_native_1.View>)}

          {/* Read More - positioned above footer */}
          {textOnlyStory && item.captionText && item.captionText.length > 500 && (<react_native_1.Pressable onPress={handleReadMore} style={styles.readMoreButton}>
              <react_native_1.Text style={styles.readMoreText}>{expandedPosts[item.id] ? 'Read Less' : 'Read More'}</react_native_1.Text>
            </react_native_1.Pressable>)}
        </react_native_1.View>

        <react_native_1.View style={styles.posterActionWrap}>
          <PosterActionBar_1.default waveId={item.id} currentUserId={myUid || ''} splashesCount={hasMultiMediaGrid ? selectedMediaCounts.splashes : (((_o = item.counts) === null || _o === void 0 ? void 0 : _o.splashes) || 0)} echoesCount={hasMultiMediaGrid ? selectedMediaCounts.echoes : (((_p = item.counts) === null || _p === void 0 ? void 0 : _p.echoes) || 0)} pearlsCount={0} isAnchored={false} isCasted={false} creatorUserId={item.ownerUid} onAdd={hasMultiMediaGrid ? handleAddSplashForSelectedMedia : handleAddSplash} onRemove={hasMultiMediaGrid ? handleRemoveSplashForSelectedMedia : handleRemoveSplash} onEcho={hasMultiMediaGrid ? handleEchoForSelectedMedia : handleEcho} onPearl={handlePearl} onAnchor={handleAnchor} onCast={handleCast} splashSyncStatus={splashSyncStatus} onRetrySplash={handleRetrySplashSync} translate={translate}/>
        </react_native_1.View>

        <react_native_1.Modal visible={viewerVisible} transparent animationType="fade" onRequestClose={function () {
            setViewerZoom(1);
            setViewerVisible(false);
        }}>
          <react_native_1.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' }}>
            {galleryMediaItems[viewerIndex] ? (<react_native_1.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 72, paddingBottom: 172 }}>
                <react_native_1.Pressable onPress={function () {
                setViewerZoom(1);
                setViewerVisible(false);
            }} style={{
                position: 'absolute',
                top: 10,
                right: 14,
                zIndex: 20,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: 'rgba(8,16,28,0.66)',
                borderRadius: 18,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.12)',
            }}>
                  <react_native_1.Text style={{ color: '#fff', fontWeight: '700' }}>Close</react_native_1.Text>
                </react_native_1.Pressable>
                {isImageAsset(galleryMediaItems[viewerIndex]) ? (<react_native_1.ScrollView style={{ width: '100%' }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    <react_native_1.ScrollView horizontal contentContainerStyle={{
                    minWidth: '100%',
                    minHeight: SCREEN_HEIGHT * 0.72,
                    alignItems: 'center',
                    justifyContent: 'center',
                }} showsHorizontalScrollIndicator={false}>
                      <react_native_1.Image source={{ uri: String(galleryMediaItems[viewerIndex].uri) }} style={{
                    width: SCREEN_WIDTH * viewerZoom,
                    height: SCREEN_HEIGHT * 0.72 * viewerZoom,
                }} resizeMode="contain"/>
                    </react_native_1.ScrollView>
                  </react_native_1.ScrollView>) : isVideoAsset(galleryMediaItems[viewerIndex]) && RNVideo ? (<RNVideo source={{ uri: String(galleryMediaItems[viewerIndex].uri) }} style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.72 }} resizeMode="contain" controls paused={false}/>) : (<react_native_1.View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <react_native_1.Text style={{ fontSize: 42, marginBottom: 12 }}>File</react_native_1.Text>
                    <react_native_1.Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>
                      {galleryMediaItems[viewerIndex].fileName || 'Attachment'}
                    </react_native_1.Text>
                  </react_native_1.View>)}
                <react_native_1.Text style={{ color: 'rgba(255,255,255,0.82)', marginTop: 12 }}>
                  {viewerIndex + 1} / {galleryMediaItems.length}
                </react_native_1.Text>
                <react_native_1.View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  {galleryMediaItems.length > 1 ? (<react_native_1.Pressable onPress={function () {
                    setViewerZoom(1);
                    setViewerIndex(function (prev) { return Math.max(0, prev - 1); });
                }} disabled={viewerIndex <= 0} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerIndex <= 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}>
                      <react_native_1.Text style={{ color: '#fff', fontWeight: '700' }}>Prev</react_native_1.Text>
                    </react_native_1.Pressable>) : null}
                  {isImageAsset(galleryMediaItems[viewerIndex]) ? (<react_native_1.Pressable onPress={function () { return setViewerZoom(function (prev) { return Math.max(1, Number((prev - 0.5).toFixed(1))); }); }} disabled={viewerZoom <= 1} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerZoom <= 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}>
                      <react_native_1.Text style={{ color: '#fff', fontWeight: '700' }}>Zoom -</react_native_1.Text>
                    </react_native_1.Pressable>) : null}
                  {isImageAsset(galleryMediaItems[viewerIndex]) ? (<react_native_1.Pressable onPress={function () { return setViewerZoom(function (prev) { return Math.min(4, Number((prev + 0.5).toFixed(1))); }); }} disabled={viewerZoom >= 4} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerZoom >= 4 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}>
                      <react_native_1.Text style={{ color: '#fff', fontWeight: '700' }}>Zoom +</react_native_1.Text>
                    </react_native_1.Pressable>) : null}
                  {galleryMediaItems.length > 1 ? (<react_native_1.Pressable onPress={function () {
                    setViewerZoom(1);
                    setViewerIndex(function (prev) { return Math.min(galleryMediaItems.length - 1, prev + 1); });
                }} disabled={viewerIndex >= galleryMediaItems.length - 1} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: viewerIndex >= galleryMediaItems.length - 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.16)' }}>
                      <react_native_1.Text style={{ color: '#fff', fontWeight: '700' }}>Next</react_native_1.Text>
                    </react_native_1.Pressable>) : null}
                </react_native_1.View>
              </react_native_1.View>) : null}
            {galleryMediaItems.length > 1 ? (<react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ position: 'absolute', left: 0, right: 0, bottom: 76, paddingHorizontal: 12 }} contentContainerStyle={{ gap: 8, paddingRight: 12 }}>
                {galleryMediaItems.map(function (mediaItem, idx) { return (<react_native_1.Pressable key={"".concat(mediaItem.uri || 'thumb', "_").concat(idx)} onPress={function () {
                    setViewerZoom(1);
                    setViewerIndex(idx);
                }} style={{
                    width: 68,
                    height: 68,
                    borderRadius: 10,
                    overflow: 'hidden',
                    borderWidth: viewerIndex === idx ? 2 : 1,
                    borderColor: viewerIndex === idx ? '#00C2FF' : 'rgba(255,255,255,0.18)',
                    backgroundColor: '#111',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {isImageAsset(mediaItem) ? (<react_native_1.Image source={{ uri: String(mediaItem.uri) }} style={{ width: '100%', height: '100%' }} resizeMode="cover"/>) : (<react_native_1.Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', paddingHorizontal: 6 }}>
                        {isVideoAsset(mediaItem) ? 'Video' : 'File'}
                      </react_native_1.Text>)}
                  </react_native_1.Pressable>); })}
              </react_native_1.ScrollView>) : null}
            <react_native_1.View style={{ position: 'absolute', left: 0, right: 0, bottom: 18 }}>
              <PosterActionBar_1.default waveId={item.id} currentUserId={myUid || ''} splashesCount={hasMultiMediaGrid ? selectedMediaCounts.splashes : (((_q = item.counts) === null || _q === void 0 ? void 0 : _q.splashes) || 0)} echoesCount={hasMultiMediaGrid ? selectedMediaCounts.echoes : (((_r = item.counts) === null || _r === void 0 ? void 0 : _r.echoes) || 0)} pearlsCount={0} isAnchored={false} isCasted={false} creatorUserId={item.ownerUid} onAdd={hasMultiMediaGrid ? handleAddSplashForSelectedMedia : handleAddSplash} onRemove={hasMultiMediaGrid ? handleRemoveSplashForSelectedMedia : handleRemoveSplash} onEcho={hasMultiMediaGrid ? handleEchoForSelectedMedia : handleEcho} onPearl={handlePearl} onAnchor={handleAnchor} onCast={handleCast} splashSyncStatus={splashSyncStatus} onRetrySplash={handleRetrySplashSync} translate={translate}/>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.Modal>

        <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
          <react_native_1.Pressable onPress={handleReachPress} style={function (_a) {
        var pressed = _a.pressed;
        return [styles.statChip, pressed && styles.buttonPressed];
    }}>
            <react_native_1.Text style={styles.statLabel}>👁 {translate('feed.reach')}: </react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>{reachCounts[item.id] || 0}</react_native_1.Text>
          </react_native_1.Pressable>
          {item.ownerUid !== myUid && (<react_native_1.Text style={[styles.presenceText, { color: isHereNow ? ui.colors.success : ui.colors.subtle }]}>
              {isHereNow ? translate('feed.hereNow') : (status || fallbackAwayText)}
            </react_native_1.Text>)}
        </react_native_1.ScrollView>

        {(postEchoLists[item.id] && postEchoLists[item.id].length > 0) ? (<react_native_1.View style={styles.echoSection}>
          {/* Echoes Section */}
          {postEchoLists[item.id] && postEchoLists[item.id].length > 0 && (<react_native_1.View style={{ marginTop: 10 }}>
              {expandedEchoes[item.id] ? ((function () {
                    var allEchoes = postEchoLists[item.id];
                    var pageSize = echoesPageSize[item.id] || 5;
                    var visibleEchoes = allEchoes.slice(0, pageSize);
                    var hasMoreEchoes = allEchoes.length > pageSize;
                    return (<>
                      {visibleEchoes.map(function (echo, idx) { return renderEchoItem(echo, idx); })}

                      {hasMoreEchoes && (<react_native_1.Pressable onPress={handleLoadMoreEchoes} style={function (_a) {
                            var pressed = _a.pressed;
                            return [styles.loadMoreEchoesBtn, pressed && styles.buttonPressed];
                        }} hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }} disabled={echoExpansionInProgress[item.id]}>
                          <react_native_1.Text style={styles.loadMoreEchoesText}>
                            {translate('feed.loadMoreEchoes', {
                                count: Math.min(5, allEchoes.length - pageSize),
                            })}
                          </react_native_1.Text>
                        </react_native_1.Pressable>)}
                    </>);
                })()) : ((function () {
                    var topEcho = __spreadArray([], postEchoLists[item.id], true).sort(function (a, b) {
                        var _a, _b;
                        var hugDiff = Number((b === null || b === void 0 ? void 0 : b.hugs) || 0) - Number((a === null || a === void 0 ? void 0 : a.hugs) || 0);
                        if (hugDiff !== 0)
                            return hugDiff;
                        var bTime = typeof ((_a = b === null || b === void 0 ? void 0 : b.createdAt) === null || _a === void 0 ? void 0 : _a.toMillis) === 'function'
                            ? b.createdAt.toMillis()
                            : Number(new Date((b === null || b === void 0 ? void 0 : b.createdAt) || 0).getTime()) || 0;
                        var aTime = typeof ((_b = a === null || a === void 0 ? void 0 : a.createdAt) === null || _b === void 0 ? void 0 : _b.toMillis) === 'function'
                            ? a.createdAt.toMillis()
                            : Number(new Date((a === null || a === void 0 ? void 0 : a.createdAt) || 0).getTime()) || 0;
                        return bTime - aTime;
                    })[0];
                    return topEcho ? renderEchoItem(topEcho, 0) : null;
                })())}

              {postEchoLists[item.id].length > 1 && (<react_native_1.Pressable onPress={handleEchoToggle} style={function (_a) {
                    var pressed = _a.pressed;
                    return [styles.echoToggleBtn, pressed && styles.buttonPressed];
                }} hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }} disabled={echoExpansionInProgress[item.id]}>
                  <react_native_1.Text style={styles.echoToggleText}>
                    {expandedEchoes[item.id]
                        ? translate('feed.viewLessEchoes')
                        : translate('feed.viewAllEchoes', {
                            count: postEchoLists[item.id].length,
                        })}
                  </react_native_1.Text>
                </react_native_1.Pressable>)}
            </react_native_1.View>)}

        </react_native_1.View>) : null}
      </react_native_1.View>
    </react_native_1.Pressable>);
});
MainFeedItem.displayName = 'MainFeedItem';
var styles = react_native_1.StyleSheet.create({
    feedCard: {
        marginHorizontal: 0,
        marginVertical: 0,
        borderRadius: 0,
        paddingVertical: 0,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'transparent',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0,
        shadowRadius: 12,
        elevation: 0,
    },
    postBody: {
        backgroundColor: 'transparent',
    },
    postHeader: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: ui.spacing.sm,
        paddingHorizontal: ui.spacing.md,
    },
    menuButtonWrap: {
        position: 'absolute',
        top: 4,
        right: ui.spacing.sm,
        zIndex: 30,
        elevation: 8,
    },
    iconPress: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(14, 165, 233, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(186, 230, 253, 0.24)',
        shadowColor: '#0EA5E9',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    iconPressActive: {
        opacity: 0.82,
        transform: [{ scale: 0.95 }],
    },
    menuIcon: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '900',
        lineHeight: 22,
    },
    centeredHeader: {
        alignItems: 'center',
        width: '100%',
        minHeight: 118,
        paddingHorizontal: 10,
        paddingRight: 58,
        paddingVertical: 8,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        width: '100%',
        marginBottom: ui.spacing.sm,
    },
    sideButtonRail: {
        minHeight: 58,
        justifyContent: 'center',
    },
    profileColumn: {
        flex: 1,
        alignItems: 'center',
    },
    avatarRail: {
        minHeight: 58,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileTextWrap: {
        width: '100%',
        alignItems: 'center',
    },
    joinButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: ui.radius.xl,
        borderWidth: 1,
        marginRight: 10,
    },
    joinButtonJoin: {
        borderColor: ui.colors.accent,
        backgroundColor: ui.colors.accent,
    },
    joinButtonLeave: {
        borderColor: ui.colors.danger,
        backgroundColor: ui.colors.danger,
    },
    joinButtonText: {
        color: '#fff',
        fontSize: ui.type.caption,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    buttonPressed: {
        opacity: 0.78,
        transform: [{ scale: 0.97 }],
    },
    captionWrap: {
        paddingHorizontal: ui.spacing.md,
        marginBottom: ui.spacing.md,
    },
    captionText: {
        fontSize: ui.type.body,
        lineHeight: 23,
        color: ui.colors.body,
    },
    linkWrap: {
        paddingHorizontal: ui.spacing.md,
        marginBottom: ui.spacing.md,
    },
    linkPill: {
        backgroundColor: ui.colors.accentSoft,
        paddingHorizontal: ui.spacing.md,
        paddingVertical: ui.spacing.sm,
        borderRadius: ui.radius.md,
        borderWidth: 1,
        borderColor: '#BEE3F8',
    },
    linkText: {
        color: ui.colors.link,
        fontSize: ui.type.body,
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    readMoreButton: {
        marginTop: ui.spacing.xs,
        marginBottom: 0,
        alignSelf: 'center',
        paddingHorizontal: ui.spacing.md,
        paddingVertical: 6,
        borderRadius: ui.radius.xl,
        backgroundColor: '#EEF4FF',
    },
    readMoreText: {
        color: ui.colors.link,
        fontSize: 13,
        fontWeight: '700',
    },
    textStoryWrap: {
        width: SCREEN_WIDTH,
        paddingHorizontal: 0,
        marginBottom: 0,
    },
    textStoryWrapExpanded: {
        minHeight: 0,
    },
    textStoryCard: {
        width: '100%',
        minHeight: 260,
        paddingHorizontal: 24,
        paddingVertical: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textStoryBody: {
        color: '#F8FAFC',
        fontSize: 22,
        lineHeight: 32,
        fontWeight: '700',
        textAlign: 'center',
    },
    textStoryMore: {
        marginTop: 16,
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    momoBadge: {
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: '#0B2559',
        borderWidth: 1,
        borderColor: 'rgba(191,219,254,0.28)',
    },
    momoBadgeText: {
        color: '#EFF6FF',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    posterActionWrap: {
        marginTop: 0,
    },
    sectionDivider: {
        height: 1,
        backgroundColor: ui.colors.border,
        width: '100%',
        marginTop: ui.spacing.sm,
    },
    statsRow: {
        marginTop: 6,
        paddingHorizontal: ui.spacing.md,
        paddingBottom: ui.spacing.xs,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: ui.spacing.md,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: ui.colors.border,
        borderRadius: ui.radius.xl,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statLabel: {
        fontSize: 13,
        color: ui.colors.subtle,
        marginRight: 6,
        fontWeight: '700',
    },
    statValue: {
        fontSize: 13,
        color: ui.colors.heading,
        fontWeight: '700',
    },
    presenceText: {
        fontSize: ui.type.meta,
        marginRight: ui.spacing.md,
        fontWeight: '700',
        alignSelf: 'center',
    },
    moreFromCreator: {
        fontSize: 13,
        color: ui.colors.subtle,
        marginRight: ui.spacing.md,
        alignSelf: 'center',
        fontWeight: '600',
    },
    echoSection: {
        marginTop: ui.spacing.md,
        paddingHorizontal: ui.spacing.md,
    },
    loadMoreEchoesBtn: {
        marginTop: ui.spacing.xs,
        marginBottom: ui.spacing.sm,
        alignSelf: 'center',
        paddingHorizontal: ui.spacing.md,
        paddingVertical: 8,
        borderRadius: ui.radius.md,
        backgroundColor: '#EEF6FF',
    },
    loadMoreEchoesText: {
        color: ui.colors.link,
        fontSize: 13,
        fontWeight: '700',
    },
    echoToggleBtn: {
        marginTop: ui.spacing.xs,
        alignSelf: 'flex-start',
        paddingHorizontal: ui.spacing.md,
        paddingVertical: 8,
        borderRadius: ui.radius.md,
        backgroundColor: '#EEF6FF',
    },
    echoToggleText: {
        color: ui.colors.link,
        fontSize: 13,
        fontWeight: '700',
    },
    emptyEchoHint: {
        color: ui.colors.subtle,
        fontSize: ui.type.caption,
        textAlign: 'center',
        marginTop: ui.spacing.sm,
        fontStyle: 'italic',
    },
});
exports.default = MainFeedItem;
