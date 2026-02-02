import React from 'react';
import { ReportData } from '../../types';
import { 
  ClockIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  TrendingUpIcon,
  UsersIcon,
  CreditCardIcon,
  FileTextIcon,
  SettingsIcon,
  ShieldIcon
} from 'lucide-react';

const mainReports: ReportData[] = [
  {
    id: 'work-time-chart',
    name: 'График рабочего времени',
    description: 'Work Time Chart',
    category: 'main',
    icon: 'clock',
    lastGenerated: new Date('2024-06-05T10:30:00')
  },
  {
    id: 'daily-work-time',
    name: 'График рабочего времени (сутки)',
    description: 'Daily Work Time Chart',
    category: 'main',
    icon: 'calendar',
    lastGenerated: new Date('2024-06-05T09:15:00')
  },
  {
    id: 'daily-punctuality',
    name: 'Пунктуальность за сутки',
    description: 'Daily Punctuality',
    category: 'main',
    icon: 'check-circle',
    lastGenerated: new Date('2024-06-05T08:45:00')
  },
  {
    id: 'overall-punctuality',
    name: 'Общая пунктуальность',
    description: 'Overall Punctuality',
    category: 'main',
    icon: 'trending-up',
    lastGenerated: new Date('2024-06-04T16:20:00')
  },
  {
    id: 'hour-deviations',
    name: 'Отклонения от нормы часов',
    description: 'Hour Norm Deviations',
    category: 'main',
    icon: 'trending-up',
    lastGenerated: new Date('2024-06-04T14:10:00')
  },
  {
    id: 'employee-schedule',
    name: 'Рабочий график сотрудников',
    description: 'Employee Work Schedule',
    category: 'main',
    icon: 'users',
    lastGenerated: new Date('2024-06-05T07:30:00')
  },
  {
    id: 'payroll-calculation',
    name: 'Расчет заработной платы',
    description: 'Salary Calculation',
    category: 'main',
    icon: 'credit-card',
    lastGenerated: new Date('2024-06-03T15:45:00')
  },
  {
    id: 'timesheet-t13',
    name: 'Табель учета рабочего времени (Т-13)',
    description: 'Time Sheet T-13',
    category: 'main',
    icon: 'file-text',
    lastGenerated: new Date('2024-06-02T11:20:00')
  },
  {
    id: 'schedule-building-log',
    name: 'Журнал построения расписания',
    description: 'Schedule Building Log',
    category: 'main',
    icon: 'settings',
    lastGenerated: new Date('2024-06-05T12:00:00')
  },
  {
    id: 'licenses',
    name: 'Лицензии',
    description: 'Licenses',
    category: 'main',
    icon: 'shield',
    lastGenerated: new Date('2024-06-01T09:00:00')
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    'clock': ClockIcon,
    'calendar': CalendarIcon,
    'check-circle': CheckCircleIcon,
    'trending-up': TrendingUpIcon,
    'users': UsersIcon,
    'credit-card': CreditCardIcon,
    'file-text': FileTextIcon,
    'settings': SettingsIcon,
    'shield': ShieldIcon
  };
  const IconComponent = icons[iconName as keyof typeof icons] || FileTextIcon;
  return <IconComponent className="w-5 h-5 text-gray-400" />;
};

interface MainReportsListingProps {
  onReportSelect?: (report: ReportData) => void;
}

export const MainReportsListing: React.FC<MainReportsListingProps> = ({ onReportSelect }) => {
  const formatLastGenerated = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Основные отчеты</h2>
        <p className="text-sm text-gray-500 mt-1">Предустановленные отчеты системы</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Отчет
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последнее создание
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mainReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportSelect?.(report)}
                className="table-row-hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {getIcon(report.icon)}
                    <span className="text-sm font-medium text-gray-900">{report.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{report.description}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {report.lastGenerated ? formatLastGenerated(report.lastGenerated) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};