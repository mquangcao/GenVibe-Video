import React, { useState } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { generateContent } from '@/apis';
import { FaArrowLeft } from 'react-icons/fa';

const ContentGeneratorPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // States for suggestion generation
  const [topic, setTopic] = useState('');
  const [selectedContext, setSelectedContext] = useState('YouTube');
  const [generatedSuggestions, setGeneratedSuggestions] = useState([]);

  // States for view navigation and video creation
  const [currentView, setCurrentView] = useState('generator');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState('');
  // General UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const availableContexts = ['YouTube', 'Wikipedia', 'Groq'];

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
      // Optionally, set an error message
      setError('Please enter a topic before creating.');
      return;
    }
    setVideoPrompt(topic); // Use the current topic as the prompt
    setCurrentView('videoEditor'); // Nav   igate to the editor
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
        // Assuming the API returns a list, we'll take the first result's summary.
        // Adjust this based on the actual structure of the Gemini API response.
        setVideoResult(response.data.data[0]?.summary || 'No content was generated.');
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
    setCurrentView('generator');
  };

  const renderVideoEditorView = () => (
    <div className="flex h-full p-4 md:p-6 lg:p-8">
      {/* Left Panel: Settings */}
      <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col space-y-6 rounded-l-xl">
        <div className="flex-none">
          <button onClick={handleBackToGenerator} className="text-sky-400 hover:text-sky-300 font-semibold mb-4">
            <FaArrowLeft className="inline mr-2" /> Back to Suggestions
          </button>
          <h2 className="text-2xl font-bold text-white mb-4"> Topic To Create Script </h2>
        </div>
        <div className="flex-1 flex flex-col space-y-5 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-4">Enter text, describe the content you want to generate</label>
            <textarea
              className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-40 resize-none"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
            />
          </div>
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="flex-none pt-4">
          {/* --- NEW: "Create" button now calls handleCreateVideo --- */}
          <button
            onClick={handleCreateVideo}
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-wait"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* --- NEW: Right Panel now displays the result --- */}
      <div className="hidden md:flex w-2/3 bg-gray-900 items-center justify-center p-10 text-center rounded-r-xl">
        {isLoading ? (
          <div className="text-slate-400">Generating...</div>
        ) : videoResult ? (
          <div className="text-left text-slate-200 bg-slate-800 p-6 rounded-lg w-full h-full overflow-y-auto">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Generated Content (From Gemini)</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{videoResult}</p>
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

      {/* --- Input Section --- */}
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
        {/* --- Main Action Button (Repositioned) --- */}
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

      {/* --- Suggestions List with Refined Buttons --- */}
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
              {/* --- Action Buttons (Repositioned & Resized) --- */}
              <div className="flex justify-end gap-3 items-center border-t border-slate-700 pt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(suggestion.summary)}
                  className="px-2 py-1 text-xl font-semibold bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md transition-colors"
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
