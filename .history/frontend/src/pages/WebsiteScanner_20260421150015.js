import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { scanAPI } from '../services/api';
import InputField from '../components/InputField';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';

const WebsiteScanner = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateUrl = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Website URL cannot be empty';
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      return 'Enter a valid website URL';
    }

    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname) {
        return 'Enter a valid website URL';
      }
    } catch {
      return 'Enter a valid website URL';
    }

    return '';
  };

  const handleScan = async (e) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      setResult(null);
      setSuccessMessage('');
      return;
    }

    const sanitizedUrl = url.trim();

    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await scanAPI.scanWebsite(sanitizedUrl);
      setResult(response.data.result);

      if (response.data.result?.scannable) {
        setSuccessMessage('Scan completed successfully.');
      } else {
        setError(response.data.result?.error || 'Website could not be scanned.');
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        setError('Scan timed out. Please try again.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Unable to complete website scan. Please try again.');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (value) => {
    setUrl(value);
    if (error) {
      setError('');
    }
  };

  const recommendations = result?.recommendations || [];
  const vulnerabilities = [
    ...(result?.xss_detection?.issues || []),
    ...(result?.sql_injection?.issues || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <GlobeAltIcon className="h-10 w-10 text-cyan-400" />
          Website Security Scanner
        </h1>
        <p className="text-slate-400">Check HTTPS, SSL, security headers, and detect vulnerabilities</p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700"
      >
        <form onSubmit={handleScan} className="space-y-4">
          <InputField
            label="Website URL"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={handleUrlChange}
            onBlur={() => {
              const blurError = validateUrl(url);
              if (blurError) {
                setError(blurError);
              }
            }}
            error={error}
          />

          {successMessage && (
            <p className="text-green-400 text-sm">{successMessage}</p>
          )}

          {loading && (
            <div className="w-full">
              <p className="text-cyan-400 text-sm mb-2">Scanning website security...</p>
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

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            type="submit"
            disabled={!url.trim() || loading}
            className="w-full"
          >
            <SparklesIcon className="h-5 w-5" />
            Scan Website
          </Button>
        </form>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          {/* Overall Score */}
          <div className="glass rounded-xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Scan Results</h2>
              <RiskBadge risk={result.overall_risk} size="lg" />
            </div>

            {result.scannable ? (
              <div className="space-y-6">
                {/* Security Score */}
                <ResultCard title="Security Score" risk={result.overall_risk || 'Unknown'}>
                  <p><strong>Score:</strong> {result.security_score ?? 0}/100</p>
                  <p><strong>Risk Level:</strong> {result.overall_risk}</p>
                </ResultCard>

                {/* Reachability */}
                {result.domain_reachability && (
                  <ResultCard title="Domain Reachability" risk={result.domain_reachability.reachable ? 'Low' : 'High'}>
                    <p><strong>Reachable:</strong> {result.domain_reachability.reachable ? 'Yes' : 'No'}</p>
                    <p><strong>Status Code:</strong> {result.domain_reachability.status_code ?? 'N/A'}</p>
                    <p><strong>Response Time:</strong> {result.domain_reachability.response_time_ms ?? 'N/A'} ms</p>
                    {result.domain_reachability.final_url && (
                      <p><strong>Final URL:</strong> {result.domain_reachability.final_url}</p>
                    )}
                  </ResultCard>
                )}

                {/* HTTPS Check */}
                {result.https && (
                  <ResultCard 
                    title="HTTPS Support" 
                    risk={result.https.risk}
                  >
                    <div>
                      <p><strong>HTTPS:</strong> {result.https.supports_https ? 'Enabled' : 'Not Enabled'}</p>
                      <p><strong>Current Protocol:</strong> {result.https.is_https ? 'HTTPS' : 'HTTP'}</p>
                    </div>
                  </ResultCard>
                )}

                {/* SSL Certificate */}
                {result.ssl_certificate && (
                  <ResultCard 
                    title="SSL Certificate" 
                    risk={result.ssl_certificate.risk}
                  >
                    {result.ssl_certificate.valid ? (
                      <div className="space-y-2">
                        <p><strong>SSL:</strong> <span className="text-green-400">Valid</span></p>
                        <p><strong>Issued To:</strong> {result.ssl_certificate.issued_to}</p>
                        <p><strong>Issued By:</strong> {result.ssl_certificate.issued_by}</p>
                        <p><strong>Valid Until:</strong> {result.ssl_certificate.valid_until}</p>
                      </div>
                    ) : (
                      <p className="text-red-400">
                        ❌ Invalid: {result.ssl_certificate.error}
                      </p>
                    )}
                  </ResultCard>
                )}

                {/* Security Headers */}
                {result.security_headers && (
                  <ResultCard 
                    title="Security Headers" 
                    risk={result.security_headers.risk}
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-2">Score: {result.security_headers.score}%</p>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-cyan-500 h-2 rounded-full"
                            style={{ width: `${result.security_headers.score}%` }}
                          />
                        </div>
                      </div>
                      {result.security_headers.present.length > 0 && (
                        <div>
                          <p className="text-green-400 font-semibold">Present ({result.security_headers.present.length}):</p>
                          {result.security_headers.present.map((header, idx) => (
                            <p key={idx} className="text-green-300 text-sm ml-2">✓ {header}</p>
                          ))}
                        </div>
                      )}
                      {result.security_headers.missing.length > 0 && (
                        <div>
                          <p className="text-yellow-400 font-semibold">Missing ({result.security_headers.missing.length}):</p>
                          {result.security_headers.missing.map((header, idx) => (
                            <p key={idx} className="text-yellow-300 text-sm ml-2">✗ {header}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </ResultCard>
                )}

                {/* Vulnerability Checks */}
                {result.xss_detection && (
                  <ResultCard 
                    title="XSS Detection" 
                    risk={result.xss_detection.risk}
                  >
                    <p>{result.xss_detection.vulnerable ? '🔴 Potential XSS found' : '🟢 No XSS detected'}</p>
                    {result.xss_detection.issues.length > 0 && (
                      result.xss_detection.issues.map((issue, idx) => (
                        <p key={idx} className="text-yellow-400 text-sm">• {issue}</p>
                      ))
                    )}
                  </ResultCard>
                )}

                {result.sql_injection && (
                  <ResultCard title="SQL Injection Indicators" risk={result.sql_injection.risk}>
                    <p>{result.sql_injection.vulnerable ? 'Potential SQL indicators found' : 'No SQL indicators detected'}</p>
                    {result.sql_injection.issues.length > 0 && (
                      result.sql_injection.issues.map((issue, idx) => (
                        <p key={idx} className="text-yellow-400 text-sm">• {issue}</p>
                      ))
                    )}
                  </ResultCard>
                )}

                {vulnerabilities.length > 0 && (
                  <ResultCard title="Vulnerabilities Found" risk="High">
                    {vulnerabilities.map((item, idx) => (
                      <p key={`${item}-${idx}`} className="text-red-300">• {item}</p>
                    ))}
                  </ResultCard>
                )}

                {recommendations.length > 0 && (
                  <ResultCard title="Recommendations" risk="Medium">
                    {recommendations.map((rec, idx) => (
                      <p key={`${rec}-${idx}`} className="text-yellow-300">• {rec}</p>
                    ))}
                  </ResultCard>
                )}
              </div>
            ) : (
              <p className="text-red-400">❌ Website not reachable: {result.error}</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WebsiteScanner;
