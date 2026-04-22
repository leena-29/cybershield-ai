import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { historyAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import Button from '../components/Button';

const History = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchScans();
  }, [selectedType]);

  const fetchScans = async () => {
    setLoading(true);
    try {
      if (selectedType === 'all') {
        const response = await historyAPI.getScans();
        setScans(response.data.scans);
      } else {
        const response = await historyAPI.getScansByType(selectedType);
        setScans(response.data.scans);
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId) => {
    if (window.confirm('Delete this scan?')) {
      try {
        await historyAPI.deleteScan(scanId);
        setScans(scans.filter(s => s._id !== scanId));
      } catch (error) {
        console.error('Error deleting scan:', error);
      }
    }
  };

  const scanTypes = [
    { value: 'all', label: '📋 All Scans' },
    { value: 'password', label: '🔐 Password' },
    { value: 'website', label: '🌐 Website' },
    { value: 'phishing', label: '⚠️ Phishing' },
    { value: 'domain', label: '📋 Domain' },
    { value: 'breach', label: '🚨 Breach' },
    { value: 'ip', label: '📍 IP' },
    { value: 'email', label: '📧 Email' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <ClockIcon className="h-10 w-10 text-cyan-400" />
          Scan History
        </h1>
        <p className="text-slate-400">View and manage all your security scans</p>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-6 border border-slate-700"
      >
        <p className="text-slate-300 text-sm mb-3">Filter by type:</p>
        <div className="flex flex-wrap gap-2">
          {scanTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedType === type.value
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scans List */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-6 border border-slate-700"
      >
        {loading ? (
          <p className="text-slate-400">Loading scans...</p>
        ) : scans.length > 0 ? (
          <div className="space-y-3">
            {scans.map((scan) => (
              <motion.div
                key={scan._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-white capitalize">{scan.scan_type}</span>
                    <RiskBadge risk={scan.result?.overall_risk || 'Unknown'} size="sm" />
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Target: {scan.target}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(scan.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={TrashIcon}
                  onClick={() => handleDelete(scan._id)}
                >
                  Delete
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No scans found</p>
        )}
      </motion.div>
    </div>
  );
};

export default History;
