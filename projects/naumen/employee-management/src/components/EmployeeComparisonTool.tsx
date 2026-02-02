// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeComparisonTool.tsx

import React, { useState, useMemo } from 'react';
import { Employee, Skill } from '../types/employee';

// ========================
// EMPLOYEE COMPARISON TOOL - Side-by-side employee analysis
// Comprehensive comparison interface for performance reviews and decision-making
// ========================

interface EmployeeComparisonToolProps {
  employees: Employee[];
  preselectedEmployees?: Employee[];
  onComparisonUpdate?: (employees: Employee[]) => void;
  maxComparisons?: number;
}

interface ComparisonMetric {
  id: string;
  label: string;
  category: 'personal' | 'work' | 'performance' | 'skills';
  getValue: (employee: Employee) => string | number;
  format: 'text' | 'number' | 'percentage' | 'date' | 'score' | 'list';
  sortable: boolean;
  icon: string;
}

interface ComparisonSettings {
  showPersonalInfo: boolean;
  showWorkInfo: boolean;
  showPerformance: boolean;
  showSkills: boolean;
  showCertifications: boolean;
  highlightBest: boolean;
  sortBy: string;
}

const EmployeeComparisonTool: React.FC<EmployeeComparisonToolProps> = ({
  employees,
  preselectedEmployees = [],
  onComparisonUpdate,
  maxComparisons = 4
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>(preselectedEmployees.slice(0, maxComparisons));
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState<ComparisonSettings>({
    showPersonalInfo: true,
    showWorkInfo: true,
    showPerformance: true,
    showSkills: true,
    showCertifications: false,
    highlightBest: true,
    sortBy: 'qualityScore'
  });
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  // Comparison metrics configuration
  const comparisonMetrics: ComparisonMetric[] = [
    // Personal Information
    {
      id: 'fullName',
      label: 'ФИО',
      category: 'personal',
      getValue: (emp) => `${emp.personalInfo.firstName} ${emp.personalInfo.lastName}`,
      format: 'text',
      sortable: true,
      icon: '👤'
    },
    {
      id: 'email',
      label: 'Email',
      category: 'personal',
      getValue: (emp) => emp.personalInfo.email,
      format: 'text',
      sortable: true,
      icon: '📧'
    },
    {
      id: 'phone',
      label: 'Телефон',
      category: 'personal',
      getValue: (emp) => emp.personalInfo.phone,
      format: 'text',
      sortable: false,
      icon: '📱'
    },

    // Work Information
    {
      id: 'position',
      label: 'Должность',
      category: 'work',
      getValue: (emp) => emp.workInfo.position,
      format: 'text',
      sortable: true,
      icon: '💼'
    },
    {
      id: 'team',
      label: 'Команда',
      category: 'work',
      getValue: (emp) => emp.workInfo.team.name,
      format: 'text',
      sortable: true,
      icon: '👥'
    },
    {
      id: 'hireDate',
      label: 'Дата найма',
      category: 'work',
      getValue: (emp) => emp.workInfo.hireDate.toLocaleDateString(),
      format: 'date',
      sortable: true,
      icon: '📅'
    },
    {
      id: 'contractType',
      label: 'Тип контракта',
      category: 'work',
      getValue: (emp) => emp.workInfo.contractType,
      format: 'text',
      sortable: true,
      icon: '📋'
    },

    // Performance Metrics
    {
      id: 'qualityScore',
      label: 'Качество обслуживания',
      category: 'performance',
      getValue: (emp) => emp.performance.qualityScore,
      format: 'percentage',
      sortable: true,
      icon: '⭐'
    },
    {
      id: 'adherenceScore',
      label: 'Соблюдение расписания',
      category: 'performance',
      getValue: (emp) => emp.performance.adherenceScore,
      format: 'percentage',
      sortable: true,
      icon: '⏰'
    },
    {
      id: 'callsPerHour',
      label: 'Звонков в час',
      category: 'performance',
      getValue: (emp) => emp.performance.callsPerHour,
      format: 'number',
      sortable: true,
      icon: '📞'
    },
    {
      id: 'averageHandleTime',
      label: 'Среднее время обработки',
      category: 'performance',
      getValue: (emp) => emp.performance.averageHandleTime,
      format: 'number',
      sortable: true,
      icon: '⏱️'
    },
    {
      id: 'customerSatisfaction',
      label: 'Удовлетворенность клиентов',
      category: 'performance',
      getValue: (emp) => emp.performance.customerSatisfaction,
      format: 'score',
      sortable: true,
      icon: '😊'
    },

    // Skills
    {
      id: 'skillsCount',
      label: 'Количество навыков',
      category: 'skills',
      getValue: (emp) => emp.skills.length,
      format: 'number',
      sortable: true,
      icon: '🎯'
    },
    {
      id: 'averageSkillLevel',
      label: 'Средний уровень навыков',
      category: 'skills',
      getValue: (emp) => emp.skills.length > 0 
        ? (emp.skills.reduce((sum, skill) => sum + skill.level, 0) / emp.skills.length).toFixed(1)
        : 0,
      format: 'score',
      sortable: true,
      icon: '📊'
    },
    {
      id: 'verifiedSkills',
      label: 'Подтвержденные навыки',
      category: 'skills',
      getValue: (emp) => emp.skills.filter(skill => skill.verified).length,
      format: 'number',
      sortable: true,
      icon: '✅'
    }
  ];

  // Filter metrics based on settings
  const visibleMetrics = useMemo(() => {
    return comparisonMetrics.filter(metric => {
      switch (metric.category) {
        case 'personal':
          return settings.showPersonalInfo;
        case 'work':
          return settings.showWorkInfo;
        case 'performance':
          return settings.showPerformance;
        case 'skills':
          return settings.showSkills;
        default:
          return true;
      }
    });
  }, [settings]);

  // Filter employees for selection
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.workInfo.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Add employee to comparison
  const addEmployee = (employee: Employee) => {
    if (selectedEmployees.length < maxComparisons && !selectedEmployees.find(emp => emp.id === employee.id)) {
      const newSelection = [...selectedEmployees, employee];
      setSelectedEmployees(newSelection);
      onComparisonUpdate?.(newSelection);
    }
  };

  // Remove employee from comparison
  const removeEmployee = (employeeId: string) => {
    const newSelection = selectedEmployees.filter(emp => emp.id !== employeeId);
    setSelectedEmployees(newSelection);
    onComparisonUpdate?.(newSelection);
  };

  // Format value based on type
  const formatValue = (value: string | number, format: ComparisonMetric['format']): string => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'score':
        return typeof value === 'number' ? value.toFixed(1) : value.toString();
      case 'number':
        return typeof value === 'number' ? value.toString() : value.toString();
      case 'date':
      case 'text':
      default:
        return value.toString();
    }
  };

  // Get best value for highlighting
  const getBestValue = (metric: ComparisonMetric): any => {
    if (!settings.highlightBest || selectedEmployees.length === 0) return null;
    
    const values = selectedEmployees.map(emp => metric.getValue(emp));
    
    if (metric.format === 'number' || metric.format === 'percentage' || metric.format === 'score') {
      const numericValues = values.map(v => typeof v === 'number' ? v : parseFloat(v.toString()));
      
      // For some metrics, lower is better (like averageHandleTime)
      if (metric.id === 'averageHandleTime') {
        return Math.min(...numericValues);
      }
      return Math.max(...numericValues);
    }
    
    return null;
  };

  // Check if value is the best
  const isBestValue = (employee: Employee, metric: ComparisonMetric): boolean => {
    if (!settings.highlightBest) return false;
    
    const value = metric.getValue(employee);
    const bestValue = getBestValue(metric);
    
    return bestValue !== null && value === bestValue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Сравнение сотрудников</h1>
            <p className="text-gray-600">
              Детальное сравнение характеристик и показателей сотрудников
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => setShowEmployeeSelector(true)}
              disabled={selectedEmployees.length >= maxComparisons}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedEmployees.length >= maxComparisons
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              👤 Добавить сотрудника ({selectedEmployees.length}/{maxComparisons})
            </button>
            
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              📊 Экспорт сравнения
            </button>
          </div>
        </div>

        {/* Comparison Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Настройки сравнения</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showPersonalInfo}
                onChange={(e) => setSettings(prev => ({ ...prev, showPersonalInfo: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Личные данные</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showWorkInfo}
                onChange={(e) => setSettings(prev => ({ ...prev, showWorkInfo: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Рабочая информация</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showPerformance}
                onChange={(e) => setSettings(prev => ({ ...prev, showPerformance: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Производительность</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showSkills}
                onChange={(e) => setSettings(prev => ({ ...prev, showSkills: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Навыки</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showCertifications}
                onChange={(e) => setSettings(prev => ({ ...prev, showCertifications: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Сертификации</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.highlightBest}
                onChange={(e) => setSettings(prev => ({ ...prev, highlightBest: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Выделить лучшие</span>
            </label>
          </div>
        </div>
      </div>

      {/* Selected Employees */}
      {selectedEmployees.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Выбранные сотрудники</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedEmployees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
              >
                <img
                  src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                  alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-blue-900">
                  {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                </span>
                <button
                  onClick={() => removeEmployee(employee.id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedEmployees.length > 1 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Детальное сравнение</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 min-w-[200px]">
                    Характеристика
                  </th>
                  {selectedEmployees.map((employee) => (
                    <th key={employee.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900 min-w-[150px]">
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={employee.personalInfo.photo || 'https://i.pravatar.cc/50?img=1'}
                          alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="font-semibold">
                            {employee.personalInfo.firstName}
                          </div>
                          <div className="font-semibold">
                            {employee.personalInfo.lastName}
                          </div>
                          <div className="text-xs text-gray-500 font-normal">
                            {employee.workInfo.position}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleMetrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <span>{metric.icon}</span>
                        <span>{metric.label}</span>
                      </div>
                    </td>
                    {selectedEmployees.map((employee) => {
                      const value = metric.getValue(employee);
                      const isBest = isBestValue(employee, metric);
                      
                      return (
                        <td
                          key={employee.id}
                          className={`px-6 py-4 text-sm text-center ${
                            isBest ? 'bg-green-50 text-green-900 font-semibold' : 'text-gray-900'
                          }`}
                        >
                          {formatValue(value, metric.format)}
                          {isBest && <span className="ml-1">🏆</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedEmployees.length === 1 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Добавьте еще сотрудников</h3>
          <p className="text-gray-500">Для сравнения необходимо выбрать минимум 2 сотрудников</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите сотрудников для сравнения</h3>
          <p className="text-gray-500">Нажмите кнопку "Добавить сотрудника" чтобы начать сравнение</p>
        </div>
      )}

      {/* Employee Selector Modal */}
      {showEmployeeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Выбор сотрудника</h3>
                <button
                  onClick={() => setShowEmployeeSelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Поиск сотрудника..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 gap-3">
                {filteredEmployees
                  .filter(emp => !selectedEmployees.find(selected => selected.id === emp.id))
                  .map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => {
                        addEmployee(employee);
                        setShowEmployeeSelector(false);
                      }}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                        alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{employee.workInfo.position}</div>
                        <div className="text-xs text-gray-400">{employee.workInfo.team.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          {employee.performance.qualityScore}%
                        </div>
                        <div className="text-xs text-gray-500">Качество</div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {filteredEmployees.filter(emp => !selectedEmployees.find(selected => selected.id === emp.id)).length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🔍</div>
                  <p className="text-gray-500">Нет доступных сотрудников</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeComparisonTool;