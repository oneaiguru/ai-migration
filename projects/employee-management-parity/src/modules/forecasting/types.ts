export type ForecastUnit = 'count' | 'percent' | 'currency' | 'hours';

export interface ForecastPoint {
  timestamp: string;
  value: number;
}

export interface ForecastSeries {
  id: string;
  label: string;
  unit: ForecastUnit;
  axis?: 'primary' | 'secondary';
  color?: string;
  area?: boolean;
  hiddenInLegend?: boolean;
  points: ForecastPoint[];
}

export type ReportTableRow = Record<string, string | number>;

export interface ConfidenceBand {
  lower: ForecastSeries;
  upper: ForecastSeries;
}

export interface ForecastBuildResult {
  organisation: string;
  horizonWeeks: number;
  projectionWeeks: number;
  generatedAt: string;
  actual: ForecastSeries;
  forecast: ForecastSeries;
  confidence: ConfidenceBand;
  table: ReportTableRow[];
}

export interface AbsenteeismSnapshot {
  organisation: string;
  observed: ForecastSeries;
  forecast: ForecastSeries;
  deltaPercent: number;
  reasonBreakdown: ReportTableRow[];
}

export interface QueueNode {
  id: string;
  label: string;
  type: 'group' | 'queue';
  favourite?: boolean;
  skills?: number;
  children?: QueueNode[];
}

export interface HorizonConfig {
  id: string;
  label: string;
  historyWeeks: number;
  projectionWeeks: number;
}

export interface ForecastRunSummary {
  appliedQueues: number;
  horizonWeeks: number;
  projectionWeeks: number;
  absenteeismMode: 'value' | 'profile';
  absenteeismValue?: number;
  absenteeismProfile?: string;
  generatedAt: string;
}

export type AbsenteeismRunStatus = 'completed' | 'scheduled' | 'failed';

export interface AbsenteeismRun {
  id: string;
  requestedBy: string;
  executedAt: string;
  status: AbsenteeismRunStatus;
  mode: 'value' | 'profile';
  horizonWeeks: number;
  absenteeismPercent?: number;
  profileName?: string;
}

export interface TrendTables {
  strategic: ReportTableRow[];
  tactical: ReportTableRow[];
  operational: ReportTableRow[];
}

export interface AccuracyRow extends ReportTableRow {
  period: string;
  forecast: string;
  actual: string;
  absoluteDelta: string;
  relativeDelta: string;
  absenteeism: string;
  lostCalls: string;
  serviceLevel: string;
  aht: string;
}

export interface ReportDownloadNotice {
  id: string;
  reportId: string;
  format: 'csv' | 'xlsx' | 'pdf';
  filename: string;
  requestedAt: string;
  status: 'queued' | 'ready';
}
