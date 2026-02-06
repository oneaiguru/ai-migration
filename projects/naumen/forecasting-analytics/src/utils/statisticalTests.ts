// Statistical Tests and Confidence Intervals

import { StatisticalTestInput, StatisticalTestResult } from '../types/metrics';

/**
 * Calculate standard error of the mean
 */
export function calculateStandardError(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  return standardDeviation / Math.sqrt(values.length);
}

/**
 * Calculate confidence interval for mean
 */
export function calculateConfidenceInterval(
  values: number[], 
  confidenceLevel: number = 0.95
): { lower: number; upper: number; level: number } {
  if (values.length === 0) {
    return { lower: 0, upper: 0, level: confidenceLevel };
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const standardError = calculateStandardError(values);
  
  // Using t-distribution critical values (approximation)
  const tCritical = getTCriticalValue(values.length - 1, confidenceLevel);
  const marginOfError = tCritical * standardError;
  
  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    level: confidenceLevel * 100
  };
}

/**
 * Get t-critical value (simplified approximation)
 */
function getTCriticalValue(degreesOfFreedom: number, confidenceLevel: number): number {
  // Simplified t-critical values for common confidence levels
  const tTable: Record<number, Record<number, number>> = {
    90: { 1: 6.314, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697, 60: 1.671, 120: 1.658 },
    95: { 1: 12.706, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042, 60: 2.000, 120: 1.980 },
    99: { 1: 63.657, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750, 60: 2.660, 120: 2.617 }
  };
  
  const confidencePercent = Math.round(confidenceLevel * 100);
  const table = tTable[confidencePercent];
  
  if (!table) return 1.96; // Default to normal distribution
  
  // Find closest degrees of freedom
  const availableDf = Object.keys(table).map(Number).sort((a, b) => a - b);
  const closestDf = availableDf.reduce((prev, curr) => 
    Math.abs(curr - degreesOfFreedom) < Math.abs(prev - degreesOfFreedom) ? curr : prev
  );
  
  return table[closestDf] || 1.96;
}

/**
 * Perform one-sample t-test
 */
export function performTTest(input: StatisticalTestInput): StatisticalTestResult {
  const { values, confidence } = input;
  
  if (values.length === 0) {
    return {
      mean: 0,
      standardError: 0,
      confidenceInterval: { lower: 0, upper: 0, level: confidence * 100 },
      pValue: 1,
      isSignificant: false
    };
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const standardError = calculateStandardError(values);
  const confidenceInterval = calculateConfidenceInterval(values, confidence);
  
  // Calculate t-statistic (testing against null hypothesis of mean = 0)
  const tStatistic = mean / standardError;
  
  // Simplified p-value calculation (two-tailed test)
  const pValue = calculatePValue(Math.abs(tStatistic), values.length - 1);
  const alpha = 1 - confidence;
  const isSignificant = pValue < alpha;
  
  return {
    mean,
    standardError,
    confidenceInterval,
    pValue,
    isSignificant
  };
}

/**
 * Calculate p-value (simplified approximation)
 */
function calculatePValue(tStatistic: number, degreesOfFreedom: number): number {
  // Simplified p-value calculation using normal approximation for large df
  if (degreesOfFreedom > 30) {
    // Use normal distribution approximation
    return 2 * (1 - normalCDF(Math.abs(tStatistic)));
  }
  
  // For small df, use rough approximation
  if (tStatistic > 3) return 0.01;
  if (tStatistic > 2) return 0.05;
  if (tStatistic > 1) return 0.2;
  return 0.5;
}

/**
 * Normal cumulative distribution function approximation
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}
