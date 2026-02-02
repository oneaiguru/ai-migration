// Mock data integration from completed modules
import { 
  ScheduleData, 
  ForecastData, 
  EmployeeData, 
  RequestData, 
  KPIMetric,
  AdminRequest,
  ScheduleChangeRequest,
  ShiftExchangeRequest,
  Employee,
  FilterState
} from '../types';

// Data from Chat 2 - Schedule Grid System
export const mockScheduleData: ScheduleData = {
  adherenceRate: 96.1,
  coveragePercentage: 87.3,
  totalEmployees: 156,
  scheduledHours: 1248,
  shiftDistribution: {
    'Morning': 42,
    'Afternoon': 38,
    'Evening': 28,
    'Night': 18,
    'Split': 14,
    'Flexible': 16
  }
};

// Data from Chat 3 - Forecasting Analytics
export const mockForecastData: ForecastData = {
  mape: 12.4,
  accuracy: 87.6,
  predictions: [
    { timestamp: new Date('2024-06-01'), value: 145, category: 'calls' },
    { timestamp: new Date('2024-06-02'), value: 162, category: 'calls' },
    { timestamp: new Date('2024-06-03'), value: 178, category: 'calls' },
    { timestamp: new Date('2024-06-04'), value: 134, category: 'calls' },
    { timestamp: new Date('2024-06-05'), value: 189, category: 'calls' }
  ],
  modelPerformance: [
    { metric: 'MAPE', value: 12.4, timestamp: new Date() },
    { metric: 'RMSE', value: 15.7, timestamp: new Date() },
    { metric: 'MAE', value: 8.9, timestamp: new Date() }
  ]
};

// Data from Chat 4 - Employee Management  
export const mockEmployeeData: EmployeeData = {
  utilizationRates: {
    'John Smith': 94.2,
    'Sarah Johnson': 87.8,
    'Mike Wilson': 91.5,
    'Emma Davis': 89.3,
    'Alex Brown': 92.7
  },
  performanceScores: {
    'John Smith': 4.8,
    'Sarah Johnson': 4.6,
    'Mike Wilson': 4.7,
    'Emma Davis': 4.9,
    'Alex Brown': 4.5
  },
  absenteeismRate: 4.2,
  skillsDistribution: {
    'Technical Support': 45,
    'Sales': 32,
    'Customer Service': 28,
    'Billing': 18,
    'Escalations': 12
  }
};

// Data from Chat 6 - Employee Portal
export const mockRequestData: RequestData = {
  approvalRate: 94.3,
  averageResponseTime: 2.3,
  totalRequests: 1847,
  requestTypes: {
    'Time Off': 45,
    'Schedule Change': 28,
    'Training': 15,
    'Equipment': 8,
    'Other': 4
  }
};

// Calculated KPIs from all modules
export const mockKPIMetrics: KPIMetric[] = [
  {
    id: 'service-level',
    name: 'Service Level',
    value: 87.3,
    unit: '%',
    trend: 'up',
    change: 2.1,
    changePercent: 2.5,
    target: 85,
    status: 'excellent'
  },
  {
    id: 'schedule-adherence',
    name: 'Schedule Adherence',
    value: 96.1,
    unit: '%',
    trend: 'up',
    change: 1.8,
    changePercent: 1.9,
    target: 95,
    status: 'excellent'
  },
  {
    id: 'forecast-accuracy',
    name: 'Forecast Accuracy',
    value: 87.6,
    unit: '%',
    trend: 'stable',
    change: 0.3,
    changePercent: 0.3,
    target: 85,
    status: 'good'
  },
  {
    id: 'absenteeism-rate',
    name: 'Absenteeism Rate',
    value: 4.2,
    unit: '%',
    trend: 'down',
    change: -0.5,
    changePercent: -10.6,
    target: 5,
    status: 'good'
  },
  {
    id: 'request-approval-rate',
    name: 'Request Approval Rate',
    value: 94.3,
    unit: '%',
    trend: 'up',
    change: 1.2,
    changePercent: 1.3,
    target: 90,
    status: 'excellent'
  },
  {
    id: 'avg-response-time',
    name: 'Avg Response Time',
    value: 2.3,
    unit: 'hours',
    trend: 'down',
    change: -0.4,
    changePercent: -14.8,
    target: 4,
    status: 'excellent'
  }
];

// Admin Requests Mock Data
export const mockEmployees: Employee[] = [
  {
    id: 'emp_001',
    name: 'Иванов Иван Иванович',
    email: 'i.ivanov@company.com',
    department: 'Контакт-центр',
    position: 'Оператор 1-й линии',
    skills: ['Technical Support', 'Customer Service']
  },
  {
    id: 'emp_002',
    name: 'Петрова Мария Сергеевна',
    email: 'm.petrova@company.com',
    department: 'Контакт-центр',
    position: 'Старший оператор',
    skills: ['Sales', 'Escalations', 'Customer Service']
  },
  {
    id: 'emp_003',
    name: 'Сидоров Петр Александрович',
    email: 'p.sidorov@company.com',
    department: 'Контакт-центр',
    position: 'Оператор 2-й линии',
    skills: ['Technical Support', 'Billing']
  },
  {
    id: 'emp_004',
    name: 'Козлова Елена Викторовна',
    email: 'e.kozlova@company.com',
    department: 'Контакт-центр',
    position: 'Ведущий специалист',
    skills: ['Training', 'Quality Assurance']
  },
  {
    id: 'emp_005',
    name: 'Морозов Андрей Николаевич',
    email: 'a.morozov@company.com',
    department: 'Контакт-центр',
    position: 'Оператор 1-й линии',
    skills: ['Customer Service', 'Sales']
  }
];

export const mockAdminRequests: AdminRequest[] = [
  {
    id: 'req_001',
    type: 'schedule_change',
    employeeId: 'emp_001',
    employeeName: 'Иванов Иван Иванович',
    submissionDate: new Date('2024-07-15T10:30:00'),
    startDate: new Date('2024-07-20T08:00:00'),
    endDate: new Date('2024-07-20T16:00:00'),
    status: 'pending',
    description: 'Перенос смены с утренней на вечернюю по семейным обстоятельствам',
    priority: 'medium'
  },
  {
    id: 'req_002',
    type: 'shift_exchange',
    employeeId: 'emp_002',
    employeeName: 'Петрова Мария Сергеевна',
    submissionDate: new Date('2024-07-16T14:20:00'),
    startDate: new Date('2024-07-22T16:00:00'),
    status: 'approved',
    description: 'Обмен вечерней смены на утреннюю с коллегой',
    priority: 'high',
    managerNotes: 'Одобрено после согласования с обеими сторонами'
  },
  {
    id: 'req_003',
    type: 'schedule_change',
    employeeId: 'emp_003',
    employeeName: 'Сидоров Петр Александрович',
    submissionDate: new Date('2024-07-17T09:15:00'),
    startDate: new Date('2024-07-25T12:00:00'),
    endDate: new Date('2024-07-25T20:00:00'),
    status: 'rejected',
    description: 'Изменение времени начала смены на 4 часа позже',
    priority: 'low',
    managerNotes: 'Недостаточное покрытие в дневные часы'
  },
  {
    id: 'req_004',
    type: 'shift_exchange',
    employeeId: 'emp_004',
    employeeName: 'Козлова Елена Викторовна',
    submissionDate: new Date('2024-07-18T11:45:00'),
    startDate: new Date('2024-07-28T08:00:00'),
    status: 'pending',
    description: 'Замена смены на выходной день для участия в конференции',
    priority: 'medium'
  },
  {
    id: 'req_005',
    type: 'schedule_change',
    employeeId: 'emp_005',
    employeeName: 'Морозов Андрей Николаевич',
    submissionDate: new Date('2024-07-19T16:30:00'),
    startDate: new Date('2024-07-30T00:00:00'),
    endDate: new Date('2024-07-30T08:00:00'),
    status: 'approved',
    description: 'Переход на ночную смену по личной просьбе',
    priority: 'low',
    managerNotes: 'Одобрено, есть потребность в ночных операторах'
  },
  {
    id: 'req_006',
    type: 'shift_exchange',
    employeeId: 'emp_001',
    employeeName: 'Иванов Иван Иванович',
    submissionDate: new Date('2024-07-20T12:00:00'),
    startDate: new Date('2024-08-01T14:00:00'),
    status: 'pending',
    description: 'Обмен дневной смены на вечернюю',
    priority: 'high'
  }
];

export const defaultFilterState: FilterState = {
  mode: 'current',
  searchTerm: ''
};