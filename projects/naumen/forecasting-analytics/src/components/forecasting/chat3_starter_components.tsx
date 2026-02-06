import React, { useState, useEffect } from 'react';

// Foundation starter components for Chat 3 - Forecasting & Analytics
// These establish the coding patterns and visual style for the entire module

// ========================
// TYPE DEFINITIONS
// ========================

interface ForecastData {
  timestamp: string;
  predicted: number;
  actual?: number;
  confidence: number;
  adjustments?: number;
}

interface AlgorithmConfig {
  id: string;
  name: string;
  description: string;
  parameters: AlgorithmParameter[];
}

interface AlgorithmParameter {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  defaultValue: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
}

interface ForecastingState {
  selectedAlgorithm: string;
  parameters: Record<string, any>;
  dateRange: { start: Date; end: Date };
  selectedChannels: string[];
  forecastData: ForecastData[];
  loading: boolean;
  error: string | null;
  accuracy: number;
}

// ========================
// MAIN LAYOUT COMPONENT
// ========================

const ForecastingLayout: React.FC = () => {
  const [state, setState] = useState<ForecastingState>({
    selectedAlgorithm: 'basic_extrapolation',
    parameters: {},
    dateRange: {
      start: new Date(2024, 6, 1),
      end: new Date(2024, 6, 7)
    },
    selectedChannels: ['main'],
    forecastData: [],
    loading: false,
    error: null,
    accuracy: 84.2
  });

  const algorithms: AlgorithmConfig[] = [
    {
      id: 'basic_extrapolation',
      name: 'Базовая экстраполяция',
      description: 'Простое прогнозирование на основе исторических трендов',
      parameters: [
        { key: 'historical_weeks', label: 'Недель истории', type: 'number', defaultValue: 4, min: 1, max: 12 },
        { key: 'seasonal_factor', label: 'Сезонный фактор', type: 'number', defaultValue: 1.0, min: 0.5, max: 2.0 }
      ]
    },
    {
      id: 'arima',
      name: 'ARIMA модель',
      description: 'Автоматическая регрессивная интегрированная модель скользящего среднего',
      parameters: [
        { key: 'p', label: 'AR компонент (p)', type: 'number', defaultValue: 1, min: 0, max: 5 },
        { key: 'd', label: 'Разности (d)', type: 'number', defaultValue: 1, min: 0, max: 2 },
        { key: 'q', label: 'MA компонент (q)', type: 'number', defaultValue: 1, min: 0, max: 5 }
      ]
    },
    {
      id: 'linear_regression',
      name: 'Линейная регрессия',
      description: 'Прогнозирование с использованием линейных трендов',
      parameters: [
        { key: 'trend_strength', label: 'Сила тренда', type: 'number', defaultValue: 0.5, min: 0.1, max: 1.0 }
      ]
    },
    {
      id: 'seasonal_naive',
      name: 'Сезонная наивная',
      description: 'Простое повторение сезонных паттернов',
      parameters: [
        { key: 'season_length', label: 'Длина сезона (дни)', type: 'number', defaultValue: 7, min: 1, max: 30 }
      ]
    }
  ];

  const handleAlgorithmChange = (algorithmId: string) => {
    const algorithm = algorithms.find(a => a.id === algorithmId);
    if (algorithm) {
      const defaultParams = algorithm.parameters.reduce((acc, param) => {
        acc[param.key] = param.defaultValue;
        return acc;
      }, {} as Record<string, any>);

      setState(prev => ({
        ...prev,
        selectedAlgorithm: algorithmId,
        parameters: defaultParams
      }));
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const handleGenerateForecast = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Simulate API call to math engine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock forecast data
      const mockData = generateMockForecastData(state.dateRange, state.selectedAlgorithm);
      
      setState(prev => ({
        ...prev,
        forecastData: mockData,
        loading: false,
        accuracy: 80 + Math.random() * 15 // Random accuracy between 80-95%
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Ошибка при генерации прогноза'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Построить прогноз</h1>
              <p className="text-sm text-gray-600 mt-1">
                Инвентаризация-2 • Точность: {state.accuracy.toFixed(1)}%
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateForecast}
                disabled={state.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {state.loading ? (
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Algorithm & Parameters */}
          <aside className="w-80">
            <AlgorithmSelector
              algorithms={algorithms}
              selectedAlgorithm={state.selectedAlgorithm}
              onAlgorithmChange={handleAlgorithmChange}
            />
            
            <ParameterPanel
              algorithm={algorithms.find(a => a.id === state.selectedAlgorithm)}
              parameters={state.parameters}
              onParameterChange={handleParameterChange}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Metrics Cards */}
            <MetricsCards forecastData={state.forecastData} accuracy={state.accuracy} />
            
            {/* Chart Area */}
            <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
              <ChartPlaceholder 
                data={state.forecastData} 
                loading={state.loading}
                error={state.error}
              />
            </div>
            
            {/* Adjustment Table */}
            <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
              <AdjustmentTablePlaceholder data={state.forecastData} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// ========================
// ALGORITHM SELECTOR
// ========================

interface AlgorithmSelectorProps {
  algorithms: AlgorithmConfig[];
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithmId: string) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  algorithms,
  selectedAlgorithm,
  onAlgorithmChange
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Алгоритм прогнозирования</h3>
      
      <div className="space-y-3">
        {algorithms.map((algorithm) => (
          <label key={algorithm.id} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="algorithm"
              value={algorithm.id}
              checked={selectedAlgorithm === algorithm.id}
              onChange={(e) => onAlgorithmChange(e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium text-gray-900">{algorithm.name}</div>
              <div className="text-sm text-gray-600">{algorithm.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

// ========================
// PARAMETER PANEL
// ========================

interface ParameterPanelProps {
  algorithm?: AlgorithmConfig;
  parameters: Record<string, any>;
  onParameterChange: (key: string, value: any) => void;
}

const ParameterPanel: React.FC<ParameterPanelProps> = ({
  algorithm,
  parameters,
  onParameterChange
}) => {
  if (!algorithm) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Параметры</h3>
      
      <div className="space-y-4">
        {algorithm.parameters.map((param) => (
          <div key={param.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {param.label}
            </label>
            
            {param.type === 'number' && (
              <input
                type="number"
                min={param.min}
                max={param.max}
                step={param.key.includes('factor') ? 0.1 : 1}
                value={parameters[param.key] || param.defaultValue}
                onChange={(e) => onParameterChange(param.key, parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
            
            {param.type === 'select' && param.options && (
              <select
                value={parameters[param.key] || param.defaultValue}
                onChange={(e) => onParameterChange(param.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {param.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {param.type === 'boolean' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={parameters[param.key] || param.defaultValue}
                  onChange={(e) => onParameterChange(param.key, e.target.checked)}
                />
                <span className="text-sm text-gray-600">Включить</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================
// METRICS CARDS
// ========================

interface MetricsCardsProps {
  forecastData: ForecastData[];
  accuracy: number;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ forecastData, accuracy }) => {
  const totalCalls = forecastData.reduce((sum, d) => sum + d.predicted, 0);
  const avgConfidence = forecastData.length > 0 
    ? (forecastData.reduce((sum, d) => sum + d.confidence, 0) / forecastData.length) * 100
    : 0;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-blue-600">
          {totalCalls.toLocaleString()}
        </div>
        <div className="text-sm text-blue-800">Прогноз звонков</div>
        <div className="text-xs text-blue-600 mt-1">на выбранный период</div>
      </div>
      
      <div className="bg-green-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-green-600">{accuracy.toFixed(1)}%</div>
        <div className="text-sm text-green-800">Точность модели</div>
        <div className="text-xs text-green-600 mt-1">MAPE</div>
      </div>
      
      <div className="bg-orange-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-orange-600">{avgConfidence.toFixed(0)}%</div>
        <div className="text-sm text-orange-800">Уверенность</div>
        <div className="text-xs text-orange-600 mt-1">средняя</div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-purple-600">{forecastData.length}</div>
        <div className="text-sm text-purple-800">Интервалов</div>
        <div className="text-xs text-purple-600 mt-1">30-минутных</div>
      </div>
    </div>
  );
};

// ========================
// CHART PLACEHOLDER
// ========================

interface ChartPlaceholderProps {
  data: ForecastData[];
  loading: boolean;
  error: string | null;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-gray-600">Генерация прогноза...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <div className="text-lg font-medium">Область для графика</div>
        <div className="text-sm">
          {data.length > 0 
            ? `${data.length} интервалов прогноза готово к визуализации`
            : 'Выберите параметры и нажмите "Построить прогноз"'
          }
        </div>
      </div>
    </div>
  );
};

// ========================
// ADJUSTMENT TABLE PLACEHOLDER
// ========================

interface AdjustmentTablePlaceholderProps {
  data: ForecastData[];
}

const AdjustmentTablePlaceholder: React.FC<AdjustmentTablePlaceholderProps> = ({ data }) => {
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ручные корректировки</h3>
      
      {data.length > 0 ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-gray-600 text-center">
            Таблица корректировок для {data.length} интервалов
            <br />
            <small>(Будет реализована в следующих компонентах)</small>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          Сначала создайте прогноз для отображения таблицы корректировок
        </div>
      )}
    </div>
  );
};

// ========================
// MOCK DATA GENERATOR
// ========================

const generateMockForecastData = (dateRange: { start: Date; end: Date }, algorithm: string): ForecastData[] => {
  const data: ForecastData[] = [];
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  
  let current = new Date(start);
  while (current <= end) {
    for (let hour = 0; hour < 24; hour += 0.5) {
      const timestamp = new Date(current);
      timestamp.setHours(Math.floor(hour), (hour % 1) * 60);
      
      // Generate realistic call volume patterns
      let baseVolume = 20;
      const hourOfDay = Math.floor(hour);
      if (hourOfDay >= 9 && hourOfDay <= 17) baseVolume = 50;
      if (hourOfDay >= 18 && hourOfDay <= 21) baseVolume = 35;
      
      // Algorithm-specific adjustments
      let algorithmMultiplier = 1;
      if (algorithm === 'arima') algorithmMultiplier = 1.1;
      if (algorithm === 'linear_regression') algorithmMultiplier = 0.95;
      if (algorithm === 'seasonal_naive') algorithmMultiplier = 1.05;
      
      const predicted = Math.round(baseVolume * algorithmMultiplier * (0.8 + Math.random() * 0.4));
      const confidence = 0.7 + Math.random() * 0.25;
      
      data.push({
        timestamp: timestamp.toISOString(),
        predicted,
        confidence,
        adjustments: 0
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return data;
};

export default ForecastingLayout;