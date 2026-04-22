import React from 'react';
import { Bars3Icon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const TopNavbar = ({ toggleSidebar }) => {
  const { user } = useAuth();
  
  return (
    <nav className="glass sticky top-0 z-30 flex w-full items-center justify-between border-b border-slate-700/50 bg-slate-900/60 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-cyan-400 hover:bg-slate-800 transition-colors"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="h-6 w-6 text-cyan-500" />
          <span className="hidden sm:block text-lg font-bold text-white">CyberShield</span>
        </div>
      </div>
      
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-white font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;
