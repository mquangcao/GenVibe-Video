'use client';

import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export function Preview({ editorState, onPlayPause, onUpdateText, onUpdateSticker }) {
  const canvasRef = useRef(null);
  const videoContainerRef = useRef(null);
  const animationFrameRef = useRef();
  const [videoElements, setVideoElements] = useState(new Map());
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  // FIXED: Canvas dimensions and scale
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  const EXPORT_WIDTH = 1920;
  const EXPORT_HEIGHT = 1080;
  const SCALE_X = CANVAS_WIDTH / EXPORT_WIDTH; // 0.333
  const SCALE_Y = CANVAS_HEIGHT / EXPORT_HEIGHT; // 0.333

  // Check if there's any content to play
  const hasContent = editorState.timelineItems.length > 0 || editorState.textElements.length > 0 || editorState.stickerElements.length > 0;

  // Create video elements - HIDDEN videos are MUTED
  useEffect(() => {
    const newVideoElements = new Map();

    // Create video elements for all timeline items
    editorState.timelineItems.forEach((item) => {
      const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
      if (media?.type === 'video') {
        let video = videoElements.get(item.id);

        if (!video) {
          // Create new HIDDEN video element for timing control
          video = document.createElement('video');
          video.src = media.url;
          video.crossOrigin = 'anonymous';
          video.preload = 'auto';
          video.playsInline = true;
          video.muted = true; // FIXED: Hidden videos are MUTED to prevent double audio
          video.loop = false;
          video.style.display = 'none';

          // Event listeners
          video.addEventListener('loadeddata', () => {
            console.log('📹 Hidden video loaded:', media.name, 'duration:', video.duration);
          });

          video.addEventListener('seeked', () => {
            console.log('📹 Hidden video seeked to:', video.currentTime);
          });

          // Add to container for proper cleanup
          if (videoContainerRef.current) {
            videoContainerRef.current.appendChild(video);
          }

          console.log('📹 Created MUTED hidden video for:', media.name);
        }

        // FIXED: Hidden videos stay muted
        video.muted = true;
        video.volume = 0;

        newVideoElements.set(item.id, video);
      }
    });

    // Cleanup old video elements
    videoElements.forEach((video, id) => {
      if (!newVideoElements.has(id)) {
        video.pause();
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
        console.log('🗑️ Cleaned up video element:', id);
      }
    });

    setVideoElements(newVideoElements);
  }, [editorState.timelineItems, editorState.mediaItems]);

  // Find current active video
  const getCurrentVideo = useCallback(() => {
    const currentVideoItems = editorState.timelineItems.filter((item) => {
      const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
      const isVideo = media?.type === 'video';
      const isInTimeRange = editorState.currentTime >= item.startTime && editorState.currentTime < item.endTime;
      return isVideo && isInTimeRange;
    });

    if (currentVideoItems.length > 0) {
      const videoItem = currentVideoItems[0]; // Take first video if multiple
      const media = editorState.mediaItems.find((m) => m.id === videoItem.mediaId);
      const videoElement = videoElements.get(videoItem.id);
      return { media, item: videoItem, video: videoElement };
    }
    return null;
  }, [editorState.timelineItems, editorState.mediaItems, editorState.currentTime, videoElements]);

  // Video seeking and playback - hidden videos for timing only
  useEffect(() => {
    const currentVideoData = getCurrentVideo();

    // Pause all hidden videos first
    videoElements.forEach((video, id) => {
      if (!currentVideoData || id !== currentVideoData.item.id) {
        if (!video.paused) {
          video.pause();
        }
      }
    });

    if (currentVideoData && currentVideoData.video && currentVideoData.media) {
      const { video, item, media } = currentVideoData;
      const relativeTime = editorState.currentTime - item.startTime + item.trimStart;
      const targetTime = Math.max(0, Math.min(relativeTime, media.duration));

      setCurrentVideoId(item.id);

      // Seeking for timing reference
      const timeDiff = Math.abs(video.currentTime - targetTime);
      if (timeDiff > 0.1) {
        console.log(`📹 Seeking hidden video from ${video.currentTime.toFixed(2)}s to ${targetTime.toFixed(2)}s`);
        video.currentTime = targetTime;
      }

      // Playback control for timing
      if (editorState.isPlaying) {
        if (video.paused) {
          video
            .play()
            .then(() => {
              console.log('▶️ Playing hidden video for timing:', item.id);
            })
            .catch((error) => {
              console.warn('Play error:', error);
            });
        }
      } else {
        if (!video.paused) {
          video.pause();
          console.log('⏸️ Paused hidden video:', item.id);
        }
      }
    } else {
      setCurrentVideoId(null);
    }
  }, [getCurrentVideo, editorState.isPlaying, editorState.currentTime]);

  // Continuous video frame updates for smooth preview
  useEffect(() => {
    const updateVideoFrame = () => {
      const currentVideoData = getCurrentVideo();

      if (currentVideoData && currentVideoData.video && editorState.isPlaying) {
        const { video, item, media } = currentVideoData;
        const relativeTime = editorState.currentTime - item.startTime + item.trimStart;
        const targetTime = Math.max(0, Math.min(relativeTime, media.duration));

        // Continuous sync during playback
        const timeDiff = Math.abs(video.currentTime - targetTime);
        if (timeDiff > 0.2) {
          console.log(`📹 Sync correction: ${video.currentTime.toFixed(2)}s -> ${targetTime.toFixed(2)}s`);
          video.currentTime = targetTime;
        }
      }

      // Continue updating if playing
      if (editorState.isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateVideoFrame);
      }
    };

    if (editorState.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVideoFrame);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [editorState.isPlaying, getCurrentVideo, editorState.currentTime]);

  // FIXED: Render overlay elements with proper scaling and DEBUG
  const renderOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DEBUG: Count active elements
    const activeTexts = editorState.textElements.filter(
      (text) => editorState.currentTime >= text.startTime && editorState.currentTime < text.endTime
    );
    const activeStickers = editorState.stickerElements.filter(
      (sticker) => editorState.currentTime >= sticker.startTime && editorState.currentTime < sticker.endTime
    );

    let debugText = `Active: ${activeTexts.length} texts, ${activeStickers.length} stickers`;

    // FIXED: Render text elements with proper scaling and DEBUG
    activeTexts.forEach((text, index) => {
      ctx.save();
      ctx.globalAlpha = text.opacity || 1;

      // FIXED: Scale position and size for preview
      const scaledX = text.x * SCALE_X;
      const scaledY = text.y * SCALE_Y;
      const scaledFontSize = Math.max(12, text.fontSize * SCALE_Y); // Minimum font size

      console.log(`📝 Rendering text ${index}:`, {
        original: { x: text.x, y: text.y, fontSize: text.fontSize },
        scaled: { x: scaledX, y: scaledY, fontSize: scaledFontSize },
        text: text.text,
        color: text.color,
        visible: scaledX >= 0 && scaledX <= CANVAS_WIDTH && scaledY >= 0 && scaledY <= CANVAS_HEIGHT,
      });

      ctx.fillStyle = text.color || '#ffffff';
      ctx.font = `${scaledFontSize}px ${text.fontFamily || 'Arial'}`;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, scaledFontSize / 20);

      // Add text outline for better visibility
      ctx.strokeText(text.text, scaledX, scaledY);
      ctx.fillText(text.text, scaledX, scaledY);

      // DEBUG: Add red border around text
      if (process.env.NODE_ENV === 'development') {
        const textWidth = ctx.measureText(text.text).width;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(scaledX - 2, scaledY - scaledFontSize - 2, textWidth + 4, scaledFontSize + 4);
        ctx.setLineDash([]);
      }

      if (editorState.selectedItem === text.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        const textWidth = ctx.measureText(text.text).width;
        ctx.strokeRect(scaledX - 3, scaledY - scaledFontSize - 3, textWidth + 6, scaledFontSize + 6);
        ctx.setLineDash([]);
      }

      ctx.restore();

      debugText += ` | Text${index}: (${scaledX.toFixed(0)},${scaledY.toFixed(0)})`;
    });

    // FIXED: Render stickers with proper scaling
    activeStickers.forEach((sticker, index) => {
      ctx.save();
      ctx.globalAlpha = sticker.opacity || 1;

      // FIXED: Scale position and size for preview
      const scaledX = sticker.x * SCALE_X;
      const scaledY = sticker.y * SCALE_Y;
      const scaledSize = Math.max(16, sticker.size * SCALE_Y); // Minimum sticker size

      console.log(`🎭 Rendering sticker ${index}:`, {
        original: { x: sticker.x, y: sticker.y, size: sticker.size },
        scaled: { x: scaledX, y: scaledY, size: scaledSize },
        emoji: sticker.emoji,
      });

      ctx.font = `${scaledSize}px Arial`;
      ctx.fillText(sticker.emoji, scaledX, scaledY);

      if (editorState.selectedItem === sticker.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(scaledX - 3, scaledY - 3, scaledSize + 6, scaledSize + 6);
        ctx.setLineDash([]);
      }

      ctx.restore();

      debugText += ` | Sticker${index}: (${scaledX.toFixed(0)},${scaledY.toFixed(0)})`;
    });

    // DEBUG: Show debug info
    setDebugInfo(debugText);

    // DEBUG: Draw canvas bounds
    if (process.env.NODE_ENV === 'development') {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.setLineDash([]);
    }
  }, [editorState, SCALE_X, SCALE_Y]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  // FIXED: Mouse handlers with proper scaling for dragging
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // FIXED: Convert canvas coordinates to export coordinates
    const exportX = canvasX / SCALE_X;
    const exportY = canvasY / SCALE_Y;

    console.log(`🖱️ Mouse down at canvas(${canvasX}, ${canvasY}) -> export(${exportX}, ${exportY})`);

    // Check text elements
    const currentTexts = editorState.textElements.filter(
      (text) => editorState.currentTime >= text.startTime && editorState.currentTime < text.endTime
    );

    for (const text of currentTexts) {
      const ctx = canvas.getContext('2d');
      ctx.font = `${Math.max(12, text.fontSize * SCALE_Y)}px ${text.fontFamily || 'Arial'}`;
      const scaledTextWidth = ctx.measureText(text.text).width;
      const actualTextWidth = scaledTextWidth / SCALE_X;

      if (
        exportX >= text.x - 20 &&
        exportX <= text.x + actualTextWidth + 20 &&
        exportY >= text.y - text.fontSize - 20 &&
        exportY <= text.y + 20
      ) {
        console.log(`📝 Selected text: ${text.text}`);
        setDraggedElement({ type: 'text', id: text.id, offsetX: exportX - text.x, offsetY: exportY - text.y });
        setIsDragging(true);
        return;
      }
    }

    // Check stickers
    const currentStickers = editorState.stickerElements.filter(
      (sticker) => editorState.currentTime >= sticker.startTime && editorState.currentTime < sticker.endTime
    );

    for (const sticker of currentStickers) {
      if (
        exportX >= sticker.x - 20 &&
        exportX <= sticker.x + sticker.size + 20 &&
        exportY >= sticker.y - 20 &&
        exportY <= sticker.y + sticker.size + 20
      ) {
        console.log(`🎭 Selected sticker: ${sticker.emoji}`);
        setDraggedElement({
          type: 'sticker',
          id: sticker.id,
          offsetX: exportX - sticker.x,
          offsetY: exportY - sticker.y,
        });
        setIsDragging(true);
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // FIXED: Convert canvas coordinates to export coordinates
    const exportX = canvasX / SCALE_X - draggedElement.offsetX;
    const exportY = canvasY / SCALE_Y - draggedElement.offsetY;

    // FIXED: Constrain to export bounds
    const constrainedX = Math.max(0, Math.min(exportX, EXPORT_WIDTH - 100));
    const constrainedY = Math.max(50, Math.min(exportY, EXPORT_HEIGHT - 50));

    if (draggedElement.type === 'text') {
      onUpdateText(draggedElement.id, { x: constrainedX, y: constrainedY });
    } else if (draggedElement.type === 'sticker') {
      onUpdateSticker(draggedElement.id, { x: constrainedX, y: constrainedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current video element for display
  const currentVideoData = getCurrentVideo();
  const currentVideo = currentVideoData?.video;

  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      {/* Hidden video container */}
      <div ref={videoContainerRef} style={{ display: 'none' }} />

      {/* Preview Area - FIXED HEIGHT */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl w-[640px] h-[360px] flex-shrink-0">
          {/* Visible Video Element - WITH AUDIO, synced with hidden video */}
          {currentVideo && (
            <video
              key={currentVideoId}
              ref={(videoRef) => {
                console.log('📹 Current video ref =====================================================================:', currentVideo);
                if (videoRef && currentVideo) {
                  // Sync the visible video with the hidden one
                  const syncVideo = () => {
                    if (Math.abs(videoRef.currentTime - currentVideo.currentTime) > 0.1) {
                      videoRef.currentTime = currentVideo.currentTime;
                    }

                    if (currentVideo.paused !== videoRef.paused) {
                      if (currentVideo.paused) {
                        videoRef.pause();
                      } else {
                        videoRef.play().catch(console.warn);
                      }
                    }
                  };

                  // Sync immediately
                  syncVideo();

                  // Continue syncing during playback
                  const syncInterval = setInterval(syncVideo, 100);

                  // Cleanup
                  return () => clearInterval(syncInterval);
                }
              }}
              src={currentVideo.src}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted={isMuted}
              volume={volume[0] / 100}
              onLoadedData={() => {
                console.log('📹 Visible video loaded with audio');
              }}
            />
          )}

          {/* Static Images */}
          {!currentVideo &&
            editorState.timelineItems.some((item) => {
              const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
              return media?.type === 'image' && editorState.currentTime >= item.startTime && editorState.currentTime < item.endTime;
            }) && (
              <div className="absolute inset-0">
                {editorState.timelineItems
                  .filter((item) => {
                    const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
                    return media?.type === 'image' && editorState.currentTime >= item.startTime && editorState.currentTime < item.endTime;
                  })
                  .map((item) => {
                    const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
                    return (
                      <img
                        key={item.id}
                        src={media?.url || '/placeholder.svg'}
                        alt={media?.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    );
                  })}
              </div>
            )}

          {/* FIXED: Overlay Canvas - Proper dimensions */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute inset-0 cursor-pointer z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* No Content Placeholder */}
          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <div className="text-xl font-medium mb-2">No Content</div>
                <div className="text-gray-400">Add media to the timeline to start editing</div>
              </div>
            </div>
          )}

          {/* Black background when content exists but no active media */}
          {hasContent &&
            !currentVideo &&
            !editorState.timelineItems.some((item) => {
              const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
              return (
                (media?.type === 'image' || media?.type === 'video') &&
                editorState.currentTime >= item.startTime &&
                editorState.currentTime < item.endTime
              );
            }) && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="text-4xl mb-2">⏸️</div>
                  <div className="text-sm">No media at current time</div>
                </div>
              </div>
            )}

          {/* Time Display */}
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-mono z-20">
            {formatTime(editorState.currentTime)} / {formatTime(editorState.duration)}
          </div>

          {/* Resolution Display */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm z-20">
            Preview: {CANVAS_WIDTH}×{CANVAS_HEIGHT}
            <br />
            Export: {EXPORT_WIDTH}×{EXPORT_HEIGHT}
          </div>

          {/* Audio Status */}
          {currentVideoId && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2 z-20">
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{isMuted ? 'Muted' : `${volume[0]}%`}</span>
              <span className="text-green-400">●</span>
              <span className="text-xs">SINGLE AUDIO</span>
            </div>
          )}

          {/* DEBUG: Show debug info */}
          {debugInfo && (
            <div className="absolute bottom-4 right-4 bg-red-900/70 text-white px-2 py-1 rounded text-xs font-mono z-20 max-w-xs">
              {debugInfo}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Preview Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700 flex-shrink-0 h-20">
        <div className="flex items-center justify-center gap-4 h-full">
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            onClick={onPlayPause}
            disabled={!hasContent}
            className={`rounded-full w-12 h-12 p-0 ${
              hasContent ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {editorState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Volume Controls */}
          <div className="flex items-center gap-2 ml-8">
            <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)} className="text-white hover:bg-gray-700">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-24">
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" disabled={isMuted} />
            </div>
            <span className="text-white text-xs w-12">{isMuted ? 'Muted' : `${volume[0]}%`}</span>
          </div>

          {/* Status Display */}
          {currentVideoId && (
            <div className="ml-4 text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Single Audio Track
            </div>
          )}

          {/* Scale Info */}
          <div className="ml-4 text-xs text-gray-400">Scale: {(SCALE_X * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}
