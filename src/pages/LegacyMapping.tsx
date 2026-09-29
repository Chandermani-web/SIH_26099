import React, { useState, useEffect } from 'react';
import { GitBranch, Search, ArrowRight, Building2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { MaterialMapping } from '../types';

export const LegacyMapping: React.FC = () => {
  const [mappings, setMappings] = useState<MaterialMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCpse, setFilterCpse] = useState('ALL');

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const data = await api.getMappings();
      setMappings(data);
    } catch (err) {
      console.error('Error fetching mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const filtered = mappings.filter(m => {
    const matchesCpse = filterCpse === 'ALL' || m.cpseCode === filterCpse;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.materialCode.toLowerCase().includes(q) ||
      m.nationalCode.toLowerCase().includes(q) ||
      m.originalDescription.toLowerCase().includes(q) ||
      m.nationalDescription.toLowerCase().includes(q);
    return matchesCpse && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <GitBranch className="w-5 h-5 mr-2 text-blue-600" />
            Legacy Material Mapping Directory
          </h2>
          <p className="text-xs text-slate-500">
            CPSE Legacy Material Code to Unified National Material Code (NMC) Cross-Reference
          </p>
        </div>
        <button
          onClick={fetchMappings}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
          title="Refresh mappings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cross-Reference Explanatory Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-blue-900 block">
            Inter-CPSE Procurement Harmonization
          </span>
          <p className="text-blue-800">
            When CPCL orders <code className="font-mono bg-white px-1.5 py-0.5 rounded font-bold">CPCL-BLT-001</code>, 
            the system recognizes that IOCL's <code className="font-mono bg-white px-1.5 py-0.5 rounded font-bold">IOCL-BOLT-892</code> 
            and BPCL's inventory are physically identical under <code className="font-mono bg-white px-1.5 py-0.5 rounded font-bold text-blue-700">NMC-0001001</code>, 
            enabling shared surplus inventory and joint bulk tenders.
          </p>
        </div>
        <div className="shrink-0 font-mono text-[11px] bg-white p-2.5 rounded border border-blue-200 shadow-2xs">
          <div>CPCL-BLT-001 → <span className="text-blue-700 font-bold">NMC-0001001</span></div>
          <div>IOCL-BOLT-892 → <span className="text-blue-700 font-bold">NMC-0001001</span></div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search CPSE code, National code (NMC), or item description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded shadow-2xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Filter CPSE:</span>
          <select
            value={filterCpse}
            onChange={e => setFilterCpse(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded bg-white font-medium"
          >
            <option value="ALL">All CPSEs</option>
            <option value="CPCL">CPCL</option>
            <option value="IOCL">IOCL</option>
            <option value="BPCL">BPCL</option>
            <option value="HPCL">HPCL</option>
            <option value="ONGC">ONGC</option>
          </select>
        </div>
      </div>

      {/* Section 20 Table: CPSE Code → National Material Code */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">CPSE Code</th>
                <th className="py-2.5 px-3">Legacy Material Description</th>
                <th className="py-2.5 px-3 text-center">Mapping</th>
                <th className="py-2.5 px-3">National Material Code</th>
                <th className="py-2.5 px-3">Standard Unified Description</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1 text-blue-600" />
                    Loading legacy mappings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active mappings found. Go to AI Matching to harmonize and map CPSE codes to NMCs.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {/* CPSE Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] bg-slate-200 px-1 py-0.2 rounded font-bold text-slate-700">
                          {item.cpseCode}
                        </span>
                        <span>{item.materialCode}</span>
                      </div>
                    </td>

                    {/* Legacy Material Description */}
                    <td className="py-2.5 px-3 font-mono text-slate-700 max-w-xs truncate" title={item.originalDescription}>
                      {item.originalDescription}
                    </td>

                    {/* Arrow Indicator */}
                    <td className="py-2.5 px-3 text-center">
                      <ArrowRight className="w-4 h-4 text-blue-600 mx-auto" />
                    </td>

                    {/* National Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                      <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                        {item.nationalCode}
                      </span>
                    </td>

                    {/* Standard Unified Description */}
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900 max-w-sm truncate" title={item.nationalDescription}>
                      {item.nationalDescription}
                    </td>

                    {/* Mapping Type */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          item.mappingType === 'PRIMARY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.mappingType}
                      </span>
                    </td>

                    {/* Approved By */}
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {item.approvedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
