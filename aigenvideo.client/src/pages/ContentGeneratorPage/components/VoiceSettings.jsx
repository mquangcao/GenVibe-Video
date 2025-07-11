import React from 'react';

const VoiceSettings = ({
  googleVoices,
  selectedGoogleVoice,
  setSelectedGoogleVoice,
  speechRate,
  setSpeechRate,
  getLanguageDisplayName,
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Voice Settings for Video</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Select Voice</label>
          <select
            className="w-full p-2 bg-white text-gray-900 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
          <label className="block text-xs font-medium text-gray-700 mb-2">Speech Rate: {speechRate}x</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider:bg-purple-600 slider:rounded-lg"
            style={{
              background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((speechRate - 0.5) / 1.5) * 100}%, #e5e7eb ${
                ((speechRate - 0.5) / 1.5) * 100
              }%, #e5e7eb 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;
