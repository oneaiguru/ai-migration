export type ReportFormat = 'csv' | 'xlsx' | 'pdf';

export type ReportStatus = 'available' | 'processing' | 'comingSoon';

export interface ReportParameter {
  id: string;
  label: string;
  value: string;
  hint?: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: 'forecasting' | 'schedule' | 'attendance' | 'performance' | 'licence' | 'payroll';
  availableFormats: ReportFormat[];
  defaultFormat: ReportFormat;
  parameters: ReportParameter[];
  status: ReportStatus;
}

const REPORTS: ReportDefinition[] = [
  {
    id: 'forecast-summary',
    name: 'Сводка прогноза',
    description: 'Итоговая таблица прогноза с фактом и отклонениями',
    category: 'forecasting',
    availableFormats: ['xlsx', 'csv'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'range', label: 'Период', value: 'Октябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'forecast-exceptions',
    name: 'Исключения прогноза',
    description: 'Перечень применённых исключений и их влияние',
    category: 'forecasting',
    availableFormats: ['csv'],
    defaultFormat: 'csv',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'range', label: 'Период', value: 'Последние 14 дней' },
    ],
    status: 'available',
  },
  {
    id: 'work-schedule',
    name: 'Рабочее расписание',
    description: 'Смены и назначенные роли по подразделениям',
    category: 'schedule',
    availableFormats: ['xlsx', 'pdf'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Ноябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'daily-schedule',
    name: 'Дневное расписание',
    description: 'Детализация смен на выбранную дату',
    category: 'schedule',
    availableFormats: ['pdf'],
    defaultFormat: 'pdf',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'date', label: 'Дата', value: '2025-11-04' },
    ],
    status: 'available',
  },
  {
    id: 'employee-schedule',
    name: 'Рабочий график сотрудников',
    description: 'Сводка смен и статусов для каждого сотрудника',
    category: 'schedule',
    availableFormats: ['xlsx'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Ноябрь 2025' },
    ],
    status: 'processing',
  },
  {
    id: 'punctuality',
    name: 'Пунктуальность',
    description: 'Опоздания, пропуски и ранние уходы',
    category: 'attendance',
    availableFormats: ['xlsx', 'csv'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'range', label: 'Период', value: 'Октябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'schedule-deviation',
    name: 'Отклонения расписания',
    description: 'Факт против плана с причинами отклонений',
    category: 'attendance',
    availableFormats: ['xlsx'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'range', label: 'Период', value: 'Октябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 't13',
    name: 'Т-13 (табель учёта)',
    description: 'Экспорт табеля учёта рабочего времени',
    category: 'attendance',
    availableFormats: ['xlsx', 'csv'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'Октябрь 2025' },
    ],
    status: 'available',
  },
  {
    id: 'build-log',
    name: 'Журнал построения прогнозов',
    description: 'Хронология запусков прогнозов и авторов',
    category: 'forecasting',
    availableFormats: ['csv'],
    defaultFormat: 'csv',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'range', label: 'Диапазон', value: 'Последние 30 дней' },
    ],
    status: 'available',
  },
  {
    id: 'licence-status',
    name: 'Статус лицензий',
    description: 'Потребление лицензий WFM и прогноз остатка',
    category: 'licence',
    availableFormats: ['pdf'],
    defaultFormat: 'pdf',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'snapshot', label: 'Срез', value: new Date().toLocaleString('ru-RU') },
    ],
    status: 'available',
  },
  {
    id: 'payroll',
    name: 'Расчёт заработной платы',
    description: 'Консолидация смен, ставок и сверхурочных',
    category: 'payroll',
    availableFormats: ['xlsx'],
    defaultFormat: 'xlsx',
    parameters: [
      { id: 'organisation', label: 'Организация', value: 'Контакт-центр 1010.ru' },
      { id: 'period', label: 'Период', value: 'III квартал 2025' },
    ],
    status: 'comingSoon',
  },
];

export const listReportDefinitions = (): ReportDefinition[] =>
  REPORTS.map((report) => ({
    ...report,
    parameters: report.parameters.map((parameter) => ({ ...parameter })),
  }));

export const findReportDefinition = (id: string): ReportDefinition | undefined =>
  REPORTS.find((report) => report.id === id);

export const buildReportFilename = (
  reportId: string,
  format: ReportFormat,
  timestamp = new Date(),
): string => `${reportId}_${timestamp.toISOString().slice(0, 10)}.${format}`;
