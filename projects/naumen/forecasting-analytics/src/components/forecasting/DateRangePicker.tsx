// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/DateRangePicker.tsx
import React, { useState, useEffect } from 'react';

// ========================
// TYPE DEFINITIONS
// ========================

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePreset {
  id: string;
  label: string;
  range: () => DateRange;
  description?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  loading?: boolean;
  presets?: DateRangePreset[];
  showPresets?: boolean;
  showTimeInputs?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

// ========================
// DATE RANGE PICKER COMPONENT
// ========================

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  loading = false,
  presets,
  showPresets = true,
  showTimeInputs = false,
  onValidationChange
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const defaultPresets: DateRangePreset[] = presets || [
    {
      id: 'today',
      label: 'Сегодня',
      range: () => {
        const today = new Date();
        return { start: today, end: today };
      },
      description: 'Прогноз на текущий день'
    },
    {
      id: 'tomorrow',
      label: 'Завтра',
      range: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { start: tomorrow, end: tomorrow };
      },
      description: 'Прогноз на завтра'
    },
    {
      id: 'week',
      label: 'Эта неделя',
      range: () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Sunday
        return { start, end };
      },
      description: 'Прогноз на текущую неделю'
    },
    {
      id: 'next_week',
      label: 'Следующая неделя',
      range: () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay() + 8); // Next Monday
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // Next Sunday
        return { start, end };
      },
      description: 'Прогноз на следующую неделю'
    },
    {
      id: 'month',
      label: 'Этот месяц',
      range: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { start, end };
      },
      description: 'Прогноз на текущий месяц'
    },
    {
      id: 'next_month',
      label: 'Следующий месяц',
      range: () => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        return { start, end };
      },
      description: 'Прогноз на следующий месяц'
    },
    {
      id: 'custom_7_days',
      label: '7 дней вперёд',
      range: () => {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + 6);
        return { start, end };
      },
      description: 'Прогноз на ближайшие 7 дней'
    },
    {
      id: 'custom_14_days',
      label: '14 дней вперёд',
      range: () => {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + 13);
        return { start, end };
      },
      description: 'Прогноз на ближайшие 2 недели'
    }
  ];

  // Validate date range
  useEffect(() => {
    let error = '';
    
    if (value.start > value.end) {
      error = 'Дата начала не может быть позже даты окончания';
    } else if (minDate && value.start < minDate) {
      error = `Дата начала не может быть ранее ${formatDate(minDate)}`;
    } else if (maxDate && value.end > maxDate) {
      error = `Дата окончания не может быть позднее ${formatDate(maxDate)}`;
    } else {
      // Check if range is too long (more than 90 days)
      const diffTime = Math.abs(value.end.getTime() - value.start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 90) {
        error = 'Период прогноза не может превышать 90 дней';
      }
    }
    
    setValidationError(error);
    
    if (onValidationChange) {
      onValidationChange(error === '', error);
    }
  }, [value, minDate, maxDate, onValidationChange]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = preset.range();
    onChange(range);
    setSelectedPreset(preset.id);
  };

  const handleStartDateChange = (dateString: string) => {
    const newStart = new Date(dateString);
    onChange({ ...value, start: newStart });
    setSelectedPreset(null);
  };

  const handleEndDateChange = (dateString: string) => {
    const newEnd = new Date(dateString);
    onChange({ ...value, end: newEnd });
    setSelectedPreset(null);
  };

  const getDaysDifference = (): number => {
    const diffTime = Math.abs(value.end.getTime() - value.start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getWeekdaysCount = (): number => {
    let count = 0;
    const current = new Date(value.start);
    
    while (current <= value.end) {
      if (!isWeekend(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Период прогноза</h3>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Обновление...
          </div>
        )}
      </div>

      {/* Quick Presets */}
      {showPresets && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Быстрый выбор</h4>
          <div className="grid grid-cols-2 gap-2">
            {defaultPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                disabled={disabled || loading}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  selectedPreset === preset.id
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Date Range */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Произвольный период</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата начала
            </label>
            <input
              type="date"
              value={formatDateForInput(value.start)}
              onChange={(e) => handleStartDateChange(e.target.value)}
              min={minDate ? formatDateForInput(minDate) : undefined}
              max={maxDate ? formatDateForInput(maxDate) : undefined}
              disabled={disabled || loading}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
                validationError && validationError.includes('начала') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата окончания
            </label>
            <input
              type="date"
              value={formatDateForInput(value.end)}
              onChange={(e) => handleEndDateChange(e.target.value)}
              min={minDate ? formatDateForInput(minDate) : undefined}
              max={maxDate ? formatDateForInput(maxDate) : undefined}
              disabled={disabled || loading}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
                validationError && validationError.includes('окончания') 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } ${disabled || loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* Time inputs if enabled */}
        {showTimeInputs && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Время начала
              </label>
              <input
                type="time"
                defaultValue="00:00"
                disabled={disabled || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Время окончания
              </label>
              <input
                type="time"
                defaultValue="23:59"
                disabled={disabled || loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </div>
        </div>
      )}

      {/* Range Information */}
      {!validationError && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Информация о периоде:</div>
            <div className="space-y-1">
              <div>📅 Период: {formatDate(value.start)} — {formatDate(value.end)}</div>
              <div>🗓️ Всего дней: {getDaysDifference()}</div>
              <div>👔 Рабочих дней: {getWeekdaysCount()}</div>
              <div>📊 Интервалов (30 мин): {getDaysDifference() * 48}</div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={false}
                disabled={disabled || loading}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600">Исключить выходные</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={true}
                disabled={disabled || loading}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-600">Учитывать праздники</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              const today = new Date();
              const weekFromNow = new Date();
              weekFromNow.setDate(today.getDate() + 7);
              onChange({ start: today, end: weekFromNow });
              setSelectedPreset(null);
            }}
            disabled={disabled || loading}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none disabled:opacity-50"
          >
            🔄 По умолчанию
          </button>
        </div>
      </div>

      {/* Extended Period Warning */}
      {getDaysDifference() > 30 && !validationError && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium">Внимание: долгосрочный прогноз</div>
              <div>Прогнозы на период более 30 дней могут быть менее точными. Рекомендуется использовать ARIMA модель для долгосрочного планирования.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;