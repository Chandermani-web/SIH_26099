import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Eye, Building2, CheckCircle2, Shield, X, RefreshCw, FileText } from 'lucide-react';
import { api } from '../services/api';
import { NationalMaterial, MaterialMapping } from '../types';

export const NationalMaster: React.FC = () => {
  const [nationalMaterials, setNationalMaterials] = useState<NationalMaterial[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Inspector modal
  const [selectedNational, setSelectedNational] = useState<NationalMaterial | null>(null);
  const [mappedItems, setMappedItems] = useState<Array<{ mapping: MaterialMapping; material?: any }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNationalMaterials = async () => {
    try {
      setLoading(true);
      const data = await api.getNationalMaterials({ search });
      setNationalMaterials(data);
    } catch (err) {
      console.error('Error fetching national materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNationalMaterials();
  }, []);

  const handleRowClick = async (nm: NationalMaterial) => {
    setSelectedNational(nm);
    setIsModalOpen(true);
    try {
      const res = await api.getNationalMaterialById(nm.id);
      setMappedItems(res.mappings || []);
    } catch (err) {
      console.error('Error loading NMC detail:', err);
      setMappedItems([]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
            National Material Master (NMC)
          </h2>
          <p className="text-xs text-slate-500">
            Official standardized codification registry under Ministry of Petroleum &amp; Natural Gas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-600">
            Harmonized Master Items: <strong className="text-slate-900">{nationalMaterials.length}</strong>
          </span>
          <button
            onClick={fetchNationalMaterials}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
            title="Refresh National Master"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <form
          onSubmit={e => {
            e.preventDefault();
            fetchNationalMaterials();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search National Material Code (e.g. NMC-0001001) or standard description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded shadow-2xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Section 19 Table: National Code, Standard Description, Category, CPSEs Mapped, Source Materials, Status, Approved By */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">National Code</th>
                <th className="py-2.5 px-3">Standard Harmonized Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">CPSEs Mapped</th>
                <th className="py-2.5 px-3">Source Materials</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Approved By</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1 text-blue-600" />
                    Loading National Material Master catalog...
                  </td>
                </tr>
              ) : nationalMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No National Material Codes created yet. Harmonize materials in AI Matching to generate NMCs.
                  </td>
                </tr>
              ) : (
                nationalMaterials.map((nm, idx) => (
                  <tr
                    key={nm.id}
                    onClick={() => handleRowClick(nm)}
                    className={`hover:bg-emerald-50/40 cursor-pointer transition ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    {/* National Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                      <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        {nm.nationalCode}
                      </span>
                    </td>

                    {/* Standard Description */}
                    <td className="py-2.5 px-3 font-mono text-slate-900 font-medium">
                      {nm.standardDescription}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-slate-600">{nm.category}</td>

                    {/* CPSEs Mapped */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {nm.sourceCpseList.map((cpse, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border border-slate-200"
                          >
                            {cpse}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Source Materials Count */}
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {nm.mappedCount} source materials
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> {nm.status}
                      </span>
                    </td>

                    {/* Approved By */}
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {nm.approvedBy || 'Material Expert Committee'}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 text-right">
                      <button className="p-1 text-slate-500 hover:text-blue-700 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 19 Inspection Modal:
          Shows National Material, Standard Description, Specifications, Mapped CPSE Codes, Approval History */}
      {isModalOpen && selectedNational && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    National Material Master Profile: {selectedNational.nationalCode}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Category: {selectedNational.category} • Created:{' '}
                    {new Date(selectedNational.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Unified National Standard Description
                </span>
                <p className="font-mono text-sm text-slate-900 bg-slate-50 p-3 rounded border border-slate-200 font-bold">
                  {selectedNational.standardDescription}
                </p>
              </div>

              {/* Specifications Matrix */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Governing Technical Specifications
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Material</span>
                    <span className="font-bold text-slate-800">
                      {selectedNational.specifications?.material || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Grade</span>
                    <span className="font-mono font-bold text-blue-700">
                      {selectedNational.specifications?.grade || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Size / Diameter</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedNational.specifications?.diameter || selectedNational.specifications?.size || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block">Length</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedNational.specifications?.length || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mapped CPSE Legacy Codes Table */}
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Mapped CPSE Legacy Material Master Codes ({mappedItems.length})
                </span>
                <div className="border border-slate-200 rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">CPSE</th>
                        <th className="py-2 px-3">Legacy Material Code</th>
                        <th className="py-2 px-3">Original Description</th>
                        <th className="py-2 px-3">Mapping Type</th>
                        <th className="py-2 px-3">Approved Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {mappedItems.map((item, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="py-2 px-3 font-bold text-blue-800">{item.mapping.cpseCode}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {item.mapping.materialCode}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700">
                            {item.material?.description || item.mapping.originalDescription}
                          </td>
                          <td className="py-2 px-3">
                            <span className="bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.5 rounded font-mono">
                              {item.mapping.mappingType}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-[10px] text-slate-500">
                            {new Date(item.mapping.approvedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
