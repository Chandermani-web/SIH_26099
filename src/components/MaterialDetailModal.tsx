import React from 'react';
import { X, Building, ArrowRight, Zap, CheckCircle, Tag, GitCompare } from 'lucide-react';
import { Material, MaterialMatch } from '../types';

interface MaterialDetailModalProps {
  material: Material | null;
  matches: MaterialMatch[];
  isOpen: boolean;
  onClose: () => void;
  onFindMatches: (material: Material) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  matches,
  isOpen,
  onClose,
  onFindMatches,
}) => {
  if (!isOpen || !material) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Material Master Specification Profile</h2>
              <p className="text-[11px] text-slate-400">
                CPSE: <span className="font-semibold text-white">{material.cpseCode}</span> • Code:{' '}
                <span className="font-mono text-blue-300 font-bold">{material.materialCode}</span>
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
              <span
                className={`font-semibold text-xs ${
                  material.status === 'MAPPED'
                    ? 'text-emerald-700'
                    : material.status === 'MATCH_PENDING'
                    ? 'text-amber-700'
                    : 'text-slate-700'
                }`}
              >
                {material.status}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Category</span>
              <span className="font-medium text-slate-800 truncate block">{material.category}</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">UOM / Unit</span>
              <span className="font-mono font-bold text-slate-800">{material.unit}</span>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">National Code</span>
              <span className="font-mono font-bold text-blue-700 truncate block">
                {material.mappedNationalCode || 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Raw vs Normalized Description Comparison */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Material Description Intelligence
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Original CPSE Raw Description
                </span>
                <p className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200">
                  {material.description}
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded">
                <span className="text-[10px] font-bold text-blue-900 uppercase block mb-1">
                  AI Normalized &amp; Standardized Form
                </span>
                <p className="font-mono text-xs text-blue-900 bg-white p-2 rounded border border-blue-200 font-medium">
                  {material.normalizedDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Specifications Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Extracted Engineering Specifications
            </span>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-slate-200 bg-slate-50/50">
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Material</span>
                  <span className="font-bold text-slate-800">{material.specifications.material || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Grade</span>
                  <span className="font-bold text-blue-700 font-mono">{material.specifications.grade || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Type / Component</span>
                  <span className="font-bold text-slate-800">{material.specifications.type || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Diameter / Size</span>
                  <span className="font-mono font-bold text-slate-800">{material.specifications.diameter || material.specifications.size || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Length</span>
                  <span className="font-mono font-bold text-slate-800">{material.specifications.length || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Rating / Class</span>
                  <span className="font-mono font-bold text-slate-800">{material.specifications.pressureRating || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Schedule</span>
                  <span className="font-mono font-bold text-slate-800">{material.specifications.schedule || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">Design Standard</span>
                  <span className="font-mono font-bold text-slate-800">{material.specifications.standard || 'N/A'}</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] text-slate-500 font-semibold block">End Connection</span>
                  <span className="font-bold text-slate-800">{material.specifications.endConnection || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Potential Matches Count */}
          {matches.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-amber-700" />
                <span className="font-medium text-amber-900 text-xs">
                  {matches.length} cross-CPSE candidate match(es) currently identified.
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onFindMatches(material);
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] cursor-pointer"
              >
                Inspect AI Matches
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onFindMatches(material);
            }}
            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs flex items-center cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Find Cross-CPSE Matches
          </button>
        </div>
      </div>
    </div>
  );
};
