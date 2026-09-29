import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sparkles, RefreshCw, UserCheck, Shield, ChevronDown, Check, LogOut } from 'lucide-react';

interface HeaderProps {
  onResetSuccess?: () => void;
  onSelectDemoCase?: (caseId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetSuccess }) => {
  const { user, switchDemoRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetDemoData();
      setResetToast(true);
      setTimeout(() => setResetToast(false), 3000);
      if (onResetSuccess) onResetSuccess();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  const demoAccounts = [
    { email: 'expert@demo.local', name: 'Demo User (Material Expert)', role: 'MATERIAL_EXPERT', cpse: 'CPCL Demo Dataset' },
    { email: 'admin@demo.local', name: 'Demo User (Governance Admin)', role: 'ADMIN', cpse: 'National Material Governance' },
    { email: 'officer@demo.local', name: 'Demo User (CPSE Officer)', role: 'CPSE_OFFICER', cpse: 'IOCL Demo Dataset' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Ministry Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-xs px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-amber-400 tracking-wide uppercase">Government of India</span>
          <span className="text-slate-600">|</span>
          <span>Ministry of Petroleum &amp; Natural Gas</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-medium">Chennai Petroleum Corporation Limited (CPCL)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            SIH 2026 • PS 26099
          </span>
          <span className="text-slate-400">Prototype Environment</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            NMM
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              National Material Harmonization Platform
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              AI-Driven Standardization Across CPCL, IOCL, BPCL, HPCL &amp; ONGC
            </p>
          </div>
        </div>

        {/* Action Controls & User Account */}
        <div className="flex items-center space-x-3">
          {/* SIH Demo Reset Button */}
          <button
            onClick={handleReset}
            disabled={resetting}
            title="Reset system to clean initial SIH demo state"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-600 ${resetting ? 'animate-spin' : ''}`} />
            {resetting ? 'Resetting...' : 'Reset Demo State'}
          </button>

          {/* Role Switcher Dropdown for SIH presentation */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded shadow-2xs transition cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              <span className="font-semibold mr-1">{user?.role}</span>
              <span className="text-slate-500 mr-1.5">({user?.cpse})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (Demo Mode)
                </div>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => {
                      switchDemoRole(acc.email);
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{acc.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {acc.role} • {acc.cpse}
                      </div>
                    </div>
                    {user?.email === acc.email && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center pl-2 border-l border-slate-200 text-xs space-x-2">
            <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${
              user?.role === 'ADMIN'
                ? 'bg-purple-100 border-purple-300 text-purple-700'
                : user?.role === 'CPSE_OFFICER'
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-blue-100 border-blue-300 text-blue-700'
            }`}>
              {user?.role === 'ADMIN' ? 'GA' : user?.role === 'CPSE_OFFICER' ? 'CO' : 'ME'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="font-bold text-slate-900 leading-tight">
                {user?.name || 'Demo User'}
              </div>
              <div className="text-[10px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {user?.role === 'ADMIN'
                    ? 'National Governance Admin'
                    : user?.role === 'CPSE_OFFICER'
                    ? 'CPSE Officer (IOCL)'
                    : 'Material Expert (CPCL)'}
                </span>{' '}
                • <span className="text-blue-600 font-semibold">Prototype</span>
              </div>
            </div>

            {/* Direct Sign Out Button */}
            <button
              onClick={logout}
              title="Sign Out of Session"
              className="ml-1 inline-flex items-center px-2 py-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {resetToast && (
        <div className="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium transition-all">
          ✓ System reset successfully! Synthetic CPSE master catalogs reloaded.
        </div>
      )}
    </header>
  );
};
