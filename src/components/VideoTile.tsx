import React, { memo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { useGlobalMute } from '../contexts/GlobalMuteContext';

const VideoTile = memo(function VideoTile({
  videoId,
  manifest,
  isActive = true,
}: {
  videoId: string;
  manifest?: { high?: string; med?: string; low?: string; thumb?: string };
  isActive?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const { isGloballyMuted } = useGlobalMute();

  const videoUrl = manifest?.high || manifest?.med || manifest?.low;
  const posterUrl = manifest?.thumb;

  if (!isActive || !videoUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No video</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        paused={false}
        resizeMode="cover"
        repeat={false}
        muted={isGloballyMuted}
        onError={() => setHasError(true)}
        onLoad={() => setHasError(false)}
        poster={posterUrl}
        posterResizeMode="cover"
        bufferConfig={{
          minBufferMs: 1500,
          maxBufferMs: 10000,
          bufferForPlaybackMs: 500,
          bufferForPlaybackAfterRebufferMs: 1000,
        }}
        progressUpdateInterval={250}
        playInBackground={false}
        playWhenInactive={false}
        preventsDisplaySleepDuringVideoPlayback={false}
      />

      {hasError && (
        <Pressable
          style={styles.errorOverlay}
          onPress={() => setHasError(false)}
        >
          <Text style={styles.errorText}>Error - tap to retry</Text>
        </Pressable>
      )}
    </View>
  );
});

export default VideoTile;

const styles = StyleSheet.create({
  container: {
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 315,
    minWidth: 169,
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#fff',
  },
});
