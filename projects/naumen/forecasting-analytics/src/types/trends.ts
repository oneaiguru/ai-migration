// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/types/trends.ts
// Trend Analysis Type Definitions

export interface TrendSeriesPointFixture {
  timestamp: string;
  forecast: number;
  actual?: number;
  confidence?: number;
}

export interface TrendSeriesFixture {
  queueId: string;
  queueName: string;
  strategic: TrendSeriesPointFixture[];
  tactical: TrendSeriesPointFixture[];
  operational: TrendSeriesPointFixture[];
  serviceLevelTarget?: number;
}

export interface TrendSeedDefaults {
  queueId: string;
  period: {
    start: string;
    end: string;
  };
}

export interface TrendPattern {
  id: string;
  type: 'growth' | 'decline' | 'cyclical' | 'seasonal' | 'irregular';
  strength: number;        // 0-1 confidence score
  period: string;          // "daily", "weekly", "monthly", etc.
  startDate: Date;
  endDate: Date;
  description: string;
  statisticalSignificance: number;
  recommendations: string[];
}

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

export interface SeasonalComponent {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  strength: number;
  peaks: number[];
  valleys: number[];
  amplitude: number;
  phase: number;
  confidence: number;
}

export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  forecast?: number;
  trend?: number;
  seasonal?: number;
  residual?: number;
  anomaly?: boolean;
  confidence?: number;
}

export interface TrendAnalysisConfig {
  algorithms: {
    seasonality: 'stl' | 'x13' | 'fourier';    // Seasonal decomposition
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

export interface TrendMetrics {
  growthRate: number;
  volatility: number;
  seasonalityStrength: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  cyclicalPatterns: string[];
  forecastAccuracy: number;
  lastUpdated: Date;
}

export interface TrendAlert {
  id: string;
  type: 'trend_change' | 'anomaly' | 'forecast_deviation' | 'pattern_shift';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  data: TrendDataPoint[];
  actionRequired: boolean;
  acknowledged: boolean;
}

export interface ForecastVariance {
  period: string;
  forecast: number;
  actual: number;
  variance: number;
  variancePercent: number;
  explanation: string;
  accuracy: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TrendViewState {
  timeRange: {
    start: Date;
    end: Date;
  };
  granularity: 'hour' | 'day' | 'week' | 'month';
  selectedMetrics: string[];
  anomaliesVisible: boolean;
  trendsVisible: boolean;
  forecastVisible: boolean;
  comparisonMode: boolean;
  selectedQueues: string[];
}

export interface TrendChartProps {
  data: TrendDataPoint[];
  config: TrendAnalysisConfig;
  viewState: TrendViewState;
  onDataPointClick?: (point: TrendDataPoint) => void;
  onAnomalyClick?: (anomaly: AnomalyEvent) => void;
  className?: string;
}

export interface TrendDashboardProps {
  organizationId: string;
  queueIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  refreshInterval?: number;
  onAlert?: (alert: TrendAlert) => void;
}
