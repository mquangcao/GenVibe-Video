'use client';

import React from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export function Preview({ editorState, onPlayPause, onUpdateText, onUpdateSticker }) {
  const canvasRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [videoElements, setVideoElements] = useState(new Map());
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeekingRef, setIsSeekingRef] = useState(false);

  // Check if there's any content to play
  const hasContent = editorState.timelineItems.length > 0 || editorState.textElements.length > 0 || editorState.stickerElements.length > 0;

  // Create and manage video elements
  useEffect(() => {
    const newVideoElements = new Map();

    // Create video elements for all timeline items
    editorState.timelineItems.forEach((item) => {
      const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
      if (media?.type === 'video') {
        let video = videoElements.get(item.id);

        if (!video) {
          // Create new video element
          video = document.createElement('video');
          video.src = media.url;
          video.crossOrigin = 'anonymous';
          video.preload = 'auto';
          video.playsInline = true;
          video.style.display = 'none';

          // Add to container for proper cleanup
          if (videoContainerRef.current) {
            videoContainerRef.current.appendChild(video);
          }

          console.log('📹 Created video element for:', media.name);
        }

        // Configure video settings
        video.volume = (volume[0] / 100) * (isMuted ? 0 : 1);
        video.muted = isMuted;

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

  // Update volume and mute settings
  useEffect(() => {
    videoElements.forEach((video) => {
      video.volume = (volume[0] / 100) * (isMuted ? 0 : 1);
      video.muted = isMuted;
    });
  }, [volume, isMuted, videoElements]);

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

  // Smooth video seeking and playback
  useEffect(() => {
    const currentVideoData = getCurrentVideo();

    // Pause all videos first
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

      // Smooth seeking with debouncing
      const seekVideo = async () => {
        if (Math.abs(video.currentTime - targetTime) > 0.1 && !isSeekingRef) {
          setIsSeekingRef(true);

          try {
            video.currentTime = targetTime;

            // Wait for seek to complete
            await new Promise((resolve) => {
              const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                resolve();
              };

              const onTimeUpdate = () => {
                if (Math.abs(video.currentTime - targetTime) < 0.1) {
                  video.removeEventListener('timeupdate', onTimeUpdate);
                  resolve();
                }
              };

              video.addEventListener('seeked', onSeeked);
              video.addEventListener('timeupdate', onTimeUpdate);

              // Timeout fallback
              setTimeout(resolve, 200);
            });
          } catch (error) {
            console.warn('Seek error:', error);
          } finally {
            setIsSeekingRef(false);
          }
        }

        // Handle playback state
        if (editorState.isPlaying && !isSeekingRef) {
          if (video.paused) {
            try {
              await video.play();
              console.log('▶️ Playing video:', item.id);
            } catch (error) {
              console.warn('Play error:', error);
            }
          }
        } else {
          if (!video.paused) {
            video.pause();
            console.log('⏸️ Paused video:', item.id);
          }
        }
      };

      seekVideo();
    } else {
      setCurrentVideoId(null);
    }
  }, [getCurrentVideo, editorState.isPlaying, editorState.currentTime, isSeekingRef]);

  // Render overlay elements
  const renderOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render text elements
    editorState.textElements
      .filter((text) => editorState.currentTime >= text.startTime && editorState.currentTime < text.endTime)
      .forEach((text) => {
        ctx.save();
        ctx.globalAlpha = text.opacity;
        ctx.fillStyle = text.color;
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        ctx.strokeText(text.text, text.x, text.y);
        ctx.fillText(text.text, text.x, text.y);

        if (editorState.selectedItem === text.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          const textWidth = ctx.measureText(text.text).width;
          ctx.strokeRect(text.x - 5, text.y - text.fontSize - 5, textWidth + 10, text.fontSize + 10);
          ctx.setLineDash([]);
        }

        ctx.restore();
      });

    // Render stickers
    editorState.stickerElements
      .filter((sticker) => editorState.currentTime >= sticker.startTime && editorState.currentTime < sticker.endTime)
      .forEach((sticker) => {
        ctx.save();
        ctx.globalAlpha = sticker.opacity;
        ctx.font = `${sticker.size}px Arial`;
        ctx.fillText(sticker.emoji, sticker.x, sticker.y);

        if (editorState.selectedItem === sticker.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(sticker.x - 5, sticker.y - 5, sticker.size + 10, sticker.size + 10);
          ctx.setLineDash([]);
        }

        ctx.restore();
      });
  }, [editorState]);

  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

  // Mouse handlers for dragging elements
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check text elements
    const currentTexts = editorState.textElements.filter(
      (text) => editorState.currentTime >= text.startTime && editorState.currentTime < text.endTime
    );

    for (const text of currentTexts) {
      const ctx = canvas.getContext('2d');
      ctx.font = `${text.fontSize}px ${text.fontFamily}`;
      const textWidth = ctx.measureText(text.text).width;

      if (x >= text.x - 5 && x <= text.x + textWidth + 5 && y >= text.y - text.fontSize - 5 && y <= text.y + 5) {
        setDraggedElement({ type: 'text', id: text.id, offsetX: x - text.x, offsetY: y - text.y });
        setIsDragging(true);
        return;
      }
    }

    // Check stickers
    const currentStickers = editorState.stickerElements.filter(
      (sticker) => editorState.currentTime >= sticker.startTime && editorState.currentTime < sticker.endTime
    );

    for (const sticker of currentStickers) {
      if (x >= sticker.x - 5 && x <= sticker.x + sticker.size + 5 && y >= sticker.y - 5 && y <= sticker.y + sticker.size + 5) {
        setDraggedElement({ type: 'sticker', id: sticker.id, offsetX: x - sticker.x, offsetY: y - sticker.y });
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
    const x = e.clientX - rect.left - draggedElement.offsetX;
    const y = e.clientY - rect.top - draggedElement.offsetY;

    if (draggedElement.type === 'text') {
      onUpdateText(draggedElement.id, { x, y });
    } else if (draggedElement.type === 'sticker') {
      onUpdateSticker(draggedElement.id, { x, y });
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
          {/* Video Element - VISIBLE when active */}
          {currentVideo && (
            <video
              key={currentVideoId} // Force re-render when video changes
              src={currentVideo.src}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted={isMuted}
              volume={volume[0] / 100}
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

          {/* Overlay Canvas - ALWAYS SAME SIZE */}
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="absolute inset-0 cursor-pointer z-10"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          {/* No Content Placeholder - FIXED SIZE */}
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
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm z-20">1920×1080</div>

          {/* Audio Status */}
          {currentVideoId && (
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2 z-20">
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{isMuted ? 'Muted' : `${volume[0]}%`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Preview Controls - FIXED HEIGHT */}
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

          {/* Enhanced Volume Controls */}
          <div className="flex items-center gap-2 ml-8">
            <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)} className="text-white hover:bg-gray-700">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-24">
              <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" disabled={isMuted} />
            </div>
            <span className="text-white text-xs w-12">{isMuted ? 'Muted' : `${volume[0]}%`}</span>
          </div>

          {/* Audio Quality Indicator */}
          {currentVideoId && <div className="ml-4 text-xs text-gray-400">Audio: {isSeekingRef ? 'Seeking...' : 'Ready'}</div>}
        </div>
      </div>
    </div>
  );
}
