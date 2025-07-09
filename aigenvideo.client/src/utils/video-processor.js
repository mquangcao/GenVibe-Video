'use client';

import { SyncPerfectExporter } from './sync-perfect-exporter';

export class VideoProcessor {
  static async getVideoDuration(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }

  static async getVideoThumbnail(file, time = 1) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = time;
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL());
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }

  static async getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // SYNC-PERFECT export - NO LOOPS, PERFECT TIMING
  static async exportVideo(
    mediaItems,
    timelineItems,
    textElements,
    stickerElements,
    duration,
    format = 'webm',
    quality = 'medium',
    onProgress
  ) {
    console.log(`🎬 SYNC-PERFECT export - NO LOOPS, LINEAR TIME PROGRESSION`);

    const exporter = new SyncPerfectExporter(1920, 1080);

    try {
      const videoBlob = await exporter.exportVideo(mediaItems, timelineItems, textElements, stickerElements, duration, onProgress);

      if (videoBlob.size === 0) {
        throw new Error('Export failed - empty file');
      }

      console.log(`✅ SYNC-PERFECT export done! Size: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);
      return videoBlob;
    } catch (error) {
      console.error('SYNC-PERFECT export error:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
