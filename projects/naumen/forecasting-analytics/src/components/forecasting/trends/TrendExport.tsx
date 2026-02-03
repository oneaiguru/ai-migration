// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/trends/TrendExport.tsx
// TrendExport.tsx - Export trend analysis reports and visualizations

import React, { useState, useRef } from 'react';
import { TrendDataPoint, TrendMetrics, TrendPattern, AnomalyEvent } from '../../../types/trends';

interface TrendExportProps {
  data: TrendDataPoint[];
  metrics?: TrendMetrics;
  patterns?: TrendPattern[];
  anomalies?: AnomalyEvent[];
  organizationName?: string;
  dateRange?: { start: Date; end: Date };
  className?: string;
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'image';
  includeCharts: boolean;
  includeMetrics: boolean;
  includePatterns: boolean;
  includeAnomalies: boolean;
  includeRawData: boolean;
  customTitle?: string;
  addLogo?: boolean;
  colorScheme: 'default' | 'grayscale' | 'high_contrast';
}

const TrendExport: React.FC<TrendExportProps> = ({
  data,
  metrics,
  patterns = [],
  anomalies = [],
  organizationName = 'Контакт-центр',
  dateRange,
  className = ''
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeMetrics: true,
    includePatterns: true,
    includeAnomalies: true,
    includeRawData: false,
    customTitle: '',
    addLogo: true,
    colorScheme: 'default'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate CSV content
  const generateCSV = (): string => {
    const headers = ['Timestamp', 'Value', 'Forecast', 'Trend', 'Seasonal', 'Residual'];
    const rows = [headers.join(',')];

    data.forEach(point => {
      const row = [
        point.timestamp.toISOString(),
        point.value.toString(),
        (point.forecast || '').toString(),
        (point.trend || '').toString(),
        (point.seasonal || '').toString(),
        (point.residual || '').toString()
      ];
      rows.push(row.join(','));
    });

    if (exportOptions.includeAnomalies && anomalies.length > 0) {
      rows.push('');
      rows.push('Аномалии:');
      rows.push('Timestamp,Value,Expected,Severity,Type,Explanation');
      
      anomalies.forEach(anomaly => {
        const row = [
          anomaly.timestamp.toISOString(),
          anomaly.value.toString(),
          anomaly.expectedValue.toString(),
          anomaly.severity,
          anomaly.type,
          `"${anomaly.explanation}"`
        ];
        rows.push(row.join(','));
      });
    }

    return rows.join('\n');
  };

  // Generate JSON content
  const generateJSON = (): string => {
    const exportData: any = {
      metadata: {
        organization: organizationName,
        exportDate: new Date().toISOString(),
        dataRange: dateRange ? {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString()
        } : null,
        exportOptions
      },
      data: data.map(point => ({
        timestamp: point.timestamp.toISOString(),
        value: point.value,
        forecast: point.forecast,
        trend: point.trend,
        seasonal: point.seasonal,
        residual: point.residual,
        anomaly: point.anomaly,
        confidence: point.confidence
      }))
    };

    if (exportOptions.includeMetrics && metrics) {
      exportData.metrics = metrics;
    }

    if (exportOptions.includePatterns && patterns.length > 0) {
      exportData.patterns = patterns.map(pattern => ({
        ...pattern,
        startDate: pattern.startDate.toISOString(),
        endDate: pattern.endDate.toISOString()
      }));
    }

    if (exportOptions.includeAnomalies && anomalies.length > 0) {
      exportData.anomalies = anomalies.map(anomaly => ({
        ...anomaly,
        timestamp: anomaly.timestamp.toISOString()
      }));
    }

    return JSON.stringify(exportData, null, 2);
  };

  // Generate Excel content (basic CSV for now, could be enhanced with a library)
  const generateExcel = (): string => {
    let content = '';
    
    // Metadata sheet
    content += 'Отчет по анализу трендов\n';
    content += `Организация:,${organizationName}\n`;
    content += `Дата экспорта:,${new Date().toLocaleString('ru-RU')}\n`;
    if (dateRange) {
      content += `Период:,${dateRange.start.toLocaleString('ru-RU')} - ${dateRange.end.toLocaleString('ru-RU')}\n`;
    }
    content += '\n';

    // Metrics
    if (exportOptions.includeMetrics && metrics) {
      content += 'Метрики:\n';
      content += `Скорость роста (%):,${metrics.growthRate.toFixed(2)}\n`;
      content += `Волатильность:,${metrics.volatility.toFixed(2)}\n`;
      content += `Сила сезонности:,${metrics.seasonalityStrength.toFixed(2)}\n`;
      content += `Направление тренда:,${metrics.trendDirection}\n`;
      content += `Точность прогноза (%):,${(metrics.forecastAccuracy * 100).toFixed(1)}\n`;
      content += '\n';
    }

    // Data
    content += 'Данные:\n';
    content += generateCSV();

    return content;
  };

  // Generate HTML report
  const generateHTMLReport = (): string => {
    const title = exportOptions.customTitle || `Анализ трендов - ${organizationName}`;
    
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 2px solid #DC2911; padding-bottom: 20px; margin-bottom: 30px; }
        .title { color: #DC2911; font-size: 24px; font-weight: bold; margin: 0; }
        .subtitle { color: #77828C; font-size: 16px; margin: 5px 0 0 0; }
        .section { margin: 30px 0; }
        .section-title { color: #DC2911; font-size: 18px; font-weight: bold; border-left: 4px solid #DC2911; padding-left: 10px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #35BA9A; }
        .metric-label { font-size: 12px; color: #77828C; margin-bottom: 5px; }
        .metric-value { font-size: 20px; font-weight: bold; color: #333; }
        .pattern-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #8B5CF6; }
        .anomaly-item { background: #fef2f2; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #EF4444; }
        .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .data-table th, .data-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .data-table th { background-color: #f8f9fa; font-weight: bold; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #77828C; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">${title}</h1>
        <p class="subtitle">Сгенерировано: ${new Date().toLocaleString('ru-RU')}</p>
        ${dateRange ? `<p class="subtitle">Период: ${dateRange.start.toLocaleString('ru-RU')} - ${dateRange.end.toLocaleString('ru-RU')}</p>` : ''}
    </div>

    ${exportOptions.includeMetrics && metrics ? `
    <div class="section">
        <h2 class="section-title">Ключевые метрики</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Скорость роста</div>
                <div class="metric-value">${metrics.growthRate > 0 ? '+' : ''}${metrics.growthRate.toFixed(2)}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Волатильность</div>
                <div class="metric-value">${metrics.volatility.toFixed(2)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Направление тренда</div>
                <div class="metric-value">${metrics.trendDirection === 'increasing' ? 'Рост' : metrics.trendDirection === 'decreasing' ? 'Снижение' : 'Стабильно'}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Точность прогноза</div>
                <div class="metric-value">${(metrics.forecastAccuracy * 100).toFixed(1)}%</div>
            </div>
        </div>
    </div>
    ` : ''}

    ${exportOptions.includePatterns && patterns.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Обнаруженные паттерны</h2>
        ${patterns.map(pattern => `
            <div class="pattern-item">
                <strong>${pattern.description}</strong><br>
                Тип: ${pattern.type}, Период: ${pattern.period}<br>
                Сила: ${(pattern.strength * 100).toFixed(1)}%, Доверие: ${(pattern.statisticalSignificance * 100).toFixed(1)}%<br>
                <small>Рекомендации: ${pattern.recommendations.join(', ')}</small>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${exportOptions.includeAnomalies && anomalies.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Аномалии</h2>
        ${anomalies.slice(0, 10).map(anomaly => `
            <div class="anomaly-item">
                <strong>${anomaly.type === 'spike' ? 'Всплеск' : anomaly.type === 'drop' ? 'Провал' : 'Сдвиг'}</strong> 
                (${anomaly.severity === 'critical' ? 'Критично' : anomaly.severity === 'high' ? 'Высокий' : 'Средний'})<br>
                Время: ${anomaly.timestamp.toLocaleString('ru-RU')}<br>
                Значение: ${anomaly.value}, Ожидалось: ${anomaly.expectedValue.toFixed(1)}<br>
                <small>${anomaly.explanation}</small>
            </div>
        `).join('')}
        ${anomalies.length > 10 ? `<p><em>Показано 10 из ${anomalies.length} аномалий</em></p>` : ''}
    </div>
    ` : ''}

    ${exportOptions.includeRawData ? `
    <div class="section">
        <h2 class="section-title">Данные</h2>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Время</th>
                    <th>Значение</th>
                    <th>Прогноз</th>
                    <th>Тренд</th>
                </tr>
            </thead>
            <tbody>
                ${data.slice(0, 100).map(point => `
                    <tr>
                        <td>${point.timestamp.toLocaleString('ru-RU')}</td>
                        <td>${point.value}</td>
                        <td>${point.forecast || '-'}</td>
                        <td>${point.trend ? point.trend.toFixed(1) : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${data.length > 100 ? `<p><em>Показано 100 из ${data.length} записей</em></p>` : ''}
    </div>
    ` : ''}

    <div class="footer">
        <p>Отчет создан системой анализа трендов WFM</p>
    </div>
</body>
</html>`;
  };

  // Download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export function
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const baseFilename = `trend-analysis-${organizationName}-${timestamp}`;

      let content: string;
      let filename: string;
      let mimeType: string;

      setExportProgress(25);

      switch (exportOptions.format) {
        case 'csv':
          content = generateCSV();
          filename = `${baseFilename}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
          break;

        case 'json':
          content = generateJSON();
          filename = `${baseFilename}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;

        case 'excel':
          content = generateExcel();
          filename = `${baseFilename}.csv`; // Using CSV format for simplicity
          mimeType = 'text/csv;charset=utf-8;';
          break;

        case 'pdf':
          // For PDF, we'll generate HTML and suggest printing to PDF
          content = generateHTMLReport();
          filename = `${baseFilename}.html`;
          mimeType = 'text/html;charset=utf-8;';
          
          // Open in new window for PDF printing
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(content);
            newWindow.document.close();
            setTimeout(() => {
              newWindow.print();
            }, 1000);
          }
          setExportProgress(100);
          setIsExporting(false);
          return;

        default:
          throw new Error('Неподдерживаемый формат экспорта');
      }

      setExportProgress(75);

      // Add BOM for proper UTF-8 encoding in Excel
      if (exportOptions.format === 'csv' || exportOptions.format === 'excel') {
        content = '\uFEFF' + content;
      }

      setExportProgress(90);

      downloadFile(content, filename, mimeType);
      setExportProgress(100);

    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Произошла ошибка при экспорте данных');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  // Quick export buttons
  const quickExportCSV = () => {
    setExportOptions(prev => ({ ...prev, format: 'csv', includeRawData: true }));
    setTimeout(handleExport, 100);
  };

  const quickExportReport = () => {
    setExportOptions(prev => ({ 
      ...prev, 
      format: 'pdf', 
      includeCharts: true, 
      includeMetrics: true, 
      includePatterns: true, 
      includeAnomalies: true, 
      includeRawData: false 
    }));
    setTimeout(handleExport, 100);
  };

  return (
    <div className={`trend-export bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">📤 Экспорт данных</h3>
          <div className="text-sm text-gray-500">
            {data.length} записей для экспорта
          </div>
        </div>

        {/* Quick Export Buttons */}
        <div className="flex space-x-3 mb-4">
          <button
            onClick={quickExportCSV}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📊 Быстро CSV
          </button>
          <button
            onClick={quickExportReport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📄 Быстро отчет
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="p-4 space-y-4">
        <h4 className="text-md font-medium text-gray-900">Настройки экспорта</h4>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Формат</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { value: 'pdf', label: '📄 PDF отчет', desc: 'Полный отчет' },
              { value: 'excel', label: '📊 Excel', desc: 'Таблица данных' },
              { value: 'csv', label: '📋 CSV', desc: 'Сырые данные' },
              { value: 'json', label: '💾 JSON', desc: 'Структурированные данные' }
            ].map(format => (
              <button
                key={format.value}
                onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  exportOptions.format === format.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{format.label}</div>
                <div className="text-xs text-gray-500">{format.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Включить в экспорт</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeMetrics}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetrics: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Метрики тренда</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includePatterns}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includePatterns: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Обнаруженные паттерны ({patterns.length})</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeAnomalies}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnomalies: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Аномалии ({anomalies.length})</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeRawData}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeRawData: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Сырые данные ({data.length} записей)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeCharts}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded"
                disabled={exportOptions.format === 'csv' || exportOptions.format === 'json'}
              />
              <span className="text-sm">Графики (только PDF/Excel)</span>
            </label>
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок отчета</label>
            <input
              type="text"
              value={exportOptions.customTitle || ''}
              onChange={(e) => setExportOptions(prev => ({ ...prev, customTitle: e.target.value }))}
              placeholder={`Анализ трендов - ${organizationName}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цветовая схема</label>
            <select
              value={exportOptions.colorScheme}
              onChange={(e) => setExportOptions(prev => ({ ...prev, colorScheme: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Стандартная</option>
              <option value="grayscale">Черно-белая</option>
              <option value="high_contrast">Высокий контраст</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isExporting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Экспорт... {exportProgress}%</span>
              </div>
            ) : (
              `Экспортировать как ${exportOptions.format.toUpperCase()}`
            )}
          </button>

          {isExporting && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Export Notes */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>• PDF отчет откроется в новом окне для печати/сохранения</div>
          <div>• CSV и Excel файлы оптимизированы для анализа в электронных таблицах</div>
          <div>• JSON содержит полную структурированную информацию для API</div>
          {exportOptions.format === 'pdf' && (
            <div>• Для сохранения в PDF используйте функцию печати браузера</div>
          )}
        </div>
      </div>

      {/* Hidden canvas for chart rendering */}
      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default TrendExport;