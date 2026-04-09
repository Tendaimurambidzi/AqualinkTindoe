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
// VideoWithTapControls.tsx
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var react_native_video_1 = __importDefault(require("react-native-video"));
var videoCache_1 = require("../services/videoCache");
var tokens_1 = require("../theme/tokens");
var SCREEN_WIDTH = react_native_1.Dimensions.get('window').width;
var formatTime = function (seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return "".concat(mins, ":").concat(secs.toString().padStart(2, '0'));
};
var VideoWithTapControls = function (_a) {
    var source = _a.source, _b = _a.style, style = _b === void 0 ? {} : _b, _c = _a.hideTimeout, hideTimeout = _c === void 0 ? 4000 : _c, _d = _a.seekStep, seekStep = _d === void 0 ? 10 : _d, _e = _a.paused, paused = _e === void 0 ? false : _e, maxBitRate = _a.maxBitRate, bufferConfig = _a.bufferConfig, useTextureView = _a.useTextureView, progressUpdateInterval = _a.progressUpdateInterval, initialPoster = _a.poster, posterResizeMode = _a.posterResizeMode, disableFocus = _a.disableFocus, playInBackground = _a.playInBackground, playWhenInactive = _a.playWhenInactive, ignoreSilentSwitch = _a.ignoreSilentSwitch, controls = _a.controls, onLoad = _a.onLoad, onBuffer = _a.onBuffer, onError = _a.onError, onProgress = _a.onProgress, onPlay = _a.onPlay, muted = _a.muted, _f = _a.playbackRate, playbackRate = _f === void 0 ? 1 : _f, _g = _a.audioVolume, audioVolume = _g === void 0 ? 1 : _g, _h = _a.resizeMode, resizeMode = _h === void 0 ? 'contain' : _h, _j = _a.isActive, isActive = _j === void 0 ? true : _j, onTap = _a.onTap, _onMaximize = _a.onMaximize, videoId = _a.videoId, _k = _a.shouldPreload, shouldPreload = _k === void 0 ? false : _k;
    var videoRef = (0, react_1.useRef)(null);
    var _l = (0, react_1.useState)(true), internalPaused = _l[0], setInternalPaused = _l[1]; // Start with videos paused
    var _m = (0, react_1.useState)(false), controlsVisible = _m[0], setControlsVisible = _m[1];
    var controlsOpacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var hideTimer = (0, react_1.useRef)(null);
    var _o = (0, react_1.useState)(0), duration = _o[0], setDuration = _o[1];
    var _p = (0, react_1.useState)(0), currentTime = _p[0], setCurrentTime = _p[1];
    var _q = (0, react_1.useState)(false), videoCompleted = _q[0], setVideoCompleted = _q[1];
    var _r = (0, react_1.useState)(false), suppressAutoPlayUntilInactive = _r[0], setSuppressAutoPlayUntilInactive = _r[1];
    var _s = (0, react_1.useState)(false), manualPauseRequested = _s[0], setManualPauseRequested = _s[1];
    var _t = (0, react_1.useState)(typeof muted === 'boolean' ? muted : true), isMuted = _t[0], setIsMuted = _t[1];
    var _u = (0, react_1.useState)(true), isLoading = _u[0], setIsLoading = _u[1]; // internal readiness gate
    var _v = (0, react_1.useState)(null), fetchedPoster = _v[0], setFetchedPoster = _v[1]; // Fetched poster from manifest
    var hasCalledOnPlay = (0, react_1.useRef)(false); // Track if onPlay has been called
    var _w = (0, react_1.useState)(null), resolvedUri = _w[0], setResolvedUri = _w[1];
    var wasActiveRef = (0, react_1.useRef)(false);
    var forceMuted = muted === true;
    (0, react_1.useEffect)(function () {
        setIsLoading(true);
        setCurrentTime(0);
        setDuration(0);
        setVideoCompleted(false);
        setManualPauseRequested(false);
        setSuppressAutoPlayUntilInactive(false);
    }, [resolvedUri]);
    // Keep mute state controlled by props when provided (e.g. overlay audio mode),
    // otherwise use local autoplay behavior.
    (0, react_1.useEffect)(function () {
        if (typeof muted === 'boolean') {
            setIsMuted(muted);
            return;
        }
        if (!internalPaused && !videoCompleted && isActive) {
            setIsMuted(false);
        }
        else if (!isActive) {
            setIsMuted(true);
        }
    }, [internalPaused, videoCompleted, isActive, muted]);
    var showControls = (0, react_1.useCallback)(function () {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        setControlsVisible(true);
        react_native_1.Animated.timing(controlsOpacity, {
            toValue: 1,
            duration: 50, // Reduced from 180ms to 50ms for immediate response
            useNativeDriver: true,
        }).start();
        hideTimer.current = setTimeout(function () {
            react_native_1.Animated.timing(controlsOpacity, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }).start(function () { return setControlsVisible(false); });
        }, hideTimeout);
    }, [hideTimeout, controlsOpacity]);
    var hideControls = (0, react_1.useCallback)(function () {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        react_native_1.Animated.timing(controlsOpacity, {
            toValue: 0,
            duration: 50, // Reduced from 180ms to 50ms for immediate response
            useNativeDriver: true,
        }).start(function () { return setControlsVisible(false); });
    }, [controlsOpacity]);
    var safeSeek = (0, react_1.useCallback)(function (time) {
        var t = Math.max(0, Math.min(time, duration || time));
        if (videoRef.current && typeof videoRef.current.seek === "function") {
            videoRef.current.seek(t);
            setCurrentTime(t);
        }
    }, [duration]);
    // Autoplay on entry to active view only.
    // If a video reached end, keep replay state while active; reset only after leaving and returning.
    (0, react_1.useEffect)(function () {
        var becameActive = isActive && !wasActiveRef.current;
        wasActiveRef.current = isActive;
        if (isActive && !paused) {
            if (manualPauseRequested) {
                setInternalPaused(true);
                return;
            }
            // Keep video paused on the same active item after completion/reset.
            // Once user leaves and comes back (becameActive), autoplay again.
            if (suppressAutoPlayUntilInactive) {
                if (becameActive) {
                    setSuppressAutoPlayUntilInactive(false);
                }
                else {
                    setInternalPaused(true);
                    return;
                }
            }
            if (becameActive || internalPaused) {
                if (videoCompleted) {
                    safeSeek(0);
                    setVideoCompleted(false);
                }
                hasCalledOnPlay.current = false;
                setInternalPaused(false);
            }
            return;
        }
        setInternalPaused(true);
        setIsMuted(true);
        if (!isActive) {
            setManualPauseRequested(false);
        }
        hideControls();
    }, [
        manualPauseRequested,
        isActive,
        paused,
        internalPaused,
        videoCompleted,
        safeSeek,
        hideControls,
        suppressAutoPlayUntilInactive,
    ]);
    var onVideoTap = (0, react_1.useCallback)(function (event) {
        var locationX = event.nativeEvent.locationX;
        var videoWidth = SCREEN_WIDTH;
        var leftThird = videoWidth / 3;
        var rightThird = (videoWidth * 2) / 3;
        if (locationX < leftThird) {
            safeSeek(currentTime - seekStep);
        }
        else if (locationX > rightThird) {
            safeSeek(currentTime + seekStep);
        }
        else {
            onTap === null || onTap === void 0 ? void 0 : onTap();
        }
        // Always show controls when tapping anywhere on video
        showControls();
    }, [currentTime, seekStep, safeSeek, showControls, onTap]);
    var onToggleMute = (0, react_1.useCallback)(function () {
        if (forceMuted) {
            return;
        }
        setIsMuted(function (prev) { return !prev; });
        showControls();
    }, [forceMuted, showControls]);
    var onRewind = (0, react_1.useCallback)(function () {
        safeSeek(currentTime - seekStep);
        showControls();
    }, [currentTime, seekStep, safeSeek, showControls]);
    var onFastForward = (0, react_1.useCallback)(function () {
        safeSeek(currentTime + seekStep);
        showControls();
    }, [currentTime, seekStep, safeSeek, showControls]);
    var onPlayPause = (0, react_1.useCallback)(function () {
        if (videoCompleted) {
            // Reset to start but keep paused on current page.
            safeSeek(0);
            setVideoCompleted(false);
            setInternalPaused(true);
            setManualPauseRequested(true);
            setSuppressAutoPlayUntilInactive(true);
            showControls();
        }
        else {
            setSuppressAutoPlayUntilInactive(false);
            setInternalPaused(function (prev) {
                var nextPaused = !prev;
                setManualPauseRequested(nextPaused);
                return nextPaused;
            });
            if (!forceMuted) {
                setIsMuted(false);
            }
            showControls();
        }
    }, [forceMuted, videoCompleted, safeSeek, showControls]);
    var handleLoad = (0, react_1.useCallback)(function (meta) {
        setDuration(meta.duration || 0);
        setIsLoading(false); // Video has loaded
        onLoad === null || onLoad === void 0 ? void 0 : onLoad(meta);
    }, [onLoad]);
    var handleProgress = (0, react_1.useCallback)(function (data) {
        setCurrentTime(data.currentTime);
        if (data.currentTime > 0 && isLoading) {
            setIsLoading(false);
        }
        onProgress === null || onProgress === void 0 ? void 0 : onProgress(data);
    }, [onProgress, isLoading]);
    var handleBuffer = (0, react_1.useCallback)(function (data) {
        // Keep UI stable on transient buffers; avoid flashing loading overlays.
        onBuffer === null || onBuffer === void 0 ? void 0 : onBuffer(data);
    }, [onBuffer]);
    var handleEnd = (0, react_1.useCallback)(function () {
        setVideoCompleted(true);
        setInternalPaused(true);
        // Prevent immediate auto-restart on the same feed item after completion.
        setSuppressAutoPlayUntilInactive(true);
    }, []);
    (0, react_1.useEffect)(function () {
        if (videoId) {
            var alive_1 = true;
            var fetchPoster = function () { return __awaiter(void 0, void 0, void 0, function () {
                var manifest, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, (0, videoCache_1.getVideoManifest)(videoId)];
                        case 1:
                            manifest = _a.sent();
                            if (alive_1 && (manifest === null || manifest === void 0 ? void 0 : manifest.thumb)) {
                                setFetchedPoster(manifest.thumb);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.warn('Failed to fetch video poster:', error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            fetchPoster();
            return function () { alive_1 = false; };
        }
    }, [videoId]);
    (0, react_1.useEffect)(function () {
        var cancelled = false;
        var sourceUri = typeof source === 'object' && source && 'uri' in source
            ? String(source.uri || '')
            : '';
        if (!sourceUri) {
            setResolvedUri(null);
            return function () {
                cancelled = true;
            };
        }
        setResolvedUri(sourceUri);
        var isRemote = /^https?:\/\//i.test(sourceUri);
        if (!isRemote) {
            return function () {
                cancelled = true;
            };
        }
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var cachedPath, localUri, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, videoCache_1.getCachedVideoPath)(sourceUri)];
                    case 1:
                        cachedPath = _a.sent();
                        if (cachedPath && !cancelled) {
                            localUri = react_native_1.Platform.OS === 'android' && !cachedPath.startsWith('file://')
                                ? "file://".concat(cachedPath)
                                : cachedPath;
                            setResolvedUri(localUri);
                        }
                        else if ((isActive || shouldPreload) && !cachedPath) {
                            (0, videoCache_1.cacheVideo)(sourceUri)
                                .then(function (path) {
                                if (cancelled)
                                    return;
                                var localUri = react_native_1.Platform.OS === 'android' && !path.startsWith('file://')
                                    ? "file://".concat(path)
                                    : path;
                                setResolvedUri(localUri);
                            })
                                .catch(function (error) {
                                console.warn('Background video cache failed:', error);
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.warn('Video cache lookup failed:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
        return function () {
            cancelled = true;
        };
    }, [source, isActive, shouldPreload]);
    var resolvedSource = (0, react_1.useMemo)(function () {
        if (typeof source === 'number')
            return source;
        var srcObj = source;
        if (!(srcObj === null || srcObj === void 0 ? void 0 : srcObj.uri) || !resolvedUri)
            return source;
        return __assign(__assign({}, srcObj), { uri: resolvedUri });
    }, [source, resolvedUri]);
    (0, react_1.useEffect)(function () {
        return function () {
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
                hideTimer.current = null;
            }
        };
    }, []);
    (0, react_1.useEffect)(function () {
        if (controlsVisible) {
            var announce_1 = videoCompleted
                ? "Video completed. Replay available."
                : internalPaused
                    ? "Player paused. Controls visible."
                    : "Controls visible.";
            react_native_1.AccessibilityInfo.isScreenReaderEnabled().then(function (enabled) {
                if (enabled)
                    react_native_1.AccessibilityInfo.announceForAccessibility(announce_1);
            });
        }
    }, [controlsVisible, internalPaused, videoCompleted]);
    // Removed: Clear auto-hide timer when video is paused to keep controls visible
    // Detect when video starts playing and call onPlay callback
    (0, react_1.useEffect)(function () {
        if (currentTime > 0 && !internalPaused && !hasCalledOnPlay.current) {
            hasCalledOnPlay.current = true;
            onPlay === null || onPlay === void 0 ? void 0 : onPlay();
            // Hide controls when video starts playing
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
            }
            hideTimer.current = setTimeout(function () {
                hideControls();
            }, hideTimeout);
        }
    }, [currentTime, internalPaused, onPlay, hideTimeout, hideControls]);
    var posterUri = initialPoster ||
        fetchedPoster ||
        (videoCompleted && typeof resolvedSource !== 'number'
            ? String((resolvedSource === null || resolvedSource === void 0 ? void 0 : resolvedSource.uri) || '')
            : '');
    return (<react_native_1.View style={[styles.container, style]}>
      <react_native_video_1.default ref={videoRef} source={resolvedSource} style={react_native_1.StyleSheet.absoluteFill} paused={internalPaused} resizeMode={resizeMode} maxBitRate={maxBitRate} bufferConfig={bufferConfig} useTextureView={useTextureView} progressUpdateInterval={progressUpdateInterval} poster={initialPoster || fetchedPoster} posterResizeMode={posterResizeMode} disableFocus={disableFocus} playInBackground={playInBackground} playWhenInactive={playWhenInactive} ignoreSilentSwitch={ignoreSilentSwitch} controls={controls} muted={isMuted} rate={playbackRate} volume={audioVolume} preload="auto" onLoad={handleLoad} onProgress={handleProgress} onBuffer={handleBuffer} onError={function (err) {
            setIsLoading(false);
            onError === null || onError === void 0 ? void 0 : onError(err);
        }} onEnd={handleEnd}/>
      <react_native_1.TouchableWithoutFeedback onPress={onVideoTap}>
        <react_native_1.View style={react_native_1.StyleSheet.absoluteFill}/>
      </react_native_1.TouchableWithoutFeedback>
      {/* Show poster overlay when video is paused or completed */}
      {((internalPaused || videoCompleted) && posterUri) ? (<react_native_1.View style={styles.posterContainer}>
          <react_native_1.Image source={{ uri: posterUri }} style={styles.posterImage} resizeMode={posterResizeMode || 'contain'}/>
        </react_native_1.View>) : null}
      {videoCompleted && (<react_native_1.View style={styles.replayContainer}>
          <react_native_1.Pressable accessibilityLabel="Replay video" onPress={onPlayPause} style={function (_a) {
                var pressed = _a.pressed;
                return [
                    styles.replayButton,
                    pressed && {
                        opacity: 0.6,
                        transform: [{ scale: 0.9 }],
                    }
                ];
            }} hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }} pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }} delayPressIn={0} delayPressOut={0} activeOpacity={0.7} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
            <react_native_1.Text style={styles.replaySymbol}>↺</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>)}
      <react_native_1.Animated.View pointerEvents={controlsVisible ? "auto" : "none"} style={[styles.controlsContainer, { opacity: controlsOpacity, zIndex: 10 }]}>
        <react_native_1.View style={styles.controlsRow}>
          <react_native_1.Pressable accessibilityLabel="Rewind ten seconds" onPress={onRewind} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.seekButton,
                pressed && {
                    opacity: 0.6,
                    transform: [{ scale: 0.9 }],
                }
            ];
        }} hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }} pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }} delayPressIn={0} delayPressOut={0} activeOpacity={0.7} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
            <react_native_1.View style={styles.seekCircle}>
              <react_native_1.Text style={styles.seekNumber}>{seekStep}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.Pressable>

          <react_native_1.Pressable accessibilityRole="button" accessibilityLabel={videoCompleted ? "Replay video" : internalPaused ? "Play" : "Pause"} onPress={onPlayPause} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.playButton,
                pressed && {
                    opacity: 0.6,
                    transform: [{ scale: 0.9 }],
                }
            ];
        }} hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }} pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }} delayPressIn={0} delayPressOut={0} activeOpacity={0.7} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
            <react_native_1.View style={styles.playCircle}>
              <react_native_1.Text style={styles.playSymbol}>
                {internalPaused ? "▶" : "⏸"}
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.Pressable>

          <react_native_1.Pressable accessibilityLabel="Fast forward ten seconds" onPress={onFastForward} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.seekButton,
                pressed && {
                    opacity: 0.6,
                    transform: [{ scale: 0.9 }],
                }
            ];
        }} hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }} pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }} delayPressIn={0} delayPressOut={0} activeOpacity={0.7} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
            <react_native_1.View style={styles.seekCircle}>
              <react_native_1.Text style={styles.seekNumber}>{seekStep}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.Pressable>
        </react_native_1.View>
        <react_native_1.View style={styles.timeContainer}>
          <react_native_1.Pressable accessibilityLabel={isMuted ? "Unmute video" : "Mute video"} onPress={onToggleMute} style={function (_a) {
            var pressed = _a.pressed;
            return [
                styles.muteButton,
                pressed && {
                    opacity: 0.6,
                    transform: [{ scale: 0.9 }],
                }
            ];
        }} hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }} pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }} delayPressIn={0} delayPressOut={0} activeOpacity={0.7} android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}>
            <react_native_1.Text style={styles.muteSymbol}>{isMuted ? "🔇" : "🔊"}</react_native_1.Text>
          </react_native_1.Pressable>
          <react_native_1.Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Animated.View>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        backgroundColor: tokens_1.appTokens.colors.mediaBackdrop,
        overflow: "hidden",
    },
    controlsContainer: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { justifyContent: "center", alignItems: "center" }),
    controlsRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    seekButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        padding: 8,
    },
    seekCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    seekNumber: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    playButton: {
        marginHorizontal: 8,
        padding: 8,
    },
    playCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    playSymbol: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    timeContainer: {
        position: 'absolute',
        bottom: 14,
        left: 14,
        right: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(5,12,20,0.62)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        minHeight: 34,
        zIndex: 10,
    },
    timeText: {
        color: tokens_1.appTokens.colors.surface,
        fontSize: 13,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    muteButton: {
        padding: 4,
    },
    muteSymbol: {
        fontSize: 16,
    },
    replayContainer: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { justifyContent: 'center', alignItems: 'center', zIndex: 5 }),
    replayButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    replaySymbol: {
        color: 'white',
        fontSize: 24,
        fontWeight: '600',
    },
    posterContainer: __assign(__assign({}, react_native_1.StyleSheet.absoluteFillObject), { zIndex: 1 }),
    posterImage: {
        width: '100%',
        height: '100%',
    },
});
exports.default = VideoWithTapControls;
