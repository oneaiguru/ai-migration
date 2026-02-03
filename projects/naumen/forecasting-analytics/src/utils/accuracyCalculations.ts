// Accuracy Calculation Utilities

import { 
  MetricCalculationInput, 
  MetricCalculationResult, 
  AccuracyLevel,
  AccuracyThresholds
} from '../types/metrics';

export const DEFAULT_THRESHOLDS: AccuracyThresholds = {
  excellent: { mape: 5, accuracy: 95 },
  good: { mape: 15, accuracy: 85 },
  fair: { mape: 25, accuracy: 75 }
};

/**
 * Calculate Mean Absolute Percentage Error (MAPE)
 */
export function calculateMAPE(predicted: number[], actual: number[]): number {
  if (predicted.length !== actual.length || predicted.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const percentageErrors = predicted.map((pred, i) => {
    if (actual[i] === 0) return 0; // Avoid division by zero
    return Math.abs((pred - actual[i]) / actual[i]) * 100;
  });

  return percentageErrors.reduce((sum, error) => sum + error, 0) / percentageErrors.length;
}

/**
 * Calculate Mean Absolute Error (MAE)
 */
export function calculateMAE(predicted: number[], actual: number[]): number {
  if (predicted.length !== actual.length || predicted.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const errors = predicted.map((pred, i) => Math.abs(pred - actual[i]));
  return errors.reduce((sum, error) => sum + error, 0) / errors.length;
}

/**
 * Calculate Root Mean Square Error (RMSE)
 */
export function calculateRMSE(predicted: number[], actual: number[]): number {
  if (predicted.length !== actual.length || predicted.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const squaredErrors = predicted.map((pred, i) => Math.pow(pred - actual[i], 2));
  const mse = squaredErrors.reduce((sum, error) => sum + error, 0) / squaredErrors.length;
  return Math.sqrt(mse);
}

/**
 * Calculate Forecast Bias
 */
export function calculateBias(predicted: number[], actual: number[]): number {
  if (predicted.length !== actual.length || predicted.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const errors = predicted.map((pred, i) => pred - actual[i]);
  return errors.reduce((sum, error) => sum + error, 0) / errors.length;
}

/**
 * Calculate R-squared (Coefficient of Determination)
 */
export function calculateRSquared(predicted: number[], actual: number[]): number {
  if (predicted.length !== actual.length || predicted.length === 0) {
    throw new Error('Arrays must have the same non-zero length');
  }

  const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
  
  const totalSumSquares = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
  const residualSumSquares = predicted.reduce((sum, pred, i) => 
    sum + Math.pow(actual[i] - pred, 2), 0);

  if (totalSumSquares === 0) return 1;
  return 1 - (residualSumSquares / totalSumSquares);
}

/**
 * Calculate all accuracy metrics at once
 */
export function calculateAllMetrics(input: MetricCalculationInput): MetricCalculationResult {
  const { predicted, actual } = input;
  
  const mape = calculateMAPE(predicted, actual);
  const mae = calculateMAE(predicted, actual);
  const rmse = calculateRMSE(predicted, actual);
  const bias = calculateBias(predicted, actual);
  const rSquared = calculateRSquared(predicted, actual);
  const accuracy = Math.max(0, 100 - mape);

  return {
    mape,
    mae,
    rmse,
    bias,
    rSquared,
    accuracy
  };
}

/**
 * Determine accuracy level based on MAPE
 */
export function getAccuracyLevel(mape: number, thresholds = DEFAULT_THRESHOLDS): AccuracyLevel {
  if (mape <= thresholds.excellent.mape) return 'excellent';
  if (mape <= thresholds.good.mape) return 'good';
  if (mape <= thresholds.fair.mape) return 'fair';
  return 'poor';
}

/**
 * Format metric value for display
 */
export const percentFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const percentFormatterWhole = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatPercent = (value: number, digits: 0 | 1 = 1): string => {
  const formatter = digits === 0 ? percentFormatterWhole : percentFormatter;
  return `${formatter.format(value)}\u202f%`;
};

export function formatMetricValue(value: number, metricType: string): string {
  const normalized = metricType.toLowerCase();

  if (normalized === 'mape' || normalized === 'accuracy') {
    return formatPercent(value, 1);
  }

  if (normalized === 'rsquared') {
    return formatPercent(value * 100, 0);
  }

  return numberFormatter.format(value);
}
