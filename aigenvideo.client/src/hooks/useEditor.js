'use client';

import { useState, useCallback, useEffect } from 'react';
import { VideoProcessor } from '@/utils/video-processor';

export function useEditor() {
  const [editorState, setEditorStateInternal] = useState({
    mediaItems: [],
    timelineItems: [],
    textElements: [],
    stickerElements: [],
    currentTime: 0,
    duration: 0,
    zoom: 1,
    selectedItem: null,
    isPlaying: false,
  });

  // Smooth time updates for better audio playback
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const addMediaItem = useCallback(async (file) => {
    console.log('haahh check boyyy');
    console.log('Adding media item:', file.name, file.type);
    const url = URL.createObjectURL(file);
    let duration = 5;
    let thumbnail = url;
    let width = 1920;
    let height = 1080;

    try {
      if (file.type.startsWith('video/')) {
        duration = await VideoProcessor.getVideoDuration(file);
        thumbnail = await VideoProcessor.getVideoThumbnail(file);
        console.log('Video duration:', duration);
      } else if (file.type.startsWith('image/')) {
        const dimensions = await VideoProcessor.getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
        duration = 5;
      } else if (file.type.startsWith('audio/')) {
        duration = 30;
      }
    } catch (error) {
      console.error('Error processing media:', error);
    }
    console.log('haahh check boyyy 2');

    const media = {
      id: `media-${Date.now()}-${Math.random()}`,
      type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'audio',
      name: file.name,
      url,
      file,
      duration,
      thumbnail,
      width,
      height,
    };
    console.log('haahh check boyyy3');

    console.log('Created media item:', media);

    // FIXED: Use return value from setState to ensure media is added
    return new Promise((resolve) => {
      setEditorStateInternal((prev) => {
        const newState = {
          ...prev,
          mediaItems: [...prev.mediaItems, media],
        };

        // Resolve with the media item after state update
        setTimeout(() => resolve(media), 0);
        return newState;
      });
    });
  }, []);

  const addToTimeline = useCallback((mediaId, track, startTime) => {
    console.log('Adding to timeline:', { mediaId, track, startTime });

    // FIXED: Use current state from callback to ensure we have latest data
    setEditorStateInternal((prevState) => {
      const media = prevState.mediaItems.find((m) => m.id === mediaId);
      if (!media) {
        console.error(
          'Media not found:',
          mediaId,
          'Available media:',
          prevState.mediaItems.map((m) => m.id)
        );
        return prevState; // Return unchanged state if media not found
      }

      const actualStartTime = startTime ?? prevState.currentTime;

      // Check for overlapping items on the same track
      const overlappingItems = prevState.timelineItems.filter(
        (item) =>
          item.track === track &&
          ((actualStartTime >= item.startTime && actualStartTime < item.endTime) ||
            (actualStartTime + media.duration > item.startTime && actualStartTime < item.startTime))
      );

      let finalStartTime = actualStartTime;

      if (overlappingItems.length > 0) {
        // Find next available position
        const lastItem = prevState.timelineItems.filter((item) => item.track === track).sort((a, b) => b.endTime - a.endTime)[0];

        finalStartTime = lastItem ? lastItem.endTime : actualStartTime;
      }

      const newTimelineItem = {
        id: `timeline-${Date.now()}`,
        mediaId,
        startTime: finalStartTime,
        endTime: finalStartTime + media.duration,
        duration: media.duration,
        track,
        trimStart: 0,
        trimEnd: media.duration,
      };

      console.log('Created timeline item:', newTimelineItem);

      const newTimelineItems = [...prevState.timelineItems, newTimelineItem];
      const maxEndTime = Math.max(...newTimelineItems.map((item) => item.endTime), 0);
      const newDuration = maxEndTime > 0 ? maxEndTime : 0;

      return {
        ...prevState,
        timelineItems: newTimelineItems,
        duration: newDuration,
      };
    });
  }, []);

  const updateTimelineItem = useCallback((id, updates) => {
    console.log('Updating timeline item:', id, updates);
    setEditorStateInternal((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      duration: Math.max(
        prev.duration,
        ...prev.timelineItems.map((item) => (item.id === id ? updates.endTime || item.endTime : item.endTime))
      ),
    }));
  }, []);

  const splitTimelineItem = useCallback((id, splitTime) => {
    setEditorStateInternal((prev) => {
      const item = prev.timelineItems.find((t) => t.id === id);
      if (!item || splitTime <= item.startTime || splitTime >= item.endTime) return prev;

      const firstPart = {
        ...item,
        id: `timeline-${Date.now()}-1`,
        endTime: splitTime,
        duration: splitTime - item.startTime,
        trimEnd: item.trimStart + (splitTime - item.startTime),
      };

      const secondPart = {
        ...item,
        id: `timeline-${Date.now()}-2`,
        startTime: splitTime,
        duration: item.endTime - splitTime,
        trimStart: item.trimStart + (splitTime - item.startTime),
      };

      return {
        ...prev,
        timelineItems: prev.timelineItems.filter((t) => t.id !== id).concat([firstPart, secondPart]),
      };
    });
  }, []);

  const splitTextElement = useCallback((id, splitTime) => {
    setEditorStateInternal((prev) => {
      const item = prev.textElements.find((t) => t.id === id);
      if (!item || splitTime <= item.startTime || splitTime >= item.endTime) return prev;

      const firstPart = {
        ...item,
        id: `text-${Date.now()}-1`,
        endTime: splitTime,
      };

      const secondPart = {
        ...item,
        id: `text-${Date.now()}-2`,
        startTime: splitTime,
      };

      return {
        ...prev,
        textElements: prev.textElements.filter((t) => t.id !== id).concat([firstPart, secondPart]),
      };
    });
  }, []);

  const splitStickerElement = useCallback((id, splitTime) => {
    setEditorStateInternal((prev) => {
      const item = prev.stickerElements.find((s) => s.id === id);
      if (!item || splitTime <= item.startTime || splitTime >= item.endTime) return prev;

      const firstPart = {
        ...item,
        id: `sticker-${Date.now()}-1`,
        endTime: splitTime,
      };

      const secondPart = {
        ...item,
        id: `sticker-${Date.now()}-2`,
        startTime: splitTime,
      };

      return {
        ...prev,
        stickerElements: prev.stickerElements.filter((s) => s.id !== id).concat([firstPart, secondPart]),
      };
    });
  }, []);

  const duplicateTimelineItem = useCallback((id) => {
    setEditorStateInternal((prev) => {
      const item = prev.timelineItems.find((t) => t.id === id);
      if (!item) return prev;

      const duplicate = {
        ...item,
        id: `timeline-${Date.now()}-duplicate`,
        startTime: item.endTime,
        endTime: item.endTime + item.duration,
      };

      return {
        ...prev,
        timelineItems: [...prev.timelineItems, duplicate],
        duration: Math.max(prev.duration, duplicate.endTime),
      };
    });
  }, []);

  const duplicateTextElement = useCallback((id) => {
    setEditorStateInternal((prev) => {
      const item = prev.textElements.find((t) => t.id === id);
      if (!item) return prev;

      const duplicate = {
        ...item,
        id: `text-${Date.now()}-duplicate`,
        startTime: item.endTime,
        endTime: item.endTime + (item.endTime - item.startTime),
        x: item.x + 20,
        y: item.y + 20,
      };

      return {
        ...prev,
        textElements: [...prev.textElements, duplicate],
      };
    });
  }, []);

  const duplicateStickerElement = useCallback((id) => {
    setEditorStateInternal((prev) => {
      const item = prev.stickerElements.find((s) => s.id === id);
      if (!item) return prev;

      const duplicate = {
        ...item,
        id: `sticker-${Date.now()}-duplicate`,
        startTime: item.endTime,
        endTime: item.endTime + (item.endTime - item.startTime),
        x: item.x + 20,
        y: item.y + 20,
      };

      return {
        ...prev,
        stickerElements: [...prev.stickerElements, duplicate],
      };
    });
  }, []);

  const addTextElement = useCallback((text) => {
    setEditorStateInternal((prev) => ({
      ...prev,
      textElements: [...prev.textElements, text],
    }));
  }, []);

  const addStickerElement = useCallback((sticker) => {
    setEditorStateInternal((prev) => ({
      ...prev,
      stickerElements: [...prev.stickerElements, sticker],
    }));
  }, []);

  const updateTextElement = useCallback((id, updates) => {
    setEditorStateInternal((prev) => ({
      ...prev,
      textElements: prev.textElements.map((text) => (text.id === id ? { ...text, ...updates } : text)),
    }));
  }, []);

  const updateStickerElement = useCallback((id, updates) => {
    setEditorStateInternal((prev) => ({
      ...prev,
      stickerElements: prev.stickerElements.map((sticker) => (sticker.id === id ? { ...sticker, ...updates } : sticker)),
    }));
  }, []);

  // IMPROVED: Smoother time updates for better audio
  const setCurrentTime = useCallback(
    (time) => {
      const newTime = Math.max(0, Math.min(time, editorState.duration));
      const now = Date.now();

      // Throttle updates to prevent audio stuttering
      if (now - lastUpdateTime > 50) {
        // Max 20 updates per second
        console.log('Setting current time:', newTime);
        setEditorStateInternal((prev) => ({
          ...prev,
          currentTime: newTime,
        }));
        setLastUpdateTime(now);
      }
    },
    [editorState.duration, lastUpdateTime]
  );

  const setIsPlaying = useCallback((playing) => {
    console.log('Setting playing:', playing);
    setEditorStateInternal((prev) => ({
      ...prev,
      isPlaying: playing,
    }));
  }, []);

  const setSelectedItem = useCallback((itemId) => {
    setEditorStateInternal((prev) => ({
      ...prev,
      selectedItem: itemId,
    }));
  }, []);

  const deleteSelectedItem = useCallback(() => {
    if (!editorState.selectedItem) return;

    setEditorStateInternal((prev) => ({
      ...prev,
      timelineItems: prev.timelineItems.filter((item) => item.id !== prev.selectedItem),
      textElements: prev.textElements.filter((item) => item.id !== prev.selectedItem),
      stickerElements: prev.stickerElements.filter((item) => item.id !== prev.selectedItem),
      selectedItem: null,
    }));
  }, [editorState.selectedItem]);

  // IMPROVED: Smoother playback timer
  useEffect(() => {
    let interval;
    if (editorState.isPlaying && editorState.duration > 0) {
      interval = setInterval(() => {
        setEditorStateInternal((prev) => {
          if (prev.currentTime >= prev.duration) {
            return { ...prev, isPlaying: false, currentTime: prev.duration };
          }
          return { ...prev, currentTime: prev.currentTime + 0.1 };
        });
      }, 100); // 10 FPS for smooth playback
    }
    return () => clearInterval(interval);
  }, [editorState.isPlaying, editorState.duration]);

  return {
    editorState,
    addMediaItem,
    addToTimeline,
    addTextElement,
    addStickerElement,
    updateTextElement,
    updateStickerElement,
    updateTimelineItem,
    splitTimelineItem,
    splitTextElement,
    splitStickerElement,
    duplicateTimelineItem,
    duplicateTextElement,
    duplicateStickerElement,
    setCurrentTime,
    setIsPlaying,
    setSelectedItem,
    deleteSelectedItem,
    setEditorState: setEditorStateInternal, // Export for external use
  };
}
