import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api/client';
import type { ApiSite } from '../types/api';
import { getDefaultDate } from '../utils/demo';

export const Sites: React.FC = () => {
  const [sortBy, setSortBy] = useState<'risk' | 'fill'>('risk');
  const [filterRisk, setFilterRisk] = useState(0);
  const [date, setDate] = useState<string>(() => getDefaultDate());
  const [district, setDistrict] = useState<string>('');
  const [rows, setRows] = useState<ApiSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<ApiSite[]>('/api/sites', { date });
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Ошибка загрузки');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [date]);

  const filteredSites = useMemo(() => {
    let arr = rows.filter(site => (site.overflow_prob ?? 0) >= filterRisk / 100);
    if (district) arr = arr.filter((s) => (s.district || '') === district);
    return arr.sort((a, b) => {
      if (sortBy === 'risk') return (b.overflow_prob ?? 0) - (a.overflow_prob ?? 0);
      return b.fill_pct - a.fill_pct;
    });
  }, [rows, filterRisk, district, sortBy]);

  const getRiskColor = (risk: number) => {
    if (risk >= 0.8) return 'bg-red-100 text-red-800 border-red-300';
    if (risk >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 0.8) return 'Высокий';
    if (risk >= 0.5) return 'Средний';
    return 'Низкий';
  };

  if (loading) return <div className="card">Загрузка площадок...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Sticky filter bar */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Дата:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              onChange={(e) => setFilterRisk(Number(e.target.value))}
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
                onChange={(e) => setDistrict(e.target.value)}
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
            Показано площадок: <strong>{filteredSites.length}</strong> из {rows.length}
          </div>
        </div>
      </div>

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
        <div className="table-container max-h-[500px] overflow-y-auto">
          <table className="w-full compact-table">
            <thead>
              <tr className="table-header border-b sticky top-0">
                <th className="px-4 py-3 text-left">Код КП</th>
                <th className="px-4 py-3 text-left">Адрес</th>
                <th className="px-4 py-3 text-right">Заполнение</th>
                <th className="px-4 py-3 text-center">Риск переполнения</th>
                <th className="px-4 py-3 text-right">Прогноз массы</th>
                <th className="px-4 py-3 text-center">Последний вывоз</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site) => (
                <tr key={site.site_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{site.site_id}</td>
                  <td className="px-4 py-3">{site.address || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            site.fill_pct >= 0.8 ? 'bg-red-500' : 
                            site.fill_pct >= 0.6 ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${site.fill_pct * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-sm">{(site.fill_pct * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`risk-badge ${getRiskColor(site.overflow_prob ?? 0)}`}
                      title={`Вероятность переполнения: ${((site.overflow_prob ?? 0) * 100).toFixed(0)}%`}
                    >
                      {getRiskLabel(site.overflow_prob ?? 0)} ({((site.overflow_prob ?? 0) * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {typeof site.pred_mass_kg === 'number' ? `${site.pred_mass_kg} кг` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {site.last_service || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
