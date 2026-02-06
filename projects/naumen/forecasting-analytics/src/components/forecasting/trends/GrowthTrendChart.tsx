// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/GrowthTrendChart.tsx
// GrowthTrendChart.tsx - Long-term trajectory analysis with projections

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { TrendDataPoint, TrendMetrics } from '../../../types/trends';

interface GrowthTrendChartProps {
  data: TrendDataPoint[];
  projectionPeriods?: number;
  showConfidenceInterval?: boolean;
  onTrendAnalysis?: (metrics: TrendMetrics) => void;
  className?: string;
}

const GrowthTrendChart: React.FC<GrowthTrendChartProps> = ({
  data,
  projectionPeriods = 24, // 24 periods ahead
  showConfidenceInterval = true,
  onTrendAnalysis,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'absolute' | 'growth' | 'acceleration'>('absolute');
  const [trendMetrics, setTrendMetrics] = useState<TrendMetrics | null>(null);
  const [projectionData, setProjectionData] = useState<TrendDataPoint[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | 'all'>('7d');

  // Calculate linear regression for trend line
  const calculateLinearRegression = (points: { x: number; y: number }[]) => {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const totalSumSquares = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const residualSumSquares = points.reduce((sum, p) => 
      sum + Math.pow(p.y - (slope * p.x + intercept), 2), 0
    );
    const r2 = 1 - (residualSumSquares / totalSumSquares);

    return { slope, intercept, r2: Math.max(0, r2) };
  };

  // Calculate polynomial regression for curved trends
  const calculatePolynomialRegression = (points: { x: number; y: number }[], degree: number = 2) => {
    // Simplified polynomial regression for quadratic trends
    if (degree === 2 && points.length >= 3) {
      // Using method of least squares for quadratic: y = ax² + bx + c
      const n = points.length;
      let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
      let sumY = 0, sumXY = 0, sumX2Y = 0;

      points.forEach(p => {
        sumX += p.x;
        sumX2 += p.x * p.x;
        sumX3 += p.x * p.x * p.x;
        sumX4 += p.x * p.x * p.x * p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumX2Y += p.x * p.x * p.y;
      });

      // Solve system of equations (simplified)
      const a = ((n * sumX2Y - sumX2 * sumY) * (n * sumX2 - sumX * sumX) - 
                (n * sumXY - sumX * sumY) * (n * sumX3 - sumX * sumX2)) /
               ((n * sumX4 - sumX2 * sumX2) * (n * sumX2 - sumX * sumX) - 
                (n * sumX3 - sumX * sumX2) * (n * sumX3 - sumX * sumX2));

      const b = ((n * sumXY - sumX * sumY) - a * (n * sumX3 - sumX * sumX2)) / 
               (n * sumX2 - sumX * sumX);

      const c = (sumY - b * sumX - a * sumX2) / n;

      return { a: a || 0, b: b || 0, c: c || 0 };
    }
    return { a: 0, b: 0, c: 0 };
  };

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (selectedTimeframe === 'all') return data;
    
    const now = new Date();
    const hoursBack = selectedTimeframe === '1d' ? 24 : 
                     selectedTimeframe === '7d' ? 168 : 720; // 30d = 720h

    const cutoffTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    return data.filter(d => d.timestamp >= cutoffTime);
  }, [data, selectedTimeframe]);

  // Calculate growth metrics and projections
  const analysis = useMemo(() => {
    if (filteredData.length < 2) return null;

    // Convert timestamps to numeric values for regression
    const points = filteredData.map((d, index) => ({
      x: index,
      y: d.value
    }));

    const linear = calculateLinearRegression(points);
    const polynomial = calculatePolynomialRegression(points);

    // Calculate growth rate (slope as percentage of mean)
    const mean = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const growthRate = (linear.slope / mean) * 100;

    // Calculate volatility (standard deviation)
    const variance = points.reduce((sum, p) => sum + Math.pow(p.y - mean, 2), 0) / points.length;
    const volatility = Math.sqrt(variance);

    // Determine trend direction
    const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
      Math.abs(growthRate) < 0.5 ? 'stable' :
      growthRate > 0 ? 'increasing' : 'decreasing';

    // Calculate forecast accuracy (R²)
    const forecastAccuracy = linear.r2;

    // Generate projections
    const lastIndex = points.length - 1;
    const projections: TrendDataPoint[] = [];
    
    for (let i = 1; i <= projectionPeriods; i++) {
      const futureIndex = lastIndex + i;
      const futureTimestamp = new Date(
        filteredData[filteredData.length - 1].timestamp.getTime() + i * 60 * 60 * 1000
      );

      // Linear projection
      const linearValue = linear.slope * futureIndex + linear.intercept;
      
      // Polynomial projection for curved trends
      const polynomialValue = polynomial.a * futureIndex * futureIndex + 
                             polynomial.b * futureIndex + polynomial.c;

      // Use polynomial if it has better fit, otherwise linear
      const projectedValue = Math.abs(polynomial.a) > 0.001 ? polynomialValue : linearValue;

      // Add confidence interval based on volatility
      const confidence = Math.max(0.1, forecastAccuracy - (i * 0.02)); // Decrease confidence over time
      const margin = volatility * (1 - confidence) * 2;

      projections.push({
        timestamp: futureTimestamp,
        value: Math.max(0, projectedValue),
        forecast: Math.max(0, projectedValue),
        confidence,
        trend: Math.max(0, projectedValue)
      });
    }

    const metrics: TrendMetrics = {
      growthRate,
      volatility,
      seasonalityStrength: 0, // Would need seasonal analysis
      trendDirection,
      cyclicalPatterns: [], // Would need pattern detection
      forecastAccuracy,
      lastUpdated: new Date()
    };

    return { metrics, projections, linear, polynomial };
  }, [filteredData, projectionPeriods]);

  useEffect(() => {
    if (analysis) {
      setTrendMetrics(analysis.metrics);
      setProjectionData(analysis.projections);
      if (onTrendAnalysis) {
        onTrendAnalysis(analysis.metrics);
      }
    }
  }, [analysis, onTrendAnalysis]);

  // Calculate growth rates for growth view
  const growthRates = useMemo(() => {
    if (filteredData.length < 2) return [];
    
    return filteredData.slice(1).map((point, index) => {
      const prevValue = filteredData[index].value;
      const growthRate = prevValue > 0 ? ((point.value - prevValue) / prevValue) * 100 : 0;
      return {
        ...point,
        growth: growthRate
      };
    });
  }, [filteredData]);

  // Calculate acceleration (second derivative)
  const accelerationData = useMemo(() => {
    if (growthRates.length < 2) return [];
    
    return growthRates.slice(1).map((point, index) => {
      const prevGrowth = growthRates[index].growth;
      const acceleration = point.growth - prevGrowth;
      return {
        ...point,
        acceleration
      };
    });
  }, [growthRates]);

  // Chart data based on view mode
  const getChartData = () => {
    const allData = [...filteredData, ...projectionData];
    const cutoffIndex = filteredData.length;

    if (viewMode === 'growth') {
      return {
        labels: growthRates.map(d => d.timestamp),
        datasets: [
          {
            label: 'Скорость роста (%)',
            data: growthRates.map(d => d.growth),
            borderColor: '#3B82F6',
            backgroundColor: growthRates.map(d => d.growth >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      };
    }

    if (viewMode === 'acceleration') {
      return {
        labels: accelerationData.map(d => d.timestamp),
        datasets: [
          {
            label: 'Ускорение (%²)',
            data: accelerationData.map(d => d.acceleration),
            backgroundColor: accelerationData.map(d => 
              d.acceleration > 0 ? '#22C55E' : d.acceleration < 0 ? '#EF4444' : '#6B7280'
            ),
            borderColor: accelerationData.map(d => 
              d.acceleration > 0 ? '#16A34A' : d.acceleration < 0 ? '#DC2626' : '#4B5563'
            ),
            borderWidth: 1
          }
        ]
      };
    }

    // Absolute value view with projections
    const datasets = [
      {
        label: 'Исторические данные',
        data: filteredData.map(d => d.value),
        borderColor: '#77828C',
        backgroundColor: '#77828C',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 4,
        tension: 0.1
      },
      {
        label: 'Тренд',
        data: allData.map((_, index) => {
          if (analysis) {
            return analysis.linear.slope * index + analysis.linear.intercept;
          }
          return null;
        }),
        borderColor: '#DC2911',
        backgroundColor: '#DC2911',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.1
      },
      {
        label: 'Прогноз',
        data: [
          ...new Array(cutoffIndex).fill(null),
          ...projectionData.map(d => d.value)
        ],
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF6',
        borderWidth: 2,
        borderDash: [10, 5],
        pointRadius: 0,
        tension: 0.1
      }
    ];

    if (showConfidenceInterval && projectionData.length > 0) {
      const upperBound = [
        ...new Array(cutoffIndex).fill(null),
        ...projectionData.map(d => d.value + (trendMetrics?.volatility || 0) * (1 - (d.confidence || 0)))
      ];
      const lowerBound = [
        ...new Array(cutoffIndex).fill(null),
        ...projectionData.map(d => Math.max(0, d.value - (trendMetrics?.volatility || 0) * (1 - (d.confidence || 0))))
      ];

      datasets.push(
        {
          label: 'Верхняя граница',
          data: upperBound,
          borderColor: 'rgba(139, 92, 246, 0.3)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          fill: '+1'
        },
        {
          label: 'Нижняя граница',
          data: lowerBound,
          borderColor: 'rgba(139, 92, 246, 0.3)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          fill: false
        }
      );
    }

    return {
      labels: allData.map(d => d.timestamp),
      datasets
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
          font: { size: 12 },
          filter: (legendItem: any) => {
            // Hide confidence interval from legend
            return !legendItem.text.includes('граница');
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `Значение: ${context.parsed.y.toFixed(1)}`;
            } else if (context.datasetIndex === 1) {
              return `Тренд: ${context.parsed.y.toFixed(1)}`;
            } else if (context.datasetIndex === 2) {
              const confidence = projectionData[context.dataIndex - filteredData.length]?.confidence || 0;
              return `Прогноз: ${context.parsed.y.toFixed(1)} (${(confidence * 100).toFixed(0)}%)`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
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
            if (viewMode === 'growth') return `${value.toFixed(1)}%`;
            if (viewMode === 'acceleration') return `${value.toFixed(2)}%²`;
            return value.toFixed(0);
          }
        }
      }
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`growth-trend-chart bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">📈 Анализ роста и тренда</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Период:</label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as '1d' | '7d' | '30d' | 'all')}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">1 день</option>
                <option value="7d">7 дней</option>
                <option value="30d">30 дней</option>
                <option value="all">Все данные</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Вид:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'absolute' | 'growth' | 'acceleration')}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="absolute">Абсолютные</option>
                <option value="growth">Рост (%)</option>
                <option value="acceleration">Ускорение</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showConfidenceInterval}
                onChange={(e) => setShowConfidenceInterval(e.target.checked)}
                className="rounded"
              />
              <span>Доверительный интервал</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ height: '400px', padding: '16px' }}>
        {viewMode === 'acceleration' ? (
          <Bar data={getChartData()} options={chartOptions} />
        ) : (
          <Line data={getChartData()} options={chartOptions} />
        )}
      </div>

      {/* Metrics Summary */}
      {trendMetrics && (
        <div className="p-4 border-t border-gray-100">
          <h4 className="text-md font-medium text-gray-900 mb-3">Метрики тренда</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{getTrendIcon(trendMetrics.trendDirection)}</span>
                <span className="text-sm font-medium text-gray-700">Направление</span>
              </div>
              <div className={`text-sm font-semibold ${getTrendColor(trendMetrics.trendDirection)}`}>
                {trendMetrics.trendDirection === 'increasing' ? 'Рост' :
                 trendMetrics.trendDirection === 'decreasing' ? 'Снижение' : 'Стабильно'}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Скорость роста</div>
              <div className={`text-sm font-semibold ${
                trendMetrics.growthRate > 0 ? 'text-green-600' : 
                trendMetrics.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {trendMetrics.growthRate > 0 ? '+' : ''}{trendMetrics.growthRate.toFixed(2)}%
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Волатильность</div>
              <div className="text-sm font-semibold text-gray-900">
                {trendMetrics.volatility.toFixed(1)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Точность прогноза</div>
              <div className={`text-sm font-semibold ${
                trendMetrics.forecastAccuracy > 0.8 ? 'text-green-600' :
                trendMetrics.forecastAccuracy > 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(trendMetrics.forecastAccuracy * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthTrendChart;