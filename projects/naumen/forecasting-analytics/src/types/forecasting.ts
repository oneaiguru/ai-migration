export type GranularityMode = 'day' | 'interval';

export interface ForecastTimezoneOption {
  id: string;
  label: string;
  shortLabel: string;
  offsetMinutes: number;
  iana?: string;
}

export interface QueueNode {
  id: string;
  name: string;
  parentId?: string;
  children?: QueueNode[];
}

export interface ForecastPeriod {
  start: string;
  end: string;
}

export interface ForecastHorizonOption {
  id: string;
  label: string;
  historyDays: number;
  forecastDays: number;
  granularity: GranularityMode;
  /** @deprecated Используйте historyDays/forecastDays */
  days?: number;
}

export interface ForecastWindowOption {
  id: string;
  label: string;
  days: number;
}

export interface ForecastBuildDefaults {
  historyDays: number;
  forecastDays: number;
  granularity: GranularityMode;
  absenteeismProfileId: string;
  queueIds: string[];
  historyStart: string;
  historyEnd: string;
  buildPeriodStart: string;
  buildPeriodEnd: string;
  timezoneId: string;
}

export interface AbsenteeismProfile {
  id: string;
  label: string;
  coverage: string;
  valuePercent: number;
  notes?: string;
}

export interface ForecastDetailRow {
  id: string;
  timestamp: string;
  forecast: number;
  actual: number;
  absenteeismPercent: number;
  lostCalls: number;
  ahtSeconds: number;
  serviceLevel: number;
}

export interface ForecastOptions {
  queueTree: QueueNode[];
  horizons: ForecastHorizonOption[];
  forecastWindows: ForecastWindowOption[];
  granularityModes: GranularityMode[];
  defaultPeriod: ForecastPeriod;
  absenteeismProfiles: AbsenteeismProfile[];
  defaults: ForecastBuildDefaults;
  calculatorPresets: AbsenteeismCalculatorPreset[];
  timezones: ForecastTimezoneOption[];
}

export interface ForecastBuildRequest {
  queueIds: string[];
  period: ForecastPeriod;
  historyDays: number;
  forecastDays: number;
  granularity: GranularityMode;
  absenteeismProfileId: string;
  absenteeismPercent: number;
  /** @deprecated Используйте historyDays */
  horizonDays?: number;
  historyStart: string;
  historyEnd: string;
  buildStart: string;
  buildEnd: string;
  timezoneId: string;
}

export interface ForecastBuildResponse {
  jobId: string;
  createdAt: string;
  message: string;
  downloadUrl?: string;
}

export type ForecastUploadKind = 'forecast' | 'actual' | 'absenteeism';

export interface UploadResult {
  kind: ForecastUploadKind;
  savedAt: string;
  message: string;
}

export interface ExportPayload {
  filename: string;
  mimeType: string;
  content: string;
}

export interface ExceptionInterval {
  id: string;
  mode: 'day' | 'interval';
  dayOfWeek?: string;
  date?: string;
  start: string;
  end: string;
  smoothing?: number;
}

export interface ExceptionTemplate {
  id: string;
  label: string;
  historyHorizon: number;
  periodLabel: string;
  mode: 'periodic' | 'single';
  intervals: ExceptionInterval[];
  lastRunAt?: string;
  author?: string;
}

export interface ExceptionTemplateInput {
  id?: string;
  label: string;
  historyHorizon: number;
  periodLabel: string;
  mode: 'periodic' | 'single';
  intervals: Omit<ExceptionInterval, 'id'>[];
}

export interface AbsenteeismRule {
  id: string;
  dayOfWeek: string;
  start: string;
  end: string;
  valuePercent: number;
}

export interface AbsenteeismException {
  id: string;
  date: string;
  valuePercent: number;
}

export interface AbsenteeismTemplate {
  id: string;
  name: string;
  coverage: string;
  valuePercent: number;
  periodicRules: AbsenteeismRule[];
  singleOverrides: AbsenteeismException[];
  updatedAt: string;
  author: string;
}

export interface AbsenteeismTemplateInput {
  id?: string;
  name: string;
  coverage: string;
  valuePercent: number;
  periodicRules: Omit<AbsenteeismRule, 'id'>[];
  singleOverrides: Omit<AbsenteeismException, 'id'>[];
}

export interface AbsenteeismCalculatorPreset {
  id: string;
  label: string;
  historyDays: number;
  forecastDays: number;
  intervalMinutes: number;
  baselinePercent: number;
}

export interface AbsenteeismCalculationInput {
  queueId: string;
  templateId: string;
  historyDays: number;
  forecastDays: number;
  intervalMinutes: number;
}

export interface AbsenteeismCalculationPoint {
  timestamp: string;
  baselinePercent: number;
  scenarioPercent: number;
}

export interface AbsenteeismCalculationResult {
  queueId: string;
  templateId: string;
  historyDays: number;
  forecastDays: number;
  intervalMinutes: number;
  baselinePercent: number;
  recommendedPercent: number;
  deltaPercent: number;
  message: string;
  series: AbsenteeismCalculationPoint[];
}

export interface ForecastExportRequest {
  queueIds: string[];
  period: ForecastPeriod;
  timezoneId?: string;
}

export interface ExceptionsExportRequest {
  templateId: string;
  queueId: string;
  historyDays: number;
  historyStart: string;
  historyEnd: string;
  buildStart: string;
  buildEnd: string;
  timezoneId?: string;
}

export interface AbsenteeismExportRequest {
  templateIds: string[];
}

export interface ForecastDetailRequest {
  queueIds: string[];
  period: ForecastPeriod;
}

export interface TrendExportRequest {
  organizationId: string;
  queueIds: string[];
  period: ForecastPeriod;
  mode: 'strategic' | 'tactical' | 'operational';
  timezoneId?: string;
}
