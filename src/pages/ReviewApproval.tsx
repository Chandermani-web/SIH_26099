import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  Check,
  X,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { MaterialMatch, MatchStatus, MatchClassificationType } from '../types';
import { MatchComparisonModal } from '../components/MatchComparisonModal';

export const ReviewApproval: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<MatchStatus>('PENDING');
  const [matches, setMatches] = useState<MaterialMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canApprove = user?.role === 'MATERIAL_EXPERT' || user?.role === 'ADMIN';

  // Modal
  const [activeMatch, setActiveMatch] = useState<MaterialMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await api.getMatches({ status: activeTab });
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [activeTab]);

  const handleQuickApprove = async (matchId: string) => {
    try {
      await api.approveMatch(matchId, 'Approved by CPSE Material Expert');
      setNotification({ type: 'success', text: 'Match approved and mapped to National Material Code.' });
      setTimeout(() => setNotification(null), 3000);
      fetchMatches();
    } catch (err: any) {
      setNotification({ type: 'error', text: `Approval error: ${err.message || 'Operation failed'}` });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleQuickReject = async (matchId: string) => {
    try {
      await api.rejectMatch(matchId, 'Rejected by Material Expert');
      setNotification({ type: 'success', text: 'Match recommendation rejected.' });
      setTimeout(() => setNotification(null), 3000);
      fetchMatches();
    } catch (err: any) {
      setNotification({ type: 'error', text: `Reject error: ${err.message || 'Operation failed'}` });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleInspect = (match: MaterialMatch) => {
    setActiveMatch(match);
    setIsModalOpen(true);
  };

  const getBadgeForType = (type: MatchClassificationType) => {
    switch (type) {
      case 'IDENTICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
            IDENTICAL
          </span>
        );
      case 'NEAR_DUPLICATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
            NEAR DUP
          </span>
        );
      case 'DIFFERENT_VARIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
            DIFF VARIANT
          </span>
        );
      case 'DIFFERENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
            DIFFERENT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Review &amp; Approval Governance Queue
          </h2>
          <p className="text-xs text-slate-500">
            Expert audit of AI match recommendations prior to creating/mapping controlled National Material Codes
          </p>
        </div>
        <button
          onClick={fetchMatches}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
          title="Refresh review queue"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Role Access Banner for CPSE Officer */}
      {!canApprove && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Role Access Policy (CPSE Officer):</span>{' '}
              <span>You have view and recommendation privileges. Equivalence approval and National Code mapping is reserved for <strong>Material Experts</strong> and <strong>Governance Admins</strong>.</span>
            </div>
          </div>
          <button
            onClick={() => switchDemoRole('expert@demo.local')}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-xs shrink-0 self-start sm:self-center transition cursor-pointer flex items-center shadow-2xs"
          >
            <span>Switch to Expert</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3 rounded text-xs font-medium flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border border-rose-300 text-rose-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-2.5 px-4 border-b-2 transition cursor-pointer flex items-center ${
            activeTab === 'PENDING'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
          Pending Approvals
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`pb-2.5 px-4 border-b-2 transition cursor-pointer flex items-center ${
            activeTab === 'APPROVED'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          Approved &amp; Harmonized
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`pb-2.5 px-4 border-b-2 transition cursor-pointer flex items-center ${
            activeTab === 'REJECTED'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
          Rejected Recommendations
        </button>

        <button
          onClick={() => setActiveTab('NEEDS_REVIEW')}
          className={`pb-2.5 px-4 border-b-2 transition cursor-pointer flex items-center ${
            activeTab === 'NEEDS_REVIEW'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
          Flagged for Review
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Source Material</th>
                <th className="py-2.5 px-3">Candidate Material</th>
                <th className="py-2.5 px-3 text-center">Confidence</th>
                <th className="py-2.5 px-3">Match Type</th>
                <th className="py-2.5 px-3">AI Reasoning Summary</th>
                <th className="py-2.5 px-3">National Code</th>
                <th className="py-2.5 px-3">Reviewer</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1 text-blue-600" />
                    Loading review items...
                  </td>
                </tr>
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No items in this review queue state.
                  </td>
                </tr>
              ) : (
                matches.map((m, idx) => (
                  <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {/* Source */}
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-blue-900">{m.sourceCode}</div>
                      <div className="text-[10px] text-slate-500">{m.sourceCpse}</div>
                      <div className="font-mono text-[11px] text-slate-700 truncate max-w-xs" title={m.sourceDescription}>
                        {m.sourceDescription}
                      </div>
                    </td>

                    {/* Candidate */}
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-indigo-900">{m.candidateCode}</div>
                      <div className="text-[10px] text-slate-500">{m.candidateCpse}</div>
                      <div className="font-mono text-[11px] text-slate-700 truncate max-w-xs" title={m.candidateDescription}>
                        {m.candidateDescription}
                      </div>
                    </td>

                    {/* Confidence */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-black text-sm text-blue-700">{m.finalScore}%</span>
                    </td>

                    {/* Match Type */}
                    <td className="py-2.5 px-3">{getBadgeForType(m.matchType)}</td>

                    {/* AI Reason */}
                    <td className="py-2.5 px-3 max-w-xs text-[11px] text-slate-600">
                      {m.explanation.whyMatched && m.explanation.whyMatched[0] ? (
                        <span className="text-emerald-700 font-medium">✓ {m.explanation.whyMatched[0]}</span>
                      ) : m.explanation.differences && m.explanation.differences[0] ? (
                        <span className="text-rose-700 font-medium">✕ {m.explanation.differences[0]}</span>
                      ) : (
                        'Standard similarity'
                      )}
                    </td>

                    {/* National Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {m.nationalMaterialCode || '--'}
                    </td>

                    {/* Reviewer */}
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {m.reviewedBy || 'Pending'}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleInspect(m)}
                          className="p-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded"
                          title="Inspect Technical Comparison"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {m.status === 'PENDING' && (
                          canApprove ? (
                            <>
                              <button
                                onClick={() => handleQuickReject(m.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                title="Reject Match"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleQuickApprove(m.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] flex items-center cursor-pointer"
                                title="Approve & Assign NMC"
                              >
                                <Check className="w-3 h-3 mr-0.5" /> Approve
                              </button>
                            </>
                          ) : (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200"
                              title="Material Expert or Governance Admin authorization required to standardize"
                            >
                              Expert Sign-Off
                            </span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      <MatchComparisonModal
        match={activeMatch}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={async (id, comments, customCode) => {
          await api.approveMatch(id, comments, customCode);
          fetchMatches();
        }}
        onReject={async (id, comments) => {
          await api.rejectMatch(id, comments);
          fetchMatches();
        }}
        onNeedsReview={async (id, comments) => {
          await api.flagNeedsReview(id, comments);
          fetchMatches();
        }}
      />
    </div>
  );
};
