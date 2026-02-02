// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/TrendComparison.tsx
// TrendComparison.tsx - Compare trends across different time periods or channels

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { TrendDataPoint, TrendMetrics } from '../../../types/trends';

interface TrendComparisonProps {
  datasets: {
    id: string;
    name: string;
    data: TrendDataPoint[];
    color: string;
  }[];
  comparisonType?: 'period' | 'channel' | 'forecast_vs_actual';
  onComparisonResult?: (result: ComparisonResult) => void;
  className?: string;
}

interface ComparisonResult {
  correlations: { [key: string]: number };
  relativeDifferences: { [key: string]: number };
  trendsAnalysis: { [key: string]: TrendMetrics };
  statisticalSignificance: number;
}

const TrendComparison: React.FC<TrendComparisonProps> = ({
  datasets,
  comparisonType = 'period',
  onComparisonResult,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'overlay' | 'normalized' | 'difference'>('overlay');
  const [selectedBaseline, setSelectedBaseline] = useState<string>(datasets[0]?.id || '');
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonResult | null>(null);
  const [showStatistics, setShowStatistics] = useState(true);

  // Calculate correlation between two datasets
  const calculateCorrelation = (data1: number[], data2: number[]): number => {
    const n = Math.min(data1.length, data2.length);
    if (n < 2) return 0;

    const mean1 = data1.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const mean2 = data2.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Calculate basic trend metrics for a dataset
  const calculateTrendMetrics = (data: TrendDataPoint[]): TrendMetrics => {
    if (data.length < 2) {
      return {
        growthRate: 0,
        volatility: 0,
        seasonalityStrength: 0,
        trendDirection: 'stable',
        cyclicalPatterns: [],
        forecastAccuracy: 0,
        lastUpdated: new Date()
      };
    }

    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate growth rate
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const growthRate = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    // Calculate volatility (standard deviation)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    // Determine trend direction
    const trendDirection: 'increasing' | 'decreasing' | 'stable' = 
      Math.abs(growthRate) < 1 ? 'stable' :
      growthRate > 0 ? 'increasing' : 'decreasing';

    return {
      growthRate,
      volatility,
      seasonalityStrength: 0, // Would need more complex analysis
      trendDirection,
      cyclicalPatterns: [],
      forecastAccuracy: 0,
      lastUpdated: new Date()
    };
  };

  // Main comparison analysis
  const comparisonAnalysis = useMemo(() => {
    if (datasets.length < 2) return null;

    const baseline = datasets.find(d => d.id === selectedBaseline);
    if (!baseline) return null;

    const correlations: { [key: string]: number } = {};
    const relativeDifferences: { [key: string]: number } = {};
    const trendsAnalysis: { [key: string]: TrendMetrics } = {};

    const baselineValues = baseline.data.map(d => d.value);
    const baselineMean = baselineValues.reduce((sum, val) => sum + val, 0) / baselineValues.length;

    datasets.forEach(dataset => {
      const values = dataset.data.map(d => d.value);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

      // Calculate correlation with baseline
      correlations[dataset.id] = calculateCorrelation(baselineValues, values);

      // Calculate relative difference
      relativeDifferences[dataset.id] = baselineMean > 0 ? ((mean - baselineMean) / baselineMean) * 100 : 0;

      // Calculate trend metrics
      trendsAnalysis[dataset.id] = calculateTrendMetrics(dataset.data);
    });

    // Calculate statistical significance (simplified)
    const correlationValues = Object.values(correlations);
    const avgCorrelation = correlationValues.reduce((sum, val) => sum + Math.abs(val), 0) / correlationValues.length;
    const statisticalSignificance = avgCorrelation;

    return {
      correlations,
      relativeDifferences,
      trendsAnalysis,
      statisticalSignificance
    };
  }, [datasets, selectedBaseline]);

  useEffect(() => {
    if (comparisonAnalysis) {
      setComparisonMetrics(comparisonAnalysis);
      if (onComparisonResult) {
        onComparisonResult(comparisonAnalysis);
      }
    }
  }, [comparisonAnalysis, onComparisonResult]);

  // Generate chart data based on view mode
  const getChartData = () => {
    if (datasets.length === 0) return { labels: [], datasets: [] };

    // Find common time range
    const allTimestamps = datasets.flatMap(d => d.data.map(point => point.timestamp.getTime()));
    const minTime = Math.min(...allTimestamps);
    const maxTime = Math.max(...allTimestamps);
    
    // Generate common time labels
    const timeStep = (maxTime - minTime) / 100; // 100 points max
    const commonLabels: Date[] = [];
    for (let time = minTime; time <= maxTime; time += timeStep) {
      commonLabels.push(new Date(time));
    }

    const chartDatasets = datasets.map(dataset => {
      let values: number[];
      
      if (viewMode === 'normalized') {
        // Normalize to 0-100 scale
        const dataValues = dataset.data.map(d => d.value);
        const min = Math.min(...dataValues);
        const max = Math.max(...dataValues);
        const range = max - min;
        values = dataValues.map(val => range > 0 ? ((val - min) / range) * 100 : 50);
      } else if (viewMode === 'difference') {
        // Show difference from baseline
        const baseline = datasets.find(d => d.id === selectedBaseline);
        if (baseline && baseline.id !== dataset.id) {
          values = dataset.data.map((point, index) => {
            const baselineValue = baseline.data[index]?.value || 0;
            return point.value - baselineValue;
          });
        } else {
          values = dataset.data.map(() => 0); // Baseline shows as zero line
        }
      } else {
        // Overlay mode - show actual values
        values = dataset.data.map(d => d.value);
      }

      return {
        label: dataset.name,
        data: values,
        borderColor: dataset.color,
        backgroundColor: dataset.color + '20',
        borderWidth: dataset.id === selectedBaseline ? 3 : 2,
        borderDash: dataset.id === selectedBaseline ? [] : [5, 5],
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1
      };
    });

    return {
      labels: datasets[0]?.data.map(d => d.timestamp) || [],
      datasets: chartDatasets
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
        bodyColor: '#ffffff',
        callbacks: {
          label: (context: any) => {
            const dataset = datasets[context.datasetIndex];
            const suffix = viewMode === 'normalized' ? '%' : 
                          viewMode === 'difference' ? ' (разн.)' : '';
            return `${dataset.name}: ${context.parsed.y.toFixed(1)}${suffix}`;
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
            if (viewMode === 'normalized') return `${value}%`;
            if (viewMode === 'difference') return value > 0 ? `+${value}` : `${value}`;
            return value.toFixed(0);
          }
        }
      }
    }
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.8) return 'text-green-600';
    if (abs > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCorrelationLabel = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.8) return 'Сильная';
    if (abs > 0.5) return 'Умеренная';
    if (abs > 0.2) return 'Слабая';
    return 'Отсутствует';
  };

  return (
    <div className={`trend-comparison bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">📊 Сравнение трендов</h3>
          <div className="text-sm text-gray-500">
            Сравнивается: {datasets.length} наборов данных
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Режим:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'overlay' | 'normalized' | 'difference')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overlay">Наложение</option>
              <option value="normalized">Нормализованный</option>
              <option value="difference">Разность</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Базовая линия:</label>
            <select
              value={selectedBaseline}
              onChange={(e) => setSelectedBaseline(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {datasets.map(dataset => (
                <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showStatistics}
              onChange={(e) => setShowStatistics(e.target.checked)}
              className="rounded"
            />
            <span>Показать статистику</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container" style={{ height: '400px', padding: '16px' }}>
        <Line data={getChartData()} options={chartOptions} />
      </div>

      {/* Comparison Statistics */}
      {showStatistics && comparisonMetrics && (
        <div className="p-4 border-t border-gray-100">
          <h4 className="text-md font-medium text-gray-900 mb-3">Статистика сравнения</h4>
          
          {/* Correlation Matrix */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Корреляция с базовой линией</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(comparisonMetrics.correlations).map(([datasetId, correlation]) => {
                const dataset = datasets.find(d => d.id === datasetId);
                if (!dataset || datasetId === selectedBaseline) return null;
                
                return (
                  <div key={datasetId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{dataset.name}</span>
                      <span className={`text-sm font-semibold ${getCorrelationColor(correlation)}`}>
                        {correlation.toFixed(3)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {getCorrelationLabel(correlation)} корреляция
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className={`h-1.5 rounded-full ${
                          Math.abs(correlation) > 0.8 ? 'bg-green-500' :
                          Math.abs(correlation) > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.abs(correlation) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relative Differences */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Относительные различия (%)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(comparisonMetrics.relativeDifferences).map(([datasetId, difference]) => {
                const dataset = datasets.find(d => d.id === datasetId);
                if (!dataset || datasetId === selectedBaseline) return null;
                
                return (
                  <div key={datasetId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{dataset.name}</span>
                      <span className={`text-sm font-semibold ${
                        difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.abs(difference) > 20 ? 'Значительное' :
                       Math.abs(difference) > 10 ? 'Умеренное' : 'Незначительное'} отличие
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trend Analysis Summary */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Анализ трендов</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Набор данных</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Направление</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Рост (%)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Волатильность</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(comparisonMetrics.trendsAnalysis).map(([datasetId, metrics]) => {
                    const dataset = datasets.find(d => d.id === datasetId);
                    if (!dataset) return null;
                    
                    return (
                      <tr key={datasetId}>
                        <td className="px-3 py-2 text-sm font-medium text-gray-900">{dataset.name}</td>
                        <td className="px-3 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            metrics.trendDirection === 'increasing' ? 'bg-green-100 text-green-800' :
                            metrics.trendDirection === 'decreasing' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {metrics.trendDirection === 'increasing' ? '📈 Рост' :
                             metrics.trendDirection === 'decreasing' ? '📉 Снижение' : '➡️ Стабильно'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {metrics.growthRate > 0 ? '+' : ''}{metrics.growthRate.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{metrics.volatility.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistical Significance */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Статистическая значимость</span>
              <span className="text-sm font-semibold text-blue-900">
                {(comparisonMetrics.statisticalSignificance * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-blue-700 mt-1">
              {comparisonMetrics.statisticalSignificance > 0.7 ? 'Высокая степень взаимосвязи' :
               comparisonMetrics.statisticalSignificance > 0.4 ? 'Умеренная степень взаимосвязи' : 'Низкая степень взаимосвязи'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendComparison;