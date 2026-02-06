// Metric Calculation Types

export interface MetricCalculationInput {
  predicted: number[];
  actual: number[];
  confidence?: number[];
}

export interface MetricCalculationResult {
  mape: number;
  mae: number;
  rmse: number;
  bias: number;
  rSquared: number;
  accuracy: number;
}

export interface StatisticalTestInput {
  values: number[];
  confidence: number; // 0.95, 0.99, etc.
}

export interface StatisticalTestResult {
  mean: number;
  standardError: number;
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number;
  };
  pValue: number;
  isSignificant: boolean;
}

export interface ValidationConfig {
  method: 'holdout' | 'kfold' | 'timeseries';
  testSize?: number;
  folds?: number;
  timeSeriesGap?: number;
}

export interface CrossValidationResult {
  fold: number;
  trainSize: number;
  testSize: number;
  metrics: MetricCalculationResult;
}

export interface TimeSeriesValidationResult {
  period: string;
  trainStart: string;
  trainEnd: string;
  testStart: string;
  testEnd: string;
  metrics: MetricCalculationResult;
}

export type AccuracyLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface AccuracyThresholds {
  excellent: { mape: number; accuracy: number };
  good: { mape: number; accuracy: number };
  fair: { mape: number; accuracy: number };
}
