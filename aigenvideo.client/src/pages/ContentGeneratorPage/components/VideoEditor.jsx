import React, { useState } from 'react';
import {
  FaTrash,
  FaArrowLeft,
  FaVolumeUp,
  FaFileDownload,
  FaPlusCircle,
  FaPlus,
  FaPause,
  FaMinusCircle,
  FaQuoteRight,
  FaImages,
  FaVideo,
  FaCogs,
  FaMicrophone,
  FaFileAudio,
  FaEdit,
} from 'react-icons/fa';
import { generateAudio } from '@/apis/audioService';

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
  stopSpeaking,
  downloadSRT,
  downloadGoogleTTS,
  downloadFullScript,
  images,
  handleRejectImage,
  videoResult,
  isAudioPlaying,
  handleGenerateAndUpload,
  isLoading,
  error,
  getLanguageDisplayName,
}) => {
  const [scriptContent, setScriptContent] = useState('');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);

  const combineScriptContent = async () => {
    if (!videoResult || videoResult.length === 0) {
      console.error('No script available to process.');
      return;
    }
    console.log('Starting: Combine script, generate audio, and upload to Cloudinary...');
    try {
      // --- 1. Combine the script text from the scenes ---
      const fullScript = videoResult.map((scene) => scene.summary).join(' ');
      console.log('Script combined.');
      // --- 2. Generate the audio Blob from your backend ---
      console.log('Generating audio blob...');
      const response = await generateAudio({ text: fullScript, selectedGoogleVoice, speechRate });
      const audioBlob = response.data;
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Audio generation from backend failed.');
      }
      console.log('...Audio blob received.');
      // --- 3. Upload that Audio Blob to Cloudinary ---
      console.log('Uploading audio to Cloudinary...');
      const CLOUD_NAME = 'dj88dmrqe';
      const UPLOAD_PRESET = 'GenVideoProject';
      const FOLDER_NAME = 'generated-audio';

      const formData = new FormData();
      formData.append('file', audioBlob, 'full-script-audio.mp3');
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', FOLDER_NAME);
      formData.append('resource_type', 'video');

      const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: 'POST',
        body: formData,
      }).then((res) => res.json());

      if (!cloudinaryResponse.secure_url) {
        throw new Error(cloudinaryResponse.error?.message || 'Cloudinary upload failed.');
      }
      console.log('...Audio uploaded successfully. URL:', cloudinaryResponse.secure_url);

      // --- 4. Update all necessary states and switch tabs ---
      setUploadedAudioUrl(cloudinaryResponse.secure_url); // Save the permanent URL
      setScriptContent(fullScript); // Set the script for the next tab's textarea
      setActiveTab('scriptToAudio'); // Switch tabs only after everything is successful
    } catch (err) {
      console.error('Error during script and audio processing:', err);
      console.error('Failed to process script and audio: ' + err.message);
    }
  };

  return (
    <div className="flex h-full p-1 md:p-6 lg:p-8">
      {/* Left Panel: Settings */}
      <div className="w-full md:w-1/2 bg-slate-800 p-1 flex flex-col space-y-4 rounded-l-xl">
        {/* Back to Suggestions button at the top */}
        <div className="flex-none mb-2">
          <button
            onClick={handleBackToGenerator}
            className="text-sky-400 hover:text-sky-300 font-semibold text-xs px-2 py-1 rounded-md bg-slate-800"
          >
            <FaArrowLeft className="inline mr-1" /> Back to Suggestions
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-5 bg-slate-800 rounded-xl mb-7">
          <button
            onClick={() => setActiveTab('reference')}
            className={`text-xs font-medium text-white rounded px-2 py-1 transition-all ${
              activeTab === 'reference' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-800'
            }`}
          >
            Reference to Video
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`text-xs font-medium text-white rounded px-2 py-1 transition-all ${
              activeTab === 'images' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-800'
            }`}
          >
            Image to Video
          </button>
          <button
            onClick={() => setActiveTab('scriptToAudio')}
            className={`text-xs font-medium text-white rounded px-2 py-1 transition-all ${
              activeTab === 'scriptToAudio' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-800'
            }`}
          >
            Script to Audio
          </button>
        </div>

        {activeTab === 'reference' && (
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
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            {/* Image Storyboard Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover rounded-lg shadow-md border-2 border-slate-700/50"
                  />
                  {/* Overlay with Delete Button - Appears on Hover */}
                  <div
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity 
                    flex justify-end items-start p-1.5"
                  >
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
                className="aspect-square flex flex-col items-center justify-center 
                           border-2 border-dashed border-slate-600 rounded-lg 
                           text-slate-500 hover:text-sky-400 hover:border-sky-500 transition-colors"
                onClick={() => document.getElementById('imageUpload').click()}
              >
                <FaPlusCircle size={24} />
                <span className="mt-2 text-xs font-semibold">Add Image</span>
                <input type="file" id="imageUpload" className="hidden" multiple />
              </button>
            </div>

            {/* Decorative Form */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Storyboard Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="w-1/4 text-xs font-medium text-slate-400">Style</label>
                  <select
                    disabled
                    className="w-3/4 p-1.5 bg-slate-700/50 text-slate-400 rounded-md border border-slate-600 text-xs cursor-not-allowed"
                  >
                    <option>Cinematic</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="w-1/4 text-xs font-medium text-slate-400">Pacing</label>
                  <select
                    disabled
                    className="w-3/4 p-1.5 bg-slate-700/50 text-slate-400 rounded-md border border-slate-600 text-xs cursor-not-allowed"
                  >
                    <option>Dynamic</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="w-1/4 text-xs font-medium text-slate-400">Resolution</label>
                  <select
                    disabled
                    className="w-3/4 p-1.5 bg-slate-700/50 text-slate-400 rounded-md border border-slate-600 text-xs cursor-not-allowed"
                  >
                    <option>1080p</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scriptToAudio' && (
          <div className="space-y-5 pr-2 mt-2">
            <div className="flex-1 flex flex-col space-y-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Enter your script to convert to audio</label>
                <textarea
                  className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-48 resize-none"
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Enter your script content here..."
                />
              </div>

              {/* Voice settings for script to audio */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Voice Settings</label>
                <select
                  className="w-4/5 p-1 bg-slate-700 text-slate-200 rounded-md border border-slate-600 mb-2 text-sm"
                  onChange={(e) => setSelectedGoogleVoice(e.target.value)}
                  value={selectedGoogleVoice}
                >
                  {googleVoices.map((voice) => {
                    const [langCode, region, _type, variant] = voice.name.split('-');
                    const gender = voice.gender === 'MALE' ? '(M)' : '(F)';
                    const displayName = `${langCode.toUpperCase()}-${region} ${variant} ${gender}`;
                    return (
                      <option key={voice.name} value={voice.name}>
                        {displayName} - {getLanguageDisplayName(voice.languageCode)}
                      </option>
                    );
                  })}
                </select>
                <div className="flex items-center">
                  <label className="block text-xs font-medium text-slate-300 mr-2">Speed:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-3/4"
                    style={{ height: '5px' }}
                  />
                  <span className="ml-2 text-white">{speechRate}x</span>
                </div>
              </div>

              {/* Audio generation controls - Enhanced for Script to Audio tab */}
              <div className="flex flex-wrap justify-center gap-6 mt-0">
                <div className="tooltip-container relative">
                  <button
                    onClick={() => speakText(scriptContent, selectedGoogleVoice, speechRate)}
                    disabled={!scriptContent || isLoading}
                    className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-full disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    title="Preview Audio"
                  >
                    <FaVolumeUp size={16} />
                    <span className="tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      {isAudioPlaying ? 'Playing...' : 'Preview Audio'}
                    </span>
                  </button>
                </div>

                {isAudioPlaying && (
                  <div className="tooltip-container relative">
                    <button
                      onClick={stopSpeaking}
                      className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                      title="Stop Audio"
                    >
                      <FaPause size={16} />
                      <span className="tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        Stop Audio
                      </span>
                    </button>
                  </div>
                )}

                <div className="tooltip-container relative">
                  <button
                    onClick={() => downloadGoogleTTS(scriptContent, 'script-audio', selectedGoogleVoice, speechRate)}
                    disabled={!scriptContent || isLoading}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    title="Download MP3"
                  >
                    <FaFileAudio size={16} />
                    <span className="tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      Download MP3
                    </span>
                  </button>
                </div>

                <div className="tooltip-container relative">
                  <button
                    onClick={() => downloadSRT(scriptContent, 'script-subtitles', selectedGoogleVoice, speechRate)}
                    disabled={!scriptContent || isLoading}
                    className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    title="Download SRT"
                  >
                    <FaFileDownload size={16} />
                    <span className="tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      Download SRT
                    </span>
                  </button>
                </div>

                <div className="tooltip-container relative">
                  <button
                    onClick={() => downloadFullScript(scriptContent, 'full-script')}
                    disabled={!scriptContent || isLoading}
                    className="p-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    title="Download Script"
                  >
                    <FaQuoteRight size={16} />
                    <span className="tooltip absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      Download Script
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {activeTab !== 'scriptToAudio' && (
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
        ) : videoResult.length > 0 ? (
          <div className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 space-y-2">
            <div className="flex justify-between items-center sticky top-0 p-2 bg-gray-900 pb-1">
              <h3 className="text-xl font-bold text-sky-400">Generated Script</h3>

              {/* Add this button to convert to full script */}
              <button
                onClick={combineScriptContent}
                className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md"
                title="Use as Script for Audio"
              >
                <FaEdit size={12} />
                <span>Use as Script</span>
              </button>
            </div>

            {/* Results loop */}
            {videoResult.map((scene, index) => (
              <div key={scene.id || index} className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
                <h4 className="text-md font-bold text-white mb-3">Scene {index + 1}</h4>

                {/* Image Prompt (Title) */}
                <div className="mb-4 bg-slate-900/50 p-4 rounded-lg border-l-4 border-sky-400">
                  <div className="flex items-center gap-3 text-sky-400 mb-2">
                    <h5 className="text-sm font-semibold">Image Prompt</h5>
                  </div>
                  <p className="text-slate-100 font-mono text-sm leading-relaxed">{scene.title}</p>
                </div>

                {/* Narration (Summary) */}
                <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center gap-3 text-purple-400 mb-2">
                    <h5 className="text-sm font-semibold">Content</h5>
                  </div>
                  <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">{scene.summary}</p>

                  {/* Audio and Subtitle controls */}
                  {activeTab === 'scriptToAudioo' && (
                    <div className="flex mt-4 justify-end gap-3">
                      {isAudioPlaying ? (
                        <button
                          onClick={stopSpeaking}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-full"
                          title="Stop Speaking"
                        >
                          <FaPause />
                        </button>
                      ) : (
                        <button
                          onClick={() => speakText(scene.summary)}
                          className="p-0.5 bg-green-600 hover:bg-green-700 text-white rounded-full"
                          title="Listen"
                        >
                          <FaVolumeUp />
                        </button>
                      )}
                      <button
                        onClick={() => downloadGoogleTTS(scene.summary, `scene-${index + 1}`, selectedGoogleVoice, speechRate)}
                        className="p-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                        title="Download SRT"
                      >
                        <FaFileAudio />
                      </button>
                      <button
                        onClick={() => downloadSRT(scene.summary, `scene-${index + 1}`)}
                        className="p-0.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full"
                        title="Download SRT"
                      >
                        <FaFileDownload />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Sequence/action button with dynamic text and behavior */}
            <div className="sticky bottom-0 p-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 mt-6 flex justify-end">
              <button
                onClick={() => {
                  if (activeTab === 'reference') {
                    // In reference tab, go to images tab
                    handleGenerateAndUpload();
                    setActiveTab('images');
                  } else if (activeTab === 'images') {
                    // In images tab, go to script to audio tab

                    combineScriptContent();
                    setActiveTab('scriptToAudio');
                  } else if (activeTab === 'scriptToAudio') {
                    // Default behavior in other tabs

                    handleGenerateAndUpload();
                  } else {
                  }
                }}
                disabled={isLoading || isAudioPlaying}
                className="px-3 py-1 text-xs font-semibold text-white rounded-lg transition-all transform hover:scale-105
            bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700
            disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none
            flex items-center justify-center gap-1 shadow"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {activeTab === 'reference' ? (
                      <>
                        <FaImages size={14} />
                        <span>Generate Images</span>
                      </>
                    ) : activeTab === 'images' ? (
                      <>
                        <FaFileAudio size={14} />
                        <span>Generate Audio</span>
                      </>
                    ) : activeTab === 'scriptToAudio' ? (
                      <>
                        <FaFileAudio size={14} />
                        <span>Make Video</span>
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
