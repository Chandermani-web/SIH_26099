import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Clock, User, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-700" />
            Governance Audit Trail &amp; Compliance Logs
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of all AI matching approvals, catalog uploads, and National Material Code assignments
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
          title="Refresh audit logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Section 22 Table: Timestamp, User, Action, Entity, Old Value, New Value */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Authorized User</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Action Description</th>
                <th className="py-2.5 px-3">Old Value</th>
                <th className="py-2.5 px-3">New Value / Mapping Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-1 text-blue-600" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No audit records registered yet.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}{' '}
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      {log.userName}
                    </td>

                    {/* Entity Type */}
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                        {log.entityType}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">
                      {log.action}
                    </td>

                    {/* Old Value */}
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {log.oldValue || 'None'}
                    </td>

                    {/* New Value */}
                    <td className="py-2.5 px-3 text-blue-800 font-bold text-[11px]">
                      {log.newValue || 'Updated'}
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
