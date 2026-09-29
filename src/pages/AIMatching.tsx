import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  GitCompare,
  Building,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Check,
  Cpu,
  Sliders,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { Material, MaterialMatch, MatchClassificationType } from '../types';
import { MatchComparisonModal } from '../components/MatchComparisonModal';
import { DemoPresetBanner } from '../components/DemoPresetBanner';

interface AIMatchingProps {
  initialSourceCode?: string;
  onHarmonizationComplete?: () => void;
}

export const AIMatching: React.FC<AIMatchingProps> = ({
  initialSourceCode = 'CPCL-BLT-001',
  onHarmonizationComplete,
}) => {
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [sourceMaterial, setSourceMaterial] = useState<Material | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  // Comparison Modal state
  const [activeMatchForComparison, setActiveMatchForComparison] = useState<MaterialMatch | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Load catalog materials for source dropdown
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const res = await api.getMaterials({ limit: 100 });
        setAllMaterials(res.data);

        const targetMat =
          res.data.find(m => m.materialCode === initialSourceCode) ||
          res.data[0];

        if (targetMat) {
          setSelectedMaterialId(targetMat.id);
          setSourceMaterial(targetMat);
          runAIMatchingFor(targetMat.id);
        }
      } catch (err) {
        console.error('Error loading materials for matching:', err);
      }
    };
    loadCatalog();
  }, [initialSourceCode]);

  const runAIMatchingFor = async (matId: string, autoOpenCandidateCode?: string) => {
    try {
      setRunningAnalysis(true);
      const res = await api.runMatching(matId);
      setSourceMaterial(res.sourceMaterial);
      const fetchedCandidates = res.candidates || [];
      setCandidates(fetchedCandidates);

      // If requested to auto-open specific candidate for benchmark demo
      if (autoOpenCandidateCode && fetchedCandidates.length > 0) {
        const matchCandidate = fetchedCandidates.find((c: any) => c.candidateCode === autoOpenCandidateCode);
        if (matchCandidate) {
          openComparison(matchCandidate);
        }
      }
    } catch (err) {
      console.error('Error running AI matching:', err);
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleSourceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedMaterialId(newId);
    const mat = allMaterials.find(m => m.id === newId);
    if (mat) {
      setSourceMaterial(mat);
      runAIMatchingFor(newId);
    }
  };

  const handleSelectDemoCase = (sourceCode: string, targetCode?: string) => {
    const mat = allMaterials.find(m => m.materialCode === sourceCode);
    if (mat) {
      setSelectedMaterialId(mat.id);
      setSourceMaterial(mat);
      runAIMatchingFor(mat.id, targetCode);
    }
  };

  const openComparison = (candidate: any) => {
    const matchObj: MaterialMatch = {
      id: `match-${candidate.sourceMaterialId}-${candidate.candidateMaterialId}`,
      materialAId: candidate.sourceMaterialId,
      materialBId: candidate.candidateMaterialId,
      sourceCode: candidate.sourceCode,
      candidateCode: candidate.candidateCode,
      sourceCpse: candidate.sourceCpse,
      candidateCpse: candidate.candidateCpse,
      sourceDescription: candidate.sourceDescription,
      candidateDescription: candidate.candidateDescription,
      sourceSpecs: candidate.sourceSpecs,
      candidateSpecs: candidate.candidateSpecs,
      semanticScore: candidate.scoreBreakdown.semanticScore,
      specificationScore: candidate.scoreBreakdown.specificationScore,
      attributeScore: candidate.scoreBreakdown.materialGradeScore,
      metadataScore: candidate.scoreBreakdown.metadataScore,
      finalScore: candidate.confidence,
      matchType: candidate.matchType,
      explanation: candidate.explanation,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    setActiveMatchForComparison(matchObj);
    setIsComparisonOpen(true);
  };

  const handleApprove = async (matchId: string, comments: string, customCode?: string) => {
    await api.approveMatch(matchId, comments, customCode);
    if (sourceMaterial) {
      runAIMatchingFor(sourceMaterial.id);
    }
    if (onHarmonizationComplete) onHarmonizationComplete();
  };

  const handleReject = async (matchId: string, comments: string) => {
    await api.rejectMatch(matchId, comments);
    if (sourceMaterial) {
      runAIMatchingFor(sourceMaterial.id);
    }
  };

  const handleNeedsReview = async (matchId: string, comments: string) => {
    await api.flagNeedsReview(matchId, comments);
    if (sourceMaterial) {
      runAIMatchingFor(sourceMaterial.id);
    }
  };

  const getBadgeForType = (type: MatchClassificationType) => {
    switch (type) {
      case 'IDENTICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> IDENTICAL
          </span>
        );
      case 'NEAR_DUPLICATE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" /> NEAR DUPLICATE
          </span>
        );
      case 'FUNCTIONALLY_EQUIVALENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <Layers className="w-3.5 h-3.5 mr-1 text-purple-600" /> EQUIVALENT
          </span>
        );
      case 'DIFFERENT_VARIANT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> DIFFERENT VARIANT
          </span>
        );
      case 'DIFFERENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" /> DIFFERENT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-slate-600" /> REVIEW REQUIRED
          </span>
        );
    }
  };

  // Convert source specs into structured table rows (Section 13)
  const specRows: Array<{ attribute: string; value: string }> = [];
  if (sourceMaterial) {
    if (sourceMaterial.specifications.material) {
      specRows.push({ attribute: 'Material', value: sourceMaterial.specifications.material });
    }
    if (sourceMaterial.specifications.grade) {
      specRows.push({ attribute: 'Grade', value: sourceMaterial.specifications.grade });
    }
    if (sourceMaterial.specifications.type) {
      specRows.push({ attribute: 'Type', value: sourceMaterial.specifications.type });
    }
    if (sourceMaterial.specifications.diameter || sourceMaterial.specifications.size) {
      specRows.push({
        attribute: 'Diameter / Size',
        value: sourceMaterial.specifications.diameter || sourceMaterial.specifications.size || 'N/A',
      });
    }
    if (sourceMaterial.specifications.length) {
      specRows.push({ attribute: 'Length', value: sourceMaterial.specifications.length });
    }
    if (sourceMaterial.specifications.pressureRating) {
      specRows.push({ attribute: 'Pressure Rating', value: sourceMaterial.specifications.pressureRating });
    }
    if (sourceMaterial.specifications.schedule) {
      specRows.push({ attribute: 'Schedule', value: sourceMaterial.specifications.schedule });
    }
    if (sourceMaterial.specifications.standard) {
      specRows.push({ attribute: 'Standard', value: sourceMaterial.specifications.standard });
    }
  }

  return (
    <div className="space-y-6">
      {/* SIH AI Matching Demo Cases Banner */}
      <DemoPresetBanner onSelectCase={handleSelectDemoCase} />

      {/* Screen Title (Section 14) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
            AI MATERIAL MATCHING
          </h2>
          <p className="text-xs text-slate-500">
            Specification-aware matching across CPSE master catalogs with explainable technical attributes &amp; expert validation
          </p>
        </div>
        <button
          onClick={() => sourceMaterial && runAIMatchingFor(sourceMaterial.id)}
          disabled={runningAnalysis || !sourceMaterial}
          className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${runningAnalysis ? 'animate-spin' : ''}`} />
          Re-run Matching
        </button>
      </div>

      {/* Full 8-Stage Harmonization Workflow Visual */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          <span className="flex items-center">
            <Cpu className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            AI-ASSISTED MATERIAL HARMONIZATION WORKFLOW
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            HUMAN-IN-THE-LOOP • DETERMINISTIC NMC GOVERNANCE
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[9px] font-mono text-slate-400 block font-semibold">STAGE 1</span>
            <span className="font-semibold text-slate-900 text-[11px] block mt-0.5">Ingestion</span>
            <span className="text-[9px] text-slate-500">CSV / XLSX</span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[9px] font-mono text-slate-400 block font-semibold">STAGE 2</span>
            <span className="font-semibold text-slate-900 text-[11px] block mt-0.5">Normalization</span>
            <span className="text-[9px] text-slate-500">Syntax &amp; Units</span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[9px] font-mono text-slate-400 block font-semibold">STAGE 3</span>
            <span className="font-semibold text-slate-900 text-[11px] block mt-0.5">Spec Extract</span>
            <span className="text-[9px] text-slate-500">ASTM / ASME / Dims</span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[9px] font-mono text-slate-400 block font-semibold">STAGE 4</span>
            <span className="font-semibold text-slate-900 text-[11px] block mt-0.5">Candidate Match</span>
            <span className="text-[9px] text-slate-500">Cross-CPSE Retrieval</span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[9px] font-mono text-slate-400 block font-semibold">STAGE 5</span>
            <span className="font-semibold text-slate-900 text-[11px] block mt-0.5">Spec Compare</span>
            <span className="text-[9px] text-slate-500">Side-by-Side Matrix</span>
          </div>

          <div className="p-2 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[9px] font-mono text-slate-400 block font-semibold">STAGE 6</span>
            <span className="font-semibold text-slate-900 text-[11px] block mt-0.5">Explainability</span>
            <span className="text-[9px] text-slate-500">Itemized (✓ / ✕)</span>
          </div>

          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <span className="text-[9px] font-mono text-blue-700 font-bold block">STAGE 7</span>
            <span className="font-bold text-blue-900 text-[11px] block mt-0.5">Expert Validate</span>
            <span className="text-[9px] text-blue-700 font-medium">Human-in-the-Loop</span>
          </div>

          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
            <span className="text-[9px] font-mono text-emerald-700 font-bold block">STAGE 8</span>
            <span className="font-bold text-emerald-900 text-[11px] block mt-0.5">National Code</span>
            <span className="text-[9px] text-emerald-700 font-medium">NMC &amp; Audit Trail</span>
          </div>
        </div>
      </div>

      {/* Material Selector Control */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Source Material to Harmonize:
        </label>
        <select
          value={selectedMaterialId}
          onChange={handleSourceSelectChange}
          className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-medium text-slate-800 bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
        >
          {allMaterials.map(mat => (
            <option key={mat.id} value={mat.id}>
              [{mat.cpseCode}] {mat.materialCode} — {mat.description} ({mat.category})
            </option>
          ))}
        </select>
      </div>

      {/* Section 14: SOURCE MATERIAL CARD & EXTRACTED SPECIFICATIONS TABLE */}
      {sourceMaterial && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-blue-700 text-white rounded text-[11px] font-bold">SOURCE MATERIAL</span>
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                CPSE: {sourceMaterial.cpseCode}
              </span>
              <span className="font-mono text-xs font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                {sourceMaterial.materialCode}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  sourceMaterial.status === 'MAPPED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {sourceMaterial.status}
              </span>
              {sourceMaterial.mappedNationalCode && (
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                  NMC: {sourceMaterial.mappedNationalCode}
                </span>
              )}
            </div>
          </div>

          {/* Raw and Normalized Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Original Description:
              </span>
              <div className="font-mono text-xs text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-200 font-semibold">
                {sourceMaterial.description}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1">
                AI Normalized Form:
              </span>
              <div className="font-mono text-xs text-blue-900 bg-blue-50/50 p-2.5 rounded border border-blue-200 font-medium">
                {sourceMaterial.normalizedDescription}
              </div>
            </div>
          </div>

          {/* Section 13 & 14: EXTRACTED SPECIFICATIONS TABLE */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Extracted Specifications
            </h4>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-1/3">Attribute</th>
                    <th className="py-2 px-3">Extracted Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {specRows.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-slate-400">
                        No structured specifications detected.
                      </td>
                    </tr>
                  ) : (
                    specRows.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-1.5 px-3 font-semibold text-slate-700">{row.attribute}</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{row.value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Section 14 & 15: AI RECOMMENDED CANDIDATES TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI RECOMMENDED CANDIDATES ({candidates.length} candidate materials identified)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Scoring: Semantic (30%) + Specs (30%) + Material/Grade (20%) + Dimensions (15%) + Unit (5%)
          </span>
        </div>

        {runningAnalysis ? (
          <div className="bg-white p-10 rounded-lg border border-slate-200 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
            <div className="text-xs font-bold text-slate-800">
              Analyzing Cross-CPSE Catalogs...
            </div>
            <p className="text-[11px] text-slate-400">
              Comparing metallurgy, dimension tolerances, and engineering standards across CPCL, IOCL, BPCL, HPCL &amp; ONGC...
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
            No candidate materials above threshold found.
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">CPSE</th>
                    <th className="py-2.5 px-3">Material Code</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Match Type</th>
                    <th className="py-2.5 px-3 text-center">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {candidates.map((cand, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-blue-50/40 transition ${
                        cand.matchType === 'IDENTICAL'
                          ? 'bg-emerald-50/20'
                          : cand.matchType === 'DIFFERENT_VARIANT'
                          ? 'bg-amber-50/20'
                          : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >
                      {/* CPSE */}
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <span className="bg-slate-100 text-slate-800 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-200">
                          {cand.candidateCpse}
                        </span>
                      </td>

                      {/* Material Code */}
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                        {cand.candidateCode}
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">
                        <div>{cand.candidateDescription}</div>
                        {cand.explanation?.whyMatched?.[0] && (
                          <div className="text-[10px] text-emerald-700 font-sans mt-0.5">
                            ✓ {cand.explanation.whyMatched[0]}
                          </div>
                        )}
                        {cand.explanation?.differences?.[0] && (
                          <div className="text-[10px] text-rose-700 font-sans mt-0.5">
                            ✕ {cand.explanation.differences[0]}
                          </div>
                        )}
                      </td>

                      {/* Match Type */}
                      <td className="py-2.5 px-3">
                        {getBadgeForType(cand.matchType)}
                      </td>

                      {/* Confidence */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-black text-sm ${
                            cand.confidence >= 90
                              ? 'text-emerald-700'
                              : cand.confidence >= 70
                              ? 'text-blue-700'
                              : cand.confidence >= 50
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {cand.confidence}%
                        </span>
                      </td>

                      {/* Action (Section 14: Compare Button) */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openComparison(cand)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition flex items-center ml-auto cursor-pointer shadow-2xs"
                        >
                          <span>Compare</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Match Comparison & Human Validation Modal (Section 16, 17, 18, 19, 20) */}
      <MatchComparisonModal
        match={activeMatchForComparison}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onNeedsReview={handleNeedsReview}
      />
    </div>
  );
};
