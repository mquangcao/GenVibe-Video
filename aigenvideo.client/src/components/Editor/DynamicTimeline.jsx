'use client';

import React from 'react';
import { EditorState, TimelineItem, TextElement, StickerElement } from '@/types/editor';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Trash2, Scissors, Video, Music, Type, Sticker } from 'lucide-react';
import { TimelineToolbar } from './timeline-toolbar';

export function DynamicTimeline({
  editorState,
  onTimeChange,
  onItemSelect,
  onDrop,
  onUpdateText,
  onUpdateSticker,
  onUpdateTimelineItem,
  onSplitItem,
  onDuplicateItem,
  onDeleteItem,
}) {
  const timelineRef = useRef(null);
  const [zoom, setZoom] = useState([1]);
  const [selectedTool, setSelectedTool] = useState('select');
  const [tracks, setTracks] = useState([
    { id: 'video-1', name: 'Video 1', type: 'video', color: 'bg-blue-500', items: [] },
    { id: 'audio-1', name: 'Audio 1', type: 'audio', color: 'bg-purple-500', items: [] },
    { id: 'text-1', name: 'Text 1', type: 'text', color: 'bg-green-500', items: [] },
    { id: 'sticker-1', name: 'Stickers 1', type: 'sticker', color: 'bg-orange-500', items: [] },
  ]);
  const [dragOverTrack, setDragOverTrack] = (useState < string) | (null > null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Drag and resize states
  const [isDraggingElement, setIsDraggingElement] = useState(null);

  const pixelsPerSecond = 50 * zoom[0];
  const timelineWidth = Math.max(editorState.duration * pixelsPerSecond, 800);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Add new track
  const addTrack = (type) => {
    const trackCount = tracks.filter((t) => t.type === type).length + 1;
    const colors = {
      video: 'bg-blue-500',
      audio: 'bg-purple-500',
      text: 'bg-green-500',
      sticker: 'bg-orange-500',
    };

    const newTrack = {
      id: `${type}-${trackCount}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${trackCount}`,
      type,
      color: colors[type],
      items: [],
    };

    setTracks((prev) => [...prev, newTrack]);
  };

  // Remove track
  const removeTrack = (trackId) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // Update tracks with current items
  useEffect(() => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => {
        let items = [];

        if (track.type === 'video' || track.type === 'audio') {
          items = editorState.timelineItems.filter((item) => {
            const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
            return media?.type === track.type;
          });
        } else if (track.type === 'text') {
          items = editorState.textElements;
        } else if (track.type === 'sticker') {
          items = editorState.stickerElements;
        }

        return { ...track, items };
      })
    );
  }, [editorState.timelineItems, editorState.textElements, editorState.stickerElements, editorState.mediaItems]);

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || isDraggingPlayhead || isDraggingElement) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, x / pixelsPerSecond);

    if (selectedTool === 'select') {
      onTimeChange(time);
    }
  };

  const handleItemClick = (e, itemId) => {
    e.stopPropagation();

    if (selectedTool === 'cut') {
      // Cut at current playhead position
      onSplitItem(itemId, editorState.currentTime);
    } else {
      onItemSelect(itemId);
    }
  };

  const handlePlayheadMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  // ENHANCED: Mouse move handler with drag and resize - WORKS IN BOTH SELECT AND MOVE MODE
  const handleMouseMove = useCallback(
    (e) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (isDraggingPlayhead) {
        const time = Math.max(0, Math.min(x / pixelsPerSecond, editorState.duration));
        onTimeChange(time);
      }

      // FIXED: Allow dragging in both select and move mode
      if (isDraggingElement && (selectedTool === 'move' || selectedTool === 'select')) {
        const deltaX = e.clientX - isDraggingElement.startX;
        const deltaTime = deltaX / pixelsPerSecond;

        if (isDraggingElement.type === 'timeline') {
          const element = editorState.timelineItems.find((t) => t.id === isDraggingElement.id);
          if (!element) return;

          if (isDraggingElement.handle === 'left') {
            const newStartTime = Math.max(0, isDraggingElement.originalStartTime + deltaTime);
            const maxStartTime = element.endTime - 0.5;
            const clampedStartTime = Math.min(newStartTime, maxStartTime);
            onUpdateTimelineItem(isDraggingElement.id, {
              startTime: clampedStartTime,
              duration: element.endTime - clampedStartTime,
            });
          } else if (isDraggingElement.handle === 'right') {
            const newEndTime = Math.max(element.startTime + 0.5, isDraggingElement.originalEndTime + deltaTime);
            onUpdateTimelineItem(isDraggingElement.id, {
              endTime: newEndTime,
              duration: newEndTime - element.startTime,
            });
          } else if (isDraggingElement.handle === 'body') {
            const duration = isDraggingElement.originalEndTime - isDraggingElement.originalStartTime;
            const newStartTime = Math.max(0, isDraggingElement.originalStartTime + deltaTime);
            onUpdateTimelineItem(isDraggingElement.id, {
              startTime: newStartTime,
              endTime: newStartTime + duration,
            });
          }
        } else if (isDraggingElement.type === 'text') {
          const element = editorState.textElements.find((t) => t.id === isDraggingElement.id);
          if (!element) return;

          if (isDraggingElement.handle === 'left') {
            const newStartTime = Math.max(0, isDraggingElement.originalStartTime + deltaTime);
            if (newStartTime < element.endTime - 0.5) {
              onUpdateText(isDraggingElement.id, { startTime: newStartTime });
            }
          } else if (isDraggingElement.handle === 'right') {
            const newEndTime = Math.max(element.startTime + 0.5, isDraggingElement.originalEndTime + deltaTime);
            onUpdateText(isDraggingElement.id, { endTime: newEndTime });
          } else if (isDraggingElement.handle === 'body') {
            const duration = isDraggingElement.originalEndTime - isDraggingElement.originalStartTime;
            const newStartTime = Math.max(0, isDraggingElement.originalStartTime + deltaTime);
            onUpdateText(isDraggingElement.id, {
              startTime: newStartTime,
              endTime: newStartTime + duration,
            });
          }
        } else if (isDraggingElement.type === 'sticker') {
          const element = editorState.stickerElements.find((s) => s.id === isDraggingElement.id);
          if (!element) return;

          if (isDraggingElement.handle === 'left') {
            const newStartTime = Math.max(0, isDraggingElement.originalStartTime + deltaTime);
            if (newStartTime < element.endTime - 0.5) {
              onUpdateSticker(isDraggingElement.id, { startTime: newStartTime });
            }
          } else if (isDraggingElement.handle === 'right') {
            const newEndTime = Math.max(element.startTime + 0.5, isDraggingElement.originalEndTime + deltaTime);
            onUpdateSticker(isDraggingElement.id, { endTime: newEndTime });
          } else if (isDraggingElement.handle === 'body') {
            const duration = isDraggingElement.originalEndTime - isDraggingElement.originalStartTime;
            const newStartTime = Math.max(0, isDraggingElement.originalStartTime + deltaTime);
            onUpdateSticker(isDraggingElement.id, {
              startTime: newStartTime,
              endTime: newStartTime + duration,
            });
          }
        }
      }
    },
    [
      isDraggingPlayhead,
      isDraggingElement,
      selectedTool,
      pixelsPerSecond,
      editorState.duration,
      onTimeChange,
      onUpdateText,
      onUpdateSticker,
      onUpdateTimelineItem,
      editorState.textElements,
      editorState.stickerElements,
      editorState.timelineItems,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDraggingPlayhead(false);
    setIsDraggingElement(null);
  }, []);

  useEffect(() => {
    if (isDraggingPlayhead || isDraggingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPlayhead, isDraggingElement, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'c' || e.key === 'C') {
        setSelectedTool('cut');
      } else if (e.key === 'v' || e.key === 'V') {
        setSelectedTool('select');
      } else if (e.key === 'm' || e.key === 'M') {
        setSelectedTool('move');
      } else if (e.key === 'Delete' && editorState.selectedItem) {
        onDeleteItem(editorState.selectedItem);
      } else if (e.ctrlKey && e.key === 'd' && editorState.selectedItem) {
        e.preventDefault();
        onDuplicateItem(editorState.selectedItem);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedItem, onDeleteItem, onDuplicateItem]);

  const getTrackIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'sticker':
        return <Sticker className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 bg-white border-t flex flex-col">
      {/* Toolbar */}
      <TimelineToolbar
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        selectedItem={editorState.selectedItem}
        onCut={() => editorState.selectedItem && onSplitItem(editorState.selectedItem, editorState.currentTime)}
        onDuplicate={() => editorState.selectedItem && onDuplicateItem(editorState.selectedItem)}
        onDelete={() => editorState.selectedItem && onDeleteItem(editorState.selectedItem)}
        onUndo={() => {}} // TODO: Implement undo
        onRedo={() => {}} // TODO: Implement redo
      />

      {/* Header */}
      <div className="h-12 bg-gray-50 border-b flex items-center px-4 gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setZoom([Math.max(0.1, zoom[0] - 0.2)])}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs w-12">{Math.round(zoom[0] * 100)}%</span>
          <Slider value={zoom} onValueChange={setZoom} min={0.1} max={3} step={0.1} className="w-20" />
          <Button variant="ghost" size="sm" onClick={() => setZoom([Math.min(3, zoom[0] + 0.2)])}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm">
          {formatTime(editorState.currentTime)} / {formatTime(editorState.duration)}
        </div>

        <div className="flex-1" />

        {/* Add Track Buttons */}
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => addTrack('video')}>
            <Video className="w-4 h-4 mr-1" />
            Video
          </Button>
          <Button variant="outline" size="sm" onClick={() => addTrack('audio')}>
            <Music className="w-4 h-4 mr-1" />
            Audio
          </Button>
          <Button variant="outline" size="sm" onClick={() => addTrack('text')}>
            <Type className="w-4 h-4 mr-1" />
            Text
          </Button>
          <Button variant="outline" size="sm" onClick={() => addTrack('sticker')}>
            <Sticker className="w-4 h-4 mr-1" />
            Sticker
          </Button>
        </div>
      </div>

      {/* Timeline Body */}
      <div className="flex flex-1 min-h-0">
        {/* Track Labels */}
        <div className="w-32 bg-gray-50 border-r flex-shrink-0 flex flex-col">
          <div className="h-8 bg-gray-100 border-b flex-shrink-0"></div>
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100% - 32px)' }}>
            {tracks.map((track) => (
              <div key={track.id} className="h-16 border-b flex items-center justify-between px-2 bg-gray-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {getTrackIcon(track.type)}
                  <span className="text-xs font-medium truncate">{track.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeTrack(track.id)} className="w-6 h-6 p-0 hover:bg-red-100">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Time Ruler */}
          <div className="h-8 bg-gray-100 border-b relative flex-shrink-0 overflow-x-auto">
            <div style={{ width: timelineWidth, minWidth: '100%' }}>
              {Array.from({ length: Math.ceil(editorState.duration / 5) + 1 }, (_, i) => (
                <div key={i} className="absolute top-0 h-full" style={{ left: i * 5 * pixelsPerSecond }}>
                  <div className="w-px h-full bg-gray-300"></div>
                  <span className="text-xs text-gray-500 ml-1">{formatTime(i * 5)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100% - 32px)' }}>
            <div
              ref={timelineRef}
              className={`relative bg-white ${selectedTool === 'cut' ? 'cursor-crosshair' : 'cursor-default'}`}
              style={{
                width: timelineWidth,
                minWidth: '100%',
                height: tracks.length * 64,
              }}
              onClick={handleTimelineClick}
            >
              {/* Cut Line Indicator */}
              {selectedTool === 'cut' && (
                <div
                  className="absolute top-0 w-0.5 bg-yellow-500 z-10 pointer-events-none"
                  style={{
                    left: editorState.currentTime * pixelsPerSecond,
                    height: tracks.length * 64,
                  }}
                >
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-500 rounded border-2 border-white">
                    <Scissors className="w-2 h-2 text-white m-0.5" />
                  </div>
                </div>
              )}

              {/* Playhead */}
              <div
                className="absolute top-0 w-0.5 bg-red-500 z-20 cursor-ew-resize"
                style={{
                  left: editorState.currentTime * pixelsPerSecond,
                  height: tracks.length * 64,
                }}
                onMouseDown={handlePlayheadMouseDown}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded border-2 border-white cursor-ew-resize"></div>
              </div>

              {/* Dynamic Tracks */}
              {tracks.map((track, trackIndex) => (
                <div
                  key={track.id}
                  className={`h-16 border-b relative ${dragOverTrack === track.id ? 'bg-gray-100' : 'bg-gray-50'}`}
                  style={{ top: trackIndex * 64 }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTrack(track.id);
                  }}
                  onDragLeave={() => setDragOverTrack(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverTrack(null);
                    const mediaId = e.dataTransfer.getData('text/plain');
                    if (!mediaId || !timelineRef.current) return;
                    const rect = timelineRef.current.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const time = Math.max(0, x / pixelsPerSecond);
                    onDrop(mediaId, trackIndex, time);
                  }}
                >
                  {/* Track Items */}
                  {track.items.map((item) => (
                    <TimelineItemWithHandles
                      key={item.id}
                      item={item}
                      track={track}
                      editorState={editorState}
                      selectedTool={selectedTool}
                      onSelect={onItemSelect}
                      onClick={handleItemClick}
                      pixelsPerSecond={pixelsPerSecond}
                      onDragStart={(handle, startX) => {
                        // FIXED: Allow dragging in both select and move mode
                        if (selectedTool === 'move' || selectedTool === 'select') {
                          const itemType = item.text ? 'text' : item.emoji ? 'sticker' : 'timeline';
                          setIsDraggingElement({
                            type: itemType,
                            id: item.id,
                            handle,
                            startX,
                            originalStartTime: item.startTime,
                            originalEndTime: item.endTime,
                          });
                        }
                      }}
                    />
                  ))}

                  {dragOverTrack === track.id && (
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600">Drop {track.type} here</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FIXED: Enhanced Timeline Item Component with resize handles in both select and move mode
function TimelineItemWithHandles({ item, track, editorState, selectedTool, onSelect, onClick, pixelsPerSecond, onDragStart }) {
  const isSelected = editorState.selectedItem === item.id;
  const duration = item.endTime - item.startTime;

  const getItemContent = () => {
    if (item.text) return item.text;
    if (item.emoji) return item.emoji;
    const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
    return media?.name || 'Item';
  };

  const getCursor = () => {
    if (selectedTool === 'cut') return 'cursor-crosshair';
    if (selectedTool === 'move') return 'cursor-move';
    return 'cursor-pointer';
  };

  // FIXED: Show resize handles in both select and move mode (not in cut mode)
  const showResizeHandles = selectedTool !== 'cut';

  return (
    <div
      className={`absolute top-2 bottom-2 ${track.color} text-white rounded px-2 py-1 text-xs group ${
        isSelected ? 'ring-2 ring-blue-300' : ''
      } ${getCursor()}`}
      style={{
        left: item.startTime * pixelsPerSecond,
        width: Math.max(duration * pixelsPerSecond, 60),
      }}
      onClick={(e) => onClick(e, item.id)}
    >
      <div className="truncate">{getItemContent()}</div>
      <div className="text-xs opacity-75">{duration.toFixed(1)}s</div>

      {/* Tool-specific overlays */}
      {selectedTool === 'cut' && (
        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-yellow-600" />
        </div>
      )}

      {/* FIXED: Resize Handles - Show in both select and move mode */}
      {showResizeHandles && (
        <>
          {/* LEFT Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/40 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart('left', e.clientX);
            }}
            title="Resize start"
          >
            <div className="w-1 h-4 bg-white rounded"></div>
          </div>

          {/* RIGHT Resize Handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/40 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart('right', e.clientX);
            }}
            title="Resize end"
          >
            <div className="w-1 h-4 bg-white rounded"></div>
          </div>

          {/* Body drag area */}
          <div
            className="absolute inset-3 cursor-move"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                onDragStart('body', e.clientX);
              }
            }}
            title="Move position"
          />
        </>
      )}
    </div>
  );
}
