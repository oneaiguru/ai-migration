import React, { useState } from 'react';
import { 
  PlusIcon, 
  DatabaseIcon, 
  BarChartIcon, 
  LineChartIcon, 
  PieChartIcon, 
  TableIcon,
  GaugeIcon,
  SettingsIcon,
  SaveIcon,
  EyeIcon
} from 'lucide-react';
import { CustomReport, ReportParameter } from '../../types';

interface CustomReportBuilderProps {
  onSave?: (report: CustomReport) => void;
  onPreview?: (report: CustomReport) => void;
}

export const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({
  onSave,
  onPreview
}) => {
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'pie' | 'table' | 'gauge'>('bar');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportParameter[]>([]);

  const dataSources = [
    { id: 'schedule', name: 'Данные расписания', icon: DatabaseIcon },
    { id: 'forecast', name: 'Прогнозы', icon: DatabaseIcon },
    { id: 'employees', name: 'Сотрудники', icon: DatabaseIcon },
    { id: 'requests', name: 'Заявки', icon: DatabaseIcon }
  ];

  const chartTypes = [
    { id: 'line', name: 'Линейный график', icon: LineChartIcon },
    { id: 'bar', name: 'Столбчатая диаграмма', icon: BarChartIcon },
    { id: 'pie', name: 'Круговая диаграмма', icon: PieChartIcon },
    { id: 'table', name: 'Таблица', icon: TableIcon },
    { id: 'gauge', name: 'Индикатор', icon: GaugeIcon }
  ];

  const availableColumns = {
    schedule: ['date', 'employee_id', 'shift_start', 'shift_end', 'adherence_rate', 'coverage'],
    forecast: ['date', 'predicted_volume', 'actual_volume', 'accuracy', 'mape'],
    employees: ['employee_id', 'name', 'department', 'utilization_rate', 'performance_score'],
    requests: ['request_id', 'type', 'status', 'created_date', 'response_time']
  };

  const addFilter = () => {
    const newFilter: ReportParameter = {
      id: `filter_${Date.now()}`,
      name: '',
      type: 'date',
      required: false
    };
    setFilters([...filters, newFilter]);
  };

  const updateFilter = (index: number, field: keyof ReportParameter, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const toggleColumn = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter(col => col !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const generateReport = (): CustomReport => {
    return {
      id: `custom_${Date.now()}`,
      name: reportName,
      description: reportDescription,
      createdBy: 'Текущий пользователь',
      createdAt: new Date(),
      config: {
        dataSource: selectedDataSource,
        chartType: selectedChartType,
        filters,
        columns: selectedColumns,
        aggregations: {}
      }
    };
  };

  const handleSave = () => {
    const report = generateReport();
    onSave?.(report);
  };

  const handlePreview = () => {
    const report = generateReport();
    onPreview?.(report);
  };

  const isValid = reportName && selectedDataSource && (selectedColumns.length > 0 || selectedChartType === 'gauge');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Конструктор отчетов</h2>
            <p className="text-sm text-gray-500 mt-1">Создайте пользовательский отчет для вашей команды</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePreview}
              disabled={!isValid}
              className="btn-secondary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <EyeIcon className="w-4 h-4" />
              <span>Предпросмотр</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SaveIcon className="w-4 h-4" />
              <span>Сохранить</span>
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название отчета *
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите название отчета"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <input
              type="text"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Краткое описание отчета"
            />
          </div>
        </div>
      </div>

      {/* Data Source Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Источник данных *</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dataSources.map((source) => {
            const IconComponent = source.icon;
            return (
              <button
                key={source.id}
                onClick={() => setSelectedDataSource(source.id)}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  selectedDataSource === source.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <IconComponent className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">{source.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Тип визуализации *</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {chartTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedChartType(type.id as any)}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  selectedChartType === type.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <IconComponent className="w-6 h-6 mx-auto mb-1" />
                <p className="text-xs font-medium">{type.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Column Selection */}
      {selectedDataSource && selectedChartType !== 'gauge' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Поля данных *</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableColumns[selectedDataSource as keyof typeof availableColumns]?.map((column) => (
              <label key={column} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Фильтры</h3>
          <button
            onClick={addFilter}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Добавить фильтр</span>
          </button>
        </div>

        {filters.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Фильтры не добавлены. Нажмите "Добавить фильтр" для создания условий отбора данных.
          </p>
        ) : (
          <div className="space-y-4">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Название фильтра"
                  value={filter.name}
                  onChange={(e) => updateFilter(index, 'name', e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={filter.type}
                  onChange={(e) => updateFilter(index, 'type', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="date">Дата</option>
                  <option value="dateRange">Диапазон дат</option>
                  <option value="select">Выбор</option>
                  <option value="number">Число</option>
                  <option value="text">Текст</option>
                </select>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={filter.required}
                    onChange={(e) => updateFilter(index, 'required', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Обязательный</span>
                </label>
                <button
                  onClick={() => removeFilter(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview */}
      {isValid && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            Конфигурация отчета
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Название:</span>
                <span className="ml-2 text-gray-900">{reportName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Источник данных:</span>
                <span className="ml-2 text-gray-900">
                  {dataSources.find(ds => ds.id === selectedDataSource)?.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Тип визуализации:</span>
                <span className="ml-2 text-gray-900">
                  {chartTypes.find(ct => ct.id === selectedChartType)?.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Поля:</span>
                <span className="ml-2 text-gray-900">{selectedColumns.length} выбрано</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};