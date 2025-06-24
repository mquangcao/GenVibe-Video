import React from 'react';
import { FaRegBell, FaRegMoon, FaSearch, FaStar } from 'react-icons/fa';
import { HiOutlineDuplicate } from 'react-icons/hi';
import Avatar from '@/assets/user.png';

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-slate-600 h-14 px-4 shadow-md ">
      {/* Left: App Name + Icon */}
      <div className="flex items-center gap-2 text-white font-semibold text-base">
        <span>AI Genvideo</span>
        <HiOutlineDuplicate className="text-white text-lg" />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded hover:bg-indigo-500 transition-all">
          <FaStar className="text-yellow-400" />
          Upgrade
        </button>

        <button className="p-2 rounded-full hover:bg-gray-700 transition">
          <FaSearch className="text-white" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 transition">
          <FaRegBell className="text-white" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 transistion">
          <FaRegMoon className="text-white" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
          <img src={Avatar} alt="avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;
