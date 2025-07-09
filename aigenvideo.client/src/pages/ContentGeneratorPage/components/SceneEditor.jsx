import React, { useState, useRef, useEffect } from 'react';
import {
    FaImages,
    FaMicrophone,
    FaClosedCaptioning,
    FaEdit,
    FaTrash,
    FaArrowUp,
    FaArrowDown,
    FaSave,
    FaTimes,
    FaUpload,
} from 'react-icons/fa';

const SceneEditor = ({
    scene,
    index,
    isEditing,
    onSave,
    onCancel,
    onEdit,
    onDelete,
    onMove,
    totalScenes,
    subtitleSettings,
    uploadingImage,
    generatingImage,
    onImageUpload,
    onImageGenerate
}) => {
    const [editedScene, setEditedScene] = useState(scene);
    const fileInputRef = useRef(null);

    // **FIX: Sync editedScene with scene prop changes**
    useEffect(() => {
        console.log('Scene prop changed:', {
            sceneId: scene.id,
            hasImageUrl: !!scene.imageUrl,
            imageUrl: scene.imageUrl ? scene.imageUrl.substring(0, 50) + '...' : 'No image'
        });
        setEditedScene(scene);
    }, [scene]);

    const handleSave = () => {
        if (!editedScene.title.trim() || !editedScene.summary.trim()) {
            alert('Please fill in both image prompt and summary fields');
            return;
        }
        onSave(index, editedScene);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Uploading image for scene at index:', index);
            onImageUpload(file, index);
        }
    };

    const handleGenerateImage = () => {
        console.log('Generating image for scene at index:', index, 'with prompt:', editedScene.title);
        onImageGenerate(editedScene.title, index);
    };

    // Handle move up (decrease index)
    const handleMoveUp = () => {
        if (index > 0) {
            console.log(`Moving scene ${index} up to ${index - 1}`);
            onMove(index, index - 1);
        }
    };

    // Handle move down (increase index)
    const handleMoveDown = () => {
        if (index < totalScenes - 1) {
            console.log(`Moving scene ${index} down to ${index + 1}`);
            onMove(index, index + 1);
        }
    };

    if (!isEditing) {
        return (
            <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-bold text-white">Scene {index + 1}</h4>
                    <div className="flex gap-2">
                        <button
                            onClick={handleMoveUp}
                            disabled={index === 0}
                            className="p-1 text-slate-400 hover:text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                        >
                            <FaArrowUp size={12} />
                        </button>
                        <button
                            onClick={handleMoveDown}
                            disabled={index === totalScenes - 1}
                            className="p-1 text-slate-400 hover:text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                        >
                            <FaArrowDown size={12} />
                        </button>
                        <button
                            onClick={() => onEdit(index)}
                            className="p-1 text-slate-400 hover:text-sky-400 transition-colors"
                            title="Edit scene"
                        >
                            <FaEdit size={14} />
                        </button>
                        <button
                            onClick={() => onDelete(index)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete scene"
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>
                </div>

                {/* Scene Image */}
                {scene.imageUrl ? (
                    <div className="mb-4">
                        <img
                            src={scene.imageUrl}
                            alt={`Scene ${index + 1}`}
                            crossOrigin="anonymous"
                            className="w-full h-32 object-cover rounded-lg border border-slate-600"
                            onError={(e) => {
                                console.error('Failed to load image:', scene.imageUrl);
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                ) : (
                    <div className="mb-4 p-4 border-2 border-dashed border-yellow-500 rounded-lg bg-yellow-500/10">
                        <div className="text-center text-yellow-400">
                            <FaImages size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No image assigned to this scene</p>
                            <p className="text-xs mt-1">Click edit to add or generate an image</p>
                        </div>
                    </div>
                )}

                {/* Image Prompt (Title) */}
                <div className="mb-4 bg-slate-900/50 p-4 rounded-lg border-l-4 border-sky-400">
                    <div className="flex items-center gap-3 text-sky-400 mb-2">
                        <FaImages size={12} />
                        <h5 className="text-sm font-semibold">Image Prompt</h5>
                    </div>
                    <p className="text-slate-100 font-mono text-sm leading-relaxed">{scene.title}</p>
                </div>

                {/* Narration (Summary) */}
                <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-center gap-3 text-purple-400 mb-2">
                        <FaMicrophone size={12} />
                        <h5 className="text-sm font-semibold">Content (Audio & Subtitle Text)</h5>
                        {subtitleSettings?.enabled && (
                            <div className="flex items-center gap-1">
                                <FaClosedCaptioning className="text-purple-400" size={12} title="Will be used as subtitles" />
                                <div
                                    className="w-3 h-3 rounded border border-purple-400"
                                    style={{ backgroundColor: subtitleSettings.fontColor }}
                                    title={`Text: ${subtitleSettings.fontColor}`}
                                />
                                <div
                                    className="w-3 h-3 rounded border border-purple-400"
                                    style={{ backgroundColor: subtitleSettings.backgroundColor }}
                                    title={`Background: ${subtitleSettings.backgroundColor}`}
                                />
                            </div>
                        )}
                    </div>
                    <p className="text-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">{scene.summary}</p>
                </div>

                {scene.isCustom && (
                    <div className="mt-2 text-xs text-sky-400 flex items-center gap-1">
                        <FaEdit size={10} />
                        <span>Custom Scene</span>
                    </div>
                )}

            </div>
        );
    }

    // Editing mode
    return (
        <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-sky-400">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-bold text-white">Editing Scene {index + 1}</h4>
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
                    >
                        <FaSave size={12} />
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm flex items-center gap-1"
                    >
                        <FaTimes size={12} />
                        Cancel
                    </button>
                </div>
            </div>

            {/* Image Section */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Scene Image</label>
                {/* **FIX: Use scene.imageUrl instead of editedScene.imageUrl for display** */}
                {scene.imageUrl && (
                    <img
                        src={scene.imageUrl}
                        alt="Scene preview"
                        crossOrigin="anonymous"
                        className="w-full h-32 object-cover rounded-lg border border-slate-600 mb-2"
                        onError={(e) => {
                            console.error('Failed to load scene image in edit mode:', scene.imageUrl);
                        }}
                    />
                )}

                {/* Show placeholder if no image */}
                {!scene.imageUrl && (
                    <div className="w-full h-32 bg-slate-700 border-2 border-dashed border-slate-500 rounded-lg flex items-center justify-center mb-2">
                        <div className="text-center text-slate-400">
                            <FaImages size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No image yet</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 disabled:bg-slate-600"
                    >
                        <FaUpload size={12} />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <button
                        onClick={handleGenerateImage}
                        disabled={generatingImage || !editedScene.title.trim()}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center gap-1 disabled:bg-slate-600"
                    >
                        <FaImages size={12} />
                        {generatingImage ? 'Generating...' : 'Generate Image'}
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
            </div>

            {/* Image Prompt */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Image Prompt</label>
                <textarea
                    value={editedScene.title}
                    onChange={(e) => setEditedScene(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-20 resize-none"
                    placeholder="Describe the image you want to generate..."
                />
            </div>

            {/* Summary */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Content (Audio & Subtitle Text)</label>
                <textarea
                    value={editedScene.summary}
                    onChange={(e) => setEditedScene(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-24 resize-none"
                    placeholder="Enter the narration text for this scene..."
                />
            </div>
        </div>
    );
};

export default SceneEditor;