import axios from 'axios';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { generateContent, imageService } from '@/apis';
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
} from 'react-icons/fa';
import AI1 from '@/assets/AI1.png';
import AI2 from '@/assets/AI2.png';
import AI3 from '@/assets/AI3.png';
import AI4 from '@/assets/AI4.png';
const ContentGeneratorPage = () => {
  const [googleVoices, setGoogleVoices] = useState([]);
  const [selectedGoogleVoice, setSelectedGoogleVoice] = useState('en-US-Standard-B');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  const getLanguageDisplayName = (langCode) => {
    const languageMap = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
      ar: 'Arabic',
      hi: 'Hindi',
      nl: 'Dutch',
      pl: 'Polish',
      tr: 'Turkish',
      sv: 'Swedish',
      no: 'Norwegian',
      da: 'Danish',
      fi: 'Finnish',
      th: 'Thai',
      vi: 'Vietnamese',
      id: 'Indonesian',
      cs: 'Czech',
      hu: 'Hungarian',
      el: 'Greek',
      he: 'Hebrew',
    };

    const countryMap = {
      US: 'United States',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      IN: 'India',
      ES: 'Spain',
      MX: 'Mexico',
      FR: 'France',
      DE: 'Germany',
      IT: 'Italy',
      BR: 'Brazil',
      PT: 'Portugal',
      RU: 'Russia',
      JP: 'Japan',
      KR: 'Korea',
      CN: 'China',
      TW: 'Taiwan',
      HK: 'Hong Kong',
      AR: 'Argentina',
      SA: 'Saudi Arabia',
      NL: 'Netherlands',
      BE: 'Belgium',
      CH: 'Switzerland',
      AT: 'Austria',
      SE: 'Sweden',
      NO: 'Norway',
      DK: 'Denmark',
      FI: 'Finland',
      PL: 'Poland',
      TR: 'Turkey',
    };

    try {
      const [langPart, countryPart] = langCode.split('-');
      const language = languageMap[langPart] || langPart;
      const country = countryPart ? countryMap[countryPart.toUpperCase()] || countryPart : '';

      return country ? `${language} - ${country}` : language;
    } catch (e) {
      console.error('Error parsing language code:', e);
      return langCode;
    }
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [topic, setTopic] = useState('');
  const [selectedContext, setSelectedContext] = useState('YouTube');
  const [generatedSuggestions, setGeneratedSuggestions] = useState([]);
  const [images, setImages] = useState([]);

  // States for view navigation and video creation
  const [currentView, setCurrentView] = useState('generator');
  const [activeTab, setActiveTab] = useState('reference');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState([]);
  // General UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Text-to-speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  const [showAudioTip, _setShowAudioTip] = useState(false);

  const availableContexts = ['YouTube', 'Wikipedia', 'Groq'];

  const handleRejectImage = (idToReject, e) => {
    e.stopPropagation();
    setImages((prevImages) => prevImages.filter((img) => img.id !== idToReject));
    alert(`Rejected image ${idToReject}`);
  };

  useEffect(() => {
    const audio = new Audio();
    audio.onended = () => {
      setIsAudioPlaying(false);
      setIsSpeaking(false);
    };
    audio.onerror = () => {
      setIsAudioPlaying(false);
      setIsSpeaking(false);
      setError('Error playing audio');
    };
    setAudioElement(audio);

    fetchGoogleVoices();
  }, []);

  const fetchGoogleVoices = async () => {
    const voices = [
      // English (US)
      { name: 'en-US-Standard-A', gender: 'MALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-B', gender: 'MALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-C', gender: 'FEMALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-D', gender: 'MALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-E', gender: 'FEMALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-F', gender: 'FEMALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-G', gender: 'FEMALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-H', gender: 'FEMALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-I', gender: 'MALE', languageCode: 'en-US' },
      { name: 'en-US-Standard-J', gender: 'MALE', languageCode: 'en-US' },

      // English (UK)
      { name: 'en-GB-Standard-A', gender: 'FEMALE', languageCode: 'en-GB' },
      { name: 'en-GB-Standard-B', gender: 'MALE', languageCode: 'en-GB' },
      { name: 'en-GB-Standard-C', gender: 'FEMALE', languageCode: 'en-GB' },
      { name: 'en-GB-Standard-D', gender: 'MALE', languageCode: 'en-GB' },

      // French
      { name: 'fr-FR-Standard-A', gender: 'FEMALE', languageCode: 'fr-FR' },
      { name: 'fr-FR-Standard-B', gender: 'MALE', languageCode: 'fr-FR' },

      // German
      { name: 'de-DE-Standard-A', gender: 'FEMALE', languageCode: 'de-DE' },
      { name: 'de-DE-Standard-B', gender: 'MALE', languageCode: 'de-DE' },

      // Italian
      { name: 'it-IT-Standard-A', gender: 'FEMALE', languageCode: 'it-IT' },

      // Japanese
      { name: 'ja-JP-Standard-A', gender: 'FEMALE', languageCode: 'ja-JP' },

      // Spanish
      { name: 'es-ES-Standard-A', gender: 'FEMALE', languageCode: 'es-ES' },

      // Vietnamese
      { name: 'vi-VN-Standard-A', gender: 'FEMALE', languageCode: 'vi-VN' },
      { name: 'vi-VN-Standard-B', gender: 'MALE', languageCode: 'vi-VN' },
      { name: 'vi-VN-Standard-C', gender: 'FEMALE', languageCode: 'vi-VN' },
      { name: 'vi-VN-Standard-D', gender: 'MALE', languageCode: 'vi-VN' },

      // Thai
      { name: 'th-TH-Standard-A', gender: 'FEMALE', languageCode: 'th-TH' },

      // Chinese (Mandarin, Simplified)
      { name: 'cmn-CN-Standard-A', gender: 'FEMALE', languageCode: 'cmn-CN' },

      // Chinese (Traditional, Taiwan)
      { name: 'cmn-TW-Standard-A', gender: 'FEMALE', languageCode: 'cmn-TW' },

      // Chinese (Cantonese, Hong Kong)
      { name: 'yue-HK-Standard-A', gender: 'FEMALE', languageCode: 'yue-HK' },
    ];

    setGoogleVoices(voices);
    setSelectedGoogleVoice(voices[0].name);
  };

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedSuggestions([]);
    try {
      const response = await generateContent({ topic: topic, context: selectedContext });
      if (response.data && response.data.success) {
        setGeneratedSuggestions(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to generate suggestions');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFromTopic = () => {
    if (!topic.trim()) {
      setError('Please enter a topic before creating.');
      return;
    }
    setVideoPrompt(topic); // Use the current topic as the prompt
    setCurrentView('videoEditor'); // Navigate to the editor
  };

  const handleCreateVideo = async () => {
    if (!videoPrompt.trim()) {
      setError("The prompt can't be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);

    if (audioElement && isAudioPlaying) {
      audioElement.pause();
      audioElement.src = '';
      setIsAudioPlaying(false);
    }

    setVideoResult([]);

    try {
      const response = await generateContent({ topic: videoPrompt, context: 'Gemini' });
      if (response.data && response.data.success) {
        setVideoResult(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to create video content');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggestion = (suggestionTitle) => {
    setVideoPrompt(suggestionTitle);
    setCurrentView('videoEditor');
    setError(null); // Clear any old errors
    setVideoResult(''); // Clear old results when starting a new edit
  };

  const handleBackToGenerator = () => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setCurrentView('generator');
  };

  const speakText = async (text) => {
    try {
      if (audioElement && isAudioPlaying) {
        audioElement.pause();
        audioElement.src = '';
        setIsAudioPlaying(false);
      }

      setIsLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const languageCode = selectedGoogleVoice.split('-').slice(0, 2).join('-');

      const response = await axios({
        method: 'post',
        url: '/api/texttospeech/synthesize',
        data: {
          text: text,
          voiceName: selectedGoogleVoice,
          languageCode: languageCode,
          speechRate: speechRate,
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(response.data);

      if (audioElement) {
        audioElement.src = url;
        setIsSpeaking(true);

        await audioElement.play().catch((err) => {
          console.error('Error playing audio:', err);
          setError('Error playing audio');
          setIsSpeaking(false);
          setIsAudioPlaying(false);
        });

        setIsAudioPlaying(true);
      }
    } catch (err) {
      console.error('Error with text-to-speech:', err);
      setError('Failed to synthesize speech: ' + (err.response?.data?.message || err.message));
      setIsSpeaking(false);
      setIsAudioPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (audioElement && isAudioPlaying) {
      audioElement.pause();
      audioElement.src = '';
      setIsSpeaking(false);
      setIsAudioPlaying(false);
    }
  };

  const generateSRTWithAudioDuration = async (text, audioBlob) => {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio();
        const url = URL.createObjectURL(audioBlob);

        audio.onloadedmetadata = () => {
          const audioDuration = audio.duration;
          URL.revokeObjectURL(url);

          const srt = generateSRTWithSentenceTiming(text, audioDuration);
          resolve(srt);
        };

        audio.onerror = (err) => {
          console.error('Error loading audio metadata:', err);
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load audio metadata'));
        };

        audio.src = url;
      } catch (err) {
        reject(err);
      }
    });
  };

  const generateSRTWithSentenceTiming = (text, totalDuration) => {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length > 0);

    if (sentences.length === 0) return '';

    const totalChars = text.length;
    const totalWords = text.trim().split(/\s+/).length;

    let srtContent = '';
    let index = 1;
    let currentStartTime = 0;

    sentences.forEach((sentence) => {
      const sentenceChars = sentence.length;
      const sentenceWords = sentence.trim().split(/\s+/).length;

      const charRatio = sentenceChars / totalChars;
      const wordRatio = sentenceWords / totalWords;

      const timeRatio = (charRatio + wordRatio) / 2;

      const duration = totalDuration * timeRatio;

      const endTime = currentStartTime + duration;

      const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const secs = date.getUTCSeconds().toString().padStart(2, '0');
        const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
        return `${hours}:${minutes}:${secs},${ms}`;
      };

      srtContent += `${index}\n`;
      srtContent += `${formatTime(currentStartTime)} --> ${formatTime(endTime)}\n`;
      srtContent += `${sentence.trim()}\n\n`;

      currentStartTime = endTime;
      index++;
    });

    return srtContent;
  };

  const downloadGoogleTTS = async (text, filename) => {
    try {
      setIsLoading(true);

      const languageCode = selectedGoogleVoice.split('-').slice(0, 2).join('-');

      const response = await axios({
        method: 'post',
        url: '/api/texttospeech/synthesize',
        data: {
          text: text,
          voiceName: selectedGoogleVoice,
          languageCode: languageCode,
          speechRate: speechRate,
        },
        responseType: 'blob',
      });

      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mp3`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error downloading TTS:', err);
      setError('Failed to generate audio file: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSRT = async (text, filename) => {
    try {
      setIsLoading(true);
      const languageCode = selectedGoogleVoice.split('-').slice(0, 2).join('-');

      const response = await axios({
        method: 'post',
        url: '/api/texttospeech/synthesize',
        data: {
          text: text,
          voiceName: selectedGoogleVoice,
          languageCode: languageCode,
          speechRate: speechRate,
        },
        responseType: 'blob',
      });

      const srtContent = await generateSRTWithAudioDuration(text, response.data);

      const blob = new Blob([srtContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.srt`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error creating SRT:', err);
      setError('Failed to generate SRT file: ' + err.message);

      const fallbackSRT = generateSimpleSRT(text);
      const blob = new Blob([fallbackSRT], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.srt`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimpleSRT = (text) => {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length > 0);
    let srtContent = '';
    let index = 1;
    let currentTime = 0;

    sentences.forEach((sentence) => {
      const words = sentence.trim().split(/\s+/).length;
      const duration = words * 0.3;

      const formatTime = (seconds) => {
        const date = new Date(seconds * 1000);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const secs = date.getUTCSeconds().toString().padStart(2, '0');
        const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
        return `${hours}:${minutes}:${secs},${ms}`;
      };

      srtContent += `${index}\n`;
      srtContent += `${formatTime(currentTime)} --> ${formatTime(currentTime + duration)}\n`;
      srtContent += `${sentence.trim()}\n\n`;

      currentTime += duration;
      index++;
    });

    return srtContent;
  };

  const downloadFullScript = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleAudioDownloadRequest = () => {
    const fullText = videoResult.map((scene) => scene.summary).join(' ');
    downloadGoogleTTS(fullText, 'full-script');
  };

  const handleGenVideoSequence = async () => {
    try {
      // --- ACTION 1: GENERATE ALL IMAGES IN PARALLEL ---
      const imageGenerationPromises = videoResult.map((scene) => imageService.generateImage({ Prompt: scene.title }));
      const responses = await Promise.all(imageGenerationPromises);
      console.log('...Image generation API calls complete.');

      // --- STEP 2: PROCESS IMAGES AND UPDATE THE UI ---
      const generatedImages = responses
        .map((response, index) => {
          if (response?.data?.imageUrl) {
            return {
              id: videoResult[index].id || `scene-${index}`,
              name: `Scene ${index + 1}`,
              url: response.data.imageUrl,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (generatedImages.length > 0) {
        setImages(generatedImages); // Update state with new images
        setActiveTab('images'); // Switch to the tab to display them
      } else {
        // If no images were generated, we should probably stop.
        throw new Error('Image generation failed for all scenes.');
      }
      const fullTextForSpeech = videoResult.map((scene) => scene.summary).join(' ');
      const fullTextForDownloads = videoResult.map((scene) => scene.summary).join('\n\n');

      // Action 2: Download SRT
      downloadSRT(fullTextForDownloads, 'full-script');

      // Action 3: Download Script
      downloadFullScript(fullTextForDownloads, 'full-script');

      // Action 4: Generate and Download Audio
      // This is an async function, so we will 'await' it to complete.
      await handleAudioDownloadRequest();
      console.log('Sequence finished.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('Full sequence finished.');
    }
  };

  const renderVideoEditorView = () => (
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
        {/* === 1. THE NEW TAB BAR === */}
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
                    // Extract just the language and voice variant
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
        {/* --- 2. CONTENT FOR "Text to Video" TAB --- */}
        {activeTab === 'images' && (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            {/* === 1. The Image Storyboard Grid === */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {/* Map over your existing 'images' state to display them */}
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
                      onClick={() => handleRejectImage(img.id)}
                      className="p-2 bg-slate-600/80 hover:bg-slate-500 rounded-full text-white transform transition-transform "
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
                // Add your file upload logic to this onClick handler
                onClick={() => document.getElementById('imageUpload').click()}
              >
                <FaPlusCircle size={24} />
                <span className="mt-2 text-xs font-semibold">Add Image</span>
                {/* Hidden file input */}
                <input type="file" id="imageUpload" className="hidden" multiple />
              </button>
            </div>

            {/* === 2. The Decorative Form (for visual appeal only) === */}
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Storyboard Settings</h3>
              <div className="space-y-3">
                {/* Decorative Input 1 */}
                <div className="flex items-center">
                  <label className="w-1/4 text-xs font-medium text-slate-400">Style</label>
                  <select
                    disabled
                    className="w-3/4 p-1.5 bg-slate-700/50 text-slate-400 rounded-md border border-slate-600 text-xs cursor-not-allowed"
                  >
                    <option>Cinematic</option>
                  </select>
                </div>
                {/* Decorative Input 2 */}
                <div className="flex items-center">
                  <label className="w-1/4 text-xs font-medium text-slate-400">Pacing</label>
                  <select
                    disabled
                    className="w-3/4 p-1.5 bg-slate-700/50 text-slate-400 rounded-md border border-slate-600 text-xs cursor-not-allowed"
                  >
                    <option>Dynamic</option>
                  </select>
                </div>
                {/* Decorative Input 3 */}
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
      {/* Right Panel now displays the result */}
      <div className="hidden md:flex w-2/3 bg-gray-900 items-center justify-center p-5 text-center rounded-r-xl">
        {isLoading ? (
          <div className="text-slate-400">Generating...</div>
        ) : videoResult.length > 0 ? (
          <div className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 space-y-2">
            <h3 className="text-xl font-bold text-sky-400 sticky top-0 bg-gray-900 pb-1">Generated Script</h3>
            {/* This is the loop that displays every scene */}
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
            {/* --- NEW SINGLE BUTTON SOLUTION --- */}
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

  const renderGeneratorView = () => (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="p-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white">AI Content Generator</h1>
        <p className="mt-4 text-slate-300">Start with a topic, and we'll generate creative ideas for you.</p>
      </div>

      {/* Input Section */}
      <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-xl shadow-xl">
        <div className="space-y-6">
          <label htmlFor="topicInput" className="block text-sm font-medium text-slate-300 mb-2">
            What topic do you want content for?
          </label>
          {/* Use a relative container to position the button inside */}
          <div className="relative">
            <textarea
              id="topicInput"
              className="w-full p-3 pr-28 bg-slate-900 text-slate-100 rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              rows="3"
              placeholder="e.g., ancient wonders of the world"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null); // Clear error on typing
              }}
            />
            <button
              onClick={handleCreateFromTopic}
              disabled={!topic.trim()}
              className="absolute bottom-3 right-3 px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all disabled:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Choose Content Source</label>
            <div className="flex flex-wrap gap-3 pt-2">
              {availableContexts.map((context) => (
                <button
                  key={context}
                  onClick={() => setSelectedContext(context)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    selectedContext === context
                      ? 'bg-sky-600 text-white ring-2 ring-sky-400 shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  {context}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Main Action Button (Repositioned) */}
        <div className="border-t border-slate-700 mt-6 pt-5 flex justify-end">
          <button
            onClick={handleGenerateSuggestions}
            disabled={isLoading || !topic.trim()}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-purple-500/50 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Generating...' : '✨ Generate Suggestions'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mt-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Suggestions List with Refined Buttons */}
      {!isLoading && generatedSuggestions.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-sky-400 pb-2">Topic Suggestions:</h2>
          {generatedSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700 hover:border-teal-500/50 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold text-sky-300">{suggestion.title}</h3>
              <p className="mt-2 mb-4 text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{suggestion.summary}</p>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 items-center border-t border-slate-700 pt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(suggestion.summary)}
                  className="px-2 py-1 text-sm font-semibold bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition-colors"
                >
                  Copy Summary
                </button>
                <button
                  onClick={() => handleUseSuggestion(suggestion.title)}
                  className="px-2 py-1 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-md transition-colors shadow-md hover:shadow-lg"
                >
                  Use this
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="flex h-screen bg-gray-800 ">
      <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className=" flex-1 overflow-x-hidden overflow-y-auto bg-gray-800">
          {currentView === 'generator' ? renderGeneratorView() : renderVideoEditorView()}
        </main>
      </div>
    </div>
  );
};

export default ContentGeneratorPage;
