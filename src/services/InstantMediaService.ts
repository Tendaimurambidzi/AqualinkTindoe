// InstantMediaService.ts - TikTok-style instant loading for entire app
import FastImage from '@d11/react-native-fast-image';
import { Platform } from 'react-native';

// Global cache for instant media access
const imageCache = new Map<string, { uri: string; loaded: boolean; priority: number }>();
const videoCache = new Map<string, { uri: string; cached: boolean }>();
const preloadingQueue = new Set<string>();
const MAX_CACHE_SIZE = 200; // Limit cache size for performance

// Priority levels for preloading
export enum MediaPriority {
  CRITICAL = 1,    // Currently visible
  HIGH = 2,        // Next to be visible
  NORMAL = 3,      // In current feed
  LOW = 4,         // Background preloading
}

class InstantMediaService {
  private static instance: InstantMediaService;
  private preloadTimer: NodeJS.Timeout | null = null;

  static getInstance(): InstantMediaService {
    if (!InstantMediaService.instance) {
      InstantMediaService.instance = new InstantMediaService();
    }
    return InstantMediaService.instance;
  }

  // Preload single image with priority
  preloadImage(uri: string, priority: MediaPriority = MediaPriority.NORMAL): void {
    if (!uri || preloadingQueue.has(uri)) return;

    preloadingQueue.add(uri);

    // Add to cache immediately for instant access
    imageCache.set(uri, { uri, loaded: true, priority });

    // Preload with FastImage - no artificial delays
    FastImage.preload([{
      uri,
      priority: this.getFastImagePriority(priority),
    }]);

    // Remove from queue immediately - preloading started
    preloadingQueue.delete(uri);

    // Clean cache if too large
    this.cleanCache();
  }

  // Preload multiple images (batch optimization)
  preloadImages(uris: string[], priority: MediaPriority = MediaPriority.NORMAL): void {
    const preloadBatch = uris.slice(0, 10); // Limit batch size
    preloadBatch.forEach(uri => this.preloadImage(uri, priority));
  }

  // Preload video for instant playback
  preloadVideo(uri: string): void {
    if (!uri || videoCache.has(uri)) return;

    videoCache.set(uri, { uri, cached: true });
    
    // Videos are considered "cached" immediately for instant playback
    // The actual video component will handle streaming
  }

  // Get cached image source (instant)
  getImageSource(uri: string): { uri: string } | null {
    if (!uri) return null;
    
    const cached = imageCache.get(uri);
    if (cached) {
      // Trigger preload if not loaded yet
      if (!cached.loaded) {
        this.preloadImage(uri, MediaPriority.CRITICAL);
      }
      return { uri };
    }
    
    // Cache miss - preload immediately
    this.preloadImage(uri, MediaPriority.CRITICAL);
    return { uri };
  }

  // Get cached video source (instant)
  getVideoSource(uri: string): { uri: string } | null {
    if (!uri) return null;
    
    const cached = videoCache.get(uri);
    if (!cached) {
      this.preloadVideo(uri);
    }
    
    return { uri };
  }

  // Preload media from feed data (TikTok-style predictive loading)
  preloadFromFeed(feedItems: any[]): void {
    const imageUris: string[] = [];
    const videoUris: string[] = [];

    feedItems.forEach((item, index) => {
      // Extract media URIs from different post types
      if (item.media?.uri) {
        if (item.media.type === 'video') {
          videoUris.push(item.media.uri);
        } else {
          imageUris.push(item.media.uri);
        }
      }

      // Extract from mediaItems array
      if (item.mediaItems && Array.isArray(item.mediaItems)) {
        item.mediaItems.forEach((mediaItem: any) => {
          if (mediaItem.uri) {
            if (mediaItem.type === 'video') {
              videoUris.push(mediaItem.uri);
            } else {
              imageUris.push(mediaItem.uri);
            }
          }
        });
      }

      // Extract avatar images
      if (item.user?.avatar) {
        imageUris.push(item.user.avatar);
      }

      // Set priority based on position (first items are critical)
      const priority = index < 3 ? MediaPriority.CRITICAL : 
                       index < 10 ? MediaPriority.HIGH : MediaPriority.NORMAL;
    });

    // Batch preload with priorities
    this.preloadImages(imageUris.slice(0, 15), MediaPriority.HIGH);
    videoUris.slice(0, 10).forEach(uri => this.preloadVideo(uri));

    // Schedule background preloading for remaining items
    this.scheduleBackgroundPreload(imageUris.slice(15), videoUris.slice(10));
  }

  // Smart preloading based on scroll position
  preloadOnScroll(visibleItems: any[], upcomingItems: any[]): void {
    // Critical: currently visible items
    visibleItems.forEach(item => {
      this.extractAndPreloadMedia(item, MediaPriority.CRITICAL);
    });

    // High: next items (predictive loading)
    upcomingItems.slice(0, 5).forEach(item => {
      this.extractAndPreloadMedia(item, MediaPriority.HIGH);
    });
  }

  // Extract media from item and preload
  private extractAndPreloadMedia(item: any, priority: MediaPriority): void {
    if (item.media?.uri) {
      if (item.media.type === 'video') {
        this.preloadVideo(item.media.uri);
      } else {
        this.preloadImage(item.media.uri, priority);
      }
    }

    if (item.user?.avatar) {
      this.preloadImage(item.user.avatar, priority);
    }

    if (item.mediaItems) {
      item.mediaItems.forEach((mediaItem: any) => {
        if (mediaItem.uri) {
          if (mediaItem.type === 'video') {
            this.preloadVideo(mediaItem.uri);
          } else {
            this.preloadImage(mediaItem.uri, priority);
          }
        }
      });
    }
  }

  // Schedule background preloading
  private scheduleBackgroundPreload(images: string[], videos: string[]): void {
    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer);
    }

    this.preloadTimer = setTimeout(() => {
      this.preloadImages(images, MediaPriority.LOW);
      videos.forEach(uri => this.preloadVideo(uri));
    }, 1000); // Start background preloading after 1 second
  }

  // Clean cache to prevent memory issues
  private cleanCache(): void {
    if (imageCache.size > MAX_CACHE_SIZE) {
      // Sort by priority and remove oldest low-priority items
      const sortedEntries = Array.from(imageCache.entries())
        .sort(([, a], [, b]) => a.priority - b.priority);

      const toRemove = sortedEntries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => imageCache.delete(key));
    }
  }

  // Convert MediaPriority to FastImage priority
  private getFastImagePriority(priority: MediaPriority): FastImage.priority {
    switch (priority) {
      case MediaPriority.CRITICAL:
        return FastImage.priority.high;
      case MediaPriority.HIGH:
        return FastImage.priority.high;
      case MediaPriority.NORMAL:
        return FastImage.priority.normal;
      case MediaPriority.LOW:
        return FastImage.priority.low;
      default:
        return FastImage.priority.normal;
    }
  }

  // Clear cache (for memory management)
  clearCache(): void {
    imageCache.clear();
    videoCache.clear();
    preloadingQueue.clear();
    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer);
      this.preloadTimer = null;
    }
  }

  // Get cache stats (for debugging)
  getCacheStats(): { images: number; videos: number; preloading: number } {
    return {
      images: imageCache.size,
      videos: videoCache.size,
      preloading: preloadingQueue.size,
    };
  }

  // Preload user avatars (instant profile loading)
  preloadUserAvatars(users: Array<{ uid: string; avatar?: string }>): void {
    const avatarUris = users
      .map(user => user.avatar)
      .filter(Boolean) as string[];

    this.preloadImages(avatarUris, MediaPriority.HIGH);
  }

  // Get instant image source for external components
  static getInstantImageSource(uri: string): { uri: string } | null {
    const service = InstantMediaService.getInstance();
    return service.getImageSource(uri);
  }

  // Get instant video source for external components
  static getInstantVideoSource(uri: string): { uri: string } | null {
    const service = InstantMediaService.getInstance();
    return service.getVideoSource(uri);
  }
}

export default InstantMediaService;
