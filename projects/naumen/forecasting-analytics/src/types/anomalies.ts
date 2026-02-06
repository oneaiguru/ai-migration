// Anomaly Detection Types

export interface AnomalyEvent {
  timestamp: Date;
  value: number;
  expectedValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'shift' | 'outlier';
  explanation: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  actionRequired: boolean;
}

export interface TrendAlert {
  id: string;
  type: 'trend_change' | 'anomaly_detected' | 'pattern_break' | 'seasonal_shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  affectedMetric: string;
  currentValue: number;
  expectedValue?: number;
  actionRequired: boolean;
  recommendations: string[];
  acknowledged: boolean;
}

export interface TrendComparison {
  period1: { start: string; end: string };
  period2: { start: string; end: string };
  metricType: 'volume' | 'growth' | 'variance';
  difference: number;
  percentageChange: number;
  significance: 'high' | 'medium' | 'low';
  summary: string;
}

export interface ForecastVariance {
  period: string;
  forecastValue: number;
  actualValue: number;
  variance: number;
  variancePercentage: number;
  trend: 'improving' | 'worsening' | 'stable';
  cumulativeVariance: number;
}

export interface DecompositionResult {
  trend: number[];
  seasonal: number[];
  residual: number[];
  timestamps: string[];
  method: 'stl' | 'x13' | 'classical';
  seasonalStrength: number;
  trendStrength: number;
  seasonalPeriods: number[];
}
