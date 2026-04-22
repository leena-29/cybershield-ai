import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const BreachChecker = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      const response = await scanAPI.scanBreach(email);
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not check breach status');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

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
            onChange={setEmail}
          />
          <Button variant="primary" size="lg" loading={loading} className="w-full">
            Check Breaches
          </Button>
        </form>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </motion.div>

      {result && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="glass rounded-xl p-8 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Breach Result</h2>
              <RiskBadge risk={result.risk || 'Unknown'} size="lg" />
            </div>
            <ResultCard title="Exposure Status" risk={result.risk || 'Unknown'}>
              <p><strong>Breached:</strong> {result.breached ? 'Yes' : 'No'}</p>
              <p><strong>Breach count:</strong> {result.count ?? 0}</p>
              {result.breaches?.length > 0 && (
                <div>
                  <p><strong>Sources:</strong></p>
                  {result.breaches.map((item, idx) => (
                    <p key={idx}>- {item}</p>
                  ))}
                </div>
              )}
              {result.note && <p><strong>Note:</strong> {result.note}</p>}
            </ResultCard>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BreachChecker;
