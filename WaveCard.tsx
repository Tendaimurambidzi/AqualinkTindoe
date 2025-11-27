// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';

type Props = {
  videoUrl: string;          // original video url (used when not muxed)
  audioUrl?: string;         // optional attached audio (ignored when playbackUrl provided)
  playbackUrl?: string;      // server-muxed single stream (video+audio)
  isFocused?: boolean;       // true when visible/active
  onProgress?: (seconds: number) => void;
  onLoaded?: (duration: number) => void;
};

export default function WaveCard({ videoUrl, audioUrl, playbackUrl, isFocused = true, onProgress, onLoaded }: Props) {
  const videoRef = useRef<Video>(null);
  const audioRef = useRef<Video>(null);
  const [playing, setPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isWifi, setIsWifi] = useState(true);

  const useSingle = !!playbackUrl;
  const hasAudio = !!audioUrl && !useSingle;

  useEffect(() => {
    try {
      const NetInfo = require('@react-native-community/netinfo').default;
      NetInfo.fetch().then((s: any) => setIsWifi(!!s?.isWifi || s?.type === 'wifi'));
      const unsub = NetInfo.addEventListener((s: any) => setIsWifi(!!s?.isWifi || s?.type === 'wifi'));
      return () => { try { unsub && unsub(); } catch {} };
    } catch {}
  }, []);

  // Data saver caps (keep in sync with App bridge defaults)
  const maxBitrate = isWifi ? 2_000_000 : 1_000_000;

  useEffect(() => {
    // Start playing when focused, stop when not.
    // AppState listener handles backgrounding.
    setPlaying(isFocused);

    if (isFocused) {
      // When becoming focused, seek both to the beginning to restart.
      videoRef.current?.seek(0);
      if (hasAudio) {
        audioRef.current?.seek(0);
      }
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/) && isFocused) {
        setPlaying(false);
      } else if (nextAppState === 'active' && isFocused) {
        setPlaying(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused, hasAudio]);

  const handleVideoLoad = (m: any) => {
    onLoaded?.(m?.duration || 0);
  };
  const handleVideoProgress = (p: any) => {
    setVideoProgress(p?.currentTime || 0);
    onProgress?.(p?.currentTime || 0);
  };

  // Pause both audio and video if either errors or buffers (network issue)
  const handleSyncError = (e: any) => {
    setPlaying(false);
  };
  const handleBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    if (isBuffering) setPlaying(false);
  };

  // Only disable the video's audio track when a separate audio is present.
  const videoAudioTrackProp = hasAudio ? { selectedAudioTrack: { type: 'disabled' as const } } : {};

  return (
    <View style={styles.stage}>
      {useSingle ? (
        <Video
          ref={videoRef}
          source={{ uri: playbackUrl! }}
          autoplay
          style={StyleSheet.absoluteFill}
          paused={!playing}
          maxBitRate={maxBitrate}
          repeat
          resizeMode="contain"
          rate={1.0}
          playInBackground={false}
          onLoadStart={() => console.log('WaveCard: Video(load single) started.')}
          {...(Platform.OS === 'android' ? { androidImplementation: 'exoplayer' } : {})}
          onLoad={handleVideoLoad}
          onProgress={handleVideoProgress}
          onError={handleSyncError}
          onBuffer={handleBuffer}
        />
      ) : (
        <>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        autoplay
        style={StyleSheet.absoluteFill}
        paused={!playing}
        maxBitRate={maxBitrate}
        repeat
        resizeMode="contain"
        rate={1.0}
        playInBackground={false}
        onLoadStart={() => console.log('WaveCard: Video load started.')}
        {...videoAudioTrackProp}
        {...(Platform.OS === 'android' ? { androidImplementation: 'exoplayer' } : {})}
        onLoad={handleVideoLoad}
        onProgress={handleVideoProgress}
        onError={handleSyncError}
        onBuffer={handleBuffer}
      />

          {/* AUDIO: hidden player only when separate audio is present */}
          {hasAudio && (
            <Video
              ref={audioRef}
              source={{ uri: audioUrl! }}
              autoplay
              audioOnly
              paused={!playing}
              playInBackground
              ignoreSilentSwitch="ignore"
              {...(Platform.OS === 'ios' ? ({ mixWithOthers: true } as any) : {})}
              onLoadStart={() => console.log('WaveCard: Audio load started.')}
              onLoad={() => {
                // If video is already playing, seek audio to match video time
                if (videoProgress > 0.1) {
                  audioRef.current?.seek(videoProgress);
                }
              }}
              onProgress={(p) => setAudioProgress(p?.currentTime || 0)}
              onError={handleSyncError}
              onBuffer={handleBuffer}
              style={{ width: 0, height: 0 }}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
    flex: 1,
  },
});
