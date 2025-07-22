import React, { useState, useRef } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { Mic, Download, Heart, Volume2, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useVoiceSelection } from '@/pages/ContentGeneratorPage/hooks/useVoiceSelection';
import { generateAudio } from '@/apis/audioService';

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
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRefs = useRef({});

  // Use Google Cloud Text-to-Speech hooks
  const { googleVoices, selectedGoogleVoice, setSelectedGoogleVoice, speechRate, setSpeechRate } = useVoiceSelection();

  // Language mapping for Google Cloud voices
  const getLanguageFromVoice = (voiceName) => {
    const languageMap = {
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'ja-JP': 'Japanese',
      'es-ES': 'Spanish',
      'vi-VN': 'Vietnamese',
      'th-TH': 'Thai',
      'cmn-CN': 'Chinese (Mandarin)',
      'cmn-TW': 'Chinese (Traditional)',
      'yue-HK': 'Chinese (Cantonese)',
    };

    const languageCode = voiceName.split('-').slice(0, 2).join('-');
    return languageMap[languageCode] || languageCode;
  };

  // Get available languages from voices
  const getAvailableLanguages = () => {
    const languages = new Set();
    googleVoices.forEach((voice) => {
      const language = getLanguageFromVoice(voice.name);
      languages.add(language);
    });
    return Array.from(languages).sort();
  };

  // Get voices for selected language
  const getVoicesForLanguage = (selectedLanguage) => {
    return googleVoices.filter((voice) => {
      const voiceLanguage = getLanguageFromVoice(voice.name);
      return voiceLanguage === selectedLanguage;
    });
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

    setIsGenerating(true);
    try {
      console.log(`Generating audio with voice: ${selectedGoogleVoice}, rate: ${speechRate}`);

      // Use Google Cloud Text-to-Speech API
      const response = await generateAudio({
        text: textInput,
        selectedGoogleVoice: selectedGoogleVoice,
        speechRate: speechRate,
      });

      const audioBlob = response.data;
      const audioUrl = URL.createObjectURL(audioBlob);

      // Get audio duration
      const tempAudio = new Audio(audioUrl);
      const duration = await new Promise((resolve) => {
        tempAudio.addEventListener('loadedmetadata', () => {
          resolve(tempAudio.duration);
        });
        tempAudio.addEventListener('error', () => {
          resolve(0); // Fallback if metadata can't be loaded
        });
      });

      const selectedVoice = googleVoices.find((voice) => voice.name === selectedGoogleVoice);
      const language = getLanguageFromVoice(selectedGoogleVoice);

      const newAudio = {
        id: Date.now(),
        text: textInput,
        audioUrl,
        audioBlob, // Store the blob for download
        isPlaying: false,
        duration: formatDuration(duration),
        remainingTime: formatDuration(duration),
        volume: 1,
        showVolume: false,
        progress: 0,
        liked: false,
        language: language,
        voiceName: selectedGoogleVoice,
        voiceGender: selectedVoice?.gender || 'UNKNOWN',
        speechRate: speechRate,
      };

      setGeneratedAudios([newAudio, ...generatedAudios]);
      setTextInput('');

      toast.success(`Audio generated successfully using ${language} voice (${selectedVoice?.gender})!`, {
        position: 'top-right',
        autoClose: 3000,
        theme: 'light',
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Failed to generate audio. Please try again.', {
        position: 'top-right',
        autoClose: 4000,
        theme: 'light',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceChange = (e) => {
    const newVoice = e.target.value;
    setSelectedGoogleVoice(newVoice);

    const selectedVoiceObj = googleVoices.find((voice) => voice.name === newVoice);
    const language = getLanguageFromVoice(newVoice);

    toast.info(`${language} voice selected (${selectedVoiceObj?.gender})`, {
      position: 'top-right',
      autoClose: 2000,
      theme: 'light',
    });
  };

  const togglePlayPause = (id) => {
    // Stop all other audios
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
            theme: 'light',
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

  const handleDownload = async (audioUrl, id, audioBlob) => {
    try {
      let blob;

      if (audioBlob) {
        // Use the stored blob if available
        blob = audioBlob;
      } else {
        // Fallback to fetching from URL
        const response = await fetch(audioUrl);
        blob = await response.blob();
      }

      if ('showSaveFilePicker' in window) {
        const options = {
          suggestedName: `google_tts_audio_${id}.mp3`,
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
          theme: 'light',
        });
      } else {
        saveAs(blob, `google_tts_audio_${id}.mp3`);
        toast.success('Audio downloaded successfully!', {
          position: 'top-right',
          autoClose: 2000,
          theme: 'light',
        });
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('Failed to save audio.', {
        position: 'top-right',
        autoClose: 2000,
        theme: 'light',
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <section className="text-center text-gray-900 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Voice Generator</h1>
            <p className="text-lg text-gray-600 mb-6">Transform your text into natural-sounding speech with Google Cloud Text-to-Speech</p>
          </section>

          {/* Expandable Controls */}
          <section className="mb-8">
            <button
              className="flex items-center mb-4 text-purple-600 hover:text-purple-700 transition-colors"
              onClick={() => setShowControls((prev) => !prev)}
              type="button"
            >
              <span className="font-semibold mr-2">Voice Settings</span>
              {showControls ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showControls && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg p-6 shadow-xl mb-4 border border-gray-200">
                <div>
                  <h6 className="text-gray-900 font-semibold mb-3">Voice Selection</h6>
                  <select
                    value={selectedGoogleVoice}
                    onChange={handleVoiceChange}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 rounded-lg py-2 px-3 focus:border-purple-500 focus:outline-none"
                  >
                    {getAvailableLanguages().map((language) => (
                      <optgroup key={language} label={language}>
                        {getVoicesForLanguage(language).map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.gender})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm mt-2">
                    Current: {getLanguageFromVoice(selectedGoogleVoice)} -{' '}
                    {googleVoices.find((v) => v.name === selectedGoogleVoice)?.gender}
                  </p>
                </div>
                <div>
                  <h6 className="text-gray-900 font-semibold mb-3">Speech Rate</h6>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.25"
                      max="4.0"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0.25x</span>
                      <span className="text-gray-900 font-semibold">{speechRate}x</span>
                      <span>4.0x</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Adjust the speech rate for generation.</p>
                </div>
                <div>
                  <h6 className="text-gray-900 font-semibold mb-3">Playback Speed</h6>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={playSpeed}
                      onChange={(e) => setPlaySpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>0.5x</span>
                      <span className="text-gray-900 font-semibold">{playSpeed}x</span>
                      <span>2.0x</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Adjust the playback speed of generated audio.</p>
                </div>
              </div>
            )}
          </section>

          {/* Voice Generation Form */}
          <section className="mb-8">
            <div className="bg-white rounded-lg p-6 shadow-xl border border-gray-200">
              <form onSubmit={handleGenerate}>
                <div className="mb-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your text here to generate speech..."
                    className="w-full h-32 p-4 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                    required
                    disabled={isGenerating}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <button
                    type="submit"
                    disabled={isGenerating || !textInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg inline-flex items-center transition-colors"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    {isGenerating ? 'Generating...' : `Generate Voice (${getLanguageFromVoice(selectedGoogleVoice)})`}
                  </button>
                  <div className="text-gray-500 text-sm">Powered by Google Cloud Text-to-Speech</div>
                </div>
              </form>
            </div>
          </section>

          {/* Generated Audio List */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Generated Audio</h2>
            <div className="space-y-6">
              {generatedAudios.map((audio) => (
                <div key={audio.id} className="bg-white rounded-lg p-6 shadow-xl border border-gray-200">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-gray-600 text-sm">Generated from:</p>
                      <div className="flex gap-2">
                        {audio.language && <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">{audio.language}</span>}
                        {audio.voiceGender && <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">{audio.voiceGender}</span>}
                        {audio.speechRate && audio.speechRate !== 1 && (
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">{audio.speechRate}x speed</span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-900 bg-gray-100 p-3 rounded border-l-4 border-purple-500">{audio.text}</p>
                    {audio.voiceName && <p className="text-gray-500 text-xs mt-1">Voice: {audio.voiceName}</p>}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => togglePlayPause(audio.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                        >
                          {audio.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </button>
                        <span className="text-gray-900 text-sm">
                          {audio.isPlaying ? `-${audio.remainingTime}` : audio.duration} / {audio.duration}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => toggleShowVolume(audio.id)}
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                          type="button"
                        >
                          <Volume2 className="h-5 w-5 text-gray-400" />
                        </button>
                        {audio.showVolume && (
                          <div className="absolute right-0 mt-2 w-32 bg-white p-2 rounded shadow-lg z-10 border border-gray-200">
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
                    <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
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
                        className={`bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-colors ${
                          audio.liked ? 'text-red-500' : ''
                        }`}
                        onClick={() => toggleLike(audio.id)}
                        type="button"
                      >
                        <Heart className="h-4 w-4" fill={audio.liked ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDownload(audio.audioUrl, audio.id, audio.audioBlob)}
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
