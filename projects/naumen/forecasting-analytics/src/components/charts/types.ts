import type { ReactNode } from 'react';

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
  timestamp?: string; // ISO 8601
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface Series {
  id: string;
  label: string;
  unit: Unit;
  points: SeriesPoint[];
  color?: string;
  area?: boolean;
  axis?: 'primary' | 'secondary';
}

export interface CommonChartProps {
  series?: Series[];
  labels?: string[];
  yUnit?: Unit;
  clamp?: Clamp;
  targets?: TargetLine[];
  bands?: ConfidenceBand[];
  secondaryAxis?: {
    unit: Unit;
    clamp?: Clamp;
    label?: string;
  };
  ariaTitle?: string;
  ariaDesc?: string;
}

export interface ConfidenceBand {
  id: string;
  label?: string;
  upper: number[];
  lower: number[];
  color?: string;
}

export interface LineChartProps extends CommonChartProps {
  area?: boolean;
  timeScale?: 'day' | 'week' | 'month';
}

export interface BarChartProps extends CommonChartProps {
  stacked?: boolean;
  viewToggle?: { id: string; label: string }[];
  activeViewId?: string;
  categories?: string[];
}

export interface DoughnutChartProps extends CommonChartProps {
  legendPosition?: 'top' | 'bottom';
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
  rows: Array<Record<string, string | number | ReactNode>>;
  export?: { pdf?: boolean; xlsx?: boolean; csv?: boolean };
  ariaTitle?: string;
  ariaDesc?: string;
}
