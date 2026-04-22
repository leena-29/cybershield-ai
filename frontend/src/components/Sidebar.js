import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  IdentificationIcon,
  SignalIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { path: '/password', icon: KeyIcon, label: 'Password Analyzer' },
    { path: '/website', icon: GlobeAltIcon, label: 'Website Scanner' },
    { path: '/phishing', icon: ExclamationTriangleIcon, label: 'Phishing Detector' },
    { path: '/domain', icon: IdentificationIcon, label: 'Domain Intelligence' },
    { path: '/breach', icon: ShieldCheckIcon, label: 'Breach Checker' },
    { path: '/ip', icon: SignalIcon, label: 'IP Analyzer' },
    { path: '/email', icon: EnvelopeIcon, label: 'Email Analyzer' },
    { path: '/risk', icon: ChartBarIcon, label: 'Risk Dashboard' },
    { path: '/history', icon: ClipboardDocumentListIcon, label: 'Scan History' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -330 }}
            animate={{ x: 0 }}
            exit={{ x: -330 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-80 glass border-r border-slate-600/50 p-6 flex flex-col z-50 bg-slate-900/95"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CyberShield</h1>
                  <p className="text-xs text-cyan-400">AI Security</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-cyan-400'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-medium"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
