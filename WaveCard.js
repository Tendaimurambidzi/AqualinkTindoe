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
exports.default = WaveCard;
// @ts-nocheck
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_video_1 = __importDefault(require("react-native-video"));
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
var videoCache_1 = require("./src/services/videoCache");
function WaveCard(_a) {
    var _this = this;
    var videoUrl = _a.videoUrl, audioUrl = _a.audioUrl, playbackUrl = _a.playbackUrl, _b = _a.isFocused, isFocused = _b === void 0 ? true : _b, onProgress = _a.onProgress, onLoaded = _a.onLoaded;
    var videoRef = (0, react_1.useRef)(null);
    var audioRef = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)(false), playing = _c[0], setPlaying = _c[1];
    var _d = (0, react_1.useState)(0), videoProgress = _d[0], setVideoProgress = _d[1];
    var _e = (0, react_1.useState)(0), audioProgress = _e[0], setAudioProgress = _e[1];
    var _f = (0, react_1.useState)(true), isWifi = _f[0], setIsWifi = _f[1];
    var useSingle = !!playbackUrl;
    var hasAudio = !!audioUrl && !useSingle;
    var _g = (0, react_1.useState)(null), cachedUrl = _g[0], setCachedUrl = _g[1];
    var _h = (0, react_1.useState)(false), isOffline = _h[0], setIsOffline = _h[1];
    // Check network status
    (0, react_1.useEffect)(function () {
        var check = function () { return __awaiter(_this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, netinfo_1.default.fetch()];
                    case 1:
                        state = _a.sent();
                        setIsOffline(!state.isConnected);
                        return [2 /*return*/];
                }
            });
        }); };
        check();
        var unsub = netinfo_1.default.addEventListener(function (state) { return setIsOffline(!state.isConnected); });
        return function () { unsub && unsub(); };
    }, []);
    // Check for cached video when URL changes
    (0, react_1.useEffect)(function () {
        var url = useSingle ? playbackUrl : videoUrl;
        if (!url)
            return;
        var alive = true;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var cached;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, videoCache_1.getCachedVideoPath)(url)];
                    case 1:
                        cached = _a.sent();
                        if (alive)
                            setCachedUrl(cached);
                        return [2 /*return*/];
                }
            });
        }); })();
        return function () { alive = false; };
    }, [playbackUrl, videoUrl, useSingle]);
    (0, react_1.useEffect)(function () {
        try {
            var NetInfo_1 = require('@react-native-community/netinfo').default;
            NetInfo_1.fetch().then(function (s) { return setIsWifi(!!(s === null || s === void 0 ? void 0 : s.isWifi) || (s === null || s === void 0 ? void 0 : s.type) === 'wifi'); });
            var unsub_1 = NetInfo_1.addEventListener(function (s) { return setIsWifi(!!(s === null || s === void 0 ? void 0 : s.isWifi) || (s === null || s === void 0 ? void 0 : s.type) === 'wifi'); });
            return function () { try {
                unsub_1 && unsub_1();
            }
            catch (_a) { } };
        }
        catch (_a) { }
    }, []);
    // Data saver caps (keep in sync with App bridge defaults)
    var maxBitrate = isWifi ? 2000000 : 1000000;
    (0, react_1.useEffect)(function () {
        var _a, _b;
        // Start playing when focused, stop when not.
        // AppState listener handles backgrounding.
        setPlaying(isFocused);
        if (isFocused) {
            // When becoming focused, seek both to the beginning to restart.
            (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.seek(0);
            if (hasAudio) {
                (_b = audioRef.current) === null || _b === void 0 ? void 0 : _b.seek(0);
            }
        }
        var subscription = react_native_1.AppState.addEventListener('change', function (nextAppState) {
            if (nextAppState.match(/inactive|background/) && isFocused) {
                setPlaying(false);
            }
            else if (nextAppState === 'active' && isFocused) {
                setPlaying(true);
            }
        });
        return function () {
            subscription.remove();
        };
    }, [isFocused, hasAudio]);
    var handleVideoLoad = function (m) {
        onLoaded === null || onLoaded === void 0 ? void 0 : onLoaded((m === null || m === void 0 ? void 0 : m.duration) || 0);
    };
    var handleVideoProgress = function (p) {
        setVideoProgress((p === null || p === void 0 ? void 0 : p.currentTime) || 0);
        onProgress === null || onProgress === void 0 ? void 0 : onProgress((p === null || p === void 0 ? void 0 : p.currentTime) || 0);
    };
    // Pause both audio and video if either errors or buffers (network issue)
    var handleSyncError = function (e) {
        setPlaying(false);
    };
    var handleBuffer = function (_a) {
        var isBuffering = _a.isBuffering;
        if (isBuffering)
            setPlaying(false);
    };
    // Only disable the video's audio track when a separate audio is present.
    var videoAudioTrackProp = hasAudio ? { selectedAudioTrack: { type: 'disabled' } } : {};
    return (<react_native_1.View style={styles.stage}>
      {useSingle ? (<react_native_video_1.default ref={videoRef} source={{ uri: (isOffline && cachedUrl) ? 'file://' + cachedUrl : cachedUrl || playbackUrl }} autoplay style={react_native_1.StyleSheet.absoluteFill} paused={!playing} maxBitRate={maxBitrate} repeat resizeMode="contain" rate={1.0} playInBackground={false} onLoadStart={function () { return console.log('WaveCard: Video(load single) started.'); }} {...(react_native_1.Platform.OS === 'android' ? { androidImplementation: 'exoplayer' } : {})} onLoad={handleVideoLoad} onProgress={function (p) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            handleVideoProgress(p);
                            if (!(!cachedUrl && playbackUrl && p.currentTime > 0.5)) return [3 /*break*/, 4];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, videoCache_1.cacheVideo)(playbackUrl)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }} onError={handleSyncError} onBuffer={handleBuffer}/>) : (<>
      <react_native_video_1.default ref={videoRef} source={{ uri: (isOffline && cachedUrl) ? 'file://' + cachedUrl : cachedUrl || videoUrl }} autoplay style={react_native_1.StyleSheet.absoluteFill} paused={!playing} maxBitRate={maxBitrate} repeat resizeMode="contain" rate={1.0} playInBackground={false} onLoadStart={function () { return console.log('WaveCard: Video load started.'); }} {...videoAudioTrackProp} {...(react_native_1.Platform.OS === 'android' ? { androidImplementation: 'exoplayer' } : {})} onLoad={handleVideoLoad} onProgress={function (p) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            handleVideoProgress(p);
                            if (!(!cachedUrl && videoUrl && p.currentTime > 0.5)) return [3 /*break*/, 4];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, videoCache_1.cacheVideo)(videoUrl)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }} onError={handleSyncError} onBuffer={handleBuffer}/>

          {/* AUDIO: hidden player only when separate audio is present */}
          {hasAudio && (<react_native_video_1.default ref={audioRef} source={{ uri: audioUrl }} autoplay audioOnly paused={!playing} playInBackground ignoreSilentSwitch="ignore" {...(react_native_1.Platform.OS === 'ios' ? { mixWithOthers: true } : {})} onLoadStart={function () { return console.log('WaveCard: Audio load started.'); }} onLoad={function () {
                    var _a;
                    // If video is already playing, seek audio to match video time
                    if (videoProgress > 0.1) {
                        (_a = audioRef.current) === null || _a === void 0 ? void 0 : _a.seek(videoProgress);
                    }
                }} onProgress={function (p) { return setAudioProgress((p === null || p === void 0 ? void 0 : p.currentTime) || 0); }} onError={handleSyncError} onBuffer={handleBuffer} style={{ width: 0, height: 0 }}/>)}
        </>)}
    </react_native_1.View>);
}
var styles = react_native_1.StyleSheet.create({
    stage: {
        width: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
        flex: 1,
    },
});
