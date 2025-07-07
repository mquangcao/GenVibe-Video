import { AudioMixer } from './audio-mixer.js';

export class EnhancedExporter {
  constructor(width = 1920, height = 1080) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.audioMixer = new AudioMixer();

    // Debug canvas
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '10px';
    this.canvas.style.right = '10px';
    this.canvas.style.width = '320px';
    this.canvas.style.height = '180px';
    this.canvas.style.border = '2px solid red';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);
  }

  async exportVideo(mediaItems, timelineItems, textElements, stickerElements, duration, format = 'webm', quality = 'medium', onProgress) {
    console.log('🎬 Starting enhanced export with audio...');

    return new Promise(async (resolve, reject) => {
      try {
        // Initialize audio mixer
        const audioStream = await this.audioMixer.initialize();

        // Setup video stream
        const videoStream = this.canvas.captureStream(30);

        // Combine video and audio streams
        let combinedStream;

        if (audioStream) {
          combinedStream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
          console.log('🎵 Combined video + audio stream created');
        } else {
          combinedStream = videoStream;
          console.log('📹 Video-only stream created (audio failed)');
        }

        // MediaRecorder settings
        const getRecorderSettings = () => {
          const baseSettings = {
            videoBitsPerSecond: quality === 'high' ? 5000000 : quality === 'medium' ? 3000000 : 1500000,
            audioBitsPerSecond: 128000,
          };

          const codecs = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm;codecs=vp9', 'video/webm'];

          for (const codec of codecs) {
            if (MediaRecorder.isTypeSupported(codec)) {
              console.log('🎥 Using codec:', codec);
              return { mimeType: codec, ...baseSettings };
            }
          }

          return { mimeType: 'video/webm', ...baseSettings };
        };

        const settings = getRecorderSettings();
        const mediaRecorder = new MediaRecorder(combinedStream, settings);

        const recordedChunks = [];
        let recordingStartTime = 0;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
            console.log('📦 Data chunk:', event.data.size, 'bytes');
          }
        };

        mediaRecorder.onstop = () => {
          const recordingDuration = Date.now() - recordingStartTime;
          console.log(`⏱️ Recording duration: ${recordingDuration}ms`);

          const blob = new Blob(recordedChunks, { type: settings.mimeType });
          console.log(`✅ Export completed! Size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

          this.cleanup();
          resolve(blob);
        };

        mediaRecorder.onerror = (event) => {
          console.error('❌ MediaRecorder error:', event);
          this.cleanup();
          reject(new Error('Recording failed'));
        };

        mediaRecorder.onstart = () => {
          recordingStartTime = Date.now();
          console.log('▶️ Recording started with audio');
        };

        mediaRecorder.start(100);

        await this.renderTimelineWithAudio(mediaItems, timelineItems, textElements, stickerElements, duration, onProgress);

        console.log('🛑 Stopping recording...');
        mediaRecorder.stop();
      } catch (error) {
        console.error('💥 Export error:', error);
        this.cleanup();
        reject(error);
      }
    });
  }

  async renderTimelineWithAudio(mediaItems, timelineItems, textElements, stickerElements, duration, onProgress) {
    console.log('🎨 Starting timeline render with audio...');

    const fps = 30;
    const frameTime = 1000 / fps;
    const totalFrames = Math.ceil(duration * fps);

    const videoElements = new Map();
    const imageElements = new Map();

    console.log('📚 Preloading media with audio...');

    // Load videos and setup audio
    for (const item of timelineItems) {
      const media = mediaItems.find((m) => m.id === item.mediaId);
      if (media?.type === 'video') {
        console.log('📹 Loading video with audio:', media.name);
        try {
          const video = document.createElement('video');
          video.src = media.url;
          video.crossOrigin = 'anonymous';
          video.muted = false;
          video.volume = 1.0;
          video.preload = 'auto';
          video.playsInline = true;

          await new Promise((resolve, reject) => {
            video.oncanplaythrough = () => {
              console.log('✅ Video with audio ready:', media.name);
              resolve();
            };
            video.onerror = reject;
            setTimeout(() => reject(new Error('Video load timeout')), 10000);
          });

          this.audioMixer.addVideoSource(video, item.id, 1.0);
          videoElements.set(item.id, video);
        } catch (error) {
          console.error('Failed to load video:', error);
        }
      } else if (media?.type === 'image') {
        console.log('🖼️ Loading image:', media.name);
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = media.url;
          });

          imageElements.set(item.id, img);
        } catch (error) {
          console.error('Failed to load image:', error);
        }
      }
    }

    console.log(`📚 Loaded ${videoElements.size} videos and ${imageElements.size} images`);

    // Render frames with audio sync
    let frameCount = 0;
    const startTime = Date.now();

    while (frameCount < totalFrames) {
      const currentTime = frameCount / fps;
      const progress = (frameCount / totalFrames) * 100;

      // Clear canvas
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Render media with audio sync
      await this.renderMediaFrameWithAudio(currentTime, timelineItems, mediaItems, videoElements, imageElements);

      // Render overlays
      this.renderTextElements(currentTime, textElements);
      this.renderStickerElements(currentTime, stickerElements);

      // Update progress
      if (onProgress && frameCount % 15 === 0) {
        onProgress(progress);
        console.log(`🎬 Frame ${frameCount}/${totalFrames} (${progress.toFixed(1)}%) - Time: ${currentTime.toFixed(2)}s`);
      }

      frameCount++;

      // Precise timing
      const expectedTime = startTime + frameCount * frameTime;
      const currentRealTime = Date.now();
      const waitTime = Math.max(0, expectedTime - currentRealTime);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    console.log('🎨 Timeline render with audio completed!');
  }

  async renderMediaFrameWithAudio(currentTime, timelineItems, mediaItems, videoElements, imageElements) {
    const activeItems = timelineItems.filter((item) => currentTime >= item.startTime && currentTime < item.endTime);

    for (const item of activeItems) {
      const media = mediaItems.find((m) => m.id === item.mediaId);

      if (media?.type === 'video') {
        const video = videoElements.get(item.id);
        if (video) {
          const relativeTime = currentTime - item.startTime + item.trimStart;
          const targetTime = Math.max(0, Math.min(relativeTime, media.duration));

          if (Math.abs(video.currentTime - targetTime) > 0.033) {
            video.currentTime = targetTime;

            await new Promise((resolve) => {
              const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                resolve();
              };

              if (video.readyState >= 2) {
                video.addEventListener('seeked', onSeeked);
              } else {
                resolve();
              }

              setTimeout(resolve, 50);
            });
          }

          if (video.paused) {
            try {
              await video.play();
            } catch (error) {
              // Ignore play errors
            }
          }

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

    if (activeItems.length === 0) {
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#666666';
      this.ctx.font = '64px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('No Media', this.canvas.width / 2, this.canvas.height / 2);
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
    this.audioMixer.cleanup();

    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
