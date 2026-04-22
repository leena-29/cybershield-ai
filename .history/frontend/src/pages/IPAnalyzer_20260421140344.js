import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SignalIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const IPAnalyzer = () => {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!ip) return;

    setLoading(true);
    setError('');
    try {
      const response = await scanAPI.scanIP(ip);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not analyze IP');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <SignalIcon className="h-10 w-10 text-cyan-400" />
          IP Analyzer
        </h1>
        <p className="text-slate-400">Analyze IP metadata and reputation signals</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <InputField
            label="IP Address"
            placeholder="8.8.8.8"
            value={ip}
            onChange={setIp}
          />
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            Analyze IP
          </Button>
        </form>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </motion.div>

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">IP Analysis</h2>
              <RiskBadge risk={result.overall_risk || result.risk || 'Unknown'} size="lg" />
            </div>

            {result.valid === false ? (
              <ResultCard title="Validation" risk="High">
                <p>{result.error}</p>
              </ResultCard>
            ) : (
              <>
                {result.info && (
                  <ResultCard title="IP Information" risk="Low">
                    <p><strong>IP:</strong> {result.info.ip}</p>
                    <p><strong>Country:</strong> {result.info.country}</p>
                    <p><strong>City:</strong> {result.info.city}</p>
                    <p><strong>ISP:</strong> {result.info.isp}</p>
                  </ResultCard>
                )}
                {result.reputation && (
                  <ResultCard title="Reputation" risk={result.reputation.risk || 'Unknown'}>
                    <p><strong>Score:</strong> {result.reputation.reputation_score}</p>
                    <p><strong>Blacklisted:</strong> {result.reputation.blacklisted ? 'Yes' : 'No'}</p>
                    {result.reputation.threats?.length > 0 && (
                      <p><strong>Threats:</strong> {result.reputation.threats.join(', ')}</p>
                    )}
                  </ResultCard>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IPAnalyzer;
