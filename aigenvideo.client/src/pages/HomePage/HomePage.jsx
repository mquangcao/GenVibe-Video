import React, { useState } from 'react';
import { Header } from '@/components/Layouts/Header';
import { SideBar } from '@/components/Layouts/SideBar';
import AI1 from '@/assets/AI1.png';
import AI2 from '@/assets/AI2.png';
import AI3 from '@/assets/AI3.png';
import AI4 from '@/assets/AI4.png';
import { Sparkles } from 'lucide-react';
function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const aiImages = [
    { id: 1, src: AI1, prompt: 'A futuristic cityscape at dusk' },
    { id: 2, src: AI2, prompt: 'Neon skyscrapers and flying cars' },
    { id: 3, src: AI3, prompt: 'A lively digital metropolis' },
    { id: 4, src: AI4, prompt: 'Abstract art with vibrant colors' },
    // Thêm các ảnh khác ở đây
  ];

  return (
    <div className="flex h-screen bg-gray-800">
      <SideBar isOpen={isSidebarOpen} toggleSideBar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-0 md:p-6">
          <section
            className="relative min-h-[300px] md:min-h-[400px] lg:min-h-[500px] flex flex-col items-center justify-center text-center text-white p-4 md:rounded-lg mb-10 animate-custom-slow-zoom-in"
            style={{
              backgroundImage: `url(${AI4})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Lớp phủ tối màu để chữ dễ đọc hơn (tùy chọn) */}
            <div className="absolute inset-0 bg-black opacity-60 mb:rounded-lg "></div>
            <div className="relative z-1 max-w-3xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb:3 sm:mb-4 text-white/100">
                Create Powerful AI or image in seconds
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-200/70">
                Create amazing images effortlessly with AI technology. Just share your ideas, and watch them come to life in seconds!
              </p>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg text-lg inline-flex
              items-center transistion-colors"
              >
                Generate
                <Sparkles className="ml-2 h-5 w-5" />
              </button>
            </div>
          </section>
          <section className="px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4 md:mb-6">Your Recent Creations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md: grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {aiImages.map((image) => (
                <div
                  key={image.id}
                  className="bg-slate-800 rounded-lg overflow-hidden shadow-xl group transform hover: scale-105 transistion-tranform"
                >
                  <img src={image.src} alt={image.prompt} className="w-full h-48 object-cover" />
                  <div className="p-4 ">
                    <p className="text-sm text-gray-300 truncate group-hover:whitespace-normal" title={image.prompt}>
                      {' '}
                      {image.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="h-16"></div>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
