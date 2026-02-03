// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/AlgorithmSelector.tsx
import React, { useState } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface AlgorithmConfig {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  complexity: 'low' | 'medium' | 'high';
  processingTime: string;
  bestFor: string[];
}

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithmId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

// ========================
// ALGORITHM SELECTOR COMPONENT
// ========================

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
  loading = false,
  disabled = false
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const algorithms: AlgorithmConfig[] = [
    {
      id: 'basic_extrapolation',
      name: 'Базовая экстраполяция',
      description: 'Простое прогнозирование на основе исторических трендов',
      accuracy: 84.2,
      complexity: 'low',
      processingTime: '< 1 мин',
      bestFor: ['Стабильные паттерны', 'Быстрый результат', 'Первичный анализ']
    },
    {
      id: 'arima',
      name: 'ARIMA модель',
      description: 'Автоматическая регрессивная интегрированная модель скользящего среднего',
      accuracy: 91.5,
      complexity: 'high',
      processingTime: '3-5 мин',
      bestFor: ['Сложные временные ряды', 'Высокая точность', 'Долгосрочные прогнозы']
    },
    {
      id: 'linear_regression',
      name: 'Линейная регрессия',
      description: 'Прогнозирование с использованием линейных трендов',
      accuracy: 78.8,
      complexity: 'medium',
      processingTime: '1-2 мин',
      bestFor: ['Линейные тренды', 'Средняя сложность', 'Хорошая интерпретируемость']
    },
    {
      id: 'seasonal_naive',
      name: 'Сезонная наивная',
      description: 'Простое повторение сезонных паттернов',
      accuracy: 76.3,
      complexity: 'low',
      processingTime: '< 30 сек',
      bestFor: ['Сильная сезонность', 'Быстрые расчёты', 'Базовый прогноз']
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'Низкая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      default: return 'Неизвестно';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-blue-600';
    if (accuracy >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Алгоритм прогнозирования</h3>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Анализ...
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {algorithms.map((algorithm) => {
          const isSelected = selectedAlgorithm === algorithm.id;
          const isDetailsShown = showDetails === algorithm.id;
          
          return (
            <div key={algorithm.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <label 
                className={`flex items-start gap-3 cursor-pointer p-4 transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="algorithm"
                  value={algorithm.id}
                  checked={isSelected}
                  onChange={(e) => !disabled && onAlgorithmChange(e.target.value)}
                  disabled={disabled || loading}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{algorithm.name}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getAccuracyColor(algorithm.accuracy)}`}>
                        {algorithm.accuracy}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDetails(isDetailsShown ? null : algorithm.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${isDetailsShown ? 'rotate-180' : ''}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-1">{algorithm.description}</div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(algorithm.complexity)}`}>
                      {getComplexityText(algorithm.complexity)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ⏱️ {algorithm.processingTime}
                    </span>
                  </div>
                </div>
              </label>
              
              {/* Expanded Details */}
              {isDetailsShown && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Лучше всего подходит для:</h4>
                    <div className="space-y-1">
                      {algorithm.bestFor.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Точность:</span>
                        <span className={`ml-2 font-medium ${getAccuracyColor(algorithm.accuracy)}`}>
                          {algorithm.accuracy}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Время расчёта:</span>
                        <span className="ml-2 font-medium text-gray-900">{algorithm.processingTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Algorithm Comparison */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Рекомендация</h4>
        <div className="text-sm text-blue-800">
          {selectedAlgorithm === 'arima' && 
            "ARIMA обеспечивает наивысшую точность, но требует больше времени на расчёт."}
          {selectedAlgorithm === 'basic_extrapolation' && 
            "Базовая экстраполяция подходит для быстрого получения результатов при стабильных паттернах."}
          {selectedAlgorithm === 'linear_regression' && 
            "Линейная регрессия хорошо подходит для данных с выраженными трендами."}
          {selectedAlgorithm === 'seasonal_naive' && 
            "Сезонная наивная модель идеальна для данных с сильной повторяющейся сезонностью."}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button 
          className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          onClick={() => {
            // Show algorithm comparison modal
            console.log('Show algorithm comparison');
          }}
        >
          📊 Сравнить алгоритмы
        </button>
        <button 
          className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={() => {
            // Show algorithm documentation
            console.log('Show documentation');
          }}
        >
          📖 Документация
        </button>
      </div>
    </div>
  );
};

export default AlgorithmSelector;