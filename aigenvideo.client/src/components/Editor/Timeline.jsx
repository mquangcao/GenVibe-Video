'use client';

import React from 'react';
import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Type, Scissors, Copy, Trash2, MousePointer, Move } from 'lucide-react';

export function Timeline({
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
  const labelsRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const [zoom, setZoom] = useState([1]);
  const [dragOverTrack, setDragOverTrack] = useState(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [selectedTool, setSelectedTool] = useState('select');
  const [isDraggingElement, setIsDraggingElement] = useState(null);

  const pixelsPerSecond = 50 * zoom[0];
  const timelineWidth = Math.max(editorState.duration * pixelsPerSecond, 800);

  // TRACK CONFIGURATION
  const TRACK_HEIGHT = 64;
  const TIME_RULER_HEIGHT = 32;
  const tracks = [
    { id: 0, name: 'Video', bgColor: 'bg-blue-50', hoverColor: 'bg-blue-100' },
    { id: 1, name: 'Audio', bgColor: 'bg-purple-50', hoverColor: 'bg-purple-100' },
    { id: 2, name: 'Text', bgColor: 'bg-green-50', hoverColor: 'bg-green-100' },
    { id: 3, name: 'Stickers', bgColor: 'bg-orange-50', hoverColor: 'bg-orange-100' },
  ];

  // SYNC SCROLL BETWEEN LABELS AND TIMELINE
  const handleTimelineScroll = useCallback(() => {
    if (timelineScrollRef.current && labelsRef.current) {
      labelsRef.current.scrollTop = timelineScrollRef.current.scrollTop;
    }
  }, []);

  const handleLabelsScroll = useCallback(() => {
    if (timelineScrollRef.current && labelsRef.current) {
      timelineScrollRef.current.scrollTop = labelsRef.current.scrollTop;
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || isDraggingPlayhead || isDraggingElement) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, x / pixelsPerSecond);

    if (selectedTool === 'select') {
      onTimeChange(time);
    }
  };

  // ENHANCED: Handle item clicks based on selected tool
  const handleItemClick = (e, itemId, itemType) => {
    e.stopPropagation();

    if (selectedTool === 'cut') {
      // Cut item at current playhead position
      console.log(`🔪 Cutting ${itemType} item:`, itemId, 'at time:', editorState.currentTime);
      onSplitItem(itemId, editorState.currentTime);
    } else {
      // Select item
      onItemSelect(itemId);
    }
  };

  const handlePlayheadMouseDown = (e) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (isDraggingPlayhead) {
        const time = Math.max(0, Math.min(x / pixelsPerSecond, editorState.duration));
        onTimeChange(time);
      }

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

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'c' || e.key === 'C') {
        setSelectedTool('cut');
      } else if (e.key === 'v' || e.key === 'V') {
        setSelectedTool('select');
      } else if (e.key === 'm' || e.key === 'M') {
        setSelectedTool('move');
      } else if (e.key === 'Delete' && editorState.selectedItem) {
        console.log('🗑️ Deleting selected item:', editorState.selectedItem);
        onDeleteItem(editorState.selectedItem);
      } else if (e.ctrlKey && e.key === 'd' && editorState.selectedItem) {
        e.preventDefault();
        console.log('📋 Duplicating selected item:', editorState.selectedItem);
        onDuplicateItem(editorState.selectedItem);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedItem, onDeleteItem, onDuplicateItem]);

  const handleDragOver = (e, track) => {
    e.preventDefault();
    setDragOverTrack(track);
  };

  const handleDrop = (e, track) => {
    e.preventDefault();
    setDragOverTrack(null);
    const mediaId = e.dataTransfer.getData('text/plain');
    if (!mediaId || !timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, x / pixelsPerSecond);
    onDrop(mediaId, track, time);
  };

  // ENHANCED: Proper delete, cut, duplicate handlers
  const handleDeleteSelected = () => {
    if (!editorState.selectedItem) return;
    console.log('🗑️ Deleting selected item:', editorState.selectedItem);
    onDeleteItem(editorState.selectedItem);
  };

  const handleCutSelected = () => {
    if (!editorState.selectedItem) return;
    console.log('🔪 Cutting selected item at playhead:', editorState.currentTime);
    onSplitItem(editorState.selectedItem, editorState.currentTime);
  };

  const handleDuplicateSelected = () => {
    if (!editorState.selectedItem) return;
    console.log('📋 Duplicating selected item:', editorState.selectedItem);
    onDuplicateItem(editorState.selectedItem);
  };

  return (
    <div className="h-full bg-white border-t flex flex-col">
      {/* ENHANCED Toolbar - FIXED HEIGHT */}
      <div className="h-10 bg-gray-100 border-b flex items-center px-3 gap-2 flex-shrink-0">
        {/* Tool Selection */}
        <div className="flex items-center gap-1">
          <Button
            variant={selectedTool === 'select' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTool('select')}
            className="h-8"
            title="Select Tool (V)"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedTool === 'cut' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTool('cut')}
            className="h-8"
            title="Cut Tool (C)"
          >
            <Scissors className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedTool === 'move' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedTool('move')}
            className="h-8"
            title="Move Tool (M)"
          >
            <Move className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Item Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCutSelected}
            disabled={!editorState.selectedItem}
            className="h-8"
            title="Cut at Playhead (C)"
          >
            <Scissors className="w-4 h-4" />
            Cut
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicateSelected}
            disabled={!editorState.selectedItem}
            className="h-8"
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-4 h-4" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!editorState.selectedItem}
            className="h-8 text-red-600 hover:text-red-700"
            title="Delete (Del)"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        <div className="flex-1" />

        {/* Status */}
        <div className="text-xs text-gray-500">
          {selectedTool === 'cut' && 'Click on items to cut at playhead'}
          {selectedTool === 'move' && 'Drag items to move them'}
          {selectedTool === 'select' && editorState.selectedItem && 'Item selected - use tools above'}
          {selectedTool === 'select' && !editorState.selectedItem && 'Select an item to edit'}
        </div>
      </div>

      {/* Header - FIXED HEIGHT */}
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
      </div>

      {/* Timeline Body - SYNCHRONIZED SCROLLING */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Track Labels - SCROLLABLE AND SYNCED */}
        <div className="w-24 bg-gray-50 border-r flex-shrink-0 flex flex-col">
          {/* Time ruler spacer - FIXED */}
          <div className="bg-gray-100 border-b flex-shrink-0" style={{ height: TIME_RULER_HEIGHT }}></div>

          {/* Scrollable Labels Container - SYNCED WITH TIMELINE */}
          <div
            ref={labelsRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
            onScroll={handleLabelsScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div style={{ height: tracks.length * TRACK_HEIGHT }}>
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`w-full border-b flex items-center justify-center text-xs font-medium ${track.bgColor}`}
                  style={{ height: TRACK_HEIGHT }}
                >
                  {track.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Timeline - SYNCED WITH LABELS */}
        <div ref={timelineScrollRef} className="flex-1 overflow-auto min-w-0" onScroll={handleTimelineScroll}>
          <div
            ref={timelineRef}
            className={`relative bg-white ${selectedTool === 'cut' ? 'cursor-crosshair' : 'cursor-default'}`}
            style={{
              width: timelineWidth,
              minWidth: '100%',
              height: TIME_RULER_HEIGHT + tracks.length * TRACK_HEIGHT,
            }}
            onClick={handleTimelineClick}
          >
            {/* Time Ruler - FIXED AT TOP */}
            <div className="bg-gray-100 border-b relative flex-shrink-0 top-0 z-10" style={{ height: TIME_RULER_HEIGHT }}>
              {Array.from({ length: Math.ceil(editorState.duration / 5) + 1 }, (_, i) => (
                <div key={i} className="absolute top-0 h-full" style={{ left: i * 5 * pixelsPerSecond }}>
                  <div className="w-px h-full bg-gray-300"></div>
                  <span className="text-xs text-gray-500 ml-1">{formatTime(i * 5)}</span>
                </div>
              ))}
            </div>

            {/* Cut Line Indicator */}
            {selectedTool === 'cut' && (
              <div
                className="absolute w-0.5 bg-yellow-500 z-15 pointer-events-none"
                style={{
                  left: editorState.currentTime * pixelsPerSecond,
                  top: TIME_RULER_HEIGHT,
                  height: tracks.length * TRACK_HEIGHT,
                }}
              >
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-500 rounded border-2 border-white">
                  <Scissors className="w-2 h-2 text-white m-0.5" />
                </div>
              </div>
            )}

            {/* Playhead - FULL HEIGHT */}
            <div
              className="absolute w-0.5 bg-red-500 z-20 cursor-ew-resize"
              style={{
                left: editorState.currentTime * pixelsPerSecond,
                top: TIME_RULER_HEIGHT,
                height: tracks.length * TRACK_HEIGHT,
              }}
              onMouseDown={handlePlayheadMouseDown}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded border-2 border-white cursor-ew-resize"></div>
            </div>

            {/* Tracks - SCROLLABLE CONTENT */}
            <div style={{ height: tracks.length * TRACK_HEIGHT }}>
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`w-full border-b relative ${track.bgColor} ${dragOverTrack === track.id ? track.hoverColor : ''}`}
                  style={{ height: TRACK_HEIGHT }}
                  onDragOver={(e) => handleDragOver(e, track.id)}
                  onDragLeave={() => setDragOverTrack(null)}
                  onDrop={(e) => handleDrop(e, track.id)}
                >
                  {/* Render items based on track type */}
                  {track.id <= 1 && // Video and Audio tracks
                    editorState.timelineItems
                      .filter((item) => item.track === track.id)
                      .map((item) => (
                        <TimelineItemWithHandles
                          key={item.id}
                          item={item}
                          editorState={editorState}
                          selectedTool={selectedTool}
                          onSelect={onItemSelect}
                          onClick={(e) => handleItemClick(e, item.id, 'timeline')}
                          pixelsPerSecond={pixelsPerSecond}
                          onDragStart={(handle, startX) => {
                            if (selectedTool !== 'cut') {
                              setIsDraggingElement({
                                type: 'timeline',
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

                  {track.id === 2 && // Text track
                    editorState.textElements.map((text) => (
                      <TextElementWithHandles
                        key={text.id}
                        text={text}
                        editorState={editorState}
                        selectedTool={selectedTool}
                        onSelect={onItemSelect}
                        onClick={(e) => handleItemClick(e, text.id, 'text')}
                        pixelsPerSecond={pixelsPerSecond}
                        onDragStart={(handle, startX) => {
                          if (selectedTool !== 'cut') {
                            setIsDraggingElement({
                              type: 'text',
                              id: text.id,
                              handle,
                              startX,
                              originalStartTime: text.startTime,
                              originalEndTime: text.endTime,
                            });
                          }
                        }}
                      />
                    ))}

                  {track.id === 3 && // Stickers track
                    editorState.stickerElements.map((sticker) => (
                      <StickerElementWithHandles
                        key={sticker.id}
                        sticker={sticker}
                        editorState={editorState}
                        selectedTool={selectedTool}
                        onSelect={onItemSelect}
                        onClick={(e) => handleItemClick(e, sticker.id, 'sticker')}
                        pixelsPerSecond={pixelsPerSecond}
                        onDragStart={(handle, startX) => {
                          if (selectedTool !== 'cut') {
                            setIsDraggingElement({
                              type: 'sticker',
                              id: sticker.id,
                              handle,
                              startX,
                              originalStartTime: sticker.startTime,
                              originalEndTime: sticker.endTime,
                            });
                          }
                        }}
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ENHANCED Timeline Item with Cut Support
function TimelineItemWithHandles({ item, editorState, selectedTool, onSelect, onClick, pixelsPerSecond, onDragStart }) {
  const media = editorState.mediaItems.find((m) => m.id === item.mediaId);
  const isSelected = editorState.selectedItem === item.id;

  const getCursor = () => {
    if (selectedTool === 'cut') return 'cursor-crosshair';
    if (selectedTool === 'move') return 'cursor-move';
    return 'cursor-pointer';
  };

  const showResizeHandles = selectedTool !== 'cut';

  return (
    <div
      className={`absolute top-2 bottom-2 bg-blue-500 text-white rounded px-2 py-1 text-xs group ${
        isSelected ? 'ring-2 ring-blue-300' : ''
      } ${getCursor()}`}
      style={{
        left: item.startTime * pixelsPerSecond,
        width: Math.max(item.duration * pixelsPerSecond, 60),
      }}
      onClick={(e) => onClick(e, item.id)}
    >
      <div className="truncate">{media?.name || 'Media'}</div>
      <div className="text-xs opacity-75">{item.duration.toFixed(1)}s</div>

      {/* Cut Tool Overlay */}
      {selectedTool === 'cut' && (
        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-yellow-600" />
        </div>
      )}

      {/* Resize Handles - Only show when not in cut mode */}
      {showResizeHandles && (
        <>
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

// ENHANCED Text Element with Cut Support
function TextElementWithHandles({ text, editorState, selectedTool, onSelect, onClick, pixelsPerSecond, onDragStart }) {
  const isSelected = editorState.selectedItem === text.id;
  const duration = text.endTime - text.startTime;

  const getCursor = () => {
    if (selectedTool === 'cut') return 'cursor-crosshair';
    if (selectedTool === 'move') return 'cursor-move';
    return 'cursor-pointer';
  };

  const showResizeHandles = selectedTool !== 'cut';

  return (
    <div
      className={`absolute top-2 bottom-2 bg-green-500 text-white rounded px-2 py-1 text-xs flex items-center gap-1 group ${
        isSelected ? 'ring-2 ring-green-300' : ''
      } ${getCursor()}`}
      style={{
        left: text.startTime * pixelsPerSecond,
        width: Math.max(duration * pixelsPerSecond, 60),
      }}
      onClick={(e) => onClick(e, text.id)}
    >
      <Type className="w-3 h-3" />
      <div className="flex-1 min-w-0">
        <div className="truncate">{text.text}</div>
        <div className="text-xs opacity-75">{duration.toFixed(1)}s</div>
      </div>

      {/* Cut Tool Overlay */}
      {selectedTool === 'cut' && (
        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-yellow-600" />
        </div>
      )}

      {/* Resize Handles */}
      {showResizeHandles && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/40 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart('left', e.clientX);
            }}
          >
            <div className="w-1 h-4 bg-white rounded"></div>
          </div>
          <div
            className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/40 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart('right', e.clientX);
            }}
          >
            <div className="w-1 h-4 bg-white rounded"></div>
          </div>
          <div
            className="absolute inset-3 cursor-move"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                onDragStart('body', e.clientX);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

// ENHANCED Sticker Element with Cut Support
function StickerElementWithHandles({ sticker, editorState, selectedTool, onSelect, onClick, pixelsPerSecond, onDragStart }) {
  const isSelected = editorState.selectedItem === sticker.id;
  const duration = sticker.endTime - sticker.startTime;

  const getCursor = () => {
    if (selectedTool === 'cut') return 'cursor-crosshair';
    if (selectedTool === 'move') return 'cursor-move';
    return 'cursor-pointer';
  };

  const showResizeHandles = selectedTool !== 'cut';

  return (
    <div
      className={`absolute top-2 bottom-2 bg-orange-500 text-white rounded px-2 py-1 text-xs flex items-center gap-1 group ${
        isSelected ? 'ring-2 ring-orange-300' : ''
      } ${getCursor()}`}
      style={{
        left: sticker.startTime * pixelsPerSecond,
        width: Math.max(duration * pixelsPerSecond, 60),
      }}
      onClick={(e) => onClick(e, sticker.id)}
    >
      <span className="text-sm">{sticker.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs opacity-75">{duration.toFixed(1)}s</div>
      </div>

      {/* Cut Tool Overlay */}
      {selectedTool === 'cut' && (
        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-yellow-600" />
        </div>
      )}

      {/* Resize Handles */}
      {showResizeHandles && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart('left', e.clientX);
            }}
            title="Resize start time"
          >
            <div className="w-1 h-4 bg-white rounded"></div>
          </div>

          <div
            className="absolute right-0 top-0 bottom-0 w-3 bg-white/20 hover:bg-white/50 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart('right', e.clientX);
            }}
            title="Resize end time"
          >
            <div className="w-1 h-4 bg-white rounded"></div>
          </div>

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
