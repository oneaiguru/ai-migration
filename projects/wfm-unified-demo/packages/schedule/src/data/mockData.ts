import type {
  ScheduleData,
  Employee as ScheduleEmployee,
  ScheduleGridResponse
} from '../services/realScheduleService';
import type { ShiftTemplate } from '../services/realShiftTemplateService';
import type { CalendarEvent, CalendarView, CalendarResponse } from '../services/realCalendarService';
import type { TimeOffRequest, TimeOffBalance } from '../services/realTimeOffService';
import type {
  OptimizationConstraint,
  OptimizationScenario,
  ScheduleConflict
} from '../services/realOptimizationService';

// === Schedule Grid Data ===
export const mockScheduleEmployees: ScheduleEmployee[] = [
  {
    id: 'emp-1',
    employeeId: 'CC-001',
    firstName: 'Александр',
    lastName: 'Иванов',
    fullName: 'Александр Иванов',
    role: 'Старший оператор',
    scheduledHours: 168,
    plannedHours: 160,
    photo: 'АИ',
    skills: ['Входящая линия_1', 'Продажи'],
    isActive: true
  },
  {
    id: 'emp-2',
    employeeId: 'CC-002',
    firstName: 'Елена',
    lastName: 'Петрова',
    fullName: 'Елена Петрова',
    role: 'Оператор',
    scheduledHours: 155,
    plannedHours: 160,
    photo: 'ЕП',
    skills: ['Входящая линия_1', 'Чат поддержка'],
    isActive: true
  },
  {
    id: 'emp-3',
    employeeId: 'CC-003',
    firstName: 'Дмитрий',
    lastName: 'Кузнецов',
    fullName: 'Дмитрий Кузнецов',
    role: 'Оператор',
    scheduledHours: 160,
    plannedHours: 160,
    photo: 'ДК',
    skills: ['VIP поддержка'],
    isActive: true
  },
  {
    id: 'emp-4',
    employeeId: 'CC-004',
    firstName: 'Ольга',
    lastName: 'Смирнова',
    fullName: 'Ольга Смирнова',
    role: 'Супервизор смены',
    scheduledHours: 172,
    plannedHours: 168,
    photo: 'ОС',
    skills: ['Управление', 'Обучение'],
    isActive: true
  },
  {
    id: 'emp-5',
    employeeId: 'CC-005',
    firstName: 'Анна',
    lastName: 'Васильева',
    fullName: 'Анна Васильева',
    role: 'Оператор',
    scheduledHours: 150,
    plannedHours: 160,
    photo: 'АВ',
    skills: ['Продажи', 'Переговоры'],
    isActive: true
  },
  {
    id: 'emp-6',
    employeeId: 'CC-006',
    firstName: 'Сергей',
    lastName: 'Новиков',
    fullName: 'Сергей Новиков',
    role: 'Оператор',
    scheduledHours: 160,
    plannedHours: 160,
    photo: 'СН',
    skills: ['Техподдержка'],
    isActive: true
  },
  {
    id: 'emp-7',
    employeeId: 'CC-007',
    firstName: 'Мария',
    lastName: 'Федорова',
    fullName: 'Мария Федорова',
    role: 'Наставник',
    scheduledHours: 140,
    plannedHours: 150,
    photo: 'МФ',
    skills: ['Обучение', 'Адаптация'],
    isActive: true
  },
  {
    id: 'emp-8',
    employeeId: 'CC-008',
    firstName: 'Иван',
    lastName: 'Орлов',
    fullName: 'Иван Орлов',
    role: 'Аналитик смены',
    scheduledHours: 165,
    plannedHours: 168,
    photo: 'ИО',
    skills: ['Аналитика', 'Отчетность'],
    isActive: true
  }
];

const julyDate = (day: number) => `2024-07-${String(day).padStart(2, '0')}`;

export const mockScheduleEntries: ScheduleData[] = [
  {
    id: 'shift-1',
    employeeId: 'emp-1',
    date: julyDate(1),
    startTime: '08:00',
    endTime: '16:00',
    shiftTypeId: 'day',
    status: 'confirmed',
    duration: 480,
    color: '#74a689'
  },
  {
    id: 'shift-2',
    employeeId: 'emp-1',
    date: julyDate(2),
    startTime: '08:00',
    endTime: '16:00',
    shiftTypeId: 'day',
    status: 'confirmed',
    duration: 480,
    color: '#74a689'
  },
  {
    id: 'shift-3',
    employeeId: 'emp-2',
    date: julyDate(1),
    startTime: '10:00',
    endTime: '18:00',
    shiftTypeId: 'day',
    status: 'confirmed',
    duration: 480,
    color: '#60a5fa'
  },
  {
    id: 'shift-4',
    employeeId: 'emp-3',
    date: julyDate(1),
    startTime: '12:00',
    endTime: '20:00',
    shiftTypeId: 'evening',
    status: 'confirmed',
    duration: 480,
    color: '#f59e0b'
  },
  {
    id: 'shift-5',
    employeeId: 'emp-4',
    date: julyDate(2),
    startTime: '20:00',
    endTime: '04:00',
    shiftTypeId: 'night',
    status: 'confirmed',
    duration: 480,
    color: '#4f46e5'
  },
  {
    id: 'shift-6',
    employeeId: 'emp-5',
    date: julyDate(3),
    startTime: '09:00',
    endTime: '17:00',
    shiftTypeId: 'day',
    status: 'pending',
    duration: 480,
    color: '#fbbf24'
  },
  {
    id: 'shift-7',
    employeeId: 'emp-6',
    date: julyDate(4),
    startTime: '07:00',
    endTime: '15:00',
    shiftTypeId: 'morning',
    status: 'confirmed',
    duration: 480,
    color: '#34d399'
  },
  {
    id: 'shift-8',
    employeeId: 'emp-7',
    date: julyDate(5),
    startTime: '14:00',
    endTime: '22:00',
    shiftTypeId: 'evening',
    status: 'confirmed',
    duration: 480,
    color: '#fb7185'
  },
  {
    id: 'shift-9',
    employeeId: 'emp-8',
    date: julyDate(6),
    startTime: '09:00',
    endTime: '17:00',
    shiftTypeId: 'day',
    status: 'confirmed',
    duration: 480,
    color: '#2dd4bf'
  }
];

export const mockScheduleStats: ScheduleGridResponse['statistics'] = {
  totalEmployees: mockScheduleEmployees.length,
  totalShifts: mockScheduleEntries.length,
  coveragePercentage: 92
};

export const mockSchedulePeriod: ScheduleGridResponse['period'] = {
  startDate: julyDate(1),
  endDate: julyDate(31)
};

// === Shift Templates ===
export const mockShiftTemplates: ShiftTemplate[] = [
  {
    id: 'template-1',
    name: 'Дневная смена 8 часов',
    startTime: '08:00',
    endTime: '16:00',
    duration: 480,
    breakDuration: 60,
    color: '#74a689',
    type: 'day',
    workPattern: '5/2',
    isActive: true,
    createdAt: '2024-05-12',
    createdBy: 'planner@wfm.demo'
  },
  {
    id: 'template-2',
    name: 'Вечерняя смена 8 часов',
    startTime: '14:00',
    endTime: '22:00',
    duration: 480,
    breakDuration: 45,
    color: '#f59e0b',
    type: 'overtime',
    workPattern: '2/2',
    isActive: true,
    createdAt: '2024-05-18',
    createdBy: 'planner@wfm.demo'
  },
  {
    id: 'template-3',
    name: 'Ночная смена',
    startTime: '22:00',
    endTime: '06:00',
    duration: 480,
    breakDuration: 60,
    color: '#4f46e5',
    type: 'night',
    workPattern: '4/3',
    isActive: false,
    createdAt: '2024-06-01',
    createdBy: 'planner@wfm.demo'
  }
];

// === Calendar ===
export const mockCalendarView: CalendarView = {
  id: 'default',
  name: 'Monthly View',
  type: 'month',
  startDate: julyDate(1),
  endDate: julyDate(31),
  showWeekends: true
};

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    employeeId: 'emp-1',
    title: 'Плановое обучение',
    description: 'Тренинг по работе с возражениями',
    startDate: julyDate(8),
    endDate: julyDate(8),
    startTime: '10:00',
    endTime: '12:00',
    type: 'training',
    status: 'confirmed',
    color: '#3b82f6',
    isAllDay: false,
    isRecurring: false
  },
  {
    id: 'cal-2',
    employeeId: 'emp-4',
    title: 'Смена супервизора',
    startDate: julyDate(12),
    endDate: julyDate(12),
    startTime: '09:00',
    endTime: '18:00',
    type: 'shift',
    status: 'pending',
    color: '#10b981',
    isAllDay: false,
    isRecurring: false
  },
  {
    id: 'cal-3',
    employeeId: 'emp-2',
    title: 'Отгул',
    startDate: julyDate(19),
    endDate: julyDate(19),
    type: 'personal',
    status: 'confirmed',
    color: '#f97316',
    isAllDay: true,
    isRecurring: false
  }
];

export const mockCalendarResponse: CalendarResponse = {
  events: mockCalendarEvents,
  view: mockCalendarView,
  statistics: {
    totalEvents: mockCalendarEvents.length,
    confirmedEvents: mockCalendarEvents.filter(e => e.status === 'confirmed').length,
    pendingEvents: mockCalendarEvents.filter(e => e.status === 'pending').length,
    conflicts: 1
  },
  conflicts: [
    {
      id: 'conf-1',
      description: 'Пересечение смены и тренинга',
      severity: 'medium',
      eventIds: ['cal-1', 'cal-2']
    }
  ]
};

// === Time Off ===
export const mockTimeOffRequests: TimeOffRequest[] = [
  {
    id: 'to-1',
    employeeId: 'emp-2',
    employeeName: 'Елена Петрова',
    type: 'vacation',
    startDate: julyDate(22),
    endDate: julyDate(26),
    totalDays: 5,
    status: 'approved',
    reason: 'Летний отпуск',
    submittedAt: '2024-06-15T09:00:00Z',
    approvedBy: 'hr@wfm.demo',
    approvalDate: '2024-06-18T11:30:00Z',
    isEmergency: false
  },
  {
    id: 'to-2',
    employeeId: 'emp-5',
    employeeName: 'Анна Васильева',
    type: 'sick_leave',
    startDate: julyDate(10),
    endDate: julyDate(12),
    totalDays: 3,
    status: 'pending',
    reason: 'Рекомендация врача',
    submittedAt: '2024-07-08T08:15:00Z',
    isEmergency: true
  },
  {
    id: 'to-3',
    employeeId: 'emp-7',
    employeeName: 'Мария Федорова',
    type: 'training',
    startDate: julyDate(17),
    endDate: julyDate(17),
    totalDays: 1,
    status: 'approved',
    reason: 'Внутренний семинар',
    submittedAt: '2024-07-01T10:00:00Z',
    approvedBy: 'trainer@wfm.demo',
    approvalDate: '2024-07-03T09:45:00Z',
    isEmergency: false
  }
];

export const mockTimeOffBalances: TimeOffBalance[] = [
  {
    employeeId: 'emp-2',
    vacation: { total: 28, used: 10, pending: 5, available: 13 },
    sickLeave: { total: 15, used: 3, available: 12 },
    personal: { total: 5, used: 1, available: 4 },
    year: 2024,
    lastUpdated: '2024-07-01T08:00:00Z'
  },
  {
    employeeId: 'emp-5',
    vacation: { total: 24, used: 6, pending: 0, available: 18 },
    sickLeave: { total: 10, used: 2, available: 8 },
    personal: { total: 4, used: 0, available: 4 },
    year: 2024,
    lastUpdated: '2024-07-01T08:00:00Z'
  },
  {
    employeeId: 'emp-7',
    vacation: { total: 30, used: 4, pending: 2, available: 24 },
    sickLeave: { total: 12, used: 1, available: 11 },
    personal: { total: 6, used: 1, available: 5 },
    year: 2024,
    lastUpdated: '2024-07-01T08:00:00Z'
  }
];

// === Optimization ===
export const mockOptimizationConstraints: OptimizationConstraint[] = [
  {
    id: 'opt-constraint-1',
    type: 'coverage',
    name: 'Минимальное покрытие',
    description: 'Не менее 6 операторов в пиковые часы',
    weight: 1,
    isActive: true,
    parameters: { minOperators: 6, timeRange: '09:00-21:00' }
  },
  {
    id: 'opt-constraint-2',
    type: 'skill',
    name: 'Навык VIP поддержки',
    description: 'В каждой смене нужен хотя бы один специалист VIP',
    weight: 0.8,
    isActive: true,
    parameters: { requiredSkill: 'VIP поддержка' }
  },
  {
    id: 'opt-constraint-3',
    type: 'cost',
    name: 'Снижение овертайма',
    description: 'Минимизировать сверхурочные часы',
    weight: 0.6,
    isActive: true,
    parameters: { maxOvertimeHours: 20 }
  }
];

export const mockOptimizationScenarios: OptimizationScenario[] = [
  {
    id: 'scenario-1',
    name: 'Базовый оптимизированный график',
    constraints: mockOptimizationConstraints,
    parameters: {
      targetCost: 120000,
      minCoverage: 0.9,
      maxOvertime: 25,
      fairnessIndex: 0.85
    },
    results: {
      cost: 118500,
      coverage: 0.93,
      fairness: 0.87,
      conflicts: 2,
      score: 0.91,
      optimizationTime: 42,
      iterationsCompleted: 65
    },
    status: 'completed',
    createdAt: '2024-06-30T09:00:00Z',
    completedAt: '2024-06-30T09:00:42Z'
  },
  {
    id: 'scenario-2',
    name: 'Экспериментальная схема с обучением',
    constraints: mockOptimizationConstraints.map(constraint =>
      constraint.id === 'opt-constraint-2'
        ? { ...constraint, isActive: false }
        : constraint
    ),
    parameters: {
      targetCost: 125000,
      minCoverage: 0.88,
      maxOvertime: 30,
      fairnessIndex: 0.9
    },
    status: 'pending',
    createdAt: '2024-07-05T12:10:00Z'
  }
];

export const mockOptimizationConflicts: ScheduleConflict[] = [
  {
    id: 'opt-conflict-1',
    type: 'skill_mismatch',
    severity: 'medium',
    description: '10 июля на вечерней смене отсутствует специалист по VIP поддержке',
    affectedEmployees: ['emp-3', 'emp-5'],
    suggestedResolution: 'Перенести Дмитрия Кузнецова на эту смену',
    estimatedImpact: {
      coverageDecrease: 12
    }
  },
  {
    id: 'opt-conflict-2',
    type: 'overtime',
    severity: 'low',
    description: 'Анна Васильева превысит лимит на 2 часа',
    affectedEmployees: ['emp-5'],
    suggestedResolution: 'Сократить смену 14 июля на 2 часа',
    estimatedImpact: {
      costIncrease: 1500
    }
  }
];

export const mockOptimizationRecommendations: string[] = [
  'Перенести часть обучений на менее загруженные часы',
  'Увеличить количество операторов с навыком VIP поддержки на ночных сменах',
  'Рассмотреть возможность введения гибких смен для снижения овертайма'
];

// Utility helpers to produce derived responses -----------------------------

export const buildScheduleResponse = (): ScheduleGridResponse => ({
  employees: mockScheduleEmployees,
  schedules: mockScheduleEntries,
  period: mockSchedulePeriod,
  statistics: mockScheduleStats
});

export const buildCalendarResponse = (): CalendarResponse => ({
  ...mockCalendarResponse,
  events: [...mockCalendarEvents]
});

export const buildTimeOffStatistics = () => ({
  totalRequests: mockTimeOffRequests.length,
  pendingRequests: mockTimeOffRequests.filter(r => r.status === 'pending').length,
  approvedRequests: mockTimeOffRequests.filter(r => r.status === 'approved').length,
  rejectedRequests: mockTimeOffRequests.filter(r => r.status === 'rejected').length,
  averageApprovalTime: 2.5
});
