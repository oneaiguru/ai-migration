import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  formatDate,
  formatDateTime,
  formatHours,
  formatMonthShort,
  formatNumber,
  formatPercent,
  formatTooltipValue,
  formatWithUnit,
  sanitizeDatasetLabel,
} from '../../../src/utils/charts/format';

describe('charts formatters', () => {
  it('formats numbers with fixed fraction digits', () => {
    expect(formatNumber(123.456, 1)).toBe('123,5');
    expect(formatNumber(123.456, 2)).toBe('123,46');
  });

  it('returns fallback for non-finite numbers', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatPercent(Number.POSITIVE_INFINITY)).toBe('—');
    expect(formatHours(Number.NEGATIVE_INFINITY)).toBe('—');
  });

  it('formats percent and hours with Russian suffixes', () => {
    expect(formatPercent(75.5)).toBe('75,5%');
    expect(formatHours(10.25)).toBe('10,3 ч');
  });

  it('formats values based on unit', () => {
    expect(formatWithUnit(8.75, 'hours')).toBe('8,8 ч');
    expect(formatWithUnit(92.1, 'percent')).toBe('92,1%');
    expect(formatWithUnit(42, 'people')).toBe('42,0');
  });

  it('formats date values in Russian locale', () => {
    expect(formatDate('2025-10-12')).toBe('12.10.2025');
    expect(formatDate(1_697_068_800_000)).toBe('12.10.2023');
    expect(formatDateTime('2025-10-12T15:30:00Z', DEFAULT_LOCALE)).toContain('12.10.2025');
    expect(formatMonthShort('2025-03-01')).toContain('1');
  });

  it('formats tooltip values with unit', () => {
    expect(formatTooltipValue(88.4, 'percent')).toBe('88,4%');
  });

  it('sanitizes dataset labels', () => {
    expect(sanitizeDatasetLabel('  Покрытие ')).toBe('Покрытие');
    expect(sanitizeDatasetLabel(undefined)).toBe('—');
  });
});
