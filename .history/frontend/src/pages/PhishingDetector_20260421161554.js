import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import Button from '../components/Button';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';

const isValidUrl = (value) => {
  if (!value || !value.trim()) {
    return 'URL cannot be empty';
  }

  try {
    const parsed = new URL(value.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Enter a valid URL';
    }
    return '';
  } catch {
    return 'Enter a valid URL';
  }
};

const riskMeta = {
  Low: {
    label: 'Safe',
    icon: ShieldCheckIcon,
    badge: 'text-green-300',
    ring: 'border-green-500/40',
    bar: 'bg-green-500'
  },
  Medium: {
    label: 'Suspicious',
    icon: ExclamationTriangleIcon,
    badge: 'text-yellow-300',
    ring: 'border-yellow-500/40',
    bar: 'bg-yellow-500'
  },
  High: {
    label: 'Phishing',
    icon: XMarkIcon,
    badge: 'text-red-300',
    ring: 'border-red-500/40',
    bar: 'bg-red-500'
  }
};

const PhishingDetector = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [touched, setTouched] = useState(false);

  const validationError = useMemo(() => isValidUrl(url), [url]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setTouched(true);

    const currentError = isValidUrl(url);
    if (currentError) {
      setError(currentError);
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/phishing-detect', { url: url.trim() });
      setResult(response.data.result);
    } catch (err) {
      setResult(null);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ECONNABORTED') {
        setError('Analysis timed out. Please try again.');
      } else {
        setError('Could not analyze URL');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
    setResult(null);
    setTouched(false);
  };

  const handleUrlChange = (value) => {
    setUrl(value);
    if (error) setError('');
  };

  const effectiveError = touched && validationError ? validationError : error;
  const meta = result ? riskMeta[result.risk] || riskMeta.Medium : null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -18, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-10 w-10 text-cyan-400" />
          Phishing Detector
        </h1>
        <p className="text-slate-400">Detect suspicious URLs with secure, real-time analysis</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700 space-y-5"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <InputField
            label="URL"
            type="url"
            placeholder="Enter URL to analyze..."
            value={url}
            onChange={handleUrlChange}
            onBlur={() => setTouched(true)}
            error={effectiveError}
          />

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Analyzing URL...
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="h-full bg-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading || !url.trim()}
              type="submit"
              className="flex-1"
            >
              Detect Phishing
            </Button>

            <Button
              variant="outline"
              size="lg"
              type="button"
              onClick={handleClear}
              disabled={loading && !url}
            >
              Clear
            </Button>
          </div>
        </form>
      </motion.div>

      {result && meta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className={`glass rounded-xl p-8 border ${meta.ring} space-y-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Analysis Result</h2>
                <p className={`text-sm font-medium ${meta.badge}`}>{meta.label}</p>
              </div>
              <div className="flex items-center gap-3">
                <meta.icon className={`h-8 w-8 ${meta.badge}`} />
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Risk Level</p>
                  <p className={`text-xl font-bold ${meta.badge}`}>{result.risk}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Score</span>
                <span className={meta.badge}>{result.score}/100</span>
              </div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${meta.bar}`}
                />
              </div>
            </div>

            <ResultCard title="URL" risk={result.risk}>
              <p className="break-all text-slate-200">{result.url}</p>
            </ResultCard>

            <ResultCard title="Reasons" risk={result.risk}>
              {result.reasons?.length ? (
                <ul className="space-y-2">
                  {result.reasons.map((reason, index) => (
                    <li key={`${reason}-${index}`} className="flex gap-2 text-slate-200">
                      <span className={meta.badge}>•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">No phishing indicators detected.</p>
              )}
            </ResultCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PhishingDetector;
