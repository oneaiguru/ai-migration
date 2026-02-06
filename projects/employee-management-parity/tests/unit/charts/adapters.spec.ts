import { describe, expect, it } from 'vitest';
import {
  toBarDatasets,
  toDoughnutDataset,
  toLineSeries,
  toTargetLines,
} from '../../../src/utils/charts/adapters';

describe('charts adapters', () => {
  it('normalises line series with fallback unit', () => {
    const series = toLineSeries({
      series: [
        {
          id: 'coverage',
          label: 'Покрытие',
          points: [
            { timestamp: '2025-10-10', value: 82.5 },
            { timestamp: '2025-10-11', value: 84.1 },
          ],
        },
      ],
    }, { unit: 'percent' });

    expect(series).toHaveLength(1);
    expect(series[0]?.points).toHaveLength(2);
    expect(series[0]?.unit).toBe('percent');
    expect(series[0]?.points[0]?.value).toBe(82.5);
  });

  it('converts bar domain to datasets and labels', () => {
    const { labels, datasets } = toBarDatasets({
      labels: ['Пн', 'Вт'],
      series: [
        { id: 'planned', label: 'План', values: [80, 82], color: '#2563eb' },
        { id: 'actual', label: 'Факт', values: [78, 81], color: '#16a34a' },
      ],
    });

    expect(labels).toEqual(['Пн', 'Вт']);
    expect(datasets).toHaveLength(2);
    expect(datasets[0]?.data).toEqual([80, 82]);
    expect(datasets[0]?.backgroundColor).toBe('#2563eb');
  });

  it('produces doughnut dataset with labels and colors', () => {
    const result = toDoughnutDataset({
      items: [
        { label: 'Голосовой', value: 45, color: '#2563eb' },
        { label: 'Чат', value: 30, color: '#0ea5e9' },
      ],
    });

    expect(result.labels).toEqual(['Голосовой', 'Чат']);
    expect(result.data).toEqual([45, 30]);
    expect(result.colors).toEqual(['#2563eb', '#0ea5e9']);
  });

  it('normalises target lines with defaults', () => {
    const targets = toTargetLines([
      { label: 'Цель', value: 85, style: 'dashed' },
      { value: 90 },
    ]);

    expect(targets).toHaveLength(2);
    expect(targets[0]?.label).toBe('Цель');
    expect(targets[1]?.label).toBe('Цель 2');
    expect(targets[0]?.style).toBe('dashed');
  });
});
