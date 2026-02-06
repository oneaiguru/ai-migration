import React, { useState, useEffect } from 'react';

interface ExchangeFiltersProps {
  onFiltersChange: (filters: ExchangeFilters) => void;
  availableTeams: string[];
  className?: string;
}

interface ExchangeFilters {
  dateRange: {
    start: string;
    end: string;
  };
  shiftTypes: string[];
  teams: string[];
  timeSlots: string[];
  onlyMySkills: boolean;
  urgentOnly: boolean;
  exchangeTypes: string[];
  search: string;
}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

const ExchangeFilters: React.FC<ExchangeFiltersProps> = ({
  onFiltersChange,
  availableTeams,
  className = ''
}) => {
  const [filters, setFilters] = useState<ExchangeFilters>({
    dateRange: {
      start: '',
      end: ''
    },
    shiftTypes: [],
    teams: [],
    timeSlots: [],
    onlyMySkills: false,
    urgentOnly: false,
    exchangeTypes: [],
    search: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const shiftTypeOptions: FilterOption[] = [
    { id: 'regular', label: 'Обычная смена', count: 24 },
    { id: 'overtime', label: 'Сверхурочная', count: 8 },
    { id: 'training', label: 'Обучение', count: 3 },
    { id: 'night', label: 'Ночная смена', count: 12 },
    { id: 'holiday', label: 'Праздничная', count: 2 }
  ];

  const timeSlotOptions: FilterOption[] = [
    { id: 'morning', label: 'Утром (08:00-12:00)', count: 15 },
    { id: 'day', label: 'Днем (12:00-18:00)', count: 20 },
    { id: 'evening', label: 'Вечером (18:00-23:00)', count: 18 },
    { id: 'night', label: 'Ночью (23:00-08:00)', count: 12 }
  ];

  const exchangeTypeOptions: FilterOption[] = [
    { id: 'any_shift', label: 'Любая смена', count: 35 },
    { id: 'specific_date', label: 'Конкретная дата', count: 12 },
    { id: 'specific_shift', label: 'Конкретная смена', count: 8 },
    { id: 'flexible', label: 'Гибкий обмен', count: 14 }
  ];

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.shiftTypes.length > 0) count++;
    if (filters.teams.length > 0) count++;
    if (filters.timeSlots.length > 0) count++;
    if (filters.exchangeTypes.length > 0) count++;
    if (filters.onlyMySkills) count++;
    if (filters.urgentOnly) count++;
    if (filters.search.trim()) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (updates: Partial<ExchangeFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayFilter = (filterKey: keyof ExchangeFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterKey] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [filterKey]: newArray };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      shiftTypes: [],
      teams: [],
      timeSlots: [],
      onlyMySkills: false,
      urgentOnly: false,
      exchangeTypes: [],
      search: ''
    });
  };

  const getDateRangePresets = () => [
    {
      label: 'Сегодня',
      action: () => {
        const today = new Date().toISOString().split('T')[0];
        updateFilters({ dateRange: { start: today, end: today } });
      }
    },
    {
      label: 'Эта неделя',
      action: () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
        updateFilters({
          dateRange: {
            start: startOfWeek.toISOString().split('T')[0],
            end: endOfWeek.toISOString().split('T')[0]
          }
        });
      }
    },
    {
      label: 'Следующие 7 дней',
      action: () => {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        updateFilters({
          dateRange: {
            start: today.toISOString().split('T')[0],
            end: nextWeek.toISOString().split('T')[0]
          }
        });
      }
    }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-900">Фильтры</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Очистить все
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Поиск по сотруднику, причине или команде..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Период смен
            </label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="От"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="До"
              />
            </div>
            
            {/* Date Presets */}
            <div className="flex flex-wrap gap-2">
              {getDateRangePresets().map((preset, index) => (
                <button
                  key={index}
                  onClick={preset.action}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shift Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип смены
            </label>
            <div className="space-y-2">
              {shiftTypeOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.shiftTypes.includes(option.id)}
                    onChange={() => toggleArrayFilter('shiftTypes', option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                  {option.count && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Время смены
            </label>
            <div className="space-y-2">
              {timeSlotOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.timeSlots.includes(option.id)}
                    onChange={() => toggleArrayFilter('timeSlots', option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                  {option.count && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Команды
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableTeams.map((team) => (
                <label key={team} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.teams.includes(team)}
                    onChange={() => toggleArrayFilter('teams', team)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{team}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exchange Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип обмена
            </label>
            <div className="space-y-2">
              {exchangeTypeOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.exchangeTypes.includes(option.id)}
                    onChange={() => toggleArrayFilter('exchangeTypes', option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                  {option.count && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Быстрые фильтры
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.onlyMySkills}
                  onChange={(e) => updateFilters({ onlyMySkills: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Только смены по моим навыкам</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.urgentOnly}
                  onChange={(e) => updateFilters({ urgentOnly: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Только срочные предложения</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && !isExpanded && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Поиск: "{filters.search}"
                <button
                  onClick={() => updateFilters({ search: '' })}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.shiftTypes.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Типы смен: {filters.shiftTypes.length}
                <button
                  onClick={() => updateFilters({ shiftTypes: [] })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.teams.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Команды: {filters.teams.length}
                <button
                  onClick={() => updateFilters({ teams: [] })}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            
            {(filters.dateRange.start || filters.dateRange.end) && (
              <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                Даты
                <button
                  onClick={() => updateFilters({ dateRange: { start: '', end: '' } })}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeFilters;