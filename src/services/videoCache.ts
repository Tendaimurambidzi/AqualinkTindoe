import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const VIDEO_CACHE_DIR = RNFS.CachesDirectoryPath + '/video_cache';
const MANIFEST_CACHE_PREFIX = '@drift_video_manifest_';

export async function ensureVideoCacheDir() {
  const exists = await RNFS.exists(VIDEO_CACHE_DIR);
  if (!exists) {
    await RNFS.mkdir(VIDEO_CACHE_DIR);
  }
}

export async function getCachedVideoPath(url: string): Promise<string | null> {
  const fileName = encodeURIComponent(url);
  const filePath = `${VIDEO_CACHE_DIR}/${fileName}`;
  const exists = await RNFS.exists(filePath);
  return exists ? filePath : null;
}

export async function cacheVideo(url: string): Promise<string> {
  await ensureVideoCacheDir();
  const fileName = encodeURIComponent(url);
  const filePath = `${VIDEO_CACHE_DIR}/${fileName}`;
  const exists = await RNFS.exists(filePath);
  if (exists) return filePath;
  const result = await RNFS.downloadFile({ fromUrl: url, toFile: filePath }).promise;
  if (result.statusCode === 200) return filePath;
  throw new Error('Failed to cache video');
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
