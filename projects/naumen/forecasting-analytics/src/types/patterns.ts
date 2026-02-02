// Pattern Recognition Types

export interface PatternDetectionConfig {
  algorithms: {
    seasonality: 'stl' | 'x13' | 'fourier';
    anomaly: 'isolation_forest' | 'statistical' | 'lstm';
    trend: 'linear_regression' | 'polynomial' | 'spline';
    cycles: 'fft' | 'autocorrelation' | 'wavelet';
  };
  sensitivity: {
    anomaly: 'low' | 'medium' | 'high';
    trend: 'subtle' | 'moderate' | 'significant';
    seasonality: number; // confidence threshold
  };
  timeWindows: {
    shortTerm: number;   // hours for daily patterns
    mediumTerm: number;  // days for weekly patterns  
    longTerm: number;    // weeks for seasonal patterns
  };
}

export interface DetectedPattern {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'custom';
  period: number;      // in hours/days/weeks
  strength: number;    // 0-1 confidence score
  phase: number;       // phase offset
  amplitude: number;   // pattern amplitude
  startDate: Date;
  endDate: Date;
  description: string;
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextOccurrence?: Date;
}

export interface PatternMatch {
  pattern: DetectedPattern;
  matchConfidence: number;
  deviations: number[];
  similarityScore: number;
  forecastAccuracy?: number;
}

export interface CyclicalPattern {
  period: number;      // length of cycle in time units
  amplitude: number;   // strength of cycle
  phase: number;       // phase offset
  reliability: number; // 0-1 confidence in pattern
  nextPeak: Date;
  nextTrough: Date;
}
