import { describe, expect, it } from 'vitest';
import { buildForecastVsFactSeries, buildSeasonalitySeries } from '../../src/adapters/forecasting/trends';
import { createTemplateExport, createTrendExport } from '../../src/services/forecastingApi';
import { trendSeriesByQueue, trendSeedDefaults } from '../../src/data/forecastingFixtures';
import type { TrendDataPoint } from '../../src/types/trends';

const sample: TrendDataPoint[] = Array.from({ length: 4 }, (_, idx) => ({
  timestamp: new Date(2025, 9, 20, idx),
  value: 100 + idx * 5,
  forecast: 102 + idx * 4,
  trend: 101 + idx * 3,
  seasonal: 5,
  residual: 2,
  confidence: 0.82,
}));

describe('buildForecastVsFactSeries', () => {
  it('returns band, trend, and secondary axis metadata', () => {
    const result = buildForecastVsFactSeries(sample);
    expect(result.band).toBeDefined();
    expect(result.band?.upper).toHaveLength(sample.length);
    expect(result.trend?.axis).toBe('secondary');
    expect(result.secondaryAxis?.unit).toBe('percent');
  });

  it('injects service-level target when provided', () => {
    const targetValue = 87;
    const result = buildForecastVsFactSeries(sample, targetValue);
    expect(result.target?.value).toBe(targetValue);
  });
});

describe('buildSeasonalitySeries', () => {
  it('creates stacked series for hourly values', () => {
    const values = [90, 95, 110];
    const seasonality = buildSeasonalitySeries(values);
    expect(seasonality.categories).toEqual(['0:00', '1:00', '2:00']);
    expect(seasonality.series[0].points[0].metadata?.stack).toBe('negative');
  });
});

describe('createTrendExport', () => {
  it('exports queue-specific rows within period', () => {
    const queue = trendSeriesByQueue[0];
    const payload = createTrendExport({
      organizationId: 'demo',
      queueIds: [queue.queueId],
      period: trendSeedDefaults.period,
      mode: 'strategic',
    });
    expect(payload.content).toContain(queue.queueId);
    expect(payload.content.split('\n').length).toBeGreaterThan(2);
  });

  it('includes timezone metadata when provided', () => {
    const queue = trendSeriesByQueue[0];
    const payload = createTrendExport({
      organizationId: 'demo',
      queueIds: [queue.queueId],
      period: trendSeedDefaults.period,
      mode: 'strategic',
      timezoneId: 'europe-moscow',
    });
    expect(payload.content.startsWith('# timezone=UTC+03')).toBe(true);
    expect(payload.filename).toContain('UTC+03');
  });
});

describe('createTemplateExport', () => {
  it('builds CSV content with RU formatted absenteeism values', () => {
    const period = trendSeedDefaults.period;
    const payload = createTemplateExport('absenteeism', ['support'], period);

    expect(payload.filename).toMatch(/template_absenteeism_\d{4}-\d{2}-\d{2}\.csv/);
    const [header, firstRow] = payload.content.split('\n');
    expect(header).toBe('date,queue_id,value_percent');
    expect(firstRow?.split(',')[2]).toMatch(/\d+(,\d)?/);
  });

  it('normalises queue selection for forecast templates', () => {
    const period = trendSeedDefaults.period;
    const payload = createTemplateExport('forecast', [], period);

    const lines = payload.content.split('\n');
    expect(lines.length).toBeGreaterThan(2);
    expect(payload.mimeType).toBe('text/csv;charset=utf-8');
  });
});
