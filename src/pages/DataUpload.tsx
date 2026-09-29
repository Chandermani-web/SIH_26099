import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, FileText, ArrowRight, RefreshCw, Check, Shield } from 'lucide-react';
import { api } from '../services/api';
import { Material } from '../types';

export const DataUpload: React.FC<{ onNavigateToExplorer: () => void }> = ({ onNavigateToExplorer }) => {
  const { user } = useAuth();
  const [selectedCpse, setSelectedCpse] = useState('CPCL');

  useEffect(() => {
    if (user?.role === 'CPSE_OFFICER' && user.cpse?.includes('IOCL')) {
      setSelectedCpse('IOCL');
    } else if (user?.role === 'MATERIAL_EXPERT') {
      setSelectedCpse('CPCL');
    }
  }, [user]);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    recordsUploaded: number;
    validRecords: number;
    invalidRecords: number;
    warnings: string[];
    samplePreview: Material[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file (.csv or .xlsx) to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMessage(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('cpseCode', selectedCpse);
      formData.append('uploadedBy', `${user?.name || 'Demo User'} (${user?.role || 'CPSE_OFFICER'})`);

      const res = await api.uploadMaterials(formData);
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = `Material Code,Description,Category,Subcategory,Unit,Manufacturer,Part Number
CPCL-BLT-901,SS304 HEX BOLT M10 X 50,Fasteners,Bolts,NOS,Unbrako,UB-1050
CPCL-BLT-902,STAINLESS STEEL SS316 HEX BOLT 12MM X 60MM,Fasteners,Bolts,NOS,Sundaram,SFS-316
CPCL-VLV-903,GATE VALVE 2 INCH CLASS 150# FLANGED RF WCB BODY,Valves,Gate Valves,NOS,L&T Valves,LNT-150-2
CPCL-PIP-904,SEAMLESS PIPE 4 INCH SCH 40 ASTM A106 GR B,Piping,CS Pipes,MTR,Jindal,JIN-4-SCH40
CPCL-FLG-905,WNRF FLANGE 3 INCH CLASS 150# SCH 40 ASTM A105,Piping,Flanges,NOS,Metalfar,MF-3-150`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cpse_material_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSamplePreset = async () => {
    // Generate synthetic sample CSV in-memory and submit
    const sampleCsvContent = `Material Code,Description,Category,Subcategory,Unit,Manufacturer,Part Number
${selectedCpse}-BLT-901,SS304 HEX BOLT M10 X 50,Fasteners,Bolts,NOS,Unbrako,UB-1050
${selectedCpse}-BLT-902,STAINLESS STEEL SS316 HEX BOLT 12MM X 60MM,Fasteners,Bolts,NOS,Sundaram,SFS-316
${selectedCpse}-VLV-903,GATE VALVE 2 INCH CLASS 150# FLANGED RF WCB BODY,Valves,Gate Valves,NOS,L&T Valves,LNT-150-2
${selectedCpse}-PIP-904,SEAMLESS PIPE 4 INCH SCH 40 ASTM A106 GR B,Piping,CS Pipes,MTR,Jindal,JIN-4-SCH40
${selectedCpse}-FLG-905,WNRF FLANGE 3 INCH CLASS 150# SCH 40 ASTM A105,Piping,Flanges,NOS,Metalfar,MF-3-150`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const sampleFile = new File([blob], `${selectedCpse}_sample_catalog.csv`, { type: 'text/csv' });
    setFile(sampleFile);
  };

  return (
    <div className="space-y-6">
      {/* Title & Guidelines */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 mb-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            CPSE MATERIAL DATA INGESTION
          </h2>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded">
            SYNTHETIC DEMO DATA
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Upload CPSE material master records for normalization, specification extraction and AI-assisted harmonization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5">
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            {/* CPSE Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Source CPSE Entity:
              </label>
              <select
                value={selectedCpse}
                onChange={e => setSelectedCpse(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 text-xs border border-slate-300 rounded shadow-2xs focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium text-slate-800"
              >
                <option value="CPCL">Chennai Petroleum Corporation Limited (CPCL)</option>
                <option value="IOCL">Indian Oil Corporation Limited (IOCL)</option>
                <option value="BPCL">Bharat Petroleum Corporation Limited (BPCL)</option>
                <option value="HPCL">Hindustan Petroleum Corporation Limited (HPCL)</option>
                <option value="ONGC">Oil and Natural Gas Corporation (ONGC)</option>
              </select>
            </div>

            {/* Drag & Drop File Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Material Master Spreadsheet (.csv or .xlsx):
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-medium text-slate-700">
                  {file ? (
                    <span className="font-bold text-blue-700 font-mono">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  ) : (
                    <span>Drag and drop your spreadsheet here, or browse</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: Microsoft Excel (.xlsx), Comma Separated Values (.csv) up to 15MB
                </p>

                <div className="mt-3 flex items-center justify-center space-x-3">
                  <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs">
                    Browse File
                    <input
                      type="file"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={loadSamplePreset}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    Load Sample File
                  </button>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Pipeline: Validate → Parse → Normalize → Extract Specs → Store
              </span>
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded text-xs font-bold transition flex items-center cursor-pointer shadow-xs"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Upload &amp; Process Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Documentation & Template Card */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-xs space-y-4">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="uppercase tracking-wider">Required Column Schema</span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            The platform automatically aligns column variations from legacy SAP MM, Oracle ERP, and Maximo systems:
          </p>

          <ul className="space-y-2 text-slate-700 font-mono text-[11px]">
            <li className="p-1.5 bg-white border border-slate-200 rounded">
              <span className="font-bold text-blue-700">Material Code</span> (e.g. CPCL-BLT-001)
            </li>
            <li className="p-1.5 bg-white border border-slate-200 rounded">
              <span className="font-bold text-blue-700">Description</span> (Mandatory, raw text)
            </li>
            <li className="p-1.5 bg-white border border-slate-200 rounded">
              <span className="font-bold text-blue-700">Category</span> (e.g. Fasteners, Valves)
            </li>
            <li className="p-1.5 bg-white border border-slate-200 rounded">
              <span className="font-bold text-blue-700">Unit / UOM</span> (e.g. NOS, EA, MTR)
            </li>
          </ul>

          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={downloadSampleTemplate}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Standard Template (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 14: Upload Results Summary & Preview */}
      {result && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Catalog Ingestion Complete!</span>
            </div>
            <button
              onClick={onNavigateToExplorer}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition cursor-pointer"
            >
              View in Material Explorer <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Section 10 Requirement: Display Cards (File Name, Records Detected, Valid Records, Invalid Records, Warnings) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">File Name</span>
              <span className="text-xs font-mono font-bold text-blue-900 truncate block mt-1" title={file?.name}>
                {file?.name || 'catalog.csv'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Records Detected</span>
              <span className="text-xl font-black text-slate-800">{result.recordsUploaded}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
              <span className="text-[10px] text-emerald-600 font-bold uppercase block">Valid Records</span>
              <span className="text-xl font-black text-emerald-700">{result.validRecords}</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded">
              <span className="text-[10px] text-rose-600 font-bold uppercase block">Invalid Records</span>
              <span className="text-xl font-black text-rose-700">{result.invalidRecords}</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <span className="text-[10px] text-amber-600 font-bold uppercase block">Warnings</span>
              <span className="text-xl font-black text-amber-700">{result.warnings.length}</span>
            </div>
          </div>

          {/* Warnings List if any */}
          {result.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Upload Warnings:</span>
              {result.warnings.map((w, idx) => (
                <div key={idx} className="text-[11px]">• {w}</div>
              ))}
            </div>
          )}

          {/* Section 14 Requirement: Show a preview table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Ingested Sample Preview (Normalized &amp; Extracted Attributes)
            </h4>
            <div className="border border-slate-200 rounded-md overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Original Raw Description</th>
                    <th className="py-2.5 px-3">AI Normalized Description</th>
                    <th className="py-2.5 px-3">Extracted Specifications</th>
                    <th className="py-2.5 px-3">UOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {result.samplePreview.map((mat, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{mat.materialCode}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{mat.description}</td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-900">{mat.normalizedDescription}</td>
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {mat.specifications.material && (
                            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                              {mat.specifications.material}
                            </span>
                          )}
                          {mat.specifications.grade && (
                            <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                              {mat.specifications.grade}
                            </span>
                          )}
                          {mat.specifications.diameter && (
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">
                              {mat.specifications.diameter}
                            </span>
                          )}
                          {mat.specifications.length && (
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">
                              {mat.specifications.length}
                            </span>
                          )}
                          {mat.specifications.pressureRating && (
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                              {mat.specifications.pressureRating}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">{mat.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
