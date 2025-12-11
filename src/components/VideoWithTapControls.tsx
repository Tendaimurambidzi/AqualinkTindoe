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
} from "react-native";
import Video, {OnProgressData} from "react-native-video";

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
  muted?: boolean;
  resizeMode?: string;
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
  poster,
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
  muted,
  resizeMode = 'contain',
}) => {
  const videoRef = useRef<Video | null>(null);
  const [internalPaused, setInternalPaused] = useState<boolean>(paused);
  const [controlsVisible, setControlsVisible] = useState<boolean>(false); // Start with controls hidden
  const controlsOpacity = useRef(new Animated.Value(0)).current; // Start with opacity 0
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    setInternalPaused(paused);
  }, [paused]);

  const showControls = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    hideTimer.current = setTimeout(() => {
      hideControls();
    }, hideTimeout);
  }, [controlsOpacity, hideTimeout]);

  const hideControls = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 180,
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
    }
    // Always show controls when tapping anywhere on video
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onToggleOverlay = useCallback(() => {
    if (controlsVisible) {
      hideControls();
    } else {
      showControls();
    }
  }, [controlsVisible, hideControls, showControls]);

  const onRewind = useCallback(() => {
    safeSeek(currentTime - seekStep);
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onFastForward = useCallback(() => {
    safeSeek(currentTime + seekStep);
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onPlayPause = useCallback(() => {
    setInternalPaused(prev => !prev);
    showControls();
  }, [showControls]);

  const handleLoad = useCallback((meta: any) => {
    setDuration(meta.duration || 0);
    onLoad?.(meta);
  }, [onLoad]);

  const handleProgress = useCallback((data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    onProgress?.(data);
  }, [onProgress]);

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
      const announce = internalPaused ? "Player paused. Controls visible." : "Controls visible.";
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) AccessibilityInfo.announceForAccessibility(announce);
      });
    }
  }, [controlsVisible, internalPaused]);

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
        poster={poster}
        posterResizeMode={posterResizeMode}
        disableFocus={disableFocus}
        playInBackground={playInBackground}
        playWhenInactive={playWhenInactive}
        ignoreSilentSwitch={ignoreSilentSwitch}
        controls={controls}
        muted={muted}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onBuffer={onBuffer}
        onError={onError}
      />
      <TouchableWithoutFeedback onPressIn={onVideoTap}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      <Animated.View
        pointerEvents={controlsVisible ? "auto" : "none"}
        style={[styles.controlsContainer, { opacity: controlsOpacity, zIndex: 10 }]}
      >
        <View style={styles.controlsRow}>
          <TouchableOpacity
            accessibilityLabel="Rewind ten seconds"
            onPress={onRewind}
            style={styles.seekButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.seekCircle}>
              <Text style={styles.seekNumber}>{seekStep}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={internalPaused ? "Play" : "Pause"}
            onPress={onPlayPause}
            style={styles.playButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.playCircle}>
              <Text style={styles.playSymbol}>{internalPaused ? "▶" : "⏸"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Fast forward ten seconds"
            onPress={onFastForward}
            style={styles.seekButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.seekCircle}>
              <Text style={styles.seekNumber}>{seekStep}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.timeContainer}>
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
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default VideoWithTapControls;