import { useMemo } from 'react';
import { useRegionAccuracy } from '../hooks/useRegionAccuracy';
import { useSiteAccuracy } from '../hooks/useSiteAccuracy';
import { useAccuracyQuarter } from '../hooks/useAccuracyQuarter';
import { API } from '../api/client';

const formatPercent = (value?: number | null, fractionDigits = 1) =>
  value === undefined || value === null ? '—' : `${(value * 100).toFixed(fractionDigits)}%`;

export function SiteAccuracyCard() {
  const { quarter } = useAccuracyQuarter();
  const regionQuery = useRegionAccuracy();
  const siteQuery = useSiteAccuracy({ limit: 12 });
  const loading = regionQuery.isLoading || siteQuery.isLoading;
  const error = regionQuery.error || siteQuery.error;
  const errorMessage = error ? (error instanceof Error ? error.message : 'неизвестно') : null;
  const downloadHref = `${API.base || ''}/api/accuracy/sites?quarter=${encodeURIComponent(quarter)}&format=csv`;

  const topSites = useMemo(() => {
    const items = siteQuery.data?.items ?? [];
    const sorted = [...items].sort((a, b) => (a.wape ?? 0) - (b.wape ?? 0));
    const best = sorted.slice(0, Math.min(5, sorted.length));
    const worstRaw = sorted.slice(-Math.min(5, sorted.length)).reverse();
    const bestIds = new Set(best.map((s) => s.site_id));
    const worst = worstRaw.filter((s) => !bestIds.has(s.site_id));
    return { best, worst };
  }, [siteQuery.data]);

  return (
    <div className="card" data-testid="site-accuracy-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Точность по площадкам</h3>
          <p className="text-sm text-gray-600">Детализация бэктеста · {quarter}</p>
        </div>
        <a className="btn-secondary px-3 py-1.5 text-sm" href={downloadHref} target="_blank" rel="noreferrer">
          CSV
        </a>
      </div>

      {loading && <div className="text-sm text-gray-500">Загрузка…</div>}
      {error && (
        <div className="text-sm text-red-600">
          Ошибка загрузки точности площадок: {errorMessage}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <AccuracyTile
              label="Региональный WAPE"
              value={formatPercent(regionQuery.data?.overall_wape ?? null)}
              tone="bg-green-50 text-green-700"
            />
            <AccuracyTile
              label="Медиана по площадкам"
              value={formatPercent(regionQuery.data?.median_site_wape ?? null)}
              tone="bg-blue-50 text-blue-700"
            />
            <AccuracyTile
              label="Площадок в расчёте"
              value={regionQuery.data?.site_count?.toLocaleString('ru-RU') ?? '—'}
              tone="bg-gray-50 text-gray-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SiteAccuracyTable title="TOP-5 (низкий WAPE)" rows={topSites.best} positive />
            <SiteAccuracyTable title="Нужен фокус (TOP-5 по WAPE)" rows={topSites.worst} />
          </div>
        </>
      )}
    </div>
  );
}

function AccuracyTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`p-4 rounded border ${tone}`}>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

type TableProps = {
  title: string;
  rows: Array<{ site_id?: string | null; wape?: number | null; accuracy_pct?: number | null }>;
  positive?: boolean;
};

function SiteAccuracyTable({ title, rows, positive }: TableProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Недостаточно данных для выборки.</p>
      ) : (
      <div className="table-container">
        <table className="w-full compact-table text-sm">
          <thead>
            <tr className="table-header border-b">
              <th className="px-3 py-2 text-left">Site ID</th>
              <th className="px-3 py-2 text-right">Accuracy</th>
              <th className="px-3 py-2 text-right">WAPE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((site, idx) => (
              <tr key={`${site.site_id ?? 'site'}-${idx}`}>
                <td className="px-3 py-2">{site.site_id}</td>
                <td className={`px-3 py-2 text-right font-mono ${positive ? 'text-green-600' : 'text-red-600'}`}>
                  {(site.accuracy_pct ?? 0).toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-right font-mono">{formatPercent(site.wape ?? null)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

export default SiteAccuracyCard;
