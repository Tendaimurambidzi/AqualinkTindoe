import AsyncStorage from '@react-native-async-storage/async-storage';

const POSITION_PREFIX = '@drift_video_position_';

type SavedPosition = {
  position: number;
  updatedAt: number;
};

const memoryCache = new Map<string, number>();

export async function saveVideoPosition(
  videoId: string,
  position: number,
): Promise<void> {
  try {
    const key = `${POSITION_PREFIX}${videoId}`;
    const value: SavedPosition = {
      position,
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(value));
    memoryCache.set(videoId, position);
  } catch (err) {
    console.warn('Failed to save video position:', err);
  }
}

export async function getVideoPosition(
  videoId: string,
): Promise<number | null> {
  // Check memory cache first for instant return
  if (memoryCache.has(videoId)) {
    return memoryCache.get(videoId) ?? null;
  }

  try {
    const key = `${POSITION_PREFIX}${videoId}`;
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;
    const parsed: SavedPosition = JSON.parse(stored);
    // Only return if saved within last 24 hours
    const ageHours = (Date.now() - parsed.updatedAt) / (1000 * 60 * 60);
    if (ageHours > 24) {
      return null;
    }
    memoryCache.set(videoId, parsed.position);
    return parsed.position;
  } catch (err) {
    console.warn('Failed to load video position:', err);
    return null;
  }
}

export function getVideoPositionSync(videoId: string): number | null {
  const cached = memoryCache.get(videoId);
  if (cached !== undefined) return cached;
  return null;
}

export async function clearVideoPosition(videoId: string): Promise<void> {
  try {
    const key = `${POSITION_PREFIX}${videoId}`;
    await AsyncStorage.removeItem(key);
    memoryCache.delete(videoId);
  } catch (err) {
    console.warn('Failed to clear video position:', err);
  }
}
