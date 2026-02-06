import type { BarChartProps, Series, SeriesPoint, TargetLine, Unit } from '../../components/charts/types';

type LineDomainPoint = {
  timestamp?: string;
  label?: string;
  value: number;
  metadata?: Record<string, unknown>;
};

type LineDomainSeries = {
  id?: string;
  label?: string;
  unit?: Unit;
  color?: string;
  area?: boolean;
  points?: LineDomainPoint[];
};

export interface LineAdapterInput {
  series?: LineDomainSeries[];
}

export interface LineAdapterOptions {
  unit?: Unit;
}

const normalisePoints = (points: LineDomainPoint[] = []): SeriesPoint[] =>
  points
    .filter((point) => Number.isFinite(point?.value))
    .map((point) => ({
      timestamp: point.timestamp,
      label: point.label,
      value: Number(point.value),
      metadata: point.metadata,
    }));

const normaliseLineSeries = (entry: LineDomainSeries, index: number, fallbackUnit: Unit = 'percent'): Series => {
  const id = entry.id ?? `series-${index + 1}`;
  return {
    id,
    label: entry.label ?? id,
    unit: entry.unit ?? fallbackUnit,
    points: normalisePoints(entry.points),
    color: entry.color,
    area: entry.area,
  };
};

export const toLineSeries = (input: LineAdapterInput | LineDomainSeries[] | undefined, opts: LineAdapterOptions = {}): Series[] => {
  if (!input) {
    return [];
  }

  const series = Array.isArray(input) ? input : input.series ?? [];
  return series.map((entry, index) => normaliseLineSeries(entry, index, opts.unit));
};

export interface BarAdapterSeries {
  id?: string;
  label?: string;
  unit?: Unit;
  color?: string;
  points?: LineDomainPoint[];
}

export interface BarAdapterInput {
  labels?: string[];
  categories?: string[];
  series?: BarAdapterSeries[];
}

export interface BarAdapterResult {
  labels: string[];
  series: Series[];
}

export const toBarDatasets = (input: BarAdapterInput | BarAdapterSeries[] | undefined, unit: Unit = 'percent'): BarAdapterResult => {
  if (!input) {
    return { labels: [], series: [] };
  }

  const series = Array.isArray(input) ? input : input.series ?? [];
  const labels = Array.isArray(input) && !Array.isArray((input as BarAdapterInput).series)
    ? []
    : (input as BarAdapterInput).labels ?? (input as BarAdapterInput).categories ?? [];

  const normalisedSeries = series.map((entry, index) => normaliseLineSeries({ ...entry, points: entry.points }, index, entry.unit ?? unit));

  return {
    labels,
    series: normalisedSeries,
  };
};

type TargetDomain = TargetLine | {
  label?: string;
  value?: number;
  series?: number[];
  style?: 'dashed' | 'solid';
  color?: string;
};

export const toTargetLines = (domain: unknown): TargetLine[] => {
  if (!Array.isArray(domain)) {
    if (domain && typeof domain === 'object' && Array.isArray((domain as { items?: TargetDomain[] }).items)) {
      return toTargetLines((domain as { items?: TargetDomain[] }).items);
    }
    return [];
  }

  return (domain as TargetDomain[]).map((item, index) => ({
    label: item.label ?? `Цель ${index + 1}`,
    value: item.value,
    series: Array.isArray(item.series) ? item.series.map((val) => Number(val)) : undefined,
    style: item.style ?? 'dashed',
    color: item.color,
  }));
};

export const buildBarSeriesFromView = (datasets: BarChartProps['series'] = [], labels: string[] = []): Series[] =>
  datasets.map((dataset) => ({
    ...dataset,
    points: dataset.points.map((point, idx) => ({
      ...point,
      label: point.label ?? labels[idx],
    })),
  }));

/**
 * Usage example:
 *
 * const { series } = toBarDatasets({
 *   labels: ['Пн', 'Вт'],
 *   series: [
 *     {
 *       id: 'coverage',
 *       label: 'Покрытие',
 *       points: [
 *         { label: 'Пн', value: 82 },
 *         { label: 'Вт', value: 85 },
 *       ],
 *     },
 *   ],
 * });
 */

// --- Period grouping & derived overlay helpers ---

export type TimeUnit = 'day' | 'week' | 'month';

export interface PeriodOptions {
  unit: TimeUnit;
}

const tryParseDate = (value?: string): Date | null => {
  if (!value) return null;
  // Prefer ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  // Sometimes date is stored in label
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  return null;
};

const getIsoWeekKey = (date: Date): { key: string; rep: string } => {
  // ISO week: Thursday in current week determines the year.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday (current date + 4 - current day number) with Sunday=7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d as unknown as number) - (yearStart as unknown as number)) / 86400000 + 1) / 7);
  const year = d.getUTCFullYear();
  const ww = String(weekNo).padStart(2, '0');
  return { key: `${year}-W${ww}`, rep: new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toISOString().slice(0, 10) };
};

const getMonthKey = (date: Date): { key: string; rep: string } => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return { key: `${y}-${m}`, rep: new Date(y, date.getMonth(), 1).toISOString().slice(0, 10) };
};

const aggregateByUnit = (unit: Unit, values: number[]): number => {
  const nums = values.filter((v) => Number.isFinite(v));
  if (!nums.length) return Number.NaN;
  if (unit === 'percent') {
    const sum = nums.reduce((a, b) => a + b, 0);
    return sum / nums.length;
  }
  // people | hours → sum
  return nums.reduce((a, b) => a + b, 0);
};

/**
 * Group day-level series into week or month buckets. If unit==='day', passthrough.
 */
export const toPeriodSeries = (input: Series[] = [], opts: PeriodOptions): Series[] => {
  if (!opts || opts.unit === 'day') return input;

  return input.map((series) => {
    // Build buckets keyed by iso week or month
    const buckets = new Map<string, { rep: string; values: number[] }>();

    for (const point of series.points) {
      const raw = point.timestamp ?? point.label;
      const parsed = tryParseDate(raw);
      if (!parsed) {
        // If any point cannot be parsed, fall back to original series for safety
        return series;
      }
      const keyObj = opts.unit === 'week' ? getIsoWeekKey(parsed) : getMonthKey(parsed);
      const bucket = buckets.get(keyObj.key) ?? { rep: keyObj.rep, values: [] };
      bucket.values.push(Number(point.value));
      buckets.set(keyObj.key, bucket);
    }

    // Preserve chronological order by representative date
    const ordered = Array.from(buckets.entries()).sort((a, b) => a[1].rep.localeCompare(b[1].rep));
    const points: SeriesPoint[] = ordered.map(([key, b]) => ({
      label: key,
      timestamp: new Date(b.rep).getTime(),
      value: aggregateByUnit(series.unit, b.values),
    }));

    return {
      ...series,
      points,
    };
  });
};

// Derived overlay series from schedules
export interface ScheduleLike {
  date: string; // YYYY-MM-DD
  employeeId: string;
  duration: number; // minutes
}

export const deriveHeadcountSeries = (dates: string[] = [], schedules: ScheduleLike[] = []): Series => {
  const counts = new Map<string, Set<string>>();
  for (const d of dates) counts.set(d, new Set<string>());

  schedules.forEach((s) => {
    if (counts.has(s.date)) {
      counts.get(s.date)!.add(s.employeeId);
    }
  });

  const points: SeriesPoint[] = dates.map((d) => ({ label: d, timestamp: Date.parse(d), value: counts.get(d)?.size ?? 0 }));
  return {
    id: 'headcount',
    label: 'Численность (Σ)',
    unit: 'people',
    points,
    color: '#334155',
  };
};

export const deriveFteHoursSeries = (dates: string[] = [], schedules: ScheduleLike[] = []): Series => {
  const totals = new Map<string, number>();
  for (const d of dates) totals.set(d, 0);

  schedules.forEach((s) => {
    if (totals.has(s.date)) {
      totals.set(s.date, (totals.get(s.date) ?? 0) + (Number(s.duration) || 0));
    }
  });

  const points: SeriesPoint[] = dates.map((d) => ({
    label: d,
    timestamp: Date.parse(d),
    value: (totals.get(d) ?? 0) / 60, // minutes → hours
  }));

  return {
    id: 'fte',
    label: 'FTE часы',
    unit: 'hours',
    points,
    color: '#64748b',
  };
};
