import axios from 'axios';

/**
 * Generates audio from text using the text-to-speech API
 * @param {Object} options - The options for generating audio
 * @param {string} options.text - The text to convert to speech
 * @param {string} options.selectedGoogleVoice - The Google voice name to use
 * @param {string} [options.languageCode] - The language code (if not provided, will be extracted from voice name)
 * @param {number} [options.speechRate=1] - The speech rate (1 is normal speed)
 * @returns {Promise<Object>} - The axios response with audio blob data
 */
export const generateAudio = async ({ text, selectedGoogleVoice, languageCode, speechRate = 1 }) => {
    // If languageCode not provided, extract it from the voice name (e.g., en-US-Standard-B → en-US)
    if (!languageCode) {
        languageCode = selectedGoogleVoice.split('-').slice(0, 2).join('-');
    }

    return axios({
        method: 'post',
        url: '/api/texttospeech/synthesize',
        data: {
            text,
            voiceName: selectedGoogleVoice,
            languageCode,
            speechRate
        },
        responseType: 'blob'
    });
};