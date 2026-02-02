// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/ForecastVariance.tsx
// ForecastVariance.tsx - Analyze variance between forecast and actual trends

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { TrendDataPoint, ForecastVariance as ForecastVarianceType } from '../../../types/trends';

interface ForecastVarianceProps {
  data: TrendDataPoint[];
  forecastData: TrendDataPoint[];
  granularity?: 'hourly' | 'daily' | 'weekly';
  onVarianceAnalysis?: (analysis: VarianceAnalysis) => void;
  className?: string;
}

interface VarianceAnalysis {
  meanAbsoluteError: number;
  meanAbsolutePercentageError: number;
  rootMeanSquareError: number;
  forecastBias: number;
  accuracyScore: number;
  varianceBreakdown: ForecastVarianceType[];
  seasonalPatterns: { [key: string]: number };
  errorDistribution: { [key: string]: number };
}

const ForecastVariance: React.FC<ForecastVarianceProps> = ({
  data,
  forecastData,
  granularity = 'hourly',
  onVarianceAnalysis,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'variance' | 'accuracy' | 'distribution' | 'patterns'>('variance');
  const [selectedMetric, setSelectedMetric] = useState<'absolute' | 'percentage' | 'squared'>('percentage');
  const [varianceAnalysis, setVarianceAnalysis] = useState<VarianceAnalysis | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'recent' | 'business_hours'>('all');

  // Align forecast and actual data by timestamp
  const alignedData = useMemo(() => {
    const aligned: { actual: TrendDataPoint; forecast: TrendDataPoint; variance: ForecastVarianceType }[] = [];
    
    data.forEach(actualPoint => {
      const forecastPoint = forecastData.find(fp => 
        Math.abs(fp.timestamp.getTime() - actualPoint.timestamp.getTime()) < 30 * 60 * 1000 // 30 min tolerance
      );
      
      if (forecastPoint) {
        const variance = actualPoint.value - forecastPoint.value;
        const variancePercent = forecastPoint.value > 0 ? (variance / forecastPoint.value) * 100 : 0;
        
        let accuracy: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
        const absPercentError = Math.abs(variancePercent);
        if (absPercentError < 5) accuracy = 'excellent';
        else if (absPercentError < 15) accuracy = 'good';
        else if (absPercentError < 30) accuracy = 'fair';

        const explanation = `${variance > 0 ? 'Превышение' : 'Недостача'} на ${Math.abs(variancePercent).toFixed(1)}%`;

        aligned.push({
          actual: actualPoint,
          forecast: forecastPoint,
          variance: {
            period: actualPoint.timestamp.toISOString(),
            forecast: forecastPoint.value,
            actual: actualPoint.value,
            variance,
            variancePercent,
            explanation,
            accuracy
          }
        });
      }
    });

    return aligned;
  }, [data, forecastData]);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (selectedTimeRange === 'all') return alignedData;
    
    if (selectedTimeRange === 'recent') {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
      return alignedData.filter(d => d.actual.timestamp >= cutoff);
    }
    
    if (selectedTimeRange === 'business_hours') {
      return alignedData.filter(d => {
        const hour = d.actual.timestamp.getHours();
        return hour >= 9 && hour <= 17; // Business hours 9-17
      });
    }
    
    return alignedData;
  }, [alignedData, selectedTimeRange]);

  // Calculate comprehensive variance analysis
  const analysis = useMemo((): VarianceAnalysis | null => {
    if (filteredData.length === 0) return null;

    const variances = filteredData.map(d => d.variance);
    const actualValues = filteredData.map(d => d.actual.value);
    const forecastValues = filteredData.map(d => d.forecast.value);
    
    // Mean Absolute Error
    const meanAbsoluteError = variances.variance.reduce((sum, val) => sum + Math.abs(val), 0) / variances.length;
    
    // Mean Absolute Percentage Error
    const mapeValues = filteredData.filter(d => d.forecast.value > 0).map(d => 
      Math.abs(d.variance.variancePercent)
    );
    const meanAbsolutePercentageError = mapeValues.length > 0 ? 
      mapeValues.reduce((sum, val) => sum + val, 0) / mapeValues.length : 0;
    
    // Root Mean Square Error
    const squaredErrors = variances.variance.map(val => val * val);
    const rootMeanSquareError = Math.sqrt(squaredErrors.reduce((sum, val) => sum + val, 0) / squaredErrors.length);
    
    // Forecast Bias (average forecast error)
    const forecastBias = variances.variance.reduce((sum, val) => sum + val, 0) / variances.length;
    
    // Accuracy Score (percentage of forecasts within 10% of actual)
    const accurateForecasts = filteredData.filter(d => Math.abs(d.variance.variancePercent) <= 10).length;
    const accuracyScore = (accurateForecasts / filteredData.length) * 100;
    
    // Variance breakdown by accuracy categories
    const varianceBreakdown = filteredData.map(d => d.variance);
    
    // Seasonal patterns in errors
    const seasonalPatterns: { [key: string]: number } = {};
    ['morning', 'afternoon', 'evening', 'night'].forEach(period => {
      const periodData = filteredData.filter(d => {
        const hour = d.actual.timestamp.getHours();
        if (period === 'morning') return hour >= 6 && hour < 12;
        if (period === 'afternoon') return hour >= 12 && hour < 18;
        if (period === 'evening') return hour >= 18 && hour < 24;
        return hour >= 0 && hour < 6; // night
      });
      
      if (periodData.length > 0) {
        seasonalPatterns[period] = periodData.reduce((sum, d) => 
          sum + Math.abs(d.variance.variancePercent), 0) / periodData.length;
      }
    });
    
    // Error distribution
    const errorDistribution: { [key: string]: number } = {
      'excellent': filteredData.filter(d => d.variance.accuracy === 'excellent').length,
      'good': filteredData.filter(d => d.variance.accuracy === 'good').length,
      'fair': filteredData.filter(d => d.variance.accuracy === 'fair').length,
      'poor': filteredData.filter(d => d.variance.accuracy === 'poor').length,
    };

    return {
      meanAbsoluteError,
      meanAbsolutePercentageError,
      rootMeanSquareError,
      forecastBias,
      accuracyScore,
      varianceBreakdown,
      seasonalPatterns,
      errorDistribution
    };
  }, [filteredData]);

  useEffect(() => {
    setVarianceAnalysis(analysis);
    if (analysis && onVarianceAnalysis) {
      onVarianceAnalysis(analysis);
    }
  }, [analysis, onVarianceAnalysis]);

  // Chart data based on view mode
  const getChartData = () => {
    if (!varianceAnalysis) return { labels: [], datasets: [] };

    if (viewMode === 'variance') {
      return {
        labels: filteredData.map(d => d.actual.timestamp),
        datasets: [
          {
            label: 'Отклонение (%)',
            data: filteredData.map(d => d.variance.variancePercent),
            borderColor: filteredData.map(d => 
              d.variance.variancePercent > 0 ? '#EF4444' : '#10B981'
            ),
            backgroundColor: filteredData.map(d => 
              d.variance.variancePercent > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'
            ),
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 5,
            tension: 0.1,
            fill: true
          }
        ]
      };
    }

    if (viewMode === 'accuracy') {
      const accuracyData = Object.entries(varianceAnalysis.errorDistribution);
      return {
        labels: accuracyData.map(([label]) => 
          label === 'excellent' ? 'Отлично' :
          label === 'good' ? 'Хорошо' :
          label === 'fair' ? 'Удовлетворительно' : 'Плохо'
        ),
        datasets: [
          {
            label: 'Количество прогнозов',
            data: accuracyData.map(([, count]) => count),
            backgroundColor: [
              '#22C55E', // excellent - green
              '#3B82F6', // good - blue  
              '#F59E0B', // fair - yellow
              '#EF4444'  // poor - red
            ],
            borderColor: [
              '#16A34A',
              '#2563EB', 
              '#D97706',
              '#DC2626'
            ],
            borderWidth: 2
          }
        ]
      };
    }

    if (viewMode === 'distribution') {
      const bins = [-100, -50, -25, -10, -5, 0, 5, 10, 25, 50, 100];
      const distribution = new Array(bins.length - 1).fill(0);
      
      filteredData.forEach(d => {
        const variance = d.variance.variancePercent;
        for (let i = 0; i < bins.length - 1; i++) {
          if (variance >= bins[i] && variance < bins[i + 1]) {
            distribution[i]++;
            break;
          }
        }
      });

      return {
        labels: bins.slice(0, -1).map((bin, i) => `${bin}% - ${bins[i + 1]}%`),
        datasets: [
          {
            label: 'Распределение отклонений',
            data: distribution,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3B82F6',
            borderWidth: 1
          }
        ]
      };
    }

    // Patterns view - seasonal patterns
    const patterns = Object.entries(varianceAnalysis.seasonalPatterns);
    return {
      labels: patterns.map(([period]) => 
        period === 'morning' ? 'Утро' :
        period === 'afternoon' ? 'День' :
        period === 'evening' ? 'Вечер' : 'Ночь'
      ),
      datasets: [
        {
          label: 'Средняя ошибка (%)',
          data: patterns.map(([, error]) => error),
          backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#1F2937'],
          borderColor: ['#D97706', '#2563EB', '#7C3AED', '#111827'],
          borderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff'
      }
    },
    scales: {
      x: {
        type: viewMode === 'variance' ? 'time' as const : 'category' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151',
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151',
          callback: (value: any) => {
            if (viewMode === 'variance' || viewMode === 'patterns') return `${value}%`;
            return value;
          }
        }
      }
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`forecast-variance bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">📊 Анализ отклонений прогноза</h3>
          {varianceAnalysis && (
            <div className="text-sm text-gray-500">
              Точность: {varianceAnalysis.accuracyScore.toFixed(1)}%
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Режим:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="variance">Отклонения</option>
              <option value="accuracy">Точность</option>
              <option value="distribution">Распределение</option>
              <option value="patterns">Паттерны</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Период:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все данные</option>
              <option value="recent">Последние 24ч</option>
              <option value="business_hours">Рабочие часы</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Метрика:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Проценты</option>
              <option value="absolute">Абсолютные</option>
              <option value="squared">Квадратичные</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ height: '350px', padding: '16px' }}>
        {viewMode === 'accuracy' || viewMode === 'distribution' || viewMode === 'patterns' ? (
          <Bar data={getChartData()} options={chartOptions} />
        ) : (
          <Line data={getChartData()} options={chartOptions} />
        )}
      </div>

      {/* Analysis Summary */}
      {varianceAnalysis && (
        <div className="p-4 border-t border-gray-100">
          <h4 className="text-md font-medium text-gray-900 mb-3">Сводка анализа</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">MAPE</div>
              <div className="text-lg font-semibold text-gray-900">
                {varianceAnalysis.meanAbsolutePercentageError.toFixed(1)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">MAE</div>
              <div className="text-lg font-semibold text-gray-900">
                {varianceAnalysis.meanAbsoluteError.toFixed(1)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">RMSE</div>
              <div className="text-lg font-semibold text-gray-900">
                {varianceAnalysis.rootMeanSquareError.toFixed(1)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Смещение</div>
              <div className={`text-lg font-semibold ${
                varianceAnalysis.forecastBias > 0 ? 'text-red-600' : 
                varianceAnalysis.forecastBias < 0 ? 'text-green-600' : 'text-gray-900'
              }`}>
                {varianceAnalysis.forecastBias > 0 ? '+' : ''}{varianceAnalysis.forecastBias.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Recent Variances */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Последние отклонения</h5>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredData.slice(-10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {item.actual.timestamp.toLocaleString('ru-RU', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <div className="text-sm">
                      <span className="text-gray-700">Факт: {item.actual.value}</span>
                      <span className="text-gray-500 mx-2">|</span>
                      <span className="text-gray-700">Прогноз: {item.forecast.value}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getAccuracyColor(item.variance.accuracy)}`}>
                      {item.variance.accuracy === 'excellent' ? 'Отлично' :
                       item.variance.accuracy === 'good' ? 'Хорошо' :
                       item.variance.accuracy === 'fair' ? 'Удовлетворительно' : 'Плохо'}
                    </span>
                    <span className={`text-sm font-medium ${
                      item.variance.variancePercent > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.variance.variancePercent > 0 ? '+' : ''}{item.variance.variancePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastVariance;