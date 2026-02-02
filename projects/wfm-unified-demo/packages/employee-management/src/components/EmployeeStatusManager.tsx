// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeStatusManager.tsx

import React, { useState, useMemo } from 'react';
import { Employee } from '../types/employee';

// ========================
// EMPLOYEE STATUS MANAGER - Employee lifecycle and status management
// Comprehensive tool for managing employee status changes, vacation, probation, etc.
// ========================

interface EmployeeStatusManagerProps {
  employees: Employee[];
  onStatusChange?: (employeeId: string, newStatus: Employee['status'], reason?: string, effectiveDate?: Date) => void;
  onBulkStatusChange?: (employeeIds: string[], newStatus: Employee['status'], reason?: string) => void;
  canModifyStatus?: (employee: Employee) => boolean;
}

interface StatusChangeRequest {
  employeeId: string;
  currentStatus: Employee['status'];
  newStatus: Employee['status'];
  reason: string;
  effectiveDate: Date;
  approver?: string;
  notes?: string;
}

interface StatusFilter {
  currentStatus: Employee['status'] | '';
  team: string;
  search: string;
  showPendingChanges: boolean;
}

interface StatusTransition {
  from: Employee['status'];
  to: Employee['status'];
  label: string;
  color: string;
  icon: string;
  requiresReason: boolean;
  requiresApproval: boolean;
  description: string;
}

const EmployeeStatusManager: React.FC<EmployeeStatusManagerProps> = ({
  employees,
  onStatusChange,
  onBulkStatusChange,
  canModifyStatus = () => true
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<StatusFilter>({
    currentStatus: '',
    team: '',
    search: '',
    showPendingChanges: false
  });
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false);
  const [statusChangeTarget, setStatusChangeTarget] = useState<Employee | Employee[] | null>(null);
  const [pendingChanges, setPendingChanges] = useState<StatusChangeRequest[]>([]);

  // Status transition definitions
  const statusTransitions: StatusTransition[] = [    {
      from: 'probation',
      to: 'active',
      label: 'Перевести в штат',
      color: '#10b981',
      icon: '✅',
      requiresReason: true,
      requiresApproval: true,
      description: 'Успешное завершение испытательного срока'
    },
    {
      from: 'active',
      to: 'vacation',
      label: 'Отправить в отпуск',
      color: '#f59e0b',
      icon: '🏖️',
      requiresReason: false,
      requiresApproval: false,
      description: 'Временное отсутствие - отпуск'
    },
    {
      from: 'vacation',
      to: 'active',
      label: 'Вернуть из отпуска',
      color: '#3b82f6',
      icon: '🔄',
      requiresReason: false,
      requiresApproval: false,
      description: 'Возвращение к активной работе'
    },
    {
      from: 'active',
      to: 'inactive',
      label: 'Деактивировать',
      color: '#6b7280',
      icon: '⏸️',
      requiresReason: true,
      requiresApproval: true,
      description: 'Временная деактивация без увольнения'
    },
    {
      from: 'inactive',
      to: 'active',
      label: 'Активировать',
      color: '#10b981',
      icon: '▶️',
      requiresReason: true,
      requiresApproval: false,
      description: 'Возвращение к активной работе'
    },
    {
      from: 'active',
      to: 'terminated',
      label: 'Уволить',
      color: '#ef4444',
      icon: '❌',
      requiresReason: true,
      requiresApproval: true,
      description: 'Прекращение трудовых отношений'
    },
    {
      from: 'probation',
      to: 'terminated',
      label: 'Уволить (испытательный)',
      color: '#ef4444',
      icon: '❌',
      requiresReason: true,
      requiresApproval: true,
      description: 'Увольнение в период испытательного срока'
    }
  ];

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesStatus = !filters.currentStatus || employee.status === filters.currentStatus;
      const matchesTeam = !filters.team || employee.workInfo.team.id === filters.team;
      const matchesSearch = !filters.search || 
        employee.personalInfo.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.personalInfo.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.workInfo.position.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesTeam && matchesSearch;
    });
  }, [employees, filters]);

  // Get available status transitions for an employee
  const getAvailableTransitions = (employee: Employee): StatusTransition[] => {
    return statusTransitions.filter(transition => 
      transition.from === employee.status && canModifyStatus(employee)
    );
  };

  // Get status configuration
  const getStatusConfig = (status: Employee['status']) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', label: 'Активен', dot: 'bg-green-500' },
      vacation: { color: 'bg-yellow-100 text-yellow-800', label: 'В отпуске', dot: 'bg-yellow-500' },
      probation: { color: 'bg-blue-100 text-blue-800', label: 'Испытательный', dot: 'bg-blue-500' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Неактивен', dot: 'bg-gray-400' },
      terminated: { color: 'bg-red-100 text-red-800', label: 'Уволен', dot: 'bg-red-500' }
    };
    return configs[status] || configs.inactive;
  };

  // Handle employee selection
  const handleEmployeeSelection = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  // Initiate status change
  const initiateStatusChange = (target: Employee | Employee[]) => {
    setStatusChangeTarget(target);
    setShowStatusChangeModal(true);
  };

  // Get unique teams for filter
  const teams = useMemo(() => {
    const uniqueTeams = new Map();
    employees.forEach(emp => {
      if (!uniqueTeams.has(emp.workInfo.team.id)) {
        uniqueTeams.set(emp.workInfo.team.id, emp.workInfo.team);
      }
    });
    return Array.from(uniqueTeams.values());
  }, [employees]);

  // Status statistics
  const statusStats = useMemo(() => {
    const stats = {
      active: 0,
      vacation: 0,
      probation: 0,
      inactive: 0,
      terminated: 0
    };
    
    employees.forEach(emp => {
      stats[emp.status]++;
    });
    
    return stats;
  }, [employees]);

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет сотрудников для управления</h3>
          <p className="text-gray-500">Добавьте сотрудников для управления их статусами</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление статусами сотрудников</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium mb-2 uppercase tracking-wide">
              Демонстрационный модуль
            </span>
            <p className="text-gray-600">
              Управление жизненным циклом сотрудников: активация, отпуска, увольнения
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            {selectedEmployees.size > 0 && (
              <button
                onClick={() => initiateStatusChange(
                  employees.filter(emp => selectedEmployees.has(emp.id))
                )}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Изменить статус ({selectedEmployees.size})
              </button>
            )}
            
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              📊 Отчет по статусам
            </button>
          </div>
        </div>

        {/* Status Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(statusStats).map(([status, count]) => {
            const config = getStatusConfig(status as Employee['status']);
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${config.dot} mr-2`}></div>
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <div className="text-sm text-gray-600">{config.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              type="text"
              placeholder="Имя, фамилия, должность..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={filters.currentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, currentStatus: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="vacation">В отпуске</option>
              <option value="probation">На испытательном</option>
              <option value="inactive">Неактивные</option>
              <option value="terminated">Уволенные</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Команда</label>
            <select
              value={filters.team}
              onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все команды</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.showPendingChanges}
                onChange={(e) => setFilters(prev => ({ ...prev, showPendingChanges: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Ожидающие изменения</span>
            </label>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Сотрудники ({filteredEmployees.length})
            </h2>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Выбрать все</span>
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сотрудник
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Текущий статус
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Команда
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата изменения
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Доступные действия
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Выбор
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const statusConfig = getStatusConfig(employee.status);
                const availableTransitions = getAvailableTransitions(employee);
                
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                          alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.workInfo.position}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-1.5`}></div>
                        {statusConfig.label}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: employee.workInfo.team.color }}
                        ></div>
                        <span className="text-sm text-gray-900">{employee.workInfo.team.name}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {employee.metadata.updatedAt.toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {availableTransitions.length > 0 ? (
                        <div className="flex justify-center gap-1">
                          {availableTransitions.slice(0, 2).map((transition) => (
                            <button
                              key={transition.to}
                              onClick={() => initiateStatusChange(employee)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded"
                              style={{ backgroundColor: transition.color + '20', color: transition.color }}
                              title={transition.description}
                            >
                              <span className="mr-1">{transition.icon}</span>
                              {transition.label}
                            </button>
                          ))}
                          {availableTransitions.length > 2 && (
                            <button className="text-xs text-gray-500 hover:text-gray-700">
                              +{availableTransitions.length - 2}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Нет действий</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee.id)}
                        onChange={() => handleEmployeeSelection(employee.id)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Change Modal Placeholder */}
      {showStatusChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Изменение статуса сотрудника
              </h3>
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 text-4xl mb-2">🔄</div>
                <p className="text-gray-500">Модальное окно изменения статуса</p>
                <p className="text-sm text-gray-400 mt-1">Будет реализовано в следующих итерациях</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowStatusChangeModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeStatusManager;
