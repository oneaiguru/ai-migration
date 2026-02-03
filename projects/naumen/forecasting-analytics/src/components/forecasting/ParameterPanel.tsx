// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/ParameterPanel.tsx
import React, { useState, useEffect } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface AlgorithmParameter {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean' | 'range';
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: any; label: string; description?: string }[];
  description?: string;
  tooltip?: string;
  validation?: (value: any) => string | null;
  dependent?: string; // Parameter depends on another parameter
}

interface AlgorithmConfig {
  id: string;
  name: string;
  parameters: AlgorithmParameter[];
}

interface ParameterPanelProps {
  selectedAlgorithm: string;
  parameters: Record<string, any>;
  onParameterChange: (key: string, value: any) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  loading?: boolean;
  disabled?: boolean;
}

// ========================
// PARAMETER PANEL COMPONENT
// ========================

const ParameterPanel: React.FC<ParameterPanelProps> = ({
  selectedAlgorithm,
  parameters,
  onParameterChange,
  onValidationChange,
  loading = false,
  disabled = false
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [expandedTooltips, setExpandedTooltips] = useState<Record<string, boolean>>({});

  const algorithmConfigs: AlgorithmConfig[] = [
    {
      id: 'basic_extrapolation',
      name: 'Базовая экстраполяция',
      parameters: [
        {
          key: 'historical_weeks',
          label: 'Недель истории',
          type: 'number',
          defaultValue: 4,
          min: 1,
          max: 12,
          step: 1,
          description: 'Количество недель исторических данных для анализа',
          tooltip: 'Чем больше недель, тем стабильнее прогноз, но медленнее адаптация к изменениям',
          validation: (value) => {
            if (value < 1) return 'Минимум 1 неделя';
            if (value > 12) return 'Максимум 12 недель';
            return null;
          }
        },
        {
          key: 'seasonal_factor',
          label: 'Сезонный фактор',
          type: 'range',
          defaultValue: 1.0,
          min: 0.5,
          max: 2.0,
          step: 0.1,
          description: 'Коэффициент влияния сезонности',
          tooltip: 'Увеличьте для усиления сезонных колебаний, уменьшите для их сглаживания'
        },
        {
          key: 'trend_smoothing',
          label: 'Сглаживание тренда',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { value: 'low', label: 'Низкое', description: 'Сохраняет все колебания' },
            { value: 'medium', label: 'Среднее', description: 'Баланс между точностью и стабильностью' },
            { value: 'high', label: 'Высокое', description: 'Максимальное сглаживание' }
          ],
          description: 'Уровень сглаживания исторических данных'
        }
      ]
    },
    {
      id: 'arima',
      name: 'ARIMA модель',
      parameters: [
        {
          key: 'p',
          label: 'AR компонент (p)',
          type: 'number',
          defaultValue: 1,
          min: 0,
          max: 5,
          step: 1,
          description: 'Порядок авторегрессионной части',
          tooltip: 'Количество лагов в авторегрессионной части модели'
        },
        {
          key: 'd',
          label: 'Разности (d)',
          type: 'number',
          defaultValue: 1,
          min: 0,
          max: 2,
          step: 1,
          description: 'Степень разностей для стационарности',
          tooltip: 'Количество разностей для приведения ряда к стационарному виду'
        },
        {
          key: 'q',
          label: 'MA компонент (q)',
          type: 'number',
          defaultValue: 1,
          min: 0,
          max: 5,
          step: 1,
          description: 'Порядок скользящего среднего',
          tooltip: 'Количество лагов в части скользящего среднего'
        },
        {
          key: 'auto_params',
          label: 'Автоматический подбор параметров',
          type: 'boolean',
          defaultValue: true,
          description: 'Использовать автоматический подбор оптимальных параметров',
          tooltip: 'При включении p, d, q будут подобраны автоматически для максимальной точности'
        },
        {
          key: 'seasonal_periods',
          label: 'Сезонные периоды',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { value: 'auto', label: 'Автоматически' },
            { value: '24', label: '24 часа' },
            { value: '168', label: '7 дней' },
            { value: '720', label: '30 дней' }
          ],
          description: 'Период сезонности данных'
        }
      ]
    },
    {
      id: 'linear_regression',
      name: 'Линейная регрессия',
      parameters: [
        {
          key: 'trend_strength',
          label: 'Сила тренда',
          type: 'range',
          defaultValue: 0.5,
          min: 0.1,
          max: 1.0,
          step: 0.1,
          description: 'Влияние линейного тренда на прогноз',
          tooltip: 'Высокие значения усиливают влияние долгосрочного тренда'
        },
        {
          key: 'include_seasonality',
          label: 'Учитывать сезонность',
          type: 'boolean',
          defaultValue: true,
          description: 'Включить сезонные компоненты в модель'
        },
        {
          key: 'polynomial_degree',
          label: 'Степень полинома',
          type: 'select',
          defaultValue: '1',
          options: [
            { value: '1', label: 'Линейная (1)', description: 'Простая линейная зависимость' },
            { value: '2', label: 'Квадратичная (2)', description: 'Учитывает ускорение тренда' },
            { value: '3', label: 'Кубическая (3)', description: 'Сложные нелинейные тренды' }
          ],
          description: 'Степень полиномиальной регрессии',
          dependent: 'trend_strength'
        },
        {
          key: 'confidence_interval',
          label: 'Доверительный интервал',
          type: 'select',
          defaultValue: '95',
          options: [
            { value: '90', label: '90%' },
            { value: '95', label: '95%' },
            { value: '99', label: '99%' }
          ],
          description: 'Уровень доверительного интервала прогноза'
        }
      ]
    },
    {
      id: 'seasonal_naive',
      name: 'Сезонная наивная',
      parameters: [
        {
          key: 'season_length',
          label: 'Длина сезона',
          type: 'select',
          defaultValue: '7',
          options: [
            { value: '1', label: '1 день (24 часа)' },
            { value: '7', label: '7 дней (неделя)' },
            { value: '30', label: '30 дней (месяц)' }
          ],
          description: 'Период повторения сезонного паттерна'
        },
        {
          key: 'lag_adjustments',
          label: 'Корректировка лагов',
          type: 'boolean',
          defaultValue: false,
          description: 'Применить корректировку для компенсации задержек'
        },
        {
          key: 'drift_correction',
          label: 'Коррекция дрифта',
          type: 'range',
          defaultValue: 0.0,
          min: -0.5,
          max: 0.5,
          step: 0.05,
          description: 'Корректировка для долгосрочных изменений',
          tooltip: 'Положительные значения компенсируют рост, отрицательные - снижение'
        },
        {
          key: 'outlier_detection',
          label: 'Обнаружение выбросов',
          type: 'boolean',
          defaultValue: true,
          description: 'Автоматически исключать аномальные значения'
        }
      ]
    }
  ];

  const currentConfig = algorithmConfigs.find(config => config.id === selectedAlgorithm);

  // Validate parameters when they change
  useEffect(() => {
    if (!currentConfig) return;

    const errors: Record<string, string> = {};
    
    currentConfig.parameters.forEach(param => {
      if (param.validation) {
        const value = parameters[param.key] ?? param.defaultValue;
        const error = param.validation(value);
        if (error) {
          errors[param.key] = error;
        }
      }
    });

    setValidationErrors(errors);
    
    if (onValidationChange) {
      onValidationChange(Object.keys(errors).length === 0, errors);
    }
  }, [parameters, selectedAlgorithm, currentConfig, onValidationChange]);

  const handleParameterChange = (key: string, value: any) => {
    onParameterChange(key, value);
  };

  const toggleTooltip = (key: string) => {
    setExpandedTooltips(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderParameterInput = (param: AlgorithmParameter) => {
    const value = parameters[param.key] ?? param.defaultValue;
    const hasError = validationErrors[param.key];
    const isDisabled = disabled || loading || (param.dependent && !parameters[param.dependent]);

    switch (param.type) {
      case 'number':
        return (
          <input
            type="number"
            min={param.min}
            max={param.max}
            step={param.step}
            value={value}
            onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value))}
            disabled={isDisabled}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
        );

      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={value}
              onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value))}
              disabled={isDisabled}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{param.min}</span>
              <span className="font-medium text-blue-600">{value}</span>
              <span>{param.max}</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            disabled={isDisabled}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
              hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value} title={option.description}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleParameterChange(param.key, e.target.checked)}
              disabled={isDisabled}
              className={`text-blue-600 focus:ring-blue-500 ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
              Включить
            </span>
          </label>
        );

      default:
        return null;
    }
  };

  if (!currentConfig) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚙️</div>
          <div>Выберите алгоритм для настройки параметров</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Параметры: {currentConfig.name}
        </h3>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Применение...
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {currentConfig.parameters.map((param) => {
          const hasError = validationErrors[param.key];
          const isTooltipExpanded = expandedTooltips[param.key];
          
          return (
            <div key={param.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  {param.label}
                  {param.tooltip && (
                    <button
                      type="button"
                      onClick={() => toggleTooltip(param.key)}
                      className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </label>
                
                {param.dependent && !parameters[param.dependent] && (
                  <span className="text-xs text-gray-400">
                    Зависит от {param.dependent}
                  </span>
                )}
              </div>

              {renderParameterInput(param)}

              {hasError && (
                <div className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {hasError}
                </div>
              )}

              {param.description && (
                <div className="text-xs text-gray-500">{param.description}</div>
              )}

              {param.tooltip && isTooltipExpanded && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">{param.tooltip}</div>
                </div>
              )}

              {/* Show option descriptions for select inputs */}
              {param.type === 'select' && param.options && (
                <div className="text-xs text-gray-500">
                  {param.options.find(opt => opt.value === (parameters[param.key] ?? param.defaultValue))?.description}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset to defaults button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            currentConfig.parameters.forEach(param => {
              onParameterChange(param.key, param.defaultValue);
            });
          }}
          disabled={disabled || loading}
          className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50"
        >
          🔄 Сбросить к значениям по умолчанию
        </button>
      </div>

      {/* Validation summary */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">
            <div className="font-medium mb-1">Обнаружены ошибки в параметрах:</div>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(validationErrors).map(([key, error]) => (
                <li key={key}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterPanel;