'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEditor } from './useEditor';
import { cloudinaryService } from '@/services/cloudinary-service';
import { VideoProcessor } from '@/utils/video-processor';
import { updateVideoById } from '@/apis/videoService';

export default function useCloudEditor(config = {}) {
  const editor = useEditor();

  const [cloudState, setCloudState] = useState({
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    baseVideo: null,
    lastSavedUrl: null,
    error: null,
    hasChanges: false,
    originalState: null,
  });

  // FIXED: Better original state saving
  const saveOriginalState = useCallback(() => {
    console.log('💾 Saving original state...');
    setCloudState((prev) => ({
      ...prev,
      originalState: {
        timelineItems: [...editor.editorState.timelineItems],
        textElements: [...editor.editorState.textElements],
        stickerElements: [...editor.editorState.stickerElements],
      },
    }));
  }, [editor.editorState]);

  // Track changes by comparing with original state
  useEffect(() => {
    if (cloudState.originalState) {
      // Simple change detection - check if we have more items than original
      const currentTimelineCount = editor.editorState.timelineItems.length;
      const currentTextCount = editor.editorState.textElements.length;
      const currentStickerCount = editor.editorState.stickerElements.length;

      const originalTimelineCount = cloudState.originalState.timelineItems.length;
      const originalTextCount = cloudState.originalState.textElements.length;
      const originalStickerCount = cloudState.originalState.stickerElements.length;

      const hasChanges =
        currentTimelineCount !== originalTimelineCount ||
        currentTextCount !== originalTextCount ||
        currentStickerCount !== originalStickerCount ||
        // Also check if any timeline items have been modified
        editor.editorState.timelineItems.some((item) => {
          const original = cloudState.originalState.timelineItems.find((orig) => orig.mediaId === item.mediaId);
          return (
            !original || original.startTime !== item.startTime || original.endTime !== item.endTime || original.duration !== item.duration
          );
        });

      setCloudState((prev) => ({ ...prev, hasChanges }));
    } else {
      // If no original state yet, any content means changes
      const hasAnyContent =
        editor.editorState.timelineItems.length > 0 ||
        editor.editorState.textElements.length > 0 ||
        editor.editorState.stickerElements.length > 0;

      setCloudState((prev) => ({ ...prev, hasChanges: hasAnyContent }));
    }
  }, [editor.editorState, cloudState.originalState]);

  // FIXED: Improved base video loading with better error handling
  const loadBaseVideo = useCallback(
    async (videoUrl, publicId) => {
      console.log('📥 Loading base video from cloud:', videoUrl);

      setCloudState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Create a video element to get metadata
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';

        const videoMetadata = await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            resolve({
              duration: video.duration,
              width: video.videoWidth,
              height: video.videoHeight,
            });
          };
          video.onerror = reject;
          video.src = videoUrl;
        });

        // Create a File-like object from the URL
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], `base-video-${Date.now()}.mp4`, { type: 'video/mp4' });

        // FIXED: Wait for media item to be fully added
        console.log('📹 Adding base video to media library...');
        const mediaItem = await editor.addMediaItem(file);
        console.log('✅ Media item created:', mediaItem.id);

        // FIXED: Save original state after timeline is populated
        const addToTimelineWithRetry = async (retries = 10) => {
          for (let i = 0; i < retries; i++) {
            try {
              console.log(`📍 Attempt ${i + 1}: Adding base video to timeline...`);

              const currentMediaItems = editor.editorState.mediaItems;
              const foundMedia = currentMediaItems.find((m) => m.id === mediaItem.id);

              if (foundMedia) {
                console.log('✅ Media found in state, adding to timeline...');
                editor.addToTimeline(mediaItem.id, 0, 0);

                // Save original state after successful timeline addition
                setTimeout(() => {
                  saveOriginalState();
                  console.log('✅ Original state saved');
                }, 1000); // Increased timeout

                break;
              } else {
                console.log(`⏳ Media not found in state yet, waiting... (attempt ${i + 1}/${retries})`);
                if (i < retries - 1) {
                  await new Promise((resolve) => setTimeout(resolve, 300));
                }
              }
            } catch (error) {
              console.warn(`⚠️ Timeline add attempt ${i + 1} failed:`, error);
              if (i < retries - 1) {
                await new Promise((resolve) => setTimeout(resolve, 300));
              }
            }
          }
        };

        // Start the retry process
        setTimeout(() => addToTimelineWithRetry(), 200);

        // Update cloud state
        setCloudState((prev) => ({
          ...prev,
          isLoading: false,
          baseVideo: {
            url: videoUrl,
            publicId: publicId || 'unknown',
            duration: videoMetadata.duration,
          },
        }));

        console.log('✅ Base video loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load base video:', error);
        setCloudState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Failed to load base video: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
      }
    },
    [editor, saveOriginalState]
  );

  // FIXED: Improved save changes with better error handling and progress tracking
  const saveChanges = useCallback(
    async (saveSettings = { format: 'mp4', quality: 'medium', keepOriginal: true }, uploadOptions = {}, videoid) => {
      console.log('💾 Starting save changes process...');

      if (editor.editorState.duration <= 0 || !cloudState.hasChanges) {
        throw new Error('No changes to save');
      }

      setCloudState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }));

      try {
        // Step 1: Export video with changes (80% of progress)
        console.log('🎬 Exporting video with changes...');
        setCloudState((prev) => ({ ...prev, uploadProgress: 5 }));

        const videoBlob = await VideoProcessor.exportVideo(
          editor.editorState.mediaItems,
          editor.editorState.timelineItems,
          editor.editorState.textElements,
          editor.editorState.stickerElements,
          editor.editorState.duration,
          saveSettings.format,
          saveSettings.quality,
          (progress) => {
            // Export takes 80% of total progress
            const totalProgress = Math.round(progress * 0.8);
            setCloudState((prev) => ({
              ...prev,
              uploadProgress: totalProgress,
            }));
          }
        );

        console.log('✅ Video exported successfully!');
        console.log('📊 Exported video size:', (videoBlob.size / 1024 / 1024).toFixed(2), 'MB');

        // Step 2: Upload to Cloudinary (20% of progress)
        console.log('☁️ Uploading to Cloudinary...');
        setCloudState((prev) => ({ ...prev, uploadProgress: 80 }));

        const uploadResult = await cloudinaryService.uploadVideo(videoBlob, {
          ...uploadOptions,
          publicId: uploadOptions.publicId || `${config.projectId || 'edited'}-${Date.now()}`,
          folder: uploadOptions.folder || 'video-editor/edited',
          tags: [...(uploadOptions.tags || []), 'edited', 'updated', 'video-editor'],
          onProgress: (progress) => {
            // Upload takes remaining 20% of progress
            const totalProgress = Math.round(80 + progress * 0.2);
            setCloudState((prev) => ({
              ...prev,
              uploadProgress: totalProgress,
            }));
          },
        });

        // Step 3: Update state
        setCloudState((prev) => ({
          ...prev,
          isUploading: false,
          uploadProgress: 100,
          lastSavedUrl: uploadResult.secure_url,
          hasChanges: false, // Reset changes flag
          originalState: {
            timelineItems: [...editor.editorState.timelineItems],
            textElements: [...editor.editorState.textElements],
            stickerElements: [...editor.editorState.stickerElements],
          },
        }));

        console.log('🎉 Changes saved successfully!');
        console.log('🔗 Video URL:', uploadResult.secure_url);
        try {
          var response = await updateVideoById({ id: videoid, videoUrl: uploadResult.secure_url });
        } catch (error) {
          console.error('❌ Failed to update video URL:', error);
        }
        return uploadResult;
      } catch (error) {
        console.error('💥 Save failed:', error);
        setCloudState((prev) => ({
          ...prev,
          isUploading: false,
          uploadProgress: 0,
          error: `Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
        throw error;
      }
    },
    [editor, config.projectId, cloudState.hasChanges]
  );

  // FIXED: Improved cancel editing with proper state management
  const cancelEditing = useCallback(() => {
    console.log('❌ Canceling editing, resetting to original state...');

    if (cloudState.originalState) {
      // Reset editor to original state using the setEditorState function
      editor.setEditorState((prev) => ({
        ...prev,
        timelineItems: [...cloudState.originalState.timelineItems],
        textElements: [...cloudState.originalState.textElements],
        stickerElements: [...cloudState.originalState.stickerElements],
        selectedItem: null,
        currentTime: 0,
        isPlaying: false,
      }));
    } else {
      // If no original state, clear everything except base video
      editor.setEditorState((prev) => ({
        ...prev,
        timelineItems: prev.timelineItems.slice(0, 1), // Keep only base video
        textElements: [],
        stickerElements: [],
        selectedItem: null,
        currentTime: 0,
        isPlaying: false,
      }));
    }

    // Reset cloud state
    setCloudState((prev) => ({
      ...prev,
      hasChanges: false,
      error: null,
    }));

    console.log('✅ Editing canceled, returned to original state');
  }, [editor, cloudState.originalState]);

  // Auto-load base video on mount
  useEffect(() => {
    if (config.baseVideoUrl && !cloudState.baseVideo && !cloudState.isLoading) {
      loadBaseVideo(config.baseVideoUrl, config.baseVideoPublicId);
    }
  }, [config.baseVideoUrl, config.baseVideoPublicId, cloudState.baseVideo, cloudState.isLoading, loadBaseVideo]);

  // Clear error after some time
  useEffect(() => {
    if (cloudState.error) {
      const timer = setTimeout(() => {
        setCloudState((prev) => ({ ...prev, error: null }));
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [cloudState.error]);

  return {
    // Editor state and functions
    ...editor,

    // Cloud-specific state
    cloudState,

    // Cloud-specific functions
    loadBaseVideo,
    saveChanges,
    cancelEditing,

    // Helper functions
    getOptimizedUrl: (publicId, options) => cloudinaryService.getOptimizedVideoUrl(publicId, options),
    getThumbnail: (publicId, options) => cloudinaryService.getVideoThumbnail(publicId, options),
  };
}
