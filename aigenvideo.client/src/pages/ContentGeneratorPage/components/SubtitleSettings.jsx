import React from 'react';

const SubtitleSettings = ({ subtitleSettings, setSubtitleSettings }) => {
    return (
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Subtitle Settings</h3>
            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="enableSubtitles"
                        checked={subtitleSettings.enabled}
                        onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                        className="mr-2"
                    />
                    <label htmlFor="enableSubtitles" className="text-xs font-medium text-slate-300">
                        Enable Subtitles
                    </label>
                </div>

                {subtitleSettings.enabled && (
                    <>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="embedSubtitles"
                                checked={subtitleSettings.embedInVideo}
                                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, embedInVideo: e.target.checked }))}
                                className="mr-2"
                            />
                            <label htmlFor="embedSubtitles" className="text-xs font-medium text-slate-300">
                                Embed in Video (Recommended)
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Font Size: {subtitleSettings.fontSize}px</label>
                            <input
                                type="range"
                                min="12"
                                max="48"
                                value={subtitleSettings.fontSize}
                                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">Position</label>
                            <select
                                value={subtitleSettings.position}
                                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, position: e.target.value }))}
                                className="w-full p-1 bg-slate-700 text-slate-200 rounded-md border border-slate-600 text-xs"
                            >
                                <option value="bottom">Bottom</option>
                                <option value="top">Top</option>
                                <option value="center">Center</option>
                            </select>
                        </div>

                        {/* Color Controls */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Text Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={subtitleSettings.fontColor}
                                        onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontColor: e.target.value }))}
                                        className="w-8 h-8 rounded border border-slate-600 cursor-pointer"
                                        title="Select text color"
                                    />
                                    <input
                                        type="text"
                                        value={subtitleSettings.fontColor}
                                        onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontColor: e.target.value }))}
                                        className="flex-1 p-1 bg-slate-700 text-slate-200 rounded border border-slate-600 text-xs font-mono"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">Background</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={subtitleSettings.backgroundColor}
                                        onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                                        className="w-8 h-8 rounded border border-slate-600 cursor-pointer"
                                        title="Select background color"
                                    />
                                    <input
                                        type="text"
                                        value={subtitleSettings.backgroundColor}
                                        onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                                        className="flex-1 p-1 bg-slate-700 text-slate-200 rounded border border-slate-600 text-xs font-mono"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="mt-3 p-2 bg-slate-900 rounded border">
                            <p className="text-xs text-slate-400 mb-2">Subtitle Preview:</p>
                            <div className="flex justify-center">
                                <div
                                    className="inline-block py-2 px-4 rounded font-bold border"
                                    style={{
                                        fontSize: `${Math.max(10, subtitleSettings.fontSize * 0.6)}px`,
                                        color: subtitleSettings.fontColor,
                                        backgroundColor: `${subtitleSettings.backgroundColor}E6`,
                                        borderColor: subtitleSettings.fontColor + '40',
                                    }}
                                >
                                    Sample subtitle text
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 text-center">
                                <span>Text: {subtitleSettings.fontColor.toUpperCase()}</span>
                                <span className="mx-2">•</span>
                                <span>Background: {subtitleSettings.backgroundColor.toUpperCase()}</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SubtitleSettings;