import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const VIDEO_CACHE_DIR = RNFS.CachesDirectoryPath + '/video_cache';
const MANIFEST_CACHE_PREFIX = '@drift_video_manifest_';

// Create a safe filename from URL using simple hash
function createSafeFileName(url: string): string {
  // Simple hash function for React Native compatibility
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const hashStr = Math.abs(hash).toString(16);
  const lower = url.toLowerCase();
  const extension = /\.m3u8(\?|$)/i.test(url)
    ? '.m3u8'
    : lower.includes('.webm')
      ? '.webm'
      : lower.includes('.mov')
        ? '.mov'
        : '.mp4';
  return `${hashStr}${extension}`;
}

export async function clearCorruptedCache() {
  try {
    const exists = await RNFS.exists(VIDEO_CACHE_DIR);
    if (exists) {
      await RNFS.unlink(VIDEO_CACHE_DIR);
      console.log('Cleared corrupted video cache directory');
    }
    await RNFS.mkdir(VIDEO_CACHE_DIR);
    console.log('Created fresh video cache directory');
  } catch (error) {
    console.warn('Error clearing video cache:', error);
  }
}

export async function ensureVideoCacheDir() {
  const exists = await RNFS.exists(VIDEO_CACHE_DIR);
  if (!exists) {
    await RNFS.mkdir(VIDEO_CACHE_DIR);
  }
}

export async function getCachedVideoPath(url: string): Promise<string | null> {
  const fileName = createSafeFileName(url);
  const filePath = `${VIDEO_CACHE_DIR}/${fileName}`;
  const exists = await RNFS.exists(filePath);
  return exists ? filePath : null;
}

export async function cacheVideo(url: string): Promise<string> {
  await ensureVideoCacheDir();
  const fileName = createSafeFileName(url);
  const filePath = `${VIDEO_CACHE_DIR}/${fileName}`;
  const exists = await RNFS.exists(filePath);
  if (exists) return filePath;
  
  try {
    const result = await RNFS.downloadFile({ 
      fromUrl: url, 
      toFile: filePath,
      progressDivider: 1,
      progress: (res) => {
        if (res.bytesWritten > 0) {
          console.log(`Video caching progress: ${Math.round((res.bytesWritten / res.contentLength) * 100)}%`);
        }
      }
    }).promise;
    if (result.statusCode === 200) {
      console.log(`Video cached successfully: ${fileName}`);
      return filePath;
    }
    throw new Error(`Failed to cache video: HTTP ${result.statusCode}`);
  } catch (error) {
    console.warn(`Video cache error for ${url}:`, error);
    throw error;
  }
}

export type VideoManifest = {
  high: string | null;
  med: string | null;
  low: string | null;
  thumb: string | null;
};

export async function saveVideoManifest(videoId: string, manifest: VideoManifest) {
  try {
    await AsyncStorage.setItem(`${MANIFEST_CACHE_PREFIX}${videoId}`, JSON.stringify(manifest));
  } catch (err) {
    console.warn('Failed to cache video manifest', err);
  }
}

export async function getVideoManifest(videoId: string): Promise<VideoManifest | null> {
  try {
    const stored = await AsyncStorage.getItem(`${MANIFEST_CACHE_PREFIX}${videoId}`);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (err) {
    console.warn('Failed to load cached video manifest', err);
    return null;
  }
}

export async function prefetchNextVideos(videoIds: string[], vibesById: Record<string, any>) {
  const prefetchPromises = videoIds.map(async (videoId) => {
    try {
      const vibe = vibesById[videoId];
      if (!vibe?.playbackUrl) return;

      const cachedPath = await getCachedVideoPath(vibe.playbackUrl);
      if (cachedPath) return; // Already cached

      // Check manifest first
      const manifest = await getVideoManifest(videoId);
      if (manifest?.med) {
        const medPath = await getCachedVideoPath(manifest.med);
        if (medPath) {
          console.log(`✅ Using cached med quality for ${videoId}`);
          return;
        }
      }

      // Cache medium quality first (data saver friendly)
      const qualityUrls = [
        vibe.playbackUrl, // Original
      ];
      
      for (const url of qualityUrls) {
        try {
          await cacheVideo(url);
          console.log(`✅ Prefetched ${videoId}: ${url}`);
          break;
        } catch (cacheErr) {
          console.warn(`Failed to prefetch ${videoId}:`, cacheErr);
        }
      }
    } catch (err) {
      console.warn(`Prefetch error for ${videoId}:`, err);
    }
  });

  await Promise.allSettled(prefetchPromises);
  console.log(`🎥 Prefetch complete: ${videoIds.length} videos`);
}

