import { useState, useEffect } from 'react';

export const useVoiceSelection = () => {
    const [googleVoices, setGoogleVoices] = useState([]);
    const [selectedGoogleVoice, setSelectedGoogleVoice] = useState('en-US-Standard-B');
    const [speechRate, setSpeechRate] = useState(1);

    useEffect(() => {
        fetchGoogleVoices();
    }, []);

    const fetchGoogleVoices = () => {
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

    return {
        googleVoices,
        selectedGoogleVoice,
        setSelectedGoogleVoice,
        speechRate,
        setSpeechRate
    };
};