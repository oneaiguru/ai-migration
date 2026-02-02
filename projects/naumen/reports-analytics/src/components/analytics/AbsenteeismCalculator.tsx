import React, { useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { mockEmployeeData } from '../../data/mockData';
import { chartColors, formatPercentage, calculateAbsenteeismRate } from '../../utils';
import { 
  UserXIcon, 
  CalendarOffIcon, 
  TrendingUpIcon, 
  AlertTriangleIcon,
  DollarSignIcon,
  ClockIcon
} from 'lucide-react';

export const AbsenteeismCalculator: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Mock absenteeism data by reasons
  const absenteeismByReason: ChartData = {
    labels: ['Болезнь', 'Личные дела', 'Отпуск', 'Форс-мажор', 'Другое'],
    datasets: [
      {
        label: 'Дни отсутствия',
        data: [45, 23, 15, 8, 9],
        backgroundColor: chartColors.mixed.map(color => color + '80'),
        borderColor: chartColors.mixed,
        borderWidth: 2
      }
    ]
  };

  // Trend data over time
  const absenteeismTrend: ChartData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        label: 'Абсентеизм (%)',
        data: [5.2, 4.8, 4.1, 3.9, 4.5, 4.2],
        borderColor: chartColors.danger[0],
        backgroundColor: chartColors.danger[0] + '20',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Целевой уровень (%)',
        data: [5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
        borderColor: chartColors.warning[0],
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Абсентеизм по причинам',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Динамика абсентеизма',
        font: { size: 16, weight: 'bold' }
      },
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Абсентеизм (%)'
        },
        max: 8
      }
    }
  };

  // Calculate financial impact
  const avgSalaryPerDay = 250; // USD per day
  const totalAbsentDays = 100; // days per month
  const financialImpact = totalAbsentDays * avgSalaryPerDay;

  const getAbsenteeismStatus = (rate: number) => {
    if (rate <= 3) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (rate <= 5) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (rate <= 7) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'critical', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const currentStatus = getAbsenteeismStatus(mockEmployeeData.absenteeismRate);

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Калькулятор абсентеизма</h3>
            <p className="text-sm text-gray-500">Анализ отсутствий и их влияние на операции</p>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'month' ? 'Месяц' : period === 'quarter' ? 'Квартал' : 'Год'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`text-center p-4 rounded-lg ${currentStatus.bg}`}>
            <div className={`text-2xl font-bold ${currentStatus.color}`}>
              {formatPercentage(mockEmployeeData.absenteeismRate)}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <UserXIcon className="w-4 h-4 mr-1" />
              Общий уровень
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{totalAbsentDays}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <CalendarOffIcon className="w-4 h-4 mr-1" />
              Дней отсутствия
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">${financialImpact.toLocaleString()}</div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <DollarSignIcon className="w-4 h-4 mr-1" />
              Потери
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">-0.8%</div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              Изменение
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="chart-container h-80">
            <Doughnut data={absenteeismByReason} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="chart-container h-80">
            <Line data={absenteeismTrend} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangleIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Проблемные зоны
          </h4>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-900">Болезни</p>
              <p className="text-xs text-red-600">45% всех отсутствий</p>
              <p className="text-xs text-gray-500 mt-1">Рекомендуется профилактика</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">Личные дела</p>
              <p className="text-xs text-yellow-600">23% всех отсутствий</p>
              <p className="text-xs text-gray-500 mt-1">Улучшить планирование</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-900">Пятница</p>
              <p className="text-xs text-orange-600">+30% отсутствий</p>
              <p className="text-xs text-gray-500 mt-1">Особое внимание</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
            Влияние на операции
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Покрытие смен</span>
              <span className="text-sm font-medium text-red-600">-12%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Сверхурочные</span>
              <span className="text-sm font-medium text-orange-600">+18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Качество сервиса</span>
              <span className="text-sm font-medium text-yellow-600">-5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Удовлетворенность клиентов</span>
              <span className="text-sm font-medium text-red-600">-8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Рекомендации</h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-900">Профилактика</p>
              <p className="text-xs text-green-700">Программы здоровья для снижения болезней</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Гибкость</p>
              <p className="text-xs text-blue-700">Увеличить опции удаленной работы</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Мотивация</p>
              <p className="text-xs text-purple-700">Бонусы за 100% посещаемость</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-900">Замещение</p>
              <p className="text-xs text-orange-700">Система быстрого покрытия смен</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};