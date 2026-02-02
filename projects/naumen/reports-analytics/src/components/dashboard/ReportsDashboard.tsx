import React from 'react';
import { mockKPIMetrics } from '../../data/mockData';
import { KPIMetric } from '../../types';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  MinusIcon,
  TargetIcon,
  CalendarIcon,
  UsersIcon
} from 'lucide-react';
import { getStatusColor, formatPercentage, formatNumber } from '../../utils';

interface KPICardProps {
  metric: KPIMetric;
}

const KPICard: React.FC<KPICardProps> = ({ metric }) => {
  const statusColor = getStatusColor(metric.status);
  const TrendIcon = metric.trend === 'up' ? TrendingUpIcon : 
                   metric.trend === 'down' ? TrendingDownIcon : MinusIcon;
  
  const trendColor = metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{metric.name}</p>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {metric.unit === '%' ? formatPercentage(metric.value) : 
               metric.unit === 'hours' ? `${formatNumber(metric.value)}ч` :
               formatNumber(metric.value)}
            </p>
            {metric.target && (
              <p className="ml-2 text-sm text-gray-500">
                / {metric.unit === '%' ? formatPercentage(metric.target) : formatNumber(metric.target)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div 
            className="w-3 h-3 rounded-full mb-2"
            style={{ backgroundColor: statusColor }}
          ></div>
          <div className={`flex items-center ${trendColor}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {Math.abs(metric.changePercent).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      {metric.target && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Прогресс к цели</span>
            <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                backgroundColor: statusColor
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReportsDashboard: React.FC = () => {
  const today = new Date();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOverallStatus = () => {
    const excellentCount = mockKPIMetrics.filter(m => m.status === 'excellent').length;
    const goodCount = mockKPIMetrics.filter(m => m.status === 'good').length;
    const total = mockKPIMetrics.length;
    
    if (excellentCount >= total * 0.7) return { status: 'excellent', text: 'Отличная производительность' };
    if ((excellentCount + goodCount) >= total * 0.8) return { status: 'good', text: 'Хорошая производительность' };
    return { status: 'warning', text: 'Требует внимания' };
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Панель отчетов</h1>
            <p className="text-gray-500 flex items-center mt-1">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {formatDate(today)}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              overallStatus.status === 'excellent' ? 'bg-green-100 text-green-800' :
              overallStatus.status === 'good' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getStatusColor(overallStatus.status) }}
              ></div>
              {overallStatus.text}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Общий статус системы
            </p>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockKPIMetrics.map((metric) => (
          <KPICard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Quick Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ключевые выводы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <TargetIcon className="w-4 h-4 mr-2 text-green-600" />
              Успехи
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Соблюдение расписания превышает цель на 1.1%</li>
              <li>• Время ответа на заявки улучшилось на 14.8%</li>
              <li>• Абсентеизм снизился и находится ниже целевого уровня</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <UsersIcon className="w-4 h-4 mr-2 text-blue-600" />
              Области для улучшения
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Мониторинг точности прогнозирования</li>
              <li>• Оптимизация покрытия в вечерние часы</li>
              <li>• Улучшение процессов обработки заявок</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};