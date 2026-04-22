import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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

const validateSender = (value) => {
  const cleaned = value.trim();
  if (!cleaned) return 'Enter a valid email address';
  if (!EMAIL_REGEX.test(cleaned)) return 'Enter a valid email address';
  return '';
};

const normalizeDomain = (value) => (value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

const calculateSeverity = (score) => {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  return 'HIGH';
};

const EmailAnalyzer = () => {
  const [sender, setSender] = useState('');
  const [domain, setDomain] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    const senderError = validateSender(sender);
    if (senderError) {
      setError(senderError);
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const response = await scanAPI.scanEmail(sender.trim(), normalizeDomain(domain), content.trim());
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to analyze email');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSender('');
    setDomain('');
    setContent('');
    setResult(null);
    setError('');
    setLoading(false);
    setCopied(false);
  };

  const handleCopyReport = async () => {
    if (!result) return;

    const lines = [
      'CyberShield AI - Email Analyzer Report',
      `Sender Email: ${result.senderEmail || sender || 'Unknown'}`,
      `Sender Domain: ${result.senderDomain || 'Unknown'}`,
      `Expected Domain: ${result.expectedDomain || 'Not provided'}`,
      `Risk Level: ${result.riskLevel || 'LOW'}`,
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
  const isInitialState = !sender.trim() && !domain.trim() && !content.trim() && !result && !error;
  const resultDomain = result?.senderDomain || sender.split('@')[1] || 'Unknown';

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <EnvelopeIcon className="h-10 w-10 text-cyan-400" />
          Email Analyzer
        </h1>
        <p className="text-slate-400">Detect spoofing and phishing patterns in email data</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <InputField
            label="Sender Email"
            type="email"
            placeholder="alerts@example.com"
            value={sender}
            onChange={(value) => {
              setSender(value);
              if (error) setError('');
            }}
            onBlur={() => {
              const validationError = validateSender(sender);
              if (validationError) setError(validationError);
            }}
            error={error}
          />
          <InputField
            label="Expected Domain (optional)"
            placeholder="example.com"
            value={domain}
            onChange={(value) => setDomain(value)}
          />
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email Content (optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious email content"
              className={`w-full min-h-32 glass px-4 py-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${error ? 'border border-red-500 focus:ring-red-500' : 'border border-slate-700 focus:ring-cyan-500'}`}
            />
          </div>

          {loading && (
            <div className="space-y-2">
              <p className="text-cyan-400 text-sm">Analyzing email...</p>
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
            <Button variant="primary" size="lg" loading={loading} className="w-full" type="submit" disabled={loading}>
              Analyze Email
            </Button>
            <Button variant="outline" size="lg" type="button" icon={XMarkIcon} className="w-full" onClick={handleClear} disabled={loading || isInitialState}>
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

            <ResultCard title="Email Summary" risk={currentRisk}>
              <p><strong>Sender:</strong> {result.senderEmail || sender}</p>
              <p><strong>Domain:</strong> {resultDomain}</p>
              <p><strong>Expected Domain:</strong> {result.expectedDomain || 'Not provided'}</p>
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
                <p className="text-slate-300">No suspicious indicators found.</p>
              )}
            </ResultCard>

            <ResultCard title="Security Tips" risk={currentRisk}>
              <ul className="space-y-1">
                {(result.securityTips || []).map((tip, index) => (
                  <li key={`${tip}-${index}`} className="text-slate-200">• {tip}</li>
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

export default EmailAnalyzer;
