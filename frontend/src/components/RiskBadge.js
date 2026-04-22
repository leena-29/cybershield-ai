import React from 'react';
import { motion } from 'framer-motion';

const RiskBadge = ({ risk, size = 'md' }) => {
  const riskConfig = {
    'Low': { color: 'bg-green-500', textColor: 'text-green-50', icon: '✓' },
    'Medium': { color: 'bg-yellow-500', textColor: 'text-yellow-950', icon: '⚠' },
    'High': { color: 'bg-red-500', textColor: 'text-red-50', icon: '!' },
    'Critical': { color: 'bg-purple-500', textColor: 'text-purple-50', icon: '⛔' }
  };

  const config = riskConfig[risk] || riskConfig['Medium'];
  const sizeClass = size === 'lg' ? 'px-4 py-2 text-lg' : size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${config.color} ${config.textColor} ${sizeClass} rounded-lg font-semibold inline-flex items-center gap-2`}
    >
      <span>{config.icon}</span>
      {risk}
    </motion.div>
  );
};

export default RiskBadge;
