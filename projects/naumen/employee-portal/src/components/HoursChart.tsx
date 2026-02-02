import React, { useState, useEffect } from 'react';

interface HoursChartProps {
  period: 'week' | 'month' | 'quarter';
  employeeId?: string;
  onDataPointClick?: (dataPoint: HoursDataPoint) => void;
}

interface HoursDataPoint {
  period: string;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  date: Date;
  efficiency: number;
  breakdown: {
    regular: number;
    training: number;
    meetings: number;
    overtime: number;
  };
}

interface ChartConfig {
  showTarget: boolean;
  showOvertime: boolean;
  showEfficiency: boolean;
  chartType: 'bar' | 'line' | 'combo';
}

const HoursChart: React.FC<HoursChartProps> = ({ 
  period, 
  employeeId, 
  onDataPointClick 
}) => {
  const [data, setData] = useState<HoursDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ChartConfig>({
    showTarget: true,
    showOvertime: true,
    showEfficiency: false,
    chartType: 'combo'
  });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  // Load chart data based on period
  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData: HoursDataPoint[] = [];
      const now = new Date();
      
      if (period === 'week') {
        // Last 8 weeks
        for (let i = 7; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - (i * 7));
          
          const scheduledHours = 40;
          const variance = (Math.random() - 0.5) * 8; // ±4 hours variance
          const actualHours = Math.max(0, scheduledHours + variance);
          const overtimeHours = Math.max(0, actualHours - scheduledHours);
          
          mockData.push({
            period: `Нед ${weekStart.getDate()}.${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`,
            scheduledHours,
            actualHours,
            overtimeHours,
            date: weekStart,
            efficiency: (actualHours / scheduledHours) * 100,
            breakdown: {
              regular: actualHours - overtimeHours - 2,
              training: 1.5,
              meetings: 0.5,
              overtime: overtimeHours
            }
          });
        }
      } else if (period === 'month') {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
          const workingDays = Math.floor(daysInMonth * 0.7); // Approximate working days
          
          const scheduledHours = workingDays * 8;
          const variance = (Math.random() - 0.5) * 40; // ±20 hours variance
          const actualHours = Math.max(0, scheduledHours + variance);
          const overtimeHours = Math.max(0, actualHours - scheduledHours);
          
          mockData.push({
            period: monthDate.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
            scheduledHours,
            actualHours,
            overtimeHours,
            date: monthDate,
            efficiency: (actualHours / scheduledHours) * 100,
            breakdown: {
              regular: actualHours - overtimeHours - 8,
              training: 6,
              meetings: 2,
              overtime: overtimeHours
            }
          });
        }
      } else {
        // Last 4 quarters
        for (let i = 3; i >= 0; i--) {
          const quarterStart = new Date(now.getFullYear(), now.getMonth() - (i * 3), 1);
          const scheduledHours = 520; // ~13 weeks * 40 hours
          const variance = (Math.random() - 0.5) * 120; // ±60 hours variance
          const actualHours = Math.max(0, scheduledHours + variance);
          const overtimeHours = Math.max(0, actualHours - scheduledHours);
          
          const quarter = Math.floor(quarterStart.getMonth() / 3) + 1;
          
          mockData.push({
            period: `Q${quarter} ${quarterStart.getFullYear().toString().slice(-2)}`,
            scheduledHours,
            actualHours,
            overtimeHours,
            date: quarterStart,
            efficiency: (actualHours / scheduledHours) * 100,
            breakdown: {
              regular: actualHours - overtimeHours - 24,
              training: 18,
              meetings: 6,
              overtime: overtimeHours
            }
          });
        }
      }
      
      setData(mockData);
      setLoading(false);
    };
    
    loadChartData();
  }, [period, employeeId]);

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.scheduledHours, d.actualHours))
  );
  const chartHeight = 200;

  const getBarHeight = (value: number) => {
    return (value / maxValue) * chartHeight;
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 90) return 'text-blue-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handlePointClick = (index: number) => {
    setSelectedPoint(selectedPoint === index ? null : index);
    onDataPointClick?.(data[index]);
  };

  const renderBarChart = () => {
    return (
      <div className="flex items-end justify-between space-x-2" style={{ height: chartHeight + 40 }}>
        {data.map((point, index) => (
          <div 
            key={index} 
            className="flex-1 flex flex-col items-center cursor-pointer group"
            onClick={() => handlePointClick(index)}
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            {/* Bars */}
            <div className="relative flex items-end space-x-1 mb-2">
              {/* Scheduled Hours Bar */}
              {config.showTarget && (
                <div 
                  className="w-4 bg-gray-300 rounded-t transition-all duration-200 group-hover:bg-gray-400"
                  style={{ height: getBarHeight(point.scheduledHours) }}
                  title={`Запланировано: ${point.scheduledHours}ч`}
                />
              )}
              
              {/* Actual Hours Bar */}
              <div 
                className={`w-4 rounded-t transition-all duration-200 ${
                  point.actualHours >= point.scheduledHours 
                    ? 'bg-blue-500 group-hover:bg-blue-600' 
                    : 'bg-orange-500 group-hover:bg-orange-600'
                } ${selectedPoint === index ? 'ring-2 ring-blue-300' : ''}`}
                style={{ height: getBarHeight(point.actualHours) }}
                title={`Фактически: ${point.actualHours}ч`}
              />
              
              {/* Overtime Hours Bar */}
              {config.showOvertime && point.overtimeHours > 0 && (
                <div 
                  className="w-4 bg-purple-500 rounded-t transition-all duration-200 group-hover:bg-purple-600"
                  style={{ height: getBarHeight(point.overtimeHours) }}
                  title={`Сверхурочные: ${point.overtimeHours}ч`}
                />
              )}
            </div>
            
            {/* Efficiency Badge */}
            {config.showEfficiency && (
              <div className={`text-xs font-medium ${getEfficiencyColor(point.efficiency)}`}>
                {point.efficiency.toFixed(0)}%
              </div>
            )}
            
            {/* Period Label */}
            <div className="text-xs text-gray-600 text-center mt-1 transform -rotate-45 origin-top-left">
              {point.period}
            </div>
            
            {/* Hover Tooltip */}
            {hoveredPoint === index && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <div>Запланировано: {point.scheduledHours}ч</div>
                <div>Фактически: {point.actualHours.toFixed(1)}ч</div>
                {point.overtimeHours > 0 && (
                  <div>Сверхурочные: {point.overtimeHours.toFixed(1)}ч</div>
                )}
                <div>Эффективность: {point.efficiency.toFixed(1)}%</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 300; // 300px width
      const y = chartHeight - getBarHeight(point.actualHours);
      return { x, y, point, index };
    });

    return (
      <div className="relative" style={{ height: chartHeight + 40 }}>
        <svg width="100%" height={chartHeight} className="absolute top-0">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * ratio}
              x2="100%"
              y2={chartHeight * ratio}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Scheduled Hours Line */}
          {config.showTarget && (
            <polyline
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeDasharray="5,5"
              points={points.map(p => {
                const y = chartHeight - getBarHeight(p.point.scheduledHours);
                return `${p.x},${y}`;
              }).join(' ')}
            />
          )}
          
          {/* Actual Hours Line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
          />
          
          {/* Data Points */}
          {points.map((p) => (
            <circle
              key={p.index}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === p.index ? "6" : "4"}
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onClick={() => handlePointClick(p.index)}
              onMouseEnter={() => setHoveredPoint(p.index)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
        
        {/* Period Labels */}
        <div className="absolute bottom-0 w-full flex justify-between">
          {data.map((point, index) => (
            <div key={index} className="text-xs text-gray-600 transform -rotate-45 origin-bottom-left">
              {point.period}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['bar', 'line', 'combo'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setConfig(prev => ({ ...prev, chartType: type }))}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  config.chartType === type
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {type === 'bar' ? '📊' : type === 'line' ? '📈' : '📊📈'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Toggle Options */}
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showTarget}
              onChange={(e) => setConfig(prev => ({ ...prev, showTarget: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Цель</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showOvertime}
              onChange={(e) => setConfig(prev => ({ ...prev, showOvertime: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Сверхурочные</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.showEfficiency}
              onChange={(e) => setConfig(prev => ({ ...prev, showEfficiency: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Эффективность</span>
          </label>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm">Загрузка графика...</p>
            </div>
          </div>
        ) : config.chartType === 'line' ? (
          renderLineChart()
        ) : (
          renderBarChart()
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-blue-500 rounded"></div>
          <span>Фактические часы</span>
        </div>
        
        {config.showTarget && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-gray-300 rounded"></div>
            <span>Запланированные часы</span>
          </div>
        )}
        
        {config.showOvertime && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-purple-500 rounded"></div>
            <span>Сверхурочные часы</span>
          </div>
        )}
      </div>

      {/* Selected Point Details */}
      {selectedPoint !== null && data[selectedPoint] && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">
            Детали за {data[selectedPoint].period}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-800 font-medium">
                {data[selectedPoint].scheduledHours}ч
              </div>
              <div className="text-blue-600">Запланировано</div>
            </div>
            
            <div>
              <div className="text-blue-800 font-medium">
                {data[selectedPoint].actualHours.toFixed(1)}ч
              </div>
              <div className="text-blue-600">Фактически</div>
            </div>
            
            <div>
              <div className="text-blue-800 font-medium">
                {data[selectedPoint].overtimeHours.toFixed(1)}ч
              </div>
              <div className="text-blue-600">Сверхурочные</div>
            </div>
            
            <div>
              <div className={`font-medium ${getEfficiencyColor(data[selectedPoint].efficiency)}`}>
                {data[selectedPoint].efficiency.toFixed(1)}%
              </div>
              <div className="text-blue-600">Эффективность</div>
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="mt-4">
            <h5 className="font-medium text-blue-900 mb-2">Структура времени:</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Основная работа: {data[selectedPoint].breakdown.regular.toFixed(1)}ч</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>Обучение: {data[selectedPoint].breakdown.training.toFixed(1)}ч</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Встречи: {data[selectedPoint].breakdown.meetings.toFixed(1)}ч</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded"></div>
                <span>Сверхурочные: {data[selectedPoint].breakdown.overtime.toFixed(1)}ч</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-green-800 font-medium">
              {(data.reduce((sum, d) => sum + d.actualHours, 0) / data.length).toFixed(1)}ч
            </div>
            <div className="text-green-600">Среднее за период</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 font-medium">
              {data.reduce((sum, d) => sum + d.actualHours, 0).toFixed(1)}ч
            </div>
            <div className="text-blue-600">Всего отработано</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-purple-800 font-medium">
              {data.reduce((sum, d) => sum + d.overtimeHours, 0).toFixed(1)}ч
            </div>
            <div className="text-purple-600">Всего сверхурочных</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoursChart;