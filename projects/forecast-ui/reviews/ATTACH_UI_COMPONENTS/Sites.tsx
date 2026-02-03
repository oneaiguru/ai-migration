import React, { useMemo, useState } from 'react';
// (type import removed; not used directly after hooks split)
import { useSitesData } from '../hooks/useSitesData';
import { getDefaultDate } from '../utils/demo';
// (rendered via TanStack sub-table now)
import SiteAccuracy from './SiteAccuracy';
import { SitesTanStackTable } from './table/SitesTanStackTable';

export const Sites: React.FC = () => {
  const [sortBy, setSortBy] = useState<'risk' | 'fill'>('risk');
  const [filterRisk, setFilterRisk] = useState(0);
  const [date, setDate] = useState<string>(() => getDefaultDate());
  const [district, setDistrict] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const { rows, loading, error } = useSitesData(date, page, pageSize);

  const filteredSites = useMemo(() => {
    let arr = rows.filter(site => (site.overflow_prob ?? 0) >= filterRisk / 100);
    if (district) arr = arr.filter((s) => (s.district || '') === district);
    return arr.sort((a, b) => {
      if (sortBy === 'risk') return (b.overflow_prob ?? 0) - (a.overflow_prob ?? 0);
      return b.fill_pct - a.fill_pct;
    });
  }, [rows, filterRisk, district, sortBy]);

  // using shared RiskBadge/FillBar

  if (loading) return <div className="card">Загрузка площадок...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  return (
    <div className="space-y-6" data-testid="screen-sites">
      {/* Site accuracy tiles (demo-safe, from public/accuracy_demo.json) */}
      <SiteAccuracy />
      {/* Sticky filter bar */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Дата:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Сортировка:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'risk' | 'fill')}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="risk">По риску переполнения</option>
              <option value="fill">По заполнению</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Минимальный риск:</label>
            <select
              value={filterRisk}
              onChange={(e) => { setFilterRisk(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm"
            >
              <option value="0">Все площадки</option>
              <option value="50">≥ 50%</option>
              <option value="80">≥ 80%</option>
            </select>
          </div>

          {Array.from(new Set(rows.map((r) => r.district).filter(Boolean))).length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Район:</label>
              <select
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setPage(1); }}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="">Все районы</option>
                {Array.from(new Set(rows.map((r) => r.district).filter(Boolean))).map((d) => (
                  <option key={String(d)} value={String(d)}>{String(d)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto text-sm text-gray-600">
            Стр. <strong>{page}</strong> • На странице
            <select
              aria-label="Rows per page"
              data-testid="pager-size"
              className="ml-1 border border-gray-300 rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Site Accuracy (demo-safe, static JSON) */}
      <SiteAccuracy />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-red-50 border-red-200">
          <div className="text-sm text-red-600 mb-1">Высокий риск (≥80%)</div>
          <div className="text-3xl font-bold text-red-700">
            {rows.filter(s => (s.overflow_prob ?? 0) >= 0.8).length}
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="text-sm text-yellow-600 mb-1">Средний риск (50-80%)</div>
          <div className="text-3xl font-bold text-yellow-700">
            {rows.filter(s => (s.overflow_prob ?? 0) >= 0.5 && (s.overflow_prob ?? 0) < 0.8).length}
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="text-sm text-green-600 mb-1">Низкий риск (&lt;50%)</div>
          <div className="text-3xl font-bold text-green-700">
            {rows.filter(s => (s.overflow_prob ?? 0) < 0.5).length}
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-600 mb-1">Средняя прогноз. масса</div>
          <div className="text-3xl font-bold text-blue-700">
            {rows.some((s) => typeof s.pred_mass_kg === 'number')
              ? Math.round(rows.reduce((sum, s) => sum + (s.pred_mass_kg || 0), 0) / Math.max(1, rows.length)) + ' кг'
              : '—'}
          </div>
        </div>
      </div>

      {/* Sites Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Прогноз заполнения площадок</h3>
        
        {filteredSites.length === 0 ? (
          <div className="p-6 text-sm text-gray-600 bg-gray-50 rounded border border-gray-200">
            Нет данных по площадкам на выбранную дату. <a className="underline text-blue-600" href="https://github.com/granin/forecast-ui" target="_blank" rel="noreferrer">Документация</a>
          </div>
        ) : (
        <SitesTanStackTable rows={filteredSites} sortedBy={sortBy} />
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-end gap-2">
        <button
          className="btn-secondary px-3 py-1 rounded border"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          aria-disabled={page === 1 ? 'true' : undefined}
          data-testid="pager-prev"
        >
          Предыдущая
        </button>
        <button
          className="btn-secondary px-3 py-1 rounded border"
          onClick={() => setPage((p) => p + 1)}
          disabled={rows.length < pageSize}
          aria-label="Next page"
          aria-disabled={rows.length < pageSize ? 'true' : undefined}
          data-testid="pager-next"
        >
          Следующая
        </button>
      </div>
    </div>
  );
};
