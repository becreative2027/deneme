'use client';

import { useState } from 'react';
import { Search, Loader2, UserCog } from 'lucide-react';
import { searchUsers, setUserRole } from '@/api/admin';

const ROLES = [
  { value: 0, label: 'User' },
  { value: 1, label: 'PlaceOwner' },
  { value: 2, label: 'Admin' },
  { value: 3, label: 'SuperAdmin' },
];

const ROLE_BADGE: Record<string, string> = {
  User: 'bg-gray-100 text-gray-600',
  PlaceOwner: 'bg-violet-100 text-violet-700',
  Admin: 'bg-blue-100 text-blue-700',
  SuperAdmin: 'bg-red-100 text-red-700',
};

export default function UsersPage() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const data = await searchUsers(q.trim());
      setUsers(data.items ?? data);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, roleValue: number) {
    setChangingId(userId);
    try {
      await setUserRole(userId, roleValue);
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, role: ROLES.find(r => r.value === roleValue)?.label } : u),
      );
    } finally {
      setChangingId(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kullanıcılar</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Kullanıcı adı ara…"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          Ara
        </button>
      </form>

      {users.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kullanıcı</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol Değiştir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{u.username}</p>
                    {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
                    <p className="text-xs text-gray-300 font-mono">{u.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-400'}`}>
                      {u.role ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={ROLES.find(r => r.label === u.role)?.value ?? 0}
                        onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                        disabled={changingId === u.id}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand"
                      >
                        {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                      {changingId === u.id && <Loader2 size={14} className="animate-spin text-brand" />}
                      <UserCog size={14} className="text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {users.length === 0 && !loading && q && (
        <p className="text-sm text-gray-400 text-center py-10">Kullanıcı bulunamadı.</p>
      )}
    </div>
  );
}
