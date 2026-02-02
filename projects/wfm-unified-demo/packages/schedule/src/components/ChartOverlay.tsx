import React, { useMemo, useState } from 'react';
import { BarChart, LineChart } from './charts';
import type { Series, TargetLine } from './charts';
import { toPeriodSeries, type TimeUnit } from '../utils/charts/adapters';

interface ChartOverlayProps {
  dates: Array<{ day: number; dateString: string }>;
  overlaySeries?: Series[]; // optional headcount/FTE overlays from container
}

const ChartOverlay: React.FC<ChartOverlayProps> = ({ dates, overlaySeries = [] }) => {
  const [activeView, setActiveView] = useState<'forecast' | 'deviations' | 'service'>('forecast');
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');
  const [showHeadcount, setShowHeadcount] = useState(false);
  const [showFte, setShowFte] = useState(false);

  const data = useMemo(() => {
    const slice = dates.slice(0, 20);
    const labels = slice.map((entry) => entry.dateString);

    const forecast: number[] = [];
    const plan: number[] = [];
    const deviations: number[] = [];
    const service: number[] = [];

    slice.forEach((entry, index) => {
      const baseForecast = 120 + Math.sin(index * 0.3) * 18 + Math.random() * 6;
      const basePlan = 112 + Math.sin(index * 0.25) * 14 + Math.random() * 5;

      const forecastValue = Math.round(baseForecast);
      const planValue = Math.round(basePlan);
      const deviationValue = forecastValue - planValue;
      const serviceValue = Math.round(86 + Math.random() * 10);

      forecast.push(forecastValue);
      plan.push(planValue);
      deviations.push(deviationValue);
      service.push(serviceValue);
    });

    return { labels, forecast, plan, deviations, service };
  }, [dates]);

  const forecastSeries: Series[] = useMemo(() => [
    {
      id: 'forecast',
      label: 'Прогноз',
      unit: 'people',
      color: '#1d4ed8',
      points: data.labels.map((label, index) => ({ label, timestamp: label, value: data.forecast[index] })),
    },
    {
      id: 'plan',
      label: 'План',
      unit: 'people',
      color: '#059669',
      points: data.labels.map((label, index) => ({ label, timestamp: label, value: data.plan[index] })),
    },
  ], [data]);

  const deviationSeries: Series[] = useMemo(() => [
    {
      id: 'deviations',
      label: 'Отклонения',
      unit: 'people',
      color: '#1d4ed8',
      points: data.labels.map((label, index) => ({
        label,
        value: data.deviations[index],
        metadata: {
          color: data.deviations[index] >= 0 ? '#059669' : '#dc2626',
          viewId: 'deviations',
        },
      })),
    },
  ], [data]);

  const serviceSeries: Series[] = useMemo(() => [
    {
      id: 'service',
      label: 'Уровень сервиса',
      unit: 'percent',
      color: '#f59e0b',
      points: data.labels.map((label, index) => ({ label, timestamp: label, value: data.service[index] })),
    },
  ], [data]);

  const serviceTarget: TargetLine[] = useMemo(
    () => [{ label: 'Цель 90%', value: 90, style: 'dashed', color: '#475569' }],
    [],
  );

  // Apply grouping if needed and attach overlays
  const timeScale = timeUnit === 'day' ? 'day' : timeUnit;
  const groupedForecast = useMemo(
    () => (timeUnit === 'day' ? forecastSeries : toPeriodSeries(forecastSeries, { unit: timeUnit })),
    [forecastSeries, timeUnit],
  );
  const groupedService = useMemo(
    () => (timeUnit === 'day' ? serviceSeries : toPeriodSeries(serviceSeries, { unit: timeUnit })),
    [serviceSeries, timeUnit],
  );

  const extraOverlays = useMemo(() => {
    const selected: Series[] = [];
    const byId = new Map(overlaySeries.map((s) => [s.id, s] as const));
    if (showHeadcount && byId.has('headcount')) selected.push(byId.get('headcount')!);
    if (showFte && byId.has('fte')) selected.push(byId.get('fte')!);
    return timeUnit === 'day' ? selected : toPeriodSeries(selected, { unit: timeUnit });
  }, [overlaySeries, showFte, showHeadcount, timeUnit]);

  //

  return (
    <div className="schedule-chart-overlay border-b-2 border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-4">
          <button
            type="button"
            className={`px-3 py-1 text-sm font-medium rounded ${
              activeView === 'forecast' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('forecast')}
          >
            Прогноз + план
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm rounded ${
              activeView === 'deviations' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('deviations')}
          >
            Отклонения
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-sm rounded ${
              activeView === 'service' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveView('service')}
          >
            Уровень сервиса (SL)
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div role="tablist" aria-label="Группировка времени" className="flex gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={timeUnit === 'day'}
              className={`px-2 py-0.5 rounded ${timeUnit === 'day' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setTimeUnit('day')}
            >
              День
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={timeUnit === 'week'}
              className={`px-2 py-0.5 rounded ${timeUnit === 'week' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setTimeUnit('week')}
            >
              Период
            </button>
          </div>
          <label className="flex items-center gap-1">
            <input type="checkbox" className="w-3 h-3" checked={showHeadcount} onChange={(e) => setShowHeadcount(e.target.checked)} />
            <span>Σ</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" className="w-3 h-3" checked={showFte} onChange={(e) => setShowFte(e.target.checked)} />
            <span>123</span>
          </label>
        </div>
      </div>

      <div className="h-36 rounded border border-gray-200 bg-white p-2">
        {activeView === 'deviations' ? (
          <BarChart
            labels={data.labels}
            series={deviationSeries}
            yUnit="people"
            ariaTitle="Отклонения"
            ariaDesc="Разница между прогнозом и планом"
            className="h-full border-0 bg-transparent p-0"
            chartHeightClass="h-full"
          />
        ) : activeView === 'service' ? (
          <LineChart
            labels={[]}
            series={[...groupedService]}
            targets={serviceTarget}
            clamp={{ min: 70, max: 100 }}
            yUnit="percent"
            timeScale={timeScale}
            ariaTitle="Уровень сервиса"
            ariaDesc="Динамика уровня сервиса"
            className="h-full border-0 bg-transparent p-0"
            chartHeightClass="h-full"
          />
        ) : (
          <LineChart
            labels={[]}
            series={[...groupedForecast, ...extraOverlays]}
            yUnit="people"
            timeScale={timeScale}
            ariaTitle="Прогноз и план"
            ariaDesc="Сравнение прогнозных и плановых значений"
            className="h-full border-0 bg-transparent p-0"
            chartHeightClass="h-full"
          />
        )}
      </div>
    </div>
  );
};

export default ChartOverlay;
