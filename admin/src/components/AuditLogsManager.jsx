import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, RefreshCw, UserCheck, Activity } from 'lucide-react';

export default function AuditLogsManager() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setLogs(data);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-900" />
            Journal d'Audit Immuable
          </h2>
          <p className="text-xs text-slate-500">Traçabilité complète des actions administratives</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Chargement du journal d'audit...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">Aucun événement enregistré dans l'audit.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date & Heure</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Table Cible</th>
                  <th className="py-3 px-4">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {log.target_table}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
