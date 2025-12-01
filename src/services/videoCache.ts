import RNFS from 'react-native-fs';

const VIDEO_CACHE_DIR = RNFS.CachesDirectoryPath + '/video_cache';

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
