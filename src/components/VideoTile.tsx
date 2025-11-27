import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Video from 'react-native-video';
import FastImage from '@d11/react-native-fast-image';
import { useDataSaver } from '../dataSaver/DataSaverProvider';
import { addBytesDownloaded, overCap } from '../dataSaver/DataUsage';

type Renditions = {
  low: string | null;
  med: string | null;
  high: string | null;
  thumb: string | null;
};

export default function VideoTile({
  videoId,
  initialAutoPlay = false,
  uid,
}: {
  videoId: string;
  initialAutoPlay?: boolean;
  uid?: string;
}) {
  const s = useDataSaver();
  const [r, setR] = useState<Renditions | null>(null);
  const [play, setPlay] = useState<boolean>(false);
  const lastTime = useRef(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = await fetch(
          `https://<REGION>-<PROJECT>.cloudfunctions.net/getPlaybackManifest?videoId=${encodeURIComponent(
            videoId
          )}&prefer=${s.preferModernCodec ? 'modern' : 'any'}`
        );
        const json = await resp.json();
        if (alive) setR(json);
      } catch (e) {
        if (alive) setR({ low: null, med: null, high: null, thumb: null });
      }
    })();
    return () => {
      alive = false;
    };
  }, [videoId, s.preferModernCodec]);

  const selectedUrl = useMemo(() => {
    if (!r) return null;
    if (!s.enabled) return initialAutoPlay ? r.high || r.med || r.low : r.med || r.low || r.high;
    const byPref = s.maxResolution === 'low' ? r.low : s.maxResolution === 'med' ? r.med : r.high;
    return byPref || r.low || r.med || r.high;
  }, [r, s.enabled, s.maxResolution, initialAutoPlay]);

  useEffect(() => {
    if (!r) return;
    if (!s.enabled) {
      setPlay(initialAutoPlay);
      return;
    }
    if (s.autoplayOnWifiOnly && s.cellular) {
      setPlay(false);
    } else {
      setPlay(!s.thumbnailsOnlyInFeed && initialAutoPlay);
    }
  }, [r, s.enabled, s.autoplayOnWifiOnly, s.cellular, s.thumbnailsOnlyInFeed, initialAutoPlay]);

  const onTapPlay = () => {
    if (s.enabled && s.wifiOnlyDownloads && s.cellular) return;
    setPlay(true);
  };

  const thumb = r?.thumb || undefined;

  return (
    <View style={{ aspectRatio: 9 / 16, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', minHeight: 300, minWidth: 169 }}>
      {!play || !selectedUrl ? (
        <Pressable style={{ flex: 1 }} onPress={onTapPlay}>
          {thumb ? (
            <FastImage source={{ uri: thumb }} style={{ flex: 1 }} resizeMode={FastImage.resizeMode.cover} />
          ) : (
            <Image source={thumb ? { uri: thumb } : undefined} style={{ flex: 1 }} resizeMode="cover" />
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: '#0009',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Tap to play (Data‑Light)</Text>
          </View>
        </Pressable>
      ) : (
        <Video
          source={{ uri: selectedUrl! }}
          style={{ flex: 1 }}
          paused={!play}
          resizeMode="cover"
          controls={true}
          onError={(e) => console.log('video error', e)}
          onProgress={(p) => {
            const dt = Math.max(0, p.currentTime - lastTime.current);
            lastTime.current = p.currentTime;
            addBytesDownloaded(Math.round(200 * 1024 * dt));
            if (s.enabled && overCap(s.mobileDataCapMB)) setPlay(false);
          }}
        />
      )}
    </View>
  );
}

