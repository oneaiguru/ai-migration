// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeAuditLog.tsx

import React, { useState, useMemo } from 'react';
import { Employee } from '../types/employee';

// ========================
// EMPLOYEE AUDIT LOG - Change tracking and history
// Comprehensive audit trail for all employee-related changes
// ========================

interface EmployeeAuditLogProps {
  employeeId?: string;
  employees: Employee[];
  showAllEmployees?: boolean;
  maxEntries?: number;
}

interface AuditEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'skill_add' | 'skill_remove' | 'team_change' | 'manager_change' | 'photo_update';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

interface AuditFilter {
  dateFrom: string;
  dateTo: string;
  action: string;
  user: string;
  employee: string;
  field: string;
}

const EmployeeAuditLog: React.FC<EmployeeAuditLogProps> = ({
  employeeId,
  employees,
  showAllEmployees = true,
  maxEntries = 100
}) => {
  const [filters, setFilters] = useState<AuditFilter>({
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    dateTo: new Date().toISOString().split('T')[0],
    action: '',
    user: '',
    employee: employeeId || '',
    field: ''
  });
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Mock audit entries (in real app, would come from API)
  const [auditEntries] = useState<AuditEntry[]>([
    {
      id: 'audit_001',
      employeeId: 'emp_001',
      employeeName: 'Динара Абдуллаева',
      action: 'status_change',
      field: 'status',
      oldValue: 'probation',
      newValue: 'active',
      timestamp: new Date('2024-02-15T10:30:00'),
      userId: 'mgr_001',
      userName: 'Иванов И.И.',
      userRole: 'Менеджер',
      ipAddress: '192.168.1.100',
      reason: 'Успешное завершение испытательного срока'
    },
    {
      id: 'audit_002',
      employeeId: 'emp_001',
      employeeName: 'Динара Абдуллаева',
      action: 'skill_add',
      field: 'skills',
      newValue: 'CRM система - уровень 4',
      timestamp: new Date('2024-02-10T14:15:00'),
      userId: 'admin_001',
      userName: 'Петров А.В.',
      userRole: 'Администратор',
      ipAddress: '192.168.1.101',
      metadata: {
        skillId: 's2',
        skillName: 'CRM система',
        level: 4,
        assessor: 'Петров А.В.'
      }
    },
    {
      id: 'audit_003',
      employeeId: 'emp_002',
      employeeName: 'Мария Азикова',
      action: 'team_change',
      field: 'team',
      oldValue: 'Группа продаж',
      newValue: 'Группа поддержки',
      timestamp: new Date('2024-02-08T09:20:00'),
      userId: 'mgr_002',
      userName: 'Сидорова М.К.',
      userRole: 'Руководитель отдела',
      reason: 'Реорганизация команд'
    },
    {
      id: 'audit_004',
      employeeId: 'emp_003',
      employeeName: 'Данара Акашева',
      action: 'update',
      field: 'phone',
      oldValue: '+996555789123',
      newValue: '+996555789124',
      timestamp: new Date('2024-02-05T16:45:00'),
      userId: 'emp_003',
      userName: 'Данара Акашева',
      userRole: 'Сотрудник',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'audit_005',
      employeeId: 'emp_001',
      employeeName: 'Динара Абдуллаева',
      action: 'photo_update',
      field: 'photo',
      timestamp: new Date('2024-02-01T11:00:00'),
      userId: 'emp_001',
      userName: 'Динара Абдуллаева',
      userRole: 'Сотрудник',
      metadata: {
        fileSize: '2.3MB',
        fileName: 'profile_photo.jpg'
      }
    }
  ]);

  // Filter audit entries
  const filteredEntries = useMemo(() => {
    return auditEntries.filter(entry => {
      const entryDate = entry.timestamp.toISOString().split('T')[0];
      
      const matchesDateRange = entryDate >= filters.dateFrom && entryDate <= filters.dateTo;
      const matchesAction = !filters.action || entry.action === filters.action;
      const matchesUser = !filters.user || entry.userName.toLowerCase().includes(filters.user.toLowerCase());
      const matchesEmployee = !filters.employee || entry.employeeId === filters.employee;
      const matchesField = !filters.field || entry.field === filters.field;
      
      return matchesDateRange && matchesAction && matchesUser && matchesEmployee && matchesField;
    }).slice(0, maxEntries);
  }, [auditEntries, filters, maxEntries]);

  // Get action configuration
  const getActionConfig = (action: AuditEntry['action']) => {
    const configs = {
      create: { icon: '➕', color: 'bg-green-100 text-green-800', label: 'Создание' },
      update: { icon: '✏️', color: 'bg-blue-100 text-blue-800', label: 'Изменение' },
      delete: { icon: '🗑️', color: 'bg-red-100 text-red-800', label: 'Удаление' },
      status_change: { icon: '🔄', color: 'bg-purple-100 text-purple-800', label: 'Смена статуса' },
      skill_add: { icon: '🎯', color: 'bg-emerald-100 text-emerald-800', label: 'Добавление навыка' },
      skill_remove: { icon: '❌', color: 'bg-orange-100 text-orange-800', label: 'Удаление навыка' },
      team_change: { icon: '👥', color: 'bg-indigo-100 text-indigo-800', label: 'Смена команды' },
      manager_change: { icon: '👨‍💼', color: 'bg-teal-100 text-teal-800', label: 'Смена менеджера' },
      photo_update: { icon: '📷', color: 'bg-pink-100 text-pink-800', label: 'Обновление фото' }
    };
    return configs[action] || configs.update;
  };

  // Toggle entry expansion
  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = new Set(auditEntries.map(entry => entry.userName));
    return Array.from(users).sort();
  }, [auditEntries]);

  // Get unique fields for filter
  const uniqueFields = useMemo(() => {
    const fields = new Set(auditEntries.map(entry => entry.field).filter(Boolean));
    return Array.from(fields).sort();
  }, [auditEntries]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Журнал изменений {employeeId ? 'сотрудника' : ''}
            </h1>
            <p className="text-gray-600">
              Полная история изменений данных сотрудников с детальной информацией
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === 'timeline' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                📅 Лента
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium border-l transition-all ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                📋 Таблица
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">С даты</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">По дату</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Действие</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все действия</option>
              <option value="create">Создание</option>
              <option value="update">Изменение</option>
              <option value="status_change">Смена статуса</option>
              <option value="skill_add">Добавление навыка</option>
              <option value="team_change">Смена команды</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пользователь</label>
            <select
              value={filters.user}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все пользователи</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {showAllEmployees && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сотрудник</label>
              <select
                value={filters.employee}
                onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все сотрудники</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.personalInfo.firstName} {emp.personalInfo.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поле</label>
            <select
              value={filters.field}
              onChange={(e) => setFilters(prev => ({ ...prev, field: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все поля</option>
              {uniqueFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">
            Найдено записей: {filteredEntries.length}
          </span>
          <button
            onClick={() => setFilters({
              dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              dateTo: new Date().toISOString().split('T')[0],
              action: '',
              user: '',
              employee: employeeId || '',
              field: ''
            })}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-300 mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Записи не найдены</h3>
            <p className="text-gray-500">
              Попробуйте изменить параметры фильтрации или расширить временной диапазон
            </p>
          </div>
        ) : viewMode === 'timeline' ? (
          /* Timeline View */
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => {
              const actionConfig = getActionConfig(entry.action);
              const isExpanded = expandedEntries.has(entry.id);
              const isLast = index === filteredEntries.length - 1;

              return (
                <div key={entry.id} className="relative">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200"></div>
                  )}

                  <div className="flex gap-4">
                    {/* Timeline Dot */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${actionConfig.color} border-4 border-white shadow-sm`}>
                      {actionConfig.icon}
                    </div>

                    {/* Entry Content */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {actionConfig.label}: {entry.employeeName}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>👤 {entry.userName} ({entry.userRole})</span>
                            <span>🕒 {entry.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>

                      {/* Change Summary */}
                      <div className="space-y-2">
                        {entry.field && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-700">Поле:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs">{entry.field}</code>
                          </div>
                        )}
                        
                        {entry.oldValue && entry.newValue && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Было:</span>
                              <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                                {entry.oldValue}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Стало:</span>
                              <div className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-green-800">
                                {entry.newValue}
                              </div>
                            </div>
                          </div>
                        )}

                        {entry.newValue && !entry.oldValue && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Значение:</span>
                            <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                              {entry.newValue}
                            </div>
                          </div>
                        )}

                        {entry.reason && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Причина:</span>
                            <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                              {entry.reason}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">ID записи:</span>
                              <code className="block mt-1 text-xs text-gray-600">{entry.id}</code>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">ID пользователя:</span>
                              <code className="block mt-1 text-xs text-gray-600">{entry.userId}</code>
                            </div>
                            {entry.ipAddress && (
                              <div>
                                <span className="font-medium text-gray-700">IP адрес:</span>
                                <code className="block mt-1 text-xs text-gray-600">{entry.ipAddress}</code>
                              </div>
                            )}
                            {entry.userAgent && (
                              <div>
                                <span className="font-medium text-gray-700">User Agent:</span>
                                <code className="block mt-1 text-xs text-gray-600 truncate">{entry.userAgent}</code>
                              </div>
                            )}
                          </div>

                          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                            <div>
                              <span className="font-medium text-gray-700">Дополнительные данные:</span>
                              <pre className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-xs overflow-x-auto">
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-900">Дата/Время</th>
                  <th className="text-left p-3 font-medium text-gray-900">Действие</th>
                  <th className="text-left p-3 font-medium text-gray-900">Сотрудник</th>
                  <th className="text-left p-3 font-medium text-gray-900">Поле</th>
                  <th className="text-left p-3 font-medium text-gray-900">Изменение</th>
                  <th className="text-left p-3 font-medium text-gray-900">Пользователь</th>
                  <th className="text-left p-3 font-medium text-gray-900">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => {
                  const actionConfig = getActionConfig(entry.action);
                  
                  return (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-600">
                        {entry.timestamp.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${actionConfig.color}`}>
                          {actionConfig.icon} {actionConfig.label}
                        </span>
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-900">
                        {entry.employeeName}
                      </td>
                      <td className="p-3">
                        {entry.field && (
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs">{entry.field}</code>
                        )}
                      </td>
                      <td className="p-3 text-sm max-w-xs">
                        {entry.oldValue && entry.newValue ? (
                          <div className="space-y-1">
                            <div className="text-red-600">❌ {entry.oldValue}</div>
                            <div className="text-green-600">✅ {entry.newValue}</div>
                          </div>
                        ) : entry.newValue ? (
                          <div className="text-blue-600">➕ {entry.newValue}</div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        <div>{entry.userName}</div>
                        <div className="text-xs text-gray-500">{entry.userRole}</div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Детали
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAuditLog;