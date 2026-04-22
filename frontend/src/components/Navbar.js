import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheckIcon, ArrowRightOnRectangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/login', label: 'Login', icon: ArrowRightOnRectangleIcon },
  { path: '/signup', label: 'Sign Up', icon: ArrowRightOnRectangleIcon }
];

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="w-full py-4 px-5 md:px-10 bg-slate-950/70 border-b border-slate-800 backdrop-blur-lg fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl shadow-lg shadow-cyan-500/10">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">CyberShield</h1>
            <p className="text-xs text-slate-400">AI security review home</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-300'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
