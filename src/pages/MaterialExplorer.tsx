import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Zap, ChevronLeft, ChevronRight, Building2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Material, MaterialMatch } from '../types';
import { MaterialDetailModal } from '../components/MaterialDetailModal';

interface MaterialExplorerProps {
  onSelectForMatching: (material: Material) => void;
}

export const MaterialExplorer: React.FC<MaterialExplorerProps> = ({ onSelectForMatching }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCpse, setSelectedCpse] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Detail Modal State
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [materialMatches, setMaterialMatches] = useState<MaterialMatch[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.getMaterials({
        cpse: selectedCpse,
        category: selectedCategory,
        status: selectedStatus,
        search,
        page,
        limit: 15,
      });
      setMaterials(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [page, selectedCpse, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMaterials();
  };

  const handleRowClick = async (mat: Material) => {
    setSelectedMaterial(mat);
    setIsDetailOpen(true);
    try {
      const detail = await api.getMaterialById(mat.id);
      setMaterialMatches(detail.matches || []);
    } catch {
      setMaterialMatches([]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Central CPSE Material Master Explorer
          </h2>
          <p className="text-xs text-slate-500">
            Searchable repository of multi-enterprise materials with live normalization &amp; attribute extraction
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-600">
            Total Records: <strong className="text-slate-900">{total}</strong>
          </span>
          <button
            onClick={fetchMaterials}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
            title="Refresh table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by description, material code, grade, standard (e.g. SS304, A106, Hex Bolt)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded shadow-2xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">CPSE:</span>
            <select
              value={selectedCpse}
              onChange={e => {
                setSelectedCpse(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-medium"
            >
              <option value="ALL">All CPSEs</option>
              <option value="CPCL">CPCL</option>
              <option value="IOCL">IOCL</option>
              <option value="BPCL">BPCL</option>
              <option value="HPCL">HPCL</option>
              <option value="ONGC">ONGC</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Fasteners">Fasteners</option>
              <option value="Valves">Valves</option>
              <option value="Piping">Piping &amp; Tubes</option>
              <option value="Gaskets & Seals">Gaskets &amp; Seals</option>
              <option value="Instrumentation">Instrumentation</option>
              <option value="Mechanical Spares">Mechanical Spares</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNMAPPED">UNMAPPED</option>
              <option value="MATCH_PENDING">MATCH_PENDING</option>
              <option value="MAPPED">MAPPED (Harmonized)</option>
              <option value="REVIEW_REQUIRED">REVIEW_REQUIRED</option>
            </select>
          </div>

          {(selectedCpse !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSelectedCpse('ALL');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSearch('');
                setPage(1);
              }}
              className="text-xs text-blue-700 hover:underline font-semibold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Material Master Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">CPSE</th>
                <th className="py-2.5 px-3">Material Code</th>
                <th className="py-2.5 px-3">Original Description</th>
                <th className="py-2.5 px-3">AI Normalized Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">UOM</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1 text-blue-600" />
                    Loading materials database...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No materials matched the specified search criteria.
                  </td>
                </tr>
              ) : (
                materials.map((mat, idx) => (
                  <tr
                    key={mat.id}
                    onClick={() => handleRowClick(mat)}
                    className={`hover:bg-blue-50/50 cursor-pointer transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* CPSE Badge */}
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          mat.cpseCode === 'CPCL'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : mat.cpseCode === 'IOCL'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : mat.cpseCode === 'BPCL'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : mat.cpseCode === 'HPCL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {mat.cpseCode}
                      </span>
                    </td>

                    {/* Material Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{mat.materialCode}</td>

                    {/* Original Raw Description */}
                    <td className="py-2.5 px-3 font-mono text-slate-700 max-w-xs truncate" title={mat.description}>
                      {mat.description}
                    </td>

                    {/* AI Normalized Description */}
                    <td className="py-2.5 px-3 font-mono font-medium text-blue-900 max-w-xs truncate" title={mat.normalizedDescription}>
                      {mat.normalizedDescription}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-slate-600">{mat.category}</td>

                    {/* Unit */}
                    <td className="py-2.5 px-3 font-mono text-slate-700">{mat.unit}</td>

                    {/* Harmonization Status Badge */}
                    <td className="py-2.5 px-3">
                      {mat.status === 'MAPPED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {mat.mappedNationalCode || 'HARMONIZED'}
                        </span>
                      ) : mat.status === 'MATCH_PENDING' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          PENDING MATCH
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                          UNMAPPED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(mat)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                          title="View Specification Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectForMatching(mat)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded text-[11px] font-bold transition flex items-center"
                          title="Run AI Cross-CPSE Matching"
                        >
                          <Zap className="w-3 h-3 mr-1" /> Match
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <strong className="text-slate-900">{page}</strong> of{' '}
            <strong className="text-slate-900">{totalPages || 1}</strong> ({total} records)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Material Detail Modal */}
      <MaterialDetailModal
        material={selectedMaterial}
        matches={materialMatches}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onFindMatches={mat => {
          setIsDetailOpen(false);
          onSelectForMatching(mat);
        }}
      />
    </div>
  );
};
