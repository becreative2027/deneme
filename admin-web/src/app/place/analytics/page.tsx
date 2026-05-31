'use client';

import { useEffect, useState, useMemo } from 'react';
import { Eye, Users, Clock, TrendingUp, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { getPlaceAnalytics, PlaceAnalytics, DailyViewStat, HourlyViewStat } from '@/api/admin';

// ── Range options ─────────────────────────────────────────────────────────────

type Range =
  | { kind: 'hours'; hours: 6 }
  | { kind: 'days';  days: 7 | 30 | 90 };

const RANGES: Array<{ label: string } & Range> = [
  { label: 'Son 6 saat', kind: 'hours', hours: 6  },
  { label: 'Son 7 gün',  kind: 'days',  days:  7  },
  { label: 'Son 30 gün', kind: 'days',  days:  30 },
  { label: 'Son 90 gün', kind: 'days',  days:  90 },
];

function rangeKey(r: Range) {
  return r.kind === 'hours' ? `h${r.hours}` : `d${r.days}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}d ${s}s` : `${m}d`;
}

function fmtHour(isoUtc: string) {
  const d = new Date(isoUtc);
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'short',
  });
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

// ── Generic bar chart ─────────────────────────────────────────────────────────

interface BarItem {
  key: string;
  label: string;
  views: number;
  uniqueVisitors: number;
  extra?: string;   // extra tooltip line (e.g. avg duration)
}

function BarChart({ items, emptyText }: { items: BarItem[]; emptyText: string }) {
  const max = useMemo(() => Math.max(...items.map((s) => s.views), 1), [items]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1 h-40 px-1">
      {items.map((s) => {
        const heightPct = Math.max((s.views / max) * 100, 4);
        return (
          <div
            key={s.key}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div
              className="w-full rounded-t-md bg-brand opacity-80 group-hover:opacity-100 transition-all"
              style={{ height: `${heightPct}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg text-center">
                <p className="font-semibold text-white">{s.label}</p>
                <p className="mt-0.5">
                  <span className="font-semibold">{s.views}</span>{' '}
                  <span className="text-gray-300">görüntülenme</span>
                </p>
                <p className="text-gray-300">{s.uniqueVisitors} tekil kullanıcı</p>
                {s.extra && <p className="text-gray-400 mt-0.5">{s.extra}</p>}
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

  const [range, setRange]       = useState<Range>({ kind: 'days', days: 30 });
  const [data, setData]         = useState<PlaceAnalytics | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  const isHourly = range.kind === 'hours';

  useEffect(() => {
    if (!placeId) { setLoading(false); return; }
    setLoading(true);
    setError(false);
    const opts = range.kind === 'hours'
      ? { hours: range.hours }
      : { days: range.days };
    getPlaceAnalytics(placeId, opts)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [placeId, range]);

  if (!placeId) {
    return <div className="p-8 text-sm text-gray-400">Mekan atanmamış.</div>;
  }

  // ── Chart items ───────────────────────────────────────────────────────────
  const chartItems: BarItem[] = isHourly
    ? (data?.hourlyStats ?? []).map((h: HourlyViewStat) => ({
        key:            h.hour,
        label:          fmtHour(h.hour),
        views:          h.views,
        uniqueVisitors: h.uniqueVisitors,
        extra:          h.avgDurationSeconds !== null
                          ? `Ort. ${formatDuration(h.avgDurationSeconds)}`
                          : undefined,
      }))
    : (data?.dailyStats ?? []).map((d: DailyViewStat) => ({
        key:            d.date,
        label:          fmtDate(d.date),
        views:          d.views,
        uniqueVisitors: d.uniqueVisitors,
      }));

  // ── X-axis edge labels ────────────────────────────────────────────────────
  const xLabels = chartItems.length >= 2
    ? [chartItems[0].label, chartItems[Math.floor(chartItems.length / 2)].label, chartItems[chartItems.length - 1].label]
    : chartItems.map((i) => i.label);

  // ── 4th stat: period average ──────────────────────────────────────────────
  const periodAvgLabel = isHourly ? 'Saatlik Ort.' : 'Günlük Ort.';
  const periodAvgValue = chartItems.length > 0
    ? Math.round((data?.totalViews ?? 0) / chartItems.length).toLocaleString('tr-TR')
    : '0';

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
          <p className="text-sm text-gray-400 mt-1">Mekan sayfanızın ziyaret istatistikleri</p>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {RANGES.map((r) => {
            const active = rangeKey(r) === rangeKey(range);
            return (
              <button
                key={rangeKey(r)}
                onClick={() => setRange(r.kind === 'hours'
                  ? { kind: 'hours', hours: r.hours }
                  : { kind: 'days',  days:  r.days  })}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  active
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {r.label}
              </button>
            );
          })}
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
              label={periodAvgLabel}
              value={periodAvgValue}
              color="bg-emerald-500"
            />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-700">
                {isHourly ? 'Saatlik Görüntülenme' : 'Günlük Görüntülenme'}
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm bg-brand opacity-80 inline-block" />
                <span>Görüntülenme</span>
              </div>
            </div>

            <BarChart
              items={chartItems}
              emptyText="Bu dönemde görüntülenme yok."
            />

            {xLabels.length > 0 && (
              <div className="flex justify-between mt-2 px-1 text-[10px] text-gray-400">
                {xLabels.map((l, i) => <span key={i}>{l}</span>)}
              </div>
            )}
          </div>

          {/* Breakdown table */}
          {chartItems.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">
                  {isHourly ? 'Saatlik Detay' : 'Günlük Detay'}
                </h2>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {[...chartItems].reverse().map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm text-gray-600 min-w-[120px]">
                      {isHourly
                        ? (() => {
                            const d = new Date(item.key);
                            const end = new Date(d.getTime() + 3600_000);
                            return `${fmtHour(item.key)} – ${end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
                          })()
                        : new Date(item.key + 'T00:00:00').toLocaleDateString('tr-TR', {
                            weekday: 'short', day: '2-digit', month: 'long',
                          })}
                    </span>
                    <div className="flex gap-6 text-sm">
                      <span className="text-gray-900 font-medium tabular-nums">
                        {item.views.toLocaleString('tr-TR')}{' '}
                        <span className="text-gray-400 font-normal text-xs">görüntülenme</span>
                      </span>
                      <span className="text-gray-500 tabular-nums w-24 text-right">
                        {item.uniqueVisitors.toLocaleString('tr-TR')}{' '}
                        <span className="text-xs">tekil</span>
                      </span>
                      {isHourly && (
                        <span className="text-gray-400 tabular-nums w-20 text-right text-xs">
                          {formatDuration(
                            (data.hourlyStats.find((h) => h.hour === item.key)?.avgDurationSeconds) ?? null,
                          )}
                        </span>
                      )}
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
