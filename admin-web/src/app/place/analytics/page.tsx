'use client';

import { useEffect, useState, useMemo } from 'react';
import { Eye, Users, Clock, TrendingUp, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { getPlaceAnalytics, PlaceAnalytics, DailyViewStat } from '@/api/admin';

// ── Date range options ────────────────────────────────────────────────────────

const RANGES = [
  { label: 'Son 7 gün',  days: 7  },
  { label: 'Son 30 gün', days: 30 },
  { label: 'Son 90 gün', days: 90 },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}d ${s}s` : `${m}d`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

function BarChart({ stats }: { stats: DailyViewStat[] }) {
  const max = useMemo(() => Math.max(...stats.map((s) => s.views), 1), [stats]);

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        Bu dönemde görüntülenme yok.
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1 h-40 px-1" aria-label="Günlük görüntülenme grafiği">
      {stats.map((s) => {
        const heightPct = Math.max((s.views / max) * 100, 4);
        const label = new Date(s.date + 'T00:00:00').toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: 'short',
        });
        return (
          <div
            key={s.date}
            className="flex-1 flex flex-col items-center gap-1 group relative"
            title={`${label}: ${s.views} görüntülenme, ${s.uniqueVisitors} tekil`}
          >
            <div
              className="w-full rounded-t-md bg-brand opacity-80 group-hover:opacity-100 transition-all"
              style={{ height: `${heightPct}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap shadow-lg">
                <span className="font-semibold">{s.views}</span> görüntülenme
                <br />
                <span className="text-gray-300">{s.uniqueVisitors} tekil kullanıcı</span>
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlaceAnalyticsPage() {
  const { user } = useAdminAuthStore();
  const placeId = user?.ownedPlaceIds?.[0];

  const [days, setDays]         = useState<7 | 30 | 90>(30);
  const [data, setData]         = useState<PlaceAnalytics | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    getPlaceAnalytics(placeId, days)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [placeId, days]);

  if (!placeId) {
    return <div className="p-8 text-sm text-gray-400">Mekan atanmamış.</div>;
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
          <p className="text-sm text-gray-400 mt-1">Mekan sayfanızın ziyaret istatistikleri</p>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days as 7 | 30 | 90)}
              className={clsx(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                days === r.days
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={32} className="animate-spin text-brand" />
        </div>
      ) : error ? (
        <div className="text-center py-24 text-sm text-red-400">
          Veriler yüklenemedi. Lütfen tekrar deneyin.
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Eye}
              label="Toplam Görüntülenme"
              value={data.totalViews.toLocaleString('tr-TR')}
              color="bg-brand"
            />
            <StatCard
              icon={Users}
              label="Tekil Ziyaretçi"
              value={data.uniqueVisitors.toLocaleString('tr-TR')}
              color="bg-violet-500"
            />
            <StatCard
              icon={Clock}
              label="Ort. Süre"
              value={formatDuration(data.avgDurationSeconds)}
              color="bg-amber-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Günlük Ort."
              value={
                data.dailyStats.length > 0
                  ? Math.round(data.totalViews / data.dailyStats.length).toLocaleString('tr-TR')
                  : '0'
              }
              color="bg-emerald-500"
            />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-700">Günlük Görüntülenme</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-brand opacity-80 inline-block" />
                  Görüntülenme
                </span>
              </div>
            </div>
            <BarChart stats={data.dailyStats} />

            {/* X-axis labels — show first, middle, last */}
            {data.dailyStats.length > 0 && (
              <div className="flex justify-between mt-2 px-1 text-[10px] text-gray-400">
                <span>
                  {new Date(data.dailyStats[0].date + 'T00:00:00').toLocaleDateString('tr-TR', {
                    day: '2-digit', month: 'short',
                  })}
                </span>
                <span>
                  {new Date(
                    data.dailyStats[Math.floor(data.dailyStats.length / 2)].date + 'T00:00:00',
                  ).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </span>
                <span>
                  {new Date(
                    data.dailyStats[data.dailyStats.length - 1].date + 'T00:00:00',
                  ).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            )}
          </div>

          {/* Daily breakdown table */}
          {data.dailyStats.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">Günlük Detay</h2>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {[...data.dailyStats].reverse().map((s) => (
                  <div key={s.date} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-gray-600">
                      {new Date(s.date + 'T00:00:00').toLocaleDateString('tr-TR', {
                        weekday: 'short', day: '2-digit', month: 'long',
                      })}
                    </span>
                    <div className="flex gap-8 text-sm">
                      <span className="text-gray-900 font-medium w-20 text-right">
                        {s.views.toLocaleString('tr-TR')}{' '}
                        <span className="text-gray-400 font-normal text-xs">görüntülenme</span>
                      </span>
                      <span className="text-gray-500 w-28 text-right">
                        {s.uniqueVisitors.toLocaleString('tr-TR')}{' '}
                        <span className="text-xs">tekil</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
