'use client';

export class EnhancedExporter {
  constructor(width = 1920, height = 1080) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    // Debug canvas - ẩn đi để không làm phiền
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '-9999px';
    this.canvas.style.left = '-9999px';
    document.body.appendChild(this.canvas);
  }

  async exportVideo(mediaItems, timelineItems, textElements, stickerElements, duration, format = 'webm', quality = 'medium', onProgress) {
    console.log('🎬 Starting FIXED export (no flickering, with audio)...');

    return new Promise(async (resolve, reject) => {
      try {
        // 1. Tạo video stream từ canvas
        const videoStream = this.canvas.captureStream(30);
        console.log('📹 Video stream created');

        // 2. Tìm video có audio để làm audio source
        const audioVideo = await this.setupAudioSource(mediaItems, timelineItems);

        let finalStream;

        if (audioVideo) {
          // 3. Tạo audio stream đơn giản
          const audioContext = new AudioContext();
          const source = audioContext.createMediaElementSource(audioVideo);
          const destination = audioContext.createMediaStreamDestination();

          // Kết nối trực tiếp
          source.connect(destination);

          // 4. Combine streams
          const videoTracks = videoStream.getVideoTracks();
          const audioTracks = destination.stream.getAudioTracks();

          finalStream = new MediaStream([...videoTracks, ...audioTracks]);
          console.log('🎵 Combined stream with audio');
        } else {
          finalStream = videoStream;
          console.log('📹 Video-only stream');
        }

        // 5. MediaRecorder với settings tốt
        const mediaRecorder = new MediaRecorder(finalStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          videoBitsPerSecond: quality === 'high' ? 5000000 : quality === 'medium' ? 3000000 : 1500000,
          audioBitsPerSecond: 128000,
        });

        const recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          console.log(`✅ Export completed! Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

          // Cleanup
          if (audioVideo) {
            audioVideo.pause();
            audioVideo.src = '';
          }
          this.cleanup();
          resolve(blob);
        };

        mediaRecorder.onerror = (event) => {
          console.error('❌ MediaRecorder error:', event);
          this.cleanup();
          reject(new Error('Recording failed'));
        };

        // 6. Start recording
        mediaRecorder.start(100);

        // 7. Render timeline với timing ổn định
        await this.renderTimelineStable(mediaItems, timelineItems, textElements, stickerElements, duration, audioVideo, onProgress);

        // 8. Stop recording
        mediaRecorder.stop();
      } catch (error) {
        console.error('💥 Export error:', error);
        this.cleanup();
        reject(error);
      }
    });
  }

  async setupAudioSource(mediaItems, timelineItems) {
    // Tìm video đầu tiên có audio
    const videoItem = timelineItems.find((item) => {
      const media = mediaItems.find((m) => m.id === item.mediaId);
      return media?.type === 'video';
    });

    if (!videoItem) {
      console.log('🔇 No video found for audio');
      return null;
    }

    const media = mediaItems.find((m) => m.id === videoItem.mediaId);
    console.log('🎵 Setting up audio from:', media.name);

    const video = document.createElement('video');
    video.src = media.url;
    video.crossOrigin = 'anonymous';
    video.muted = false;
    video.volume = 1.0;
    video.preload = 'auto';
    video.playsInline = true;

    // Load video
    await new Promise((resolve, reject) => {
      video.oncanplaythrough = resolve;
      video.onerror = reject;
      setTimeout(() => reject(new Error('Audio video load timeout')), 10000);
    });

    console.log('✅ Audio source ready');
    return video;
  }

  async renderTimelineStable(mediaItems, timelineItems, textElements, stickerElements, duration, audioVideo, onProgress) {
    console.log('🎨 Starting STABLE timeline render...');

    const fps = 30;
    const frameTime = 1000 / fps; // ms per frame
    const totalFrames = Math.ceil(duration * fps);

    // Preload tất cả media
    const videoElements = new Map();
    const imageElements = new Map();

    // Load videos cho visual
    for (const item of timelineItems) {
      const media = mediaItems.find((m) => m.id === item.mediaId);
      if (media?.type === 'video') {
        const video = document.createElement('video');
        video.src = media.url;
        video.crossOrigin = 'anonymous';
        video.muted = true; // Muted cho visual
        video.preload = 'auto';
        video.playsInline = true;

        await new Promise((resolve, reject) => {
          video.oncanplaythrough = resolve;
          video.onerror = reject;
          setTimeout(() => reject(new Error('Video load timeout')), 10000);
        });

        videoElements.set(item.id, video);
        console.log('✅ Visual video loaded:', media.name);
      } else if (media?.type === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = media.url;
        });
        imageElements.set(item.id, img);
        console.log('✅ Image loaded:', media.name);
      }
    }

    // FIXED: Render với timing ổn định để tránh flickering
    const startTime = performance.now();

    for (let frame = 0; frame < totalFrames; frame++) {
      const currentTime = frame / fps;
      const progress = (frame / totalFrames) * 100;

      // Clear canvas với màu đen
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Sync audio video
      if (audioVideo) {
        const audioItem = timelineItems.find((item) => {
          const media = mediaItems.find((m) => m.id === item.mediaId);
          return media?.type === 'video' && currentTime >= item.startTime && currentTime < item.endTime;
        });

        if (audioItem) {
          const relativeTime = currentTime - audioItem.startTime + audioItem.trimStart;
          const targetTime = Math.max(0, Math.min(relativeTime, audioVideo.duration));

          if (Math.abs(audioVideo.currentTime - targetTime) > 0.1) {
            audioVideo.currentTime = targetTime;
          }

          if (audioVideo.paused) {
            await audioVideo.play().catch(console.warn);
          }
        } else {
          if (!audioVideo.paused) {
            audioVideo.pause();
          }
        }
      }

      // Render visual elements
      await this.renderVisualFrame(currentTime, timelineItems, mediaItems, videoElements, imageElements);

      // Render overlays
      this.renderTextElements(currentTime, textElements);
      this.renderStickerElements(currentTime, stickerElements);

      // Update progress
      if (onProgress && frame % 15 === 0) {
        onProgress(progress);
      }

      // FIXED: Timing ổn định để tránh flickering
      const expectedTime = startTime + (frame + 1) * frameTime;
      const currentRealTime = performance.now();
      const waitTime = Math.max(0, expectedTime - currentRealTime);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    console.log('🎨 Stable timeline render completed!');
  }

  async renderVisualFrame(currentTime, timelineItems, mediaItems, videoElements, imageElements) {
    const activeItems = timelineItems.filter((item) => currentTime >= item.startTime && currentTime < item.endTime);

    for (const item of activeItems) {
      const media = mediaItems.find((m) => m.id === item.mediaId);

      if (media?.type === 'video') {
        const video = videoElements.get(item.id);
        if (video) {
          const relativeTime = currentTime - item.startTime + item.trimStart;
          const targetTime = Math.max(0, Math.min(relativeTime, media.duration));

          // Seek nếu cần
          if (Math.abs(video.currentTime - targetTime) > 0.1) {
            video.currentTime = targetTime;

            // Wait for seek với timeout
            await Promise.race([
              new Promise((resolve) => {
                const onSeeked = () => {
                  video.removeEventListener('seeked', onSeeked);
                  resolve(null);
                };
                video.addEventListener('seeked', onSeeked);
              }),
              new Promise((resolve) => setTimeout(resolve, 50)),
            ]);
          }

          // Draw video frame
          try {
            this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
          } catch (error) {
            console.warn('Failed to draw video frame:', error);
          }
        }
      } else if (media?.type === 'image') {
        const img = imageElements.get(item.id);
        if (img) {
          try {
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
          } catch (error) {
            console.warn('Failed to draw image:', error);
          }
        }
      }
    }

    // Background nếu không có media
    if (activeItems.length === 0) {
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  renderTextElements(currentTime, textElements) {
    for (const text of textElements) {
      if (currentTime >= text.startTime && currentTime < text.endTime) {
        this.ctx.save();
        this.ctx.globalAlpha = text.opacity;
        this.ctx.fillStyle = text.color;
        this.ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // Text stroke
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = Math.max(2, text.fontSize / 15);
        this.ctx.strokeText(text.text, text.x, text.y);
        this.ctx.fillText(text.text, text.x, text.y);

        this.ctx.restore();
      }
    }
  }

  renderStickerElements(currentTime, stickerElements) {
    for (const sticker of stickerElements) {
      if (currentTime >= sticker.startTime && currentTime < sticker.endTime) {
        this.ctx.save();
        this.ctx.globalAlpha = sticker.opacity;
        this.ctx.font = `${sticker.size}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(sticker.emoji, sticker.x, sticker.y);
        this.ctx.restore();
      }
    }
  }

  cleanup() {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
