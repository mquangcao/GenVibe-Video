import { useState } from 'react';
import { generateAudio } from '@/apis/audioService';

export const useAudioSpeech = () => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const speakText = async (text, voice, rate = 1) => {
        if (!text) return;

        try {
            setIsLoading(true);
            setError(null);
            setIsAudioPlaying(true);
            setIsSpeaking(true);

            const response = await generateAudio({ text, selectedGoogleVoice: voice, speechRate: rate });
            const audioBlob = response.data;

            if (!audioBlob) {
                throw new Error('Failed to generate speech');
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                setIsAudioPlaying(false);
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = (e) => {
                console.error('Audio playback error:', e);
                setError('Error playing audio');
                setIsAudioPlaying(false);
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.play();
        } catch (err) {
            console.error('Error in speech synthesis:', err);
            setError(err.message || 'Error generating speech');
            setIsAudioPlaying(false);
            setIsSpeaking(false);
        } finally {
            setIsLoading(false);
        }
    };

    // New function to generate audio and return the blob URL
    const generateAudioBlob = async (text, voice, rate = 1) => {
        if (!text) {
            throw new Error('No text provided for audio generation');
        }

        try {
            const response = await generateAudio({ text, selectedGoogleVoice: voice, speechRate: rate });
            const audioBlob = response.data;

            if (!audioBlob) {
                throw new Error('Failed to generate speech');
            }

            return URL.createObjectURL(audioBlob);
        } catch (err) {
            console.error('Error generating audio blob:', err);
            throw err;
        }
    };

    return {
        isAudioPlaying,
        isSpeaking,
        error,
        isLoading,
        setError,
        speakText,
        generateAudioBlob
    };
};