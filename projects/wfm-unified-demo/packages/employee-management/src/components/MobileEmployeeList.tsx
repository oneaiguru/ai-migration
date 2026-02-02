// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/MobileEmployeeList.tsx

import React, { useState, useMemo } from 'react';
import { Employee, Team } from '../types/employee';

// ========================
// MOBILE EMPLOYEE LIST - Mobile-optimized employee interface
// Touch-friendly design with swipe actions and bottom sheets
// ========================

interface MobileEmployeeListProps {
  employees: Employee[];
  teams: Team[];
  onEmployeeSelect?: (employee: Employee) => void;
  onEmployeeEdit?: (employee: Employee) => void;
  onEmployeeCall?: (employee: Employee) => void;
  onEmployeeEmail?: (employee: Employee) => void;
  selectedEmployees?: Set<string>;
  onEmployeeToggle?: (employeeId: string) => void;
  selectionMode?: boolean;
}

interface MobileFilters {
  search: string;
  team: string;
  status: string;
  quickFilter: 'all' | 'favorites' | 'active' | 'recent';
}

interface SwipeAction {
  id: string;
  icon: string;
  label: string;
  color: string;
  action: (employee: Employee) => void;
}

const MobileEmployeeList: React.FC<MobileEmployeeListProps> = ({
  employees,
  teams,
  onEmployeeSelect,
  onEmployeeEdit,
  onEmployeeCall,
  onEmployeeEmail,
  selectedEmployees = new Set(),
  onEmployeeToggle,
  selectionMode = false
}) => {
  const [filters, setFilters] = useState<MobileFilters>({
    search: '',
    team: '',
    status: '',
    quickFilter: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [swipedEmployee, setSwipedEmployee] = useState<string | null>(null);

  // Swipe actions configuration
  const swipeActions: SwipeAction[] = [
    {
      id: 'call',
      icon: '📞',
      label: 'Позвонить',
      color: 'bg-green-500',
      action: (employee) => onEmployeeCall?.(employee)
    },
    {
      id: 'email',
      icon: '✉️',
      label: 'Email',
      color: 'bg-blue-500',
      action: (employee) => onEmployeeEmail?.(employee)
    },
    {
      id: 'edit',
      icon: '✏️',
      label: 'Изменить',
      color: 'bg-orange-500',
      action: (employee) => onEmployeeEdit?.(employee)
    }
  ];

  // Filter employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Quick filters
    switch (filters.quickFilter) {
      case 'favorites':
        filtered = filtered.filter(emp => favorites.has(emp.id));
        break;
      case 'active':
        filtered = filtered.filter(emp => emp.status === 'active');
        break;
      case 'recent':
        // Last 30 days of activity (mock)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(emp => emp.metadata.lastLogin && emp.metadata.lastLogin > thirtyDaysAgo);
        break;
    }

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.personalInfo.firstName.toLowerCase().includes(searchLower) ||
        emp.personalInfo.lastName.toLowerCase().includes(searchLower) ||
        emp.workInfo.position.toLowerCase().includes(searchLower) ||
        emp.employeeId.toLowerCase().includes(searchLower) ||
        emp.personalInfo.phone.includes(filters.search)
      );
    }

    // Team filter
    if (filters.team) {
      filtered = filtered.filter(emp => emp.workInfo.team.id === filters.team);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(emp => emp.status === filters.status);
    }

    return filtered.sort((a, b) => 
      `${a.personalInfo.firstName} ${a.personalInfo.lastName}`
        .localeCompare(`${b.personalInfo.firstName} ${b.personalInfo.lastName}`)
    );
  }, [employees, filters, favorites]);

  // Get status configuration
  const getStatusConfig = (status: Employee['status']) => {
    const configs = {
      active: { color: 'bg-green-500', text: 'Активен', dot: '🟢' },
      vacation: { color: 'bg-yellow-500', text: 'В отпуске', dot: '🟡' },
      probation: { color: 'bg-blue-500', text: 'Испытательный', dot: '🔵' },
      inactive: { color: 'bg-gray-400', text: 'Неактивен', dot: '⚪' },
      terminated: { color: 'bg-red-500', text: 'Уволен', dot: '🔴' }
    };
    return configs[status] || configs.inactive;
  };

  // Toggle favorite
  const toggleFavorite = (employeeId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(employeeId)) {
      newFavorites.delete(employeeId);
    } else {
      newFavorites.add(employeeId);
    }
    setFavorites(newFavorites);
  };

  // Handle employee tap
  const handleEmployeeTap = (employee: Employee) => {
    if (selectionMode) {
      onEmployeeToggle?.(employee.id);
    } else {
      setSelectedEmployee(employee);
      setShowBottomSheet(true);
      onEmployeeSelect?.(employee);
    }
  };

  // Employee Bottom Sheet
  const EmployeeBottomSheet: React.FC = () => {
    if (!selectedEmployee || !showBottomSheet) return null;

    const statusConfig = getStatusConfig(selectedEmployee.status);

    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowBottomSheet(false)}
        />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            
            {/* Employee Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <img
                  src={selectedEmployee.personalInfo.photo || 'https://i.pravatar.cc/150?img=1'}
                  alt={`${selectedEmployee.personalInfo.firstName} ${selectedEmployee.personalInfo.lastName}`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${statusConfig.color}`}></div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedEmployee.personalInfo.firstName} {selectedEmployee.personalInfo.lastName}
                </h3>
                <p className="text-gray-600">{selectedEmployee.workInfo.position}</p>
                <p className="text-sm text-gray-500">{selectedEmployee.employeeId}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEmployee.workInfo.team.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{selectedEmployee.workInfo.team.name}</span>
                </div>
              </div>
              
              <button
                onClick={() => toggleFavorite(selectedEmployee.id)}
                className="p-2"
              >
                <span className="text-2xl">
                  {favorites.has(selectedEmployee.id) ? '❤️' : '🤍'}
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => {
                  onEmployeeCall?.(selectedEmployee);
                  setShowBottomSheet(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl"
              >
                <span className="text-2xl">📞</span>
                <span className="text-sm font-medium text-green-800">Позвонить</span>
              </button>
              
              <button
                onClick={() => {
                  onEmployeeEmail?.(selectedEmployee);
                  setShowBottomSheet(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl"
              >
                <span className="text-2xl">✉️</span>
                <span className="text-sm font-medium text-blue-800">Email</span>
              </button>
              
              <button
                onClick={() => {
                  onEmployeeEdit?.(selectedEmployee);
                  setShowBottomSheet(false);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl"
              >
                <span className="text-2xl">✏️</span>
                <span className="text-sm font-medium text-orange-800">Изменить</span>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Контакты</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <span className="text-gray-900">{selectedEmployee.personalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✉️</span>
                    <span className="text-gray-900">{selectedEmployee.personalInfo.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Производительность</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      selectedEmployee.performance.qualityScore >= 90 ? 'text-green-600' :
                      selectedEmployee.performance.qualityScore >= 75 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedEmployee.performance.qualityScore}%
                    </div>
                    <div className="text-sm text-gray-600">Качество</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {selectedEmployee.performance.callsPerHour}
                    </div>
                    <div className="text-sm text-gray-600">Звонков/час</div>
                  </div>
                </div>
              </div>

              {selectedEmployee.skills.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Навыки</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill.name}
                      </span>
                    ))}
                    {selectedEmployee.skills.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        +{selectedEmployee.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Filters Bottom Sheet
  const FiltersBottomSheet: React.FC = () => {
    if (!showFilters) return null;

    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowFilters(false)}
        />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
          <div className="p-6">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-6">Фильтры</h3>
            
            <div className="space-y-6">
              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Быстрые фильтры</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Все', icon: '👥' },
                    { id: 'favorites', label: 'Избранные', icon: '❤️' },
                    { id: 'active', label: 'Активные', icon: '🟢' },
                    { id: 'recent', label: 'Недавние', icon: '🕒' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setFilters(prev => ({ ...prev, quickFilter: filter.id as any }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        filters.quickFilter === filter.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-lg">{filter.icon}</span>
                      <span className="font-medium">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Team Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Команда</label>
                <select
                  value={filters.team}
                  onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="">Все команды</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '', label: 'Все', icon: '👥' },
                    { value: 'active', label: 'Активные', icon: '🟢' },
                    { value: 'vacation', label: 'В отпуске', icon: '🟡' },
                    { value: 'inactive', label: 'Неактивные', icon: '⚪' }
                  ].map(status => (
                    <button
                      key={status.value}
                      onClick={() => setFilters(prev => ({ ...prev, status: status.value }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        filters.status === status.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-lg">{status.icon}</span>
                      <span className="text-sm font-medium">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({
                    search: '',
                    team: '',
                    status: '',
                    quickFilter: 'all'
                  });
                  setShowFilters(false);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-xl font-bold text-gray-900 flex-1">Сотрудники</h1>
            {selectionMode && selectedEmployees.size > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {selectedEmployees.size}
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Поиск сотрудников..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-base focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</span>
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-4 top-3.5 text-gray-400"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl"
            >
              <span className="text-lg">🔽</span>
              <span className="text-sm font-medium">Фильтры</span>
            </button>
            
            <div className="flex-1"></div>
            
            <div className="text-sm text-gray-600 px-3 py-2">
              {filteredEmployees.length} из {employees.length}
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="px-4 py-2">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Сотрудники не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEmployees.map(employee => {
              const isSelected = selectedEmployees.has(employee.id);
              const statusConfig = getStatusConfig(employee.status);
              const isSwipe = swipedEmployee === employee.id;

              return (
                <div key={employee.id} className="relative">
                  {/* Swipe Actions Background */}
                  {isSwipe && (
                    <div className="absolute inset-0 flex justify-end">
                      <div className="flex">
                        {swipeActions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => {
                              action.action(employee);
                              setSwipedEmployee(null);
                            }}
                            className={`w-20 flex flex-col items-center justify-center text-white ${action.color}`}
                          >
                            <span className="text-lg">{action.icon}</span>
                            <span className="text-xs">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Employee Card */}
                  <div
                    className={`bg-white rounded-xl p-4 border-2 transition-all transform ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
                    } ${isSwipe ? 'translate-x-[-240px]' : ''}`}
                    onClick={() => handleEmployeeTap(employee)}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      const startX = touch.clientX;
                      
                      const handleTouchMove = (e: TouchEvent) => {
                        const currentX = e.touches[0].clientX;
                        const diff = startX - currentX;
                        
                        if (diff > 100) {
                          setSwipedEmployee(employee.id);
                        } else if (diff < -50) {
                          setSwipedEmployee(null);
                        }
                      };
                      
                      const handleTouchEnd = () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      document.addEventListener('touchmove', handleTouchMove);
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onEmployeeToggle?.(employee.id)}
                          className="w-5 h-5 rounded text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}

                      <div className="relative">
                        <img
                          src={employee.personalInfo.photo || 'https://i.pravatar.cc/150?img=1'}
                          alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusConfig.color}`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-lg">
                          {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                        </h3>
                        <p className="text-gray-600 truncate">{employee.workInfo.position}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: employee.workInfo.team.color }}
                          ></div>
                          <span className="text-sm text-gray-500 truncate">{employee.workInfo.team.name}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(employee.id);
                          }}
                          className="p-1"
                        >
                          <span className="text-xl">
                            {favorites.has(employee.id) ? '❤️' : '🤍'}
                          </span>
                        </button>
                        
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            employee.performance.qualityScore >= 90 ? 'text-green-600' :
                            employee.performance.qualityScore >= 75 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {employee.performance.qualityScore}%
                          </div>
                          <div className="text-xs text-gray-500">Качество</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sheets */}
      <EmployeeBottomSheet />
      <FiltersBottomSheet />
    </div>
  );
};

export default MobileEmployeeList;