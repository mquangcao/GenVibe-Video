import React, { useState } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { FaImage, FaMagic, FaDownload, FaSync, FaCog } from 'react-icons/fa';
import { imageService } from '@/apis';

function ImageGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- State for the Image Generator ---
  const [prompt, setPrompt] = useState('');

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null); // Clear previous image

    try {
      const response = await imageService.generateImage({ Prompt: prompt });
      if (response && response.data) {
        setGeneratedImage(response.data.imageUrl);
      } else {
        throw new Error('Failed to generate image. Please try again.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${prompt.slice(0, 30)}.png`; // Create a filename from the prompt
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900">
          <div className="flex h-full p-4 md:p-6 lg:p-8">
            {/* --- Left Panel: Control Panel --- */}
            <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col space-y-6 rounded-l-xl shadow-2xl border-r border-slate-700">
              <div className="flex-none">
                <h2 className="text-2xl font-bold text-white mb-2">AI Image Generator</h2>
                <p className="text-sm text-slate-400">Describe any image you can imagine.</p>
              </div>

              {/* --- Form Inputs --- */}
              <div className="flex-1 flex flex-col space-y-5 overflow-y-auto pr-2">
                <div>
                  <label htmlFor="promptInput" className="block text-sm font-medium text-slate-300 mb-4">
                    Enter your prompt
                  </label>
                  <textarea
                    id="promptInput"
                    className="w-full p-3 bg-slate-700 text-slate-100 rounded-lg border border-slate-600 h-36 resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    placeholder="e.g., A futuristic cityscape at sunset"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              </div>

              {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

              {/* --- Generate Button --- */}
              <div className="flex-none pt-4 border-t border-slate-700">
                <button
                  onClick={handleGenerateImage}
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all disabled:bg-slate-600 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                  <FaMagic />
                  {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
              </div>
            </div>

            {/* --- Right Panel: Canvas --- */}
            <div className="hidden md:flex flex-1 w-2/3 bg-gray-900 items-center justify-center p-10 text-center rounded-r-xl">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-slate-400">
                  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
                  <h3 className="text-lg font-semibold">The AI is painting your masterpiece...</h3>
                </div>
              ) : generatedImage ? (
                <div className="w-full h-full group relative">
                  <img src={generatedImage} alt={prompt} className="w-full h-full object-contain rounded-lg shadow-2xl" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-lg">
                    <button
                      onClick={handleDownloadImage}
                      className="p-4 bg-slate-700/80 hover:bg-sky-600 rounded-full text-white transition"
                      title="Download Image"
                    >
                      <FaDownload size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <FaImage className="text-7xl mb-4 text-slate-600" />
                  <h3 className="text-xl font-semibold text-slate-300">Your creations will appear here</h3>
                  <p className="text-slate-400 mt-2">Start by describing an image to bring your ideas to life.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ImageGeneratorPage;
