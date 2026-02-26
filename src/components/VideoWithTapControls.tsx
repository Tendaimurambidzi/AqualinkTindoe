// VideoWithTapControls.tsx
import React, {useRef, useState, useEffect, useCallback, useMemo} from "react";
import {
  View,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Text,
  Platform,
  AccessibilityInfo,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import Video, {OnProgressData} from "react-native-video";
import NetInfo from '@react-native-community/netinfo';
import {
  getCachedVideoPath,
  cacheVideo,
  getVideoManifest,
} from '../services/videoCache';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type Props = {
  source: { uri: string } | number;
  style?: object;
  hideTimeout?: number;
  seekStep?: number;
  paused?: boolean;
  maxBitRate?: number;
  bufferConfig?: any;
  useTextureView?: boolean;
  progressUpdateInterval?: number;
  poster?: string;
  posterResizeMode?: string;
  disableFocus?: boolean;
  playInBackground?: boolean;
  playWhenInactive?: boolean;
  ignoreSilentSwitch?: string;
  controls?: boolean;
  onLoad?: (data: any) => void;
  onBuffer?: (data: any) => void;
  onError?: (error: any) => void;
  onProgress?: (data: OnProgressData) => void;
  onPlay?: () => void;
  muted?: boolean;
  playbackRate?: number;
  audioVolume?: number;
  resizeMode?: string;
  isActive?: boolean;
  onTap?: () => void;
  onMaximize?: () => void; // New prop for maximizing video
  videoId?: string; // Add videoId prop to fetch poster
  shouldPreload?: boolean; // New prop to control preloading
};

const VideoWithTapControls: React.FC<Props> = ({
  source,
  style = {},
  hideTimeout = 3000,
  seekStep = 10,
  paused = false,
  maxBitRate,
  bufferConfig,
  useTextureView,
  progressUpdateInterval,
  poster: initialPoster,
  posterResizeMode,
  disableFocus,
  playInBackground,
  playWhenInactive,
  ignoreSilentSwitch,
  controls,
  onLoad,
  onBuffer,
  onError,
  onProgress,
  onPlay,
  muted,
  playbackRate = 1,
  audioVolume = 1,
  resizeMode = 'contain',
  isActive = true,
  onTap,
  onMaximize, // New prop
  videoId,
  shouldPreload = false,
}) => {
  const videoRef = useRef<Video | null>(null);
  const [internalPaused, setInternalPaused] = useState<boolean>(true); // Start with videos paused
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoCompleted, setVideoCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted
  const [isLoading, setIsLoading] = useState<boolean>(true); // internal readiness gate
  const [fetchedPoster, setFetchedPoster] = useState<string | null>(null); // Fetched poster from manifest
  const hasCalledOnPlay = useRef<boolean>(false); // Track if onPlay has been called
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);

  useEffect(() => {
    setInternalPaused(paused);
  }, [paused]);

  useEffect(() => {
    setIsLoading(true);
  }, [resolvedUri]);

  useEffect(() => {
    if (!isActive) {
      setInternalPaused(true);
      setIsMuted(true);
    }
  }, [isActive]);

  // Unmute immediately when video becomes active and is playing
  useEffect(() => {
    if (!internalPaused && !videoCompleted && isActive) {
      setIsMuted(false);
    } else if (!isActive) {
      setIsMuted(true);
    }
  }, [internalPaused, videoCompleted, isActive]);

  const showControls = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 50, // Reduced from 180ms to 50ms for immediate response
      useNativeDriver: true,
    }).start();

    // Only auto-hide controls after timeout if video is not loading
    if (!isLoading) {
      hideTimer.current = setTimeout(() => {
        hideControls();
      }, hideTimeout);
    }
  }, [hideTimeout, controlsOpacity, isLoading]);

  const showControlsWithTimeout = useCallback((timeout: number) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 50, // Reduced from 180ms to 50ms for immediate response
      useNativeDriver: true,
    }).start();

    // Auto-hide controls after specified timeout (unless loading)
    if (!isLoading) {
      hideTimer.current = setTimeout(() => {
        hideControls();
      }, timeout);
    }
  }, [controlsOpacity, isLoading]);

  const hideControls = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 50, // Reduced from 180ms to 50ms for immediate response
      useNativeDriver: true,
    }).start(() => setControlsVisible(false));
  }, [controlsOpacity]);

  const safeSeek = useCallback((time: number) => {
    const t = Math.max(0, Math.min(time, duration || time));
    if (videoRef.current && typeof (videoRef.current as any).seek === "function") {
      (videoRef.current as any).seek(t);
      setCurrentTime(t);
    }
  }, [duration]);

  const onVideoTap = useCallback((event: any) => {
    const { locationX } = event.nativeEvent;
    const videoWidth = SCREEN_WIDTH;

    const leftThird = videoWidth / 3;
    const rightThird = (videoWidth * 2) / 3;

    if (locationX < leftThird) {
      safeSeek(currentTime - seekStep);
    } else if (locationX > rightThird) {
      safeSeek(currentTime + seekStep);
    } else {
      // Center tap - just show controls, don't navigate
      // onTap?.(); // Removed navigation on center tap
    }
    // Always show controls when tapping anywhere on video
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onToggleMute = useCallback(() => {
    const willUnmute = isMuted; // If currently muted, this action will unmute
    setIsMuted(prev => !prev);
    
    showControls();
  }, [isMuted, showControls, onMaximize]);

  const onRewind = useCallback(() => {
    safeSeek(currentTime - seekStep);
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onFastForward = useCallback(() => {
    safeSeek(currentTime + seekStep);
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onPlayPause = useCallback(() => {
    if (videoCompleted) {
      // Replay video from beginning
      safeSeek(0);
      setVideoCompleted(false);
      setInternalPaused(false);
    } else {
      const willStartPlaying = internalPaused;
      setInternalPaused(prev => !prev);
      
      // If starting playback (pressing play), maximize (if available) and unmute
      if (willStartPlaying) {
        setIsMuted(false); // Unmute when starting playback
        showControlsWithTimeout(3000);
      } else {
        showControls();
      }
    }
  }, [videoCompleted, safeSeek, showControls, showControlsWithTimeout, internalPaused, onMaximize]);

  const handleLoad = useCallback((meta: any) => {
    setDuration(meta.duration || 0);
    setIsLoading(false); // Video has loaded
    if (!internalPaused) {
      showControlsWithTimeout(3000);
    } else {
      showControls();
    }
    onLoad?.(meta);
  }, [onLoad, showControlsWithTimeout, internalPaused, showControls]);

  const handleProgress = useCallback((data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    if (data.currentTime > 0 && isLoading) {
      setIsLoading(false);
    }
    onProgress?.(data);
  }, [onProgress, isLoading]);

  const handleBuffer = useCallback((data: any) => {
    // Keep UI stable on transient buffers; avoid flashing loading overlays.
    onBuffer?.(data);
  }, [onBuffer]);

  const handleEnd = useCallback(() => {
    setVideoCompleted(true);
    setInternalPaused(true);
    showControls();
  }, [showControls]);

  useEffect(() => {
    if (videoId) {
      let alive = true;
      const fetchPoster = async () => {
        try {
          const manifest = await getVideoManifest(videoId);
          if (alive && manifest?.thumb) {
            setFetchedPoster(manifest.thumb);
          }
        } catch (error) {
          console.warn('Failed to fetch video poster:', error);
        }
      };
      fetchPoster();
      return () => { alive = false; };
    }
  }, [videoId]);

  useEffect(() => {
    let cancelled = false;
    const sourceUri =
      typeof source === 'object' && source && 'uri' in source
        ? String((source as any).uri || '')
        : '';

    if (!sourceUri) {
      setResolvedUri(null);
      return () => {
        cancelled = true;
      };
    }

    setResolvedUri(sourceUri);

    const isRemote = /^https?:\/\//i.test(sourceUri);
    if (!isRemote) {
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const cachedPath = await getCachedVideoPath(sourceUri);
        if (cachedPath && !cancelled) {
          const localUri =
            Platform.OS === 'android' && !cachedPath.startsWith('file://')
              ? `file://${cachedPath}`
              : cachedPath;
          setResolvedUri(localUri);
        } else if ((isActive || shouldPreload) && !cachedPath) {
          cacheVideo(sourceUri)
            .then(path => {
              if (cancelled) return;
              const localUri =
                Platform.OS === 'android' && !path.startsWith('file://')
                  ? `file://${path}`
                  : path;
              setResolvedUri(localUri);
            })
            .catch(error => {
              console.warn('Background video cache failed:', error);
            });
        }
      } catch (error) {
        console.warn('Video cache lookup failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, isActive, shouldPreload]);

  const resolvedSource = useMemo(() => {
    if (typeof source === 'number') return source;
    const srcObj = source as any;
    if (!srcObj?.uri || !resolvedUri) return source;
    return { ...srcObj, uri: resolvedUri };
  }, [source, resolvedUri]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (controlsVisible) {
      const announce = videoCompleted
        ? "Video completed. Replay available."
        : internalPaused
          ? "Player paused. Controls visible."
          : "Controls visible.";
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) AccessibilityInfo.announceForAccessibility(announce);
      });
    }
  }, [controlsVisible, internalPaused, videoCompleted]);

  // Removed: Clear auto-hide timer when video is paused to keep controls visible
  // Detect when video starts playing and call onPlay callback
  useEffect(() => {
    if (currentTime > 0 && !internalPaused && !hasCalledOnPlay.current) {
      hasCalledOnPlay.current = true;
      onPlay?.();
      // Hide controls when video starts playing
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      hideTimer.current = setTimeout(() => {
        hideControls();
      }, hideTimeout);
    }
  }, [currentTime, internalPaused, onPlay, hideTimeout, hideControls]);
  const posterUri =
    initialPoster ||
    fetchedPoster ||
    (videoCompleted && typeof resolvedSource !== 'number'
      ? String((resolvedSource as any)?.uri || '')
      : '');

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={resolvedSource}
        style={StyleSheet.absoluteFill}
        paused={internalPaused}
        resizeMode={resizeMode}
        maxBitRate={maxBitRate}
        bufferConfig={bufferConfig}
        useTextureView={useTextureView}
        progressUpdateInterval={progressUpdateInterval}
        poster={initialPoster || fetchedPoster}
        posterResizeMode={posterResizeMode}
        disableFocus={disableFocus}
        playInBackground={playInBackground}
        playWhenInactive={playWhenInactive}
        ignoreSilentSwitch={ignoreSilentSwitch}
        controls={controls}
        muted={isMuted}
        rate={playbackRate}
        volume={audioVolume}
        preload="auto"
        onLoad={handleLoad}
        onProgress={handleProgress}
        onBuffer={handleBuffer}
        onError={(err: any) => {
          setIsLoading(false);
          onError?.(err);
        }}
        onEnd={handleEnd}
      />
      <TouchableWithoutFeedback 
        onPress={onVideoTap}
      >
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      {/* Show poster overlay when video is paused or completed */}
      {(internalPaused || videoCompleted) && (
        <View style={styles.posterContainer}>
          {posterUri ? (
            <Image
              source={{ uri: posterUri }}
              style={styles.posterImage}
              resizeMode={posterResizeMode || 'contain'}
            />
          ) : (
            <View style={styles.posterImage} />
          )}
        </View>
      )}
      {videoCompleted && (
        <View style={styles.replayContainer}>
          <Pressable
            accessibilityLabel="Replay video"
            onPress={onPlayPause}
            style={({ pressed }) => [
              styles.replayButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              }
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            delayPressIn={0}
            delayPressOut={0}
            activeOpacity={0.7}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          >
            <Text style={styles.replaySymbol}>↺</Text>
          </Pressable>
        </View>
      )}
      <Animated.View
        pointerEvents={controlsVisible ? "auto" : "none"}
        style={[styles.controlsContainer, { opacity: controlsOpacity, zIndex: 10 }]}
      >
        <View style={styles.controlsRow}>
          <Pressable
            accessibilityLabel="Rewind ten seconds"
            onPress={onRewind}
            style={({ pressed }) => [
              styles.seekButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              }
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            delayPressIn={0}
            delayPressOut={0}
            activeOpacity={0.7}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          >
            <View style={styles.seekCircle}>
              <Text style={styles.seekNumber}>{seekStep}</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={videoCompleted ? "Replay video" : internalPaused ? "Play" : "Pause"}
            onPress={onPlayPause}
            style={({ pressed }) => [
              styles.playButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              }
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            delayPressIn={0}
            delayPressOut={0}
            activeOpacity={0.7}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          >
            <View style={styles.playCircle}>
              <Text style={styles.playSymbol}>
                {internalPaused ? "▶" : "⏸"}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel="Fast forward ten seconds"
            onPress={onFastForward}
            style={({ pressed }) => [
              styles.seekButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              }
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            delayPressIn={0}
            delayPressOut={0}
            activeOpacity={0.7}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          >
            <View style={styles.seekCircle}>
              <Text style={styles.seekNumber}>{seekStep}</Text>
            </View>
          </Pressable>
        </View>
        <View style={styles.timeContainer}>
          <Pressable
            accessibilityLabel={isMuted ? "Unmute video" : "Mute video"}
            onPress={onToggleMute}
            style={({ pressed }) => [
              styles.muteButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              }
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            delayPressIn={0}
            delayPressOut={0}
            activeOpacity={0.7}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: false }}
          >
            <Text style={styles.muteSymbol}>{isMuted ? "🔇" : "🔊"}</Text>
          </Pressable>
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    overflow: "hidden",
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
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
    color: '#E6EDF5',
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
  replayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
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
  posterContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
});

export default VideoWithTapControls;

