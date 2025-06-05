import React, { useState, useRef } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { Mic, Download, Heart, Save, Volume2, Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';

function VoiceGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [generatedAudios, setGeneratedAudios] = useState([
    {
      id: 1,
      text: 'Hello, this is a sample generated voice.',
      audioUrl: '', // Replace with actual audio URL if available
      isPlaying: false,
      duration: '0:30',
      volume: 1,
      showVolume: false,
    },
    {
      id: 2,
      text: 'Another example of AI generated speech.',
      audioUrl: '',
      isPlaying: false,
      duration: '0:45',
      volume: 1,
      showVolume: false,
    }
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedQuality, setSelectedQuality] = useState('High');
  const [playSpeed, setPlaySpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(true);

  // Refs for audio elements
  const audioRefs = useRef({});

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const newAudio = {
      id: Date.now(),
      text: textInput,
      audioUrl: '', // Replace with actual audio URL if available
      isPlaying: false,
      duration: '0:00',
      volume: 1,
      showVolume: false,
    };
    setGeneratedAudios([newAudio, ...generatedAudios]);
    setTextInput('');
  };

  const togglePlayPause = (id) => {
    setGeneratedAudios(prev =>
      prev.map(audio =>
        audio.id === id
          ? { ...audio, isPlaying: !audio.isPlaying }
          : { ...audio, isPlaying: false }
      )
    );
    // Optionally, play/pause the actual audio element here
    const audioEl = audioRefs.current[id];
    if (audioEl) {
      if (audioEl.paused) {
        audioEl.play();
      } else {
        audioEl.pause();
      }
    }
  };

  const toggleShowVolume = (id) => {
    setGeneratedAudios(prev =>
      prev.map(audio =>
        audio.id === id
          ? { ...audio, showVolume: !audio.showVolume }
          : { ...audio, showVolume: false }
      )
    );
  };

  const handleVolumeChange = (id, value) => {
    setGeneratedAudios(prev =>
      prev.map(audio =>
        audio.id === id
          ? { ...audio, volume: value }
          : audio
      )
    );
    // Set the actual audio element's volume
    const audioEl = audioRefs.current[id];
    if (audioEl) {
      audioEl.volume = value;
    }
  };

  const toggleLike = (id) => {
    setGeneratedAudios(prev =>
      prev.map(audio =>
        audio.id === id
          ? { ...audio, liked: !audio.liked }
          : audio
      )
    );
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-gray-800 p-4 md:p-6">
          <section className="text-center text-white mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              AI Voice Generator
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Transform your text into natural-sounding speech with advanced AI technology
            </p>
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
                {/* Language Selection */}
                <div>
                  <h6 className="text-white font-semibold mb-3">Language</h6>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bangla">Bangla</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
                {/* Quality Selection */}
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
                  <p className="text-gray-400 text-sm mt-2">
                    Higher quality will result in better audio, but will take longer.
                  </p>
                </div>
                {/* Play Speed */}
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
                  <p className="text-gray-400 text-sm mt-2">
                    Adjust the playback speed of generated audio.
                  </p>
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
                    Generate Voice
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
                    <p className="text-gray-300 text-sm mb-2">Generated from:</p>
                    <p className="text-white bg-gray-800 p-3 rounded border-l-4 border-purple-500">
                      {audio.text}
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => togglePlayPause(audio.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                        >
                          {audio.isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>
                        <span className="text-white text-sm">{audio.duration}</span>
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
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                      <div className="bg-purple-500 h-2 rounded-full w-0"></div>
                    </div>
                    {/* Audio element (hidden, for real playback) */}
                    <audio
                      ref={el => (audioRefs.current[audio.id] = el)}
                      src={audio.audioUrl}
                      volume={audio.volume}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors">
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        className={`bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors ${audio.liked ? 'text-red-500' : ''}`}
                        onClick={() => toggleLike(audio.id)}
                        type="button"
                      >
                        <Heart
                          className="h-4 w-4"
                          fill={audio.liked ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center transition-colors">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="h-16"></div>
        </main>
      </div>
    </div>
  );
}

export default VoiceGeneratorPage;