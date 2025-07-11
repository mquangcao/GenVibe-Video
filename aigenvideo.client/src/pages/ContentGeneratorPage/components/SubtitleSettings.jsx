import React from 'react';

const SubtitleSettings = ({ subtitleSettings, setSubtitleSettings }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Subtitle Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableSubtitles"
            checked={subtitleSettings.enabled}
            onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
            className="mr-2 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
          />
          <label htmlFor="enableSubtitles" className="text-xs font-medium text-gray-700">
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
                className="mr-2 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="embedSubtitles" className="text-xs font-medium text-gray-700">
                Embed in Video (Recommended)
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Font Size: {subtitleSettings.fontSize}px</label>
              <input
                type="range"
                min="12"
                max="48"
                value={subtitleSettings.fontSize}
                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${((subtitleSettings.fontSize - 12) / 36) * 100}%, #e5e7eb ${
                    ((subtitleSettings.fontSize - 12) / 36) * 100
                  }%, #e5e7eb 100%)`,
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
              <select
                value={subtitleSettings.position}
                onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, position: e.target.value }))}
                className="w-full p-1 bg-white text-gray-900 rounded-md border border-gray-300 text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
                <option value="center">Center</option>
              </select>
            </div>

            {/* Color Controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={subtitleSettings.fontColor}
                    onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    title="Select text color"
                  />
                  <input
                    type="text"
                    value={subtitleSettings.fontColor}
                    onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, fontColor: e.target.value }))}
                    className="flex-1 p-1 bg-white text-gray-900 rounded border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={subtitleSettings.backgroundColor}
                    onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    title="Select background color"
                  />
                  <input
                    type="text"
                    value={subtitleSettings.backgroundColor}
                    onChange={(e) => setSubtitleSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 p-1 bg-white text-gray-900 rounded border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Subtitle Preview:</p>
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
              <div className="mt-2 text-xs text-gray-500 text-center">
                <span>Text: {subtitleSettings.fontColor.toUpperCase()}</span>
                <span className="mx-2">.</span>
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
