import React, { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../api/client';
import type { ApiSite } from '../types/api';
import { parseSites } from '../types/validators';
import { getDefaultDate } from '../utils/demo';
import { RiskBadge } from './shared/RiskBadge';

export const PlanAssignments: React.FC = () => {
  const [date, setDate] = useState<string>(() => getDefaultDate());
  const [rows, setRows] = useState<ApiSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<ApiSite[]>('/api/sites', { date });
        const parsed = parseSites(data);
        if (mounted) setRows(parsed ?? (Array.isArray(data) ? data : []));
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

  const filtered = useMemo(() => {
    let arr = rows;
    if (onlyCritical) arr = arr.filter((s) => (s.overflow_prob ?? 0) >= 0.8);
    return arr;
  }, [rows, onlyCritical]);

  // RiskBadge now shared component

  if (loading) return <div className="card">Загрузка план-заданий...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-3 flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Дата:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" className="rounded border-gray-300" checked={onlyCritical} onChange={(e) => setOnlyCritical(e.target.checked)} />
          Показывать только критические (риск ≥80%)
        </label>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-3">План-задания</h3>
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-600 bg-gray-50 rounded border border-gray-200">
            Нет данных. <a className="underline text-blue-600" href="https://github.com/granin/forecast-ui" target="_blank" rel="noreferrer">Документация</a>
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((s) => (
              <li key={s.site_id} className="py-2 px-1 flex items-center gap-3">
                <span className="font-mono text-blue-600 min-w-[80px]">{s.site_id}</span>
                <span className="flex-1">{s.address || '—'}</span>
                <RiskBadge risk={s.overflow_prob ?? 0} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
