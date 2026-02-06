// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/TimeSeriesChart.tsx
import React, { useRef, useEffect, useState } from 'react';

// ========================
// CHART.JS SETUP (using CDN in HTML artifacts)
// ========================

declare global {
  interface Window {
    Chart: any;
  }
}

// ========================
// TYPE DEFINITIONS
// ========================

interface ForecastDataPoint {
  timestamp: string;
  predicted: number;
  actual?: number;
  confidence: number;
  adjustments?: number;
  requiredAgents: number;
  isWeekend: boolean;
  hour: number;
  dayOfWeek: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
  tension?: number;
  borderDash?: number[];
  pointRadius?: number;
  pointHoverRadius?: number;
}

interface TimeSeriesChartProps {
  data: ForecastDataPoint[];
  loading?: boolean;
  error?: string | null;
  height?: number;
  showLegend?: boolean;
  showTooltips?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  onDataPointClick?: (dataPoint: ForecastDataPoint, index: number) => void;
  onRangeSelect?: (startIndex: number, endIndex: number) => void;
}

// ========================
// TIME SERIES CHART COMPONENT
// ========================

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  loading = false,
  error = null,
  height = 400,
  showLegend = true,
  showTooltips = true,
  enableZoom = true,
  enablePan = true,
  onDataPointClick,
  onRangeSelect
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [currentTimeIndicator, setCurrentTimeIndicator] = useState<Date>(new Date());

  // Update current time indicator every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeIndicator(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current || !window.Chart) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data
    const labels = data.map(point => new Date(point.timestamp));
    const currentTime = new Date();
    const currentTimeIndex = data.findIndex(point => new Date(point.timestamp) >= currentTime);

    // Separate past and future data
    const pastData = data.filter((_, index) => index < currentTimeIndex);
    const futureData = data.filter((_, index) => index >= currentTimeIndex);

    // Create datasets
    const datasets: ChartDataset[] = [];

    // Actual data (past)
    if (pastData.some(point => point.actual !== undefined)) {
      datasets.push({
        label: 'Факт',
        data: data.map(point => point.actual ?? null),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 4
      });
    }

    // Predicted data (future)
    if (futureData.length > 0) {
      datasets.push({
        label: 'Прогноз',
        data: data.map((point, index) => index >= currentTimeIndex ? point.predicted : null),
        borderColor: '#10B981',
        backgroundColor: '#10B981',
        fill: false,
        tension: 0.1,
        borderDash: [5, 5],
        pointRadius: 2,
        pointHoverRadius: 4
      });
    }

    // Confidence interval (upper bound)
    if (futureData.length > 0) {
      datasets.push({
        label: 'Верхняя граница',
        data: data.map((point, index) => 
          index >= currentTimeIndex ? point.predicted + (point.confidence * point.predicted * 0.3) : null
        ),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: '+1',
        tension: 0.1,
        pointRadius: 0
      });

      // Confidence interval (lower bound)
      datasets.push({
        label: 'Нижняя граница',
        data: data.map((point, index) => 
          index >= currentTimeIndex ? Math.max(0, point.predicted - (point.confidence * point.predicted * 0.3)) : null
        ),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.1,
        pointRadius: 0
      });
    }

    // Required agents overlay
    datasets.push({
      label: 'Требуется агентов',
      data: data.map(point => point.requiredAgents),
      borderColor: '#F59E0B',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      fill: false,
      tension: 0.1,
      pointRadius: 1,
      pointHoverRadius: 3
    });

    // Chart configuration
    const config = {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: showLegend,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              filter: function(legendItem: any) {
                // Hide confidence interval labels
                return !legendItem.text.includes('граница');
              }
            }
          },
          tooltip: {
            enabled: showTooltips,
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(tooltipItems: any[]) {
                const date = new Date(tooltipItems[0].parsed.x);
                return date.toLocaleString('ru', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              },
              afterBody: function(tooltipItems: any[]) {
                const index = tooltipItems[0].dataIndex;
                const point = data[index];
                if (!point) return [];

                const lines = [];
                lines.push(`Уверенность: ${(point.confidence * 100).toFixed(1)}%`);
                if (point.isWeekend) lines.push('📅 Выходной день');
                if (point.adjustments && point.adjustments !== 0) {
                  lines.push(`Корректировка: ${point.adjustments > 0 ? '+' : ''}${point.adjustments}`);
                }
                return lines;
              }
            }
          },
          annotation: {
            annotations: {
              currentTime: {
                type: 'line',
                mode: 'vertical',
                scaleID: 'x',
                value: currentTime,
                borderColor: '#EF4444',
                borderWidth: 2,
                borderDash: [3, 3],
                label: {
                  enabled: true,
                  content: 'Сейчас',
                  position: 'top',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  fontSize: 10,
                  padding: 4
                }
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'DD.MM HH:mm'
              }
            },
            title: {
              display: true,
              text: 'Время'
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Количество звонков'
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        onClick: (event: any, elements: any[]) => {
          if (elements.length > 0 && onDataPointClick) {
            const index = elements[0].index;
            onDataPointClick(data[index], index);
          }
        },
        onHover: (event: any, elements: any[]) => {
          event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
      }
    };

    // Add zoom and pan plugins if enabled
    if (enableZoom || enablePan) {
      config.options.plugins.zoom = {
        zoom: {
          wheel: {
            enabled: enableZoom
          },
          pinch: {
            enabled: enableZoom
          },
          mode: 'x'
        },
        pan: {
          enabled: enablePan,
          mode: 'x'
        }
      };
    }

    // Create chart
    chartInstance.current = new window.Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, height, showLegend, showTooltips, enableZoom, enablePan, onDataPointClick]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6" style={{ height }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-600">Загрузка данных графика...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6" style={{ height }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-red-600">
            <div className="text-4xl mb-4">⚠️</div>
            <div className="text-lg font-medium mb-2">Ошибка загрузки графика</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6" style={{ height }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg font-medium mb-2">Нет данных для отображения</div>
            <div className="text-sm">Настройте параметры прогноза и нажмите "Построить прогноз"</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-900">Прогноз нагрузки</h3>
          <span className="text-sm text-gray-500">
            ({data.length} интервалов)
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Факт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Прогноз</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Доверительный интервал</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Требуется агентов</span>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        <div style={{ height, position: 'relative' }}>
          <canvas
            ref={chartRef}
            style={{ 
              width: '100%', 
              height: '100%',
              cursor: 'crosshair'
            }}
          />
        </div>
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🔍</span>
          <span>Колесо мыши - масштабирование</span>
          <span>•</span>
          <span>Перетаскивание - панорамирование</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (chartInstance.current) {
                chartInstance.current.resetZoom();
              }
            }}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🔄 Сбросить масштаб
          </button>
          
          <button
            onClick={() => {
              // Export chart as image
              if (chartInstance.current) {
                const url = chartInstance.current.toBase64Image();
                const link = document.createElement('a');
                link.download = `forecast-chart-${new Date().toISOString().split('T')[0]}.png`;
                link.href = url;
                link.click();
              }
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            📸 Экспорт
          </button>
        </div>
      </div>

      {/* Chart Statistics */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Всего интервалов:</span>
            <span className="ml-2 font-medium">{data.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Макс. нагрузка:</span>
            <span className="ml-2 font-medium">
              {Math.max(...data.map(d => d.predicted))} звонков
            </span>
          </div>
          <div>
            <span className="text-gray-600">Средняя уверенность:</span>
            <span className="ml-2 font-medium">
              {(data.reduce((sum, d) => sum + d.confidence, 0) / data.length * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Обновлено:</span>
            <span className="ml-2 font-medium">
              {currentTimeIndicator.toLocaleTimeString('ru', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSeriesChart;