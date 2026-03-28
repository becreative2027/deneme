'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { getAuditLogs } from '@/api/admin';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs()
      .then((d) => setLogs(Array.isArray(d.items) ? d.items : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <FileText size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tarih</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">İşlem</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Entity</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Entity ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.action === 'DELETE' ? 'bg-red-100 text-red-700' : log.action === 'CREATE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{log.entityType}</td>
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{log.entityId}</td>
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{log.userId ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">Log bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
}
