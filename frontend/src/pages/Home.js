import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  KeyIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: KeyIcon,
    title: 'Password Analyzer',
    description: 'Find password weaknesses and learn how to strengthen your credentials.'
  },
  {
    icon: GlobeAltIcon,
    title: 'Website Scanner',
    description: 'Check web security headers, SSL details, and site safety at a glance.'
  },
  {
    icon: ExclamationTriangleIcon,
    title: 'Phishing Detector',
    description: 'Detect suspicious URLs before they put your account or team at risk.'
  },
  {
    icon: ShieldExclamationIcon,
    title: 'Breach Insights',
    description: 'Review historical breach alerts and see your security posture clearly.'
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-fixed bg-cover bg-center text-slate-100 pt-24" style={{ backgroundImage: "url('/bg.png')" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-2 items-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 px-4 py-2 text-sm text-cyan-300 font-medium ring-1 ring-cyan-500/20 backdrop-blur-sm">
              <ShieldCheckIcon className="h-5 w-5" />
              AI-driven cybersecurity made simple
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">Protect your account with smart security checks</h1>
              <p className="max-w-xl text-slate-200 text-lg sm:text-xl drop-shadow-md">
                CyberShield AI helps you review password strength, website safety, phishing risks,
                and breach exposure from one polished dashboard.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                Login to Demo
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-400 backdrop-blur-md px-6 py-3 text-sm font-semibold text-slate-100 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                Create Free Account
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass backdrop-blur-lg bg-slate-950/40 border border-slate-700/50 p-8 rounded-3xl shadow-2xl shadow-cyan-500/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 rounded-3xl bg-slate-950/60 backdrop-blur-md p-5 ring-1 ring-white/10 shadow-xl shadow-cyan-500/5">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15">
                      <KeyIcon className="h-5 w-5" />
                    </span>
                    Password Strength
                  </div>
                  <p className="text-sm text-slate-300">Fast analysis for password safety and reuse risks.</p>
                </div>
                <div className="space-y-3 rounded-3xl bg-slate-950/60 backdrop-blur-md p-5 ring-1 ring-white/10 shadow-xl shadow-purple-500/5">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15">
                      <GlobeAltIcon className="h-5 w-5" />
                    </span>
                    Web Security
                  </div>
                  <p className="text-sm text-slate-300">Check headers, SSL, and unsafe site signals instantly.</p>
                </div>
                <div className="space-y-3 rounded-3xl bg-slate-950/60 backdrop-blur-md p-5 ring-1 ring-white/10 shadow-xl shadow-yellow-500/5">
                  <div className="flex items-center gap-2 text-yellow-300 font-semibold">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/15">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    </span>
                    Phishing Alerts
                  </div>
                  <p className="text-sm text-slate-300">Spot suspicious URLs before they become problems.</p>
                </div>
                <div className="space-y-3 rounded-3xl bg-slate-950/60 backdrop-blur-md p-5 ring-1 ring-white/10 shadow-xl shadow-emerald-500/5">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
                      <ShieldExclamationIcon className="h-5 w-5" />
                    </span>
                    Breach Review
                  </div>
                  <p className="text-sm text-slate-300">Review risk history and stay ahead of exposure.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="space-y-8 py-16">
          <div className="text-center max-w-2xl mx-auto backdrop-blur-sm bg-slate-950/30 p-6 rounded-3xl">
            <p className="text-cyan-300 uppercase tracking-[0.35em] text-xs font-semibold">Platform Overview</p>
            <h2 className="text-4xl font-bold text-white mt-4 drop-shadow-md">Everything you need for a quick security review</h2>
            <p className="text-slate-200 mt-4 drop-shadow-md">
              CyberShield AI is built for users who want a polished review experience. Visit the home page, explore the dashboard, and use the login button to access advanced analysis tools.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -6 }}
                className="glass backdrop-blur-lg bg-slate-950/40 rounded-3xl p-6 border border-slate-700/50 shadow-lg shadow-slate-950/10"
              >
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-3xl bg-slate-900/80 text-cyan-400 mb-5">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-6">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
