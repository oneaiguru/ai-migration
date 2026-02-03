import React, { useMemo, useState } from 'react';
import { apiGetCsv } from '../api/client';
import { useRoutesData } from '../hooks/useRoutesData';
import { useSitesData } from '../hooks/useSitesData';
import { RoutesTable } from './RoutesTable';
import { getDefaultDate } from '../utils/demo';

export const Routes: React.FC = () => {
  const [date, setDate] = useState<string>(() => getDefaultDate());
  const { strict, showcase, loading, error } = useRoutesData(date);
  // Cohesion: fetch sites once here and pass to table to avoid brief desync
  const { rows: sitesRows } = useSitesData(date);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [tablePolicy, setTablePolicy] = useState<'strict' | 'showcase'>('strict');
  const [csvBusy, setCsvBusy] = useState<null | 'strict' | 'showcase'>(null);
  const [csvErr, setCsvErr] = useState<{ policy: 'strict' | 'showcase'; msg: string } | null>(null);

  const strictAvgRisk = useMemo(() =>
    strict.length ? (strict.reduce((sum, r) => sum + (r.overflow_prob ?? 0), 0) / strict.length) * 100 : 0,
  [strict]);

  const showAvgRisk = useMemo(() =>
    showcase.length ? (showcase.reduce((sum, r) => sum + (r.overflow_prob ?? 0), 0) / showcase.length) * 100 : 0,
  [showcase]);

  const downloadCsv = async (policy: 'strict' | 'showcase') => {
    try {
      setCsvBusy(policy);
      setCsvErr(null);
      const blob = await apiGetCsv('/api/routes', { date, policy });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `routes_${policy}_${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setCsvErr({ policy, msg: 'Ошибка скачивания CSV. Попробуйте ещё раз.' });
    } finally {
      setCsvBusy(null);
    }
  };

  if (loading) return <div className="card">Загрузка рекомендаций...</div>;
  if (error) return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;

  return (
    <div className="space-y-6" data-testid="screen-routes">
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Рекомендации по маршрутизации</h3>
        <p className="text-sm text-blue-800">
          Система формирует два варианта рекомендаций: <strong>строгая политика</strong> (только критические площадки)
          и <strong>расширенная</strong> (включает площадки со средним риском для демонстрации объёма работ).
        </p>
      </div>

      <div className="bg-white border rounded p-3 -mt-4">
        <label className="text-sm font-medium text-gray-700 mr-2">Дата:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        />

        <div className="inline-flex items-center gap-2 ml-6">
          <label className="text-sm font-medium text-gray-700">Вид:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'cards' | 'table')}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="cards">Карточки</option>
            <option value="table">Таблица</option>
          </select>

          {viewMode === 'table' && (
            <>
              <label className="text-sm font-medium text-gray-700 ml-4">Политика:</label>
              <select
                value={tablePolicy}
                onChange={(e) => setTablePolicy(e.target.value as 'strict' | 'showcase')}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="strict">Строгая</option>
                <option value="showcase">Расширенная</option>
              </select>
            </>
          )}
        </div>
      </div>

      {viewMode === 'table' ? (
        <RoutesTable
          date={date}
          policy={tablePolicy}
          recs={tablePolicy === 'strict' ? strict : showcase}
          sites={sitesRows}
        />
      ) : strict.length === 0 && showcase.length === 0 ? (
        <div className="card text-gray-600">Нет рекомендаций для выбранной даты. <a className="underline text-blue-600" href="https://github.com/granin/forecast-ui" target="_blank" rel="noreferrer">Документация</a></div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strict Policy */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Строгая политика</h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full border border-red-300">
              Риск ≥ 80%
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Площадок к посещению</div>
              <div className="text-2xl font-bold text-gray-900">{strict.length}</div>
            </div>
            <button
              className="btn-primary disabled:opacity-60"
              onClick={() => downloadCsv('strict')}
              disabled={csvBusy === 'strict'}
              aria-busy={csvBusy === 'strict'}
              aria-label="Скачать CSV (строгая)"
              title={csvBusy === 'strict' ? 'Скачивание…' : 'Скачать CSV'}
            >
              {csvBusy === 'strict' ? 'Скачивание…' : 'Скачать CSV'}
            </button>
            {csvErr && csvErr.policy === 'strict' && (
              <span className="ml-3 text-sm text-red-700" role="status">{csvErr.msg}</span>
            )}
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {strict.map((rec) => (
              <div key={rec.site_id} className="border border-gray-200 rounded p-3 bg-white hover:border-red-300 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-medium">{rec.address || '—'}</div>
                    <div className="text-xs text-gray-500">КП {rec.site_id}</div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded border border-red-300">
                    ⚠️ {((rec.overflow_prob ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div>Заполнение: <strong>{(rec.fill_pct * 100).toFixed(0)}%</strong></div>
                  <div>Масса: <strong>{typeof rec.pred_mass_kg === 'number' ? `${rec.pred_mass_kg} кг` : '—'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Showcase Policy */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Расширенная политика</h3>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full border border-yellow-300">
              Риск ≥ 50%
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Площадок к посещению</div>
              <div className="text-2xl font-bold text-gray-900">{showcase.length}</div>
            </div>
            <button
              className="btn-primary disabled:opacity-60"
              onClick={() => downloadCsv('showcase')}
              disabled={csvBusy === 'showcase'}
              aria-busy={csvBusy === 'showcase'}
              aria-label="Скачать CSV (расширенная)"
              title={csvBusy === 'showcase' ? 'Скачивание…' : 'Скачать CSV'}
            >
              {csvBusy === 'showcase' ? 'Скачивание…' : 'Скачать CSV'}
            </button>
            {csvErr && csvErr.policy === 'showcase' && (
              <span className="ml-3 text-sm text-red-700" role="status">{csvErr.msg}</span>
            )}
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {showcase.map((rec) => (
              <div key={rec.site_id} className="border border-gray-200 rounded p-3 bg-white hover:border-yellow-300 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-medium">{rec.address || '—'}</div>
                    <div className="text-xs text-gray-500">КП {rec.site_id}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${
                    (rec.overflow_prob ?? 0) >= 0.8 
                      ? 'bg-red-100 text-red-700 border-red-300' 
                      : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                  }`}>
                    {(rec.overflow_prob ?? 0) >= 0.8 ? '⚠️' : '⚡'} {(((rec.overflow_prob ?? 0) * 100)).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div>Заполнение: <strong>{(rec.fill_pct * 100).toFixed(0)}%</strong></div>
                  <div>Масса: <strong>{typeof rec.pred_mass_kg === 'number' ? `${rec.pred_mass_kg} кг` : '—'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Summary Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Сравнение политик маршрутизации</h3>
        
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="table-header border-b">
                <th className="px-4 py-3 text-left">Параметр</th>
                <th className="px-4 py-3 text-center">Строгая</th>
                <th className="px-4 py-3 text-center">Расширенная</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3">Количество площадок</td>
                <td className="px-4 py-3 text-center font-bold">{strict.length}</td>
                <td className="px-4 py-3 text-center font-bold">{showcase.length}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">Суммарная прогнозная масса</td>
                <td className="px-4 py-3 text-center">{strict.reduce((sum, r) => sum + (r.pred_mass_kg || 0), 0)} кг</td>
                <td className="px-4 py-3 text-center">{showcase.reduce((sum, r) => sum + (r.pred_mass_kg || 0), 0)} кг</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3">Средний риск переполнения</td>
                <td className="px-4 py-3 text-center">{strict.length ? strictAvgRisk.toFixed(0) : '—'}%</td>
                <td className="px-4 py-3 text-center">{showcase.length ? showAvgRisk.toFixed(0) : '—'}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
