import React, { useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { apiGet } from '../api/client';
import type { ApiDistrict } from '../types/api';
import { parseDistricts } from '../types/validators';
import { InfoTooltip } from './InfoTooltip';

export const Districts: React.FC = () => {
  const [rows, setRows] = useState<ApiDistrict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiGet<ApiDistrict[]>('/api/districts');
        const parsed = parseDistricts(data);
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
  }, []);
  const getBadgeColor = (smape: number) => {
    if (smape < 0.1) return 'bg-green-100 text-green-800 border-green-300';
    if (smape < 0.25) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusLabel = (smape: number) => {
    if (smape < 0.1) return 'Отлично';
    if (smape < 0.25) return 'Норма';
    return 'Требует внимания';
  };

  const allDistricts = useMemo(() => {
    if (!rows?.length) return [] as Array<any>;
    // Sort by SMAPE ascending
    const sorted = [...rows].sort((a, b) => (a.smape ?? 0) - (b.smape ?? 0));
    const top5 = sorted.slice(0, 5).map((d) => ({ ...d, type: 'top' as const }));
    const worst5 = sorted.slice(-5).map((d) => ({ ...d, type: 'worst' as const }));
    return [...top5, ...worst5];
  }, [rows]);

  const pieData = useMemo(() => {
    const excellent = rows.filter((d) => (d.smape ?? 1) < 0.1).length;
    const attention = rows.filter((d) => (d.smape ?? 0) > 0.25).length;
    return [
      { name: 'Отлично (<10%)', value: excellent, color: '#10b981' },
      { name: 'Требует внимания (>25%)', value: attention, color: '#ef4444' },
    ];
  }, [rows]);

  if (loading) return <div className="card">Загрузка данных по районам...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;
  if (!rows.length) return <div className="card text-gray-600">Нет данных. <a className="underline text-blue-600" href="https://github.com/granin/forecast-ui" target="_blank" rel="noreferrer">Документация</a></div>;

  return (
    <div className="space-y-6" data-testid="screen-districts">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Точность прогноза по районам</h3>
          
          <div className="table-container">
            <table className="w-full compact-table">
              <thead>
                <tr className="table-header border-b">
                  <th className="px-4 py-3 text-left">Район</th>
                  <th className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-2">
                      <span>SMAPE</span>
                      <InfoTooltip title="SMAPE — симметричная средняя абсолютная процентная ошибка. Ниже — лучше." />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-center">Статус</th>
                  <th className="px-4 py-3 text-center">Категория</th>
                </tr>
              </thead>
              <tbody>
                {allDistricts.map((district, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{district.district}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {((district.smape ?? 0) * 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`risk-badge ${getBadgeColor(district.smape)}`}
                        title={`SMAPE: ${((district.smape ?? 0) * 100).toFixed(2)}%`}
                      >
                        {getStatusLabel(district.smape)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {district.type === 'top' ? '🏆 Топ-5' : '⚠️ Худшие 5'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Распределение качества</h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <p className="text-gray-700">
              <strong>SMAPE</strong> (симметричная средняя абсолютная процентная ошибка) используется
              для оценки точности на уровне районов. Значения ниже 10% считаются отличными.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
