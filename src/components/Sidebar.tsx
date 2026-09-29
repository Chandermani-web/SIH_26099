import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Upload,
  Search,
  GitCompare,
  CheckSquare,
  BookOpen,
  GitBranch,
  BarChart3,
  FileText,
  Building2,
  Shield,
  LogOut,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'upload'
  | 'explorer'
  | 'matching'
  | 'review'
  | 'national-master'
  | 'legacy-mapping'
  | 'analytics'
  | 'audit-logs';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, pendingCount = 0 }) => {
  const { user, logout } = useAuth();
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand & Emblem */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow">
          CP
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">MoP&amp;NG Initiative</div>
          <div className="text-sm font-bold text-white tracking-tight">CPCL Harmonizer</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto text-xs">
        {/* Main Section */}
        <div>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-2.5 shrink-0" />
            <span>Executive Dashboard</span>
          </button>
        </div>

        {/* Data Management */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Data Management
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('upload')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <span>Upload Data</span>
            </button>

            <button
              onClick={() => onSelectTab('explorer')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'explorer'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <span>Material Explorer</span>
            </button>

            <button
              onClick={() => onSelectTab('legacy-mapping')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'legacy-mapping'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <span>Legacy Mapping</span>
            </button>
          </div>
        </div>

        {/* AI Harmonization */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            AI Harmonization
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('matching')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'matching'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GitCompare className="w-4 h-4 mr-2.5 shrink-0 text-amber-400" />
              <span className="flex-1 text-left">AI Matching</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                AI Core
              </span>
            </button>

            <button
              onClick={() => onSelectTab('review')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'review'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CheckSquare className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <span className="flex-1 text-left">Review &amp; Approval</span>
              {pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* National Master */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            National Master
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('national-master')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'national-master'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2.5 shrink-0 text-emerald-400" />
              <span className="flex-1 text-left">National Material Master</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">NMC</span>
            </button>
          </div>
        </div>

        {/* Analytics & Auditing */}
        <div>
          <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Governance &amp; Insights
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onSelectTab('analytics')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <span>Harmonization Analytics</span>
            </button>

            <button
              onClick={() => onSelectTab('audit-logs')}
              className={`w-full flex items-center px-3 py-2 rounded-md font-medium transition cursor-pointer ${
                currentTab === 'audit-logs'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 mr-2.5 shrink-0 text-slate-400" />
              <span>Audit Logs</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Active User Session Card */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              user?.role === 'ADMIN'
                ? 'bg-purple-900/70 text-purple-200 border border-purple-700'
                : user?.role === 'CPSE_OFFICER'
                ? 'bg-amber-900/70 text-amber-200 border border-amber-700'
                : 'bg-blue-900/70 text-blue-200 border border-blue-700'
            }`}>
              {user?.role === 'ADMIN' ? 'GA' : user?.role === 'CPSE_OFFICER' ? 'CO' : 'ME'}
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || 'Demo User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.cpse || 'Prototype Session'}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className={`px-1.5 py-0.5 rounded font-mono font-semibold ${
            user?.role === 'ADMIN'
              ? 'bg-purple-900/60 text-purple-300 border border-purple-800'
              : user?.role === 'CPSE_OFFICER'
              ? 'bg-amber-900/60 text-amber-300 border border-amber-800'
              : 'bg-blue-900/60 text-blue-300 border border-blue-800'
          }`}>
            {user?.role === 'ADMIN'
              ? 'GOVERNANCE ADMIN'
              : user?.role === 'CPSE_OFFICER'
              ? 'CPSE OFFICER'
              : 'MATERIAL EXPERT'}
          </span>
          <span className="text-slate-500 font-mono">RBAC Active</span>
        </div>
      </div>

      {/* CPSE Participating Entities Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
          <div className="flex items-center">
            <Building2 className="w-3.5 h-3.5 mr-1 text-blue-400" />
            <span>Connected CPSEs</span>
          </div>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            Demo datasets
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px]">
          <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-800">CPCL</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-800">IOCL</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-800">BPCL</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-800">HPCL</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-800">ONGC</span>
        </div>
      </div>
    </aside>
  );
};
