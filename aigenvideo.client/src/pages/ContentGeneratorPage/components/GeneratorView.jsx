﻿import React from 'react';

const GeneratorView = ({
    topic,
    setTopic,
    selectedContext,
    setSelectedContext,
    availableContexts,
    handleGenerateSuggestions,
    handleCreateFromTopic,
    handleUseSuggestion,
    generatedSuggestions,
    isLoading,
    error
}) => {
    return (
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
                    {/* Input with positioned button */}
                    <div className="relative">
                        <textarea
                            id="topicInput"
                            className="w-full p-3 pr-28 bg-slate-900 text-slate-100 rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                            rows="3"
                            placeholder="e.g., ancient wonders of the world"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
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

                {/* Main Action Button */}
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

            {/* Suggestions List */}
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
};

export default GeneratorView;