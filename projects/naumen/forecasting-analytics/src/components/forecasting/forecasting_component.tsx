import React, { useState, useEffect } from 'react';

const ForecastingInterface = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState('basic_extrapolation');
  const [accuracy, setAccuracy] = useState(84.2);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock forecast data generation
  useEffect(() => {
    const generateMockData = () => {
      const data = [];
      const baseDate = new Date(2024, 6, 1); // July 1, 2024
      
      for (let i = 0; i < 168; i++) { // 7 days * 24 hours
        const date = new Date(baseDate.getTime() + i * 60 * 60 * 1000);
        const hour = date.getHours();
        
        // Simulate call volume patterns
        let baseVolume = 20;
        if (hour >= 9 && hour <= 17) baseVolume = 50;
        if (hour >= 18 && hour <= 21) baseVolume = 35;
        
        // Add day of week variation
        const dayOfWeek = date.getDay();
        let dayMultiplier = 1;
        if (dayOfWeek === 0 || dayOfWeek === 6) dayMultiplier = 0.6; // Weekend
        if (dayOfWeek >= 1 && dayOfWeek <= 3) dayMultiplier = 1.2; // Peak weekdays
        
        const predictedCalls = Math.round(baseVolume * dayMultiplier + (Math.random() - 0.5) * 10);
        const actualCalls = i < 72 ? Math.round(predictedCalls * (0.9 + Math.random() * 0.2)) : null;
        
        data.push({
          timestamp: date.toISOString(),
          hour: date.getHours(),
          dayOfWeek: dayOfWeek,
          predictedCalls,
          actualCalls,
          confidence: 0.75 + Math.random() * 0.2,
          requiredAgents: Math.ceil(predictedCalls * 0.15),
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6
        });
      }
      
      return data;
    };

    setForecastData(generateMockData());
  }, [algorithm]);

  const handleGenerateForecast = async () => {
    setLoading(true);
    
    // Simulate API call to math engine
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update accuracy based on algorithm
    const accuracyMap = {
      'basic_extrapolation': 84.2,
      'arima': 91.5,
      'linear_regression': 78.8,
      'seasonal_naive': 76.3
    };
    
    setAccuracy(accuracyMap[algorithm] || 84.2);
    setLoading(false);
  };

  const getChartData = () => {
    const now = new Date();
    const cutoffIndex = 72; // 3 days of actual data
    
    return forecastData.map((item, index) => ({
      ...item,
      x: index,
      isPast: index < cutoffIndex,
      isFuture: index >= cutoffIndex
    }));
  };

  const getCurrentMetrics = () => {
    const chartData = getChartData();
    const pastData = chartData.filter(d => d.isPast && d.actualCalls !== null);
    const futureData = chartData.filter(d => d.isFuture);
    
    const totalPredicted = pastData.reduce((sum, d) => sum + d.predictedCalls, 0);
    const totalActual = pastData.reduce((sum, d) => sum + d.actualCalls, 0);
    const avgConfidence = futureData.reduce((sum, d) => sum + d.confidence, 0) / futureData.length;
    
    return {
      mape: Math.abs((totalPredicted - totalActual) / totalActual) * 100,
      totalForecastCalls: futureData.reduce((sum, d) => sum + d.predictedCalls, 0),
      avgConfidence: avgConfidence * 100,
      peakHour: futureData.reduce((max, d) => d.predictedCalls > max.predictedCalls ? d : max, futureData[0])
    };
  };

  const metrics = getCurrentMetrics();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Построить прогноз</h2>
            <p className="text-sm text-gray-600 mt-1">Инвентаризация-2 • Точность: {accuracy}%</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="basic_extrapolation">Базовая экстраполяция</option>
              <option value="arima">ARIMA модель</option>
              <option value="linear_regression">Линейная регрессия</option>
              <option value="seasonal_naive">Сезонная наивная</option>
            </select>
            
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="day">День</option>
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
            </select>
            
            <button 
              onClick={handleGenerateForecast}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Расчёт...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Построить прогноз
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalForecastCalls?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-blue-800">Прогноз звонков</div>
            <div className="text-xs text-blue-600 mt-1">на следующие 4 дня</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {accuracy}%
            </div>
            <div className="text-sm text-green-800">Точность модели</div>
            <div className="text-xs text-green-600 mt-1">MAPE: {metrics.mape?.toFixed(1)}%</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.avgConfidence?.toFixed(0)}%
            </div>
            <div className="text-sm text-orange-800">Уверенность</div>
            <div className="text-xs text-orange-600 mt-1">средняя по периоду</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.peakHour?.hour || 0}:00
            </div>
            <div className="text-sm text-purple-800">Пиковый час</div>
            <div className="text-xs text-purple-600 mt-1">
              {metrics.peakHour?.predictedCalls || 0} звонков
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Прогноз нагрузки</h3>
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
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>Доверительный интервал</span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="bg-gray-50 rounded-lg p-4 h-80">
          <svg width="100%" height="100%" viewBox="0 0 800 280">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line 
                key={i} 
                x1="0" 
                y1={i * 40 + 20} 
                x2="800" 
                y2={i * 40 + 20} 
                stroke="#e5e7eb" 
                strokeWidth="1"
              />
            ))}
            
            {/* Time axis */}
            {getChartData().filter((_, i) => i % 12 === 0).map((point, i) => (
              <g key={i}>
                <line 
                  x1={i * 96} 
                  y1="20" 
                  x2={i * 96} 
                  y2="220" 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
                <text 
                  x={i * 96} 
                  y="240" 
                  textAnchor="middle" 
                  fontSize="10" 
                  fill="#6b7280"
                >
                  {new Date(point.timestamp).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}
                </text>
              </g>
            ))}

            {/* Actual data line (past) */}
            <polyline
              points={getChartData()
                .filter(d => d.isPast && d.actualCalls !== null)
                .map((d, i) => `${i * 4.8},${220 - (d.actualCalls * 2)}`)
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />

            {/* Forecast line (future) */}
            <polyline
              points={getChartData()
                .filter(d => d.isFuture)
                .map((d, i) => `${(i + 72) * 4.8},${220 - (d.predictedCalls * 2)}`)
                .join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Confidence area */}
            {getChartData().filter(d => d.isFuture).map((point, i) => {
              const x = (i + 72) * 4.8;
              const y = 220 - (point.predictedCalls * 2);
              const confidence = point.confidence * 20;
              
              return (
                <g key={i}>
                  <rect
                    x={x - 2}
                    y={y - confidence}
                    width="4"
                    height={confidence * 2}
                    fill="#10b981"
                    fillOpacity="0.2"
                  />
                </g>
              );
            })}

            {/* Current time indicator */}
            <line 
              x1="345.6" 
              y1="20" 
              x2="345.6" 
              y2="220" 
              stroke="#ef4444" 
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            <text 
              x="345.6" 
              y="15" 
              textAnchor="middle" 
              fontSize="10" 
              fill="#ef4444"
              fontWeight="bold"
            >
              Сейчас
            </text>
          </svg>
        </div>
      </div>

      {/* Manual Adjustments Table */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ручные корректировки</h3>
        
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Интервал</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Прогноз</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Корректировка</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Итого</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Агентов</th>
              </tr>
            </thead>
            <tbody>
              {getChartData().filter(d => d.isFuture).slice(0, 10).map((item, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="px-4 py-2 text-sm">
                    {new Date(item.timestamp).toLocaleDateString('ru', { 
                      day: '2-digit', 
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-2 text-sm">{item.predictedCalls}</td>
                  <td className="px-4 py-2">
                    <input 
                      type="number" 
                      defaultValue="0"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">{item.predictedCalls}</td>
                  <td className="px-4 py-2 text-sm text-blue-600">{item.requiredAgents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Последнее обновление: {new Date().toLocaleString('ru')}
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
              📤 Экспорт
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
              💾 Сохранить прогноз
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastingInterface;