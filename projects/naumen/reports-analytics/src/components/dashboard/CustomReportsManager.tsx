import React, { useState } from 'react';
import { PlusIcon, FileTextIcon } from 'lucide-react';
import { CustomReport } from '../../types';

interface CustomReportsManagerProps {
  onCreateReport?: () => void;
  onReportSelect?: (report: CustomReport) => void;
}

export const CustomReportsManager: React.FC<CustomReportsManagerProps> = ({
  onCreateReport,
  onReportSelect
}) => {
  const [customReports] = useState<CustomReport[]>([]);

  const EmptyState = () => (
    <div className="text-center py-12">
      <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">Нет пользовательских отчетов</h3>
      <p className="mt-2 text-sm text-gray-500">
        Создайте первый пользовательский отчет для вашей команды.
      </p>
      <div className="mt-6">
        <button
          onClick={onCreateReport}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Создать отчет</span>
        </button>
      </div>
    </div>
  );

  const ReportsList = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Пользовательские отчеты</h3>
          <p className="text-sm text-gray-500">Отчеты, созданные вашей командой</p>
        </div>
        <button
          onClick={onCreateReport}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Создать отчет</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Создан
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Автор
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customReports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportSelect?.(report)}
                className="table-row-hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <FileTextIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{report.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{report.description}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {report.createdAt.toLocaleDateString('ru-RU')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{report.createdBy}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {customReports.length === 0 ? <EmptyState /> : <ReportsList />}
    </div>
  );
};