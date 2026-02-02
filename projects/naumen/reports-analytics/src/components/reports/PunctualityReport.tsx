import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { getBarChartConfig, chartColors, formatPercentage } from '../../utils';
import { CalendarIcon, ClockIcon, TrendingUpIcon } from 'lucide-react';

interface PunctualityReportProps {
  viewType?: 'daily' | 'overall';
}

export const PunctualityReport: React.FC<PunctualityReportProps> = ({
  viewType = 'daily'
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'overall'>(viewType);

  // Mock daily punctuality data
  const dailyData: ChartData = {
    labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    datasets: [
      {
        label: 'Пунктуальность (%)',
        data: [95, 97, 96, 89, 85, 92, 94, 88, 91, 93, 96, 98],
        backgroundColor: chartColors.mixed.map(color => color + '80'),
        borderColor: chartColors.mixed,
        borderWidth: 1
      }
    ]
  };

  // Mock overall punctuality data
  const overallData: ChartData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'Общая пунктуальность (%)',
        data: [94, 96, 92, 89, 87, 91, 95],
        backgroundColor: chartColors.primary[0] + '80',
        borderColor: chartColors.primary[0],
        borderWidth: 1
      }
    ]
  };

  const currentData = activeView === 'daily' ? dailyData : overallData;
  const chartTitle = activeView === 'daily' ? 'Пунктуальность за сутки' : 'Общая пунктуальность';

  const chartConfig = getBarChartConfig(chartTitle);

  const options = {
    ...chartConfig.options,
    scales: {
      ...chartConfig.options?.scales,
      y: {
        ...chartConfig.options?.scales?.y,
        title: {
          display: true,
          text: 'Пунктуальность (%)'
        },
        min: 80,
        max: 100
      }
    },
    plugins: {
      ...chartConfig.options?.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Пунктуальность: ${context.parsed.y}%`;
          }
        }
      }
    }
  };

  const punctualityStats = {
    daily: {
      average: 92.8,
      best: 98,
      worst: 85,
      trend: 'up' as const
    },
    overall: {
      average: 92.0,
      best: 96,
      worst: 87,
      trend: 'stable' as const
    }
  };

  const stats = punctualityStats[activeView];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{chartTitle}</h3>
          <p className="text-sm text-gray-500">
            Анализ соблюдения времени прихода и ухода сотрудников
          </p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView('daily')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeView === 'daily'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            За сутки
          </button>
          <button
            onClick={() => setActiveView('overall')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeView === 'overall'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUpIcon className="w-4 h-4 inline mr-1" />
            Общая
          </button>
        </div>
      </div>

      <div className="chart-container mb-6">
        <Bar data={currentData} options={options} />
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatPercentage(stats.average)}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center mt-1">
            <ClockIcon className="w-4 h-4 mr-1" />
            Средняя
          </div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatPercentage(stats.best)}</div>
          <div className="text-sm text-gray-600">Лучшая</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{formatPercentage(stats.worst)}</div>
          <div className="text-sm text-gray-600">Худшая</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {stats.trend === 'up' ? '↗' : stats.trend === 'down' ? '↘' : '→'}
          </div>
          <div className="text-sm text-gray-600">Тренд</div>
        </div>
      </div>

      {/* Additional insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Аналитика</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {activeView === 'daily' ? (
            <>
              <p>• Наименьшая пунктуальность в утренние часы (08:00-10:00)</p>
              <p>• Стабильные показатели в ночные смены</p>
              <p>• Рекомендуется усилить контроль в пиковые часы</p>
            </>
          ) : (
            <>
              <p>• Снижение показателей к концу недели</p>
              <p>• Понедельник и вторник показывают лучшие результаты</p>
              <p>• Выходные дни требуют дополнительного внимания</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};