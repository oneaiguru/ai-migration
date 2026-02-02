export type Unit = 'hours' | 'percent' | 'people';

export interface Clamp {
  min?: number;
  max?: number;
}

export interface TargetLine {
  label: string;
  value?: number;
  series?: number[];
  style?: 'dashed' | 'solid';
  color?: string;
}

export interface SeriesPoint {
  timestamp?: string;
  label?: string;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface Series {
  id: string;
  label: string;
  unit: Unit;
  points: SeriesPoint[];
  color?: string;
  area?: boolean;
}

export interface CommonChartProps {
  series?: Series[];
  labels?: string[];
  yUnit?: Unit;
  clamp?: Clamp;
  targets?: TargetLine[];
  ariaTitle?: string;
  ariaDesc?: string;
  className?: string;
  chartHeightClass?: string;
  errorMessage?: string;
}

export interface LineChartProps extends CommonChartProps {
  area?: boolean;
  timeScale?: 'day' | 'week' | 'month';
}

export interface BarChartProps extends CommonChartProps {
  stacked?: boolean;
  categories?: string[];
  viewToggle?: { id: string; label: string }[];
  activeViewId?: string;
}

export interface DoughnutSegment {
  label: string;
  value: number;
  color?: string;
}

export interface DoughnutChartProps {
  segments: DoughnutSegment[];
  ariaTitle?: string;
  ariaDesc?: string;
}

export interface KpiCardItem {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
}

export interface KpiCardGridProps {
  items: KpiCardItem[];
  ariaTitle?: string;
  ariaDesc?: string;
}

export interface ReportTableColumn {
  id: string;
  label: string;
  width?: number | string;
}

export interface ReportTableProps {
  columns: ReportTableColumn[];
  rows: Array<Record<string, string | number>>;
  export?: { pdf?: boolean; xlsx?: boolean; csv?: boolean };
  ariaTitle?: string;
  ariaDesc?: string;
}
