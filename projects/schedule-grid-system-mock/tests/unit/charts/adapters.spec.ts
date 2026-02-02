import { describe, expect, it } from 'vitest';
import { toLineSeries, toBarDatasets, toTargetLines, toPeriodSeries, deriveHeadcountSeries, deriveFteHoursSeries } from '@/utils/charts/adapters';

describe('charts/adapters', () => {
  it('normalises line series', () => {
    const result = toLineSeries({
      series: [
        {
          id: 'coverage',
          label: 'Покрытие',
          unit: 'percent',
          points: [
            { timestamp: '2025-07-01', value: 82 },
            { timestamp: '2025-07-02', value: 83 },
          ],
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0].points[0]).toEqual({ timestamp: '2025-07-01', value: 82 });
  });

  it('normalises bar datasets with labels', () => {
    const { labels, series } = toBarDatasets({
      labels: ['Пн', 'Вт'],
      series: [
        {
          id: 'coverage',
          label: 'Покрытие',
          points: [
            { label: 'Пн', value: 80 },
            { label: 'Вт', value: 82 },
          ],
        },
      ],
    });

    expect(labels).toEqual(['Пн', 'Вт']);
    expect(series[0].points[1]?.label).toBe('Вт');
  });

  it('normalises target lines', () => {
    const targets = toTargetLines([
      { label: 'Цель 90%', value: 90, style: 'dashed' },
    ]);

    expect(targets).toEqual([
      { label: 'Цель 90%', value: 90, style: 'dashed', color: undefined, series: undefined },
    ]);
  });

  it('groups series by week (percent → average)', () => {
    const input = [{
      id: 'service',
      label: 'SL',
      unit: 'percent' as const,
      points: [
        { timestamp: '2025-07-01', value: 80 },
        { timestamp: '2025-07-02', value: 90 },
        { timestamp: '2025-07-08', value: 100 },
      ],
    }];

    const out = toPeriodSeries(input as any, { unit: 'week' });
    expect(out[0].points.length).toBe(2);
    const first = out[0].points[0]!; // week 27
    const second = out[0].points[1]!; // week 28
    expect(first.label).toMatch(/^2025-W\d{2}$/);
    expect(Math.round(first.value)).toBe(85); // (80+90)/2
    expect(second.label).toMatch(/^2025-W\d{2}$/);
    expect(second.value).toBe(100);
  });

  it('groups series by month (people → sum)', () => {
    const input = [{
      id: 'forecast',
      label: 'Прогноз',
      unit: 'people' as const,
      points: [
        { timestamp: '2025-07-01', value: 10 },
        { timestamp: '2025-07-10', value: 15 },
        { timestamp: '2025-08-01', value: 20 },
      ],
    }];

    const out = toPeriodSeries(input as any, { unit: 'month' });
    expect(out[0].points.length).toBe(2);
    const july = out[0].points[0]!;
    const aug = out[0].points[1]!;
    expect(july.label).toBe('2025-07');
    expect(july.value).toBe(25);
    expect(aug.label).toBe('2025-08');
    expect(aug.value).toBe(20);
  });

  it('derives headcount and FTE hours from schedules', () => {
    const dates = ['2025-07-01', '2025-07-02'];
    const schedules = [
      { date: '2025-07-01', employeeId: 'e1', duration: 240 },
      { date: '2025-07-01', employeeId: 'e2', duration: 300 },
      { date: '2025-07-02', employeeId: 'e1', duration: 120 },
    ];

    const headcount = deriveHeadcountSeries(dates, schedules as any);
    const fte = deriveFteHoursSeries(dates, schedules as any);

    expect(headcount.points.map((p) => p.value)).toEqual([2, 1]);
    expect(fte.points.map((p) => p.value)).toEqual([9, 2]); // (240+300)/60, 120/60
    expect(headcount.unit).toBe('people');
    expect(fte.unit).toBe('hours');
  });
});
