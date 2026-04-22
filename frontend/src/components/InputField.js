import React from 'react';
import { motion } from 'framer-motion';

const InputField = ({ label, type = 'text', placeholder, value, onChange, error, icon: Icon, ...props }) => {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-500" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...props}
          className={`w-full glass px-4 py-3 ${Icon ? 'pl-10' : ''} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
            error ? 'border border-red-500 focus:ring-red-500' : 'border border-slate-700 focus:ring-cyan-500'
          }`}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1">
          {error}
        </p>
      )}
    </motion.div>
  );
};

export default InputField;
