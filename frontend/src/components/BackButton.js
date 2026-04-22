import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-cyan-400 transition-all border border-slate-700/50 w-fit"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      <span className="text-sm font-medium">Go Back</span>
    </button>
  );
};

export default BackButton;
