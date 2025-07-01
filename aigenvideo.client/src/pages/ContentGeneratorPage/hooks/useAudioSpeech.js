import { useState } from 'react';
import { generateAudio } from '@/apis/audioService';

export const useAudioSpeech = () => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Stores the current audio context and source
    let audioContext = null;
    let audioSource = null;

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

    const stopSpeaking = () => {
        if (audioContext) {
            audioSource.stop();
            audioContext.close();
            audioContext = null;
            audioSource = null;
        }
        setIsAudioPlaying(false);
        setIsSpeaking(false);
    };

    const downloadGoogleTTS = async (text, filename, voice, rate = 1) => {
        if (!text) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await generateAudio({ text, selectedGoogleVoice: voice, speechRate: rate });
            const audioBlob = response.data;

            if (!audioBlob) {
                throw new Error('Failed to generate speech');
            }

            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'speech'}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading TTS audio:', err);
            setError(err.message || 'Error generating audio download');
        } finally {
            setIsLoading(false);
        }
    };

    // Enhanced SRT download function that supports image-synchronized subtitles
    const downloadSRT = async (text, filename, voice, rate = 1, audioDuration = null, imageCount = null) => {
        if (!text) {
            setError('No text provided for subtitles');
            return;
        }

        try {
            // If audioDuration isn't provided but we need it, try to estimate it
            if (!audioDuration) {
                // Estimate based on text length and speech rate
                // Average reading speed is about 150 words per minute or 2.5 words per second
                const wordCount = text.split(/\s+/).length;
                audioDuration = (wordCount / 2.5) / rate;
                console.log('Estimated audio duration:', audioDuration);
            }

            // If imageCount isn't provided, use a reasonable default
            if (!imageCount) {
                // Try to guess based on text structure - paragraphs, etc.
                const paragraphs = text.split(/\n\n+/);
                imageCount = Math.max(paragraphs.length, 5); // At least 5 segments
                console.log('Estimated image count:', imageCount);
            }

            // Split text into segments matching the number of images
            const segments = splitTextIntoSegments(text, imageCount);

            // Calculate duration per image/segment
            const segmentDuration = audioDuration / imageCount;

            // Format to SRT
            let srtContent = '';

            segments.forEach((segment, index) => {
                // Calculate start and end times for this segment
                const startTime = index * segmentDuration;
                const endTime = (index + 1) * segmentDuration;

                // Add subtitle entry
                srtContent += `${index + 1}\n`;
                srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
                srtContent += `${segment.trim()}\n\n`;
            });

            // Create and download the file
            const blob = new Blob([srtContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'subtitles'}.srt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error creating SRT file:', err);
            setError(err.message || 'Error creating subtitles');
        }
    };

    const downloadFullScript = (text, filename) => {
        if (!text) return;

        try {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'script'}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading script:', err);
            setError(err.message || 'Error downloading script');
        }
    };

    // Helper functions for SRT generation
    const formatSRTTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 1000);

        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)},${padZero(milliseconds, 3)}`;
    };

    const padZero = (num, size = 2) => {
        let s = num.toString();
        while (s.length < size) s = '0' + s;
        return s;
    };

    const splitTextIntoSegments = (text, segmentCount) => {
        // Split by sentences first for more natural segmentation
        const sentences = text.replace(/([.!?])\s+/g, "$1|").split("|").filter(s => s.trim().length > 0);

        if (sentences.length <= segmentCount) {
            // If we have fewer sentences than segments, just return the sentences
            return sentences;
        }

        const segments = [];
        const sentencesPerSegment = Math.ceil(sentences.length / segmentCount);

        for (let i = 0; i < segmentCount; i++) {
            const start = i * sentencesPerSegment;
            const end = Math.min(start + sentencesPerSegment, sentences.length);

            if (start < sentences.length) {
                segments.push(sentences.slice(start, end).join(' '));
            }
        }

        return segments;
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