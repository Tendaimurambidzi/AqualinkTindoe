import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Video, { OnProgressData } from 'react-native-video';
import { appTokens } from '../theme/tokens';
import { useGlobalMute } from '../contexts/GlobalMuteContext';

type FeedVideoPlayerProps = {
  source: { uri: string } | number;
  style?: any;
  paused?: boolean;
  isActive?: boolean;
  poster?: string;
  onPlay?: () => void;
  onError?: (error: any) => void;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center';
  muted?: boolean;
  progressUpdateInterval?: number;
  bufferConfig?: any;
  videoId?: string;
  shouldPreload?: boolean;
};

const formatTime = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
};

const FeedVideoPlayer: React.FC<FeedVideoPlayerProps> = ({
  source,
  style,
  paused = false,
  isActive = true,
  poster: _poster,
  onPlay,
  onError,
  resizeMode = 'cover',
  muted,
  progressUpdateInterval = 250,
  bufferConfig,
  videoId: _videoId,
  shouldPreload: _shouldPreload,
}) => {
  const videoRef = useRef<any>(null);
  const hasSignaledPlayRef = useRef(false);
  const { isGloballyMuted, toggleGlobalMute } = useGlobalMute();
  const [manualPaused, setManualPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isMuted = typeof muted === 'boolean' ? muted : isGloballyMuted;

  const sourceKey = useMemo(() => {
    if (typeof source === 'number') return `asset:${source}`;
    return String(source?.uri || '').trim();
  }, [source]);

  const resolvedSource = useMemo(() => {
    if (typeof source === 'number') return source;
    const uri = String(source?.uri || '').trim();
    if (!uri) return null;
    return { ...source, uri };
  }, [source, sourceKey]);

  useEffect(() => {
    setPlaybackError(null);
    setCurrentTime(0);
    setDuration(0);
    setManualPaused(false);
    setControlsVisible(false);
    setVideoCompleted(false);
    hasSignaledPlayRef.current = false;
  }, [sourceKey]);

  useEffect(() => {
    if (!isActive) {
      // When not active, videos should be muted via global mute
    }
  }, [isActive]);

  const handleLoad = useCallback((meta: any) => {
    setDuration(meta?.duration || 0);
  }, []);

  const handleProgress = useCallback(
    (progress: OnProgressData) => {
      setCurrentTime(progress.currentTime || 0);
      if (!hasSignaledPlayRef.current && progress.currentTime > 0) {
        hasSignaledPlayRef.current = true;
        onPlay?.();
      }
    },
    [onPlay],
  );

  const handleError = useCallback(
    (error: any) => {
      setPlaybackError('Unable to play this video.');
      onError?.(error);
    },
    [onError],
  );

  const handleEnd = useCallback(() => {
    setVideoCompleted(true);
  }, []);

  const hideControlsSoon = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      hideControlsTimerRef.current = null;
    }, 3000);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    hideControlsSoon();
  }, [hideControlsSoon]);

  const safeSeek = useCallback((position: number) => {
    if (videoRef.current) {
      videoRef.current.seek(position);
    }
  }, []);

  const onRewind = useCallback(() => {
    const newPosition = Math.max(0, currentTime - 10);
    safeSeek(newPosition);
    hideControlsSoon();
  }, [currentTime, safeSeek, hideControlsSoon]);

  const onFastForward = useCallback(() => {
    const newPosition = Math.min(duration, currentTime + 10);
    safeSeek(newPosition);
    hideControlsSoon();
  }, [currentTime, duration, safeSeek, hideControlsSoon]);

  const onPlayPause = useCallback(() => {
    if (videoCompleted) {
      safeSeek(0);
      setVideoCompleted(false);
      setManualPaused(false);
    } else {
      setManualPaused(prev => !prev);
    }
    hideControlsSoon();
  }, [videoCompleted, safeSeek, hideControlsSoon]);

  const onToggleMute = useCallback(() => {
    toggleGlobalMute();
    hideControlsSoon();
  }, [toggleGlobalMute, hideControlsSoon]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  if (!resolvedSource) {
    return (
      <View style={[styles.root, style]}>
        <View style={styles.centerOverlay}>
          <Text style={styles.errorText}>Video source unavailable</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, style]}>
      <Video
        ref={videoRef}
        source={resolvedSource}
        style={StyleSheet.absoluteFill}
        paused={paused || manualPaused}
        muted={isMuted}
        resizeMode={resizeMode as any}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        playWhenInactive={false}
        progressUpdateInterval={progressUpdateInterval}
        bufferConfig={bufferConfig}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onError={handleError}
        onEnd={handleEnd}
      />

      <Pressable style={StyleSheet.absoluteFill} onPress={revealControls} />

      {controlsVisible && (
        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <Pressable
            accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
            onPress={onToggleMute}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>{isMuted ? '🔇' : '🔊'}</Text>
          </Pressable>
        </View>
      )}

      {controlsVisible ? (
        <View style={styles.controlsOverlay} pointerEvents="box-none">
          {/* Rewind */}
          <Pressable
            accessibilityLabel={`Rewind 10 seconds`}
            onPress={onRewind}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255,255,255,0.3)',
              borderless: false,
            }}
          >
            <View style={styles.controlCircle}>
              <Text style={styles.controlSymbol}>⏮</Text>
            </View>
          </Pressable>

          {/* Play / Pause / Replay */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              videoCompleted ? 'Replay video' : manualPaused ? 'Play' : 'Pause'
            }
            onPress={onPlayPause}
            style={({ pressed }) => [
              styles.playButton,
              pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255,255,255,0.3)',
              borderless: false,
            }}
          >
            <View style={styles.playCircle}>
              <Text style={styles.playSymbol}>
                {videoCompleted ? '↺' : manualPaused ? '▶' : '⏸'}
              </Text>
            </View>
          </Pressable>

          {/* Fast Forward */}
          <Pressable
            accessibilityLabel={`Fast forward 10 seconds`}
            onPress={onFastForward}
            style={({ pressed }) => [
              styles.controlButton,
              pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] },
            ]}
            hitSlop={{ top: 50, bottom: 50, left: 30, right: 30 }}
            pressRetentionOffset={{ top: 50, bottom: 50, left: 30, right: 30 }}
            android_ripple={{
              color: 'rgba(255,255,255,0.3)',
              borderless: false,
            }}
          >
            <View style={styles.controlCircle}>
              <Text style={styles.controlSymbol}>⏭</Text>
            </View>
          </Pressable>
        </View>
      ) : null}

      {playbackError ? (
        <View style={styles.centerOverlay}>
          <Text style={styles.errorText}>{playbackError}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: appTokens.colors.mediaBackdrop,
    overflow: 'hidden',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 2,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(5,12,20,0.62)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  bottomText: {
    color: appTokens.colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 14,
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
});

export default FeedVideoPlayer;
