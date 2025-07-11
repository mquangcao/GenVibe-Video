/* eslint-disable no-unused-vars */
import React from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { useNavigation } from './hooks/useNavigation';
import { useAudioSpeech } from './hooks/useAudioSpeech';
import { useContentGeneration } from './hooks/useContentGeneration';
import { useVoiceSelection } from './hooks/useVoiceSelection';
import { getLanguageDisplayName } from './utils/languageUtils';
import GeneratorView from './components/GeneratorView';
import VideoEditor from './components/VideoEditor';

const ContentGeneratorPage = () => {
  // Custom hooks
  const {
    isSidebarOpen,
    currentView,
    activeTab,
    toggleSidebar,
    setActiveTab,
    handleBackToGenerator: navigateBack,
    navigateToVideoEditor,
  } = useNavigation();

  const { googleVoices, selectedGoogleVoice, setSelectedGoogleVoice, speechRate, setSpeechRate } = useVoiceSelection();

  const {
    isAudioPlaying,
    isSpeaking,
    error: audioError,
    isLoading: audioLoading,
    setError: setAudioError,
    speakText: handleSpeakText,
    stopSpeaking,
    downloadGoogleTTS,
    downloadSRT: handleDownloadSRT,
    downloadFullScript,
    generateAudioBlob,
  } = useAudioSpeech();

  const {
    topic,
    setTopic,
    selectedContext,
    setSelectedContext,
    generatedSuggestions,
    videoPrompt,
    setVideoPrompt,
    videoResult,
    images,
    isLoading: contentLoading,
    error: contentError,
    setError: setContentError,
    availableContexts,
    handleGenerateSuggestions,
    handleCreateVideo,
    handleGenerateAndUpload,
    handleRejectImage,
    handleCreateFromTopic: createFromTopic,
    handleUseSuggestion,
    selectedStyle,
    setSelectedStyle,
    selectedAudience,
    setSelectedAudience,
  } = useContentGeneration(setActiveTab);

  // Combined values
  const isLoading = audioLoading || contentLoading;
  const error = audioError || contentError;

  // Combined handlers
  const handleBackToGenerator = () => {
    stopSpeaking();
    navigateBack();
  };

  const handleCreateFromTopic = () => {
    createFromTopic();
    navigateToVideoEditor();
  };

  const handleUseSelectedSuggestion = (title) => {
    handleUseSuggestion(title);
    navigateToVideoEditor();
  };

  const speakText = (text) => {
    handleSpeakText(text, selectedGoogleVoice, speechRate);
  };

  const downloadSRT = (text, filename) => {
    handleDownloadSRT(text, filename, selectedGoogleVoice, speechRate);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
          {currentView === 'generator' ? (
            <GeneratorView
              topic={topic}
              setTopic={setTopic}
              selectedContext={selectedContext}
              setSelectedContext={setSelectedContext}
              availableContexts={availableContexts}
              handleGenerateSuggestions={handleGenerateSuggestions}
              handleCreateFromTopic={handleCreateFromTopic}
              handleUseSuggestion={handleUseSelectedSuggestion}
              generatedSuggestions={generatedSuggestions}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <VideoEditor
              videoPrompt={videoPrompt}
              setVideoPrompt={setVideoPrompt}
              googleVoices={googleVoices}
              selectedGoogleVoice={selectedGoogleVoice}
              setSelectedGoogleVoice={setSelectedGoogleVoice}
              speechRate={speechRate}
              setSpeechRate={setSpeechRate}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleBackToGenerator={handleBackToGenerator}
              handleCreateVideo={handleCreateVideo}
              speakText={speakText}
              stopSpeaking={stopSpeaking}
              downloadSRT={downloadSRT}
              downloadGoogleTTS={downloadGoogleTTS}
              downloadFullScript={downloadFullScript}
              images={images}
              handleRejectImage={handleRejectImage}
              videoResult={videoResult}
              isAudioPlaying={isAudioPlaying}
              handleGenerateAndUpload={handleGenerateAndUpload}
              isLoading={isLoading}
              error={error}
              getLanguageDisplayName={getLanguageDisplayName}
              generateAudioBlob={generateAudioBlob}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
              selectedAudience={selectedAudience}
              setSelectedAudience={setSelectedAudience}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ContentGeneratorPage;
