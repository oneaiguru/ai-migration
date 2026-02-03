// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/SeasonalityAnalysis.tsx
// SeasonalityAnalysis.tsx - Seasonal pattern visualization and decomposition

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { TrendDataPoint, SeasonalComponent } from '../../../types/trends';

interface SeasonalityAnalysisProps {
  data: TrendDataPoint[];
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  onSeasonalityDetected?: (components: SeasonalComponent[]) => void;
  className?: string;
}

const SeasonalityAnalysis: React.FC<SeasonalityAnalysisProps> = ({
  data,
  granularity = 'hourly',
  onSeasonalityDetected,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'patterns' | 'decomposition' | 'heatmap'>('patterns');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [seasonalComponents, setSeasonalComponents] = useState<SeasonalComponent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate seasonal patterns
  const calculateSeasonalPatterns = useMemo(() => {
    if (data.length < 24) return {};

    setIsAnalyzing(true);

    const patterns: { [key: string]: number[] } = {
      hourly: new Array(24).fill(0),
      daily: new Array(7).fill(0),
      monthly: new Array(12).fill(0)
    };

    const counts: { [key: string]: number[] } = {
      hourly: new Array(24).fill(0),
      daily: new Array(7).fill(0),
      monthly: new Array(12).fill(0)
    };

    // Aggregate data by time periods
    data.forEach(point => {
      const hour = point.timestamp.getHours();
      const day = point.timestamp.getDay();
      const month = point.timestamp.getMonth();

      patterns.hourly[hour] += point.value;
      counts.hourly[hour]++;

      patterns.daily[day] += point.value;
      counts.daily[day]++;

      patterns.monthly[month] += point.value;
      counts.monthly[month]++;
    });

    // Calculate averages
    Object.keys(patterns).forEach(period => {
      patterns[period] = patterns[period].map((sum, index) => 
        counts[period][index] > 0 ? sum / counts[period][index] : 0
      );
    });

    setIsAnalyzing(false);
    return patterns;
  }, [data]);

  // Calculate seasonal decomposition
  const calculateSeasonalDecomposition = useMemo(() => {
    const seasonal = calculateSeasonalPatterns;
    const components: SeasonalComponent[] = [];

    Object.entries(seasonal).forEach(([period, values]) => {
      if (values.length === 0) return;

      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const strength = Math.sqrt(variance) / mean;

      const peaks: number[] = [];
      const valleys: number[] = [];

      values.forEach((value, index) => {
        const prev = values[index - 1] || values[values.length - 1];
        const next = values[index + 1] || values[0];

        if (value > prev && value > next && value > mean) {
          peaks.push(index);
        } else if (value < prev && value < next && value < mean) {
          valleys.push(index);
        }
      });

      const amplitude = Math.max(...values) - Math.min(...values);
      
      components.push({
        period: period as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly',
        strength,
        peaks,
        valleys,
        amplitude,
        phase: peaks.length > 0 ? peaks[0] : 0,
        confidence: Math.min(0.95, strength * 2)
      });
    });

    return components;
  }, [calculateSeasonalPatterns]);

  useEffect(() => {
    setSeasonalComponents(calculateSeasonalDecomposition);
    if (onSeasonalityDetected) {
      onSeasonalityDetected(calculateSeasonalDecomposition);
    }
  }, [calculateSeasonalDecomposition, onSeasonalityDetected]);

  // Hourly pattern chart
  const hourlyChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Среднее значение по часам',
        data: calculateSeasonalPatterns.hourly || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Пики',
        data: Array.from({ length: 24 }, (_, i) => {
          const hourlyComponent = seasonalComponents.find(c => c.period === 'hourly');
          return hourlyComponent?.peaks.includes(i) ? calculateSeasonalPatterns.hourly?.[i] : null;
        }),
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        borderWidth: 0,
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false,
        pointStyle: 'triangle'
      }
    ]
  };

  // Weekly pattern chart
  const weeklyChartData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'Среднее значение по дням недели',
        data: calculateSeasonalPatterns.daily || [],
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
        ],
        borderColor: [
          '#FF5252', '#26A69A', '#2196F3', '#66BB6A', '#FFD54F', '#BA68C8', '#4DB6AC'
        ],
        borderWidth: 2
      }
    ]
  };

  // Seasonal strength radar chart
  const radarChartData = {
    labels: ['Час', 'День недели', 'Месяц'],
    datasets: [
      {
        label: 'Сила сезонности',
        data: [
          seasonalComponents.find(c => c.period === 'hourly')?.strength || 0,
          seasonalComponents.find(c => c.period === 'daily')?.strength || 0,
          seasonalComponents.find(c => c.period === 'monthly')?.strength || 0
        ],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Доверительный интервал',
        data: [
          seasonalComponents.find(c => c.period === 'hourly')?.confidence || 0,
          seasonalComponents.find(c => c.period === 'daily')?.confidence || 0,
          seasonalComponents.find(c => c.period === 'monthly')?.confidence || 0
        ],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 3
      }
    ]
  };

  // Heatmap data for hourly/daily patterns
  const generateHeatmapData = () => {
    const heatmapData: { [key: string]: number[][] } = {
      hourly: Array.from({ length: 7 }, () => new Array(24).fill(0)),
      daily: Array.from({ length: 4 }, () => new Array(7).fill(0))
    };

    const counts: { [key: string]: number[][] } = {
      hourly: Array.from({ length: 7 }, () => new Array(24).fill(0)),
      daily: Array.from({ length: 4 }, () => new Array(7).fill(0))
    };

    data.forEach(point => {
      const hour = point.timestamp.getHours();
      const day = point.timestamp.getDay();
      const week = Math.floor(point.timestamp.getDate() / 7);

      if (week < 4) {
        heatmapData.hourly[day][hour] += point.value;
        counts.hourly[day][hour]++;

        heatmapData.daily[week][day] += point.value;
        counts.daily[week][day]++;
      }
    });

    // Calculate averages
    Object.keys(heatmapData).forEach(type => {
      heatmapData[type] = heatmapData[type].map((row, i) =>
        row.map((sum, j) => 
          counts[type][i][j] > 0 ? sum / counts[type][i][j] : 0
        )
      );
    });

    return heatmapData;
  };

  const heatmapData = generateHeatmapData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12
          }
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
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151'
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#374151'
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151'
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          color: '#374151',
          stepSize: 0.2
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const getIntensityColor = (value: number, max: number) => {
    const intensity = value / max;
    if (intensity > 0.8) return 'bg-red-500';
    if (intensity > 0.6) return 'bg-orange-400';
    if (intensity > 0.4) return 'bg-yellow-300';
    if (intensity > 0.2) return 'bg-green-300';
    return 'bg-blue-200';
  };

  return (
    <div className={`seasonality-analysis bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">📊 Анализ сезонности</h3>
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Анализ...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Режим:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'patterns' | 'decomposition' | 'heatmap')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="patterns">Паттерны</option>
              <option value="decomposition">Декомпозиция</option>
              <option value="heatmap">Тепловая карта</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Период:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Дневной</option>
              <option value="weekly">Недельный</option>
              <option value="monthly">Месячный</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="p-4">
        {viewMode === 'patterns' && (
          <div className="space-y-6">
            {/* Hourly Pattern */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Почасовой паттерн</h4>
              <div style={{ height: '250px' }}>
                <Line data={hourlyChartData} options={chartOptions} />
              </div>
            </div>

            {/* Weekly Pattern */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Недельный паттерн</h4>
              <div style={{ height: '250px' }}>
                <Bar data={weeklyChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'decomposition' && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Сезонная декомпозиция</h4>
            <div style={{ height: '300px' }}>
              <Radar data={radarChartData} options={radarOptions} />
            </div>

            {/* Seasonal Components Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {seasonalComponents.map((component, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {component.period === 'hourly' ? 'Часовая' :
                     component.period === 'daily' ? 'Дневная' : 'Месячная'} сезонность
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Сила:</span>
                      <span className="font-medium">{(component.strength * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Амплитуда:</span>
                      <span className="font-medium">{component.amplitude.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Доверие:</span>
                      <span className="font-medium">{(component.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Пики:</span>
                      <span className="font-medium">{component.peaks.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'heatmap' && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Тепловая карта активности</h4>
            
            {/* Hourly Heatmap */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Час × День недели</h5>
              <div className="grid grid-cols-24 gap-1">
                {heatmapData.hourly.map((dayData, dayIndex) =>
                  dayData.map((hourValue, hourIndex) => {
                    const maxValue = Math.max(...heatmapData.hourly.flat());
                    return (
                      <div
                        key={`${dayIndex}-${hourIndex}`}
                        className={`w-4 h-4 rounded ${getIntensityColor(hourValue, maxValue)}`}
                        title={`День ${dayIndex + 1}, ${hourIndex}:00 - ${hourValue.toFixed(1)}`}
                      />
                    );
                  })
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0:00</span>
                <span>12:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">Интенсивность:</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-200 rounded"></div>
                <span className="text-xs">Низкая</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span className="text-xs">Средняя</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-yellow-300 rounded"></div>
                <span className="text-xs">Высокая</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-xs">Максимум</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalityAnalysis;