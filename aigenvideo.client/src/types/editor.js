// MediaItem interface
export const createMediaItem = (id, type, name, url, file, duration, thumbnail, width, height) => ({
  id,
  type, // "video" | "image" | "audio"
  name,
  url,
  file,
  duration,
  thumbnail,
  width,
  height,
});

// TimelineItem interface
export const createTimelineItem = (id, mediaId, startTime, endTime, duration, track, trimStart, trimEnd) => ({
  id,
  mediaId,
  startTime,
  endTime,
  duration,
  track,
  trimStart,
  trimEnd,
});

// TextElement interface
export const createTextElement = (id, text, x, y, fontSize, color, fontFamily, startTime, endTime, rotation, opacity) => ({
  id,
  text,
  x,
  y,
  fontSize,
  color,
  fontFamily,
  startTime,
  endTime,
  rotation,
  opacity,
});

// StickerElement interface
export const createStickerElement = (id, emoji, x, y, size, startTime, endTime, rotation, opacity) => ({
  id,
  emoji,
  x,
  y,
  size,
  startTime,
  endTime,
  rotation,
  opacity,
});

// EditorState interface
export const createEditorState = () => ({
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
