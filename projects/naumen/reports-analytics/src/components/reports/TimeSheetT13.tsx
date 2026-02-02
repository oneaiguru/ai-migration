import React, { useState } from 'react';
import { 
  FileTextIcon, 
  DownloadIcon, 
  PrinterIcon, 
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';

interface TimeSheetEntry {
  employeeId: string;
  name: string;
  position: string;
  department: string;
  personnel_number: string;
  days: { [key: number]: string }; // day number -> code
  totals: {
    workedDays: number;
    workedHours: number;
    weekendDays: number;
    vacationDays: number;
    sickDays: number;
    absentDays: number;
  };
}

export const TimeSheetT13: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('2024-06');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Generate days for the month
  const getDaysInMonth = (month: string) => {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const days = getDaysInMonth(selectedMonth);

  // Mock timesheet data
  const timesheetData: TimeSheetEntry[] = [
    {
      employeeId: '1',
      name: 'Иванов Иван Иванович',
      position: 'Оператор',
      department: 'ВХ_Линия_гр1',
      personnel_number: '001',
      days: {
        1: '8', 2: '8', 3: 'В', 4: 'В', 5: '8', 6: '8', 7: '8',
        8: '8', 9: '8', 10: 'В', 11: 'В', 12: '8', 13: '8', 14: '8',
        15: '8', 16: '8', 17: 'В', 18: 'В', 19: '8', 20: '8', 21: 'ОТ',
        22: 'ОТ', 23: 'ОТ', 24: 'В', 25: 'В', 26: '8', 27: '8', 28: '8',
        29: '8', 30: '8'
      },
      totals: {
        workedDays: 20,
        workedHours: 160,
        weekendDays: 8,
        vacationDays: 3,
        sickDays: 0,
        absentDays: 0
      }
    },
    {
      employeeId: '2',
      name: 'Петрова Анна Сергеевна',
      position: 'Супервизор',
      department: 'ВХ_Линия_гр1',
      personnel_number: '002',
      days: {
        1: '8', 2: '8', 3: 'В', 4: 'В', 5: '8', 6: '8', 7: '8',
        8: '8', 9: 'Б', 10: 'В', 11: 'В', 12: 'Б', 13: 'Б', 14: '8',
        15: '8', 16: '8', 17: 'В', 18: 'В', 19: '8', 20: '8', 21: '8',
        22: '8', 23: '8', 24: 'В', 25: 'В', 26: '8', 27: '8', 28: '8',
        29: '8', 30: '8'
      },
      totals: {
        workedDays: 18,
        workedHours: 144,
        weekendDays: 8,
        vacationDays: 0,
        sickDays: 3,
        absentDays: 0
      }
    },
    {
      employeeId: '3',
      name: 'Сидоров Петр Александрович',
      position: 'Консультант',
      department: 'Техподдержка',
      personnel_number: '003',
      days: {
        1: '8', 2: '8', 3: 'В', 4: 'В', 5: '8', 6: '8', 7: '8',
        8: '8', 9: '8', 10: 'В', 11: 'В', 12: '8', 13: '8', 14: '8',
        15: '8', 16: 'ПР', 17: 'В', 18: 'В', 19: '8', 20: '8', 21: '8',
        22: '8', 23: '8', 24: 'В', 25: 'В', 26: '8', 27: '8', 28: '8',
        29: '8', 30: '8'
      },
      totals: {
        workedDays: 20,
        workedHours: 160,
        weekendDays: 8,
        vacationDays: 0,
        sickDays: 0,
        absentDays: 1
      }
    }
  ];

  const filteredData = selectedDepartment === 'all' 
    ? timesheetData 
    : timesheetData.filter(emp => emp.department === selectedDepartment);

  const getCellClass = (code: string) => {
    const baseClass = "w-8 h-8 text-xs flex items-center justify-center border border-gray-300";
    switch (code) {
      case '8': return `${baseClass} bg-green-100 text-green-800`;
      case 'В': return `${baseClass} bg-gray-100 text-gray-600`;
      case 'ОТ': return `${baseClass} bg-blue-100 text-blue-800`;
      case 'Б': return `${baseClass} bg-red-100 text-red-800`;
      case 'ПР': return `${baseClass} bg-yellow-100 text-yellow-800`;
      default: return `${baseClass} bg-white`;
    }
  };

  const getCodeLegend = () => [
    { code: '8', name: 'Рабочий день (8 часов)', color: 'bg-green-100 text-green-800' },
    { code: 'В', name: 'Выходной день', color: 'bg-gray-100 text-gray-600' },
    { code: 'ОТ', name: 'Отпуск', color: 'bg-blue-100 text-blue-800' },
    { code: 'Б', name: 'Больничный', color: 'bg-red-100 text-red-800' },
    { code: 'ПР', name: 'Прогул', color: 'bg-yellow-100 text-yellow-800' },
    { code: 'К', name: 'Командировка', color: 'bg-purple-100 text-purple-800' },
    { code: 'О', name: 'Обучение', color: 'bg-indigo-100 text-indigo-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileTextIcon className="w-5 h-5 mr-2 text-blue-600" />
              Табель учета рабочего времени (Т-13)
            </h3>
            <p className="text-sm text-gray-500">Официальная форма учета рабочего времени сотрудников</p>
          </div>
          
          <div className="flex space-x-3">
            <button className="btn-secondary inline-flex items-center space-x-2">
              <DownloadIcon className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button className="btn-secondary inline-flex items-center space-x-2">
              <PrinterIcon className="w-4 h-4" />
              <span>Печать</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Отчетный период
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-1" />
              Подразделение
            </label>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все подразделения</option>
              <option value="ВХ_Линия_гр1">ВХ_Линия_гр1</option>
              <option value="ВХ_Линия_гр2">ВХ_Линия_гр2</option>
              <option value="Техподдержка">Техподдержка</option>
              <option value="Продажи">Продажи</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Организация
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>ООО "Контакт-центр 1010"</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Условные обозначения</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {getCodeLegend().map((item) => (
            <div key={item.code} className="flex items-center space-x-2">
              <div className={`w-6 h-6 text-xs flex items-center justify-center border border-gray-300 ${item.color}`}>
                {item.code}
              </div>
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th rowSpan={2} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Табельный номер
                </th>
                <th rowSpan={2} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 min-w-0" style={{ minWidth: '200px' }}>
                  ФИО / Должность
                </th>
                <th colSpan={days.length} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Дни месяца
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Отработано дней
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                  Отработано часов
                </th>
                <th rowSpan={2} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Примечания
                </th>
              </tr>
              <tr>
                {days.map((day) => (
                  <th key={day} className="w-8 px-1 py-2 text-center text-xs font-medium text-gray-500 border-r border-gray-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((employee, index) => (
                <tr key={employee.employeeId} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-300">
                    {employee.personnel_number}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-300" style={{ minWidth: '200px' }}>
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-xs text-gray-500">{employee.position}</div>
                    <div className="text-xs text-gray-400">{employee.department}</div>
                  </td>
                  {days.map((day) => (
                    <td key={day} className="border-r border-gray-200 p-0">
                      <div className={getCellClass(employee.days[day] || '')}>
                        {employee.days[day] || ''}
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-300">
                    {employee.totals.workedDays}
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-300">
                    {employee.totals.workedHours}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {employee.totals.sickDays > 0 && (
                      <div className="text-red-600 text-xs">Б/Л: {employee.totals.sickDays} дн.</div>
                    )}
                    {employee.totals.vacationDays > 0 && (
                      <div className="text-blue-600 text-xs">Отпуск: {employee.totals.vacationDays} дн.</div>
                    )}
                    {employee.totals.absentDays > 0 && (
                      <div className="text-yellow-600 text-xs">Прогулы: {employee.totals.absentDays} дн.</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
            Сводная статистика
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Общее количество сотрудников:</span>
              <span className="font-medium text-gray-900">{filteredData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Всего отработано часов:</span>
              <span className="font-medium text-gray-900">
                {filteredData.reduce((sum, emp) => sum + emp.totals.workedHours, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Среднее отработано часов на сотрудника:</span>
              <span className="font-medium text-gray-900">
                {Math.round(filteredData.reduce((sum, emp) => sum + emp.totals.workedHours, 0) / filteredData.length)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Дней по болезни:</span>
              <span className="font-medium text-red-600">
                {filteredData.reduce((sum, emp) => sum + emp.totals.sickDays, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Дней отпуска:</span>
              <span className="font-medium text-blue-600">
                {filteredData.reduce((sum, emp) => sum + emp.totals.vacationDays, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center">
            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
            Контроль и подписи
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Составил:
              </label>
              <p className="text-sm text-gray-900">Специалист по кадрам ________________</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Проверил:
              </label>
              <p className="text-sm text-gray-900">Руководитель отдела ________________</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Утвердил:
              </label>
              <p className="text-sm text-gray-900">Директор ________________</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">
                Дата составления: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};