// VideoWithTapControls.tsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
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
} from 'react-native';
import Video, { OnProgressData } from 'react-native-video';
import { appTokens } from '../theme/tokens';
import { useGlobalMute } from '../contexts/GlobalMuteContext';

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
  posterResizeMode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center';
  disableFocus?: boolean;
  playInBackground?: boolean;
  playWhenInactive?: boolean;
  ignoreSilentSwitch?: 'inherit' | 'ignore' | 'obey';
  controls?: boolean;
  onLoad?: (data: any) => void;
  onBuffer?: (data: any) => void;
  onProgress?: (data: any) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  onPlay?: () => void;
  muted?: boolean;
  playbackRate?: number;
  audioVolume?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center';
  isActive?: boolean;
  onTap?: () => void;
  onMaximize?: () => void; // Reserved for maximize action
  videoId?: string; // Optional id for analytics / parent callbacks only (no storage side effects)
  shouldPreload?: boolean; // Kept for API compatibility; ignored (no background cache pipeline)
};

const VideoWithTapControls: React.FC<Props> = ({
  source,
  style,
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
  onProgress,
  onError,
  onEnd,
  onPlay,
  muted,
  playbackRate = 1,
  audioVolume = 1,
  resizeMode = 'contain',
  isActive = true,
  onTap,
  onMaximize: _onMaximize,
  videoId,
  shouldPreload: _shouldPreload = false,
}) => {
  const videoRef = useRef<any>(null);
  /** Latest `source` for headers/type; updated every render so we do not list `source` in memos. */
  const sourceRef = useRef(source);
  sourceRef.current = source;

  /** Media identity: URI string or `__asset__:id` - stable when parent recreates `{ uri }` objects. */
  const sourceUriKey =
    typeof source === 'number'
      ? `__asset__:${source}`
      : typeof source === 'object' && source && 'uri' in source
        ? String((source as any).uri || '').trim()
        : '';

  // const [internalPaused, setInternalPaused] = useState<boolean>(false); // Removed to prevent loading states
  const [controlsVisible, setControlsVisible] = useState<boolean>(false);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoCompleted, setVideoCompleted] = useState<boolean>(false);
  const hasCalledOnPlay = useRef<boolean>(false);

  // Use global mute context
  const { isGloballyMuted, toggleGlobalMute } = useGlobalMute();
  const forceMuted = muted === true;

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

    hideTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, hideTimeout);
  }, [hideTimeout, controlsOpacity]);

  const hideControls = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }).start(() => setControlsVisible(false));
  }, [controlsOpacity]);

  const onVideoTap = useCallback(() => {
    onTap?.();
    if (!controlsVisible) {
      showControls();
    } else {
      hideControls();
    }
  }, [onTap, controlsVisible, showControls, hideControls]);

  /**
   * Stable `source` for react-native-video: only recomputes when the URI (or asset id) changes.
   * Listing `[source]` caused a new object every parent render -> ExoPlayer reload -> stutter/restart loop.
   */
  const effectiveSource = useMemo(() => {
    const s = sourceRef.current;
    if (typeof s === 'number') return s;
    const uri = sourceUriKey;
    if (!uri) {
      console.warn('VideoWithTapControls: Empty URI provided');
      return null;
    }
    const srcObj = typeof s === 'object' && s && 'uri' in s ? (s as any) : {};
    return { ...srcObj, uri };
  }, [sourceUriKey]);

  // Light reset when the actual media URL changes (FlatList recycle / new post)
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setVideoCompleted(false);
    hasCalledOnPlay.current = false;
  }, [sourceUriKey]);

  // Keep mute state controlled by props when provided (e.g. overlay audio mode),
  // otherwise use global mute state.
  useEffect(() => {
    if (typeof muted === 'boolean') {
      // Props override global mute
      return;
    }
    // Global mute controls default behavior when not overridden by props
  }, [muted]);

  const safeSeek = useCallback((position: number) => {
    if (videoRef.current) {
      videoRef.current.seek(position);
      console.log(`[VideoWithTapControls] Seeking to ${position.toFixed(2)}s`);
    }
  }, []);

  const onToggleMute = useCallback(() => {
    if (forceMuted) {
      return;
    }
    toggleGlobalMute();
    showControls();
  }, [forceMuted, toggleGlobalMute, showControls]);

  // Video controls for user interaction
  const onRewind = useCallback(() => {
    const newPosition = Math.max(0, currentTime - seekStep);
    safeSeek(newPosition);
    showControls();
  }, [currentTime, seekStep, safeSeek, showControls]);

  const onFastForward = useCallback(() => {
    const newPosition = Math.min(duration, currentTime + seekStep);
    safeSeek(newPosition);
    showControls();
  }, [currentTime, duration, seekStep, safeSeek, showControls]);

  const onPlayPause = useCallback(() => {
    if (videoCompleted) {
      // Reset to start
      safeSeek(0);
      setVideoCompleted(false);
      showControls();
    } else {
      // Toggle pause state (parent controls this)
      showControls();
    }
  }, [videoCompleted, safeSeek, showControls]);

  const handleLoad = useCallback(
    (meta: any) => {
      if (__DEV__) {
        console.log('[AqualinkVideo] Load details:', {
          duration: meta.duration,
          currentTime: meta.currentTime,
          naturalSize: meta.naturalSize,
          source,
          isActive: isActive,
          videoCompleted: videoCompleted,
          platform: Platform.OS,
        });
      }
      setDuration(meta.duration || 0);
      onLoad?.(meta);
    },
    [onLoad, isActive, videoCompleted],
  );

  const handleProgress = useCallback(
    (data: OnProgressData) => {
      setCurrentTime(data.currentTime);
      if (
        __DEV__ &&
        Math.floor(data.currentTime) % 5 === 0 &&
        Math.floor(data.currentTime) !== Math.floor(currentTime)
      ) {
        console.log('[VideoWithTapControls] Progress:', {
          currentTime: data.currentTime,
          duration: duration,
          isActive: isActive,
          videoCompleted: videoCompleted,
        });
      }
      onProgress?.(data);
    },
    [onProgress, isActive, duration, currentTime, videoCompleted],
  );

  const handleBuffer = useCallback((data: any) => {
    // Disable buffer callbacks to prevent loading spinners
    // onBuffer?.(data);
  }, []);

  const handleEnd = useCallback(() => {
    hasCalledOnPlay.current = false;
    setVideoCompleted(true);
  }, []);

  // Clear timers when this post's id changes (recycled list row)
  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      setControlsVisible(false);
      hasCalledOnPlay.current = false;
    };
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
        ? 'Video completed. Replay available.'
        : 'Controls visible.';
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        if (enabled) AccessibilityInfo.announceForAccessibility(announce);
      });
    }
  }, [controlsVisible, videoCompleted]);

  // Detect when video starts playing and call onPlay callback
  useEffect(() => {
    if (currentTime > 0 && !hasCalledOnPlay.current) {
      hasCalledOnPlay.current = true;
      onPlay?.();
      // Show controls briefly when video starts playing, then hide
      showControls();
      setTimeout(() => {
        hideControls();
      }, 2000); // Show for 2 seconds when video starts
    }
  }, [currentTime, onPlay, showControls, hideControls]);
  const posterUri =
    initialPoster ||
    (videoCompleted && typeof effectiveSource !== 'number'
      ? String((effectiveSource as any)?.uri || '')
      : '');

  if (!effectiveSource) {
    return (
      <View style={[styles.container, style]}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#000',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#666', fontSize: 16 }}>
            Invalid video source
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={effectiveSource}
        style={StyleSheet.absoluteFill}
        paused={paused || videoCompleted}
        resizeMode={resizeMode as any}
        {...(maxBitRate != null ? { maxBitRate } : {})}
        {...(bufferConfig != null ? { bufferConfig } : {})}
        {...(useTextureView !== undefined
          ? { useTextureView }
          : Platform.OS === 'android'
            ? { useTextureView: false }
            : {})}
        {...(progressUpdateInterval != null ? { progressUpdateInterval } : {})}
        poster={initialPoster ?? undefined}
        posterResizeMode={posterResizeMode as any}
        disableFocus={
          typeof disableFocus === 'boolean'
            ? disableFocus
            : Platform.OS === 'android'
        }
        playInBackground={playInBackground ?? false}
        playWhenInactive={playWhenInactive ?? false}
        ignoreSilentSwitch={ignoreSilentSwitch ?? 'ignore'}
        controls={false}
        muted={typeof muted === 'boolean' ? muted : isGloballyMuted}
        rate={playbackRate}
        preventsDisplaySleepDuringVideoPlayback={isActive}
        volume={audioVolume}
        repeat={false}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onBuffer={handleBuffer}
        onError={(err: any) => {
          try {
            console.error('Video playback error:', err);
            console.error('Error code:', err.errorCode);
            console.error('Error description:', err.errorDescription);
            console.error('Video URI:', (effectiveSource as any)?.uri);

            // If it's a source error, URL is likely invalid
            if (
              err.errorCode === 'source' ||
              err.errorDescription?.includes('Source error')
            ) {
              console.error(
                'ExoPlayer Source Error - Invalid or inaccessible video URL',
              );
            }

            // Safely call onError callback
            try {
              onError?.(err);
            } catch (callbackError) {
              console.error('Error in onError callback:', callbackError);
            }
          } catch (handlingError) {
            console.error('Error in video error handler:', handlingError);
          }
        }}
        onEnd={handleEnd}
        onAudioBecomingNoisy={() => {
          // Handle audio becoming noisy (headphones disconnected)
          if (!isGloballyMuted) {
            toggleGlobalMute();
          }
        }}
      />
      <TouchableWithoutFeedback onPress={onVideoTap}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>
      {/* Only show poster overlay when video is completed, not when paused */}
      {videoCompleted && posterUri ? (
        <View style={styles.posterContainer}>
          <Image
            source={{ uri: posterUri }}
            style={styles.posterImage}
            resizeMode={(posterResizeMode || 'contain') as any}
          />
        </View>
      ) : null}
      <Animated.View
        pointerEvents={controlsVisible ? 'auto' : 'none'}
        style={[
          styles.controlsContainer,
          { opacity: controlsOpacity, zIndex: 10 },
        ]}
      >
        {/* Progress bar at the top */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                },
              ]}
            />
          </View>
        </View>

        {/* Controls row */}
        <View style={styles.controlsRow}>
          <Pressable
            accessibilityLabel={`Rewind ${seekStep} seconds`}
            onPress={onRewind}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255, 255, 255, 0.3)',
              borderless: false,
            }}
          >
            <View style={styles.controlCircle}>
              <Text style={styles.controlSymbol}>⏮</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              videoCompleted ? 'Replay video' : paused ? 'Play' : 'Pause'
            }
            onPress={onPlayPause}
            style={({ pressed }) => [
              styles.playButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255, 255, 255, 0.3)',
              borderless: false,
            }}
          >
            <View style={styles.playCircle}>
              <Text style={styles.playSymbol}>
                {videoCompleted ? '↺' : paused ? '▶' : '⏸'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel={`Fast forward ${seekStep} seconds`}
            onPress={onFastForward}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255, 255, 255, 0.3)',
              borderless: false,
            }}
          >
            <View style={styles.controlCircle}>
              <Text style={styles.controlSymbol}>⏭</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityLabel={isGloballyMuted ? 'Unmute video' : 'Mute video'}
            onPress={onToggleMute}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && {
                opacity: 0.6,
                transform: [{ scale: 0.9 }],
              },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255, 255, 255, 0.3)',
              borderless: false,
            }}
          >
            <View style={styles.controlCircle}>
              <Text style={styles.controlSymbol}>
                {isGloballyMuted ? '🔇' : '🔊'}
              </Text>
            </View>
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
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00C2FF',
    borderRadius: 2,
  },
  controlButton: {
    padding: 8,
    minWidth: 48,
    minHeight: 48,
  },
  controlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSymbol: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlTime: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -8,
  },
  playButton: {
    padding: 12,
    minWidth: 48,
    minHeight: 48,
  },
  playCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playSymbol: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  muteButton: {
    padding: 12,
    minWidth: 48,
    minHeight: 48,
  },
  muteCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteSymbol: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  posterContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default VideoWithTapControls;
