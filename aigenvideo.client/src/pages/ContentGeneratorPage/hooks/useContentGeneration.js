import { useState } from 'react';
import { generateContent, imageService } from '@/apis';
import saveVideo from '@/apis/saveFullVideoData';

export const useContentGeneration = (setActiveTab) => {
  const [topic, setTopic] = useState('');
  const [selectedContext, setSelectedContext] = useState('YouTube');
  const [generatedSuggestions, setGeneratedSuggestions] = useState([]);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('Anime');
  const [selectedAudience, setSelectedAudience] = useState('Children');

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
    // 1. Initial Setup
    if (!videoResult || videoResult.length === 0) {
      setError('Please generate a script first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImages([]);
    console.log('STARTING: Full Generate, Upload, and Save Sequence...');

    try {
      const generationPromises = videoResult.map((scene) => {
        // Construct the full prompt for each scene
        const fullPrompt = `${scene.title}, for ${selectedAudience.toLowerCase()}, ${selectedStyle} style, size 1920 x 1080 pixels`;
        return imageService.generateImage({ Prompt: fullPrompt });
      });
      const generationResponses = await Promise.all(generationPromises);

      const aiGeneratedImages = generationResponses
        .map((response, index) => {
          if (response?.data?.imageUrl) {
            return {
              id: response.id || `scene-${index}`,
              name: `Scene ${index + 1}`,
              url: response.data.imageUrl, // This is the temporary Data URL
            };
          }
          return null;
        })
        .filter(Boolean);

      if (aiGeneratedImages.length === 0) {
        throw new Error('AI Image generation failed.');
      }
      console.log('...Stage 1 Complete: Got temporary images from AI.');

      // --- STAGE 2: Upload all generated images to Cloudinary ---
      const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const FOLDER_NAME = 'ai-generated-images';

      const cloudinaryUploadPromises = aiGeneratedImages.map((tempImage) => {
        const body = {
          file: tempImage.url,
          upload_preset: UPLOAD_PRESET,
          folder: FOLDER_NAME,
        };
        return fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }).then((response) => response.json());
      });

      // We only need to await the uploads ONCE.
      const cloudinaryResults = await Promise.all(cloudinaryUploadPromises);
      console.log('...Stage 2 Complete: Images saved on Cloudinary.');

      // --- STAGE 4: Update the UI with the final results ---
      const finalImagesForUI = cloudinaryResults.map((result, index) => ({
        id: result.public_id,
        name: aiGeneratedImages[index].name,
        url: result.secure_url,
      }));

      setImages(finalImagesForUI);
      if (setActiveTab) {
        setActiveTab('images');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      console.error('Error during full sequence:', err);
    } finally {
      setIsLoading(false);
      console.log('SEQUENCE FINISHED.');
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
    setVideoPrompt(topic);
  };

  const handleUseSuggestion = (suggestionTitle) => {
    setVideoPrompt(suggestionTitle);
    setError(null);
    setVideoResult([]);
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
    handleUseSuggestion,
    selectedStyle,
    setSelectedStyle,
    selectedAudience,
    setSelectedAudience,
  };
};
