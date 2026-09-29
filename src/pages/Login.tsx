import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Layers,
  Sparkles,
  UserCheck,
  CheckCircle2,
  ArrowDown,
  Building2,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Database,
  Cpu,
  FileCheck2,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('expert@demo.local');
  const [password, setPassword] = useState('sih2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim() || 'expert@demo.local';
    const cleanPassword = password || 'sih2026';

    try {
      setLoading(true);
      setError(null);
      await login(cleanEmail, cleanPassword, rememberMe);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    try {
      setLoading(true);
      setError(null);
      setEmail(demoEmail);
      setPassword('sih2026');
      await login(demoEmail, 'sih2026', rememberMe);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col lg:flex-row text-slate-800 antialiased font-sans">
      {/* ========================================================= */}
      {/* LEFT SIDE: Enterprise Branding & Core Harmonization Flow  */}
      {/* ========================================================= */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 lg:p-14 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
        {/* Subtle geometric background accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Top Ministry & Entity Bar */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-11 h-11 rounded-lg bg-blue-600 border border-blue-500/50 flex items-center justify-center font-black text-white text-xl shadow-lg tracking-wider">
              NMM
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                Government of India • Ministry of Petroleum &amp; Natural Gas
              </div>
              <div className="text-xs font-semibold text-slate-300">
                Chennai Petroleum Corporation Limited (CPCL)
              </div>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Smart Automation • Problem Statement ID: 26099</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              National Material Harmonization Platform
            </h1>

            <p className="text-base sm:text-lg font-medium text-blue-200">
              AI-Driven Standardization Across CPSEs
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
              Standardize material descriptions, identify equivalent materials, and build a trusted National Material Master across participating Central Public Sector Enterprises.
            </p>
          </div>

          {/* Small Harmonization Workflow Diagram */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 max-w-lg">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Standardization Core Pipeline</span>
              <span className="text-[10px] text-blue-400 font-mono">4-Stage Verification</span>
            </div>

            <div className="space-y-2">
              {/* Step 1 */}
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-blue-900/80 border border-blue-700 flex items-center justify-center text-blue-300 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>CPSE DATA</span>
                    <span className="text-[10px] text-slate-400 font-mono">CPCL • IOCL • BPCL • HPCL • ONGC</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    Ingestion of heterogeneous ERP item descriptions &amp; legacy codes
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-1">
                <ArrowDown className="w-3.5 h-3.5 text-blue-400 animate-bounce" />
              </div>

              {/* Step 2 */}
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-amber-900/60 border border-amber-700 flex items-center justify-center text-amber-300 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>AI MATCHING</span>
                    <span className="text-[10px] text-amber-300 font-mono">Semantic &amp; Spec Extraction</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    Multi-tier scoring: ASTM/ASME specs, attributes &amp; cosine similarity
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-1">
                <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
              </div>

              {/* Step 3 */}
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-indigo-900/60 border border-indigo-700 flex items-center justify-center text-indigo-300 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>EXPERT VALIDATION</span>
                    <span className="text-[10px] text-indigo-300 font-mono">Human-in-the-Loop</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    Domain material experts verify tolerances, differences &amp; safety ratings
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-1">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              {/* Step 4 */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-700/60 flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-emerald-900/80 border border-emerald-600 flex items-center justify-center text-emerald-300 shrink-0">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>NATIONAL MATERIAL MASTER</span>
                    <span className="text-[10px] text-emerald-300 font-mono">NMC Codification</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    Deterministic national code assigned with bidirectional CPSE mapping
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hackathon Branding */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            <span className="font-bold text-slate-200">SMART INDIA HACKATHON 2026</span>
            <span className="mx-2">•</span>
            <span>Problem Statement 26099</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
            AI RECOMMENDS → HUMAN VALIDATES → AUTHORIZED SYSTEM STANDARDIZES
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Clean Sign In Card & 1-Click Demo Accounts    */}
      {/* ========================================================= */}
      <div className="lg:w-1/2 bg-slate-50 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md space-y-6">
          {/* Prototype Environment Notice */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start space-x-2.5 shadow-2xs">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">SIH 2026 PROTOTYPE ENVIRONMENT</div>
              <div className="text-[11px] text-blue-800 mt-0.5 leading-snug">
                Prototype uses synthetic CPSE-style material records for demonstration. Production deployment will use participating CPSE ERP datasets with Single Sign-On (SSO).
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in</h2>
              <p className="text-xs text-slate-500 mt-1">
                Access the CPSE Material Harmonization Platform
              </p>
              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-md text-[11px] text-emerald-800 flex items-center justify-between">
                <span>✓ <strong>Default credentials loaded</strong> (any email &amp; password accepted)</span>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your organizational email"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition font-sans"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Prototype password: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">sih2026</code></span>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </form>

            {/* SIH Hackathon Demo Accounts Section */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Quick Demo Sign-In (Prototype Evaluator)
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">1-Click Access</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Click any persona to evaluate Role-Based Access Control (RBAC):
              </p>

              <div className="space-y-2">
                {/* 1. Material Expert */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('expert@demo.local')}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/60 transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        ME
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                          Material Expert — Demo
                        </div>
                        <div className="text-[10px] text-slate-500">
                          expert@demo.local • CPCL Demo Dataset
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      Primary Flow
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-2 pl-9">
                    Full rights: AI matching, spec comparison, approve/reject &amp; create National Material Codes (NMC).
                  </div>
                </button>

                {/* 2. Governance Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@demo.local')}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/60 transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        GA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                          National Material Governance — Demo
                        </div>
                        <div className="text-[10px] text-slate-500">
                          admin@demo.local • MoP&amp;NG Governance
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Admin
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-2 pl-9">
                    Executive oversight: cross-CPSE audit logs, master catalog deprecation, system reset.
                  </div>
                </button>

                {/* 3. CPSE Officer */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('officer@demo.local')}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/60 transition group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        CO
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                          CPSE Operating Officer — Demo
                        </div>
                        <div className="text-[10px] text-slate-500">
                          officer@demo.local • IOCL Demo Dataset
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Operating Officer
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-2 pl-9">
                    Operating rights: Ingest enterprise ERP catalogs, search materials. Read-only on final master approval.
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Production Note */}
          <p className="text-center text-[11px] text-slate-500">
            Ministry of Petroleum &amp; Natural Gas • Chennai Petroleum Corporation Limited
          </p>
        </div>
      </div>
    </div>
  );
};
