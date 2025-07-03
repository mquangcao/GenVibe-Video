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
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);

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
      const generateAndUploadAudio = async (text, selectedGoogleVoice, speechRate) => {
        if (!text) {
            setError("Cannot generate audio from empty text.");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setUploadedAudioUrl(null);
        console.log("Hook called: Starting audio generation and upload...");

        try {
            // --- 1. Generate the Audio Blob from your backend ---
            console.log("Generating audio data...");
            const response = await generateAudio({ text, selectedGoogleVoice, speechRate });
            const audioBlob = response.data;

            if (!audioBlob || audioBlob.size === 0) {
                throw new Error("Backend did not return valid audio data.");
            }
            console.log("...Audio blob received, size:", audioBlob.size);

            // --- 2. Upload that Audio Blob to Cloudinary ---
            console.log("Uploading audio to Cloudinary...");
            const CLOUD_NAME = "dj88dmrqe";
            const UPLOAD_PRESET = "GenVideoProject";
            const FOLDER_NAME = "generated-audio";

            const formData = new FormData();
            formData.append("file", audioBlob, "generated-audio.mp3");
            formData.append("upload_preset", UPLOAD_PRESET);
            formData.append("folder", FOLDER_NAME);
            formData.append("resource_type", "video");

            const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
                method: "POST",
                body: formData,
            }).then(res => res.json());

            if (!cloudinaryResponse.secure_url) {
                throw new Error(cloudinaryResponse.error?.message || "Cloudinary upload failed.");
            }
            console.log("...Audio uploaded! URL:", cloudinaryResponse.secure_url);

            // --- 3. Update state with the final, permanent URL ---
            setUploadedAudioUrl(cloudinaryResponse.secure_url);
            
            // Optionally, return the URL for immediate use
            return cloudinaryResponse.secure_url;

        } catch (err) {
            console.error("Error in useAudioSpeech hook:", err);
            setError(err.message || "An unknown error occurred while processing audio.");
        } finally {
            setIsProcessing(false);
        }
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
        downloadFullScript,
        generateAndUploadAudio
    };
};