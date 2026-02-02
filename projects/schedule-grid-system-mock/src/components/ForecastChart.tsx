import React, { useMemo } from 'react';
import { BarChart, LineChart } from './charts';
import type { Series, TargetLine } from './charts';
import { toPeriodSeries, type TimeUnit } from '../utils/charts/adapters';

interface ForecastChartProps {
  activeView: 'forecast' | 'deviations' | 'service';
  timeUnit?: TimeUnit;
  overlaySeries?: Series[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ activeView, timeUnit = 'day', overlaySeries = [] }) => {
  const dataset = useMemo(() => {
    const labels: string[] = [];
    const isoDates: string[] = [];
    const forecast: number[] = [];
    const plan: number[] = [];
    const deviations: number[] = [];
    const service: number[] = [];

    for (let day = 1; day <= 20; day += 1) {
      const label = `${String(day).padStart(2, '0')}.07`;
      labels.push(label);
      const iso = `2024-07-${String(day).padStart(2, '0')}`;
      isoDates.push(iso);

      const baseForecast = 120 + Math.sin(day * 0.3) * 20 + Math.random() * 10;
      const basePlan = 110 + Math.sin(day * 0.28) * 15 + Math.random() * 8;

      const forecastValue = Math.round(baseForecast);
      const planValue = Math.round(basePlan);
      const deviationValue = forecastValue - planValue;
      const serviceValue = Math.round(85 + Math.random() * 12);

      forecast.push(forecastValue);
      plan.push(planValue);
      deviations.push(deviationValue);
      service.push(serviceValue);
    }

    return { labels, isoDates, forecast, plan, deviations, service };
  }, []);

  const forecastSeries: Series[] = useMemo(() => [
    {
      id: 'forecast',
      label: 'Прогноз',
      unit: 'people',
      color: '#2563eb',
      area: true,
      points: dataset.labels.map((label, index) => ({ label, timestamp: dataset.isoDates[index], value: dataset.forecast[index] })),
    },
    {
      id: 'plan',
      label: 'План',
      unit: 'people',
      color: '#16a34a',
      points: dataset.labels.map((label, index) => ({ label, timestamp: dataset.isoDates[index], value: dataset.plan[index] })),
    },
  ], [dataset]);

  const serviceSeries: Series[] = useMemo(() => [
    {
      id: 'service',
      label: 'Уровень сервиса',
      unit: 'percent',
      color: '#f59e0b',
      area: true,
      points: dataset.labels.map((label, index) => ({ label, timestamp: dataset.isoDates[index], value: dataset.service[index] })),
    },
  ], [dataset]);

  const deviationSeries: Series[] = useMemo(() => [
    {
      id: 'deviations',
      label: 'Отклонения',
      unit: 'people',
      color: '#2563eb',
      points: dataset.labels.map((label, index) => ({
        label,
        value: dataset.deviations[index],
        metadata: {
          color: dataset.deviations[index] >= 0 ? '#059669' : '#dc2626',
          viewId: 'deviations',
        },
      })),
    },
  ], [dataset]);

  const serviceTarget: TargetLine[] = useMemo(
    () => [{ label: 'Цель 90%', value: 90, style: 'dashed', color: '#475569' }],
    [],
  );

  const timeScale = timeUnit === 'day' ? 'day' : timeUnit;
  const groupedForecast = useMemo(
    () => (timeUnit === 'day' ? forecastSeries : toPeriodSeries(forecastSeries, { unit: timeUnit })),
    [forecastSeries, timeUnit],
  );
  const groupedService = useMemo(
    () => (timeUnit === 'day' ? serviceSeries : toPeriodSeries(serviceSeries, { unit: timeUnit })),
    [serviceSeries, timeUnit],
  );

  if (activeView === 'deviations') {
    return (
      <BarChart
        labels={dataset.labels}
        series={deviationSeries}
        ariaTitle="Отклонения прогноза"
        ariaDesc="Разница между прогнозом и планом по дням"
        yUnit="people"
        className="h-full border-0 bg-transparent p-0"
        chartHeightClass="h-full"
      />
    );
  }

  if (activeView === 'service') {
    return (
      <LineChart
        labels={[]}
        series={[...groupedService]}
        targets={serviceTarget}
        clamp={{ min: 70, max: 100 }}
        ariaTitle="Уровень сервиса"
        ariaDesc="Динамика уровня сервиса с целевым значением"
        yUnit="percent"
        timeScale={timeUnit === 'day' ? 'day' : timeScale}
        className="h-full border-0 bg-transparent p-0"
        chartHeightClass="h-full"
      />
    );
  }

  return (
    <LineChart
      labels={[]}
      series={[...groupedForecast, ...overlaySeries]}
      ariaTitle="Прогноз и план"
      ariaDesc="Сравнение прогноза нагрузки и плана по дням"
      yUnit="people"
      timeScale={timeUnit === 'day' ? 'day' : timeScale}
      className="h-full border-0 bg-transparent p-0"
      chartHeightClass="h-full"
    />
  );
};

export default ForecastChart;
