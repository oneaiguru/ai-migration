// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/PerformanceMetricsView.tsx

import React, { useState, useMemo } from 'react';
import { Employee } from '../types/employee';

// ========================
// PERFORMANCE METRICS VIEW - Employee KPI dashboard
// Based on Chat 3 chart patterns with performance visualization
// ========================

interface PerformanceMetricsViewProps {
  employees: Employee[];
  selectedEmployee?: Employee | null;
  onEmployeeSelect?: (employee: Employee) => void;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showComparison?: boolean;
}

interface PerformanceMetric {
  id: string;
  label: string;
  key: keyof Employee['performance'];
  format: 'percentage' | 'number' | 'decimal' | 'time';
  target?: number;
  icon: string;
  color: string;
  description: string;
}

interface PerformanceData {
  employee: Employee;
  metrics: {
    [key: string]: {
      value: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
      rank: number;
    };
  };
}

const PerformanceMetricsView: React.FC<PerformanceMetricsViewProps> = ({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  timeRange = 'month',
  showComparison = true
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('qualityScore');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [sortBy, setSortBy] = useState<string>('qualityScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Performance metrics configuration
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'qualityScore',
      label: 'Качество обслуживания',
      key: 'qualityScore',
      format: 'percentage',
      target: 90,
      icon: '⭐',
      color: '#10b981',
      description: 'Оценка качества работы с клиентами'
    },
    {
      id: 'adherenceScore',
      label: 'Соблюдение расписания',
      key: 'adherenceScore',
      format: 'percentage',
      target: 85,
      icon: '⏰',
      color: '#3b82f6',
      description: 'Процент соблюдения рабочего расписания'
    },
    {
      id: 'callsPerHour',
      label: 'Звонков в час',
      key: 'callsPerHour',
      format: 'decimal',
      target: 12,
      icon: '📞',
      color: '#8b5cf6',
      description: 'Среднее количество обработанных звонков в час'
    },
    {
      id: 'averageHandleTime',
      label: 'Среднее время обработки',
      key: 'averageHandleTime',
      format: 'time',
      target: 8,
      icon: '⏱️',
      color: '#f59e0b',
      description: 'Среднее время обработки одного обращения (мин)'
    },
    {
      id: 'customerSatisfaction',
      label: 'Удовлетворенность клиентов',
      key: 'customerSatisfaction',
      format: 'decimal',
      target: 4.5,
      icon: '😊',
      color: '#ef4444',
      description: 'Средняя оценка удовлетворенности клиентов'
    }
  ];

  // Calculate performance data with trends and rankings
  const performanceData = useMemo(() => {
    return employees.map(employee => {
      const metrics: PerformanceData['metrics'] = {};
      
      performanceMetrics.forEach(metric => {
        const value = employee.performance[metric.key] as number;
        const allValues = employees.map(e => e.performance[metric.key] as number);
        const sorted = [...allValues].sort((a, b) => b - a);
        const rank = sorted.indexOf(value) + 1;
        
        // Simulate trend (in real app, this would come from historical data)
        const change = Math.random() * 10 - 5; // -5 to +5
        const trend = change > 1 ? 'up' : change < -1 ? 'down' : 'stable';
        
        metrics[metric.id] = {
          value,
          trend,
          change: Math.abs(change),
          rank
        };
      });
      
      return { employee, metrics };
    }).sort((a, b) => {
      const aValue = a.metrics[sortBy]?.value || 0;
      const bValue = b.metrics[sortBy]?.value || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [employees, sortBy, sortOrder]);

  // Format value based on metric type
  const formatValue = (value: number, format: PerformanceMetric['format']): string => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'decimal':
        return value.toFixed(1);
      case 'time':
        return `${value.toFixed(1)} мин`;
      case 'number':
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };

  // Get metric color based on performance vs target
  const getMetricColor = (value: number, metric: PerformanceMetric): string => {
    if (!metric.target) return metric.color;
    
    const percentage = value / metric.target;
    if (percentage >= 1.1) return '#10b981'; // Green - exceeding target
    if (percentage >= 0.9) return '#3b82f6'; // Blue - meeting target
    if (percentage >= 0.7) return '#f59e0b'; // Yellow - below target
    return '#ef4444'; // Red - well below target
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных о производительности</h3>
          <p className="text-gray-500">Добавьте сотрудников для просмотра метрик производительности</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Показатели производительности</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium mb-2 uppercase tracking-wide">
              Демонстрационный модуль
            </span>
            <p className="text-gray-600">
              Анализ KPI и метрик эффективности сотрудников контакт-центра
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <select
              value={timeRange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
              <option value="quarter">За квартал</option>
              <option value="year">За год</option>
            </select>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              {['overview', 'detailed', 'comparison'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode === 'overview' ? 'Обзор' : mode === 'detailed' ? 'Детали' : 'Сравнение'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {performanceMetrics.map((metric) => {
            const avgValue = employees.reduce((sum, emp) => 
              sum + (emp.performance[metric.key] as number), 0) / employees.length;
            const metricColor = getMetricColor(avgValue, metric);
            
            return (
              <div
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMetric === metric.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: metricColor }}
                  ></div>
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-1">{metric.label}</h3>
                <div className="text-xl font-bold" style={{ color: metricColor }}>
                  {formatValue(avgValue, metric.format)}
                </div>
                {metric.target && (
                  <div className="text-xs text-gray-500 mt-1">
                    Цель: {formatValue(metric.target, metric.format)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Рейтинг сотрудников</h2>
            
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {performanceMetrics.map(metric => (
                  <option key={metric.id} value={metric.id}>
                    Сортировка по: {metric.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'desc' ? '↓ Убывание' : '↑ Возрастание'}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сотрудник
                </th>
                {performanceMetrics.map(metric => (
                  <th
                    key={metric.id}
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {metric.icon} {metric.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.slice(0, 10).map(({ employee, metrics }) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                        alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.workInfo.position}</div>
                      </div>
                    </div>
                  </td>
                  
                  {performanceMetrics.map(metric => {
                    const metricData = metrics[metric.id];
                    const metricColor = getMetricColor(metricData.value, metric);
                    
                    return (
                      <td key={metric.id} className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: metricColor }}
                          >
                            {formatValue(metricData.value, metric.format)}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs">{getTrendIcon(metricData.trend)}</span>
                            <span className="text-xs text-gray-500">
                              #{metricData.rank}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onEmployeeSelect?.(employee)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Подробнее
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Динамика показателей</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-gray-400 text-4xl mb-2">📈</div>
            <p className="text-gray-500">График производительности</p>
            <p className="text-sm text-gray-400 mt-1">Интеграция с Chart.js для визуализации трендов</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetricsView;
