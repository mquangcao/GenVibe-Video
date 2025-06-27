import { useState, useEffect } from 'react';
import { generateAudio } from '@/apis/audioService';
import { generateSRTWithSentenceTiming, generateSimpleSRT } from '../utils/srtUtils';
import { downloadFile, downloadBlobAsFile } from '../utils/downloadUtils';

export const useAudioSpeech = () => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const audio = new Audio();
        audio.onended = () => {
            setIsAudioPlaying(false);
            setIsSpeaking(false);
        };
        audio.onerror = () => {
            setIsAudioPlaying(false);
            setIsSpeaking(false);
            setError('Error playing audio');
        };
        setAudioElement(audio);

        return () => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
        };
    }, []);

    const speakText = async (text, selectedGoogleVoice, speechRate) => {
        try {
            if (audioElement && isAudioPlaying) {
                audioElement.pause();
                audioElement.src = '';
                setIsAudioPlaying(false);
            }

            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const response = await generateAudio({ text, selectedGoogleVoice, speechRate });
            const url = URL.createObjectURL(response.data);

            if (audioElement) {
                audioElement.src = url;
                setIsSpeaking(true);

                await audioElement.play().catch((err) => {
                    console.error('Error playing audio:', err);
                    setError('Error playing audio');
                    setIsSpeaking(false);
                    setIsAudioPlaying(false);
                });

                setIsAudioPlaying(true);
            }
        } catch (err) {
            console.error('Error with text-to-speech:', err);
            setError('Failed to synthesize speech: ' + (err.response?.data?.message || err.message));
            setIsSpeaking(false);
            setIsAudioPlaying(false);
        } finally {
            setIsLoading(false);
        }
    };

    const stopSpeaking = () => {
        if (audioElement && isAudioPlaying) {
            audioElement.pause();
            audioElement.src = '';
            setIsSpeaking(false);
            setIsAudioPlaying(false);
        }
    };

    const downloadGoogleTTS = async (text, filename, selectedGoogleVoice, speechRate) => {
        try {
            setIsLoading(true);
            const response = await generateAudio({ text, selectedGoogleVoice, speechRate });
            downloadBlobAsFile(response.data, `${filename}.mp3`);
        } catch (err) {
            console.error('Error downloading TTS:', err);
            setError('Failed to generate audio file: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const downloadSRT = async (text, filename, selectedGoogleVoice, speechRate) => {
        try {
            setIsLoading(true);
            const response = await generateAudio({ text, selectedGoogleVoice, speechRate });

            try {
                const srtContent = await generateSRTWithAudioDuration(text, response.data);
                downloadFile(srtContent, `${filename}.srt`);
            } catch (srtErr) {
                console.error('Error creating SRT:', srtErr);

                // Fallback to simple SRT generation
                const fallbackSRT = generateSimpleSRT(text);
                downloadFile(fallbackSRT, `${filename}.srt`);
            }
        } catch (err) {
            console.error('Error creating SRT:', err);
            setError('Failed to generate SRT file: ' + err.message);

            // Generate simple SRT as fallback
            const fallbackSRT = generateSimpleSRT(text);
            downloadFile(fallbackSRT, `${filename}.srt`);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadFullScript = (text, filename) => {
        downloadFile(text, `${filename}.txt`);
    };

    const generateSRTWithAudioDuration = async (text, audioBlob) => {
        return new Promise((resolve, reject) => {
            try {
                const audio = new Audio();
                const url = URL.createObjectURL(audioBlob);

                audio.onloadedmetadata = () => {
                    const audioDuration = audio.duration;
                    URL.revokeObjectURL(url);

                    const srt = generateSRTWithSentenceTiming(text, audioDuration);
                    resolve(srt);
                };

                audio.onerror = (err) => {
                    console.error('Error loading audio metadata:', err);
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load audio metadata'));
                };

                audio.src = url;
            } catch (err) {
                reject(err);
            }
        });
    };

    return {
        isAudioPlaying,
        isSpeaking,
        error,
        isLoading,
        setError,
        speakText,
        stopSpeaking,
        downloadGoogleTTS,
        downloadSRT,
        downloadFullScript
    };
};