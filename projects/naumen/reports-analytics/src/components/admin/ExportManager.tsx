import React from 'react';
import { AdminRequest } from '../../types';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';

interface ExportManagerProps {
  requests: AdminRequest[];
  selectedIds?: string[];
  title?: string;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  requests,
  selectedIds = [],
  title = 'Отчет по заявкам'
}) => {
  const exportRequests = selectedIds.length > 0 
    ? requests.filter(req => selectedIds.includes(req.id))
    : requests;

  const generateCSV = () => {
    const headers = [
      'ID заявки',
      'Тип заявки', 
      'ФИО сотрудника',
      'ID сотрудника',
      'Описание',
      'Дата подачи',
      'Период начала',
      'Период окончания',
      'Статус',
      'Приоритет',
      'Комментарии менеджера'
    ];

    const csvData = exportRequests.map(req => [
      req.id,
      req.type === 'schedule_change' ? 'Изменение расписания' : 'Обмен сменами',
      req.employeeName,
      req.employeeId,
      `"${req.description.replace(/"/g, '""')}"`,
      req.submissionDate.toLocaleDateString('ru-RU'),
      req.startDate.toLocaleDateString('ru-RU'),
      req.endDate ? req.endDate.toLocaleDateString('ru-RU') : '',
      req.status === 'pending' ? 'На рассмотрении' : 
        req.status === 'approved' ? 'Одобрено' : 'Отклонено',
      req.priority === 'high' ? 'Высокий' : 
        req.priority === 'medium' ? 'Средний' : 'Низкий',
      req.managerNotes ? `"${req.managerNotes.replace(/"/g, '""')}"` : ''
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateExcel = () => {
    // Create HTML table for Excel import
    const htmlTable = `
      <table border="1">
        <thead>
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td>ID заявки</td>
            <td>Тип заявки</td>
            <td>ФИО сотрудника</td>
            <td>ID сотрудника</td>
            <td>Описание</td>
            <td>Дата подачи</td>
            <td>Период начала</td>
            <td>Период окончания</td>
            <td>Статус</td>
            <td>Приоритет</td>
            <td>Комментарии менеджера</td>
          </tr>
        </thead>
        <tbody>
          ${exportRequests.map(req => `
            <tr>
              <td>${req.id}</td>
              <td>${req.type === 'schedule_change' ? 'Изменение расписания' : 'Обмен сменами'}</td>
              <td>${req.employeeName}</td>
              <td>${req.employeeId}</td>
              <td>${req.description}</td>
              <td>${req.submissionDate.toLocaleDateString('ru-RU')}</td>
              <td>${req.startDate.toLocaleDateString('ru-RU')}</td>
              <td>${req.endDate ? req.endDate.toLocaleDateString('ru-RU') : ''}</td>
              <td>${req.status === 'pending' ? 'На рассмотрении' : 
                    req.status === 'approved' ? 'Одобрено' : 'Отклонено'}</td>
              <td>${req.priority === 'high' ? 'Высокий' : 
                    req.priority === 'medium' ? 'Средний' : 'Низкий'}</td>
              <td>${req.managerNotes || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `requests_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .meta { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status-pending { color: #d69e2e; }
            .status-approved { color: #38a169; }
            .status-rejected { color: #e53e3e; }
            .priority-high { color: #e53e3e; font-weight: bold; }
            .priority-medium { color: #d69e2e; }
            .priority-low { color: #38a169; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="meta">
              Дата формирования: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}
              <br>Количество записей: ${exportRequests.length}
              ${selectedIds.length > 0 ? `<br>Выбранные записи: ${selectedIds.length} из ${requests.length}` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Тип</th>
                <th>Сотрудник</th>
                <th>Описание</th>
                <th>Дата подачи</th>
                <th>Период</th>
                <th>Статус</th>
                <th>Приоритет</th>
              </tr>
            </thead>
            <tbody>
              ${exportRequests.map(req => `
                <tr>
                  <td>${req.id}</td>
                  <td>${req.type === 'schedule_change' ? 'Изменение расписания' : 'Обмен сменами'}</td>
                  <td>${req.employeeName}</td>
                  <td>${req.description}</td>
                  <td>${req.submissionDate.toLocaleDateString('ru-RU')}</td>
                  <td>${req.startDate.toLocaleDateString('ru-RU')}${req.endDate ? ` - ${req.endDate.toLocaleDateString('ru-RU')}` : ''}</td>
                  <td class="status-${req.status}">
                    ${req.status === 'pending' ? 'На рассмотрении' : 
                      req.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                  </td>
                  <td class="priority-${req.priority}">
                    ${req.priority === 'high' ? 'Высокий' : 
                      req.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Печать
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
              Закрыть
            </button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={generateCSV}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        title="Экспорт в CSV"
      >
        <FileText className="w-4 h-4 mr-2" />
        CSV
      </button>
      
      <button
        onClick={generateExcel}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        title="Экспорт в Excel"
      >
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        Excel
      </button>
      
      <button
        onClick={generatePrintReport}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        title="Печать отчета"
      >
        <Printer className="w-4 h-4 mr-2" />
        Печать
      </button>
    </div>
  );
};