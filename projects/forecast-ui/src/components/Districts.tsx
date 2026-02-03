import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { InfoTooltip } from './InfoTooltip';
import { useDistrictAccuracy } from '../hooks/useDistrictAccuracy';
import { useAccuracyQuarter } from '../hooks/useAccuracyQuarter';
import { API } from '../api/client';
import type { ApiDistrictAccuracyEnvelope } from '../types/api';

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const Districts: React.FC = () => {
  const { quarter, setQuarter, availableQuarters } = useAccuracyQuarter();
  const { data, isLoading, error } = useDistrictAccuracy(100, 0);

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);

  type RankedRow = ApiDistrictAccuracyEnvelope['rows'][number] & { isBottom?: boolean };
  const ranked = useMemo(() => {
    const sorted = [...rows].sort((a, b) => (b.accuracy_pct ?? 0) - (a.accuracy_pct ?? 0));
    const top = sorted.slice(0, 5).map<RankedRow>((row) => ({ ...row, isBottom: false }));
    const bottom = sorted.slice(-5).reverse().map<RankedRow>((row) => ({ ...row, isBottom: true }));
    return { top, bottom };
  }, [rows]);

  const pieData = useMemo(() => {
    const high = rows.filter((d) => (d.accuracy_pct ?? 0) >= 85).length;
    const mid = rows.filter((d) => (d.accuracy_pct ?? 0) >= 70 && (d.accuracy_pct ?? 0) < 85).length;
    const low = rows.filter((d) => (d.accuracy_pct ?? 0) < 70).length;
    return [
      { name: '≥85%', value: high, color: PIE_COLORS[0] },
      { name: '70–85%', value: mid, color: PIE_COLORS[1] },
      { name: '<70%', value: low, color: PIE_COLORS[2] },
    ];
  }, [rows]);

  const getBadgeColor = (accuracy: number) => {
    if (accuracy >= 85) return 'bg-green-100 text-green-800 border-green-300';
    if (accuracy >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const accuracyCsvHref = `${API.base || ''}/api/accuracy/districts?quarter=${encodeURIComponent(quarter)}&format=csv`;

  if (isLoading) return <div className="card">Загрузка данных по районам…</div>;
  if (error) {
    const message = error instanceof Error ? error.message : 'неизвестно';
    return (
      <div className="card bg-red-50 border-red-200 text-red-700">
        Ошибка: {message}
      </div>
    );
  }
  if (!rows.length) return <div className="card text-gray-600">Нет данных по районам на выбранный квартал.</div>;

  return (
    <div className="space-y-6" data-testid="screen-districts">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-semibold">Районы · точность прогноза</h2>
          <p className="text-sm text-gray-600">Ранжирование по accuracy_pct (100% − WAPE) в квартальном бэктесте.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600" htmlFor="district-quarter-select">
            Квартал:
          </label>
          <select
            id="district-quarter-select"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            {availableQuarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
          <a className="btn-secondary px-3 py-1.5 text-sm" href={accuracyCsvHref} target="_blank" rel="noreferrer">
            CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Топ / низ точности</h3>

          <div className="table-container">
            <table className="w-full compact-table" data-testid="district-accuracy-table">
              <thead>
                <tr className="table-header border-b">
                  <th className="px-4 py-3 text-left">Район</th>
                  <th className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span>Accuracy %</span>
                      <InfoTooltip title="Accuracy = 100 − WAPE. Выше — лучше." />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right">WAPE</th>
                  <th className="px-4 py-3 text-center">Статус</th>
                  <th className="px-4 py-3 text-center">Группа</th>
                </tr>
              </thead>
              <tbody>
                {[...ranked.top, ...ranked.bottom].map((district, idx) => {
                  const accuracy = district.accuracy_pct ?? 0;
                  const wape = district.weighted_wape ?? 0;
                  return (
                    <tr key={`${district.district}-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{district.district}</td>
                      <td className="px-4 py-3 text-right font-mono">{accuracy.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right font-mono">{(wape * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`risk-badge ${getBadgeColor(accuracy)}`}
                          title={`Accuracy ${accuracy.toFixed(1)}%`}
                        >
                          {accuracy >= 85 ? '🏆 Лидер' : accuracy >= 70 ? 'Стабильно' : 'Внимание'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {district.isBottom ? '⚠️ В зону улучшений' : '✔️ Топ-5'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Распределение accuracy</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <p className="text-gray-700">
              Accuracy = 100 − WAPE. Районы с точностью ≥85% считаются устойчивыми, 70–85% — требуют наблюдения, &lt;70% —
              зона приоритета для доработок.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
