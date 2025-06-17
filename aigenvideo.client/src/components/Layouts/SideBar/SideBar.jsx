import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaHome, FaCreditCard, FaRobot, FaKeyboard, FaFileAlt, FaUserPlus, FaCog, FaSignOutAlt, FaVideo, FaBullhorn, FaRocket } from 'react-icons/fa';
import { ChevronsLeft, ChevronsRight, PanelLeftIcon } from 'lucide-react';

const SideBar = ({ isOpen, toggleSideBar }) => {
  return (
    <aside className={`bg-slate-700 text-white p-4 space-y-6 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Nút đóng/mở Sidebar*/}
      <div className="flex justify-end mb-4 ">
        <button
          onClick={toggleSideBar}
          className="p-2 rounded-md hover:bg-slate-600"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
        </button>
      </div>

      {/* Phần menu trên */}
      <nav className="space-y-2">
        <a href="/" className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}>
          <FaHome size={20} />
          {isOpen && <span>Home</span>}
        </a>
        <a href="#" className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}>
          <FaCreditCard size={20} />
          {isOpen && <span>Manage Subscription</span>}
        </a>
      </nav>

      {/* Phần các công cụ AI */}
      <nav className="space-y-2">
        {isOpen && <h3 className="text-xs uppercase text-gray-400 font-semibold pt-4 px-2">AI Tools</h3>}
        <a 
          href="/ai-video-generator" 
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}>
          <FaRobot size={20} />
          {isOpen && <span>AI Video Generator</span>}
        </a>
        <a
          href="/voice-generator"
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}
        >
          <FaKeyboard size={20} />
          {isOpen && <span>Voice Generate</span>}
        </a>
        <a
          href="/content-generator"
          className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}
        >
          <FaFileAlt size={20} />
          {isOpen && <span>Content Generate</span>}
        </a>
      </nav>

      {/* Phần menu dưới */}
      <nav className="space-y-2 border-t border-slate-600 pt-6 mt-6">
        <a href="#" className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}>
          <FaUserPlus size={20} />
          {isOpen && <span>Register</span>}
        </a>
        <a href="#" className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}>
          <FaCog size={20} />
          {isOpen && <span>Settings</span>}
        </a>
        <a href="#" className={`flex items-center space-x-2 p-2 rounded-md hover:bg-slate-600 ${!isOpen && 'justify-center'}`}>
          <FaSignOutAlt size={20} />
          {isOpen && <span>Log out</span>}
        </a>
      </nav>
    </aside>
  );
};

export default SideBar;
