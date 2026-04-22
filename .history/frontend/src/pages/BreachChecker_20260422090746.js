import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const BreachChecker = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validateEmail = (value) => {
    const cleaned = value.trim();
    if (!cleaned) return 'Email cannot be empty';
    if (!EMAIL_REGEX.test(cleaned)) return 'Enter a valid email address';
    return '';
  };

  const handleCheck = async (e) => {
    e.preventDefault();

    const cleanedEmail = email.trim();
    if (!cleanedEmail) {
      setError('Email cannot be empty');
      setResult(null);
      return;
    }

    if (!EMAIL_REGEX.test(cleanedEmail)) {
      setError('Enter a valid email address');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const response = await scanAPI.breachCheck(cleanedEmail);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch breach data');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEmail('');
    setResult(null);
    setError('');
    setLoading(false);
    setCopied(false);
  };

  const handleCopyReport = async () => {
    if (!result) return;

    const lines = [
      'CyberShield AI - Breach Checker Report',
      `Email: ${result.email}`,
      `Breached: ${result.breached ? 'Yes' : 'No'}`,
      `Breach Count: ${result.breachCount}`,
      `Risk Level: ${result.riskLevel}`,
      `Score: ${result.score}/100`
    ];

    if (result.breaches?.length) {
      lines.push('Breach Details:');
      result.breaches.forEach((breach) => {
        lines.push(`- ${breach.name} (${breach.date}) | Data Exposed: ${(breach.dataExposed || []).join(', ')}`);
      });
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
  const isInitialState = !email.trim() && !result && !error;

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldCheckIcon className="h-10 w-10 text-cyan-400" />
          Breach Checker
        </h1>
        <p className="text-slate-400">Check if an email appears in known breach datasets</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700"
      >
        <form onSubmit={handleCheck} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(value) => {
              setEmail(value);
              if (error) setError('');
            }}
            onBlur={() => {
              const validationError = validateEmail(email);
              if (validationError) setError(validationError);
            }}
            error={error}
          />

          {loading && (
            <div className="space-y-2">
              <p className="text-cyan-400 text-sm">Checking breach datasets...</p>
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
            <Button variant="primary" size="lg" loading={loading} type="submit" className="w-full" disabled={loading}>
              Check Breaches
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

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Analysis Result</h2>
              <p className={`text-xl font-bold ${riskColor[currentRisk] || 'text-slate-300'}`}>{currentRisk}</p>
            </div>

            <ResultCard title="Email Summary" risk={currentRisk}>
              <p><strong>Email:</strong> {result.email}</p>
              <p><strong>Breach Count:</strong> {result.breachCount}</p>
              <p><strong>Status:</strong> {result.breached ? 'Exposed in breach datasets' : 'No exposure found'}</p>
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

            <ResultCard title="Breach Details" risk={currentRisk}>
              {result.breaches?.length ? (
                <div className="space-y-3">
                  {result.breaches.map((breach, idx) => (
                    <div key={`${breach.name}-${idx}`} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-white font-semibold">{breach.name}</p>
                      <p className="text-slate-300 text-sm">Date: {breach.date}</p>
                      <p className="text-slate-300 text-sm">Data Exposed: {(breach.dataExposed || []).join(', ')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-300">No breaches found</p>
              )}
            </ResultCard>

            <ResultCard title="Indicators" risk={currentRisk}>
              {result.indicators?.length ? (
                <ul className="space-y-1">
                  {result.indicators.map((indicator, idx) => (
                    <li key={`${indicator}-${idx}`} className="text-slate-200">• {indicator}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-300">No indicators available.</p>
              )}
            </ResultCard>

            <ResultCard title="Security Tips" risk={currentRisk}>
              <ul className="space-y-1">
                {(result.securityTips || []).map((tip, idx) => (
                  <li key={`${tip}-${idx}`} className="text-slate-200">• {tip}</li>
                ))}
              </ul>
            </ResultCard>

            <div className="flex justify-end">
              <Button variant="secondary" size="md" type="button" icon={ClipboardDocumentIcon} onClick={handleCopyReport}>
                {copied ? 'Copied' : 'Copy Report'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BreachChecker;
