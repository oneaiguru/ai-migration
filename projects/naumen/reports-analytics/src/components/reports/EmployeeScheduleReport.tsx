import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { mockScheduleData } from '../../data/mockData';
import { getBarChartConfig, chartColors, formatPercentage } from '../../utils';
import { 
  UsersIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertTriangleIcon,
  CalendarIcon 
} from 'lucide-react';

interface EmployeeScheduleReportProps {
  dateRange?: { start: Date; end: Date };
}

export const EmployeeScheduleReport: React.FC<EmployeeScheduleReportProps> = ({
  dateRange
}) => {
  const [viewType, setViewType] = useState<'coverage' | 'adherence'>('coverage');

  // Coverage data by time slots
  const coverageData: ChartData = {
    labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Покрытие (%)',
        data: [78, 95, 98, 92, 89, 94, 87, 82, 75],
        backgroundColor: chartColors.primary[0] + '80',
        borderColor: chartColors.primary[0],
        borderWidth: 1
      }
    ]
  };

  // Adherence data by shifts
  const adherenceData: ChartData = {
    labels: ['Утренняя', 'Дневная', 'Вечерняя', 'Ночная', 'Гибкая'],
    datasets: [
      {
        label: 'Соблюдение (%)',
        data: [97, 94, 92, 89, 96],
        backgroundColor: chartColors.success[0] + '80',
        borderColor: chartColors.success[0],
        borderWidth: 1
      }
    ]
  };

  const currentData = viewType === 'coverage' ? coverageData : adherenceData;
  const chartTitle = viewType === 'coverage' ? 'Покрытие по времени' : 'Соблюдение расписания по сменам';

  const chartConfig = getBarChartConfig(chartTitle);

  const options = {
    ...chartConfig.options,
    scales: {
      ...chartConfig.options?.scales,
      y: {
        ...chartConfig.options?.scales?.y,
        title: {
          display: true,
          text: viewType === 'coverage' ? 'Покрытие (%)' : 'Соблюдение (%)'
        },
        min: 70,
        max: 100
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Рабочий график сотрудников</h3>
          <p className="text-sm text-gray-500">
            Анализ соблюдения расписания и покрытия смен
          </p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewType('coverage')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              viewType === 'coverage'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClockIcon className="w-4 h-4 inline mr-1" />
            Покрытие
          </button>
          <button
            onClick={() => setViewType('adherence')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              viewType === 'adherence'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircleIcon className="w-4 h-4 inline mr-1" />
            Соблюдение
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{mockScheduleData.totalEmployees}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
            <UsersIcon className="w-4 h-4 mr-1" />
            Сотрудников
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatPercentage(mockScheduleData.adherenceRate)}
          </div>
          <div className="text-sm text-gray-600">Соблюдение</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(mockScheduleData.coveragePercentage)}
          </div>
          <div className="text-sm text-gray-600">Покрытие</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{mockScheduleData.scheduledHours}ч</div>
          <div className="text-sm text-gray-600">Запланировано</div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container mb-6">
        <Bar data={currentData} options={options} />
      </div>

      {/* Shift Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Распределение по сменам</h4>
          <div className="space-y-2">
            {Object.entries(mockScheduleData.shiftDistribution).map(([shift, count]) => (
              <div key={shift} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{shift}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / mockScheduleData.totalEmployees) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Предупреждения</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <AlertTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-900 font-medium">Недостаточное покрытие</p>
                <p className="text-gray-500">Вечерняя смена (18:00-22:00)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-900 font-medium">Низкое соблюдение</p>
                <p className="text-gray-500">Ночная смена (22:00-06:00)</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-900 font-medium">Отличные показатели</p>
                <p className="text-gray-500">Утренняя смена (06:00-14:00)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};