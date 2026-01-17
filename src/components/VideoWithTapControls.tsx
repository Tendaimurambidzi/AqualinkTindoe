// VideoWithTapControls.tsx
import React, {useRef, useState, useEffect, useCallback} from "react";
import {
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Platform,
  AccessibilityInfo,
  Dimensions,
  Image,
} from "react-native";
import Video, {OnProgressData} from "react-native-video";
import NetInfo from '@react-native-community/netinfo';
import {
  getCachedVideoPath,
  cacheVideo,
  getVideoManifest,
  saveVideoManifest,
  VideoManifest,
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
  resizeMode?: string;
  isActive?: boolean;
  onTap?: () => void;
  onMaximize?: () => void; // New prop for maximizing video
  videoId?: string; // Add videoId prop to fetch poster
};

const VideoWithTapControls: React.FC<Props> = ({
  source,
  style = {},
  hideTimeout = 4000,
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
  resizeMode = 'contain',
  isActive = true,
  onTap,
  onMaximize, // New prop
  videoId,
}) => {
  const videoRef = useRef<Video | null>(null);
  const [internalPaused, setInternalPaused] = useState<boolean>(true); // Start with videos paused
  const [controlsVisible, setControlsVisible] = useState<boolean>(true); // Start with controls visible
  const controlsOpacity = useRef(new Animated.Value(1)).current; // Start with opacity 1
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoCompleted, setVideoCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
  const [fetchedPoster, setFetchedPoster] = useState<string | null>(null); // Fetched poster from manifest
  const hasCalledOnPlay = useRef<boolean>(false); // Track if onPlay has been called

  useEffect(() => {
    setInternalPaused(paused);
  }, [paused]);

  useEffect(() => {
    if (!isActive) {
      setIsMuted(true);
    }
  }, [isActive]);

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
      // Center tap - navigate to full screen detail view
      onTap?.();
    }
    // Always show controls when tapping anywhere on video
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls, onTap]);

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
      }
    }
    
    // Show controls and auto-hide after 3 seconds when starting playback
    if (!internalPaused) {
      showControlsWithTimeout(3000);
    } else {
      showControls();
    }
  }, [videoCompleted, safeSeek, showControls, showControlsWithTimeout, internalPaused, onMaximize]);

  const handleLoad = useCallback((meta: any) => {
    setDuration(meta.duration || 0);
    setIsLoading(false); // Video has loaded
    onLoad?.(meta);
  }, [onLoad]);

  const handleProgress = useCallback((data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    onProgress?.(data);
  }, [onProgress]);

  const handleEnd = useCallback(() => {
    setVideoCompleted(true);
    setInternalPaused(true);
  }, []);

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
  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={source}
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
        preload="auto"
        onLoad={handleLoad}
        onProgress={handleProgress}
        onBuffer={onBuffer}
        onError={onError}
        onEnd={handleEnd}
      />
      <TouchableWithoutFeedback 
        onPress={onVideoTap}
      >
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      {/* Show poster overlay when video is paused and we have a poster */}
      {(initialPoster || fetchedPoster) && internalPaused && (
        <View style={styles.posterContainer}>
          <Image source={{ uri: initialPoster || fetchedPoster }} style={styles.posterImage} resizeMode={posterResizeMode || 'contain'} />
        </View>
      )}
      {videoCompleted && (initialPoster || fetchedPoster) && (
        <View style={styles.posterContainer}>
          <Image source={{ uri: initialPoster || fetchedPoster }} style={styles.posterImage} resizeMode={posterResizeMode || 'contain'} />
        </View>
      )}
      {videoCompleted && (
        <View style={styles.replayContainer}>
          <TouchableOpacity
            accessibilityLabel="Replay video"
            onPress={onPlayPause}
            style={styles.replayButton}
            hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
          >
            <Text style={styles.replaySymbol}>↺</Text>
          </TouchableOpacity>
        </View>
      )}
      <Animated.View
        pointerEvents={controlsVisible ? "auto" : "none"}
        style={[styles.controlsContainer, { opacity: controlsOpacity, zIndex: 10 }]}
      >
        <View style={styles.controlsRow}>
          <TouchableOpacity
            accessibilityLabel="Rewind ten seconds"
            onPress={onRewind}
            style={styles.seekButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View style={styles.seekCircle}>
              <Text style={styles.seekNumber}>{seekStep}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={videoCompleted ? "Replay video" : internalPaused ? "Play" : "Pause"}
            onPress={onPlayPause}
            style={styles.playButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View style={styles.playCircle}>
              <Text style={styles.playSymbol}>
                {internalPaused ? "▶" : "⏸"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Fast forward ten seconds"
            onPress={onFastForward}
            style={styles.seekButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <View style={styles.seekCircle}>
              <Text style={styles.seekNumber}>{seekStep}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.timeContainer}>
          <TouchableOpacity
            accessibilityLabel={isMuted ? "Unmute video" : "Mute video"}
            onPress={onToggleMute}
            style={styles.muteButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.muteSymbol}>{isMuted ? "🔇" : "🔊"}</Text>
          </TouchableOpacity>
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
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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