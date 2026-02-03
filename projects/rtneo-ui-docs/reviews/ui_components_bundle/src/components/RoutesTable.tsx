import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiGetCsv } from '../api/client';
import type { ApiRouteRec, ApiSite, SiteWithForecast } from '../types/api';

interface RoutesTableProps {
  date: string;
  policy: 'strict' | 'showcase';
  recs: ApiRouteRec[];
}

export const RoutesTable: React.FC<RoutesTableProps> = ({ date, policy, recs }) => {
  const [sites, setSites] = useState<ApiSite[]>([]);
  const [sortBy, setSortBy] = useState<'risk' | 'default'>('risk');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<ApiSite[]>('/api/sites', { date });
        if (mounted) setSites(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Ошибка загрузки площадок');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [date]);

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

  if (loading) return <div className="card">Загрузка таблицы маршрутов...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  const highRiskCount = sorted.filter((s) => (s.overflow_prob ?? 0) >= 0.8).length;

  const downloadCsv = async () => {
    try {
      const blob = await apiGetCsv('/api/routes', { date, policy });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `routes_${policy}_${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{policy === 'strict' ? 'Строгая' : 'Расширенная'} политика</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <strong className="text-red-600">{highRiskCount} площадок с высоким риском</strong>
          </div>
          <button onClick={downloadCsv} className="btn-primary">Скачать CSV</button>
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
        <div className="table-container">
          <table className="w-full compact-table">
            <thead>
              <tr className="table-header border-b">
                <th className="px-3 py-2 text-left">№</th>
                <th className="px-3 py-2 text-left">Код КП</th>
                <th className="px-3 py-2 text-left">Адрес КП</th>
                <th className="px-3 py-2 text-left">Объем</th>
                <th className="px-3 py-2 text-left">График вывоза</th>
                <th className="px-3 py-2 text-left bg-green-50">Заполнение</th>
                <th className="px-3 py-2 text-center bg-green-50">Риск переполнения</th>
                <th className="px-3 py-2 text-center bg-green-50">Посл. вывоз</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((site, idx) => (
                <tr
                  key={site.site_id}
                  className={`border-b hover:bg-gray-50 ${
                    (site.overflow_prob ?? 0) >= 0.8 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-3 py-2 text-sm">{idx + 1}</td>
                  <td className="px-3 py-2 text-sm font-mono text-blue-600">{site.site_id}</td>
                  <td className="px-3 py-2 text-sm">{site.address || '—'}</td>
                  <td className="px-3 py-2 text-sm font-mono">{site.volume || '—'}</td>
                  <td className="px-3 py-2 text-sm">{site.schedule || '—'}</td>

                  {/* Fill percentage with progress bar */}
                  <td className="px-3 py-2 bg-green-50">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        {(() => {
                          const pct = typeof site.fill_pct === 'number' ? site.fill_pct : 0;
                          return (
                            <div
                              className={`h-1.5 rounded-full ${
                                pct >= 0.8 ? 'bg-red-500' : pct >= 0.6 ? 'bg-orange-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.max(0, Math.min(100, Math.round(pct * 100)))}%` }}
                            />
                          );
                        })()}
                      </div>
                      <span className="text-xs font-mono min-w-[35px]">{
                        (typeof site.fill_pct === 'number' ? Math.round(site.fill_pct * 100) : 0)
                      }%</span>
                    </div>
                  </td>

                  {/* Risk badge */}
                  <td className="px-3 py-2 text-center bg-green-50">
                    <span
                      className={`risk-badge ${
                        (site.overflow_prob ?? 0) >= 0.8
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : (site.overflow_prob ?? 0) >= 0.5
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-green-100 text-green-800 border-green-300'
                      }`}
                      title={`Вероятность переполнения: ${(((site.overflow_prob ?? 0) * 100)).toFixed(0)}%`}
                    >
                      {(site.overflow_prob ?? 0) >= 0.8
                        ? 'Высокий'
                        : (site.overflow_prob ?? 0) >= 0.5
                        ? 'Средний'
                        : 'Низкий'}{' '}
                      {(((site.overflow_prob ?? 0) * 100)).toFixed(0)}%
                    </span>
                  </td>

                  {/* Last service date */}
                  <td className="px-3 py-2 text-center text-sm text-gray-600 bg-green-50">{site.last_service || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
