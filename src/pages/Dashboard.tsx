import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Boxes,
  Copy,
  Sparkles,
  Clock,
  CheckCircle,
  FileBadge,
  ArrowRight,
  Upload,
  CheckSquare,
  Building2,
  RefreshCw,
  Info,
  Server,
  Code2,
  Shield,
  UserCheck,
  Search,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { DemoPresetBanner } from '../components/DemoPresetBanner';

interface DashboardProps {
  onNavigateToMatching: (sourceCode?: string) => void;
  onNavigateToTab: (tab: any) => void;
}

const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToMatching, onNavigateToTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchDetails, setShowArchDetails] = useState(false);
  const [showRbacMatrix, setShowRbacMatrix] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSelectDemoCase = (sourceCode: string) => {
    onNavigateToMatching(sourceCode);
  };

  const connectedCpseCount = stats?.materialsByCpse?.length || 5;

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Matching Demo Cases */}
      <DemoPresetBanner onSelectCase={handleSelectDemoCase} />

      {/* Header Info & Synthetic Demo Notice */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              CPSE MATERIAL HARMONIZATION DASHBOARD
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              SYNTHETIC DEMO DATA
            </span>
          </div>
          <p className="text-xs text-slate-500">
            AI-assisted standardization, equivalence detection and National Material Code mapping
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStats}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigateToMatching('CPCL-BLT-001')}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Launch AI Matching
          </button>
        </div>
      </div>

      {/* Role-Based Operational Persona Banner */}
      <div className={`p-4 rounded-xl border shadow-2xs transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        user?.role === 'ADMIN'
          ? 'bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-purple-200'
          : user?.role === 'CPSE_OFFICER'
          ? 'bg-gradient-to-r from-amber-50 via-slate-50 to-emerald-50 border-amber-200'
          : 'bg-gradient-to-r from-blue-50 via-slate-50 to-cyan-50 border-blue-200'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
            user?.role === 'ADMIN'
              ? 'bg-purple-600 text-white'
              : user?.role === 'CPSE_OFFICER'
              ? 'bg-amber-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            {user?.role === 'ADMIN' ? <Shield className="w-5 h-5" /> : user?.role === 'CPSE_OFFICER' ? <Boxes className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                ACTIVE EVALUATION PERSONA: {user?.name}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : user?.role === 'CPSE_OFFICER'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {user?.role === 'ADMIN' ? 'Governance Admin' : user?.role === 'CPSE_OFFICER' ? 'Operating Officer' : 'Material Expert'}
              </span>
              <span className="text-[11px] text-slate-500">
                • {user?.cpse}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {user?.role === 'ADMIN' && (
                <>
                  <strong className="text-purple-900">Executive Oversight Mode:</strong> You have system-wide authority across all 5 participating CPSEs (CPCL, IOCL, BPCL, HPCL, ONGC). Audit transaction logs, deprecate national master entries, and supervise cross-enterprise governance.
                </>
              )}
              {user?.role === 'MATERIAL_EXPERT' && (
                <>
                  <strong className="text-blue-900">Technical Verification Mode:</strong> You have full technical authority to review AI candidate matches, evaluate attribute comparison tables, approve functionally equivalent items, and generate official National Material Codes (NMC).
                </>
              )}
              {user?.role === 'CPSE_OFFICER' && (
                <>
                  <strong className="text-amber-900">Procurement &amp; ERP Ingestion Mode:</strong> You have operational access to upload enterprise catalogs, browse materials, and view legacy cross-references. Final approval and National Master publication requires Material Expert validation.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Quick Role Actions */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
          {user?.role === 'MATERIAL_EXPERT' && (
            <button
              onClick={() => onNavigateToTab('review')}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              Review Queue ({stats?.pendingReviews || 0})
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => onNavigateToTab('audit-logs')}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              View Audit Logs
            </button>
          )}

          {user?.role === 'CPSE_OFFICER' && (
            <button
              onClick={() => onNavigateToTab('upload')}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload CPSE Data
            </button>
          )}

          <button
            onClick={() => setShowRbacMatrix(!showRbacMatrix)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {showRbacMatrix ? 'Hide RBAC Matrix' : 'View RBAC Matrix'}
          </button>
        </div>
      </div>

      {/* Expandable RBAC Matrix for Hackathon Evaluators */}
      {showRbacMatrix && (
        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 shadow-md text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider">
                SIH 2026 Role-Based Access Control (RBAC) Security Matrix
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Policy ID: MoP&amp;NG-NMM-SEC-26099
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-1.5 pr-4">Platform Capability</th>
                  <th className="py-1.5 px-3 text-center text-blue-300">Material Expert</th>
                  <th className="py-1.5 px-3 text-center text-purple-300">Governance Admin</th>
                  <th className="py-1.5 px-3 text-center text-amber-300">CPSE Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                <tr>
                  <td className="py-2 pr-4 font-sans text-slate-300">Data Upload &amp; Format Normalization</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full (Own CPSE)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans text-slate-300">AI Semantic Matching &amp; Spec Extraction</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full (All CPSEs)</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full (All CPSEs)</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full (Analysis Only)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans text-slate-300">Technical Comparison &amp; Tolerance Audit</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Primary Authority</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full Audit</td>
                  <td className="py-2 px-3 text-center text-slate-400">View Only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans text-slate-300">Equivalence Approval &amp; Assign NMC Code</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Authorized Sign-Off</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Authorized Override</td>
                  <td className="py-2 px-3 text-center text-rose-400">✗ Restricted (Validation Req.)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans text-slate-300">National Material Master Codification</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Publish</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Deprecate / Audit</td>
                  <td className="py-2 px-3 text-center text-slate-400">Read / Export Only</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-sans text-slate-300">Audit Trail &amp; Government Governance</td>
                  <td className="py-2 px-3 text-center text-slate-400">View Logged Actions</td>
                  <td className="py-2 px-3 text-center text-emerald-400">✓ Full System Access</td>
                  <td className="py-2 px-3 text-center text-slate-400">Own CPSE Logs</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pt-1 text-[11px] text-slate-400 italic">
            * Evaluators can toggle between roles anytime using the "Switch Active Role" button in the top navigation header.
          </div>
        </div>
      )}

      {/* Demo Notice Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800 font-semibold">Prototype Notice:</strong> Prototype uses synthetic CPSE-style material records for demonstration. Production deployment will ingest and harmonize live participating CPSE material datasets.
        </div>
      </div>

      {/* Section 7: 6 Dynamic KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Materials */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Materials</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats ? stats.totalMaterials : '--'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <span>Stored in catalog</span>
          </div>
        </div>

        {/* Card 2: Potential Matches */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-600">Potential Matches</span>
            <Copy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats ? stats.potentialDuplicates : '--'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <span>Candidate pairs</span>
          </div>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-rose-600">Pending Reviews</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {stats ? stats.pendingReviews : '--'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <span>Awaiting validation</span>
          </div>
        </div>

        {/* Card 4: Approved Matches */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Approved Matches</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {stats ? stats.approvedMatches : '--'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <span>Harmonized records</span>
          </div>
        </div>

        {/* Card 5: National Material Codes */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-blue-700">National Codes</span>
            <FileBadge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-800">
            {stats ? stats.nationalMaterialCodes : '--'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            <span>NMC created</span>
          </div>
        </div>

        {/* Card 6: CPSEs Connected */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-indigo-600">CPSEs Connected</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {connectedCpseCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            <span>CPCL, IOCL, BPCL...</span>
          </div>
        </div>
      </div>

      {/* Section 8: Three Large Functional Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: Upload CPSE Data */}
        <button
          onClick={() => onNavigateToTab('upload')}
          className="p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-500 rounded-lg text-left transition flex items-start space-x-3.5 group cursor-pointer shadow-2xs"
        >
          <div className="p-2.5 bg-blue-100 text-blue-800 rounded-md group-hover:bg-blue-600 group-hover:text-white transition">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="text-sm">Upload CPSE Data</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Upload CSV/XLSX material master spreadsheets with automated normalization &amp; spec extraction.
            </p>
          </div>
        </button>

        {/* Action 2: Run AI Matching */}
        <button
          onClick={() => onNavigateToTab('matching')}
          className="p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-amber-500 rounded-lg text-left transition flex items-start space-x-3.5 group cursor-pointer shadow-2xs"
        >
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-md group-hover:bg-amber-600 group-hover:text-white transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="text-sm">Run AI Matching</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Execute specification-aware matching, compare attributes, and generate explainable recommendations.
            </p>
          </div>
        </button>

        {/* Action 3: Review Recommendations */}
        <button
          onClick={() => onNavigateToTab('review')}
          className="p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 rounded-lg text-left transition flex items-start space-x-3.5 group cursor-pointer shadow-2xs"
        >
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span className="text-sm">Review Recommendations</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Open the human expert validation queue to audit, approve, reject, or map National Material Codes.
            </p>
          </div>
        </button>
      </div>

      {/* Core Workflow Pipeline Ribbon: DATA → AI MATCH → VALIDATE → NATIONAL MASTER */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          <span>End-to-End Harmonization Architecture Flow</span>
          <span className="text-slate-400 font-mono text-[10px]">AI RECOMMENDS • HUMAN VALIDATES • SYSTEM STANDARDIZES</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-mono text-[10px] text-blue-700 font-bold block">STAGE 1</span>
            <span className="font-semibold text-slate-900">CPSE Data Ingestion</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">CSV/XLSX + Normalization</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-mono text-[10px] text-amber-700 font-bold block">STAGE 2</span>
            <span className="font-semibold text-slate-900">AI Spec Matching</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Specification-Aware Scoring</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-mono text-[10px] text-purple-700 font-bold block">STAGE 3</span>
            <span className="font-semibold text-slate-900">Human Expert Audit</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Explainable Validation</span>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="font-mono text-[10px] text-emerald-700 font-bold block">STAGE 4</span>
            <span className="font-semibold text-slate-900">National Master Code</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">NMC Generation &amp; Mapping</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Materials by CPSE (Bar Chart) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Materials Master by CPSE Dataset
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Synthetic Data</span>
          </div>
          <div className="h-60 w-full flex-1">
            {stats?.materialsByCpse && stats.materialsByCpse.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.materialsByCpse} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="cpse" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[3, 3, 0, 0]} name="Materials" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available yet
              </div>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            Distribution across CPCL, IOCL, BPCL, HPCL &amp; ONGC catalogs
          </div>
        </div>

        {/* Chart 2: Match Classification Breakdown (Donut Chart) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              AI Match Classification Breakdown
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Specification-Aware</span>
          </div>
          <div className="h-60 w-full flex-1">
            {stats?.matchClassification && stats.matchClassification.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.matchClassification.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="type"
                  >
                    {stats.matchClassification.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available yet
              </div>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            Classification by semantic similarity &amp; engineering attributes
          </div>
        </div>

        {/* Chart 3: Review Status Pipeline */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Harmonization Review Pipeline
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Governance State</span>
          </div>
          <div className="h-60 w-full flex-1">
            {stats?.reviewStatus && stats.reviewStatus.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.reviewStatus} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 3, 3, 0]} name="Evaluations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available yet
              </div>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            AI recommendations audited by certified CPSE material experts
          </div>
        </div>
      </div>

      {/* Section 26: Planned Production Architecture Drawer / Section */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        <button
          onClick={() => setShowArchDetails(!showArchDetails)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              System Architecture: Current Prototype vs. Planned Production
            </span>
          </div>
          <span className="text-xs text-blue-600 font-semibold hover:underline">
            {showArchDetails ? 'Hide Details' : 'View Architecture'}
          </span>
        </button>

        {showArchDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100 text-xs">
            {/* Current Prototype */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <span className="font-bold text-slate-800 block mb-1">
                Current Functional Prototype (SIH Demo):
              </span>
              <pre className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200 overflow-x-auto leading-relaxed">
{`React 19 / Vite UI
   ↓ (REST API)
Express / Node.js Backend
   ↓
Prototype AI Matching Kernel
 • Normalizer (abbreviations, units)
 • Spec Extractor (material, grade, size)
 • Rule & Heuristic Scorer
   ↓
In-Memory / MongoDB Document Store`}
              </pre>
            </div>

            {/* Planned Production */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md">
              <span className="font-bold text-blue-900 block mb-1">
                Production Architecture — Planned:
              </span>
              <pre className="font-mono text-[11px] text-blue-900 bg-white p-2.5 rounded border border-blue-200 overflow-x-auto leading-relaxed">
{`React / Next.js Enterprise UI
   ↓ (gRPC / FastAPI Gateway)
Python AI Orchestrator
 • Specialized Material Agents
 • Domain LLM Specification NER
 • Dense Embeddings (Sentence Transformers)
 • Re-ranking Cross-Encoder
   ↓
PostgreSQL + pgvector Vector Database`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
