import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { Mic, Download, Heart, Volume2, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function VoiceGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [generatedAudios, setGeneratedAudios] = useState([
    {
      id: 1,
      text: 'Hello, this is a sample generated voice.',
      audioUrl: '',
      isPlaying: false,
      duration: '0:30',
      remainingTime: '0:30',
      volume: 1,
      showVolume: false,
      progress: 0,
      liked: false,
    },
    {
      id: 2,
      text: 'Another example of AI generated speech.',
      audioUrl: '',
      isPlaying: false,
      duration: '0:45',
      remainingTime: '0:45',
      volume: 1,
      showVolume: false,
      progress: 0,
      liked: false,
    },
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(true);

  const audioRefs = useRef({});

  // Voice ID mapping with languages - loaded from environment variables
  const voiceIdMapping = {
    Chinese: [import.meta.env.VITE_CHINESE_VOICE_1, import.meta.env.VITE_CHINESE_VOICE_2].filter(Boolean), // Remove undefined values
    English: [import.meta.env.VITE_ENGLISH_VOICE_1, import.meta.env.VITE_ENGLISH_VOICE_2].filter(Boolean),
    French: [import.meta.env.VITE_FRENCH_VOICE_1, import.meta.env.VITE_FRENCH_VOICE_2].filter(Boolean),
    German: [import.meta.env.VITE_GERMAN_VOICE_1, import.meta.env.VITE_GERMAN_VOICE_2].filter(Boolean),
    Japanese: [import.meta.env.VITE_JAPANESE_VOICE_1].filter(Boolean),
    Vietnamese: [import.meta.env.VITE_VIETNAMESE_VOICE_1, import.meta.env.VITE_VIETNAMESE_VOICE_2].filter(Boolean),
    Russian: [import.meta.env.VITE_RUSSIAN_VOICE_1, import.meta.env.VITE_RUSSIAN_VOICE_2].filter(Boolean),
  };

  const API_KEY = import.meta.env.VITE_API_KEY;

  // Function to get random voice ID for selected language
  const getCurrentVoiceId = () => {
    const voiceIds = voiceIdMapping[selectedLanguage];
    if (!voiceIds || voiceIds.length === 0) {
      console.warn(`No voice IDs found for language: ${selectedLanguage}`);
      return import.meta.env.VITE_VOICE_ID; // Fallback to default voice ID
    }

    // If only one voice ID, return it directly
    if (voiceIds.length === 1) {
      return voiceIds[0];
    }

    // If multiple voice IDs, pick random one
    const randomIndex = Math.floor(Math.random() * voiceIds.length);
    return voiceIds[randomIndex];
  };

  const formatDuration = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    try {
      const qualityMap = {
        High: 'eleven_multilingual_v2',
        Medium: 'eleven_turbo_v2_5',
        Low: 'eleven_flash_v2_5',
      };
      const modelId = qualityMap[selectedQuality];
      const currentVoiceId = getCurrentVoiceId();

      console.log(`Using voice ID: ${currentVoiceId} for language: ${selectedLanguage}`);

      const response = await axios({
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${currentVoiceId}`,
        headers: {
          accept: 'audio/mpeg',
          'content-type': 'application/json',
          'xi-api-key': API_KEY,
        },
        data: {
          text: textInput,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      const tempAudio = new Audio(audioUrl);
      const duration = await new Promise((resolve) => {
        tempAudio.addEventListener('loadedmetadata', () => {
          resolve(tempAudio.duration);
        });
      });

      const newAudio = {
        id: Date.now(),
        text: textInput,
        audioUrl,
        isPlaying: false,
        duration: formatDuration(duration),
        remainingTime: formatDuration(duration),
        volume: 1,
        showVolume: false,
        progress: 0,
        liked: false,
        language: selectedLanguage, // Store the language used
        voiceId: currentVoiceId, // Store the voice ID used
      };

      setGeneratedAudios([newAudio, ...generatedAudios]);
      setTextInput('');

      toast.success(`Audio generated successfully using ${selectedLanguage} voice!`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'dark',
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please check your API key and try again.', {
        position: 'top-right',
        autoClose: 4000,
        theme: 'dark',
      });
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);

    // Show which voice will be used (for debugging/info)
    const voiceIds = voiceIdMapping[newLanguage];
    if (voiceIds && voiceIds.length > 1) {
      toast.info(`${newLanguage} selected. Will randomly choose from ${voiceIds.length} available voices.`, {
        position: 'top-right',
        autoClose: 2000,
        theme: 'dark',
      });
    }
  };

  const togglePlayPause = (id) => {
    Object.entries(audioRefs.current).forEach(([audioId, audioEl]) => {
      if (Number(audioId) !== id && audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    });

    const audioEl = audioRefs.current[id];
    if (audioEl) {
      audioEl.playbackRate = playSpeed;
      if (audioEl.paused) {
        audioEl.play();
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }
  };

  const toggleShowVolume = (id) => {
    setGeneratedAudios((prev) =>
      prev.map((audio) => (audio.id === id ? { ...audio, showVolume: !audio.showVolume } : { ...audio, showVolume: false }))
    );
  };

  const handleVolumeChange = (id, value) => {
    setGeneratedAudios((prev) => prev.map((audio) => (audio.id === id ? { ...audio, volume: value } : audio)));
    const audioEl = audioRefs.current[id];
    if (audioEl) {
      audioEl.volume = value;
    }
  };

  const toggleLike = (id) => {
    setGeneratedAudios((prev) =>
      prev.map((audio) => {
        if (audio.id === id) {
          const newLikedState = !audio.liked;
          toast.success(newLikedState ? 'Added to favorites!' : 'Removed from favorites!', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          });
          return { ...audio, liked: newLikedState };
        }
        return audio;
      })
    );
  };

  const handleTimeUpdate = (id) => {
    const audioEl = audioRefs.current[id];
    if (audioEl) {
      const progress = (audioEl.currentTime / audioEl.duration) * 100;
      const remainingTime = audioEl.duration - audioEl.currentTime;
      setGeneratedAudios((prev) =>
        prev.map((audio) =>
          audio.id === id
            ? {
                ...audio,
                progress: isNaN(progress) ? 0 : progress,
                remainingTime: formatDuration(remainingTime),
              }
            : audio
        )
      );
    }
  };

  const handleAudioPlay = (id) => {
    const audioEl = audioRefs.current[id];
    if (audioEl) {
      if (!isNaN(audioEl.duration) && audioEl.duration > 0) {
        setGeneratedAudios((prev) =>
          prev.map((audio) =>
            audio.id === id
              ? {
                  ...audio,
                  isPlaying: true,
                  duration: formatDuration(audioEl.duration),
                  remainingTime: formatDuration(audioEl.duration),
                }
              : { ...audio, isPlaying: false, progress: 0 }
          )
        );
      } else {
        audioEl.addEventListener(
          'loadedmetadata',
          () => {
            setGeneratedAudios((prev) =>
              prev.map((audio) =>
                audio.id === id
                  ? {
                      ...audio,
                      isPlaying: true,
                      duration: formatDuration(audioEl.duration),
                      remainingTime: formatDuration(audioEl.duration),
                    }
                  : { ...audio, isPlaying: false, progress: 0 }
              )
            );
          },
          { once: true }
        );
      }
    }
  };

  const handleAudioPause = (id) => {
    setGeneratedAudios((prev) =>
      prev.map((audio) => (audio.id === id ? { ...audio, isPlaying: false, remainingTime: audio.duration } : audio))
    );
  };

  const handleAudioEnded = (id) => {
    setGeneratedAudios((prev) =>
      prev.map((audio) => (audio.id === id ? { ...audio, isPlaying: false, progress: 0, remainingTime: audio.duration } : audio))
    );
  };

  const handleDownload = async (audioUrl, id) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();

      if ('showSaveFilePicker' in window) {
        const options = {
          suggestedName: `generated_audio_${id}.mp3`,
          types: [
            {
              description: 'Audio Files',
              accept: { 'audio/mpeg': ['.mp3'] },
            },
          ],
        };
        const fileHandle = await window.showSaveFilePicker(options);
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast.success('Audio saved successfully!', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'dark',
        });
      } else {
        saveAs(blob, `generated_audio_${id}.mp3`);
        toast.success('Audio downloaded successfully!', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'dark',
        });
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to save audio.', {
        position: 'top-right',
        autoClose: 2000,
        theme: 'dark',
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-800 p-4 md:p-6">
          <section className="text-center text-white mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Voice Generator</h1>
            <p className="text-lg text-gray-300 mb-6">Transform your text into natural-sounding speech with advanced AI technology</p>
          </section>

          {/* Expandable Controls */}
          <section className="mb-8">
            <button
              className="flex items-center mb-4 text-purple-400 hover:text-purple-300 transition-colors"
              onClick={() => setShowControls((prev) => !prev)}
              type="button"
            >
              <span className="font-semibold mr-2">Voice Settings</span>
              {showControls ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showControls && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-700 rounded-lg p-6 shadow-xl mb-4">
                <div>
                  <h6 className="text-white font-semibold mb-3">Language</h6>
                  <select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Chinese">Chinese</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Russian">Russian</option>
                  </select>
                  <p className="text-gray-400 text-sm mt-2">Voice will be automatically selected for the chosen language.</p>
                </div>
                <div>
                  <h6 className="text-white font-semibold mb-3">Quality & Details</h6>
                  <select
                    value={selectedQuality}
                    onChange={(e) => setSelectedQuality(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <p className="text-gray-400 text-sm mt-2">Higher quality will result in better audio, but will take longer.</p>
                </div>
                <div>
                  <h6 className="text-white font-semibold mb-3">Play Speed</h6>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={playSpeed}
                      onChange={(e) => setPlaySpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>0.5x</span>
                      <span className="text-white font-semibold">{playSpeed}x</span>
                      <span>2.0x</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">Adjust the playback speed of generated audio.</p>
                </div>
              </div>
            )}
          </section>

          {/* Voice Generation Form */}
          <section className="mb-8">
            <div className="bg-gray-700 rounded-lg p-6 shadow-xl">
              <form onSubmit={handleGenerate}>
                <div className="mb-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your text here to generate speech..."
                    className="w-full h-32 p-4 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center transition-colors"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Generate Voice ({selectedLanguage})
                  </button>
                  <select
                    className="bg-gray-800 text-white border border-gray-600 rounded-lg py-3 px-4 focus:border-purple-500 focus:outline-none"
                    value="MP3"
                    readOnly
                  >
                    <option value="MP3">MP3</option>
                    <option value="WAV">WAV</option>
                  </select>
                </div>
              </form>
            </div>
          </section>

          {/* Generated Audio List */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-6">Generated Audio</h2>
            <div className="space-y-6">
              {generatedAudios.map((audio) => (
                <div key={audio.id} className="bg-gray-700 rounded-lg p-6 shadow-xl">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-300 text-sm">Generated from:</p>
                      {audio.language && <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">{audio.language}</span>}
                    </div>
                    <p className="text-white bg-gray-800 p-3 rounded border-l-4 border-purple-500">{audio.text}</p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => togglePlayPause(audio.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                        >
                          {audio.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </button>
                        <span className="text-white text-sm">
                          {audio.isPlaying ? `-${audio.remainingTime}` : audio.duration} / {audio.duration}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => toggleShowVolume(audio.id)}
                          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                          type="button"
                        >
                          <Volume2 className="h-5 w-5 text-gray-400" />
                        </button>
                        {audio.showVolume && (
                          <div className="absolute right-0 mt-2 w-32 bg-gray-700 p-2 rounded shadow-lg z-10">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audio.volume}
                              onChange={(e) => handleVolumeChange(audio.id, parseFloat(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${audio.progress}%` }}></div>
                    </div>
                    <audio
                      ref={(el) => (audioRefs.current[audio.id] = el)}
                      src={audio.audioUrl}
                      onTimeUpdate={() => handleTimeUpdate(audio.id)}
                      onPlay={() => handleAudioPlay(audio.id)}
                      onPause={() => handleAudioPause(audio.id)}
                      onEnded={() => handleAudioEnded(audio.id)}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button
                        className={`bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition-colors ${
                          audio.liked ? 'text-red-500' : ''
                        }`}
                        onClick={() => toggleLike(audio.id)}
                        type="button"
                      >
                        <Heart className="h-4 w-4" fill={audio.liked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDownload(audio.audioUrl, audio.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center transition-colors"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <ToastContainer />
          <div className="h-16"></div>
        </main>
      </div>
    </div>
  );
}

export default VoiceGeneratorPage;
