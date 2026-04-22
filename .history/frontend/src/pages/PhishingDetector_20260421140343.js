import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const PhishingDetector = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    try {
      const response = await scanAPI.scanPhishing(url);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not analyze URL');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-10 w-10 text-cyan-400" />
          Phishing Detector
        </h1>
        <p className="text-slate-400">Analyze suspicious URLs for phishing patterns</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700"
      >
        <form onSubmit={handleScan} className="space-y-4">
          <InputField
            label="URL"
            type="url"
            placeholder="https://example.com/login"
            value={url}
            onChange={setUrl}
          />
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            Detect Phishing
          </Button>
        </form>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </motion.div>

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Result</h2>
              <RiskBadge risk={result.risk || 'Unknown'} size="lg" />
            </div>
            <ResultCard title="Phishing Prediction" risk={result.risk || 'Unknown'}>
              <p><strong>URL:</strong> {result.url}</p>
              <p><strong>Detected as phishing:</strong> {result.is_phishing ? 'Yes' : 'No'}</p>
              <p><strong>Confidence:</strong> {result.confidence}%</p>
            </ResultCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PhishingDetector;
