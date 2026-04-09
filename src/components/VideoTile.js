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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VideoTile;
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_video_1 = __importDefault(require("react-native-video"));
var react_native_fast_image_1 = __importDefault(require("@d11/react-native-fast-image"));
var DataSaverProvider_1 = require("../dataSaver/DataSaverProvider");
var DataUsage_1 = require("../dataSaver/DataUsage");
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
var videoCache_1 = require("../services/videoCache");
function VideoTile(_a) {
    var _this = this;
    var _b;
    var videoId = _a.videoId, _c = _a.initialAutoPlay, initialAutoPlay = _c === void 0 ? false : _c, uid = _a.uid, _d = _a.isActive, isActive = _d === void 0 ? true : _d;
    var s = (0, DataSaverProvider_1.useDataSaver)();
    var _e = (0, react_1.useState)(null), r = _e[0], setR = _e[1];
    var _f = (0, react_1.useState)(false), play = _f[0], setPlay = _f[1];
    var _g = (0, react_1.useState)(null), cachedUrl = _g[0], setCachedUrl = _g[1];
    var _h = (0, react_1.useState)(false), isOffline = _h[0], setIsOffline = _h[1];
    var _j = (0, react_1.useState)(false), isBuffering = _j[0], setIsBuffering = _j[1];
    var _k = (0, react_1.useState)(true), showPoster = _k[0], setShowPoster = _k[1];
    var _l = (0, react_1.useState)(false), hadError = _l[0], setHadError = _l[1];
    var _m = (0, react_1.useState)(false), hasStarted = _m[0], setHasStarted = _m[1];
    var _o = (0, react_1.useState)(false), playbackReady = _o[0], setPlaybackReady = _o[1];
    var _p = (0, react_1.useState)(true), isMuted = _p[0], setIsMuted = _p[1]; // Default muted for feed
    var lastTime = (0, react_1.useRef)(0);
    var cacheKickoff = (0, react_1.useRef)(false);
    var loadTimeout = (0, react_1.useRef)(null);
    var logVideoTrouble = function (reason) {
        console.warn("[VideoTile] ".concat(reason, " videoId=").concat(videoId));
    };
    var onPlaybackReady = function () {
        if (playbackReady)
            return;
        if (loadTimeout.current) {
            clearTimeout(loadTimeout.current);
            loadTimeout.current = null;
        }
        setPlaybackReady(true);
        setHasStarted(true);
        setIsBuffering(false);
        setShowPoster(false);
    };
    // Reset per video
    (0, react_1.useEffect)(function () {
        setPlay(false);
        setIsBuffering(false);
        setShowPoster(true);
        setHadError(false);
        setHasStarted(false);
        lastTime.current = 0;
        cacheKickoff.current = false;
        setIsMuted(true); // Reset to muted for new videos
    }, [videoId]);
    // Pause video when it becomes inactive (user scrolled away)
    (0, react_1.useEffect)(function () {
        if (!isActive) {
            setPlay(false);
            setShowPoster(true);
        }
    }, [isActive]);
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
    (0, react_1.useEffect)(function () {
        var alive = true;
        var retries = 0;
        var maxRetries = 5;
        var baseDelayMs = 2000;
        var cachedManifest = null;
        var backoff = function () { return new Promise(function (resolve) { return setTimeout(resolve, Math.min(16000, baseDelayMs * retries)); }); };
        var attemptFetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var pref, resp, json, e_1, message;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, videoCache_1.getVideoManifest)(videoId)];
                    case 1:
                        cachedManifest = _b.sent();
                        if (isOffline) {
                            if (alive) {
                                setR(cachedManifest);
                                if (!cachedManifest) {
                                    logVideoTrouble('offline with no cached manifest');
                                }
                            }
                            return [2 /*return*/];
                        }
                        _b.label = 2;
                    case 2:
                        if (!alive) return [3 /*break*/, 9];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 6, , 8]);
                        pref = s.preferModernCodec ? 'modern' : 'any';
                        return [4 /*yield*/, fetch("https://<REGION>-<PROJECT>.cloudfunctions.net/getPlaybackManifest?videoId=".concat(encodeURIComponent(videoId), "&prefer=").concat(pref))];
                    case 4:
                        resp = _b.sent();
                        return [4 /*yield*/, resp.json()];
                    case 5:
                        json = _b.sent();
                        if (!alive)
                            return [2 /*return*/];
                        setR(json);
                        (0, videoCache_1.saveVideoManifest)(videoId, json);
                        return [2 /*return*/];
                    case 6:
                        e_1 = _b.sent();
                        retries += 1;
                        message = (_a = e_1 === null || e_1 === void 0 ? void 0 : e_1.message) !== null && _a !== void 0 ? _a : String(e_1);
                        logVideoTrouble("manifest fetch failed (".concat(message, ") attempt=").concat(retries));
                        if (retries > maxRetries) {
                            if (alive) {
                                setR(cachedManifest);
                                if (!cachedManifest) {
                                    logVideoTrouble('no cached manifest to fall back to');
                                }
                            }
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, backoff()];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 2];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        attemptFetch();
        return function () {
            alive = false;
        };
    }, [videoId, s.preferModernCodec, isOffline]);
    var candidates = (0, react_1.useMemo)(function () {
        if (!r)
            return [];
        var uniq = [];
        var add = function (u) { if (u && !uniq.includes(u))
            uniq.push(u); };
        // Choose a fast-start order: preferred first, then fallbacks
        if (!s.enabled) {
            // prioritize quality when saver off
            add(initialAutoPlay ? r.high : r.med);
            add(r.high);
            add(r.med);
            add(r.low);
        }
        else {
            // saver on: start lower for speed, then climb
            if (s.maxResolution === 'low') {
                add(r.low);
                add(r.med);
                add(r.high);
            }
            else if (s.maxResolution === 'med') {
                add(r.med);
                add(r.low);
                add(r.high);
            }
            else {
                add(r.high);
                add(r.med);
                add(r.low);
            }
        }
        return uniq;
    }, [r, s.enabled, s.maxResolution, initialAutoPlay]);
    var _q = (0, react_1.useState)(0), urlIndex = _q[0], setUrlIndex = _q[1];
    (0, react_1.useEffect)(function () { setUrlIndex(0); }, [videoId, candidates.length]);
    var currentUrl = (_b = candidates[urlIndex]) !== null && _b !== void 0 ? _b : null;
    // Check for cached video when URL changes
    (0, react_1.useEffect)(function () {
        if (!currentUrl)
            return;
        var alive = true;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var cached;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, videoCache_1.getCachedVideoPath)(currentUrl)];
                    case 1:
                        cached = _a.sent();
                        if (alive)
                            setCachedUrl(cached);
                        return [2 /*return*/];
                }
            });
        }); })();
        return function () { alive = false; };
    }, [currentUrl]);
    // Prefetch thumbnail so it stays available while video buffers
    (0, react_1.useEffect)(function () {
        if (r === null || r === void 0 ? void 0 : r.thumb) {
            react_native_fast_image_1.default.preload([{ uri: r.thumb }]);
        }
    }, [r === null || r === void 0 ? void 0 : r.thumb]);
    (0, react_1.useEffect)(function () {
        if (!r)
            return;
        if (!s.enabled) {
            setPlay(initialAutoPlay && isActive);
            return;
        }
        if (s.autoplayOnWifiOnly && s.cellular) {
            setPlay(false);
        }
        else {
            setPlay(!s.thumbnailsOnlyInFeed && initialAutoPlay && isActive);
        }
    }, [r, s.enabled, s.autoplayOnWifiOnly, s.cellular, s.thumbnailsOnlyInFeed, initialAutoPlay, isActive]);
    var onTapPlay = function () {
        if (s.enabled && s.wifiOnlyDownloads && s.cellular)
            return;
        if (!isActive)
            return; // Don't allow playing if video is not active
        setHadError(false);
        setShowPoster(true);
        setIsBuffering(true);
        setHasStarted(false);
        setPlaybackReady(false);
        setPlay(true);
        setIsMuted(false); // Unmute when user taps to play
    };
    var thumb = (r === null || r === void 0 ? void 0 : r.thumb) || undefined;
    var canDownload = !(s.enabled && s.wifiOnlyDownloads && s.cellular);
    (0, react_1.useEffect)(function () {
        if (!currentUrl || cachedUrl || !canDownload || isOffline)
            return;
        var alive = true;
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var cached, cacheErr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, videoCache_1.cacheVideo)(currentUrl)];
                    case 1:
                        _a.sent();
                        if (!alive)
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, videoCache_1.getCachedVideoPath)(currentUrl)];
                    case 2:
                        cached = _a.sent();
                        if (alive)
                            setCachedUrl(cached);
                        return [3 /*break*/, 4];
                    case 3:
                        cacheErr_1 = _a.sent();
                        logVideoTrouble("cache download failed (".concat(String(cacheErr_1), ")"));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); })();
        return function () { alive = false; };
    }, [currentUrl, cachedUrl, canDownload, isOffline]);
    var tryFallback = function (reason) {
        logVideoTrouble("fallback triggered (".concat(reason, ")"));
        if (urlIndex + 1 < candidates.length) {
            setUrlIndex(function (i) { return i + 1; });
            setHadError(false);
            setIsBuffering(true);
            setShowPoster(true);
            setHasStarted(false);
            lastTime.current = 0;
            cacheKickoff.current = false;
            setPlaybackReady(false);
            if (loadTimeout.current) {
                clearTimeout(loadTimeout.current);
                loadTimeout.current = null;
            }
            return true;
        }
        return false;
    };
    // Watchdog: if playback doesn't start quickly, drop to next rendition
    (0, react_1.useEffect)(function () {
        if (!play || !currentUrl || hasStarted)
            return;
        var t = setTimeout(function () {
            if (!hasStarted)
                tryFallback('watchdog timer');
        }, 3500);
        return function () { return clearTimeout(t); };
    }, [play, currentUrl, hasStarted, urlIndex, candidates.length]);
    (0, react_1.useEffect)(function () {
        return function () {
            if (loadTimeout.current) {
                clearTimeout(loadTimeout.current);
                loadTimeout.current = null;
            }
        };
    }, []);
    return (<react_native_1.View style={{ aspectRatio: 9 / 16, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', minHeight: 315, minWidth: 169, position: 'relative' }}>
      {/* Split screen video thumbnail - permanent multi-section display */}
      {(r === null || r === void 0 ? void 0 : r.low) && (<>
          {/* Center section - main video area */}
          <react_native_1.View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                borderRadius: 12,
                overflow: 'hidden'
            }}>
            <react_native_video_1.default source={{ uri: r.low }} style={{
                width: '100%',
                height: '100%'
            }} paused={false} resizeMode="cover" repeat={true} muted={isMuted} controls={false} posterResizeMode="cover" bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
            }} progressUpdateInterval={1000} onLoadStart={function () { }} onError={function () { }} onProgress={function () { }} onBuffer={function () { }} onEnd={function () { }}/>
          </react_native_1.View>

          {/* Left side section - shows left part of video */}
          <react_native_1.View style={{
                position: 'absolute',
                top: -20,
                left: -40,
                width: 40,
                bottom: -20,
                zIndex: 0,
                overflow: 'hidden'
            }}>
            <react_native_video_1.default source={{ uri: r.low }} style={{
                width: '300%',
                height: '120%',
                position: 'absolute',
                top: '-10%',
                left: '0%'
            }} paused={false} resizeMode="cover" repeat={true} muted={true} controls={false} posterResizeMode="cover" bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
            }} progressUpdateInterval={1000} onLoadStart={function () { }} onError={function () { }} onProgress={function () { }} onBuffer={function () { }} onEnd={function () { }}/>
          </react_native_1.View>

          {/* Right side section - shows right part of video */}
          <react_native_1.View style={{
                position: 'absolute',
                top: -20,
                right: -40,
                width: 40,
                bottom: -20,
                zIndex: 0,
                overflow: 'hidden'
            }}>
            <react_native_video_1.default source={{ uri: r.low }} style={{
                width: '300%',
                height: '120%',
                position: 'absolute',
                top: '-10%',
                left: '-200%'
            }} paused={false} resizeMode="cover" repeat={true} muted={true} controls={false} posterResizeMode="cover" bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
            }} progressUpdateInterval={1000} onLoadStart={function () { }} onError={function () { }} onProgress={function () { }} onBuffer={function () { }} onEnd={function () { }}/>
          </react_native_1.View>

          {/* Top section - shows top part of video */}
          <react_native_1.View style={{
                position: 'absolute',
                top: -40,
                left: -20,
                right: -20,
                height: 40,
                zIndex: 0,
                overflow: 'hidden'
            }}>
            <react_native_video_1.default source={{ uri: r.low }} style={{
                width: '120%',
                height: '300%',
                position: 'absolute',
                top: '0%',
                left: '-10%'
            }} paused={false} resizeMode="cover" repeat={true} muted={true} controls={false} posterResizeMode="cover" bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
            }} progressUpdateInterval={1000} onLoadStart={function () { }} onError={function () { }} onProgress={function () { }} onBuffer={function () { }} onEnd={function () { }}/>
          </react_native_1.View>

          {/* Bottom section - shows bottom part of video */}
          <react_native_1.View style={{
                position: 'absolute',
                bottom: -40,
                left: -20,
                right: -20,
                height: 40,
                zIndex: 0,
                overflow: 'hidden'
            }}>
            <react_native_video_1.default source={{ uri: r.low }} style={{
                width: '120%',
                height: '300%',
                position: 'absolute',
                top: '-200%',
                left: '-10%'
            }} paused={false} resizeMode="cover" repeat={true} muted={true} controls={false} posterResizeMode="cover" bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
            }} progressUpdateInterval={1000} onLoadStart={function () { }} onError={function () { }} onProgress={function () { }} onBuffer={function () { }} onEnd={function () { }}/>
          </react_native_1.View>
        </>)}

      {/* Static poster fallback if video fails - always available behind video */}
      {thumb && (<react_native_fast_image_1.default source={{ uri: thumb }} style={posterStyles.fallbackBackground} resizeMode={react_native_fast_image_1.default.resizeMode.cover} pointerEvents="none"/>)}

      {play && currentUrl ? (<react_native_video_1.default source={{ uri: (isOffline && cachedUrl) ? 'file://' + cachedUrl : cachedUrl || currentUrl }} style={[react_native_1.StyleSheet.absoluteFill, { zIndex: 1 }]} paused={!play} resizeMode="cover" controls={true} poster={thumb} posterResizeMode="cover" bufferConfig={{
                minBufferMs: 800,
                maxBufferMs: 4000,
                bufferForPlaybackMs: 600,
                bufferForPlaybackAfterRebufferMs: 800,
            }} progressUpdateInterval={500} onLoadStart={function () {
                setIsBuffering(true);
                setShowPoster(true);
                setPlaybackReady(false);
                cacheKickoff.current = false;
                setHasStarted(false);
                if (loadTimeout.current)
                    clearTimeout(loadTimeout.current);
                loadTimeout.current = setTimeout(function () {
                    if (!playbackReady) {
                        tryFallback('load timeout');
                    }
                }, 3000);
            }} onError={function (e) {
                console.log('video error', e);
                var switched = tryFallback('playback error');
                if (!switched) {
                    setIsBuffering(false);
                    setShowPoster(true);
                    setHadError(true);
                    setPlaybackReady(false);
                    setPlay(false);
                }
            }} onProgress={function (p) { return __awaiter(_this, void 0, void 0, function () {
                var dt, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            dt = Math.max(0, p.currentTime - lastTime.current);
                            lastTime.current = p.currentTime;
                            (0, DataUsage_1.addBytesDownloaded)(Math.round(200 * 1024 * dt));
                            if (!hasStarted && p.currentTime > 0.05) {
                                onPlaybackReady();
                            }
                            if (s.enabled && (0, DataUsage_1.overCap)(s.mobileDataCapMB))
                                setPlay(false);
                            if (!(!cacheKickoff.current && !cachedUrl && currentUrl && p.currentTime >= 0.25)) return [3 /*break*/, 4];
                            cacheKickoff.current = true;
                            if (!canDownload) return [3 /*break*/, 4];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, videoCache_1.cacheVideo)(currentUrl)];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }} onBuffer={function (_a) {
                var isBuffering = _a.isBuffering;
                // Spinner must keep running until playback starts
                setIsBuffering(isBuffering || !playbackReady);
                setShowPoster(isBuffering || !playbackReady);
            }} onEnd={function () {
                // When video ends, stop playing and show poster
                setPlay(false);
                setShowPoster(true);
            }}/>) : null}

      {(showPoster || !play || !currentUrl) && (<react_native_1.Pressable style={posterStyles.overlay} onPress={onTapPlay}>
          <react_native_1.View style={posterStyles.badge}>
            <react_native_1.Text style={posterStyles.badgeText}>
              {hadError ? 'Tap to retry' : 'Tap to play (Data Saver)'}
            </react_native_1.Text>
          </react_native_1.View>
        </react_native_1.Pressable>)}

      {showPoster && (<react_native_1.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <react_native_1.ActivityIndicator color="#fff"/>
        </react_native_1.View>)}
    </react_native_1.View>);
}
var posterStyles = react_native_1.StyleSheet.create({
    background: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 0 }),
    fallbackBackground: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: -1 }),
    overlay: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 2, alignItems: 'center', justifyContent: 'center' }),
    badge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: '#0009',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    badgeText: {
        color: '#fff',
        fontWeight: '700',
    },
});
