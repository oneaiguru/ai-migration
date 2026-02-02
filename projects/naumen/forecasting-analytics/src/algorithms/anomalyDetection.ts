// Anomaly Detection Algorithms

import { TimeSeriesData } from '../types/trends';
import { AnomalyEvent } from '../types/anomalies';

/**
 * Detect anomalies using statistical methods
 */
export function detectAnomalies(
  data: TimeSeriesData[], 
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): AnomalyEvent[] {
  if (data.length < 10) return [];
  
  const anomalies: AnomalyEvent[] = [];
  const values = data.map(d => d.value);
  
  // Calculate statistical thresholds
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Set threshold based on sensitivity
  let threshold = 2; // default for medium
  if (sensitivity === 'low') threshold = 3;
  if (sensitivity === 'high') threshold = 1.5;
  
  const upperThreshold = mean + threshold * stdDev;
  const lowerThreshold = mean - threshold * stdDev;
  
  // Detect anomalies
  data.forEach((point, index) => {
    const value = point.value;
    let isAnomaly = false;
    let type: 'spike' | 'drop' | 'shift' | 'outlier' = 'outlier';
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (value > upperThreshold) {
      isAnomaly = true;
      type = 'spike';
      const deviations = (value - mean) / stdDev;
      if (deviations > 4) severity = 'critical';
      else if (deviations > 3) severity = 'high';
      else if (deviations > 2) severity = 'medium';
    } else if (value < lowerThreshold) {
      isAnomaly = true;
      type = 'drop';
      const deviations = Math.abs(value - mean) / stdDev;
      if (deviations > 4) severity = 'critical';
      else if (deviations > 3) severity = 'high';
      else if (deviations > 2) severity = 'medium';
    }
    
    if (isAnomaly) {
      anomalies.push({
        timestamp: new Date(point.timestamp),
        value,
        expectedValue: mean,
        severity,
        type,
        explanation: `Value ${value.toFixed(2)} is ${Math.abs(value - mean).toFixed(2)} units from expected mean of ${mean.toFixed(2)}`,
        confidence: Math.min(1, Math.abs(value - mean) / (threshold * stdDev)),
        impact: type === 'spike' ? 'positive' : 'negative',
        actionRequired: severity === 'critical' || severity === 'high'
      });
    }
  });
  
  return anomalies;
}

/**
 * Detect contextual anomalies based on time patterns
 */
export function detectContextualAnomalies(
  data: TimeSeriesData[],
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): AnomalyEvent[] {
  if (data.length < 50) return [];
  
  const anomalies: AnomalyEvent[] = [];
  
  // Group by hour of day
  const hourlyPatterns: Record<number, number[]> = {};
  
  data.forEach(point => {
    const hour = new Date(point.timestamp).getHours();
    if (!hourlyPatterns[hour]) hourlyPatterns[hour] = [];
    hourlyPatterns[hour].push(point.value);
  });
  
  // Calculate expected values for each hour
  const hourlyExpected: Record<number, { mean: number; stdDev: number }> = {};
  
  Object.entries(hourlyPatterns).forEach(([hour, values]) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    hourlyExpected[parseInt(hour)] = { mean, stdDev };
  });
  
  // Check each point against its hourly pattern
  data.forEach(point => {
    const hour = new Date(point.timestamp).getHours();
    const expected = hourlyExpected[hour];
    
    if (expected && expected.stdDev > 0) {
      const deviations = Math.abs(point.value - expected.mean) / expected.stdDev;
      let threshold = 2;
      if (sensitivity === 'low') threshold = 3;
      if (sensitivity === 'high') threshold = 1.5;
      
      if (deviations > threshold) {
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (deviations > 4) severity = 'critical';
        else if (deviations > 3) severity = 'high';
        else if (deviations > 2.5) severity = 'medium';
        
        anomalies.push({
          timestamp: new Date(point.timestamp),
          value: point.value,
          expectedValue: expected.mean,
          severity,
          type: point.value > expected.mean ? 'spike' : 'drop',
          explanation: `Unusual value for hour ${hour}:00. Expected ~${expected.mean.toFixed(2)}, got ${point.value.toFixed(2)}`,
          confidence: Math.min(1, deviations / threshold),
          impact: point.value > expected.mean ? 'positive' : 'negative',
          actionRequired: severity === 'critical' || severity === 'high'
        });
      }
    }
  });
  
  return anomalies;
}
