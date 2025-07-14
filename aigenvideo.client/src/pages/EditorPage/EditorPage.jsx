'use client';

import { useEffect, useState } from 'react';
import { useCloudEditor } from '@/hooks';
import { Header } from '@/components/editor/header';
import { MediaLibrary } from '@/components';
import { Preview } from '@/components';
import { Timeline } from '@/components';
import { ToolsPanel } from '@/components';
import { CloudStatus } from '@/components';
import { SaveChangesDialog } from '@/components';
import { CancelDialog } from '@/components';
import { useNavigate, useParams } from 'react-router-dom';
import { getVideoById } from '@/apis/videoService';

// DEMO: Example base video from Cloudinary

export default function EditorPage() {
  const { videoid } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState({});
  const cloudEditor = useCloudEditor(config);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCloudStatus, setShowCloudStatus] = useState(true);
  useEffect(() => {
    const getVideoData = async () => {
      try {
        const response = await getVideoById(videoid);
        console.log(('Video data:', response.data));
        if (response.data.success) {
          const { videoUrl } = response.data.data;
          setConfig({
            baseVideoUrl: videoUrl,
            baseVideoPublicId: '',
            projectId: '',
            autoSave: false,
          });
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
        alert('Failed to load video data. Please try again later.');
      }
    };
    getVideoData();
  }, []);

  const handlePlayPause = () => {
    if (
      cloudEditor.editorState.timelineItems.length > 0 ||
      cloudEditor.editorState.textElements.length > 0 ||
      cloudEditor.editorState.stickerElements.length > 0
    ) {
      cloudEditor.setIsPlaying(!cloudEditor.editorState.isPlaying);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'video/*,image/*,audio/*';
    input.onchange = async (e) => {
      const files = e.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        try {
          await cloudEditor.addMediaItem(file);
        } catch (error) {
          console.error('Error adding media:', error);
          alert(`Error adding ${file.name}. Please try again.`);
        }
      }
    };
    input.click();
  };

  const handleSaveChanges = () => {
    if (cloudEditor.cloudState.hasChanges) {
      setShowSaveDialog(true);
    } else {
      alert('No changes to save!');
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    cloudEditor.cancelEditing();
    setShowCancelDialog(false);
    alert('Editing canceled. Returned to original video.');
  };

  const handleCloudSave = async (saveSettings, uploadOptions) => {
    console.log('💾 Saving changes with settings:', saveSettings, uploadOptions);
    return await cloudEditor.saveChanges(saveSettings, uploadOptions, videoid);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('video-editor-project', JSON.stringify(cloudEditor.editorState));
      alert('Project saved locally!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save project.');
    }
  };

  const handleRetryCloudOperation = () => {
    if (DEMO_CONFIG.baseVideoUrl) {
      cloudEditor.loadBaseVideo(DEMO_CONFIG.baseVideoUrl, DEMO_CONFIG.baseVideoPublicId);
    }
  };

  const handleCopyUrl = (url) => {
    console.log('📋 URL copied to clipboard:', url);
    // You could add a toast notification here
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Enhanced Header with Save/Cancel */}
      <Header
        isPlaying={cloudEditor.editorState.isPlaying}
        onPlayPause={handlePlayPause}
        onImport={handleImport}
        onSaveChanges={handleSaveChanges}
        onCancel={handleCancel}
        onSave={handleSave}
        hasChanges={cloudEditor.cloudState.hasChanges}
        isProcessing={cloudEditor.cloudState.isUploading}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Media Library */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          <MediaLibrary mediaItems={cloudEditor.editorState.mediaItems} onAddMedia={cloudEditor.addMediaItem} onDragStart={() => {}} />

          {/* Cloud Status Panel */}
          {showCloudStatus && (
            <div className="border-t p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Cloud Status</h3>
                <button onClick={() => setShowCloudStatus(false)} className="text-gray-400 hover:text-gray-600 text-xs">
                  Hide
                </button>
              </div>
              <CloudStatus cloudState={cloudEditor.cloudState} onRetry={handleRetryCloudOperation} onCopyUrl={handleCopyUrl} />

              {/* Changes Indicator */}
              {cloudEditor.cloudState.hasChanges && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded p-2">
                  <div className="text-xs text-orange-800 font-medium">⚠️ Unsaved Changes</div>
                  <div className="text-xs text-orange-600">Remember to save your changes!</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview + Tools */}
          <div className="h-[500px] flex min-h-0">
            <div className="flex-1 min-w-0">
              <Preview
                editorState={cloudEditor.editorState}
                onPlayPause={handlePlayPause}
                onUpdateText={cloudEditor.updateTextElement}
                onUpdateSticker={cloudEditor.updateStickerElement}
              />
            </div>

            <ToolsPanel
              onAddText={cloudEditor.addTextElement}
              onAddSticker={cloudEditor.addStickerElement}
              onUpdateText={cloudEditor.updateTextElement}
              onUpdateSticker={cloudEditor.updateStickerElement}
              onDeleteSelected={cloudEditor.deleteSelectedItem}
              currentTime={cloudEditor.editorState.currentTime}
              selectedItem={cloudEditor.editorState.selectedItem}
              editorState={cloudEditor.editorState}
            />
          </div>

          {/* Timeline */}
          <div className="h-64 min-h-0 mt-20">
            <Timeline
              editorState={cloudEditor.editorState}
              onTimeChange={cloudEditor.setCurrentTime}
              onItemSelect={cloudEditor.setSelectedItem}
              onDrop={(mediaId, track, time) => cloudEditor.addToTimeline(mediaId, track, time)}
              onUpdateText={cloudEditor.updateTextElement}
              onUpdateSticker={cloudEditor.updateStickerElement}
              onUpdateTimelineItem={cloudEditor.updateTimelineItem}
              onSplitItem={(itemId, time) => {
                const timelineItem = cloudEditor.editorState.timelineItems.find((t) => t.id === itemId);
                const textItem = cloudEditor.editorState.textElements.find((t) => t.id === itemId);
                const stickerItem = cloudEditor.editorState.stickerElements.find((s) => s.id === itemId);

                if (timelineItem && time > timelineItem.startTime && time < timelineItem.endTime) {
                  cloudEditor.splitTimelineItem(itemId, time);
                } else if (textItem && time > textItem.startTime && time < textItem.endTime) {
                  cloudEditor.splitTextElement(itemId, time);
                } else if (stickerItem && time > stickerItem.startTime && time < stickerItem.endTime) {
                  cloudEditor.splitStickerElement(itemId, time);
                }
              }}
              onDuplicateItem={(itemId) => {
                const timelineItem = cloudEditor.editorState.timelineItems.find((t) => t.id === itemId);
                const textItem = cloudEditor.editorState.textElements.find((t) => t.id === itemId);
                const stickerItem = cloudEditor.editorState.stickerElements.find((s) => s.id === itemId);

                if (timelineItem) {
                  cloudEditor.duplicateTimelineItem(itemId);
                } else if (textItem) {
                  cloudEditor.duplicateTextElement(itemId);
                } else if (stickerItem) {
                  cloudEditor.duplicateStickerElement(itemId);
                }
              }}
              onDeleteItem={cloudEditor.deleteSelectedItem}
            />
          </div>
        </div>
      </div>

      {/* Save Changes Dialog */}
      <SaveChangesDialog
        isOpen={showSaveDialog}
        onClose={() => {
          setShowSaveDialog(false);
          navigate('/my-videos');
        }}
        onSaveChanges={handleCloudSave}
        duration={cloudEditor.editorState.duration}
        projectId={config.projectId}
        baseVideoUrl={config.baseVideoUrl}
        hasChanges={cloudEditor.cloudState.hasChanges}
      />

      {/* Cancel Dialog */}
      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirmCancel={handleConfirmCancel}
        hasChanges={cloudEditor.cloudState.hasChanges}
        baseVideoUrl={config.baseVideoUrl}
      />

      {/* Cloud Status Toggle (if hidden) */}
      {!showCloudStatus && (
        <button
          onClick={() => setShowCloudStatus(true)}
          className="fixed bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
        >
          <span>☁️</span>
          Show Cloud Status
          {cloudEditor.cloudState.hasChanges && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
        </button>
      )}
    </div>
  );
}
