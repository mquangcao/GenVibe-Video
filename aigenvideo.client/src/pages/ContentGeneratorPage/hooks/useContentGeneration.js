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
    
    const handleGenerateAndUpload = async () => {
    if (!videoResult || videoResult.length === 0) {
        setError("Please generate a script first.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setImages([]);
    console.log("STARTING: Full Generate & Upload Sequence...");

    try {
        // --- STAGE 1: GENERATE IMAGES FROM YOUR AI (GEMINI) ---
        console.log("Stage 1: Calling Gemini to generate temporary images...");
        const scenesToGenerate = videoResult.slice(0, 2); // Only take the first 2 scenes
        const imageGenerationPromises = scenesToGenerate.map((scene) =>
            imageService.generateImage({ Prompt: scene.title })
        );
        const generationResponses = await Promise.all(imageGenerationPromises);
        // We create the array of temporary images here. Let's name it clearly.
        const aiGeneratedImages = generationResponses
            .map((response, index) => {
                if (response?.data?.imageUrl) {
                    return {
                        id: scenesToGenerate[index].id || `scene-${index}`,
                        name: `Scene ${index + 1}`,
                        url: response.data.imageUrl,
                    };
                }
                return null;
            })
            .filter(Boolean);

        if (aiGeneratedImages.length === 0) {
            throw new Error('AI Image generation failed for all scenes.');
        }
        console.log("...Stage 1 Complete. Got temporary images.");
        // --- STAGE 2: UPLOAD THOSE IMAGES TO CLOUDINARY ---
        const CLOUD_NAME = "dj88dmrqe";
        const UPLOAD_PRESET = "GenVideoProject";
        const FOLDER_NAME = "ai-generated-images";

        // We use the 'aiGeneratedImages' variable we just created
        const cloudinaryUploadPromises = aiGeneratedImages.map(tempImage => {
            const body = {
                file: tempImage.url,
                upload_preset: UPLOAD_PRESET,
                folder: FOLDER_NAME,
            };
            return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }).then(response => response.json());
        });

        const cloudinaryResults = await Promise.all(cloudinaryUploadPromises);
        console.log("...Stage 2 Complete. Images saved on Cloudinary.");


        // --- STAGE 3: UPDATE THE UI WITH FINAL, PERMANENT URLS ---
        console.log("Stage 3: Updating UI with permanent Cloudinary URLs...");
        const finalImagesFromCloudinary = cloudinaryResults.map((result, index) => ({
            id: result.public_id,
            name: aiGeneratedImages[index].name, // Use the name from the temporary images
            url: result.secure_url,
        }));

        setImages(finalImagesFromCloudinary);
        if (setActiveTab) {
            setActiveTab('images');
        }

    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
        setError(errorMessage);
        console.error("Error during full sequence:", err);
    } finally {
        setIsLoading(false);
        console.log("SEQUENCE FINISHED.");
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
        handleGenerateAndUpload,
        handleRejectImage,
        handleCreateFromTopic,
        handleUseSuggestion
    };
};