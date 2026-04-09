import { Platform, Alert } from 'react-native';

/**
 * Downloads a wave (video/image) to external storage
 */
export async function downloadWave(waveId: string, mediaUrl: string, fileName?: string): Promise<boolean> {
  try {
    // Dynamic import of RNFS to avoid build errors if not installed
    let RNFS: any;
    try {
      RNFS = require('react-native-fs');
    } catch (e) {
      Alert.alert('Error', 'Download feature not available. Please update the app.');
      return false;
    }

    // Generate filename
    const timestamp = Date.now();
    const extension = getFileExtension(mediaUrl);
    const finalFileName = fileName || `Drift_Wave_${waveId}_${timestamp}.${extension}`;
    let downloadResult: any;

    if (Platform.OS === 'android') {
      const downloadDir = RNFS.DownloadDirectoryPath || RNFS.ExternalDirectoryPath;
      const downloadPath = `${downloadDir}/${finalFileName}`;
      downloadResult = await RNFS.downloadFile({
        fromUrl: mediaUrl,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: (res: any) => {
          const total = Number(res.contentLength || 0);
          if (!total) return;
          const progress = (Number(res.bytesWritten || 0) / total) * 100;
          console.log(`Download progress: ${progress.toFixed(0)}%`);
        },
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          mediaScannable: true,
          title: finalFileName,
          description: 'Downloading MoMo',
          path: downloadPath,
        },
      }).promise;
    } else {
      const downloadPath = `${RNFS.DocumentDirectoryPath}/${finalFileName}`;
      downloadResult = await RNFS.downloadFile({
        fromUrl: mediaUrl,
        toFile: downloadPath,
        background: true,
        discretionary: true,
        progress: (res: any) => {
          const total = Number(res.contentLength || 0);
          if (!total) return;
          const progress = (Number(res.bytesWritten || 0) / total) * 100;
          console.log(`Download progress: ${progress.toFixed(0)}%`);
        },
      }).promise;
    }

    if (downloadResult.statusCode === 200) {
      // Notify backend of download
      try {
        const cfg = require('../../liveConfig');
        const backendBase = cfg?.BACKEND_BASE_URL || '';
        if (backendBase) {
          await fetch(`${backendBase}/wave/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ waveId }),
          });
        }
      } catch (e) {
        console.warn('Failed to notify backend of download:', e);
      }

      // Show success message with file location
      const locationMsg = Platform.OS === 'ios' ? 'Files app' : 'Downloads folder';
      
      Alert.alert(
        'Download Complete',
        `Wave saved to ${locationMsg}\n${finalFileName}`,
        [{ text: 'OK' }]
      );

      return true;
    } else {
      throw new Error(`Download failed with status ${downloadResult.statusCode}`);
    }
  } catch (error) {
    console.error('Download wave error:', error);
    Alert.alert('Download Failed', 'Could not download wave. Please try again.');
    return false;
  }
}

/**
 * Get file extension from URL
 */
function getFileExtension(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('.mp4')) return 'mp4';
  if (urlLower.includes('.mov')) return 'mov';
  if (urlLower.includes('.m4v')) return 'm4v';
  if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return 'jpg';
  if (urlLower.includes('.png')) return 'png';
  if (urlLower.includes('.webp')) return 'webp';
  
  // Check if URL suggests video or image
  if (urlLower.includes('video')) return 'mp4';
  if (urlLower.includes('image')) return 'jpg';
  
  // Default
  return 'mp4';
}

/**
 * Share a drift link
 */
export async function shareDriftLink(liveId: string, channel: string, title?: string): Promise<boolean> {
  try {
    const { Share } = require('react-native');
    
    // Get shareable link from backend
    let shareMessage = `Join my Drift live session!`;
    
    try {
      const cfg = require('../../liveConfig');
      const backendBase = cfg?.BACKEND_BASE_URL || '';
      if (backendBase) {
        const response = await fetch(`${backendBase}/drift/share-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liveId, channel, title }),
        });
        
        if (response.ok) {
          const data = await response.json();
          shareMessage = data.message || shareMessage;
        }
      }
    } catch (e) {
      console.warn('Failed to get share link from backend:', e);
      // Fallback to basic message
      shareMessage = `Join my Drift: ${title || 'Live Stream'}!\nChannel: ${channel}`;
    }

    const result = await Share.share({
      message: shareMessage,
      title: title || 'Join my Drift',
    });

    if (result.action === Share.sharedAction) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Share drift link error:', error);
    Alert.alert('Share Failed', 'Could not share drift link.');
    return false;
  }
}
