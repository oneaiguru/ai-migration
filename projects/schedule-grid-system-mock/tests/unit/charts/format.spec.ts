import { describe, expect, it } from 'vitest';
import { formatNumber, formatPercent, formatHours, formatTooltipValue } from '@/utils/charts/format';

describe('charts/format', () => {
  it('formats numbers with RU locale', () => {
    expect(formatNumber(1234.56)).toBe('1 234,6');
  });

  it('handles invalid numbers', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
  });

  it('formats percents with fixed fraction digits', () => {
    expect(formatPercent(92.34)).toBe('92,3%');
  });

  it('formats hours with suffix', () => {
    expect(formatHours(7.75)).toBe('7,8 ч');
  });

  it('formats tooltip values by unit', () => {
    expect(formatTooltipValue(88, 'percent')).toBe('88,0%');
    expect(formatTooltipValue(12.4, 'hours')).toBe('12,4 ч');
    expect(formatTooltipValue(250, 'people')).toBe('250');
  });
});
