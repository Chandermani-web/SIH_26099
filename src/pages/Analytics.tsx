import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, TrendingUp, IndianRupee, Layers, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching analytics stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const categoryHarmonizationData = [
    { category: 'Fasteners', total: 18, duplicates: 14, harmonized: 10 },
    { category: 'Valves', total: 14, duplicates: 8, harmonized: 6 },
    { category: 'Piping & Tubes', total: 11, duplicates: 6, harmonized: 4 },
    { category: 'Gaskets & Seals', total: 7, duplicates: 5, harmonized: 4 },
    { category: 'Instrumentation', total: 5, duplicates: 3, harmonized: 2 },
    { category: 'Pump Spares', total: 5, duplicates: 2, harmonized: 1 },
  ];

  const estimatedSavingsTrend = [
    { month: 'Apr 26', baseline: 120, harmonized: 114, savings: 6 },
    { month: 'May 26', baseline: 145, harmonized: 130, savings: 15 },
    { month: 'Jun 26', baseline: 170, harmonized: 148, savings: 22 },
    { month: 'Jul 26', baseline: 195, harmonized: 161, savings: 34 },
    { month: 'Aug 26', baseline: 220, harmonized: 172, savings: 48 },
    { month: 'Sep 26', baseline: 250, harmonized: 188, savings: 62 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            CPSE Procurement &amp; Inventory Harmonization Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Strategic cost optimization, SKU rationalization, and inter-CPSE supply chain synergies
          </p>
        </div>
      </div>

      {/* Value Realization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>PROJECTED PROCUREMENT SAVINGS</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹62.4 Cr</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Via combined CPCL, IOCL, BPCL, HPCL &amp; ONGC bulk tenders
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>SKU RATIONALIZATION RATE</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">42.8%</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Reduction in duplicate and near-duplicate material codes
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>DEAD STOCK REDUCTION</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">₹28.5 Cr</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Unlocked through cross-CPSE surplus interchangeability
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>AI ACCURACY CONFIDENCE</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">98.4%</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Validated against ASME, ASTM &amp; API engineering standards
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Duplication vs Harmonized by Category */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Harmonization Status by Equipment Category
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Catalog Rationalization</span>
          </div>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryHarmonizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" fill="#94a3b8" name="Total Master SKUs" />
                <Bar dataKey="duplicates" fill="#f59e0b" name="Duplicate Variants" />
                <Bar dataKey="harmonized" fill="#2563eb" name="Harmonized into NMC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            Fasteners and Valves exhibit the highest duplicate SKU redundancy across CPSEs
          </div>
        </div>

        {/* Chart 2: Cumulative Spend Optimization */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Procurement Spend Baseline vs Harmonized (₹ Crores)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Cumulative Impact</span>
          </div>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={estimatedSavingsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="baseline" stroke="#ef4444" fill="#fee2e2" name="Legacy Siloed Spend" />
                <Area type="monotone" dataKey="harmonized" stroke="#10b981" fill="#d1fae5" name="Harmonized Joint Spend" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            Standardizing National Material Codes enables joint volume contracts across MoP&amp;NG entities
          </div>
        </div>
      </div>
    </div>
  );
};
