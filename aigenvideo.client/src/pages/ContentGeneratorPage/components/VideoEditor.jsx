import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
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
    FaPlay,
    FaClosedCaptioning,
} from 'react-icons/fa';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import {
    createVideoFromImagesAndIndividualAudios,
    createVideoFromImagesAndIndividualAudiosWithSubtitles,
} from '@/utils/videoCreationUtils';
import { saveFullVideoData } from '@/apis/saveFullVideoData';
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
    images,
    handleRejectImage,
    videoResult,
    isAudioPlaying,
    handleGenerateAndUpload,
    isLoading,
    error,
    getLanguageDisplayName,
    generateAudioBlob,
}) => {
    const [isProcessingVideo, setIsProcessingVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [subtitleUrl, setSubtitleUrl] = useState(null);
    const [isReviewingAudio, setIsReviewingAudio] = useState(false);
    const [ccEnabled, setCcEnabled] = useState(true);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [seeking, setSeeking] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);

    const playerRef = useRef(null);
    const [subtitleSettings, setSubtitleSettings] = useState({
        enabled: true,
        embedInVideo: false, // Set to false to use external subtitles with React Player
        fontSize: 20,
        fontColor: '#ffffff',
        backgroundColor: '#000000',
        position: 'bottom',
    });

    const { ffmpeg, loaded: ffmpegLoaded, error: ffmpegError, progress } = useFFmpeg();
    const subtitleUrlRef = useRef(null);

    // Update subtitle URL ref when subtitleUrl changes
    useEffect(() => {
        subtitleUrlRef.current = subtitleUrl;
    }, [subtitleUrl]);

    const toggleCC = () => {
        setCcEnabled(!ccEnabled);
    };

    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        if (playerRef.current) {
            playerRef.current.seekTo(parseFloat(e.target.value));
        }
    };

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    };

    const handleDuration = (duration) => {
        setDuration(duration);
    };

    const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds();
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
        }
        return `${mm}:${ss.toString().padStart(2, '0')}`;
    };

    const reviewAudioVoice = async () => {
        if (!videoResult || videoResult.length === 0) {
            console.error('No script available to review.');
            return;
        }

        setIsReviewingAudio(true);
        try {
            const sampleText = videoResult[0].summary;
            console.log('Reviewing audio voice with sample text:', sampleText.substring(0, 50) + '...');
            await speakText(sampleText, selectedGoogleVoice, speechRate);
            console.log('Audio review completed');
        } catch (error) {
            console.error('Error reviewing audio voice:', error);
        } finally {
            setIsReviewingAudio(false);
        }
    };

    const uploadToCloudinary = async (blob, folder, resourceType = 'auto') => {
        const CLOUD_NAME = 'dj88dmrqe';
        const UPLOAD_PRESET = 'GenVideoProject';

        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder);
        formData.append('resource_type', resourceType);

        const endpoint = resourceType === 'video' ? 'video' : 'raw';
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, {
            method: 'POST',
            body: formData,
        }).then((res) => res.json());

        if (!response.secure_url) {
            throw new Error(response.error?.message || `Cloudinary upload failed for ${folder}`);
        }
        return response.secure_url;
    };

    const createVideoWithIndividualAudios = async () => {
        if (!ffmpegLoaded || !videoResult || images.length === 0) {
            return console.error('Cannot create video: FFmpeg not loaded, no scenes, or no images');
        }
        const minCount = Math.min(images.length, videoResult.length);
        const usedImages = images.slice(0, minCount);
        const usedScenes = videoResult.slice(0, minCount);

        setIsProcessingVideo(true);

        try {
            const audioUrls = [];
            for (let i = 0; i < usedScenes.length; i++) {
                const audioUrl = await generateAudioBlob(usedScenes[i].summary, selectedGoogleVoice, speechRate);
                audioUrls.push(audioUrl);
            }

            const fullScript = videoResult.map((scene) => scene.summary).join(' ');
            const fullAudio = await generateAudio({ text: fullScript, selectedGoogleVoice, speechRate }).then((response) => response.data);
            const finalAudioUrl = await uploadToCloudinary(fullAudio, 'generated-audio', 'video');

            let result;
            if (subtitleSettings.enabled) {
                const subtitleOptions = {
                    embedSubtitles: subtitleSettings.embedInVideo,
                    subtitleStyle: {
                        fontSize: subtitleSettings.fontSize,
                        fontColor: subtitleSettings.fontColor,
                        backgroundColor: subtitleSettings.backgroundColor,
                        position: subtitleSettings.position,
                    },
                };
                result = await createVideoFromImagesAndIndividualAudiosWithSubtitles(ffmpeg, usedImages, audioUrls, usedScenes, subtitleOptions);
            } else {
                const videoURL = await createVideoFromImagesAndIndividualAudios(ffmpeg, usedImages, audioUrls);
                result = { videoUrl: videoURL, subtitleUrl: null };
            }

            setVideoUrl(result.videoUrl);
            setSubtitleUrl(result.subtitleUrl);
            setActiveTab('videoReview');

            console.log('Uploading final assets to Cloudinary...');
            const videoBlob = await fetch(result.videoUrl).then((res) => res.blob());
            const videoUploadPromise = uploadToCloudinary(videoBlob, 'videos', 'video');

            const srtUploadPromise = result.subtitleUrl
                ? fetch(result.subtitleUrl)
                    .then((res) => res.blob())
                    .then((srtBlob) => uploadToCloudinary(srtBlob, 'subtitles', 'raw'))
                : Promise.resolve(null);

            const [finalVideoUrl, finalSrtUrl] = await Promise.all([videoUploadPromise, srtUploadPromise]);
            subtitleUrlRef.current = finalSrtUrl;
            console.log('...Final assets uploaded successfully.', finalSrtUrl);

            console.log('Saving all data to database...');
            const videoDataPayload = {
                ImageListUrl: usedImages.map((img) => img.url),
                VideoUrl: finalVideoUrl,
                Srts: finalSrtUrl || '',
                Captions: usedScenes.map((s) => s.summary).join('\n\n'),
                AudioFileUrl: finalAudioUrl,
                CreatedBy: 'current_user_id',
            };
            await saveFullVideoData(videoDataPayload);

            audioUrls.forEach((url) => URL.revokeObjectURL(url));
            URL.revokeObjectURL(result.videoUrl);
            if (result.subtitleUrl) {
                URL.revokeObjectURL(result.subtitleUrl);
            }
        } catch (videoError) {
            console.error('Error creating video:', videoError);
        } finally {
            setIsProcessingVideo(false);
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
                <div className="flex items-center gap-3 bg-slate-800 rounded-xl mb-7 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('reference')}
                        className={`text-xs font-medium text-white rounded px-2 py-1 transition-all whitespace-nowrap ${activeTab === 'reference' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                    >
                        Reference to Video
                    </button>
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`text-xs font-medium text-white rounded px-2 py-1 transition-all whitespace-nowrap ${activeTab === 'images' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                    >
                        Image to Video
                    </button>
                    <button
                        onClick={() => setActiveTab('videoReview')}
                        className={`text-xs font-medium text-white rounded px-2 py-1 transition-all whitespace-nowrap ${activeTab === 'videoReview' ? 'bg-slate-700' : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                    >
                        Video Review
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
                        {/* Voice Selection for Video Creation */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Voice Settings for Video</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-2">Select Voice</label>
                                    <select
                                        className="w-full p-2 bg-slate-700 text-slate-200 rounded-md border border-slate-600 text-sm"
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
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-2">Speech Rate: {speechRate}x</label>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2"
                                        step="0.1"
                                        value={speechRate}
                                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subtitle Settings */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Subtitle Settings</h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enableSubtitles"
                                        checked={subtitleSettings.enabled}
                                        onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    <label htmlFor="enableSubtitles" className="text-xs font-medium text-slate-300">
                                        Enable Subtitles
                                    </label>
                                </div>

                                {subtitleSettings.enabled && (
                                    <>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="embedSubtitles"
                                                checked={subtitleSettings.embedInVideo}
                                                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, embedInVideo: e.target.checked }))}
                                                className="mr-2"
                                            />
                                            <label htmlFor="embedSubtitles" className="text-xs font-medium text-slate-300">
                                                Embed in Video (Recommended for download)
                                            </label>
                                        </div>

                                        <div className="bg-blue-900/20 p-2 rounded border border-blue-600/30">
                                            <p className="text-xs text-blue-200">
                                                <strong>Note:</strong> External subtitles (not embedded) work best with React Player for interactive features like CC toggle.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">Font Size: {subtitleSettings.fontSize}px</label>
                                            <input
                                                type="range"
                                                min="12"
                                                max="48"
                                                value={subtitleSettings.fontSize}
                                                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                                className="w-full"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-300 mb-1">Position</label>
                                            <select
                                                value={subtitleSettings.position}
                                                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, position: e.target.value }))}
                                                className="w-full p-1 bg-slate-700 text-slate-200 rounded-md border border-slate-600 text-xs"
                                            >
                                                <option value="bottom">Bottom</option>
                                                <option value="top">Top</option>
                                                <option value="center">Center</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-300 mb-1">Text Color</label>
                                                <input
                                                    type="color"
                                                    value={subtitleSettings.fontColor}
                                                    onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontColor: e.target.value }))}
                                                    className="w-full h-8 rounded border border-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-300 mb-1">Background</label>
                                                <input
                                                    type="color"
                                                    value={subtitleSettings.backgroundColor}
                                                    onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                                                    className="w-full h-8 rounded border border-slate-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Preview subtitle styling */}
                                        <div className="mt-3 p-2 bg-slate-900 rounded border">
                                            <p className="text-xs text-slate-400 mb-1">Subtitle Preview:</p>
                                            <div
                                                className="text-center py-2 px-4 rounded"
                                                style={{
                                                    fontSize: `${Math.max(10, subtitleSettings.fontSize * 0.6)}px`,
                                                    color: subtitleSettings.fontColor,
                                                    backgroundColor: `${subtitleSettings.backgroundColor}80`,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                Sample subtitle text
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Image Storyboard Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {images.map((img) => (
                                <div key={img.id} className="relative group aspect-square">
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-cover rounded-lg shadow-md border-2 border-slate-700/50"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex justify-end items-start p-1.5">
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

                        {/* Review Audio Voice Button */}
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
                )}

                {activeTab === 'videoReview' && (
                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
                        {/* Video Review Content */}
                        {videoUrl ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-slate-200">Generated Video</h3>

                                    {/* CC Toggle Button */}
                                    {subtitleSettings.enabled && !subtitleSettings.embedInVideo && subtitleUrlRef.current && (
                                        <button
                                            onClick={toggleCC}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${ccEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                                                }`}
                                            title={ccEnabled ? 'Hide Subtitles' : 'Show Subtitles'}
                                        >
                                            <FaClosedCaptioning size={16} />
                                            <span className="text-sm font-medium">CC {ccEnabled ? 'ON' : 'OFF'}</span>
                                        </button>
                                    )}
                                </div>

                                {/* React Player */}
                                <div className="bg-slate-700 p-4 rounded-lg relative">
                                    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                        <ReactPlayer
                                            ref={playerRef}
                                            url={videoUrl}
                                            className="absolute top-0 left-0"
                                            width="100%"
                                            height="100%"
                                            playing={playing}
                                            volume={volume}
                                            playbackRate={playbackRate}
                                            onProgress={handleProgress}
                                            onDuration={handleDuration}
                                            controls={false}
                                            config={{
                                                file: {
                                                    attributes: {
                                                        crossOrigin: 'anonymous',
                                                    },
                                                    tracks: subtitleSettings.enabled && !subtitleSettings.embedInVideo && subtitleUrlRef.current && ccEnabled ? [
                                                        {
                                                            kind: 'subtitles',
                                                            src: subtitleUrlRef.current,
                                                            srcLang: 'en',
                                                            default: true,
                                                            label: 'English',
                                                        },
                                                    ] : [],
                                                },
                                            }}
                                        />
                                    </div>

                                    {/* Custom Controls */}
                                    <div className="mt-4 space-y-3">
                                        {/* Progress Bar */}
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-slate-300 w-12">{formatTime(duration * played)}</span>
                                            <input
                                                type="range"
                                                min={0}
                                                max={0.999999}
                                                step="any"
                                                value={played}
                                                onMouseDown={handleSeekMouseDown}
                                                onChange={handleSeekChange}
                                                onMouseUp={handleSeekMouseUp}
                                                className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-xs text-slate-300 w-12">{formatTime(duration)}</span>
                                        </div>

                                        {/* Control Buttons */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={handlePlayPause}
                                                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors"
                                                >
                                                    {playing ? <FaPause size={16} /> : <FaPlay size={16} />}
                                                </button>

                                                <div className="flex items-center space-x-2">
                                                    <FaVolumeUp className="text-slate-300" size={14} />
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step="any"
                                                        value={volume}
                                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                        className="w-20 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>

                                                <select
                                                    value={playbackRate}
                                                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                                                    className="bg-slate-600 text-slate-200 rounded px-2 py-1 text-xs"
                                                >
                                                    <option value={0.5}>0.5x</option>
                                                    <option value={0.75}>0.75x</option>
                                                    <option value={1}>1x</option>
                                                    <option value={1.25}>1.25x</option>
                                                    <option value={1.5}>1.5x</option>
                                                    <option value={2}>2x</option>
                                                </select>
                                            </div>

                                            {/* CC Toggle in controls */}
                                            {subtitleSettings.enabled && !subtitleSettings.embedInVideo && subtitleUrlRef.current && (
                                                <button
                                                    onClick={toggleCC}
                                                    className={`p-2 rounded transition-colors ${ccEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                                                        }`}
                                                    title={ccEnabled ? 'Hide Subtitles' : 'Show Subtitles'}
                                                >
                                                    <FaClosedCaptioning size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* CC Status Indicator for Embedded Subtitles */}
                                    {subtitleSettings.enabled && subtitleSettings.embedInVideo && (
                                        <div className="absolute top-6 right-6 bg-black/70 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                                            <FaClosedCaptioning size={12} />
                                            <span>Subtitles Embedded</span>
                                        </div>
                                    )}

                                    {/* CC Status Indicator for External Subtitles */}
                                    {subtitleSettings.enabled && !subtitleSettings.embedInVideo && subtitleUrlRef.current && (
                                        <div
                                            className={`absolute top-6 right-6 px-2 py-1 rounded text-xs flex items-center gap-1 transition-all ${ccEnabled ? 'bg-blue-600/90 text-white' : 'bg-gray-600/90 text-gray-300'
                                                }`}
                                        >
                                            <FaClosedCaptioning size={12} />
                                            <span>CC {ccEnabled ? 'ON' : 'OFF'}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Subtitle Information */}
                                {subtitleSettings.enabled && (
                                    <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-600/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaClosedCaptioning className="text-blue-400" size={14} />
                                            <h4 className="text-sm font-semibold text-blue-300">Subtitle Information</h4>
                                        </div>
                                        <div className="text-xs text-blue-200 space-y-1">
                                            <p>Type: {subtitleSettings.embedInVideo ? 'Embedded in video' : 'External SRT file'}</p>
                                            <p>Font Size: {subtitleSettings.fontSize}px</p>
                                            <p>Position: {subtitleSettings.position}</p>
                                            {!subtitleSettings.embedInVideo && <p>Interactive: Use CC button to toggle subtitles</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Video Actions */}
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <a
                                        href={videoUrl}
                                        download="generated-video.mp4"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <FaFileDownload className="mr-2" /> Download Video
                                    </a>

                                    {subtitleUrlRef.current && (
                                        <a
                                            href={subtitleUrlRef.current}
                                            download="subtitles.srt"
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            <FaClosedCaptioning className="mr-2" /> Download SRT
                                        </a>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'Generated Video',
                                                    url: videoUrl,
                                                });
                                            }
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <FaVideo className="mr-2" /> Share Video
                                    </button>
                                </div>

                                {/* Video Information */}
                                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Video Details</h4>
                                    <div className="text-xs text-slate-400 space-y-1">
                                        <p>Images: {images.length}</p>
                                        <p>Scenes: {videoResult.length}</p>
                                        <p>Voice: {selectedGoogleVoice}</p>
                                        <p>Speech Rate: {speechRate}x</p>
                                        <p>
                                            Subtitles: {subtitleSettings.enabled ? (subtitleSettings.embedInVideo ? 'Embedded' : 'External SRT') : 'Disabled'}
                                        </p>
                                        {subtitleSettings.enabled && (
                                            <>
                                                <p>Font Size: {subtitleSettings.fontSize}px</p>
                                                <p>Position: {subtitleSettings.position}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Regenerate Video */}
                                <button
                                    onClick={() => {
                                        setVideoUrl(null);
                                        setSubtitleUrl(null);
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
                                    <p>Create a video from the Images tab to review it here.</p>
                                </div>
                            </div>
                        )}

                        {/* Show FFmpeg progress if processing */}
                        {isProcessingVideo && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">Processing Video: {progress}%</label>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {ffmpegError && (
                            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-600/30">
                                FFmpeg error: {ffmpegError.message}
                            </div>
                        )}
                    </div>
                )}

                {error && <div className="text-red-400 text-sm">{error}</div>}

                {activeTab !== 'images' && activeTab !== 'videoReview' && (
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

                                {/* Narration (Summary) - This will be used for subtitles */}
                                <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-400">
                                    <div className="flex items-center gap-3 text-purple-400 mb-2">
                                        <h5 className="text-sm font-semibold">Content (Audio & Subtitle Text)</h5>
                                        {subtitleSettings.enabled && (
                                            <FaClosedCaptioning className="text-purple-400" size={12} title="Will be used as subtitles" />
                                        )}
                                    </div>
                                    <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">{scene.summary}</p>
                                </div>
                            </div>
                        ))}

                        {/* Sequence/action button with dynamic text and behavior */}
                        <div className="sticky bottom-0 p-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    if (activeTab === 'reference') {
                                        handleGenerateAndUpload();
                                        setActiveTab('images');
                                    } else if (activeTab === 'images') {
                                        createVideoWithIndividualAudios();
                                    } else if (activeTab === 'videoReview') {
                                        setActiveTab('reference');
                                    }
                                }}
                                disabled={isLoading || isAudioPlaying || isProcessingVideo || isReviewingAudio}
                                className="px-3 py-1 text-xs font-semibold text-white rounded-lg transition-all transform hover:scale-105 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-1 shadow"
                            >
                                {isLoading || isProcessingVideo || isReviewingAudio ? (
                                    <>
                                        <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
                                        <span>{isProcessingVideo ? 'Creating Video...' : isReviewingAudio ? 'Reviewing Audio...' : 'Processing...'}</span>
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