import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Video, { OnProgressData } from 'react-native-video';
import { appTokens } from '../theme/tokens';

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
  const [isMuted, setIsMuted] = useState(true);
  const [manualPaused, setManualPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    hasSignaledPlayRef.current = false;
  }, [sourceKey]);

  useEffect(() => {
    if (!isActive) {
      setIsMuted(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (typeof muted === 'boolean') {
      setIsMuted(muted);
    }
  }, [muted]);

  const handleLoad = useCallback(
    (meta: any) => {
      setDuration(meta?.duration || 0);
    },
    [],
  );

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

  const hideControlsSoon = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      hideControlsTimerRef.current = null;
    }, 2200);
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    hideControlsSoon();
  }, [hideControlsSoon]);

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
        repeat
        resizeMode={resizeMode as any}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        playWhenInactive={false}
        progressUpdateInterval={progressUpdateInterval}
        bufferConfig={bufferConfig}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onError={handleError}
      />

      <Pressable style={StyleSheet.absoluteFill} onPress={revealControls} />

      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
        <Pressable
          accessibilityLabel={isMuted ? 'Unmute video' : 'Mute video'}
          onPress={() => {
            setIsMuted(prev => !prev);
            hideControlsSoon();
          }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>{isMuted ? '🔇' : '🔊'}</Text>
        </Pressable>
      </View>

      {controlsVisible ? (
        <View style={styles.controlsOverlay} pointerEvents="box-none">
          <Pressable
            style={styles.controlPill}
            onPress={() => {
              setManualPaused(prev => !prev);
              hideControlsSoon();
            }}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.controlPillText}>{manualPaused ? '▶' : '⏸'}</Text>
          </Pressable>
          <Pressable
            style={styles.controlPill}
            onPress={() => {
              if (videoRef.current && typeof videoRef.current.seek === 'function') {
                videoRef.current.seek(0);
              }
              setCurrentTime(0);
              hideControlsSoon();
            }}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.controlPillText}>↺</Text>
          </Pressable>
          <Pressable
            style={styles.controlPill}
            onPress={() => {
              setIsMuted(prev => !prev);
              hideControlsSoon();
            }}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.controlPillText}>{isMuted ? '🔇' : '🔊'}</Text>
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
  controlPill: {
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPillText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default FeedVideoPlayer;
