import type { ForecastTimezoneOption } from '../types/forecasting';

const MINUTES_IN_HOUR = 60;

const clampDateSegments = (value: number) => Number.isFinite(value) ? value : 0;

export const formatUtcOffset = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / MINUTES_IN_HOUR)
    .toString()
    .padStart(2, '0');
  const minutes = (absoluteMinutes % MINUTES_IN_HOUR)
    .toString()
    .padStart(2, '0');
  return `UTC${sign}${hours}${minutes === '00' ? '' : `:${minutes}`}`;
};

export const timezoneShortLabel = (timezone: ForecastTimezoneOption): string =>
  timezone.shortLabel || formatUtcOffset(timezone.offsetMinutes);

export const convertDateInputToUtcIso = (value: string, offsetMinutes: number): string => {
  if (!value) return '';
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = clampDateSegments(Number(yearStr));
  const month = clampDateSegments(Number(monthStr)) - 1;
  const day = clampDateSegments(Number(dayStr));
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return '';
  }
  const utcTimestamp = Date.UTC(year, month, day, 0, 0, 0);
  const adjusted = utcTimestamp - offsetMinutes * 60 * 1000;
  return new Date(adjusted).toISOString();
};

export const convertUtcIsoToDateInput = (iso: string, offsetMinutes: number): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const adjusted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return adjusted.toISOString().slice(0, 10);
};

export const convertDateTimeInputToUtcIso = (value: string, offsetMinutes: number): string => {
  if (!value) return '';
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) {
    return '';
  }
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const [hourStr, minuteStr] = timePart.split(':');
  const year = clampDateSegments(Number(yearStr));
  const month = clampDateSegments(Number(monthStr)) - 1;
  const day = clampDateSegments(Number(dayStr));
  const hours = clampDateSegments(Number(hourStr));
  const minutes = clampDateSegments(Number(minuteStr));
  if ([year, month, day, hours, minutes].some((segment) => Number.isNaN(segment))) {
    return '';
  }
  const utcTimestamp = Date.UTC(year, month, day, hours, minutes, 0);
  const adjusted = utcTimestamp - offsetMinutes * 60 * 1000;
  return new Date(adjusted).toISOString();
};

export const convertUtcIsoToDateTimeInput = (iso: string, offsetMinutes: number): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const adjusted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return adjusted.toISOString().slice(0, 16);
};

export const shiftIsoByOffset = (iso: string, offsetMinutes: number): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return shifted.toISOString();
};

export const ensureTimezone = (
  all: ForecastTimezoneOption[],
  id: string | undefined,
  fallbackId: string,
): ForecastTimezoneOption => {
  const byId = all.find((option) => option.id === id);
  if (byId) {
    return byId;
  }
  const fallback = all.find((option) => option.id === fallbackId);
  if (fallback) {
    return fallback;
  }
  if (all.length) {
    return all[0];
  }
  return {
    id: fallbackId,
    label: fallbackId,
    shortLabel: formatUtcOffset(0),
    offsetMinutes: 0,
  };
};
