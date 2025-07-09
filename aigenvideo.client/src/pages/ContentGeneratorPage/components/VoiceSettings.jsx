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
    );
};

export default VoiceSettings;