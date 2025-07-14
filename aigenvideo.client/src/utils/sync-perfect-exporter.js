'use client';

import fixWebmDuration from 'webm-duration-fix';

export class SyncPerfectExporter {
  constructor(width = 1920, height = 1080) {
    // Main canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    // Buffer canvas
    this.bufferCanvas = document.createElement('canvas');
    this.bufferCanvas.width = width;
    this.bufferCanvas.height = height;
    this.bufferCtx = this.bufferCanvas.getContext('2d');

    // HIDDEN
    this.canvas.style.display = 'none';
    this.bufferCanvas.style.display = 'none';
    document.body.appendChild(this.canvas);
    document.body.appendChild(this.bufferCanvas);

    this.frameBuffer = [];
  }

  async exportVideo(mediaItems, timelineItems, textElements, stickerElements, duration, onProgress) {
    console.log('🎬 SYNC-PERFECT export - NO LOOPS, PERFECT TIMING...');
    console.log('===============================================================');
    return new Promise(async (resolve, reject) => {
      try {
        // 1. Setup audio with STRICT timing
        await this.setupAudioStrict(mediaItems, timelineItems);

        // 2. Create video stream
        const videoStream = this.canvas.captureStream(20); // Stable 20 FPS

        // 3. Audio stream with SYNC
        const audioStream = this.getAudioStreamSync();

        // 4. Combine
        let finalStream;
        if (audioStream) {
          const videoTracks = videoStream.getVideoTracks();
          const audioTracks = audioStream.getAudioTracks();
          finalStream = new MediaStream([...videoTracks, ...audioTracks]);
          console.log('🎵 SYNC stream created');
        } else {
          finalStream = videoStream;
        }

        // 5. MediaRecorder with SYNC settings
        const mediaRecorder = new MediaRecorder(finalStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          videoBitsPerSecond: 1500000,
          audioBitsPerSecond: 128000,
        });

        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const rawWebmBlob = new Blob(chunks, { type: 'video/webm' });

            // ✅ Tính duration theo giây từ tham số truyền vào (ms)
            const durationInSeconds = duration / 1000;

            console.log(`🛠 Fixing WebM duration... (${durationInSeconds}s)`);

            const fixedWebmBlob = await fixWebmDuration(rawWebmBlob, durationInSeconds);

            console.log(`✅ Duration fixed! Size: ${(fixedWebmBlob.size / 1024 / 1024).toFixed(2)} MB`);

            this.cleanup();
            resolve(fixedWebmBlob);
          } catch (err) {
            console.error('❌ Failed to fix duration:', err);
            this.cleanup();
            reject(err);
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error('❌ Recording error:', event);
          this.cleanup();
          reject(new Error('Recording failed'));
        };

        // 6. Start recording
        mediaRecorder.start(500);

        // 7. SYNC PERFECT render - NO LOOPS
        await this.renderSyncPerfect(mediaItems, timelineItems, textElements, stickerElements, duration, onProgress);

        // 8. Stop
        mediaRecorder.stop();

        if (this.audioElement) {
          this.audioElement.pause();
        }
      } catch (error) {
        console.error('💥 Export error:', error);
        this.cleanup();
        reject(error);
      }
    });
  }

  async setupAudioStrict(mediaItems, timelineItems) {
    const videoItem = timelineItems.find((item) => {
      const media = mediaItems.find((m) => m.id === item.mediaId);
      return media?.type === 'video';
    });

    if (!videoItem) return;

    const media = mediaItems.find((m) => m.id === videoItem.mediaId);
    console.log('🎵 STRICT audio setup:', media.name);

    this.audioElement = document.createElement('audio');
    this.audioElement.src = media.url;
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.volume = 1.0;
    this.audioElement.preload = 'auto';
    this.audioElement.loop = false; // CRITICAL: No loop
    this.audioElement.autoplay = false; // CRITICAL: No autoplay

    await new Promise((resolve, reject) => {
      this.audioElement.oncanplaythrough = resolve;
      this.audioElement.onerror = reject;
      setTimeout(() => reject(new Error('Audio timeout')), 5000);
    });

    console.log('✅ STRICT audio ready - duration:', this.audioElement.duration);
  }

  getAudioStreamSync() {
    if (!this.audioElement) return null;

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(this.audioElement);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      console.log('🎵 SYNC audio stream created');
      return destination.stream;
    } catch (error) {
      console.error('❌ Audio stream failed:', error);
      return null;
    }
  }

  async renderSyncPerfect(mediaItems, timelineItems, textElements, stickerElements, duration, onProgress) {
    console.log('🎨 SYNC-PERFECT rendering - NO LOOPS...');

    const fps = 20;
    const frameInterval = 1000 / fps; // 50ms per frame
    const totalFrames = Math.ceil(duration * fps);

    console.log(`📊 Will render ${totalFrames} frames for ${duration}s duration`);

    // Preload with STRICT settings
    const videoElements = new Map();
    const imageElements = new Map();

    // Load videos with NO-LOOP settings
    for (const item of timelineItems) {
      const media = mediaItems.find((m) => m.id === item.mediaId);
      if (media?.type === 'video') {
        const video = document.createElement('video');
        video.src = media.url;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.preload = 'auto';
        video.playsInline = true;
        video.loop = false; // CRITICAL: No loop
        video.autoplay = false; // CRITICAL: No autoplay

        await new Promise((resolve, reject) => {
          video.oncanplaythrough = resolve;
          video.onerror = reject;
          setTimeout(() => reject(new Error('Video load timeout')), 15000);
        });

        videoElements.set(item.id, video);
        console.log('✅ NO-LOOP video loaded:', media.name, 'duration:', video.duration);
      } else if (media?.type === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = media.url;
        });
        imageElements.set(item.id, img);
      }
    }

    // SYNC-PERFECT: Linear time progression - NO LOOPS
    let frameCount = 0;
    const startRealTime = Date.now();

    while (frameCount < totalFrames) {
      const currentTime = frameCount / fps; // LINEAR time progression
      const progress = (frameCount / totalFrames) * 100;

      // CRITICAL: Ensure we don't exceed duration
      if (currentTime >= duration) {
        console.log('🛑 Reached end of duration, stopping render');
        break;
      }

      // STEP 1: Clear buffer
      this.bufferCtx.fillStyle = '#000000';
      this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
      console.log('quang check 1');
      // STEP 2: STRICT audio sync - NO LOOPS
      if (this.audioElement) {
        const audioItem = timelineItems.find((item) => {
          const media = mediaItems.find((m) => m.id === item.mediaId);
          return media?.type === 'video' && currentTime >= item.startTime && currentTime < item.endTime;
        });

        if (audioItem) {
          const relativeTime = currentTime - audioItem.startTime + audioItem.trimStart;
          const targetTime = Math.max(0, Math.min(relativeTime, this.audioElement.duration));

          // CRITICAL: Prevent audio loops
          if (targetTime < this.audioElement.duration - 0.1) {
            // Only seek if not near end
            if (Math.abs(this.audioElement.currentTime - targetTime) > 0.5) {
              this.audioElement.currentTime = targetTime;
              console.log(`🎵 Audio sync: ${targetTime.toFixed(2)}s`);
            }

            if (this.audioElement.paused) {
              this.audioElement.play().catch(console.warn);
            }
          } else {
            // Near end of audio - pause to prevent loop
            if (!this.audioElement.paused) {
              this.audioElement.pause();
              console.log('🎵 Audio paused - near end');
            }
          }
        } else {
          // No active audio item - pause
          if (!this.audioElement.paused) {
            this.audioElement.pause();
          }
        }
      }
      console.log('quang check 2');
      // STEP 3: Render video with NO-LOOP logic
      await this.renderVideoNoLoop(currentTime, timelineItems, mediaItems, videoElements, imageElements);
      console.log('quang check 3');
      // STEP 4: Render overlays
      this.renderOverlaysToBuffer(currentTime, textElements, stickerElements);
      console.log('quang check 4');
      // STEP 5: Copy buffer to main canvas
      this.ctx.drawImage(this.bufferCanvas, 0, 0);
      console.log('quang check 5');
      // Progress
      if (onProgress && frameCount % 20 === 0) {
        onProgress(progress);
        console.log(`🎬 SYNC progress: ${progress.toFixed(1)}% - time: ${currentTime.toFixed(2)}s`);
      }

      frameCount++;

      // STEP 6: PRECISE timing - prevent loops
      const expectedTime = startRealTime + frameCount * frameInterval;
      const currentRealTime = Date.now();
      const waitTime = Math.max(0, expectedTime - currentRealTime);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    console.log('🎨 SYNC-PERFECT render completed - NO LOOPS!');
  }

  async renderVideoNoLoop(currentTime, timelineItems, mediaItems, videoElements, imageElements) {
    const activeItems = timelineItems.filter((item) => currentTime >= item.startTime && currentTime < item.endTime);

    for (const item of activeItems) {
      const media = mediaItems.find((m) => m.id === item.mediaId);

      if (media?.type === 'video') {
        const video = videoElements.get(item.id);
        if (video) {
          const relativeTime = currentTime - item.startTime + item.trimStart;
          const targetTime = Math.max(0, Math.min(relativeTime, media.duration));

          // CRITICAL: NO-LOOP logic
          if (targetTime >= media.duration - 0.1) {
            // Near end of video - use last frame
            console.log('📹 Video near end, using last frame');
            video.currentTime = media.duration - 0.1;
          } else if (targetTime <= this.lastVideoTime) {
            // Prevent backward seeking (which can cause loops)
            console.log('📹 Preventing backward seek');
            // Don't seek, use current frame
          } else {
            // Normal forward seeking
            if (Math.abs(video.currentTime - targetTime) > 0.3) {
              video.currentTime = targetTime;
              this.lastVideoTime = targetTime;

              // Wait for seek
              await Promise.race([
                new Promise((resolve) => {
                  const onSeeked = () => {
                    video.removeEventListener('seeked', onSeeked);
                    resolve(null);
                  };
                  video.addEventListener('seeked', onSeeked);
                }),
                new Promise((resolve) => setTimeout(resolve, 200)),
              ]);
            }
          }

          // Draw video frame
          try {
            this.bufferCtx.drawImage(video, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

            // Store successful frame
            const frameData = this.bufferCtx.getImageData(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
            this.frameBuffer.push(frameData);

            if (this.frameBuffer.length > this.maxBufferSize) {
              this.frameBuffer.shift();
            }
          } catch (error) {
            console.warn('Frame draw failed, using buffer...');

            if (this.frameBuffer.length > 0) {
              const lastGoodFrame = this.frameBuffer[this.frameBuffer.length - 1];
              this.bufferCtx.putImageData(lastGoodFrame, 0, 0);
            } else {
              this.bufferCtx.fillStyle = '#000000';
              this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
            }
          }
        }
      } else if (media?.type === 'image') {
        const img = imageElements.get(item.id);
        if (img) {
          this.bufferCtx.drawImage(img, 0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
        }
      }
    }
  }

  renderOverlaysToBuffer(currentTime, textElements, stickerElements) {
    // Text
    textElements
      .filter((text) => currentTime >= text.startTime && currentTime < text.endTime)
      .forEach((text) => {
        this.bufferCtx.save();
        this.bufferCtx.globalAlpha = text.opacity;
        this.bufferCtx.fillStyle = text.color;
        this.bufferCtx.font = `${text.fontSize}px ${text.fontFamily}`;
        this.bufferCtx.textAlign = 'left';
        this.bufferCtx.textBaseline = 'top';

        this.bufferCtx.strokeStyle = '#000000';
        this.bufferCtx.lineWidth = Math.max(2, text.fontSize / 15);
        this.bufferCtx.strokeText(text.text, text.x, text.y);
        this.bufferCtx.fillText(text.text, text.x, text.y);

        this.bufferCtx.restore();
      });

    // Stickers
    stickerElements
      .filter((sticker) => currentTime >= sticker.startTime && currentTime < sticker.endTime)
      .forEach((sticker) => {
        this.bufferCtx.save();
        this.bufferCtx.globalAlpha = sticker.opacity;
        this.bufferCtx.font = `${sticker.size}px Arial`;
        this.bufferCtx.textAlign = 'left';
        this.bufferCtx.textBaseline = 'top';
        this.bufferCtx.fillText(sticker.emoji, sticker.x, sticker.y);
        this.bufferCtx.restore();
      });
  }

  cleanup() {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    if (this.bufferCanvas.parentNode) {
      this.bufferCanvas.parentNode.removeChild(this.bufferCanvas);
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
    this.frameBuffer = [];
    this.lastVideoTime = -1;
  }
}
