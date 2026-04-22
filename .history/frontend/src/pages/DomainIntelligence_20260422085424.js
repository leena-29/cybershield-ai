import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { IdentificationIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';

const normalizeInput = (value) => value.trim();

const extractDomain = (value) => {
  const trimmed = normalizeInput(value);
  if (!trimmed) return { domain: '', error: 'Domain cannot be empty' };

  let candidate = trimmed;
  if (trimmed.includes('://')) {
    try {
      candidate = new URL(trimmed).hostname || '';
    } catch {
      return { domain: '', error: 'Enter a valid domain or URL' };
    }
  }

  candidate = candidate.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!domainRegex.test(candidate)) {
    return { domain: '', error: 'Enter a valid domain or URL' };
  }

  return { domain: candidate, error: '' };
};

const riskColor = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-red-400'
};

const barColor = {
  Low: 'bg-green-500',
  Medium: 'bg-yellow-500',
  High: 'bg-red-500'
};

const DomainIntelligence = () => {
  const [domainInput, setDomainInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  const parsed = useMemo(() => extractDomain(domainInput), [domainInput]);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (parsed.error) {
      setError(parsed.error);
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await scanAPI.analyzeDomain(parsed.domain);
      const output = response.data.result;
      setResult(output);
      setRecentScans((prev) => [output, ...prev].slice(0, 5));
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.error || 'Could not analyze domain');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDomainInput('');
    setResult(null);
    setError('');
    setLoading(false);
    setRecentScans([]);
  };

  const currentRisk = result?.risk_level || 'Low';
  const currentScore = result?.score ?? 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <IdentificationIcon className="h-10 w-10 text-cyan-400" />
          Domain Intelligence
        </h1>
        <p className="text-slate-400">Analyze domain age, risk score, and suspicious indicators</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <InputField
            label="Domain or URL"
            placeholder="example.com or https://example.com"
            value={domainInput}
            onChange={(value) => {
              setDomainInput(value);
              if (error) setError('');
            }}
            onBlur={() => {
              if (extractDomain(domainInput).error) {
                setError(extractDomain(domainInput).error);
              }
            }}
            error={error}
          />

          {loading && (
            <div className="space-y-2">
              <p className="text-cyan-400 text-sm">Analyzing domain intelligence...</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="h-full bg-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="primary" size="lg" loading={loading} type="submit" className="w-full" disabled={loading || !domainInput.trim()}>
              Analyze Domain
            </Button>
            <Button
              variant="outline"
              size="lg"
              type="button"
              icon={XMarkIcon}
              className="w-full"
              onClick={handleClear}
              disabled={loading && !domainInput.trim() && !result && !error && recentScans.length === 0}
            >
              Clear
            </Button>
          </div>
        </form>
      </motion.div>

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Analysis Result</h2>
              <p className={`text-xl font-bold ${riskColor[currentRisk] || 'text-slate-300'}`}>{currentRisk}</p>
            </div>

            <ResultCard title="Domain Summary" risk={currentRisk}>
              <p><strong>Domain Name:</strong> {result.domain}</p>
              <p><strong>Domain Age:</strong> {result.age_days != null ? `${result.age_days} days` : 'Unknown'}</p>
              <p><strong>Registration Date:</strong> {result.created_date || 'Unknown'}</p>
              <p><strong>Expiry Date:</strong> {result.expiry_date || 'Unknown'}</p>
              <p><strong>Blacklist Status:</strong> {result.blacklist_status || 'Unavailable'}</p>
            </ResultCard>

            <ResultCard title="Risk Score" risk={currentRisk}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Score</span>
                  <span className={riskColor[currentRisk] || 'text-slate-300'}>{currentScore}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentScore}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${barColor[currentRisk] || 'bg-slate-500'}`}
                  />
                </div>
              </div>
            </ResultCard>

            <ResultCard title="Indicators" risk={currentRisk}>
              {result.indicators?.length ? (
                <ul className="space-y-1">
                  {result.indicators.map((item, index) => (
                    <li key={`${item}-${index}`} className="text-slate-200">• {item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">No suspicious indicators found.</p>
              )}
              {result.whois_error && (
                <p className="text-yellow-300 text-sm mt-2">WHOIS note: {result.whois_error}</p>
              )}
            </ResultCard>
          </div>
        </motion.div>
      )}

      {recentScans.length > 0 && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Recent Domain Scans</h3>
          <div className="space-y-2">
            {recentScans.map((scan, idx) => (
              <div key={`${scan.domain}-${idx}`} className="flex justify-between items-center bg-slate-800/50 rounded-lg px-3 py-2">
                <span className="text-slate-200 text-sm break-all pr-3">{scan.domain}</span>
                <span className={`text-sm font-semibold ${riskColor[scan.risk_level] || 'text-slate-300'}`}>{scan.risk_level}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DomainIntelligence;
