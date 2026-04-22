import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, ChartBarIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { scanAPI, historyAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, scansRes] = await Promise.all([
          historyAPI.getStatistics(),
          historyAPI.getScans(5)
        ]);

        setStats(statsRes.data);
        setRecentScans(scansRes.data.scans);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass rounded-xl p-6 border border-slate-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-cyan-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome back! Here's your security overview.</p>
      </motion.div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClockIcon}
          label="Total Scans"
          value={stats?.total_scans || 0}
          color="text-cyan-400"
        />
        <StatCard
          icon={BoltIcon}
          label="Low Risk"
          value={stats?.risk_distribution?.Low || 0}
          color="text-green-400"
        />
        <StatCard
          icon={BoltIcon}
          label="Medium Risk"
          value={stats?.risk_distribution?.Medium || 0}
          color="text-yellow-400"
        />
        <StatCard
          icon={BoltIcon}
          label="High Risk"
          value={stats?.risk_distribution?.High || 0}
          color="text-red-400"
        />
      </div>

      {/* Recent Scans */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-xl p-6 border border-slate-700"
      >
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-cyan-400" />
          Recent Scans
        </h2>

        {recentScans.length > 0 ? (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <motion.div
                key={scan._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex-1">
                  <p className="text-white font-medium capitalize">{scan.scan_type}</p>
                  <p className="text-sm text-slate-400">{scan.target}</p>
                </div>
                <RiskBadge risk={scan.result?.overall_risk || 'Unknown'} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No scans yet. Start by analyzing something!</p>
        )}
      </motion.div>

      {/* Quick Start Guide */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-xl p-6 border border-slate-700"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Quick Start</h2>
        <p className="text-slate-400 mb-4">
          Choose a security analysis from the sidebar to get started:
        </p>
        <ul className="space-y-2 text-slate-300">
          <li>🔐 Password Analyzer - Check password strength</li>
          <li>🌐 Website Scanner - Scan for security headers</li>
          <li>⚠️ Phishing Detector - Identify phishing URLs</li>
          <li>📋 Breach Checker - Check for data breaches</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Dashboard;
