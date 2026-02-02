import React, { useState } from 'react';
import { 
  XIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  CreditCardIcon,
  CalculatorIcon,
  ClockIcon
} from 'lucide-react';

export const PayrollCalculation: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const employees = [
    { id: '1', name: 'Иванов И.И.', position: 'Оператор', department: 'ВХ_Линия_гр1' },
    { id: '2', name: 'Петров П.П.', position: 'Супервизор', department: 'ВХ_Линия_гр1' },
    { id: '3', name: 'Сидоров С.С.', position: 'Оператор', department: 'ВХ_Линия_гр2' },
    { id: '4', name: 'Козлова К.К.', position: 'Консультант', department: 'Техподдержка' },
  ];

  const payrollData = [
    {
      employeeId: '1',
      name: 'Иванов И.И.',
      workedHours: 176,
      overtimeHours: 8,
      baseSalary: 45000,
      overtimePay: 3200,
      bonuses: 5000,
      deductions: 1200,
      totalGross: 51000,
      taxes: 6630,
      totalNet: 44370
    },
    {
      employeeId: '2', 
      name: 'Петров П.П.',
      workedHours: 176,
      overtimeHours: 12,
      baseSalary: 65000,
      overtimePay: 5400,
      bonuses: 8000,
      deductions: 800,
      totalGross: 77600,
      taxes: 10088,
      totalNet: 67512
    },
    {
      employeeId: '3',
      name: 'Сидоров С.С.',
      workedHours: 168,
      overtimeHours: 0,
      baseSalary: 42000,
      overtimePay: 0,
      bonuses: 3000,
      deductions: 500,
      totalGross: 44500,
      taxes: 5785,
      totalNet: 38715
    },
    {
      employeeId: '4',
      name: 'Козлова К.К.',
      workedHours: 176,
      overtimeHours: 4,
      baseSalary: 48000,
      overtimePay: 1800,
      bonuses: 4500,
      deductions: 200,
      totalGross: 54100,
      taxes: 7033,
      totalNet: 47067
    }
  ];

  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const calculateTotals = () => {
    const filtered = payrollData.filter(p => 
      selectedEmployees.length === 0 || selectedEmployees.includes(p.employeeId)
    );
    
    return {
      totalWorkedHours: filtered.reduce((sum, p) => sum + p.workedHours, 0),
      totalOvertimeHours: filtered.reduce((sum, p) => sum + p.overtimeHours, 0),
      totalGross: filtered.reduce((sum, p) => sum + p.totalGross, 0),
      totalTaxes: filtered.reduce((sum, p) => sum + p.taxes, 0),
      totalNet: filtered.reduce((sum, p) => sum + p.totalNet, 0),
      employeeCount: filtered.length
    };
  };

  const totals = calculateTotals();
  const displayData = selectedEmployees.length === 0 ? payrollData : 
    payrollData.filter(p => selectedEmployees.includes(p.employeeId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2 text-blue-600" />
              Расчет заработной платы
            </h3>
            <p className="text-sm text-gray-500">Автоматический расчет ЗП на основе отработанного времени</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Расчетный период
            </label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current">Текущий месяц</option>
              <option value="previous">Предыдущий месяц</option>
              <option value="custom">Выбрать период</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата начала
            </label>
            <input
              type="date"
              defaultValue="2024-06-01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата окончания
            </label>
            <input
              type="date"
              defaultValue="2024-06-30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Employee Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Выберите сотрудников
            </label>
            <button
              onClick={selectAllEmployees}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedEmployees.length === employees.length ? 'Снять выделение' : 'Выбрать всех'}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {employees.map((employee) => (
              <label key={employee.id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => toggleEmployee(employee.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{employee.name}</p>
                  <p className="text-xs text-gray-500">{employee.position}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totals.employeeCount}</div>
          <div className="text-sm text-gray-500">Сотрудников</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{totals.totalWorkedHours}ч</div>
          <div className="text-sm text-gray-500">Отработано</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{totals.totalOvertimeHours}ч</div>
          <div className="text-sm text-gray-500">Сверхурочно</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">₽{totals.totalGross.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Начислено</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">₽{totals.totalNet.toLocaleString()}</div>
          <div className="text-sm text-gray-500">К выплате</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Детализация расчета</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сотрудник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Часы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сверхурочные
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оклад
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Премии
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Удержания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Налоги
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  К выплате
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayData.map((payroll) => (
                <tr key={payroll.employeeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{payroll.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {payroll.workedHours}ч
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payroll.overtimeHours > 0 ? (
                      <span className="text-orange-600 font-medium">+{payroll.overtimeHours}ч</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₽{payroll.baseSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payroll.bonuses > 0 ? (
                      <span className="text-green-600">+₽{payroll.bonuses.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payroll.deductions > 0 ? (
                      <span className="text-red-600">-₽{payroll.deductions.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-red-600">-₽{payroll.taxes.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-green-600">
                      ₽{payroll.totalNet.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings and Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Внимание</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Сверхурочные часы требуют подтверждения руководителя</li>
                <li>• Проверьте корректность данных табеля</li>
                <li>• Премии учитываются согласно положению о премировании</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <CalculatorIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Налоговые расчеты</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• НДФЛ: 13% с общей суммы доходов</p>
                <p>• Социальные взносы: 30% (работодатель)</p>
                <p>• Расчет произведен автоматически</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end space-x-3">
        <button className="btn-secondary">
          Экспорт в Excel
        </button>
        <button className="btn-secondary">
          Печать ведомости
        </button>
        <button className="btn-primary">
          Подтвердить расчет
        </button>
      </div>
    </div>
  );
};