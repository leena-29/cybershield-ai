import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentIcon, KeyIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Button from '../components/Button';
import ResultCard from '../components/ResultCard';
import RiskBadge from '../components/RiskBadge';
import {
  analyzePassword,
  generateSecurePassword,
  validatePasswordInput
} from '../utils/passwordSecurity';

const PasswordAnalyzer = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [generator, setGenerator] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: true
  });

  const result = useMemo(() => {
    const check = validatePasswordInput(password);
    if (!check.valid) return null;
    return analyzePassword(password);
  }, [password]);

  const handleAnalyze = (e) => {
    e.preventDefault();
    const check = validatePasswordInput(password);
    if (!check.valid) {
      setError('Password cannot be empty');
      return;
    }
    setError('');
  };

  const handleGenerate = () => {
    try {
      const generated = generateSecurePassword(generator);
      setPassword(generated);
      setError('');
      setCopied(false);
    } catch (generationError) {
      setError(generationError.message || 'Unable to generate password');
    }
  };

  const handleCopy = async () => {
    if (!password.trim()) {
      setError('Password cannot be empty');
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Clipboard access failed. Copy manually.');
    }
  };

  const updateGenerator = (key, value) => {
    setGenerator((prev) => ({ ...prev, [key]: value }));
  };

  const strengthColor =
    !result || result.strength === 'Weak'
      ? 'bg-red-500'
      : result.strength === 'Moderate'
      ? 'bg-yellow-500'
      : result.strength === 'Strong'
      ? 'bg-green-500'
      : 'bg-emerald-400';

  const inputHasError = Boolean(error);

  return (
    <div className="space-y-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <KeyIcon className="h-10 w-10 text-cyan-400" />
          Password Analyzer
        </h1>
        <p className="text-slate-400">Check password strength, entropy, and vulnerabilities in real time</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-xl p-8 border border-slate-700 space-y-6"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error && e.target.value.trim().length > 0) {
                  setError('');
                }
              }}
              onBlur={() => {
                if (!password.trim()) {
                  setError('Password cannot be empty');
                }
              }}
              placeholder="Enter password to analyze..."
              className={`w-full glass px-4 py-3 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                inputHasError
                  ? 'border border-red-500 focus:ring-red-500'
                  : 'focus:ring-cyan-500 border border-slate-700'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {inputHasError && (
            <p className="text-red-400 text-sm">Password cannot be empty</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="primary" size="md" className="w-full" type="submit">
              <SparklesIcon className="h-5 w-5" />
              Analyze Password
            </Button>

            <Button variant="secondary" size="md" className="w-full" onClick={handleGenerate} type="button">
              Generate Password
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleCopy}
              type="button"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
              {copied ? 'Copied' : 'Copy to Clipboard'}
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-300 font-semibold mb-3">Generator Options</p>

            <label className="block text-sm text-slate-400 mb-2">
              Length: <span className="text-cyan-400">{generator.length}</span>
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={generator.length}
              onChange={(e) => updateGenerator('length', Number(e.target.value))}
              className="w-full mb-4"
            />

            <div className="space-y-2 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generator.includeUppercase}
                  onChange={(e) => updateGenerator('includeUppercase', e.target.checked)}
                />
                Include uppercase (A-Z)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generator.includeLowercase}
                  onChange={(e) => updateGenerator('includeLowercase', e.target.checked)}
                />
                Include lowercase (a-z)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generator.includeNumbers}
                  onChange={(e) => updateGenerator('includeNumbers', e.target.checked)}
                />
                Include numbers (0-9)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generator.includeSpecial}
                  onChange={(e) => updateGenerator('includeSpecial', e.target.checked)}
                />
                Include special (!@#$%^&*)
              </label>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-300 font-semibold mb-3">Complexity Checklist</p>
            <ul className="space-y-2 text-sm">
              <li className={result?.complexity.uppercase ? 'text-green-400' : 'text-slate-400'}>
                Uppercase letters
              </li>
              <li className={result?.complexity.lowercase ? 'text-green-400' : 'text-slate-400'}>
                Lowercase letters
              </li>
              <li className={result?.complexity.numbers ? 'text-green-400' : 'text-slate-400'}>
                Numbers
              </li>
              <li className={result?.complexity.special ? 'text-green-400' : 'text-slate-400'}>
                Special characters
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {result && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <div className="glass rounded-xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Overall Assessment</h2>
              <RiskBadge risk={result.strength} size="lg" />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Strength Score</span>
                <span className="text-cyan-400 font-semibold">{result.score}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 0.4 }}
                  className={`h-full rounded-full ${strengthColor}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Length</p>
                <p className="text-2xl font-bold text-cyan-400">{result.length}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Entropy</p>
                <p className="text-2xl font-bold text-cyan-400">{result.entropy} bits</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-1">Time to Crack</p>
                <p className="text-xl font-bold text-cyan-400">{result.timeToCrack}</p>
              </div>
            </div>
          </div>

          {result.vulnerabilities && result.vulnerabilities.length > 0 && (
            <ResultCard title="Vulnerabilities Found" risk="High">
              {result.vulnerabilities.map((vuln, idx) => (
                <div key={idx} className="text-red-300">
                  • {vuln}
                </div>
              ))}
            </ResultCard>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <ResultCard title="Improvement Suggestions" risk="Medium">
              {result.suggestions.map((suggestion, idx) => (
                <div key={idx} className="text-yellow-300">
                  • {suggestion}
                </div>
              ))}
            </ResultCard>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PasswordAnalyzer;
