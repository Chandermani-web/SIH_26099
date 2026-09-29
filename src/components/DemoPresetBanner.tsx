import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface DemoPresetBannerProps {
  onSelectCase: (sourceCode: string, targetCode?: string) => void;
}

export const DemoPresetBanner: React.FC<DemoPresetBannerProps> = ({ onSelectCase }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 rounded-lg shadow-md mb-6 border border-blue-700/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-amber-400 text-slate-900 rounded-md font-bold text-xs flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            AI MATCHING DEMO CASES
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/40">
            DEMO DATA
          </span>
          <span className="text-xs text-blue-200">
            Synthetic CPSE-style benchmark scenarios for Problem Statement 26099
          </span>
        </div>
        <span className="text-[11px] text-slate-300 font-mono">
          Click any scenario below to trigger instant AI harmonization:
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Case 1: Identical */}
        <button
          onClick={() => onSelectCase('CPCL-BLT-001', 'IOCL-BOLT-892')}
          className="text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/80 rounded-md p-2.5 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-emerald-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Case 1: Identical
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
              IDENTICAL
            </span>
          </div>
          <div className="text-[11px] text-slate-300 line-clamp-1 font-mono">
            SS304 HEX BOLT M10 X 50
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>CPCL vs IOCL (10mm x 50mm)</span>
            <span className="text-blue-300 group-hover:translate-x-0.5 transition flex items-center">
              Test <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </button>

        {/* Case 2: Different Variant */}
        <button
          onClick={() => onSelectCase('CPCL-BLT-001', 'BPCL-FST-102')}
          className="text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-amber-500/80 rounded-md p-2.5 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-amber-400 flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Case 2: Diff Variant
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
              DIFFERENT VARIANT
            </span>
          </div>
          <div className="text-[11px] text-slate-300 line-clamp-1 font-mono">
            M10 vs M12 Bolt (50mm)
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>CPCL vs BPCL (Diameter variance)</span>
            <span className="text-blue-300 group-hover:translate-x-0.5 transition flex items-center">
              Test <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </button>

        {/* Case 3: Different Material */}
        <button
          onClick={() => onSelectCase('CPCL-BLT-001', 'HPCL-BLT-440')}
          className="text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-rose-500/80 rounded-md p-2.5 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-rose-400 flex items-center">
              <XCircle className="w-3.5 h-3.5 mr-1" /> Case 3: Diff Material
            </span>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">
              DIFFERENT
            </span>
          </div>
          <div className="text-[11px] text-slate-300 line-clamp-1 font-mono">
            SS304 vs Carbon Steel
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>CPCL vs HPCL (Metallurgy variance)</span>
            <span className="text-blue-300 group-hover:translate-x-0.5 transition flex items-center">
              Test <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </button>

        {/* Case 4: Near Duplicate Gate Valve */}
        <button
          onClick={() => onSelectCase('CPCL-VLV-101', 'IOCL-VLV-710')}
          className="text-left bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 hover:border-blue-400 rounded-md p-2.5 transition group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-sky-400 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Case 4: Near Duplicate
            </span>
            <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
              NEAR DUPLICATE
            </span>
          </div>
          <div className="text-[11px] text-slate-300 line-clamp-1 font-mono">
            2" 150# Flanged API 600 Gate Valve
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>CPCL vs IOCL (WCB Body)</span>
            <span className="text-blue-300 group-hover:translate-x-0.5 transition flex items-center">
              Test <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
