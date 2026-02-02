// Core interfaces for the Reports & Analytics module

export interface ReportData {
  id: string;
  name: string;
  description: string;
  category: 'main' | 'custom';
  icon: string;
  lastGenerated?: Date;
  createdBy?: string;
  parameters?: ReportParameter[];
}

export interface ReportParameter {
  id: string;
  name: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'number' | 'text';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ScheduleData {
  adherenceRate: number;
  coveragePercentage: number;
  totalEmployees: number;
  scheduledHours: number;
  shiftDistribution: Record<string, number>;
}

export interface ForecastData {
  mape: number;
  accuracy: number;
  predictions: TimeSeriesData[];
  modelPerformance: MetricsData[];
}

export interface EmployeeData {
  utilizationRates: Record<string, number>;
  performanceScores: Record<string, number>;
  absenteeismRate: number;
  skillsDistribution: Record<string, number>;
}

export interface RequestData {
  approvalRate: number;
  averageResponseTime: number;
  totalRequests: number;
  requestTypes: Record<string, number>;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  category?: string;
}

export interface MetricsData {
  metric: string;
  value: number;
  timestamp: Date;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  parameters?: Record<string, any>;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  config: {
    dataSource: string;
    chartType: 'line' | 'bar' | 'pie' | 'table' | 'gauge';
    filters: ReportParameter[];
    columns: string[];
    aggregations?: Record<string, 'sum' | 'avg' | 'count' | 'max' | 'min'>;
  };
}

// Admin Request Management Types
export interface AdminRequest {
  id: string;
  type: 'schedule_change' | 'shift_exchange';
  employeeId: string;
  employeeName: string;
  submissionDate: Date;
  startDate: Date;
  endDate?: Date;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  managerNotes?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ScheduleChangeRequest extends AdminRequest {
  type: 'schedule_change';
  originalShift: ShiftInfo;
  requestedShift: ShiftInfo;
  reason: string;
}

export interface ShiftExchangeRequest extends AdminRequest {
  type: 'shift_exchange';
  initiatingEmployee: string;
  targetEmployee: string;
  originalShift: ShiftInfo;
  targetShift: ShiftInfo;
  exchangeDate: Date;
  approved: boolean;
}

export interface ShiftInfo {
  start: string;
  end: string;
  date?: Date;
  skillRequired?: string;
}

export interface FilterState {
  mode: 'current' | 'period' | 'employee';
  startDate?: Date;
  endDate?: Date;
  selectedEmployee?: string;
  searchTerm: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  skills: string[];
}