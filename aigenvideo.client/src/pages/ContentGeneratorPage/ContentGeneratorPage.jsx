import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { generateContent } from '@/apis';
import { FaArrowLeft, FaVolumeUp, FaFileDownload, FaPause } from 'react-icons/fa';

const ContentGeneratorPage = () => {
    const getLanguageDisplayName = (langCode) => {
        // Map of common language codes to their full names
        const languageMap = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'nl': 'Dutch',
            'pl': 'Polish',
            'tr': 'Turkish',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'id': 'Indonesian',
            'cs': 'Czech',
            'hu': 'Hungarian',
            'el': 'Greek',
            'he': 'Hebrew'
            // Add more languages as needed
        };

        const countryMap = {
            'US': 'United States',
            'GB': 'United Kingdom',
            'CA': 'Canada',
            'AU': 'Australia',
            'IN': 'India',
            'ES': 'Spain',
            'MX': 'Mexico',
            'FR': 'France',
            'DE': 'Germany',
            'IT': 'Italy',
            'BR': 'Brazil',
            'PT': 'Portugal',
            'RU': 'Russia',
            'JP': 'Japan',
            'KR': 'Korea',
            'CN': 'China',
            'TW': 'Taiwan',
            'HK': 'Hong Kong',
            'AR': 'Argentina',
            'SA': 'Saudi Arabia',
            'NL': 'Netherlands',
            'BE': 'Belgium',
            'CH': 'Switzerland',
            'AT': 'Austria',
            'SE': 'Sweden',
            'NO': 'Norway',
            'DK': 'Denmark',
            'FI': 'Finland',
            'PL': 'Poland',
            'TR': 'Turkey'
            // Add more countries as needed
        };

        try {
            const [langPart, countryPart] = langCode.split('-');
            const language = languageMap[langPart] || langPart;
            const country = countryPart ? (countryMap[countryPart.toUpperCase()] || countryPart) : '';

            return country ? `${language} - ${country}` : language;
        } catch (e) {
            return langCode; // Fallback to the original code if parsing fails
        }
    };


    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // States for suggestion generation
    const [topic, setTopic] = useState('');
    const [selectedContext, setSelectedContext] = useState('YouTube');
    const [generatedSuggestions, setGeneratedSuggestions] = useState([]);

    // States for view navigation and video creation
    const [currentView, setCurrentView] = useState('generator');
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoResult, setVideoResult] = useState([]);
    // General UI states
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Text-to-speech states
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSynthesis, setSpeechSynthesis] = useState(null);
    const [voiceOptions, setVoiceOptions] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(1);

    const [showAudioTip, setShowAudioTip] = useState(false);

    const availableContexts = ['YouTube', 'Wikipedia', 'Groq'];

    useEffect(() => {
        // Initialize speech synthesis and get available voices
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            setSpeechSynthesis(window.speechSynthesis);

            // Get available voices and set default
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    setVoiceOptions(voices);
                    setSelectedVoice(voices[0]);
                }
            };

            loadVoices();

            // Chrome loads voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, []);

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
        setVideoResult(''); // Clear previous results
        try {
            const response = await generateContent({ topic: videoPrompt, context: 'Gemini' });
            if (response.data && response.data.success) {
                // Gemini returns an array of scenes, use the first one for display
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
        // Stop any ongoing speech
        if (speechSynthesis && isSpeaking) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        setCurrentView('generator');
    };

    // Text-to-speech functionality
    const speakText = (text) => {
        if (!speechSynthesis) return;

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = speechRate;

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (speechSynthesis) {
            speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Generate SRT subtitle file
    const generateSRT = (text) => {
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        let srtContent = '';
        let index = 1;

        // Approximate 15 words per subtitle (about 5 seconds at normal speech rate)
        const wordsPerSubtitle = 15;
        let currentStartTime = 0; // Start at 0 seconds

        for (let i = 0; i < lines.length; i++) {
            const words = lines[i].split(' ');

            for (let j = 0; j < words.length; j += wordsPerSubtitle) {
                const subtitleWords = words.slice(j, j + wordsPerSubtitle);
                const subtitleText = subtitleWords.join(' ');

                // Calculate duration based on text properties
                const wordCount = subtitleWords.length;
                const charCount = subtitleText.length;

                // Base duration: 0.3 seconds per word
                let duration = wordCount * 0.3;

                // Minimum reading time: ~15 chars per second is comfortable reading speed
                const minReadingTime = charCount / 15;

                // Ensure subtitle stays visible long enough (at least 1.5 seconds or reading time)
                const minDuration = Math.max(1.5, minReadingTime);

                // Use the longer of speech duration or minimum reading duration
                duration = Math.max(duration, minDuration);

                // Add a small pause between sentences if this is the end of a sentence
                if (subtitleText.match(/[.!?]$/)) {
                    duration += 0.5; // Add half a second pause at end of sentences
                }

                const endTime = currentStartTime + duration;

                // Format times as SRT timestamps (HH:MM:SS,mmm)
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
                srtContent += `${subtitleText}\n\n`;

                currentStartTime = endTime;
                index++;
            }
        }

        return srtContent;
    };

    const downloadSRT = (text, filename) => {
        const srtContent = generateSRT(text);
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
    };

    const downloadFullScript = (text, filename) => {
        // Create a plain text file with the script content
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
        // Show a tooltip explaining the limitation
        setShowAudioTip(true);
        setTimeout(() => setShowAudioTip(false), 5000); // Hide after 5 seconds

        // For now, use the browser's speech synthesis and inform user
        const fullText = videoResult.map(scene => scene.summary).join(' ');

        // This starts the audio for listening while explaining the limitation
        speakText(fullText);
    };

    const renderVideoEditorView = () => (
        <div className="flex h-full p-4 md:p-6 lg:p-8">
            {/* Left Panel: Settings */}
            <div className="w-full md:w-1/2 bg-slate-800 p-6 flex flex-col space-y-6 rounded-l-xl">
                <div className="flex-none">
                    <button onClick={handleBackToGenerator} className="text-sky-400 hover:text-sky-300 font-semibold mb-4">
                        <FaArrowLeft className="inline mr-2" /> Back to Suggestions
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4"> Topic To Create Script </h2>
                </div>
                <div className="flex-1 flex flex-col space-y-5 overflow-y-auto space-x-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-4">Enter text, describe the content you want to generate</label>
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
                            className="w-4/5 p-2 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 mb-2"
                            onChange={(e) => setSelectedVoice(voiceOptions.find(voice => voice.name === e.target.value))}
                            value={selectedVoice?.name || ''}
                        >
                            {voiceOptions.map((voice) => {
                                // Extract just the name part, removing provider names
                                const cleanName = voice.name
                                    .replace(/^(Microsoft|Google|Amazon|Apple)\s+/i, '')
                                    .split('-')[0]
                                    .trim();

                                // Get full language name from the language code
                                const languageDisplay = getLanguageDisplayName(voice.lang);

                                return (
                                    <option key={voice.name} value={voice.name}>
                                        {cleanName} - {languageDisplay}
                                    </option>
                                );
                            })}
                        </select>

                        <div className="flex items-center">
                            <label className="block text-sm font-medium text-slate-300 mr-2">Speed:</label>
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={speechRate}
                                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                                className="w-3/4"
                            />
                            <span className="ml-2 text-white">{speechRate}x</span>
                        </div>
                    </div>
                </div>
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
            <div className="hidden md:flex w-2/3 bg-gray-900 items-center justify-center p-10 text-center rounded-r-xl">
                {isLoading ? (
                    <div className="text-slate-400">Generating...</div>
                ) : videoResult.length > 0 ? (
                    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto pr-2 space-y-6">
                        <h3 className="text-2xl font-bold text-sky-400 sticky top-0 bg-gray-900 pb-4">Generated Script</h3>
                        {/* This is the loop that displays every scene */}
                        {videoResult.map((scene, index) => (
                            <div key={scene.id || index} className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
                                <h4 className="text-xl font-bold text-white mb-4">Scene {index + 1}</h4>
                                {/* Image Prompt (Title) */}
                                <div className="mb-4 bg-slate-900/50 p-4 rounded-lg border-l-4 border-sky-400">
                                    <div className="flex items-center gap-3 text-sky-400 mb-2">
                                        <h5 className="text-md font-semibold">Image Prompt</h5>
                                    </div>
                                    <p className="text-slate-300 font-mono text-sm leading-relaxed">{scene.title}</p>
                                </div>

                                {/* Narration (Summary) */}
                                <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-400">
                                    <div className="flex items-center gap-3 text-purple-400 mb-2">
                                        <h5 className="text-md font-semibold">Content</h5>
                                    </div>
                                    <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">{scene.summary}</p>

                                    {/* Audio and Subtitle controls */}
                                    <div className="flex mt-4 justify-end gap-3">
                                        {isSpeaking && scene.id === scene.id ? (
                                            <button
                                                onClick={stopSpeaking}
                                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
                                                title="Stop Speaking"
                                            >
                                                <FaPause />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => speakText(scene.summary)}
                                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
                                                title="Listen"
                                            >
                                                <FaVolumeUp />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => downloadSRT(scene.summary, `scene-${index + 1}`)}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                                            title="Download SRT"
                                        >
                                            <FaFileDownload />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Full script audio controls */}
                        <div className="sticky bottom-0 bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 mt-6">
                            <h4 className="text-lg font-semibold text-white mb-3">Full Script Controls</h4>
                            <div className="flex flex-wrap justify-between gap-2">
                                <button
                                    onClick={() => {
                                        const fullText = videoResult.map(scene => scene.summary).join(' ');
                                        speakText(fullText);
                                    }}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                                    disabled={isSpeaking}
                                >
                                    <FaVolumeUp /> Listen to Full Script
                                </button>
                                <button
                                    onClick={() => {
                                        const fullText = videoResult.map(scene => scene.summary).join('\n\n');
                                        downloadSRT(fullText, 'full-script');
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <FaFileDownload /> Download SRT
                                </button>
                                <button
                                    onClick={() => {
                                        const fullText = videoResult.map(scene => scene.summary).join('\n\n');
                                        downloadFullScript(fullText, 'full-script');
                                    }}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <FaFileDownload /> Download Script
                                </button>
                                <button
                                    onClick={handleAudioDownloadRequest}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2"
                                >
                                    <FaVolumeUp /> Download Audio
                                </button>
                            </div>
                            {showAudioTip && (
                                <div className="mt-3 p-2 bg-slate-700 rounded-md text-left text-sm text-amber-300 border border-amber-600">
                                    <p className="font-semibold">Note: Audio download requires a server-side Text-to-Speech API</p>
                                    <p className="text-xs mt-1 text-slate-300">
                                        To enable true audio downloads, integrate with services like Google Cloud TTS,
                                        Amazon Polly, or Microsoft Azure Speech Services.
                                    </p>
                                </div>
                            )}
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
                                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${selectedContext === context
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