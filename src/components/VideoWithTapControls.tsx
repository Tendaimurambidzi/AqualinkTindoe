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
  const [isMuted, setIsMuted] = useState<boolean>(
    typeof muted === 'boolean' ? muted : true,
  );
  const hasCalledOnPlay = useRef<boolean>(false);
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
  // otherwise use local autoplay behavior.
  useEffect(() => {
    if (typeof muted === 'boolean') {
      setIsMuted(muted);
      return;
    }
    if (!videoCompleted && isActive) {
      setIsMuted(false);
    } else if (!isActive) {
      setIsMuted(true);
    }
  }, [videoCompleted, isActive, muted]);

  const safeSeek = useCallback(
    (position: number) => {
      if (videoRef.current) {
        videoRef.current.seek(position);
        console.log(`[VideoWithTapControls] Seeking to ${position.toFixed(2)}s`);
      }
    },
    [],
  );

  const onToggleMute = useCallback(() => {
    if (forceMuted) {
      return;
    }
    setIsMuted(prev => !prev);

    showControls();
  }, [forceMuted, showControls]);

  // Removed seek controls for continuous playback

  // Removed pause/play functionality for continuous playback

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
    [
      onProgress,
      isActive,
      duration,
      currentTime,
      videoCompleted,
    ],
  );

  const handleBuffer = useCallback(
    (data: any) => {
      // Disable buffer callbacks to prevent loading spinners
      // onBuffer?.(data);
    },
    [],
  );

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
      // Hide controls when video starts playing
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      hideTimer.current = setTimeout(() => {
        hideControls();
      }, hideTimeout);
    }
  }, [currentTime, onPlay, hideTimeout, hideControls]);
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
        {...(progressUpdateInterval != null
          ? { progressUpdateInterval }
          : {})}
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
        muted={isMuted}
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

            // If it's a source error, the URL is likely invalid
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
          if (!isMuted) {
            setIsMuted(true);
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
                <View style={styles.timeContainer}>
          <Pressable
            accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
            onPress={onToggleMute}
            style={({ pressed }) => [
              styles.muteButton,
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
            <View style={styles.muteCircle}>
              <Text style={styles.muteSymbol}>
                {isMuted ? '🔇' : '🔊'}
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
