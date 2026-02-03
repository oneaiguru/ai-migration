// Pattern Detection Algorithms

import { TimeSeriesData, TrendPattern, SeasonalComponent } from '../types/trends';
import { DetectedPattern, PatternDetectionConfig, CyclicalPattern } from '../types/patterns';

/**
 * Detect seasonal patterns in time series data
 */
export function detectSeasonalPatterns(
  data: TimeSeriesData[], 
  config: PatternDetectionConfig
): SeasonalComponent[] {
  if (data.length < 14) return []; // Need minimum data
  
  const patterns: SeasonalComponent[] = [];
  
  // Daily pattern detection
  const dailyPattern = detectDailyPattern(data);
  if (dailyPattern.strength > config.sensitivity.seasonality) {
    patterns.push(dailyPattern);
  }
  
  // Weekly pattern detection
  const weeklyPattern = detectWeeklyPattern(data);
  if (weeklyPattern.strength > config.sensitivity.seasonality) {
    patterns.push(weeklyPattern);
  }
  
  return patterns;
}

/**
 * Detect daily patterns (hourly cycles)
 */
function detectDailyPattern(data: TimeSeriesData[]): SeasonalComponent {
  const hourlyAverages = new Array(24).fill(0);
  const hourlyCounts = new Array(24).fill(0);
  
  data.forEach(point => {
    const hour = new Date(point.timestamp).getHours();
    hourlyAverages[hour] += point.value;
    hourlyCounts[hour]++;
  });
  
  // Calculate averages
  for (let i = 0; i < 24; i++) {
    if (hourlyCounts[i] > 0) {
      hourlyAverages[i] /= hourlyCounts[i];
    }
  }
  
  // Find peaks and valleys
  const peaks: number[] = [];
  const valleys: number[] = [];
  
  for (let i = 1; i < 23; i++) {
    if (hourlyAverages[i] > hourlyAverages[i-1] && hourlyAverages[i] > hourlyAverages[i+1]) {
      peaks.push(i);
    }
    if (hourlyAverages[i] < hourlyAverages[i-1] && hourlyAverages[i] < hourlyAverages[i+1]) {
      valleys.push(i);
    }
  }
  
  // Calculate pattern strength
  const max = Math.max(...hourlyAverages);
  const min = Math.min(...hourlyAverages);
  const amplitude = max - min;
  const mean = hourlyAverages.reduce((sum, val) => sum + val, 0) / 24;
  const strength = amplitude / mean;
  
  return {
    period: 'daily',
    strength: Math.min(1, strength),
    peaks,
    valleys,
    amplitude,
    phase: peaks[0] || 0,
    confidence: Math.min(1, strength * 0.8)
  };
}

/**
 * Detect weekly patterns (daily cycles)
 */
function detectWeeklyPattern(data: TimeSeriesData[]): SeasonalComponent {
  const dailyAverages = new Array(7).fill(0);
  const dailyCounts = new Array(7).fill(0);
  
  data.forEach(point => {
    const dayOfWeek = new Date(point.timestamp).getDay();
    dailyAverages[dayOfWeek] += point.value;
    dailyCounts[dayOfWeek]++;
  });
  
  // Calculate averages
  for (let i = 0; i < 7; i++) {
    if (dailyCounts[i] > 0) {
      dailyAverages[i] /= dailyCounts[i];
    }
  }
  
  // Find peaks and valleys
  const peaks: number[] = [];
  const valleys: number[] = [];
  
  for (let i = 0; i < 7; i++) {
    const prev = (i - 1 + 7) % 7;
    const next = (i + 1) % 7;
    
    if (dailyAverages[i] > dailyAverages[prev] && dailyAverages[i] > dailyAverages[next]) {
      peaks.push(i);
    }
    if (dailyAverages[i] < dailyAverages[prev] && dailyAverages[i] < dailyAverages[next]) {
      valleys.push(i);
    }
  }
  
  // Calculate pattern strength
  const max = Math.max(...dailyAverages);
  const min = Math.min(...dailyAverages);
  const amplitude = max - min;
  const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / 7;
  const strength = amplitude / mean;
  
  return {
    period: 'weekly',
    strength: Math.min(1, strength),
    peaks,
    valleys,
    amplitude,
    phase: peaks[0] || 0,
    confidence: Math.min(1, strength * 0.7)
  };
}

/**
 * Detect trend patterns using linear regression
 */
export function detectTrendPatterns(
  data: TimeSeriesData[], 
  windowSize: number = 30
): TrendPattern[] {
  if (data.length < windowSize) return [];
  
  const patterns: TrendPattern[] = [];
  const values = data.map(d => d.value);
  
  // Simple linear regression
  const n = values.length;
  const x = Array.from({length: n}, (_, i) => i);
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const ssRes = values.reduce((sum, val, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(val - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssRes / ssTotal);
  
  if (Math.abs(slope) > 0.1 && rSquared > 0.5) {
    patterns.push({
      id: `trend-${Date.now()}`,
      type: slope > 0 ? 'growth' : 'decline',
      strength: rSquared,
      period: 'overall',
      startDate: new Date(data[0].timestamp),
      endDate: new Date(data[data.length - 1].timestamp),
      description: `${slope > 0 ? 'Increasing' : 'Decreasing'} trend with ${(rSquared * 100).toFixed(1)}% confidence`,
      statisticalSignificance: rSquared,
      recommendations: slope > 0 ? 
        ['Monitor continued growth', 'Plan for increased capacity'] :
        ['Investigate causes of decline', 'Consider intervention strategies']
    });
  }
  
  return patterns;
}
