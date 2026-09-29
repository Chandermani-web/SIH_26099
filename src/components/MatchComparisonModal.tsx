import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  Check,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { MaterialMatch, MatchClassificationType } from '../types';

interface MatchComparisonModalProps {
  match: MaterialMatch | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (matchId: string, comments: string, nationalCode?: string) => Promise<void>;
  onReject: (matchId: string, comments: string) => Promise<void>;
  onNeedsReview: (matchId: string, comments: string) => Promise<void>;
}

export const MatchComparisonModal: React.FC<MatchComparisonModalProps> = ({
  match,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onNeedsReview,
}) => {
  const { user, switchDemoRole } = useAuth();
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customNationalCode, setCustomNationalCode] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  if (!isOpen || !match) return null;

  const canAuthorize = user?.role === 'MATERIAL_EXPERT' || user?.role === 'ADMIN';

  const handleApproveAction = async () => {
    try {
      setSubmitting(true);
      setActionErrorMessage(null);
      await onApprove(match.id, comments, customNationalCode.trim() || undefined);
      
      // Fire confetti for successful SIH jury demo!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setActionSuccessMessage('✓ Match approved! National Material Code generated and CPSE codes mapped.');
      setTimeout(() => {
        setActionSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setActionErrorMessage(`Approval error: ${err.message || 'Operation failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectAction = async () => {
    try {
      setSubmitting(true);
      setActionErrorMessage(null);
      await onReject(match.id, comments || 'Rejected by Material Expert');
      setActionSuccessMessage('Match recommendation rejected.');
      setTimeout(() => {
        setActionSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setActionErrorMessage(`Reject error: ${err.message || 'Operation failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNeedsReviewAction = async () => {
    try {
      setSubmitting(true);
      setActionErrorMessage(null);
      await onNeedsReview(match.id, comments || 'Flagged for OEM drawing & test certificate verification');
      setActionSuccessMessage('Match flagged for technical committee review.');
      setTimeout(() => {
        setActionSuccessMessage(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setActionErrorMessage(`Review flag error: ${err.message || 'Operation failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeForType = (type: MatchClassificationType) => {
    switch (type) {
      case 'IDENTICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> IDENTICAL / HIGH CONFIDENCE
          </span>
        );
      case 'NEAR_DUPLICATE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" /> NEAR DUPLICATE
          </span>
        );
      case 'FUNCTIONALLY_EQUIVALENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Layers className="w-3.5 h-3.5 mr-1 text-purple-600" /> FUNCTIONALLY EQUIVALENT
          </span>
        );
      case 'DIFFERENT_VARIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> DIFFERENT VARIANT
          </span>
        );
      case 'DIFFERENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> DIFFERENT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-600" /> NEEDS REVIEW
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                AI Material Harmonization &amp; Technical Comparison
              </h2>
              <p className="text-[11px] text-slate-400">
                Evaluation ID: <span className="font-mono text-slate-300">{match.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {actionSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md font-medium text-xs flex items-center">
              <Check className="w-4 h-4 mr-2 text-emerald-600" />
              {actionSuccessMessage}
            </div>
          )}

          {actionErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-md font-medium text-xs flex items-center">
              <XCircle className="w-4 h-4 mr-2 text-rose-600" />
              {actionErrorMessage}
            </div>
          )}

          {/* Top Score & Classification Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-md gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500">AI Confidence</span>
                <span className="text-2xl font-black text-blue-700 leading-none">
                  {match.finalScore}%
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Classification</span>
                {getBadgeForType(match.matchType)}
              </div>
            </div>

            {/* Score Breakdown Pills */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              <div className="px-2 py-1 bg-white border border-slate-200 rounded shadow-2xs">
                <span className="text-slate-500 font-medium">Semantic (30%): </span>
                <span className="font-bold text-slate-800">{match.semanticScore}%</span>
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded shadow-2xs">
                <span className="text-slate-500 font-medium">Specs (30%): </span>
                <span className="font-bold text-slate-800">{match.specificationScore}%</span>
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded shadow-2xs">
                <span className="text-slate-500 font-medium">Material/Grade (20%): </span>
                <span className="font-bold text-slate-800">{match.attributeScore}%</span>
              </div>
              <div className="px-2 py-1 bg-white border border-slate-200 rounded shadow-2xs">
                <span className="text-slate-500 font-medium">Dimensions (15%): </span>
                <span className="font-bold text-slate-800">{match.explanation.comparisonTable.find(r => r.attribute.includes('Diameter'))?.isMatch ? '100%' : '25%'}</span>
              </div>
            </div>
          </div>

          {/* Section 17 Requirement: Two Columns Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Material Card */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-200/80">
                <div className="flex items-center space-x-1.5 font-bold text-blue-900 text-xs">
                  <Building className="w-3.5 h-3.5 text-blue-700" />
                  <span>SOURCE MATERIAL ({match.sourceCpse})</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  {match.sourceCode}
                </span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Raw Description:</span>
                  <p className="font-mono text-xs text-slate-900 font-medium bg-white p-2 rounded border border-blue-100">
                    {match.sourceDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Material Card */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-indigo-200/80">
                <div className="flex items-center space-x-1.5 font-bold text-indigo-900 text-xs">
                  <Building className="w-3.5 h-3.5 text-indigo-700" />
                  <span>CANDIDATE MATERIAL ({match.candidateCpse})</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                  {match.candidateCode}
                </span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Raw Description:</span>
                  <p className="font-mono text-xs text-slate-900 font-medium bg-white p-2 rounded border border-indigo-100">
                    {match.candidateDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 17 Requirement: Attribute Comparison Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
              <span>Technical Attribute Matrix</span>
            </h3>
            <div className="border border-slate-200 rounded-md overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Attribute</th>
                    <th className="py-2 px-3">Source ({match.sourceCpse})</th>
                    <th className="py-2 px-3">Candidate ({match.candidateCpse})</th>
                    <th className="py-2 px-3 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {match.explanation.comparisonTable.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{row.attribute}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{row.sourceValue}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{row.candidateValue}</td>
                      <td className="py-2 px-3 text-center">
                        {row.isMatch ? (
                          <span className="inline-flex items-center text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                            <span className="text-[11px]">Match (✓)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-600 font-bold">
                            <XCircle className="w-4 h-4 mr-1 text-rose-500" />
                            <span className="text-[11px]">Differs (✕)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 9 Requirement: AI Explainability (Why Matched / Differences / Recommendation) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <span>AI Engineering Reasoning &amp; Recommendation</span>
            </h4>

            {/* Why Matched Points */}
            {match.explanation.whyMatched && match.explanation.whyMatched.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                  Why matched:
                </span>
                <ul className="space-y-1">
                  {match.explanation.whyMatched.map((item, idx) => (
                    <li key={idx} className="flex items-center text-xs text-slate-700 font-medium">
                      <span className="text-emerald-600 font-bold mr-1.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Differences Points */}
            {match.explanation.differences && match.explanation.differences.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-rose-800 block mb-1">
                  Differences noted:
                </span>
                <ul className="space-y-1">
                  {match.explanation.differences.map((item, idx) => (
                    <li key={idx} className="flex items-center text-xs text-slate-700 font-medium">
                      <span className="text-rose-600 font-bold mr-1.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-800 block mb-0.5">
                Recommendation:
              </span>
              <p className="text-xs text-slate-700 font-normal leading-relaxed">
                {match.explanation.recommendation}
              </p>
            </div>
          </div>

          {/* Section 18: Human Validation Action Section */}
          <div className="p-4 bg-blue-50/70 border border-blue-300 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Human Expert Validation &amp; National Material Assignment
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Workflow: AI Recommendation → Expert Approval → Deterministic NMC
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Material Expert Reviewer Comments (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Verified dimensional tolerances and ASME standard conformance."
                value={comments}
                onChange={e => setComments(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded shadow-2xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {!canAuthorize && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    <strong>Role Policy:</strong> As a <strong>CPSE Officer</strong>, you can inspect comparisons and flag items for review. Final equivalence approval and National Code mapping requires a <strong>Material Expert</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => switchDemoRole('expert@demo.local')}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded text-[11px] shrink-0 ml-3 transition cursor-pointer flex items-center"
                >
                  <span>Switch to Expert</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-600">
                Approving this pair will automatically assign or link to a unique National Material Code (e.g.{' '}
                <span className="font-mono font-bold text-blue-700">NMC-0001001</span>).
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRejectAction}
                  disabled={submitting || !canAuthorize}
                  title={!canAuthorize ? 'Requires Material Expert role' : 'Reject match'}
                  className="px-3 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded shadow-2xs transition cursor-pointer flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  ✕ REJECT
                </button>

                <button
                  onClick={handleNeedsReviewAction}
                  disabled={submitting}
                  className="px-3 py-2 text-xs font-semibold text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 rounded shadow-2xs transition cursor-pointer flex items-center"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  ⚠ NEEDS REVIEW
                </button>

                <button
                  onClick={handleApproveAction}
                  disabled={submitting || !canAuthorize}
                  title={!canAuthorize ? 'Requires Material Expert role' : 'Approve & Map NMC'}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition cursor-pointer flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  ✓ APPROVE &amp; MAP NMC
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Smart India Hackathon 2026 • Ministry of Petroleum &amp; Natural Gas</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
