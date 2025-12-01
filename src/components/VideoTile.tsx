import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import FastImage from '@d11/react-native-fast-image';
import { useDataSaver } from '../dataSaver/DataSaverProvider';
import { addBytesDownloaded, overCap } from '../dataSaver/DataUsage';
import NetInfo from '@react-native-community/netinfo';
import { getCachedVideoPath, cacheVideo } from '../services/videoCache';

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
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [hadError, setHadError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const lastTime = useRef(0);
  const cacheKickoff = useRef(false);

  // Reset per video
  useEffect(() => {
    setPlay(false);
    setIsBuffering(false);
    setShowPoster(true);
    setHadError(false);
    setHasStarted(false);
    lastTime.current = 0;
    cacheKickoff.current = false;
  }, [videoId]);

  // Check network status
  useEffect(() => {
    const check = async () => {
      const state = await NetInfo.fetch();
      setIsOffline(!state.isConnected);
    };
    check();
    const unsub = NetInfo.addEventListener((state) => setIsOffline(!state.isConnected));
    return () => { unsub && unsub(); };
  }, []);

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

  const candidates = useMemo(() => {
    if (!r) return [];
    const uniq: string[] = [];
    const add = (u: string | null) => { if (u && !uniq.includes(u)) uniq.push(u); };
    // Choose a fast-start order: preferred first, then fallbacks
    if (!s.enabled) {
      // prioritize quality when saver off
      add(initialAutoPlay ? r.high : r.med);
      add(r.high);
      add(r.med);
      add(r.low);
    } else {
      // saver on: start lower for speed, then climb
      if (s.maxResolution === 'low') {
        add(r.low); add(r.med); add(r.high);
      } else if (s.maxResolution === 'med') {
        add(r.med); add(r.low); add(r.high);
      } else {
        add(r.high); add(r.med); add(r.low);
      }
    }
    return uniq;
  }, [r, s.enabled, s.maxResolution, initialAutoPlay]);

  const [urlIndex, setUrlIndex] = useState(0);
  useEffect(() => { setUrlIndex(0); }, [videoId, candidates.length]);

  const currentUrl = candidates[urlIndex] ?? null;

  // Check for cached video when URL changes
  useEffect(() => {
    if (!currentUrl) return;
    let alive = true;
    (async () => {
      const cached = await getCachedVideoPath(currentUrl);
      if (alive) setCachedUrl(cached);
    })();
    return () => { alive = false; };
  }, [currentUrl]);

  // Prefetch thumbnail so it stays available while video buffers
  useEffect(() => {
    if (r?.thumb) {
      FastImage.preload([{ uri: r.thumb }]);
    }
  }, [r?.thumb]);

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
    setHadError(false);
    setShowPoster(true);
    setIsBuffering(true);
    setHasStarted(false);
    setPlay(true);
  };

  const thumb = r?.thumb || undefined;
  const canDownload = !(s.enabled && s.wifiOnlyDownloads && s.cellular);
  const tryFallback = () => {
    if (urlIndex + 1 < candidates.length) {
      setUrlIndex((i) => i + 1);
      setHadError(false);
      setIsBuffering(true);
      setShowPoster(true);
      setHasStarted(false);
      lastTime.current = 0;
      cacheKickoff.current = false;
      return true;
    }
    return false;
  };

  // Watchdog: if playback doesn't start quickly, drop to next rendition
  useEffect(() => {
    if (!play || !currentUrl || hasStarted) return;
    const t = setTimeout(() => {
      if (!hasStarted) tryFallback();
    }, 3500);
    return () => clearTimeout(t);
  }, [play, currentUrl, hasStarted, urlIndex, candidates.length]);

  return (
    <View style={{ aspectRatio: 9 / 16, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', minHeight: 300, minWidth: 169 }}>
      {play && currentUrl ? (
        <Video
          source={{ uri: (isOffline && cachedUrl) ? 'file://' + cachedUrl : cachedUrl || currentUrl }}
          style={{ flex: 1 }}
          paused={!play}
          resizeMode="cover"
          controls={true}
          poster={thumb}
          posterResizeMode="cover"
          bufferConfig={{
            minBufferMs: 800,
            maxBufferMs: 4000,
            bufferForPlaybackMs: 600,
            bufferForPlaybackAfterRebufferMs: 800,
          }}
          progressUpdateInterval={500}
          onLoadStart={() => {
            setIsBuffering(true);
            setShowPoster(true);
            cacheKickoff.current = false;
            setHasStarted(false);
          }}
          onReadyForDisplay={() => {
            // keep spinner until we confirm playback progressed
            setShowPoster(true);
          }}
          onLoad={() => {
            // keep spinner until we confirm playback progressed
            setShowPoster(true);
          }}
          onError={(e) => {
            console.log('video error', e);
            const switched = tryFallback();
            if (!switched) {
              setIsBuffering(false);
              setShowPoster(true);
              setHadError(true);
              setPlay(false);
            }
          }}
          onProgress={async (p) => {
            const dt = Math.max(0, p.currentTime - lastTime.current);
            lastTime.current = p.currentTime;
            addBytesDownloaded(Math.round(200 * 1024 * dt));
            if (!hasStarted && p.currentTime > 0.05) {
              setHasStarted(true);
              setIsBuffering(false);
              setShowPoster(false);
            }
            if (s.enabled && overCap(s.mobileDataCapMB)) setPlay(false);
            // Cache video during first play if allowed
            if (!cacheKickoff.current && !cachedUrl && currentUrl && p.currentTime >= 0.25) {
              cacheKickoff.current = true;
              if (canDownload) {
                try { await cacheVideo(currentUrl); } catch {}
              }
            }
          }}
            onBuffer={({ isBuffering }) => {
              // Spinner must keep running until playback starts
              setIsBuffering(isBuffering || !hasStarted);
              setShowPoster(isBuffering || !hasStarted);
            }}
          />
        ) : null}

      {(showPoster || !play || !selectedUrl) && (
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onTapPlay}>
          {thumb ? (
            <FastImage source={{ uri: thumb }} style={{ flex: 1 }} resizeMode={FastImage.resizeMode.cover} />
          ) : (
            <Image source={thumb ? { uri: thumb } : undefined} style={{ flex: 1, backgroundColor: '#000' }} resizeMode="cover" />
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
            <Text style={{ color: '#fff', fontWeight: '700' }}>{hadError ? 'Tap to retry' : 'Tap to play (Data Saver)'}</Text>
          </View>
        </Pressable>
      )}

      {(isBuffering || (play && !hasStarted)) && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}
