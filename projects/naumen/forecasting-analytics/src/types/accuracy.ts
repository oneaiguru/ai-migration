// Accuracy Analytics Type Definitions

export interface AccuracyMetrics {
  mape: number;          // Mean Absolute Percentage Error
  mae: number;           // Mean Absolute Error  
  rmse: number;          // Root Mean Square Error
  rSquared: number;      // Coefficient of Determination
  bias: number;          // Forecast Bias
  confidenceInterval: {
    lower: number;
    upper: number;
    level: number;       // 95%, 99%, etc.
  };
  pValue: number;        // Statistical significance
  sampleSize: number;    // Number of data points
}

export interface ForecastDataPoint {
  timestamp: string;
  predicted: number;
  actual?: number;
  confidence?: number;
  adjustments?: number;
}

export interface ActualDataPoint {
  timestamp: string;
  value: number;
  quality?: 'good' | 'warning' | 'poor';
}

export type AlgorithmType = 'arima' | 'basic_extrapolation' | 'linear_regression' | 'seasonal_naive' | 'exponential_smoothing';

export interface DateRange {
  start: string;
  end: string;
}

export interface ModelComparison {
  algorithmId: AlgorithmType;
  algorithmName: string;
  metrics: AccuracyMetrics;
  processingTime: number;
  lastUpdated: Date;
  status: 'active' | 'testing' | 'deprecated';
}

export interface HistoricalAccuracy {
  date: string;
  algorithmId: AlgorithmType;
  metrics: AccuracyMetrics;
  dataPoints: number;
}

export interface TrendData {
  date: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

export interface Alert {
  id: string;
  type: 'accuracy_degradation' | 'confidence_low' | 'bias_high' | 'data_quality';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface ValidationResult {
  method: 'holdout' | 'crossValidation' | 'timeSeries';
  folds?: number;
  testSize: number;
  metrics: AccuracyMetrics;
  trainingMetrics?: AccuracyMetrics;
  validationMetrics?: AccuracyMetrics;
}

export interface ErrorPattern {
  timeOfDay: string;
  dayOfWeek: string;
  averageError: number;
  errorType: 'over_forecast' | 'under_forecast' | 'balanced';
  frequency: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  timeRange: DateRange;
  algorithms: AlgorithmType[];
  includeCharts: boolean;
  includeRawData: boolean;
}

export interface AccuracyInput {
  forecastData: ForecastDataPoint[];
  actualData: ActualDataPoint[];
  algorithm: AlgorithmType;
  timeRange: DateRange;
  validationMethod: 'holdout' | 'crossValidation' | 'timeSeries';
}

export interface AccuracyOutput {
  metrics: AccuracyMetrics;
  trends: TrendData[];
  recommendations: string[];
  alerts: Alert[];
}

export interface AccuracyState {
  currentMetrics: AccuracyMetrics | null;
  historicalData: HistoricalAccuracy[];
  comparisons: ModelComparison[];
  selectedTimeRange: DateRange;
  selectedAlgorithms: AlgorithmType[];
  loading: boolean;
  error: string | null;
}
