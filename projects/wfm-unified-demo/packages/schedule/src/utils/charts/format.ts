export const DEFAULT_LOCALE = 'ru-RU';

export const formatNumber = (value: number, minimumFractionDigits = 0, maximumFractionDigits = 1): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

export const formatPercent = (value: number, fractionDigits = 1): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `${formatNumber(value, fractionDigits, fractionDigits)}%`;
};

export const formatHours = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  return `${formatNumber(value, 0, 1)} ч`;
};

export const formatTooltipTitle = (
  input: string | number | Date,
  locale: string = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string => {
  if (typeof input === 'number') {
    return formatNumber(input);
  }

  const date = typeof input === 'string' ? new Date(input) : input;
  if (!Number.isFinite(date.getTime())) {
    return String(input);
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const formatTooltipValue = (value: number, unit: 'hours' | 'percent' | 'people' = 'percent'): string => {
  if (!Number.isFinite(value)) {
    return '—';
  }

  switch (unit) {
    case 'hours':
      return formatHours(value);
    case 'people':
      return formatNumber(value, 0, 0);
    default:
      return formatPercent(value, 1);
  }
};

export const sanitizeDatasetLabel = (label: string): string => label.replace(/[\s]+/g, ' ').trim();
