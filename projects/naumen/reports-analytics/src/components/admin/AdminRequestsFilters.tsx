import React, { useState } from 'react';
import { FilterState, Employee } from '../../types';
import { ChevronDown, Search } from 'lucide-react';

interface AdminRequestsFiltersProps {
  filterState: FilterState;
  onFilterChange: (filterState: FilterState) => void;
  employees: Employee[];
  loading?: boolean;
}

export const AdminRequestsFilters: React.FC<AdminRequestsFiltersProps> = ({
  filterState,
  onFilterChange,
  employees,
  loading = false
}) => {
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);

  const handleModeChange = (mode: FilterState['mode']) => {
    onFilterChange({
      ...filterState,
      mode,
      // Reset other filters when mode changes
      startDate: undefined,
      endDate: undefined,
      selectedEmployee: undefined,
      searchTerm: ''
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFilterChange({
      ...filterState,
      [field]: value ? new Date(value) : undefined
    });
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    onFilterChange({
      ...filterState,
      selectedEmployee: employee?.name,
      searchTerm: employee?.name || ''
    });
    setIsEmployeeDropdownOpen(false);
  };

  const handleSearchChange = (value: string) => {
    onFilterChange({
      ...filterState,
      searchTerm: value
    });
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(filterState.searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-6">
        {/* Radio Button Groups */}
        <div className="flex items-center space-x-6">
          {/* Current Requests */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="filterMode"
                value="current"
                checked={filterState.mode === 'current'}
                onChange={() => handleModeChange('current')}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                filterState.mode === 'current'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {filterState.mode === 'current' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Актуальные заявки
            </span>
          </label>

          {/* Period Requests */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="filterMode"
                value="period"
                checked={filterState.mode === 'period'}
                onChange={() => handleModeChange('period')}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                filterState.mode === 'period'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {filterState.mode === 'period' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Заявки за период
            </span>
          </label>

          {/* Employee Requests */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className="relative">
              <input
                type="radio"
                name="filterMode"
                value="employee"
                checked={filterState.mode === 'employee'}
                onChange={() => handleModeChange('employee')}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                filterState.mode === 'employee'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {filterState.mode === 'employee' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              По сотрудникам
            </span>
          </label>
        </div>

        {/* Date Range Controls */}
        <div className={`flex items-center space-x-4 ${
          filterState.mode !== 'period' ? 'opacity-50 pointer-events-none' : ''
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Начало</span>
            <input
              type="date"
              disabled={filterState.mode !== 'period'}
              value={filterState.startDate ? filterState.startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Окончание</span>
            <input
              type="date"
              disabled={filterState.mode !== 'period'}
              value={filterState.endDate ? filterState.endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>

        {/* Employee Search Dropdown */}
        <div className={`relative ${
          filterState.mode !== 'employee' ? 'opacity-50 pointer-events-none' : ''
        }`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск"
              disabled={filterState.mode !== 'employee'}
              value={filterState.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setIsEmployeeDropdownOpen(true)}
              className="w-64 border border-gray-300 rounded px-3 py-2 pl-10 pr-8 text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <button
              disabled={filterState.mode !== 'employee'}
              onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown */}
          {isEmployeeDropdownOpen && filterState.mode === 'employee' && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-gray-500 text-xs">{employee.department} - {employee.position}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  Сотрудники не найдены
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};