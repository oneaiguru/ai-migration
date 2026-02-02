// AccuracyExport.tsx - Export Performance Reports Component

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Settings } from 'lucide-react';
import { ExportOptions, AlgorithmType } from '../../../types/accuracy';

interface AccuracyExportProps {
  availableAlgorithms: { id: AlgorithmType; name: string }[];
  onExport: (options: ExportOptions) => Promise<void>;
  isExporting?: boolean;
  className?: string;
}

const AccuracyExport: React.FC<AccuracyExportProps> = ({
  availableAlgorithms,
  onExport,
  isExporting = false,
  className = ''
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    algorithms: availableAlgorithms.map(a => a.id),
    includeCharts: true,
    includeRawData: false
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Export formats with icons and descriptions
  const exportFormats = [
    {
      value: 'pdf' as const,
      label: 'PDF отчет',
      icon: <FileText className="w-4 h-4" />,
      description: 'Комплексный отчет с графиками и анализом',
      color: 'red'
    },
    {
      value: 'excel' as const,
      label: 'Excel файл',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      description: 'Детальные данные для анализа',
      color: 'green'
    },
    {
      value: 'csv' as const,
      label: 'CSV данные',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      description: 'Сырые данные для импорта',
      color: 'blue'
    },
    {
      value: 'json' as const,
      label: 'JSON данные',
      icon: <FileText className="w-4 h-4" />,
      description: 'Структурированные данные для API',
      color: 'purple'
    }
  ];

  // Time range presets
  const timeRangePresets = [
    { label: 'Последние 7 дней', days: 7 },
    { label: 'Последние 30 дней', days: 30 },
    { label: 'Последние 90 дней', days: 90 },
    { label: 'Последние 6 месяцев', days: 180 },
    { label: 'Настраиваемый период', days: 0 }
  ];

  // Handle format change
  const handleFormatChange = (format: ExportOptions['format']) => {
    setExportOptions((prev: ExportOptions) => ({ ...prev, format }));
  };

  // Handle time range preset
  const handleTimeRangePreset = (days: number) => {
    if (days === 0) return; // Custom range
    
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    setExportOptions((prev: ExportOptions) => ({
      ...prev,
      timeRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }));
  };

  // Handle algorithm selection
  const handleAlgorithmToggle = (algorithmId: AlgorithmType) => {
    setExportOptions((prev: ExportOptions) => ({
      ...prev,
      algorithms: prev.algorithms.includes(algorithmId)
        ? prev.algorithms.filter((id: AlgorithmType) => id !== algorithmId)
        : [...prev.algorithms, algorithmId]
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      await onExport(exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Get format color
  const getFormatColor = (color: string) => {
    const colors = {
      red: 'text-red-600 bg-red-50 border-red-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Экспорт отчетов</h3>
            <p className="text-sm text-gray-600">
              Создание отчетов по производительности алгоритмов
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Export Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Формат экспорта
          </label>
          <div className="grid grid-cols-2 gap-3">
            {exportFormats.map((format) => (
              <button
                key={format.value}
                onClick={() => handleFormatChange(format.value)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  exportOptions.format === format.value
                    ? getFormatColor(format.color)
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {format.icon}
                  <span className="font-medium">{format.label}</span>
                </div>
                <p className="text-xs text-gray-600">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Временной период
          </label>
          
          {/* Presets */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {timeRangePresets.slice(0, -1).map((preset) => (
              <button
                key={preset.days}
                onClick={() => handleTimeRangePreset(preset.days)}
                className="px-3 py-2 text-xs rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Начало</label>
              <input
                type="date"
                value={exportOptions.timeRange.start}
                onChange={(e) => setExportOptions((prev: ExportOptions) => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Окончание</label>
              <input
                type="date"
                value={exportOptions.timeRange.end}
                onChange={(e) => setExportOptions((prev: ExportOptions) => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Алгоритмы для включения
          </label>
          <div className="space-y-2">
            {availableAlgorithms.map((algorithm) => (
              <label
                key={algorithm.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={exportOptions.algorithms.includes(algorithm.id)}
                  onChange={() => handleAlgorithmToggle(algorithm.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{algorithm.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Дополнительные настройки
            <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCharts}
                  onChange={(e) => setExportOptions((prev: ExportOptions) => ({
                    ...prev,
                    includeCharts: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Включить графики</span>
                  <p className="text-xs text-gray-600">Добавить визуализации в отчет</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeRawData}
                  onChange={(e) => setExportOptions((prev: ExportOptions) => ({
                    ...prev,
                    includeRawData: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Включить исходные данные</span>
                  <p className="text-xs text-gray-600">Добавить таблицы с детальными данными</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Содержание отчета:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Сводка по точности ({exportOptions.algorithms.length} алгоритмов)</li>
            <li>• Метрики за период с {exportOptions.timeRange.start} по {exportOptions.timeRange.end}</li>
            {exportOptions.includeCharts && <li>• Графики и визуализации</li>}
            {exportOptions.includeRawData && <li>• Детальные таблицы данных</li>}
            <li>• Рекомендации по улучшению</li>
          </ul>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting || exportOptions.algorithms.length === 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            isExporting || exportOptions.algorithms.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Создание отчета...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Создать отчет
            </>
          )}
        </button>

        {exportOptions.algorithms.length === 0 && (
          <p className="text-xs text-red-600 text-center">
            Выберите хотя бы один алгоритм для экспорта
          </p>
        )}
      </div>
    </div>
  );
};

export default AccuracyExport;
