// src/pages/AIVideoGeneratorPage/AIVideoGeneratorPage.jsx
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { generateVideo, getTrendingTopics } from '@/apis'; // Các hàm API mới (cần tạo)
import { Loader2, Film } from 'lucide-react'; // Thêm icon Film

const AIVideoGeneratorPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // States for Video Generation
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState(''); // Kịch bản được AI sinh ra (tùy chọn)
  const [voice, setVoice] = useState(''); // Giọng đọc đã chọn
  const [videoStyle, setVideoStyle] = useState('informative');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [trendingTopics, setTrendingTopics] = useState([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [error, setError] = useState(null);

  const videoStyleOptions = [
    { value: 'informative', label: 'Informative & Educational' },
    { value: 'engaging', label: 'Engaging & Storytelling' },
    { value: 'funny', label: 'Funny & Entertaining' },
    { value: 'promotional', label: 'Promotional & Marketing' },
    { value: 'quicktips', label: 'Quick Tips & How-to' },
  ];

  // Mock API call for trending topics (thay thế bằng API thật)
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoadingTopics(true);
      // try {
      //   const response = await getTrendingTopics();
      //   setTrendingTopics(response.data || []);
      // } catch (err) {
      //   console.error("Failed to fetch trending topics", err);
      //   setTrendingTopics([]);
      // } finally {
      //   setIsLoadingTopics(false);
      // }
      // Mock data:
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrendingTopics([
        { id: 'trend1', name: 'AI in Daily Life' },
        { id: 'trend2', name: 'Future of Work' },
        { id: 'trend3', name: 'Sustainable Tech' },
      ]);
      setIsLoadingTopics(false);
    };
    fetchTopics();
  }, []);

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !topic.trim() && !script.trim()) {
      setError('Please provide a topic, prompt, or script for the video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl('');
    try {
      console.log("Generating video with:", { topic, prompt, script, voice, videoStyle });
      // const response = await generateVideo({
      //   prompt: prompt,
      //   script: script,
      //   topic: topic,
      //   voice: voice,
      //   style: videoStyle,
      // });
      // if (response.data && response.data.success) {
      //   setGeneratedVideoUrl(response.data.videoUrl);
      // } else {
      //   throw new Error(response.data?.message || 'Failed to generate video');
      // }

      // Mock response
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGeneratedVideoUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4');

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (selectedTopicName) => {
    setTopic(selectedTopicName);
    setPrompt(`Create a short, engaging video about "${selectedTopicName}" in a ${videoStyle} style. The video should cover key aspects and be suitable for platforms like TikTok or YouTube Shorts.`);
    setError(null);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100"> {/* Nền chính và màu chữ mặc định */}
      <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} /> {/* Truyền props cho Header */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 md:p-6 lg:p-8">
          {/* Tiêu đề trang */}
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">
              AI Video Generator
            </h1>
            <p className="mt-2 text-slate-400 max-w-xl text-center">
              Craft compelling short videos effortlessly. Input your topic or prompt, and let AI bring your vision to life.
            </p>
          </div>

          {/* Form nhập liệu chính */}
          <div className="bg-slate-800/70 border border-slate-700 p-6 md:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto space-y-6">
            {/* 1. Chọn Topic (Tùy chọn) */}
            <div>
              <label htmlFor="topicInput" className="block text-sm font-medium text-slate-300 mb-2">
                1. Start with a Topic <span className="text-xs text-slate-400">(Optional, or choose from trends)</span>
              </label>
              <Input
                id="topicInput"
                type="text"
                placeholder="e.g., The Impact of AI on Creativity"
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setError(null); }}
                className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500 focus:border-purple-500"
              />
              {isLoadingTopics && <p className="text-sm text-slate-400 mt-2">Loading trending topics...</p>}
              {!isLoadingTopics && trendingTopics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {trendingTopics.map(t => (
                    <Button
                      key={t.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleTopicSelect(t.name)}
                      className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300 hover:text-slate-100"
                    >
                      {t.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Nhập Prompt hoặc Kịch bản */}
            <div>
              <label htmlFor="promptInput" className="block text-sm font-medium text-slate-300 mb-2">
                2. Describe Your Video (Prompt)
              </label>
              <textarea // Component Textarea của bạn
                id="promptInput"
                placeholder="Detail your video idea. e.g., 'A 30-second explainer on quantum entanglement, use a friendly voice and simple animations. Include a call to action to learn more.'"
                value={prompt}
                onChange={(e) => { setPrompt(e.target.value); setError(null);}}
                className="w-full p-3 rounded-md min-h-[120px] md:min-h-[150px] bg-slate-700 text-slate-100 border border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-400 resize-none transition"
                rows={6} // Bạn vẫn có thể đặt số dòng mặc định
              />
              <p className="mt-1 text-xs text-slate-400">The more detailed your prompt, the better the result.</p>
            </div>
            {/* TÙY CHỌN: Input cho kịch bản nếu người dùng có sẵn
            <div>
              <label htmlFor="scriptInput" className="block text-sm font-medium text-slate-300 mb-2">
                Or Paste Your Full Script (Optional)
              </label>
              <textarea id="scriptInput" value={script} onChange={(e) => setScript(e.target.value)} className="... min-h-[200px]" rows={8}/>
            </div>
            */}

            {/* 3. Chọn Style Video */}
            <div>
              <label htmlFor="videoStyle" className="block text-sm font-medium text-slate-300 mb-2">
                3. Choose Video Style
              </label>
              <Select value={videoStyle} onValueChange={setVideoStyle}>
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-100 focus:ring-purple-500 focus:border-purple-500">
                  <SelectValue placeholder="Select video style" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  {videoStyleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700 focus:bg-slate-600 cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* TÙY CHỌN: Chọn Giọng đọc (nếu tích hợp)
            <div>
              <label htmlFor="voiceSelect" className="block text-sm font-medium text-slate-300 mb-2">
                4. Choose Voice (Optional)
              </label>
              <Select value={voice} onValueChange={setVoice}> ... </Select>
            </div>
            */}

            {/* Nút Generate Video */}
            <div className="border-t border-slate-700 mt-6 pt-6 flex flex-col items-center">
              <Button
                onClick={handleGenerateVideo}
                disabled={isLoading || (!prompt.trim() && !topic.trim() && !script.trim())}
                size="lg"
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-sky-500 hover:from-purple-700 hover:to-sky-600 text-white shadow-lg transform transition hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Crafting Your Video...
                  </>
                ) : (
                  <>
                    🚀 Generate Video
                  </>
                )}
              </Button>
              {isLoading && <p className="text-sm text-slate-400 mt-3">Video generation can take up to a minute. Please wait...</p>}
            </div>
          </div>

          {/* Hiển thị lỗi */}
          {error && (
            <div className="max-w-3xl mx-auto mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Oops! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Hiển thị Video đã tạo */}
          {generatedVideoUrl && !isLoading && (
            <div className="mt-10 max-w-3xl mx-auto bg-slate-800/70 border border-slate-700 p-5 md:p-6 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-semibold text-sky-400 mb-5 text-center">Your Masterpiece is Ready!</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
                <video controls src={generatedVideoUrl} className="w-full h-full">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedVideoUrl;
                    link.download = `ai_generated_video_${new Date().getTime()}.mp4`; // Tên file download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  variant="outline"
                  size="lg"
                  className="bg-sky-600 hover:bg-sky-700 border-sky-500 text-white"
                >
                  Download Video
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AIVideoGeneratorPage;