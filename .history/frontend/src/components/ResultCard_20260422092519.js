import React from 'react';
import { motion } from 'framer-motion';

const ResultCard = ({ title, children, risk, icon: Icon }) => {
  const normalizedRisk = String(risk || 'Unknown').toLowerCase();
  const riskColors = {
    'Low': 'border-green-500/50',
    'Medium': 'border-yellow-500/50',
    'High': 'border-red-500/50',
    'Critical': 'border-purple-500/50',
    'Unknown': 'border-slate-500/50',
    'low': 'border-green-500/50',
    'medium': 'border-yellow-500/50',
    'high': 'border-red-500/50',
    'critical': 'border-purple-500/50',
    'unknown': 'border-slate-500/50'
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-xl p-6 border ${riskColors[risk] || riskColors[normalizedRisk] || 'border-slate-600/50'} backdrop-blur-md`}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <Icon className="h-6 w-6 text-cyan-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
          <div className="space-y-2 text-slate-300">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;
