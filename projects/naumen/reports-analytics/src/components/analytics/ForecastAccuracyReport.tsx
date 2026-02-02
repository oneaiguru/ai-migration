import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { mockForecastData } from '../../data/mockData';
import { getLineChartConfig, chartColors, formatPercentage } from '../../utils';
import { 
  TrendingUpIcon, 
  TargetIcon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  BarChartIcon,
  LineChartIcon
} from 'lucide-react';

export const ForecastAccuracyReport: React.FC = () => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Historical accuracy data
  const accuracyTrendData: ChartData = {
    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
    datasets: [
      {
        label: 'Точность прогноза (%)',
        data: [82.1, 84.3, 86.7, 85.2, 87.1, 87.6],
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.primary[0] + '20',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Целевая точность (%)',
        data: [85, 85, 85, 85, 85, 85],
        borderColor: chartColors.warning[0],
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  // MAPE by time periods
  const mapeData: ChartData = {
    labels: ['Утро', 'День', 'Вечер', 'Ночь'],
    datasets: [
      {
        label: 'MAPE (%)',
        data: [11.2, 9.8, 14.7, 16.3],
        backgroundColor: [
          chartColors.success[0] + '80',
          chartColors.success[0] + '80', 
          chartColors.warning[0] + '80',
          chartColors.danger[0] + '80'
        ],
        borderColor: [
          chartColors.success[0],
          chartColors.success[0],
          chartColors.warning[0], 
          chartColors.danger[0]
        ],
        borderWidth: 1
      }
    ]
  };

  const chartConfig = getLineChartConfig('Динамика точности прогнозирования');

  const lineOptions = {
    ...chartConfig.options,
    scales: {
      ...chartConfig.options?.scales,
      y: {
        ...chartConfig.options?.scales?.y,
        title: {
          display: true,
          text: 'Точность (%)'
        },
        min: 70,
        max: 100
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'MAPE по временным периодам',
        font: { size: 16, weight: 'bold' }
      },
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'MAPE (%)'
        },
        max: 20
      }
    }
  };

  const getAccuracyStatus = (accuracy: number) => {
    if (accuracy >= 90) return { status: 'excellent', icon: CheckCircleIcon, color: 'text-green-600' };
    if (accuracy >= 85) return { status: 'good', icon: CheckCircleIcon, color: 'text-blue-600' };
    if (accuracy >= 80) return { status: 'warning', icon: AlertCircleIcon, color: 'text-yellow-600' };
    return { status: 'critical', icon: AlertCircleIcon, color: 'text-red-600' };
  };

  const currentAccuracy = getAccuracyStatus(mockForecastData.accuracy);

  return (
    <div className="space-y-6">
      {/* Header with KPIs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Точность прогнозирования</h3>
            <p className="text-sm text-gray-500">Анализ качества прогнозов и отклонений</p>
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LineChartIcon className="w-4 h-4 inline mr-1" />
              Тренд
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChartIcon className="w-4 h-4 inline mr-1" />
              MAPE
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(mockForecastData.accuracy)}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <currentAccuracy.icon className={`w-4 h-4 mr-1 ${currentAccuracy.color}`} />
              Общая точность
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(mockForecastData.mape)}
            </div>
            <div className="text-sm text-gray-600">MAPE</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+2.5%</div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              Улучшение
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">95%</div>
            <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
              <TargetIcon className="w-4 h-4 mr-1" />
              Цель достигнута
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="chart-container">
          {chartType === 'line' ? (
            <Line data={accuracyTrendData} options={lineOptions} />
          ) : (
            <Bar data={mapeData} options={barOptions} />
          )}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Анализ отклонений</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Утренний период</p>
                <p className="text-xs text-green-600">08:00 - 12:00</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">11.2%</p>
                <p className="text-xs text-green-600">Отличная точность</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Дневной период</p>
                <p className="text-xs text-blue-600">12:00 - 18:00</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">9.8%</p>
                <p className="text-xs text-blue-600">Хорошая точность</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-900">Вечерний период</p>
                <p className="text-xs text-yellow-600">18:00 - 22:00</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600">14.7%</p>
                <p className="text-xs text-yellow-600">Требует улучшения</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900">Ночной период</p>
                <p className="text-xs text-red-600">22:00 - 08:00</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">16.3%</p>
                <p className="text-xs text-red-600">Критично</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Рекомендации</h4>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-1">Модель прогнозирования</h5>
              <p className="text-sm text-blue-700">
                Рассмотреть улучшение алгоритмов для вечерних и ночных периодов
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h5 className="font-medium text-green-900 mb-1">Исторические данные</h5>
              <p className="text-sm text-green-700">
                Увеличить объем обучающих данных для нестандартных периодов
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h5 className="font-medium text-purple-900 mb-1">Мониторинг</h5>
              <p className="text-sm text-purple-700">
                Внедрить ежедневный контроль точности по временным сегментам
              </p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-medium text-orange-900 mb-1">Калибровка</h5>
              <p className="text-sm text-orange-700">
                Еженедельная корректировка параметров модели
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};