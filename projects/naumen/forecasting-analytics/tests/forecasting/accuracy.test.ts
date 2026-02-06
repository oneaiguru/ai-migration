import { describe, expect, it } from 'vitest';
import {
  buildAccuracyKpiItems,
  buildAccuracyTrendSeries,
  buildErrorAnalysisSeries,
  buildForecastDetailTable,
} from '../../src/adapters/forecasting';
import { createAccuracyExport } from '../../src/services/forecastingApi';
import type {
  AccuracyMetrics,
  HistoricalAccuracy,
  ForecastDataPoint,
} from '../../src/types/accuracy';
import type { ForecastDetailRow } from '../../src/types/forecasting';

const baseMetrics: AccuracyMetrics = {
  mape: 12,
  mae: 18,
  rmse: 22,
  bias: -1,
  rSquared: 0.9,
  confidenceInterval: { lower: 8, upper: 16, level: 95 },
  pValue: 0.02,
  sampleSize: 120,
};

describe('buildAccuracyKpiItems', () => {
  it('creates five KPI items with trend metadata', () => {
    const items = buildAccuracyKpiItems(baseMetrics, {
      ...baseMetrics,
      mape: 15,
      rSquared: 0.85,
    });

    expect(items).toHaveLength(5);
    expect(items[0]).toMatchObject({ label: 'MAPE', value: '12,0 %', trend: 'up' });
    expect(items[4]).toMatchObject({ label: 'R²', trend: 'up' });
  });
});

describe('buildAccuracyTrendSeries', () => {
  const history: HistoricalAccuracy[] = [
    {
      date: '2025-10-20',
      algorithmId: 'arima',
      metrics: { ...baseMetrics, mape: 10 },
      dataPoints: 24,
    },
    {
      date: '2025-10-21',
      algorithmId: 'arima',
      metrics: { ...baseMetrics, mape: 11 },
      dataPoints: 24,
    },
    {
      date: '2025-10-20',
      algorithmId: 'linear_regression',
      metrics: { ...baseMetrics, mape: 14 },
      dataPoints: 24,
    },
  ];

  it('produces series for each algorithm with sorted timestamps', () => {
    const { series, yUnit } = buildAccuracyTrendSeries({
      history,
      selectedMetric: 'mape',
      algorithms: ['arima', 'linear_regression'],
      algorithmLabels: {
        arima: 'ARIMA',
        linear_regression: 'Линейная регрессия',
      },
    });

    expect(series).toHaveLength(2);
    expect(yUnit).toBe('percent');
    expect(series[0].points[0].timestamp <= series[0].points[1].timestamp).toBe(true);
  });
});

describe('buildErrorAnalysisSeries', () => {
  const data: ForecastDataPoint[] = Array.from({ length: 24 }, (_, index) => ({
    timestamp: new Date(2025, 9, 20, index).toISOString(),
    predicted: 100 + index,
    actual: 90 + index,
  }));

  it('creates view toggles and series per view', () => {
    const result = buildErrorAnalysisSeries({ forecastData: data });

    expect(result.viewToggle).toHaveLength(3);
    expect(result.series).toHaveLength(3);
    expect(result.series[0].points[0]).toHaveProperty('metadata.viewId', 'time');
  });
});

describe('buildForecastDetailTable', () => {
  const rows: ForecastDetailRow[] = [
    {
      id: 'slot-1',
      timestamp: new Date(2025, 9, 20, 10, 30).toISOString(),
      forecast: 150,
      actual: 162,
      absenteeismPercent: 6.4,
      lostCalls: 3,
      ahtSeconds: 315,
      serviceLevel: 89.2,
    },
  ];

  it('formats forecast detail rows using Russian locale', () => {
    const table = buildForecastDetailTable(rows);

    expect(table.columns).toHaveLength(9);
    expect(table.rows).toHaveLength(1);
    expect(table.rows[0]).toMatchObject({
      time: '10:30',
      forecast: '150',
      actual: '162',
      abs: '12',
      rel: '8,0 %',
      absenteeism: '6,4 %',
      lostCalls: '3',
      aht: '315',
      sl: '89,2 %',
    });
  });
});

describe('createAccuracyExport', () => {
  it('returns CSV with expected header columns', async () => {
    const payload = await createAccuracyExport();
    expect(payload.content.split('\n')[0]).toBe('timestamp,forecast,actual,absenteeism_percent,lost_calls,aht_seconds,service_level');
  });

  it('produces non-empty dataset for bell notifications to consume', async () => {
    const payload = await createAccuracyExport();
    expect(payload.content.split('\n').length).toBeGreaterThan(2);
    expect(payload.filename).toMatch(/accuracy_\d{4}-\d{2}-\d{2}\.csv/);
  });
});
