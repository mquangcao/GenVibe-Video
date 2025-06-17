// src/pages/AIVideoGeneratorPage/AIVideoGeneratorPage.jsx
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Layouts/Header'; // Giả sử vẫn dùng chung Header
import { SideBar } from '@/components/Layouts/SideBar'; // Giả sử vẫn dùng chung SideBar
import { Input } from '@/components/ui/input'; // UI component của bạn
import { Button } from '@/components/ui/button'; // UI component của bạn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // UI component
// import { generateVideo, getTrendingTopics } from '@/apis'; // Các hàm API mới (cần tạo)
import { Textarea } from '@/components/ui/textarea'; // Thêm Textarea nếu có
import { Loader2 } from 'lucide-react'; // Icon loading

const AIVideoGeneratorPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // States for Video Generation
  const [topic, setTopic] = useState(''); // Có thể là từ khóa ban đầu
  const [prompt, setPrompt] = useState(''); // Prompt chi tiết cho video
  const [script, setScript] = useState(''); // Kịch bản được AI sinh ra (nếu có bước này)
  const [voice, setVoice] = useState(''); // Giọng đọc đã chọn (nếu tích hợp từ Voice Generator)
  const [videoStyle, setVideoStyle] = useState('informative'); // Ví dụ: informative, engaging, funny
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState('');
  const [trendingTopics, setTrendingTopics] = useState([]); // Danh sách topic gợi ý

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [error, setError] = useState(null);

  const videoStyleOptions = [
    { value: 'informative', label: 'Informative' },
    { value: 'engaging', label: 'Engaging' },
    { value: 'funny', label: 'Funny' },
    { value: 'promotional', label: 'Promotional' },
  ];

  // TODO: Fetch trending topics on component mount (nếu có API)
  // useEffect(() => {
  //   const fetchTopics = async () => {
  //     setIsLoadingTopics(true);
  //     try {
  //       // const response = await getTrendingTopics();
  //       // setTrendingTopics(response.data || []);
  //       // Mock data for now:
  //       setTrendingTopics([{ id: '1', name: 'AI in Education' }, { id: '2', name: 'Sustainable Living' }]);
  //     } catch (err) {
  //       console.error("Failed to fetch trending topics", err);
  //       setTrendingTopics([]); // Set to empty on error
  //     } finally {
  //       setIsLoadingTopics(false);
  //     }
  //   };
  //   fetchTopics();
  // }, []);

  const handleGenerateVideo = async () => {
    if (!prompt.trim() && !script.trim()) {
      setError('Please provide a prompt or a script for the video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl('');
    try {
      // const response = await generateVideo({
      //   prompt: prompt,
      //   script: script, // Nếu người dùng có thể nhập script trực tiếp
      //   topic: topic,   // Nếu topic ảnh hưởng đến video
      //   voice: voice,   // Nếu có chọn giọng
      //   style: videoStyle,
      // });
      // if (response.data && response.data.success) {
      //   setGeneratedVideoUrl(response.data.videoUrl);
      // } else {
      //   throw new Error(response.data?.message || 'Failed to generate video');
      // }

      // Mock response for now
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setGeneratedVideoUrl('https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'); // Mock URL

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (selectedTopicName) => {
    setTopic(selectedTopicName);
    // Có thể tự động điền vào prompt hoặc gợi ý prompt dựa trên topic
    setPrompt(`Create a short video about ${selectedTopicName}.`);
  };

  return (
    // Giả sử bạn dùng chung MainLayout như trong AppRoutes
    // Nếu không, bạn cần cấu trúc <div className="flex h-screen..."> như ContentGeneratorPage
    <div className="p-4 md:p-6 lg:p-8 space-y-6 text-white"> {/* Thêm text-white nếu cần */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold">AI Video Generator</h1>
        <p className="mt-2 text-slate-300">Turn your ideas into engaging short videos in minutes.</p>
      </div>

      {/* Section: Chọn Topic (Nếu có) */}
      {/* Bạn có thể làm tương tự cách ContentGeneratorPage gợi ý topic */}
      {/* Hoặc đơn giản là một input cho topic */}
      <div className="bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-xl shadow-xl space-y-4">
        <div>
          <label htmlFor="topicInput" className="block text-sm font-medium text-slate-300 mb-2">
            1. Enter a Topic (Optional, or choose from trends)
          </label>
          <Input
            id="topicInput"
            type="text"
            placeholder="e.g., The Future of Renewable Energy"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-slate-900 border-slate-600" // Thêm style nếu cần
          />
          {/* TODO: Hiển thị trending topics ở đây nếu có */}
          {isLoadingTopics && <p className="text-sm text-slate-400 mt-2">Loading trending topics...</p>}
          {/* {trendingTopics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {trendingTopics.map(t => (
                <Button key={t.id} variant="outline" size="sm" onClick={() => handleTopicSelect(t.name)}>
                  {t.name}
                </Button>
              ))}
            </div>
          )} */}
        </div>

        {/* Section: Nhập Prompt hoặc Kịch bản */}
        <div>
          <label htmlFor="promptInput" className="block text-sm font-medium text-slate-300 mb-2">
            2. Describe Your Video (Prompt)
          </label>
          <Textarea // Sử dụng component Textarea nếu có, hoặc Input với type="textarea"
            id="promptInput"
            placeholder="e.g., Create a 30-second video explaining quantum computing in simple terms, use an engaging voice and futuristic visuals."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-slate-900 border-slate-600 min-h-[100px]" // Thêm style
          />
          {/* OR/AND */}
          {/* <label htmlFor="scriptInput" className="block text-sm font-medium text-slate-300 mb-2 mt-4">
            Or Enter Your Script Directly
          </label>
          <Textarea
            id="scriptInput"
            placeholder="Paste your video script here..."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="bg-slate-900 border-slate-600 min-h-[150px]"
          /> */}
        </div>

        {/* Section: Tùy chọn Video (Ví dụ: Style, Voice) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="videoStyle" className="block text-sm font-medium text-slate-300 mb-2">
              3. Choose Video Style
            </label>
            <Select value={videoStyle} onValueChange={setVideoStyle}>
              <SelectTrigger className="w-full bg-slate-900 border-slate-600">
                <SelectValue placeholder="Select video style" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white"> {/* Style cho dropdown */}
                {videoStyleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* TODO: Thêm lựa chọn giọng đọc (Voice) nếu tích hợp */}
          {/* <div>
            <label htmlFor="voiceSelect" className="block text-sm font-medium text-slate-300 mb-2">
              4. Choose Voice (Optional)
            </label>
             <Select onValueChange={setVoice}> ... </Select>
          </div> */}
        </div>

        <div className="border-t border-slate-700 mt-6 pt-5 flex justify-end">
          <Button
            onClick={handleGenerateVideo}
            disabled={isLoading || (!prompt.trim() && !script.trim())}
            size="lg" // Kích thước lớn hơn cho nút chính
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              '🚀 Generate Video'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mt-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Section: Hiển thị Video đã tạo */}
      {generatedVideoUrl && !isLoading && (
        <div className="mt-8 bg-slate-800/50 border border-slate-700 p-5 md:p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-sky-400 mb-4">Your Generated Video:</h2>
          <div className="aspect-video"> {/* Giữ tỷ lệ khung hình cho video */}
            <video controls src={generatedVideoUrl} className="w-full h-full rounded-lg">
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => window.open(generatedVideoUrl, '_blank')} variant="outline">
              Download Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Bọc AIVideoGeneratorPage trong cấu trúc Layout chung nếu cần
// Hoặc nếu MainLayout được áp dụng qua AppRoutes thì không cần ở đây.
// Ví dụ, nếu dùng cấu trúc tương tự ContentGeneratorPage:
// const AIVideoGeneratorPageWithLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
//   return (
//     <div className="flex h-screen bg-gray-800 ">
//       <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Header />
//         <main className=" flex-1 overflow-x-hidden overflow-y-auto bg-gray-800">
//           <AIVideoGeneratorPage /> {/* Component chính ở đây */}
//         </main>
//       </div>
//     </div>
//   )
// }
// export default AIVideoGeneratorPageWithLayout;


export default AIVideoGeneratorPage; // Export component chính nếu layout được xử lý ở AppRoutes