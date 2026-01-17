import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import FastImage from '@d11/react-native-fast-image';
import { useDataSaver } from '../dataSaver/DataSaverProvider';
import { addBytesDownloaded, overCap } from '../dataSaver/DataUsage';
import NetInfo from '@react-native-community/netinfo';
import {
  getCachedVideoPath,
  cacheVideo,
  getVideoManifest,
  saveVideoManifest,
  VideoManifest,
} from '../services/videoCache';

type Renditions = VideoManifest;

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
  const [playbackReady, setPlaybackReady] = useState(false);
  const lastTime = useRef(0);
  const cacheKickoff = useRef(false);
  const loadTimeout = useRef<NodeJS.Timeout | null>(null);
  const logVideoTrouble = (reason: string) => {
    console.warn(`[VideoTile] ${reason} videoId=${videoId}`);
  };

  const onPlaybackReady = () => {
    if (playbackReady) return;
    if (loadTimeout.current) {
      clearTimeout(loadTimeout.current);
      loadTimeout.current = null;
    }
    setPlaybackReady(true);
    setHasStarted(true);
    setIsBuffering(false);
    setShowPoster(false);
  };

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
    let retries = 0;
    const maxRetries = 5;
    const baseDelayMs = 2000;
    let cachedManifest: VideoManifest | null = null;

    const backoff = () => new Promise((resolve) => setTimeout(resolve, Math.min(16000, baseDelayMs * retries)));

    const attemptFetch = async () => {
      cachedManifest = await getVideoManifest(videoId);
      if (isOffline) {
        if (alive) {
          setR(cachedManifest);
          if (!cachedManifest) {
            logVideoTrouble('offline with no cached manifest');
          }
        }
        return;
      }

      while (alive) {
        try {
          const pref = s.preferModernCodec ? 'modern' : 'any';
          const resp = await fetch(
            `https://<REGION>-<PROJECT>.cloudfunctions.net/getPlaybackManifest?videoId=${encodeURIComponent(
              videoId,
            )}&prefer=${pref}`,
          );
          const json = await resp.json();
          if (!alive) return;
          setR(json);
          saveVideoManifest(videoId, json);
          return;
        } catch (e: any) {
          retries += 1;
          const message = e?.message ?? String(e);
          logVideoTrouble(`manifest fetch failed (${message}) attempt=${retries}`);
          if (retries > maxRetries) {
            if (alive) {
              setR(cachedManifest);
              if (!cachedManifest) {
                logVideoTrouble('no cached manifest to fall back to');
              }
            }
            return;
          }
          await backoff();
        }
      }
    };

    attemptFetch();
    return () => {
      alive = false;
    };
  }, [videoId, s.preferModernCodec, isOffline]);

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
    setPlaybackReady(false);
    setPlay(true);
  };

  const thumb = r?.thumb || undefined;
  const canDownload = !(s.enabled && s.wifiOnlyDownloads && s.cellular);
  useEffect(() => {
    if (!currentUrl || cachedUrl || !canDownload || isOffline) return;
    let alive = true;
    (async () => {
      try {
        await cacheVideo(currentUrl);
        if (!alive) return;
        const cached = await getCachedVideoPath(currentUrl);
        if (alive) setCachedUrl(cached);
      } catch (cacheErr) {
        logVideoTrouble(`cache download failed (${String(cacheErr)})`);
      }
    })();
    return () => { alive = false; };
  }, [currentUrl, cachedUrl, canDownload, isOffline]);
  const tryFallback = (reason: string) => {
    logVideoTrouble(`fallback triggered (${reason})`);
    if (urlIndex + 1 < candidates.length) {
      setUrlIndex((i) => i + 1);
      setHadError(false);
      setIsBuffering(true);
      setShowPoster(true);
      setHasStarted(false);
      lastTime.current = 0;
      cacheKickoff.current = false;
      setPlaybackReady(false);
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
        loadTimeout.current = null;
      }
      return true;
    }
    return false;
  };

  // Watchdog: if playback doesn't start quickly, drop to next rendition
  useEffect(() => {
    if (!play || !currentUrl || hasStarted) return;
    const t = setTimeout(() => {
      if (!hasStarted) tryFallback('watchdog timer');
    }, 3500);
    return () => clearTimeout(t);
  }, [play, currentUrl, hasStarted, urlIndex, candidates.length]);

  useEffect(() => {
    return () => {
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
        loadTimeout.current = null;
      }
    };
  }, []);

  return (
    <View style={{ aspectRatio: 9 / 16, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', minHeight: 300, minWidth: 169, position: 'relative' }}>
      {/* Split screen video thumbnail - permanent multi-section display */}
      {r?.low && (
        <>
          {/* Center section - main video area */}
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <Video
              source={{ uri: r.low }}
              style={{
                width: '100%',
                height: '100%'
              }}
              paused={false}
              resizeMode="cover"
              repeat={true}
              muted={true}
              controls={false}
              posterResizeMode="cover"
              bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
              }}
              progressUpdateInterval={1000}
              onLoadStart={() => {}}
              onError={() => {}}
              onProgress={() => {}}
              onBuffer={() => {}}
              onEnd={() => {}}
            />
          </View>

          {/* Left side section - shows left part of video */}
          <View style={{
            position: 'absolute',
            top: -20,
            left: -40,
            width: 40,
            bottom: -20,
            zIndex: 0,
            overflow: 'hidden'
          }}>
            <Video
              source={{ uri: r.low }}
              style={{
                width: '300%',
                height: '120%',
                position: 'absolute',
                top: '-10%',
                left: '0%'
              }}
              paused={false}
              resizeMode="cover"
              repeat={true}
              muted={true}
              controls={false}
              posterResizeMode="cover"
              bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
              }}
              progressUpdateInterval={1000}
              onLoadStart={() => {}}
              onError={() => {}}
              onProgress={() => {}}
              onBuffer={() => {}}
              onEnd={() => {}}
            />
          </View>

          {/* Right side section - shows right part of video */}
          <View style={{
            position: 'absolute',
            top: -20,
            right: -40,
            width: 40,
            bottom: -20,
            zIndex: 0,
            overflow: 'hidden'
          }}>
            <Video
              source={{ uri: r.low }}
              style={{
                width: '300%',
                height: '120%',
                position: 'absolute',
                top: '-10%',
                left: '-200%'
              }}
              paused={false}
              resizeMode="cover"
              repeat={true}
              muted={true}
              controls={false}
              posterResizeMode="cover"
              bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
              }}
              progressUpdateInterval={1000}
              onLoadStart={() => {}}
              onError={() => {}}
              onProgress={() => {}}
              onBuffer={() => {}}
              onEnd={() => {}}
            />
          </View>

          {/* Top section - shows top part of video */}
          <View style={{
            position: 'absolute',
            top: -40,
            left: -20,
            right: -20,
            height: 40,
            zIndex: 0,
            overflow: 'hidden'
          }}>
            <Video
              source={{ uri: r.low }}
              style={{
                width: '120%',
                height: '300%',
                position: 'absolute',
                top: '0%',
                left: '-10%'
              }}
              paused={false}
              resizeMode="cover"
              repeat={true}
              muted={true}
              controls={false}
              posterResizeMode="cover"
              bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
              }}
              progressUpdateInterval={1000}
              onLoadStart={() => {}}
              onError={() => {}}
              onProgress={() => {}}
              onBuffer={() => {}}
              onEnd={() => {}}
            />
          </View>

          {/* Bottom section - shows bottom part of video */}
          <View style={{
            position: 'absolute',
            bottom: -40,
            left: -20,
            right: -20,
            height: 40,
            zIndex: 0,
            overflow: 'hidden'
          }}>
            <Video
              source={{ uri: r.low }}
              style={{
                width: '120%',
                height: '300%',
                position: 'absolute',
                top: '-200%',
                left: '-10%'
              }}
              paused={false}
              resizeMode="cover"
              repeat={true}
              muted={true}
              controls={false}
              posterResizeMode="cover"
              bufferConfig={{
                minBufferMs: 100,
                maxBufferMs: 500,
                bufferForPlaybackMs: 50,
                bufferForPlaybackAfterRebufferMs: 100,
              }}
              progressUpdateInterval={1000}
              onLoadStart={() => {}}
              onError={() => {}}
              onProgress={() => {}}
              onBuffer={() => {}}
              onEnd={() => {}}
            />
          </View>
        </>
      )}

      {/* Static poster fallback if video fails - always available behind video */}
      {thumb && (
        <FastImage
          source={{ uri: thumb }}
          style={posterStyles.fallbackBackground}
          resizeMode={FastImage.resizeMode.cover}
          pointerEvents="none"
        />
      )}

      {play && currentUrl ? (
        <Video
          source={{ uri: (isOffline && cachedUrl) ? 'file://' + cachedUrl : cachedUrl || currentUrl }}
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
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
          setPlaybackReady(false);
          cacheKickoff.current = false;
          setHasStarted(false);
          if (loadTimeout.current) clearTimeout(loadTimeout.current);
          loadTimeout.current = setTimeout(() => {
            if (!playbackReady) {
              tryFallback('load timeout');
            }
          }, 3000);
        }}
          onError={(e) => {
            console.log('video error', e);
            const switched = tryFallback('playback error');
            if (!switched) {
              setIsBuffering(false);
              setShowPoster(true);
              setHadError(true);
              setPlaybackReady(false);
              setPlay(false);
            }
          }}
          onProgress={async (p) => {
            const dt = Math.max(0, p.currentTime - lastTime.current);
            lastTime.current = p.currentTime;
            addBytesDownloaded(Math.round(200 * 1024 * dt));
            if (!hasStarted && p.currentTime > 0.05) {
              onPlaybackReady();
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
              setIsBuffering(isBuffering || !playbackReady);
              setShowPoster(isBuffering || !playbackReady);
            }}
            onEnd={() => {
              // When video ends, stop playing and show poster
              setPlay(false);
              setShowPoster(true);
            }}
          />
        ) : null}

      {(showPoster || !play || !currentUrl) && (
        <Pressable style={posterStyles.overlay} onPress={onTapPlay}>
          <View style={posterStyles.badge}>
            <Text style={posterStyles.badgeText}>
              {hadError ? 'Tap to retry' : 'Tap to play (Data Saver)'}
            </Text>
          </View>
        </Pressable>
      )}

      {showPoster && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
          <ActivityIndicator color="#fff" />
        </View>
      )}
    </View>
  );
}

const posterStyles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  fallbackBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, // Behind video
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#0009',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
  },
});
