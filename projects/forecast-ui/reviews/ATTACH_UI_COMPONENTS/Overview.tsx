import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InfoTooltip } from './InfoTooltip';
import { useMetrics } from '../hooks/useMetrics';

export const Overview: React.FC = () => {
  const { data: metrics, loading, error } = useMetrics();

  const regionData = metrics
    ? [
        { name: 'Медиана', wape: metrics.region_wape.p50 * 100 },
        { name: 'P75', wape: metrics.region_wape.p75 * 100 },
        { name: 'P90', wape: metrics.region_wape.p90 * 100 },
      ]
    : [];

  const districtData = metrics
    ? [
        { name: 'Медиана', wape: metrics.district_wape.p50 * 100 },
        { name: 'P75', wape: metrics.district_wape.p75 * 100 },
        { name: 'P90', wape: metrics.district_wape.p90 * 100 },
      ]
    : [];

  if (loading) {
    return <div className="card">Загрузка метрик...</div>;
  }
  if (error) {
    return <div className="card bg-red-50 border-red-200 text-red-700">Ошибка: {error}</div>;
  }
  if (!metrics) {
    return <div className="card text-gray-600">Нет данных. <a className="underline text-blue-600" href="https://github.com/granin/forecast-ui" target="_blank" rel="noreferrer">Документация</a></div>;
  }

  return (
    <div className="space-y-6" data-testid="screen-overview">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Card */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Точность прогноза по региону</h3>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Месячный WAPE</span>
              <InfoTooltip title="WAPE — средневзвешенная абсолютная процентная ошибка. Ниже — лучше." />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {regionData[0]?.wape.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Медиана</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {regionData[1]?.wape.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">P75</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-600">
                {regionData[2]?.wape.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">P90</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Bar dataKey="wape" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* District Card */}
        <div className="card">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1">Точность прогноза по районам</h3>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Месячный WAPE</span>
              <InfoTooltip title="WAPE — средневзвешенная абсолютная процентная ошибка. Ниже — лучше." />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {districtData[0]?.wape.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">Медиана</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">
                {districtData[1]?.wape.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">P75</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {districtData[2]?.wape.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-1">P90</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
              <Bar dataKey="wape" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">ℹ️</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">О метриках качества</h4>
            <p className="text-sm text-blue-800">
              <strong>WAPE</strong> (средневзвешенная абсолютная процентная ошибка) — основная метрика точности прогноза.
              Чем ниже значение, тем точнее прогноз. Региональный WAPE медиана {regionData[0]?.wape.toFixed(1)}%
              означает высокую точность прогнозирования месячных объёмов вывоза (по предоставленным данным).
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};
