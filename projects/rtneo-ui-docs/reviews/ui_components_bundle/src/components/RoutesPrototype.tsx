import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api/client';
import type { ApiRouteRec } from '../types/api';
import { getDefaultDate } from '../utils/demo';

export const RoutesPrototype: React.FC = () => {
  const [date, setDate] = useState<string>(() => getDefaultDate());
  const [recs, setRecs] = useState<ApiRouteRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'risk' | 'default'>('risk');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<ApiRouteRec[]>('/api/routes', { date, policy: 'showcase' });
        if (mounted) setRecs(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Ошибка загрузки рекомендаций');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [date]);

  const baseRows = useMemo(() => {
    let arr = [...recs];
    if (onlyCritical) arr = arr.filter((r) => (r.overflow_prob ?? 0) >= 0.8);
    if (sortBy === 'risk') arr.sort((a, b) => (b.overflow_prob ?? 0) - (a.overflow_prob ?? 0));
    return arr;
  }, [recs, sortBy, onlyCritical]);

  if (loading) return <div className="card">Загрузка прототипа маршрутов...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  const beforeRows = baseRows; // columns limited
  const afterRows = baseRows; // columns include forecast extras

  const FillBar: React.FC<{ pct: number }> = ({ pct }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${
            pct >= 0.8 ? 'bg-red-500' : pct >= 0.6 ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, Math.round(pct * 100)))}%` }}
        />
      </div>
      <span className="text-xs font-mono min-w-[35px]">{(pct * 100).toFixed(0)}%</span>
    </div>
  );

  const RiskBadge: React.FC<{ risk: number }> = ({ risk }) => (
    <span
      className={`risk-badge ${
        risk >= 0.8
          ? 'bg-red-100 text-red-800 border-red-300'
          : risk >= 0.5
          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
          : 'bg-green-100 text-green-800 border-green-300'
      }`}
    >
      {risk >= 0.8 ? 'Высокий' : risk >= 0.5 ? 'Средний' : 'Низкий'} {Math.round(risk * 100)}%
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Маршруты с прогнозом — Прототип</h3>
        <p className="text-sm text-blue-800">
          В правом блоке добавлены 3 новые колонки: <strong>Заполнение</strong>, <strong>Риск</strong>,
          <strong> Последний вывоз</strong>. Остальной интерфейс не тронут.
        </p>
      </div>

      <div className="bg-white border rounded p-3 -mt-4 flex items-center gap-4 flex-wrap">
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
            onChange={(e) => setSortBy(e.target.value as 'risk' | 'default')}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="risk">По риску переполнения</option>
            <option value="default">По умолчанию</option>
          </select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded border-gray-300" checked={onlyCritical} onChange={(e) => setOnlyCritical(e.target.checked)} />
          Показывать только критические площадки (риск ≥80%)
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before */}
        <div className="card">
          <div className="px-4 py-3 border-b text-sm font-semibold bg-gray-50">До (текущая таблица маршрута)</div>
          <div className="table-container">
            <table className="w-full compact-table">
              <thead>
                <tr className="table-header border-b">
                  <th className="px-3 py-2 text-left">№</th>
                  <th className="px-3 py-2 text-left">Код КП</th>
                  <th className="px-3 py-2 text-left">Адрес КП</th>
                  <th className="px-3 py-2 text-left">Объем</th>
                  <th className="px-3 py-2 text-left">График вывоза</th>
                </tr>
              </thead>
              <tbody>
                {beforeRows.map((r, idx) => (
                  <tr key={r.site_id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm">{idx + 1}</td>
                    <td className="px-3 py-2 text-sm font-mono text-blue-600">{r.site_id}</td>
                    <td className="px-3 py-2 text-sm">{r.address || '—'}</td>
                    <td className="px-3 py-2 text-sm font-mono">{(r as any).volume || '—'}</td>
                    <td className="px-3 py-2 text-sm">{(r as any).schedule || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* After with forecast columns */}
        <div className="card">
          <div className="px-4 py-3 border-b text-sm font-semibold bg-green-50">После (таблица с прогнозом)</div>
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
                {afterRows.map((r, idx) => (
                  <tr
                    key={r.site_id}
                    className={`border-b hover:bg-gray-50 ${
                      (r.overflow_prob ?? 0) >= 0.8 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-sm">{idx + 1}</td>
                    <td className="px-3 py-2 text-sm font-mono text-blue-600">{r.site_id}</td>
                    <td className="px-3 py-2 text-sm">{r.address || '—'}</td>
                    <td className="px-3 py-2 text-sm font-mono">—</td>
                    <td className="px-3 py-2 text-sm">—</td>
                    <td className="px-3 py-2 bg-green-50"><FillBar pct={r.fill_pct} /></td>
                    <td className="px-3 py-2 text-center bg-green-50"><RiskBadge risk={r.overflow_prob ?? 0} /></td>
                    <td className="px-3 py-2 text-center text-sm text-gray-600 bg-green-50">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Placeholder for forecasted truck load chart */}
      <div className="card">
        <div className="p-6 text-gray-600 text-sm">
          Прогноз загрузки ТС (с маркировкой критических дней)
        </div>
      </div>
    </div>
  );
};
