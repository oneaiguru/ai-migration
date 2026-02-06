// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/DataImport.tsx
import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Database, AlertCircle, Check, X, Download } from 'lucide-react';

interface ImportSource {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  supportedFormats: string[];
  maxSize: string;
}

interface ImportedData {
  filename: string;
  size: number;
  rows: number;
  columns: string[];
  preview: any[];
  errors: string[];
  warnings: string[];
}

interface DataImportProps {
  onDataImported: (data: ImportedData) => void;
  onCancel?: () => void;
  className?: string;
}

const importSources: ImportSource[] = [
  {
    id: 'csv',
    name: 'CSV файл',
    icon: FileText,
    description: 'Загрузите CSV файл с историческими данными',
    supportedFormats: ['.csv', '.txt'],
    maxSize: '10 MB'
  },
  {
    id: 'excel',
    name: 'Excel файл',
    icon: FileText,
    description: 'Импорт из Excel файла (.xlsx, .xls)',
    supportedFormats: ['.xlsx', '.xls'],
    maxSize: '25 MB'
  },
  {
    id: 'database',
    name: 'База данных',
    icon: Database,
    description: 'Подключение к внешней базе данных',
    supportedFormats: ['SQL Server', 'PostgreSQL', 'MySQL'],
    maxSize: 'Без ограничений'
  }
];

const DataImport: React.FC<DataImportProps> = ({
  onDataImported,
  onCancel,
  className = ''
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('csv');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSource = importSources.find(s => s.id === selectedSource);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const simulateProcessing = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const steps = ['Загрузка файла', 'Анализ структуры', 'Валидация данных', 'Создание превью'];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingProgress((i + 1) * 25);
    }

    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const handleFile = async (file: File) => {
    if (!currentSource) return;

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (selectedSource !== 'database' && !currentSource.supportedFormats.includes(fileExtension)) {
      alert(`Неподдерживаемый формат файла. Поддерживаются: ${currentSource.supportedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = selectedSource === 'csv' ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`Файл слишком большой. Максимальный размер: ${currentSource.maxSize}`);
      return;
    }

    await simulateProcessing();

    // Simulate data parsing and validation
    const mockData: ImportedData = {
      filename: file.name,
      size: file.size,
      rows: 1547,
      columns: ['timestamp', 'calls_count', 'avg_duration', 'abandon_rate'],
      preview: [
        { timestamp: '2024-01-01 09:00', calls_count: 45, avg_duration: 185, abandon_rate: 0.12 },
        { timestamp: '2024-01-01 10:00', calls_count: 62, avg_duration: 178, abandon_rate: 0.08 },
        { timestamp: '2024-01-01 11:00', calls_count: 58, avg_duration: 192, abandon_rate: 0.15 },
        { timestamp: '2024-01-01 12:00', calls_count: 71, avg_duration: 165, abandon_rate: 0.06 },
        { timestamp: '2024-01-01 13:00', calls_count: 39, avg_duration: 201, abandon_rate: 0.18 }
      ],
      errors: [],
      warnings: [
        'Обнаружены пропущенные значения в колонке avg_duration (2 записи)',
        'Некоторые значения abandon_rate превышают 1.0 (возможно, в процентах)'
      ]
    };

    setImportedData(mockData);
    setShowPreview(true);
  };

  const handleConfirmImport = () => {
    if (importedData) {
      onDataImported(importedData);
    }
  };

  const handleCancel = () => {
    setImportedData(null);
    setShowPreview(false);
    if (onCancel) {
      onCancel();
    }
  };

  if (showPreview && importedData) {
    return (
      <div className={`bg-white rounded-lg border ${className}`}>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Превью импортируемых данных</h3>
          <p className="text-sm text-gray-600">
            Проверьте данные перед импортом в систему прогнозирования
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">{importedData.filename}</h4>
                <p className="text-sm text-gray-600">
                  {(importedData.size / 1024).toFixed(1)} KB • {importedData.rows} строк • {importedData.columns.length} колонок
                </p>
              </div>
            </div>
            <Check className="w-6 h-6 text-green-600" />
          </div>

          {/* Columns */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Обнаруженные колонки:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {importedData.columns.map((column, index) => (
                <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  {column}
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {importedData.warnings.length > 0 && (
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-800">Предупреждения</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {importedData.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Errors */}
          {importedData.errors.length > 0 && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center mb-2">
                <X className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-800">Ошибки</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {importedData.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Data Preview */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Превью данных (первые 5 строк):</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {importedData.columns.map((column) => (
                      <th key={column} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {importedData.preview.map((row, index) => (
                    <tr key={index}>
                      {importedData.columns.map((column) => (
                        <td key={column} className="px-4 py-2 text-sm text-gray-900">
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={importedData.errors.length > 0}
              className={`
                px-6 py-2 rounded-md font-medium
                ${importedData.errors.length > 0
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              Импортировать данные
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Импорт данных</h3>
        <p className="text-sm text-gray-600">
          Загрузите исторические данные для создания прогноза
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Source Selection */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Источник данных:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {importSources.map((source) => {
              const IconComponent = source.icon;
              return (
                <button
                  key={source.id}
                  onClick={() => setSelectedSource(source.id)}
                  className={`
                    p-4 border rounded-lg text-left transition-all hover:border-blue-300
                    ${selectedSource === source.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className={`
                    w-6 h-6 mb-2
                    ${selectedSource === source.id ? 'text-blue-600' : 'text-gray-500'}
                  `} />
                  <h5 className="font-medium mb-1">{source.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                  <p className="text-xs text-gray-500">
                    Макс. размер: {source.maxSize}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Upload Area */}
        {selectedSource !== 'database' && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Перетащите файл сюда или выберите файл
            </h4>
            <p className="text-gray-600 mb-4">
              Поддерживаемые форматы: {currentSource?.supportedFormats.join(', ')}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Выбрать файл
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={currentSource?.supportedFormats.join(',')}
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Database Connection */}
        {selectedSource === 'database' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип базы данных
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>SQL Server</option>
                  <option>PostgreSQL</option>
                  <option>MySQL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сервер
                </label>
                <input
                  type="text"
                  placeholder="localhost:1433"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  База данных
                </label>
                <input
                  type="text"
                  placeholder="CallCenterDB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Таблица
                </label>
                <input
                  type="text"
                  placeholder="CallHistory"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SQL запрос
              </label>
              <textarea
                rows={4}
                placeholder="SELECT timestamp, calls_count, avg_duration FROM CallHistory WHERE timestamp >= '2024-01-01'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Подключиться и загрузить данные
            </button>
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Обработка данных...</span>
              <span className="text-sm text-blue-700">{processingProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Sample Data Download */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Нужен пример данных?</h4>
              <p className="text-sm text-gray-600">
                Скачайте образец CSV файла с правильной структурой данных
              </p>
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Скачать образец
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataImport;
