/**
 * Video Watermarking Service
 * Adds SPL logo watermark to videos on the right vertical side
 */

import { Platform } from 'react-native';

/**
 * Process video with watermark using FFmpeg
 * @param sourceUrl - Original video URL or path
 * @param outputPath - Where to save the watermarked video
 * @param watermarkPath - Path to the SPL logo image
 * @returns Path to the watermarked video
 */
export async function addWatermarkToVideo(
  sourceUrl: string,
  outputPath: string,
  watermarkPath?: string
): Promise<string> {
  try {
    // Try to use react-native-ffmpeg if available
    let FFmpegKit: any = null;
    let FFmpegKitConfig: any = null;
    let ReturnCode: any = null;
    
    try {
      const ffmpegModule = require('ffmpeg-kit-react-native');
      FFmpegKit = ffmpegModule.FFmpegKit;
      FFmpegKitConfig = ffmpegModule.FFmpegKitConfig;
      ReturnCode = ffmpegModule.ReturnCode;
    } catch {
      console.log('FFmpeg not available - downloading original video');
      return sourceUrl;
    }

    // Default watermark position: right side, vertically centered
    // Watermark will be 20% of video height, positioned 10px from right edge
    const watermarkFilter = watermarkPath
      ? `overlay=W-w-10:H/2-h/2` // Right side, vertically centered
      : null;

    if (!watermarkFilter || !FFmpegKit) {
      // If no watermark or FFmpeg not available, return original
      return sourceUrl;
    }

    // Build FFmpeg command
    // -i: input video
    // -i: input watermark image
    // -filter_complex: apply watermark overlay on right side
    // -c:a copy: copy audio without re-encoding
    const command = [
      '-i', sourceUrl,
      '-i', watermarkPath,
      '-filter_complex', `[1:v]scale=iw*0.15:-1[wm];[0:v][wm]${watermarkFilter}`,
      '-c:a', 'copy',
      '-y', // Overwrite output
      outputPath
    ].join(' ');

    console.log('Watermarking video with command:', command);

    // Execute FFmpeg command
    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      console.log('Video watermarked successfully:', outputPath);
      return outputPath;
    } else {
      console.error('FFmpeg watermarking failed');
      return sourceUrl;
    }
  } catch (error) {
    console.error('Watermark error:', error);
    // Return original URL if watermarking fails
    return sourceUrl;
  }
}

/**
 * Get the path to the SPL logo watermark
 * This should point to your logo asset
 */
export function getSPLWatermarkPath(): string | null {
  try {
    // Try to resolve the logo from assets
    // You should have an SPL logo in your assets folder
    const RNFS = require('react-native-fs');
    
    if (Platform.OS === 'android') {
      return `${RNFS.DocumentDirectoryPath}/spl_logo.png`;
    } else if (Platform.OS === 'ios') {
      return `${RNFS.MainBundlePath}/spl_logo.png`;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Download video with SPL watermark
 * @param videoUrl - URL of the video to download
 * @param waveId - ID of the wave (for filename)
 * @returns Path to the downloaded and watermarked video
 */
export async function downloadVideoWithWatermark(
  videoUrl: string,
  waveId: string
): Promise<string> {
  try {
    let RNFS: any = null;
    try {
      RNFS = require('react-native-fs');
    } catch {
      console.log('react-native-fs not available');
      return videoUrl;
    }

    const timestamp = Date.now();
    const downloadPath = `${RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath}/wave_${waveId}_${timestamp}.mp4`;
    const watermarkedPath = `${RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath}/wave_${waveId}_${timestamp}_SPL.mp4`;

    // Download the video first
    console.log('Downloading video from:', videoUrl);
    const downloadResult = await RNFS.downloadFile({
      fromUrl: videoUrl,
      toFile: downloadPath,
    }).promise;

    if (downloadResult.statusCode !== 200) {
      throw new Error('Download failed');
    }

    console.log('Video downloaded to:', downloadPath);

    // Add watermark
    const watermarkPath = getSPLWatermarkPath();
    const finalPath = await addWatermarkToVideo(
      downloadPath,
      watermarkedPath,
      watermarkPath || undefined
    );

    // Clean up original download if watermarking succeeded
    if (finalPath !== downloadPath && finalPath === watermarkedPath) {
      try {
        await RNFS.unlink(downloadPath);
      } catch {}
    }

    return finalPath;
  } catch (error) {
    console.error('Download with watermark error:', error);
    throw error;
  }
}

/**
 * Simple text watermark fallback if logo is not available
 * Adds "SPL" text watermark on the right side
 */
export async function addTextWatermark(
  sourceUrl: string,
  outputPath: string,
  text: string = 'SPL'
): Promise<string> {
  try {
    let FFmpegKit: any = null;
    let ReturnCode: any = null;
    
    try {
      const ffmpegModule = require('ffmpeg-kit-react-native');
      FFmpegKit = ffmpegModule.FFmpegKit;
      ReturnCode = ffmpegModule.ReturnCode;
    } catch {
      return sourceUrl;
    }

    // Text watermark on right side, vertically centered
    // fontcolor=white, fontsize=24, semi-transparent
    const textFilter = `drawtext=text='${text}':fontcolor=white@0.7:fontsize=24:x=w-tw-20:y=h/2-th/2`;

    const command = [
      '-i', sourceUrl,
      '-vf', textFilter,
      '-c:a', 'copy',
      '-y',
      outputPath
    ].join(' ');

    console.log('Adding text watermark:', command);

    const session = await FFmpegKit.execute(command);
    const returnCode = await session.getReturnCode();

    if (ReturnCode.isSuccess(returnCode)) {
      console.log('Text watermark added successfully');
      return outputPath;
    } else {
      console.error('Text watermark failed');
      return sourceUrl;
    }
  } catch (error) {
    console.error('Text watermark error:', error);
    return sourceUrl;
  }
}
