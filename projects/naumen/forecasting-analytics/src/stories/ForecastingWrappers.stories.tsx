import React from 'react';
import { KpiCardGrid, LineChart, BarChart, ReportTable } from '../components/charts';
import { buildAccuracyKpiItems, buildAccuracyTrendSeries, buildAdjustmentTable } from '../adapters/forecasting';
import type { AccuracyMetrics } from '../types/accuracy';

const metrics: AccuracyMetrics = {
  mape: 12.3,
  mae: 18.5,
  rmse: 26.1,
  bias: -1.8,
  rSquared: 0.88,
  confidenceInterval: { lower: 10, upper: 15, level: 95 },
  pValue: 0.018,
  sampleSize: 240,
};

const baseHistory = [
  {
    date: '2025-10-20',
    algorithmId: 'arima' as const,
    metrics,
    dataPoints: 24,
  },
  {
    date: '2025-10-21',
    algorithmId: 'arima' as const,
    metrics: { ...metrics, mape: 14.1 },
    dataPoints: 24,
  },
  {
    date: '2025-10-20',
    algorithmId: 'linear_regression' as const,
    metrics: { ...metrics, mape: 16.4 },
    dataPoints: 24,
  },
];

const adjustmentTable = buildAdjustmentTable([
  {
    id: 'slot-1',
    timeSlot: '20.10.2025 08:00',
    predicted: 120,
    adjustment: 10,
    total: 130,
    requiredAgents: 23,
    confidence: 92,
    status: 'Рабочий день',
  },
  {
    id: 'slot-2',
    timeSlot: '20.10.2025 09:00',
    predicted: 140,
    adjustment: -5,
    total: 135,
    requiredAgents: 26,
    confidence: 88,
    status: 'Рабочий день',
  },
]);

type Story = {
  render: () => React.ReactElement;
};

export default {
  title: 'Forecasting/Wrappers Showcase',
};

export const AccuracyKpiGrid: Story = {
  render: () => (
    <KpiCardGrid
      items={buildAccuracyKpiItems(metrics)}
      ariaTitle="Карточки точности"
      ariaDesc="Пример отображения KPI"
    />
  ),
};

export const AccuracyTrend: Story = {
  render: () => {
    const { series, yUnit } = buildAccuracyTrendSeries({
      history: baseHistory,
      selectedMetric: 'mape',
      algorithmLabels: { arima: 'ARIMA', linear_regression: 'Линейная регрессия' },
    });

    return (
      <div style={{ height: 260 }}>
        <LineChart series={series} yUnit={yUnit} timeScale="day" area />
      </div>
    );
  },
};

export const AdjustmentTable: Story = {
  render: () => (
    <ReportTable
      columns={adjustmentTable.columns}
      rows={adjustmentTable.rows}
      ariaTitle="Таблица корректировок"
      ariaDesc="Демонстрация таблицы отчётности"
    />
  ),
};

export const SeasonalityBars: Story = {
  render: () => (
    <div style={{ height: 260 }}>
      <BarChart
        series={[{
          id: 'seasonality',
          label: 'Сезонность',
          unit: 'percent',
          points: Array.from({ length: 10 }, (_, index) => ({
            label: `Час ${index}`,
            value: 90 + index,
          })),
        }]}
        yUnit="percent"
        ariaTitle="Сезонность"
        ariaDesc="Пример сезонного распределения"
      />
    </div>
  ),
};
