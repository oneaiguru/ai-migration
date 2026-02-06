import type { Unit } from '../../components/charts/types';

export const DEFAULT_LOCALE = 'ru-RU';
const FALLBACK_NUMBER = '—';

const isFiniteNumber = (value: unknown): value is number => Number.isFinite(value as number);

const buildNumberFormatter = (
  locale: string,
  fractionDigits: number,
  overrides: Intl.NumberFormatOptions = {},
): Intl.NumberFormat =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
    ...overrides,
  });

const toDate = (input: string | Date | number): Date | null => {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof input === 'string') {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const formatNumber = (
  value: number,
  fractionDigits = 1,
  locale = DEFAULT_LOCALE,
  overrides: Intl.NumberFormatOptions = {},
): string => {
  if (!isFiniteNumber(value)) return FALLBACK_NUMBER;
  return buildNumberFormatter(locale, fractionDigits, overrides).format(value);
};

export const formatPercent = (value: number, fractionDigits = 1, locale = DEFAULT_LOCALE): string => {
  if (!isFiniteNumber(value)) return FALLBACK_NUMBER;
  return `${formatNumber(value, fractionDigits, locale)}%`;
};

export const formatHours = (value: number, fractionDigits = 1, locale = DEFAULT_LOCALE): string => {
  if (!isFiniteNumber(value)) return FALLBACK_NUMBER;
  return `${formatNumber(value, fractionDigits, locale)} ч`;
};

export const formatWithUnit = (
  value: number,
  unit: Unit,
  fractionDigits = 1,
  locale = DEFAULT_LOCALE,
): string => {
  if (!isFiniteNumber(value)) return FALLBACK_NUMBER;
  switch (unit) {
    case 'hours':
      return formatHours(value, fractionDigits, locale);
    case 'percent':
      return formatPercent(value, fractionDigits, locale);
    default:
      return formatNumber(value, fractionDigits, locale);
  }
};

export const formatDate = (input: string | Date | number, locale = DEFAULT_LOCALE): string => {
  const date = toDate(input);
  if (!date) return '';
  return date.toLocaleDateString(locale);
};

export const formatDateTime = (input: string | Date | number, locale = DEFAULT_LOCALE): string => {
  const date = toDate(input);
  if (!date) return '';
  return date.toLocaleString(locale);
};

export const formatMonthShort = (input: string | Date | number, locale = DEFAULT_LOCALE): string => {
  const date = toDate(input);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
};

export const formatTooltipTitle = (
  input: string | Date | number,
  locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' },
): string => {
  const date = toDate(input);
  if (!date) return typeof input === 'string' ? input : '';
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatTooltipValue = (
  value: number,
  unit: Unit,
  fractionDigits = 1,
  locale = DEFAULT_LOCALE,
): string => formatWithUnit(value, unit, fractionDigits, locale);

export const sanitizeDatasetLabel = (label?: string): string => label?.trim() || '—';
