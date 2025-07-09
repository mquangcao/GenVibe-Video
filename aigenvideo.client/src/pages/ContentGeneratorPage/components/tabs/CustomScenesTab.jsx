import React from 'react';
import {
    FaImages,
    FaPlus,
    FaSave,
    FaTimes,
    FaUpload,
} from 'react-icons/fa';

const CustomScenesTab = ({
    customScenes,
    isAddingScene,
    newScene,
    setNewScene,
    addNewScene,
    saveNewScene,
    cancelNewScene,
    uploadingImage,
    generatingImage,
    uploadImageForScene,
    generateImageForScene,
}) => {
    return (
        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-200">Custom Scenes</h3>
                <button
                    onClick={addNewScene}
                    disabled={isAddingScene}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 disabled:bg-slate-600"
                >
                    <FaPlus size={12} />
                    Add Scene
                </button>
            </div>

            {customScenes.length === 0 && !isAddingScene && (
                <div className="text-center text-slate-400 py-8">
                    <FaImages size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No custom scenes yet. Add your first scene to get started!</p>
                </div>
            )}

            {/* Add new scene form */}
            {isAddingScene && (
                <div className="bg-slate-800 p-5 rounded-xl shadow-lg border border-green-400">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-bold text-white">Adding New Scene</h4>
                        <div className="flex gap-2">
                            <button
                                onClick={saveNewScene}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center gap-1"
                            >
                                <FaSave size={12} />
                                Save
                            </button>
                            <button
                                onClick={cancelNewScene}
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
                        {newScene.imageUrl && (
                            <img
                                src={newScene.imageUrl}
                                alt="Scene preview"
                                crossOrigin="anonymous"
                                className="w-full h-32 object-cover rounded-lg border border-slate-600 mb-2"
                            />
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => document.getElementById('newSceneImageUpload').click()}
                                disabled={uploadingImage}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1 disabled:bg-slate-600"
                            >
                                <FaUpload size={12} />
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </button>
                            <button
                                onClick={() => generateImageForScene(newScene.title)}
                                disabled={generatingImage || !newScene.title.trim()}
                                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center gap-1 disabled:bg-slate-600"
                            >
                                <FaImages size={12} />
                                {generatingImage ? 'Generating...' : 'Generate Image'}
                            </button>
                        </div>
                        <input
                            id="newSceneImageUpload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    uploadImageForScene(file);
                                }
                            }}
                            className="hidden"
                        />
                    </div>

                    {/* Image Prompt */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Image Prompt</label>
                        <textarea
                            value={newScene.title}
                            onChange={(e) => setNewScene(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-20 resize-none"
                            placeholder="Describe the image you want to generate..."
                        />
                    </div>

                    {/* Summary */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Content (Audio & Subtitle Text)</label>
                        <textarea
                            value={newScene.summary}
                            onChange={(e) => setNewScene(prev => ({ ...prev, summary: e.target.value }))}
                            className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-24 resize-none"
                            placeholder="Enter the narration text for this scene..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomScenesTab;