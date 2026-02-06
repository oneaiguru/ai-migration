import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiGetCsv } from '../api/client';
import { parseSites } from '../types/validators';
import type { ApiRouteRec, ApiSite, SiteWithForecast } from '../types/api';
// (rendered via TanStack sub-table now)
import { RoutesTanStackTable } from './table/RoutesTanStackTable';

interface RoutesTableProps {
  date: string;
  policy: 'strict' | 'showcase';
  recs: ApiRouteRec[];
  // Optional cohesion prop: when provided, the table will not fetch sites itself
  sites?: ApiSite[];
}

export const RoutesTable: React.FC<RoutesTableProps> = ({ date, policy, recs, sites: providedSites }) => {
  const [sites, setSites] = useState<ApiSite[]>([]);
  const [sortBy, setSortBy] = useState<'risk' | 'default'>('risk');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvBusy, setCsvBusy] = useState<boolean>(false);
  const [csvMsg, setCsvMsg] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Keep local state in sync when parent supplies sites
  useEffect(() => {
    if (Array.isArray(providedSites)) {
      setSites(providedSites);
      setLoading(false);
      setError(null);
    }
  }, [providedSites]);

  // Fallback: fetch sites only when not supplied by parent
  useEffect(() => {
    if (Array.isArray(providedSites)) return; // parent controls
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<ApiSite[]>('/api/sites', { date });
        const parsed = parseSites(data);
        if (mounted) setSites(parsed ?? (Array.isArray(data) ? data : []));
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Ошибка загрузки площадок');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [date, providedSites]);

  const sitesById = useMemo(() => {
    const m = new Map<string, ApiSite>();
    sites.forEach((s) => m.set(s.site_id, s));
    return m;
  }, [sites]);

  const rows: SiteWithForecast[] = useMemo(() => {
    return (recs || []).map((r) => {
      const s = sitesById.get(r.site_id);
      return {
        site_id: r.site_id,
        address: r.address ?? s?.address,
        volume: r.volume,
        schedule: r.schedule,
        fill_pct: r.fill_pct,
        overflow_prob: r.overflow_prob,
        last_service: r.last_service_dt || s?.last_service,
        pred_mass_kg: r.pred_mass_kg,
      };
    });
  }, [recs, sitesById]);

  const sorted = useMemo(() => {
    let arr = [...rows];
    if (onlyCritical) arr = arr.filter((s) => (s.overflow_prob ?? 0) >= 0.8);
    if (sortBy === 'risk') {
      arr.sort((a, b) => (b.overflow_prob ?? 0) - (a.overflow_prob ?? 0));
    }
    return arr;
  }, [rows, sortBy, onlyCritical]);

  useEffect(() => {
    setPage(1);
  }, [date, policy, recs, onlyCritical, sortBy]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const visible = useMemo(() => sorted.slice(start, end), [sorted, start, end]);

  if (loading) return <div className="card">Загрузка таблицы маршрутов...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  const highRiskCount = sorted.filter((s) => (s.overflow_prob ?? 0) >= 0.8).length;

  const downloadCsv = async () => {
    try {
      setCsvBusy(true);
      setCsvMsg(null);
      const blob = await apiGetCsv('/api/routes', { date, policy });
      if (!blob || (blob as any).size === 0) {
        setCsvMsg('Нет данных для CSV — проверьте дату/политику');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `routes_${policy}_${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setCsvMsg('CSV выгружен');
    } catch (e) {
      console.error(e);
      setCsvMsg('Ошибка скачивания CSV');
    } finally {
      setCsvBusy(false);
      // Auto-clear message
      setTimeout(() => setCsvMsg(null), 3000);
    }
  };

  return (
    <div className="card" data-testid="screen-routes">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{policy === 'strict' ? 'Строгая' : 'Расширенная'} политика</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <strong className="text-red-600">{highRiskCount} площадок с высоким риском</strong>
          </div>
          <button
            onClick={downloadCsv}
            className="btn-primary disabled:opacity-60"
            disabled={csvBusy}
            aria-label="Скачать CSV для таблицы маршрутов"
            aria-busy={csvBusy || undefined}
            aria-describedby={csvMsg ? 'routes-table-csv-status' : undefined}
          >
            {csvBusy ? 'Скачивание…' : 'Скачать CSV'}
          </button>
          {csvMsg && (
            <span
              id="routes-table-csv-status"
              role="status"
              aria-live="polite"
              className={`text-sm ${csvMsg.startsWith('Ошибка') ? 'text-red-600' : 'text-gray-600'}`}
            >
              {csvMsg}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-700 mr-2">Сортировка:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'risk' | 'default')}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="risk">По риску переполнения</option>
          <option value="default">По умолчанию</option>
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded border-gray-300" checked={onlyCritical} onChange={(e) => setOnlyCritical(e.target.checked)} />
          Риск ≥ 80%
        </label>
      </div>

      {sorted.length === 0 ? (
        <div className="p-6 text-sm text-gray-600 bg-gray-50 rounded border border-gray-200">
          Нет площадок. <a className="underline text-blue-600" href="https://github.com/granin/forecast-ui" target="_blank" rel="noreferrer">Документация</a>
        </div>
      ) : (
        <RoutesTanStackTable rows={visible} startIndex={start} sortedBy={sortBy} />
      )}
      {/* Pagination controls */}
      {sorted.length > 0 && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <span className="text-sm text-gray-600">Стр. {page}</span>
          <select
            aria-label="Rows per page"
            data-testid="pager-size"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button
            className="btn-secondary px-3 py-1 rounded border"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            aria-disabled={page === 1 ? 'true' : undefined}
            data-testid="pager-prev"
          >Предыдущая</button>
          <button
            className="btn-secondary px-3 py-1 rounded border"
            onClick={() => setPage((p) => p + 1)}
            disabled={end >= sorted.length}
            aria-label="Next page"
            aria-disabled={end >= sorted.length ? 'true' : undefined}
            data-testid="pager-next"
          >Следующая</button>
        </div>
      )}
    </div>
  );
};
