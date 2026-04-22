import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const EmailAnalyzer = () => {
  const [sender, setSender] = useState('');
  const [domain, setDomain] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!sender) return;

    setLoading(true);
    setError('');
    try {
      const response = await scanAPI.scanEmail(sender, domain, content);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not analyze email');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

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
            onChange={setSender}
          />
          <InputField
            label="Expected Domain (optional)"
            placeholder="example.com"
            value={domain}
            onChange={setDomain}
          />
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email Content (optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious email content"
              className="w-full min-h-32 glass px-4 py-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            Analyze Email
          </Button>
        </form>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </motion.div>

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Email Analysis</h2>
              <RiskBadge risk={result.overall_risk || 'Unknown'} size="lg" />
            </div>

            {result.error ? (
              <ResultCard title="Validation" risk="High">
                <p>{result.error}</p>
              </ResultCard>
            ) : (
              <>
                <ResultCard title="Sender" risk={result.overall_risk || 'Unknown'}>
                  <p><strong>Email:</strong> {result.sender_email}</p>
                </ResultCard>

                {result.spoofing && (
                  <ResultCard title="Spoofing Detection" risk={result.spoofing.risk || 'Unknown'}>
                    <p><strong>Spoofed:</strong> {result.spoofing.is_spoofed ? 'Possible' : 'No'}</p>
                    {result.spoofing.issues?.map((issue, idx) => (
                      <p key={idx}>- {issue}</p>
                    ))}
                  </ResultCard>
                )}

                {result.content && (
                  <ResultCard title="Content Analysis" risk={result.content.risk || 'Unknown'}>
                    <p><strong>Suspicious:</strong> {result.content.vulnerable ? 'Yes' : 'No'}</p>
                    {result.content.issues?.map((issue, idx) => (
                      <p key={idx}>- {issue}</p>
                    ))}
                  </ResultCard>
                )}

                {result.authentication && (
                  <ResultCard title="Header Authentication" risk={result.authentication.risk || 'Unknown'}>
                    <p><strong>Score:</strong> {result.authentication.score}%</p>
                    {result.authentication.authentication && Object.keys(result.authentication.authentication).length > 0 && (
                      <>
                        <p><strong>SPF:</strong> {result.authentication.authentication.SPF}</p>
                        <p><strong>DKIM:</strong> {result.authentication.authentication.DKIM}</p>
                        <p><strong>DMARC:</strong> {result.authentication.authentication.DMARC}</p>
                      </>
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

export default EmailAnalyzer;
