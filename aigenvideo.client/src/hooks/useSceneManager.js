import { useState, useEffect } from 'react';
import { generateImage } from '@/apis/imageService';
import { uploadToCloudinary } from '@/services/cloudinaryService';

export const useSceneManager = (videoResult) => {
    const [customScenes, setCustomScenes] = useState([]);
    const [editingSceneIndex, setEditingSceneIndex] = useState(null);
    const [isAddingScene, setIsAddingScene] = useState(false);
    const [newScene, setNewScene] = useState({ title: '', summary: '', imageUrl: '' });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [generatingImage, setGeneratingImage] = useState(false);

    // Initialize custom scenes from videoResult
    useEffect(() => {
        if (videoResult && videoResult.length > 0 && customScenes.length === 0) {
            setCustomScenes(videoResult.map((scene, index) => ({
                id: scene.id || `scene-${index}`,
                title: scene.title || '',
                summary: scene.summary || '',
                imageUrl: scene.imageUrl || '',
                isCustom: false,
            })));
        }
    }, [videoResult, customScenes.length]);

    const addNewScene = () => {
        setIsAddingScene(true);
        setNewScene({ title: '', summary: '', imageUrl: '' });
    };

    const saveNewScene = async () => {
        if (!newScene.title.trim() || !newScene.summary.trim()) {
            alert('Please fill in both image prompt and summary fields');
            return;
        }

        const sceneToAdd = {
            id: `custom-scene-${Date.now()}`,
            title: newScene.title.trim(),
            summary: newScene.summary.trim(),
            imageUrl: newScene.imageUrl,
            isCustom: true,
        };

        // Add the scene first
        setCustomScenes(prev => [...prev, sceneToAdd]);

        // If no image URL provided, try to generate one automatically
        if (!newScene.imageUrl && newScene.title.trim()) {
            console.log('Auto-generating image for new scene...');
            try {
                setGeneratingImage(true);
                const response = await generateImage({ Prompt: newScene.title.trim() });
                const imageUrl = response.data.imageUrl || response.data.url;

                if (imageUrl) {
                    // Update the scene with the generated image
                    setCustomScenes(prev => prev.map(scene =>
                        scene.id === sceneToAdd.id ? { ...scene, imageUrl } : scene
                    ));
                    console.log('Auto-generated image successfully');
                }
            } catch (error) {
                console.warn('Auto image generation failed, scene created without image:', error);
            } finally {
                setGeneratingImage(false);
            }
        }

        setIsAddingScene(false);
        setNewScene({ title: '', summary: '', imageUrl: '' });
    };

    const cancelNewScene = () => {
        setIsAddingScene(false);
        setNewScene({ title: '', summary: '', imageUrl: '' });
    };

    const editScene = (index) => {
        setEditingSceneIndex(index);
    };

    const saveEditedScene = (index, updatedScene) => {
        setCustomScenes(prev => prev.map((scene, i) =>
            i === index ? { ...scene, ...updatedScene, isCustom: true } : scene
        ));
        setEditingSceneIndex(null);
    };

    const deleteScene = (index) => {
        if (confirm('Are you sure you want to delete this scene?')) {
            setCustomScenes(prev => prev.filter((_, i) => i !== index));
        }
    };

    // Enhanced moveScene function with better validation and logging
    const moveScene = (fromIndex, toIndex) => {
        // Validate indices
        if (fromIndex < 0 || fromIndex >= customScenes.length ||
            toIndex < 0 || toIndex >= customScenes.length ||
            fromIndex === toIndex) {
            console.warn('Invalid move operation:', { fromIndex, toIndex, totalScenes: customScenes.length });
            return;
        }

        console.log(`Moving scene from index ${fromIndex} to ${toIndex}`);

        setCustomScenes(prev => {
            const newScenes = [...prev];

            // Log the scene being moved (for debugging)
            const sceneToMove = newScenes[fromIndex];
            console.log('Scene being moved:', {
                id: sceneToMove.id,
                title: sceneToMove.title,
                hasImage: !!sceneToMove.imageUrl,
                imageUrl: sceneToMove.imageUrl ? sceneToMove.imageUrl.substring(0, 50) + '...' : 'No image'
            });

            // Remove the scene from its current position
            const [movedScene] = newScenes.splice(fromIndex, 1);

            // Insert it at the new position
            newScenes.splice(toIndex, 0, movedScene);

            // Log the final array for debugging
            console.log('Scenes after move:', newScenes.map((scene, index) => ({
                index,
                id: scene.id,
                title: scene.title.substring(0, 30) + '...',
                hasImage: !!scene.imageUrl
            })));

            return newScenes;
        });

        // Reset editing state if we're moving the currently edited scene
        if (editingSceneIndex === fromIndex) {
            setEditingSceneIndex(toIndex);
        } else if (editingSceneIndex === toIndex) {
            setEditingSceneIndex(fromIndex);
        } else if (editingSceneIndex > fromIndex && editingSceneIndex <= toIndex) {
            setEditingSceneIndex(editingSceneIndex - 1);
        } else if (editingSceneIndex < fromIndex && editingSceneIndex >= toIndex) {
            setEditingSceneIndex(editingSceneIndex + 1);
        }
    };

    const uploadImageForScene = async (file, sceneIndex = null) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        setUploadingImage(true);
        try {
            const imageUrl = await uploadToCloudinary(file, 'custom-scene-images');
            console.log(`Image uploaded successfully for scene ${sceneIndex}:`, imageUrl);

            if (sceneIndex !== null) {
                updateSceneImage(sceneIndex, imageUrl);
            } else {
                setNewScene(prev => ({ ...prev, imageUrl }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploadingImage(false);
        }
    };

    const updateSceneImage = (sceneIndex, imageUrl) => {
        setCustomScenes(prev => prev.map((scene, i) =>
            i === sceneIndex ? { ...scene, imageUrl, isCustom: true } : scene
        ));

        // If we're currently editing this scene, also update the editing state
        if (editingSceneIndex === sceneIndex) {
            // This will trigger the useEffect in SceneEditor to update editedScene
            console.log(`Updated image for scene ${sceneIndex}, currently editing`);
        }
    };

    const generateImageForScene = async (prompt, sceneIndex = null) => {
        if (!prompt.trim()) {
            alert('Please provide an image prompt');
            return;
        }

        setGeneratingImage(true);
        try {
            const response = await generateImage({ Prompt: prompt.trim() });
            const imageUrl = response.data.imageUrl || response.data.url;

            if (imageUrl) {
                console.log(`Image generated successfully for scene ${sceneIndex}:`, imageUrl);
                if (sceneIndex !== null) {
                    updateSceneImage(sceneIndex, imageUrl);
                } else {
                    setNewScene(prev => ({ ...prev, imageUrl }));
                }
            } else {
                throw new Error('No image URL returned');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            setGeneratingImage(false);
        }
    };

    // Helper function to get scene info for debugging
    const getSceneInfo = () => {
        return customScenes.map((scene, index) => ({
            index,
            id: scene.id,
            title: scene.title.substring(0, 30) + '...',
            hasImage: !!scene.imageUrl,
            isCustom: scene.isCustom
        }));
    };

    return {
        customScenes,
        editingSceneIndex,
        isAddingScene,
        newScene,
        setNewScene,
        uploadingImage,
        generatingImage,
        addNewScene,
        saveNewScene,
        cancelNewScene,
        editScene,
        saveEditedScene,
        deleteScene,
        moveScene,
        uploadImageForScene,
        generateImageForScene,
        getSceneInfo, // Add this for debugging
    };
};