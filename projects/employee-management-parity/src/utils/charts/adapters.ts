import type { Series, SeriesPoint, TargetLine, Unit } from '../../components/charts/types';

type LineDomainPoint = {
  timestamp: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
};

type LineDomainSeries = {
  id?: string;
  label?: string;
  unit?: Unit;
  color?: string;
  area?: boolean;
  points?: LineDomainPoint[];
  values?: LineDomainPoint[];
  data?: LineDomainPoint[];
};

interface LineDomain {
  series: LineDomainSeries[];
}

export interface LineAdapterOptions {
  unit?: Unit;
  timeScale?: 'day' | 'week' | 'month';
}

const normalisePoints = (points?: LineDomainPoint[]): SeriesPoint[] => {
  if (!Array.isArray(points)) return [];
  return points
    .filter((point) => typeof point?.timestamp === 'string' && Number.isFinite(point?.value))
    .map((point) => ({
      timestamp: point.timestamp,
      value: Number(point.value),
      label: point.label,
      metadata: point.metadata,
    }));
};

const normaliseLineSeries = (entry: LineDomainSeries, index: number, fallbackUnit?: Unit): Series => {
  const points = normalisePoints(entry.points ?? entry.values ?? entry.data);
  const id = entry.id ?? `series-${index + 1}`;
  return {
    id,
    label: entry.label ?? id,
    unit: entry.unit ?? fallbackUnit ?? 'percent',
    points,
    color: entry.color,
    area: entry.area,
  };
};

const asLineDomain = (domain: unknown): LineDomainSeries[] => {
  if (Array.isArray(domain)) return domain as LineDomainSeries[];
  if (domain && typeof domain === 'object' && Array.isArray((domain as LineDomain).series)) {
    return (domain as LineDomain).series;
  }
  return [];
};

export const toLineSeries = (domain: unknown, opts: LineAdapterOptions = {}): Series[] => {
  const series = asLineDomain(domain);
  return series.map((entry, index) => normaliseLineSeries(entry, index, opts.unit));
};

export interface BarAdapterSeries {
  id?: string;
  label?: string;
  unit?: Unit;
  values?: number[];
  data?: number[];
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  stack?: string;
}

export interface BarDomain {
  labels?: string[];
  categories?: string[];
  series: BarAdapterSeries[];
}

export interface BarAdapterOptions {
  unit?: Unit;
}

export interface BarDatasetConfig {
  id: string;
  label: string;
  unit?: Unit;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  stack?: string;
}

export interface BarAdapterResult {
  labels: string[];
  datasets: BarDatasetConfig[];
}

const asBarDomain = (domain: unknown): BarDomain => {
  if (Array.isArray(domain)) {
    return { series: domain as BarAdapterSeries[] };
  }
  if (domain && typeof domain === 'object') {
    const value = domain as Partial<BarDomain>;
    if (Array.isArray(value.series)) {
      return { series: value.series, labels: value.labels, categories: value.categories };
    }
  }
  return { series: [] };
};

const normaliseBarSeries = (entry: BarAdapterSeries, index: number, fallbackUnit?: Unit): BarDatasetConfig => {
  const data = Array.isArray(entry.values)
    ? entry.values.map((val) => (Number.isFinite(val) ? Number(val) : 0))
    : Array.isArray(entry.data)
      ? entry.data.map((val) => (Number.isFinite(val) ? Number(val) : 0))
      : [];
  const id = entry.id ?? `series-${index + 1}`;
  return {
    id,
    label: entry.label ?? id,
    unit: entry.unit ?? fallbackUnit,
    data,
    backgroundColor: entry.backgroundColor ?? entry.color,
    borderColor: entry.borderColor ?? entry.color,
    stack: entry.stack,
  };
};

export const toBarDatasets = (domain: unknown, opts: BarAdapterOptions = {}): BarAdapterResult => {
  const normalised = asBarDomain(domain);
  const labels = normalised.labels ?? normalised.categories ?? [];
  return {
    labels,
    datasets: normalised.series.map((entry, index) => normaliseBarSeries(entry, index, opts.unit)),
  };
};

interface DoughnutDomainSegment {
  label?: string;
  value: number;
  color?: string;
}

interface DoughnutDomain {
  items: DoughnutDomainSegment[];
}

export interface DoughnutAdapterResult {
  labels: string[];
  data: number[];
  colors?: string[];
}

const asDoughnutDomain = (domain: unknown): DoughnutDomainSegment[] => {
  if (Array.isArray(domain)) return domain as DoughnutDomainSegment[];
  if (domain && typeof domain === 'object' && Array.isArray((domain as DoughnutDomain).items)) {
    return (domain as DoughnutDomain).items;
  }
  return [];
};

export const toDoughnutDataset = (domain: unknown): DoughnutAdapterResult => {
  const segments = asDoughnutDomain(domain).filter((segment) => Number.isFinite(segment?.value));
  return {
    labels: segments.map((segment, index) => segment.label ?? `Категория ${index + 1}`),
    data: segments.map((segment) => Number(segment.value)),
    colors: segments.map((segment) => segment.color).filter(Boolean) as string[] | undefined,
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

  return (domain as TargetDomain[])
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item, index) => {
      const label = item.label ?? `Цель ${index + 1}`;
      return {
        label,
        value: item.value,
        series: Array.isArray(item.series) ? item.series.map((val) => Number(val)) : undefined,
        style: item.style ?? 'dashed',
        color: item.color,
      } satisfies TargetLine;
    });
};

/**
 * Example usage:
 *
 * const lineSeries = toLineSeries({
 *   series: [
 *     {
 *       id: 'adherence',
 *       label: 'Принятие графика',
 *       unit: 'percent',
 *       points: [
 *         { timestamp: '2025-10-12', value: 82.1 },
 *         { timestamp: '2025-10-13', value: 84.6 },
 *       ],
 *     },
 *   ],
 * });
 */
