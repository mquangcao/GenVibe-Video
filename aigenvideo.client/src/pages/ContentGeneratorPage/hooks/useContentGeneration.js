import { useState } from 'react';
import { generateContent, imageService } from '@/apis';

export const useContentGeneration = (setActiveTab) => {
    const [topic, setTopic] = useState('');
    const [selectedContext, setSelectedContext] = useState('YouTube');
    const [generatedSuggestions, setGeneratedSuggestions] = useState([]);
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoResult, setVideoResult] = useState([]);
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const availableContexts = ['YouTube', 'Wikipedia', 'Groq'];

    const handleGenerateSuggestions = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic before generating suggestions.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedSuggestions([]);

        try {
            const response = await generateContent({ topic, context: selectedContext });
            if (response.data && response.data.success) {
                setGeneratedSuggestions(response.data.data);
            } else {
                throw new Error(response.data?.message || 'Failed to generate suggestions');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateVideo = async () => {
        if (!videoPrompt.trim()) {
            setError("The prompt can't be empty.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setVideoResult([]);

        try {
            const response = await generateContent({ topic: videoPrompt, context: 'Gemini' });
            if (response.data && response.data.success) {
                setVideoResult(response.data.data || []);
            } else {
                throw new Error(response.data?.message || 'Failed to create video content');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenVideoSequence = async () => {
        try {
            setIsLoading(true);

            // Generate images for all scenes
            const imageGenerationPromises = videoResult.map((scene) =>
                imageService.generateImage({ Prompt: scene.title })
            );

            const responses = await Promise.all(imageGenerationPromises);

            // Process generated images
            const generatedImages = responses
                .map((response, index) => {
                    if (response?.data?.imageUrl) {
                        return {
                            id: videoResult[index].id || `scene-${index}`,
                            name: `Scene ${index + 1}`,
                            url: response.data.imageUrl,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            if (generatedImages.length > 0) {
                setImages(generatedImages);
                if (setActiveTab) {
                    setActiveTab('images');
                }
            } else {
                throw new Error('Image generation failed for all scenes.');
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectImage = (idToReject) => {
        setImages((prevImages) => prevImages.filter((img) => img.id !== idToReject));
    };

    const handleCreateFromTopic = () => {
        if (!topic.trim()) {
            setError('Please enter a topic before creating.');
            return;
        }
        setVideoPrompt(topic); // Use the current topic as the prompt
    };

    const handleUseSuggestion = (suggestionTitle) => {
        setVideoPrompt(suggestionTitle);
        setError(null); // Clear any old errors
        setVideoResult([]); // Clear old results when starting a new edit
    };

    return {
        topic,
        setTopic,
        selectedContext,
        setSelectedContext,
        generatedSuggestions,
        videoPrompt,
        setVideoPrompt,
        videoResult,
        images,
        isLoading,
        error,
        setError,
        availableContexts,
        handleGenerateSuggestions,
        handleCreateVideo,
        handleGenVideoSequence,
        handleRejectImage,
        handleCreateFromTopic,
        handleUseSuggestion
    };
};