import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SignalIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';

const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:)((:[0-9A-Fa-f]{1,4}){1,6})|(:)((:[0-9A-Fa-f]{1,4}){1,7}|:)$|^fe80:(:[0-9A-Fa-f]{0,4}){0,4}%[0-9A-Za-z]{1,}$|^::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|2[0-4]\d|[0-1]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[0-1]?\d?\d)$|^([0-9A-Fa-f]{1,4}:){1,4}:((25[0-5]|2[0-4]\d|[0-1]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[0-1]?\d?\d)$/;

const riskColor = {
  LOW: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-red-400'
};

const barColor = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-red-500'
};

const securityTipsByRisk = {
  LOW: ['Safe for normal monitoring', 'Keep standard logging enabled', 'No immediate action required'],
  MEDIUM: ['Monitor traffic patterns', 'Limit sensitive access until verified', 'Use VPN for uncertain connections'],
  HIGH: ['Investigate this IP before allowing access', 'Block or restrict the IP if unexpected', 'Review security logs and alerts immediately']
};

const validateIp = (value) => {
  const cleaned = value.trim();
  if (!cleaned) return 'IP address is required';
  if (!(IPV4_REGEX.test(cleaned) || IPV6_REGEX.test(cleaned))) return 'Enter a valid IP address';
  return '';
};

const IPAnalyzer = () => {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    const validationError = validateIp(ip);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const response = await scanAPI.scanIP(ip.trim());
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch IP data');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setIp('');
    setResult(null);
    setError('');
    setLoading(false);
    setCopied(false);
  };

  const handleCopyReport = async () => {
    if (!result) return;

    const lines = [
      'CyberShield AI - IP Analyzer Report',
      `IP: ${result.ip || result.summary?.ip || 'Unknown'}`,
      `Country: ${result.country || result.summary?.country || 'Unknown'}`,
      `Region: ${result.region || result.summary?.region || 'Unknown'}`,
      `City: ${result.city || result.summary?.city || 'Unknown'}`,
      `ISP: ${result.isp || result.summary?.isp || 'Unknown'}`,
      `Risk Level: ${result.riskLevel || 'Unknown'}`,
      `Score: ${result.score ?? 0}/100`
    ];

    if (result.indicators?.length) {
      lines.push('Indicators:');
      result.indicators.forEach((indicator) => lines.push(`- ${indicator}`));
    }

    if (result.securityTips?.length) {
      lines.push('Security Tips:');
      result.securityTips.forEach((tip) => lines.push(`- ${tip}`));
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const currentRisk = result?.riskLevel || 'LOW';
  const currentScore = result?.score ?? 0;
  const summary = result?.summary || result || null;
  const isInitialState = !ip.trim() && !result && !error;

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
            onChange={(value) => {
              setIp(value);
              if (error) setError('');
            }}
            onBlur={() => {
              const validationError = validateIp(ip);
              if (validationError) setError(validationError);
            }}
            error={error}
          />

          {loading && (
            <div className="space-y-2">
              <p className="text-cyan-400 text-sm">Analyzing…</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  className="h-full bg-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Analyzing…' : 'Analyze IP'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              type="button"
              icon={XMarkIcon}
              className="w-full"
              onClick={handleClear}
              disabled={loading || isInitialState}
            >
              Clear
            </Button>
          </div>
        </form>
      </motion.div>

      {result && !error && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Analysis Result</h2>
              <p className={`text-xl font-bold ${riskColor[currentRisk] || 'text-slate-300'}`}>{currentRisk}</p>
            </div>

            <ResultCard title="IP Summary" risk={currentRisk}>
              <div className="space-y-1">
                <p><strong>IP:</strong> {summary?.ip || 'Unknown'}</p>
                <p><strong>Country:</strong> {summary?.country || 'Unknown'}</p>
                <p><strong>Region:</strong> {summary?.region || 'Unknown'}</p>
                <p><strong>City:</strong> {summary?.city || 'Unknown'}</p>
                <p><strong>ISP:</strong> {summary?.isp || 'Unknown'}</p>
              </div>
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
                  {result.indicators.map((indicator, index) => (
                    <li key={`${indicator}-${index}`} className="text-slate-200">• {indicator}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">No notable risk indicators.</p>
              )}
            </ResultCard>

            <ResultCard title="Security Tips" risk={currentRisk}>
              <ul className="space-y-1">
                {(result.securityTips || securityTipsByRisk[currentRisk] || securityTipsByRisk.LOW).map((tip, index) => (
                  <li key={`${tip}-${index}`} className="text-slate-200">• {tip}</li>
                ))}
              </ul>
            </ResultCard>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button variant="secondary" size="md" type="button" icon={ClipboardDocumentIcon} onClick={handleCopyReport} className="w-full sm:w-auto">
                {copied ? 'Copied' : 'Copy Report'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default IPAnalyzer;
