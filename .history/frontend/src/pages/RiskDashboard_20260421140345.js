import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { historyAPI, scanAPI } from '../services/api';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const SCAN_TYPES = ['password', 'website', 'phishing', 'domain', 'breach'];

const RiskDashboard = () => {
  const [latestByType, setLatestByType] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRiskData = async () => {
    setLoading(true);
    setError('');

    try {
      const scansRes = await historyAPI.getScans(100, 0);
      const scans = scansRes.data.scans || [];

      const byType = {};
      for (const type of SCAN_TYPES) {
        const found = scans.find((scan) => scan.scan_type === type && scan.result);
        if (found) byType[type] = found.result;
      }

      setLatestByType(byType);

      if (Object.keys(byType).length === 0) {
        setSummary(null);
        setLoading(false);
        return;
      }

      const riskRes = await scanAPI.riskAnalysis(byType);
      setSummary(riskRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load risk dashboard data');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiskData();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <ChartBarIcon className="h-10 w-10 text-cyan-400" />
          Risk Dashboard
        </h1>
        <p className="text-slate-400">Unified risk based on your latest scan results</p>
      </motion.div>

      <div className="glass rounded-xl p-6 border border-slate-700">
        <Button variant="secondary" onClick={loadRiskData} loading={loading}>
          Refresh Risk Score
        </Button>
        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>

      {loading ? (
        <div className="glass rounded-xl p-8 border border-slate-700">
          <p className="text-slate-400">Loading risk data...</p>
        </div>
      ) : !summary ? (
        <div className="glass rounded-xl p-8 border border-slate-700">
          <p className="text-slate-400">No scan data yet. Run password, website, phishing, domain, or breach scans first.</p>
        </div>
      ) : (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="glass rounded-xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-white">Unified Risk Score</h2>
              <RiskBadge risk={summary.unified_score?.risk || 'Unknown'} size="lg" />
            </div>
            <p className="text-cyan-400 text-4xl font-bold">{summary.unified_score?.score ?? 0}/100</p>
          </div>

          <ResultCard title="Alert" risk={summary.alert?.severity === 'CRITICAL' ? 'Critical' : summary.alert?.severity === 'HIGH' ? 'High' : summary.unified_score?.risk || 'Unknown'}>
            <p>{summary.alert?.message}</p>
            {summary.alert?.actions?.length > 0 && (
              <div className="mt-2">
                {summary.alert.actions.map((action, idx) => (
                  <p key={idx}>- {action}</p>
                ))}
              </div>
            )}
          </ResultCard>

          <ResultCard title="Recommendations" risk="Medium">
            {summary.recommendations?.length > 0 ? (
              summary.recommendations.map((item, idx) => <p key={idx}>- {item}</p>)
            ) : (
              <p>No additional recommendations.</p>
            )}
          </ResultCard>

          <ResultCard title="Latest Scan Inputs" risk="Low">
            {Object.keys(latestByType).map((type) => {
              const risk = latestByType[type]?.overall_risk || latestByType[type]?.risk || 'Unknown';
              return <p key={type}><strong>{type}:</strong> {risk}</p>;
            })}
          </ResultCard>
        </motion.div>
      )}
    </div>
  );
};

export default RiskDashboard;
