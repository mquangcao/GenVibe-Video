import React from 'react';
import { FaTrash, FaArrowLeft, FaVolumeUp, FaFileDownload, FaPlusCircle, FaPlus, FaPause, FaMinusCircle, FaQuoteRight, FaImages, FaVideo, FaCogs } from 'react-icons/fa';

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
    images,
    handleRejectImage,
    videoResult,
    isAudioPlaying,
    handleGenVideoSequence,
    isLoading,
    error,
    getLanguageDisplayName
}) => {
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
                        className={`text-xs font-medium text-white rounded px-2 py-1 transition-all ${activeTab === 'reference' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-800'
                            }`}
                    >
                        Reference to Video
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`text-xs font-medium text-white rounded px-2 py-1 transition-all ${activeTab === 'images' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-800'
                            }`}
                    >
                        Image to Video
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

                            {/* Voice options */}
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

                {error && <div className="text-red-400 text-sm">{error}</div>}

                <div className="flex-none pt-4">
                    <button
                        onClick={handleCreateVideo}
                        disabled={isLoading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-wait"
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>

            {/* Right Panel - Results */}
            <div className="hidden md:flex w-2/3 bg-gray-900 items-center justify-center p-5 text-center rounded-r-xl">
                {isLoading ? (
                    <div className="text-slate-400">Generating...</div>
                ) : videoResult.length > 0 ? (
                    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 space-y-2">
                        <h3 className="text-xl font-bold text-sky-400 sticky top-0 bg-gray-900 pb-1">Generated Script</h3>

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
                                            onClick={() => downloadSRT(scene.summary, `scene-${index + 1}`)}
                                            className="p-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                                            title="Download SRT"
                                        >
                                            <FaFileDownload />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Sequence button */}
                        <div className="sticky bottom-0 bg-slate-800 rounded-lg shadow-lg border border-slate-700 mt-6 flex justify-end">
                            <button
                                onClick={handleGenVideoSequence}
                                disabled={isLoading || isAudioPlaying || activeTab === 'images'}
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
                                        <FaCogs size={14} />
                                        <span>Reference</span>
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