import React, { useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { ExportOptions } from '../../types';
import { 
  DownloadIcon, 
  FileTextIcon, 
  FileSpreadsheetIcon, 
  ImageIcon,
  SettingsIcon,
  CalendarIcon
} from 'lucide-react';

interface ExportManagerProps {
  reportTitle: string;
  reportData?: any;
  chartRef?: React.RefObject<any>;
  onExport?: (options: ExportOptions) => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  reportTitle,
  reportData,
  chartRef,
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  });

  const exportToPDF = async () => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text(reportTitle, 20, 30);
    
    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Создано: ${new Date().toLocaleString('ru-RU')}`, 20, 45);
    
    // Add chart if available and requested
    if (exportOptions.includeCharts && chartRef?.current) {
      try {
        const canvas = await html2canvas(chartRef.current.canvas);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 20, 60, 170, 100);
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
    
    // Add data table if available
    if (reportData) {
      let yPosition = exportOptions.includeCharts ? 180 : 60;
      
      pdf.setFontSize(14);
      pdf.text('Данные отчета', 20, yPosition);
      yPosition += 15;
      
      // Simple table implementation
      if (Array.isArray(reportData)) {
        pdf.setFontSize(10);
        reportData.slice(0, 10).forEach((row, index) => {
          const text = typeof row === 'object' ? JSON.stringify(row) : String(row);
          pdf.text(text.substring(0, 80), 20, yPosition + (index * 10));
        });
      }
    }
    
    pdf.save(`${reportTitle}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Create data sheet
    let data = reportData;
    if (!Array.isArray(data)) {
      data = [{ report: reportTitle, timestamp: new Date() }];
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
    
    // Add metadata sheet
    const metadata = [
      { field: 'Report Title', value: reportTitle },
      { field: 'Export Date', value: new Date().toISOString() },
      { field: 'Include Charts', value: exportOptions.includeCharts ? 'Yes' : 'No' },
      { field: 'Date Range Start', value: exportOptions.dateRange?.start?.toISOString() || 'N/A' },
      { field: 'Date Range End', value: exportOptions.dateRange?.end?.toISOString() || 'N/A' }
    ];
    const metaSheet = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(workbook, metaSheet, 'Metadata');
    
    XLSX.writeFile(workbook, `${reportTitle}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    let data = reportData;
    if (!Array.isArray(data)) {
      data = [{ report: reportTitle, timestamp: new Date() }];
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      switch (exportOptions.format) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'csv':
          exportToCSV();
          break;
      }
      
      onExport?.(exportOptions);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { id: 'pdf', name: 'PDF документ', icon: FileTextIcon, description: 'Включает графики и таблицы' },
    { id: 'excel', name: 'Excel файл', icon: FileSpreadsheetIcon, description: 'Данные и метаинформация' },
    { id: 'csv', name: 'CSV файл', icon: FileSpreadsheetIcon, description: 'Только табличные данные' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DownloadIcon className="w-5 h-5 mr-2" />
            Экспорт отчета
          </h3>
          <p className="text-sm text-gray-500">Сохраните отчет в удобном формате</p>
        </div>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Формат файла</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {formatOptions.map((format) => {
            const IconComponent = format.icon;
            return (
              <button
                key={format.id}
                onClick={() => setExportOptions({ ...exportOptions, format: format.id as any })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  exportOptions.format === format.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{format.name}</p>
                    <p className="text-xs text-gray-500">{format.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="includeCharts"
            checked={exportOptions.includeCharts}
            onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="includeCharts" className="text-sm text-gray-700 flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            Включить графики и диаграммы
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Дата начала
            </label>
            <input
              type="date"
              value={exportOptions.dateRange?.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => setExportOptions({
                ...exportOptions,
                dateRange: {
                  ...exportOptions.dateRange!,
                  start: new Date(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Дата окончания
            </label>
            <input
              type="date"
              value={exportOptions.dateRange?.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => setExportOptions({
                ...exportOptions,
                dateRange: {
                  ...exportOptions.dateRange!,
                  end: new Date(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Файл: {reportTitle}_{new Date().toISOString().split('T')[0]}.{exportOptions.format}
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <SettingsIcon className="w-4 h-4 animate-spin" />
              <span>Экспорт...</span>
            </>
          ) : (
            <>
              <DownloadIcon className="w-4 h-4" />
              <span>Скачать</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};