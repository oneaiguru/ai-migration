import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartData } from '../../types';
import { getLineChartConfig, chartColors } from '../../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface WorkTimeChartProps {
  data?: ChartData;
  title?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly';
}

export const WorkTimeChart: React.FC<WorkTimeChartProps> = ({
  data,
  title = 'График рабочего времени',
  timeframe = 'daily'
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Mock data for demonstration
  const mockData: ChartData = data || {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'Запланированные часы',
        data: [8, 8, 8, 8, 8, 4, 0],
        borderColor: chartColors.primary[0],
        backgroundColor: chartColors.primary[0] + '20',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Фактические часы',
        data: [7.8, 8.2, 7.9, 8.1, 7.7, 3.8, 0],
        borderColor: chartColors.success[0],
        backgroundColor: chartColors.success[0] + '20',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  const chartConfig = getLineChartConfig(title);

  const options = {
    ...chartConfig.options,
    scales: {
      ...chartConfig.options?.scales,
      y: {
        ...chartConfig.options?.scales?.y,
        title: {
          display: true,
          text: 'Часы'
        },
        max: timeframe === 'daily' ? 10 : undefined
      }
    },
    plugins: {
      ...chartConfig.options?.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y}ч`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">
            {timeframe === 'daily' ? 'Ежедневный' : 
             timeframe === 'weekly' ? 'Еженедельный' : 'Месячный'} анализ рабочего времени
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.primary[0] }}></div>
            <span className="text-sm text-gray-600">Запланированные</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors.success[0] }}></div>
            <span className="text-sm text-gray-600">Фактические</span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <Line ref={chartRef} data={mockData} options={options} />
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">96.1%</div>
          <div className="text-sm text-gray-500">Соблюдение расписания</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">54.5ч</div>
          <div className="text-sm text-gray-500">Запланировано</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">52.5ч</div>
          <div className="text-sm text-gray-500">Фактически</div>
        </div>
      </div>
    </div>
  );
};