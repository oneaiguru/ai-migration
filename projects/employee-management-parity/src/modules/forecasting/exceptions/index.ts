import { cloneDeep } from 'lodash-es';
import type { ForecastSeries } from '../types';

export type ExceptionMode = 'day' | 'interval';
export type ExceptionRecurrence = 'once' | 'weekly' | 'monthly';

export interface ExceptionInterval {
  startTime: string;
  endTime: string;
  deltaPercent: number;
}

export interface ExceptionTemplate {
  id: string;
  title: string;
  description: string;
  mode: ExceptionMode;
  recurrence: ExceptionRecurrence;
  startDate: string;
  endDate: string;
  defaultDeltaPercent: number;
  intervals?: ExceptionInterval[];
  reason: string;
  tags: string[];
}

export interface ExceptionServiceOptions {
  delayMs?: number;
}

const EXCEPTION_TEMPLATES: ExceptionTemplate[] = [
  {
    id: 'promo-week',
    title: 'Промо неделя',
    description: 'Повышенный входящий поток во время маркетинговой кампании',
    mode: 'day',
    recurrence: 'weekly',
    startDate: '2025-11-04',
    endDate: '2025-12-02',
    defaultDeltaPercent: 0.18,
    reason: 'Маркетинг',
    tags: ['Реклама', 'Пик'],
  },
  {
    id: 'holiday',
    title: 'Праздничный штурм',
    description: 'Двухдневный всплеск обращений вокруг праздников',
    mode: 'interval',
    recurrence: 'once',
    startDate: '2025-12-30',
    endDate: '2025-12-31',
    defaultDeltaPercent: 0.25,
    intervals: [
      { startTime: '08:00', endTime: '13:30', deltaPercent: 0.32 },
      { startTime: '17:00', endTime: '22:00', deltaPercent: 0.28 },
    ],
    reason: 'Праздники',
    tags: ['Сезонность'],
  },
  {
    id: 'night-maintenance',
    title: 'Ночная профилактика',
    description: 'Плановое снижение трафика из-за обслуживаемых каналов',
    mode: 'interval',
    recurrence: 'monthly',
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    defaultDeltaPercent: -0.22,
    intervals: [{ startTime: '00:30', endTime: '03:30', deltaPercent: -0.35 }],
    reason: 'Обслуживание',
    tags: ['Ночь', 'Плановые работы'],
  },
  {
    id: 'staffing-gap',
    title: 'Дефицит персонала',
    description: 'Краткосрочный дефицит из-за обучения и отпусков',
    mode: 'day',
    recurrence: 'once',
    startDate: '2025-11-18',
    endDate: '2025-11-20',
    defaultDeltaPercent: -0.12,
    reason: 'Ресурсы',
    tags: ['Факт', 'Снижение'],
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const matchesInterval = (template: ExceptionTemplate, date: Date): number => {
  if (!template.intervals || template.intervals.length === 0) {
    return template.defaultDeltaPercent;
  }
  const minutes = date.getHours() * 60 + date.getMinutes();
  const hits = template.intervals
    .filter((interval) => minutes >= toMinutes(interval.startTime) && minutes <= toMinutes(interval.endTime))
    .map((interval) => interval.deltaPercent);
  return hits.length ? hits.reduce((acc, value) => acc + value, 0) : 0;
};

const isActiveOnDate = (template: ExceptionTemplate, date: Date): boolean => {
  const start = new Date(template.startDate);
  const end = new Date(template.endDate);
  if (date < start || date > end) {
    return false;
  }
  if (template.recurrence === 'once') {
    return true;
  }
  if (template.recurrence === 'weekly') {
    const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays % 7 === 0;
  }
  if (template.recurrence === 'monthly') {
    return date.getDate() === start.getDate();
  }
  return false;
};

const cloneSeries = (series: ForecastSeries): ForecastSeries => cloneDeep(series);

export const loadExceptionTemplates = async (
  options: ExceptionServiceOptions = {},
): Promise<ExceptionTemplate[]> => {
  await delay(options.delayMs ?? 220);
  return EXCEPTION_TEMPLATES.map((template) => ({
    ...template,
    intervals: template.intervals?.map((interval) => ({ ...interval })),
  }));
};

export interface AppliedException {
  templateId: string;
  deltaPercent: number;
}

export interface ExceptionApplicationResult {
  adjusted: ForecastSeries;
  applied: AppliedException[];
}

export const applyExceptionTemplates = (
  baseSeries: ForecastSeries,
  templates: ExceptionTemplate[],
): ExceptionApplicationResult => {
  const adjusted = cloneSeries(baseSeries);
  const applied: AppliedException[] = [];
  adjusted.points = adjusted.points.map((point) => {
    const date = new Date(point.timestamp);
    const totalDelta = templates
      .filter((template) => isActiveOnDate(template, date))
      .map((template) => matchesInterval(template, date))
      .reduce((acc, value) => acc + value, 0);
    if (totalDelta === 0) {
      return point;
    }
    const newValue = Number((point.value * (1 + totalDelta)).toFixed(1));
    applied.push({ templateId: `${date.toISOString()}::${totalDelta.toFixed(2)}`, deltaPercent: totalDelta });
    return { ...point, value: newValue };
  });
  return { adjusted, applied };
};

export interface ExceptionSummary {
  absoluteDelta: number;
  percentDelta: number;
}

export const summariseExceptionImpact = (
  baseSeries: ForecastSeries,
  adjustedSeries: ForecastSeries,
): ExceptionSummary => {
  const totalBase = baseSeries.points.reduce((acc, point) => acc + point.value, 0);
  const totalAdjusted = adjustedSeries.points.reduce((acc, point) => acc + point.value, 0);
  const absoluteDelta = Number((totalAdjusted - totalBase).toFixed(1));
  const percentDelta = totalBase === 0 ? 0 : Number(((absoluteDelta / totalBase) * 100).toFixed(1));
  return { absoluteDelta, percentDelta };
};

export const resetExceptionTemplates = async (): Promise<ExceptionTemplate[]> =>
  EXCEPTION_TEMPLATES.map((template) => ({ ...template }));

/**
 * Builds a CSV template for importing exception rules.
 * Generates sample data rows showing the correct format for day or interval exceptions.
 *
 * @param mode - Exception mode: 'day' for full-day exceptions, 'interval' for time-based
 * @returns CSV string with headers and sample rows using semicolon delimiters
 */
export const buildExceptionTemplateCsv = (mode: ExceptionMode): string => {
  const headers =
    mode === 'day'
      ? ['date', 'deltaPercent', 'reason']
      : ['date', 'startTime', 'endTime', 'deltaPercent', 'reason'];
  const rows = [headers.join(';')];
  const sampleDates = ['2025-12-30', '2026-01-02'];
  sampleDates.forEach((date) => {
    if (mode === 'day') {
      rows.push(`${date};0.18;Промо-активность`);
    } else {
      rows.push(`${date};08:00;12:00;0.22;Утренний пик`);
      rows.push(`${date};18:00;22:00;0.15;Вечерний пик`);
    }
  });
  return rows.join('\n');
};

/**
 * Exports applied exceptions to CSV format for reporting and analysis.
 * Lists each timestamp where exceptions affected the forecast with delta values.
 *
 * @param result - Exception application result containing adjusted series and applied deltas
 * @returns CSV string with timestamp and delta percentage columns
 */
export const exportAppliedExceptions = (result: ExceptionApplicationResult): string => {
  const headers = ['timestamp', 'deltaPercent'];
  const lines = [headers.join(';')];
  result.applied.forEach((item) => {
    lines.push(`${item.templateId};${(item.deltaPercent * 100).toFixed(1)}%`);
  });
  return lines.join('\n');
};
