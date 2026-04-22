import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IdentificationIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const DomainIntelligence = () => {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!domain) return;

    setLoading(true);
    setError('');
    try {
      const response = await scanAPI.scanDomain(domain);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not analyze domain');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <IdentificationIcon className="h-10 w-10 text-cyan-400" />
          Domain Intelligence
        </h1>
        <p className="text-slate-400">Check suspicious indicators, age hints, and blacklist risk</p>
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
            value={domain}
            onChange={setDomain}
          />
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            Analyze Domain
          </Button>
        </form>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </motion.div>

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Analysis Result</h2>
              <RiskBadge risk={result.overall_risk || 'Unknown'} size="lg" />
            </div>

            <ResultCard title="Domain" risk={result.overall_risk || 'Unknown'}>
              <p><strong>Domain:</strong> {result.domain}</p>
            </ResultCard>

            {result.suspicious && (
              <ResultCard title="Suspicious Indicators" risk={result.suspicious.risk || 'Unknown'}>
                <p><strong>Suspicious:</strong> {result.suspicious.is_suspicious ? 'Yes' : 'No'}</p>
                {result.suspicious.indicators?.map((item, idx) => (
                  <p key={idx}>- {item}</p>
                ))}
              </ResultCard>
            )}

            {result.age && (
              <ResultCard title="Domain Age" risk={result.age.age_category === 'Very New' ? 'High' : 'Low'}>
                <p><strong>Created:</strong> {result.age.created_date}</p>
                <p><strong>Age category:</strong> {result.age.age_category}</p>
                {result.age.note && <p><strong>Note:</strong> {result.age.note}</p>}
              </ResultCard>
            )}

            {result.blacklist && (
              <ResultCard title="Blacklist Check" risk={result.blacklist.risk || 'Unknown'}>
                <p><strong>Blacklisted:</strong> {result.blacklist.blacklisted ? 'Yes' : 'No'}</p>
                {result.blacklist.lists?.length > 0 && (
                  <p><strong>Lists:</strong> {result.blacklist.lists.join(', ')}</p>
                )}
              </ResultCard>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DomainIntelligence;
