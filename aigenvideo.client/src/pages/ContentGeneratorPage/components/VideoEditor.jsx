﻿import React, { useState, useRef, useEffect } from 'react';
import {
  FaArrowLeft,
  FaVolumeUp,
  FaFileDownload,
  FaPlusCircle,
  FaMinusCircle,
  FaImages,
  FaVideo,
  FaCogs,
  FaClosedCaptioning,
} from 'react-icons/fa';

// Custom hooks
import { useSceneManager } from '@/hooks/useSceneManager';
import { useVideoProcessor } from '@/hooks/useVideoProcessor';

// Components
import SceneEditor from './SceneEditor';
import CustomScenesTab from './tabs/CustomScenesTab';
import VoiceSettings from './VoiceSettings';
import SubtitleSettings from './SubtitleSettings';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Edit, Upload } from 'lucide-react';

const VideoEditor = ({
  videoPrompt,
  setVideoPrompt,
  googleVoices,
  selectedGoogleVoice,
  setSelectedGoogleVoice,
  speechRate,
  setSpeechRate,
  activeTab,
  setActiveTab,
  handleBackToGenerator,
  handleCreateVideo,
  speakText,
  images,
  handleRejectImage,
  videoResult,
  isAudioPlaying,
  handleGenerateAndUpload,
  isLoading,
  error,
  getLanguageDisplayName,
  generateAudioBlob,
  selectedStyle,
  setSelectedStyle,
  selectedAudience,
  setSelectedAudience,
}) => {
  // Video review state
  const navigate = useNavigate();
  const [isReviewingAudio, setIsReviewingAudio] = useState(false);
  const [ccEnabled, setCcEnabled] = useState(true);
  const videoRef = useRef(null);

  const [subtitleSettings, setSubtitleSettings] = useState({
    enabled: true,
    embedInVideo: true,
    fontSize: 20,
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    position: 'bottom',
  });
  const availableStyles = ['Anime', 'Cartoon', 'Romantic', '3D Animated'];
  const audiences = ['Children', 'Teenager', 'Adults'];
  // Custom hooks
  const sceneManager = useSceneManager(videoResult);
  const videoProcessor = useVideoProcessor();
  const scenesToDisplay = sceneManager.customScenes.length > 0 ? sceneManager.customScenes : videoResult;

  const getAllImages = () => {
    const uploadedImages = [...images]; // Images from the Images tab
    const sceneImages = scenesToDisplay
      .filter((scene) => scene.imageUrl && scene.imageUrl.trim() !== '')
      .map((scene, index) => ({
        id: `scene-${scene.id}`,
        url: scene.imageUrl,
        name: `Scene ${index + 1} Image`,
        isFromScene: true,
        sceneId: scene.id,
      }));

    // Combine and deduplicate images
    const allImages = [...uploadedImages];

    // Add scene images that aren't already in the uploaded images
    sceneImages.forEach((sceneImg) => {
      const existsInUploaded = uploadedImages.some((img) => img.url === sceneImg.url);
      if (!existsInUploaded) {
        allImages.push(sceneImg);
      }
    });

    return allImages;
  };
  // CC toggle effect
  useEffect(() => {
    if (videoRef.current && videoProcessor.subtitleUrl && !subtitleSettings.embedInVideo) {
      const video = videoRef.current;
      const tracks = video.textTracks;
      if (tracks.length > 0) {
        tracks[0].mode = ccEnabled ? 'showing' : 'hidden';
      }
    }
  }, [ccEnabled, videoProcessor.subtitleUrl, subtitleSettings.embedInVideo]);

  const toggleCC = () => {
    setCcEnabled(!ccEnabled);
  };

  const reviewAudioVoice = async () => {
    const scenesToUse = sceneManager.customScenes.length > 0 ? sceneManager.customScenes : videoResult;
    if (!scenesToUse || scenesToUse.length === 0) {
      console.error('No script available to review.');
      return;
    }

    setIsReviewingAudio(true);
    try {
      const sampleText = scenesToUse[0].summary;
      console.log('Reviewing audio voice with sample text:', sampleText.substring(0, 50) + '...');
      await speakText(sampleText, selectedGoogleVoice, speechRate);
      console.log('Audio review completed');
    } catch (error) {
      console.error('Error reviewing audio voice:', error);
    } finally {
      setIsReviewingAudio(false);
    }
  };

  const handleCreateVideoWithAudios = () => {
    videoProcessor.createVideoWithIndividualAudios(
      sceneManager.customScenes,
      videoResult,
      images,
      selectedGoogleVoice,
      speechRate,
      subtitleSettings,
      generateAudioBlob,
      setActiveTab
    );
  };

  console.log('Video URL:', videoProcessor.videoUrl);
  console.log(videoProcessor);

  const renderTabContent = () => {
    const allImages = getAllImages();
    switch (activeTab) {
      case 'reference':
        return (
          <div className="space-y-5 pr-2 mt-2">
            <div className="flex-1 flex flex-col space-y-5 overflow-y-auto space-x-2">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-4">
                  Enter text, describe the content you want to generate
                </label>
                <textarea
                  className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-40 resize-none"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="e.g., Create a video about the wonders of the ancient world..."
                />
              </div>
              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select a Visual Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableStyles.map((style) => (
                    <label
                      key={style}
                      htmlFor={style}
                      className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-700/50"
                    >
                      <input
                        type="radio"
                        id={style}
                        name="style-selection"
                        checked={selectedStyle === style}
                        onChange={() => setSelectedStyle(style)}
                        className="hidden peer"
                      />
                      <span
                        className="w-4 h-4 rounded-full border-2 border-slate-500 mr-3
                               flex-shrink-0
                               peer-checked:border-sky-500 peer-checked:bg-sky-500"
                      ></span>
                      <span className="text-sm font-semibold text-slate-200 ">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* --- Audience Selector (as Radio Buttons) --- */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Target Audience</label>
                <div className="grid grid-cols-3 gap-2">
                  {audiences.map((audience) => (
                    <label
                      key={audience}
                      htmlFor={audience}
                      className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-slate-700/50"
                    >
                      <input
                        type="radio"
                        id={audience}
                        name="audience-selection"
                        value={audience}
                        checked={selectedAudience === audience}
                        onChange={() => setSelectedAudience(audience)}
                        className="hidden peer"
                      />
                      <span
                        className="w-4 h-4 rounded-full border-2 border-slate-500 mr-3
                               flex-shrink-0
                               peer-checked:border-sky-500 peer-checked:bg-sky-500"
                      ></span>
                      <span className="text-sm font-semibold text-slate-300 peer-checked:text-white">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'customScenes':
        return (
          <CustomScenesTab
            customScenes={sceneManager.customScenes}
            isAddingScene={sceneManager.isAddingScene}
            newScene={sceneManager.newScene}
            setNewScene={sceneManager.setNewScene}
            addNewScene={sceneManager.addNewScene}
            saveNewScene={sceneManager.saveNewScene}
            cancelNewScene={sceneManager.cancelNewScene}
            uploadingImage={sceneManager.uploadingImage}
            generatingImage={sceneManager.generatingImage}
            uploadImageForScene={sceneManager.uploadImageForScene}
            generateImageForScene={sceneManager.generateImageForScene}
          />
        );

      case 'images':
        return (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            <VoiceSettings
              googleVoices={googleVoices}
              selectedGoogleVoice={selectedGoogleVoice}
              setSelectedGoogleVoice={setSelectedGoogleVoice}
              speechRate={speechRate}
              setSpeechRate={setSpeechRate}
              getLanguageDisplayName={getLanguageDisplayName}
            />

            <SubtitleSettings subtitleSettings={subtitleSettings} setSubtitleSettings={setSubtitleSettings} />

            {/* Enhanced Image Storyboard Grid */}
            <div className="space-y-4">
              {/* Show scene images if any exist */}
              {scenesToDisplay.some((scene) => scene.imageUrl) && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                    <FaImages size={14} />
                    Scene Images ({scenesToDisplay.filter((s) => s.imageUrl).length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {scenesToDisplay
                      .filter((scene) => scene.imageUrl)
                      .map((scene, index) => (
                        <div key={`scene-${scene.id}`} className="relative group aspect-square">
                          <img
                            src={scene.imageUrl}
                            alt={`Scene ${index + 1}`}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover rounded-lg shadow-md border-2 border-sky-500/50"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 text-white text-xs">
                              Scene {scenesToDisplay.findIndex((s) => s.id === scene.id) + 1}
                            </div>
                            <div className="absolute top-2 right-2">
                              <button
                                onClick={() => {
                                  // Remove image from scene
                                  const sceneIndex = scenesToDisplay.findIndex((s) => s.id === scene.id);
                                  if (sceneIndex !== -1) {
                                    sceneManager.saveEditedScene(sceneIndex, {
                                      ...scene,
                                      imageUrl: '',
                                    });
                                  }
                                }}
                                className="p-1 bg-red-600/80 hover:bg-red-500 rounded-full text-white"
                                title="Remove from scene"
                              >
                                <FaMinusCircle size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Show uploaded images */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <FaPlusCircle size={14} />
                  Uploaded Images ({images.length})
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative group aspect-square">
                      <img
                        src={img.url}
                        alt={img.name}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover rounded-lg shadow-md border-2 border-slate-700/50"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex justify-between items-start p-1.5">
                        {/* Assign to Scene Button */}
                        {scenesToDisplay.length > 0 && (
                          <select
                            onChange={(e) => {
                              const sceneIndex = parseInt(e.target.value);
                              if (sceneIndex >= 0) {
                                const targetScene = scenesToDisplay[sceneIndex];
                                sceneManager.saveEditedScene(sceneIndex, {
                                  ...targetScene,
                                  imageUrl: img.url,
                                });
                              }
                              e.target.value = ''; // Reset selection
                            }}
                            className="text-xs bg-blue-600 text-white rounded px-1 py-0.5"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Assign to Scene
                            </option>
                            {scenesToDisplay.map((scene, index) => (
                              <option key={scene.id} value={index}>
                                Scene {index + 1}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectImage(img.id);
                          }}
                          className="p-2 bg-slate-600/80 hover:bg-slate-500 rounded-full text-white transform transition-transform"
                          title={`Delete ${img.name}`}
                        >
                          <FaMinusCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* "Add Image" Card */}
                  <button
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg text-slate-500 hover:text-sky-400 hover:border-sky-500 transition-colors"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    <FaPlusCircle size={24} />
                    <span className="mt-2 text-xs font-semibold">Add Image</span>
                    <input type="file" id="imageUpload" className="hidden" multiple />
                  </button>
                </div>
              </div>

              {/* Image Assignment Instructions */}
              {scenesToDisplay.length > 0 && images.length > 0 && (
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-600/30">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Tip:</strong> You can assign uploaded images to specific scenes using the dropdown that appears when you
                    hover over an image. Scene images will be used for video creation instead of uploaded images.
                  </p>
                </div>
              )}
            </div>

            {/* Review Audio Voice Button - keep as is */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
              <button
                onClick={reviewAudioVoice}
                disabled={!videoResult || videoResult.length === 0 || isReviewingAudio || isAudioPlaying}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isReviewingAudio || isAudioPlaying ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Playing Audio Preview...</span>
                  </>
                ) : (
                  <>
                    <FaVolumeUp size={16} />
                    <span>Review Audio Voice</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center">Preview how the selected voice sounds with your content</p>
            </div>
          </div>
        );

      case 'videoReview':
        return (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            {videoProcessor.videoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-slate-200">Generated Video</h3>
                  {/*subtitleSettings.enabled && (
                                        <button
                                            onClick={toggleCC}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${ccEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`}
                                            title={ccEnabled ? 'Hide Subtitles' : 'Show Subtitles'}
                                        >
                                            <FaClosedCaptioning size={16} />
                                            <span className="text-sm font-medium">CC {ccEnabled ? 'ON' : 'OFF'}</span>
                                        </button>
                                    )*/}
                </div>

                <div className="bg-slate-700 p-4 rounded-lg relative">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full rounded-lg border border-slate-600"
                    src={videoProcessor.videoUrl}
                    onLoadedData={() => {
                      if (videoRef.current && videoProcessor.subtitleUrl && !subtitleSettings.embedInVideo) {
                        const tracks = videoRef.current.textTracks;
                        if (tracks.length > 0) {
                          tracks[0].mode = ccEnabled ? 'showing' : 'hidden';
                        }
                      }
                    }}
                  >
                    {!subtitleSettings.embedInVideo && videoProcessor.subtitleUrl && (
                      <track kind="subtitles" src={videoProcessor.subtitleUrl} srcLang="en" label="English" default={ccEnabled} />
                    )}
                    Your browser does not support the video tag.
                  </video>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href={videoProcessor.videoUrl}
                    download="generated-video.mp4"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaFileDownload className="mr-2" /> Download Video
                  </a>
                  {videoProcessor.subtitleUrl && (
                    <a
                      href={videoProcessor.subtitleUrl}
                      download="subtitles.srt"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <FaClosedCaptioning className="mr-2" /> Download SRT
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 bg-transparent !border !border-gray-600 text-white hover:!border-gray-500"
                    onClick={() => {
                      navigate(`/video-manager`);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Video
                  </Button>
                </div>

                <button
                  onClick={() => {
                    videoProcessor.setVideoUrl(null);
                    videoProcessor.setSubtitleUrl(null);
                    setActiveTab('reference');
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create New Video
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <FaVideo size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Video Generated</h3>
                  <p>Create a video from the Images tab or Custom Scenes to review it here.</p>
                </div>
              </div>
            )}

            {videoProcessor.isProcessingVideo && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Processing Video: {videoProcessor.progress}%</label>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${videoProcessor.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full p-1 md:p-6 lg:p-8">
      {/* Left Panel: Settings */}
      <div className="w-full md:w-1/2 bg-slate-800 p-1 flex flex-col space-y-4 rounded-l-xl">
        <div className="flex-none mb-2">
          <button
            onClick={handleBackToGenerator}
            className="text-sky-400 hover:text-sky-300 font-semibold text-xs px-2 py-1 rounded-md bg-slate-800"
          >
            <FaArrowLeft className="inline mr-1" /> Back to Suggestions
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl mb-7 overflow-x-auto">
          {['reference', 'customScenes', 'images', 'videoReview'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-medium text-white rounded px-2 py-1 transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {tab === 'reference' && 'Reference to Video'}
              {tab === 'customScenes' && 'Custom Scenes'}
              {tab === 'images' && 'Image to Video'}
              {tab === 'videoReview' && 'Video Review'}
            </button>
          ))}
        </div>

        {renderTabContent()}

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {activeTab !== 'images' && activeTab !== 'videoReview' && activeTab !== 'customScenes' && (
          <div className="flex-none pt-4">
            <button
              onClick={handleCreateVideo}
              disabled={isLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-wait"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        )}
      </div>

      {/* Right Panel - Results */}
      <div className="hidden md:flex w-1/2 bg-gray-900 items-center justify-center p-5 text-center rounded-r-xl">
        {isLoading ? (
          <div className="text-slate-400">Generating...</div>
        ) : scenesToDisplay.length > 0 ? (
          <div className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 space-y-2">
            <div className="flex justify-between items-center sticky top-0 p-2 bg-gray-900 pb-1">
              <h3 className="text-xl font-bold text-sky-400">
                {sceneManager.customScenes.length > 0 ? 'Custom Scenes' : 'Generated Script'}
              </h3>
            </div>

            {scenesToDisplay.map((scene, index) => (
              <SceneEditor
                key={scene.id || index}
                scene={scene}
                index={index}
                isEditing={activeTab === 'customScenes' && sceneManager.editingSceneIndex === index}
                onSave={sceneManager.saveEditedScene}
                onCancel={() => sceneManager.editScene(null)}
                onEdit={sceneManager.editScene}
                onDelete={sceneManager.deleteScene}
                onMove={sceneManager.moveScene}
                totalScenes={scenesToDisplay.length}
                subtitleSettings={subtitleSettings}
                uploadingImage={sceneManager.uploadingImage}
                generatingImage={sceneManager.generatingImage}
                onImageUpload={sceneManager.uploadImageForScene}
                onImageGenerate={sceneManager.generateImageForScene}
              />
            ))}

            <div className="sticky bottom-0 p-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 mt-6 flex justify-end">
              <button
                onClick={() => {
                  if (activeTab === 'reference') {
                    handleGenerateAndUpload();
                    setActiveTab('images');
                  } else if (activeTab === 'images' || activeTab === 'customScenes') {
                    handleCreateVideoWithAudios();
                  } else if (activeTab === 'videoReview') {
                    setActiveTab('reference');
                  }
                }}
                disabled={
                  isLoading ||
                  isAudioPlaying ||
                  videoProcessor.isProcessingVideo ||
                  isReviewingAudio ||
                  (activeTab === 'customScenes' && sceneManager.customScenes.length === 0)
                }
                className="px-3 py-1 text-xs font-semibold text-white rounded-lg transition-all transform hover:scale-105 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-1 shadow"
              >
                {isLoading || videoProcessor.isProcessingVideo || isReviewingAudio ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>
                      {videoProcessor.isProcessingVideo ? 'Creating Video...' : isReviewingAudio ? 'Reviewing Audio...' : 'Processing...'}
                    </span>
                  </>
                ) : (
                  <>
                    {activeTab === 'reference' ? (
                      <>
                        <FaImages size={14} />
                        <span>Generate Images</span>
                      </>
                    ) : activeTab === 'images' || activeTab === 'customScenes' ? (
                      <>
                        <FaVideo size={14} />
                        <span>Create Video{subtitleSettings.enabled ? ' with Subtitles' : ''}</span>
                      </>
                    ) : activeTab === 'videoReview' ? (
                      <>
                        <FaVideo size={14} />
                        <span>Create New Video</span>
                      </>
                    ) : (
                      <>
                        <FaCogs size={14} />
                        <span>Generate Video</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-slate-500">
            <h3 className="text-xl font-semibold text-slate-300">Start creating content for Video now !!</h3>
            <p className="text-slate-400 mt-2">Your generated content will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;
