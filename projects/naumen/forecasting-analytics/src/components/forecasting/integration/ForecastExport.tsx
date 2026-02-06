// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/ForecastExport.tsx
import React, { useState, useCallback } from 'react';
import { Download, FileText, FileSpreadsheet, Image, Settings, Check } from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  options?: ExportOption[];
}

interface ExportOption {
  id: string;
  name: string;
  type: 'boolean' | 'select' | 'number' | 'text';
  defaultValue: any;
  options?: { value: any; label: string }[];
}

interface ForecastExportProps {
  data: any[];
  organizationName: string;
  dateRange: { start: Date; end: Date };
  onExport?: (format: string, options: Record<string, any>) => void;
  className?: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'excel',
    name: 'Excel',
    extension: 'xlsx',
    icon: FileSpreadsheet,
    description: 'Полный отчет с графиками и данными',
    options: [
      {
        id: 'includeCharts',
        name: 'Включить графики',
        type: 'boolean',
        defaultValue: true
      },
      {
        id: 'includeRawData',
        name: 'Включить исходные данные',
        type: 'boolean',
        defaultValue: true
      },
      {
        id: 'sheetLayout',
        name: 'Макет листа',
        type: 'select',
        defaultValue: 'summary',
        options: [
          { value: 'summary', label: 'Сводный отчет' },
          { value: 'detailed', label: 'Детальный отчет' },
          { value: 'separate', label: 'Отдельные листы' }
        ]
      }
    ]
  },
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    icon: FileText,
    description: 'Готовый для печати отчет',
    options: [
      {
        id: 'orientation',
        name: 'Ориентация',
        type: 'select',
        defaultValue: 'landscape',
        options: [
          { value: 'portrait', label: 'Портретная' },
          { value: 'landscape', label: 'Альбомная' }
        ]
      },
      {
        id: 'includeWatermark',
        name: 'Водяной знак',
        type: 'boolean',
        defaultValue: false
      },
      {
        id: 'pageNumbers',
        name: 'Нумерация страниц',
        type: 'boolean',
        defaultValue: true
      }
    ]
  },
  {
    id: 'csv',
    name: 'CSV',
    extension: 'csv',
    icon: FileText,
    description: 'Данные для анализа в других системах',
    options: [
      {
        id: 'delimiter',
        name: 'Разделитель',
        type: 'select',
        defaultValue: ',',
        options: [
          { value: ',', label: 'Запятая (,)' },
          { value: ';', label: 'Точка с запятой (;)' },
          { value: '\t', label: 'Табуляция' }
        ]
      },
      {
        id: 'encoding',
        name: 'Кодировка',
        type: 'select',
        defaultValue: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'windows-1251', label: 'Windows-1251' }
        ]
      }
    ]
  },
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    icon: Image,
    description: 'Изображения графиков',
    options: [
      {
        id: 'resolution',
        name: 'Разрешение',
        type: 'select',
        defaultValue: 'high',
        options: [
          { value: 'standard', label: 'Стандартное (72 DPI)' },
          { value: 'high', label: 'Высокое (150 DPI)' },
          { value: 'print', label: 'Печать (300 DPI)' }
        ]
      },
      {
        id: 'background',
        name: 'Фон',
        type: 'select',
        defaultValue: 'white',
        options: [
          { value: 'white', label: 'Белый' },
          { value: 'transparent', label: 'Прозрачный' }
        ]
      }
    ]
  }
];

const ForecastExport: React.FC<ForecastExportProps> = ({
  data,
  organizationName,
  dateRange,
  onExport,
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('excel');
  const [exportOptions, setExportOptions] = useState<Record<string, any>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize options for selected format
  React.useEffect(() => {
    const format = exportFormats.find(f => f.id === selectedFormat);
    if (format?.options) {
      const initialOptions: Record<string, any> = {};
      format.options.forEach(option => {
        initialOptions[option.id] = option.defaultValue;
      });
      setExportOptions(initialOptions);
    }
  }, [selectedFormat]);

  const handleOptionChange = useCallback((optionId: string, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [optionId]: value
    }));
  }, []);

  const simulateExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    setIsExporting(false);
    setExportProgress(0);
  };

  const handleExport = async () => {
    const format = exportFormats.find(f => f.id === selectedFormat);
    if (!format) return;

    try {
      await simulateExport();
      
      // Generate filename
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `forecast_${organizationName}_${dateStr}.${format.extension}`;
      
      // Call export handler if provided
      if (onExport) {
        onExport(selectedFormat, { ...exportOptions, filename });
      }

      // In a real implementation, trigger the actual export
      console.log('Exporting:', {
        format: selectedFormat,
        options: exportOptions,
        filename,
        data: data.length + ' records'
      });

    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const currentFormat = exportFormats.find(f => f.id === selectedFormat);

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Экспорт прогноза</h3>
          <p className="text-sm text-gray-600">
            {organizationName} • {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <Settings className="w-4 h-4 mr-1" />
          {showAdvanced ? 'Скрыть настройки' : 'Настройки'}
        </button>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Формат экспорта</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {exportFormats.map((format) => {
            const IconComponent = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`
                  p-4 border rounded-lg text-left transition-all hover:border-blue-300
                  ${selectedFormat === format.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center mb-2">
                  <IconComponent className={`
                    w-5 h-5 mr-2
                    ${selectedFormat === format.id ? 'text-blue-600' : 'text-gray-500'}
                  `} />
                  <span className="font-medium">{format.name}</span>
                  {selectedFormat === format.id && (
                    <Check className="w-4 h-4 text-blue-600 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{format.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && currentFormat?.options && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Параметры экспорта для {currentFormat.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFormat.options.map((option) => (
              <div key={option.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {option.name}
                </label>
                {option.type === 'boolean' ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions[option.id] || false}
                      onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Включить</span>
                  </label>
                ) : option.type === 'select' ? (
                  <select
                    value={exportOptions[option.id] || option.defaultValue}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {option.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={option.type}
                    value={exportOptions[option.id] || option.defaultValue}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Progress */}
      {isExporting && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Экспорт в процессе...</span>
            <span className="text-sm text-gray-600">{exportProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Export Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Что будет экспортировано:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {data.length} записей прогнозных данных</li>
          <li>• Графики трендов и анализа</li>
          <li>• Метрики точности прогнозов</li>
          <li>• Информация об организации и периоде</li>
          {exportOptions.includeRawData && <li>• Исходные данные</li>}
          {exportOptions.includeCharts && <li>• Визуализации</li>}
        </ul>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all
          ${isExporting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        <Download className="w-5 h-5 mr-2" />
        {isExporting ? 'Экспорт...' : `Экспортировать как ${currentFormat?.name}`}
      </button>
    </div>
  );
};

export default ForecastExport;
