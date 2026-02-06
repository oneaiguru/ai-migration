// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeePhotoGallery.tsx

import React, { useState, useMemo } from 'react';
import { Employee, Team } from '../types/employee';

// ========================
// EMPLOYEE PHOTO GALLERY - Photo-centric employee directory
// Professional HR-style photo gallery with filtering and search
// ========================

interface EmployeePhotoGalleryProps {
  employees: Employee[];
  teams: Team[];
  onEmployeeClick?: (employee: Employee) => void;
  onEmployeeEdit?: (employee: Employee) => void;
  selectedEmployees?: Set<string>;
  onEmployeeSelect?: (employeeId: string) => void;
  showSelectionMode?: boolean;
}

interface GalleryFilters {
  search: string;
  team: string;
  status: string;
  department: string;
}

interface GallerySettings {
  photoSize: 'small' | 'medium' | 'large';
  showNames: boolean;
  showPositions: boolean;
  showTeams: boolean;
  showStatus: boolean;
  columns: number;
}

const EmployeePhotoGallery: React.FC<EmployeePhotoGalleryProps> = ({
  employees,
  teams,
  onEmployeeClick,
  onEmployeeEdit,
  selectedEmployees = new Set(),
  onEmployeeSelect,
  showSelectionMode = false
}) => {
  const [filters, setFilters] = useState<GalleryFilters>({
    search: '',
    team: '',
    status: '',
    department: ''
  });

  const [settings, setSettings] = useState<GallerySettings>({
    photoSize: 'medium',
    showNames: true,
    showPositions: true,
    showTeams: true,
    showStatus: true,
    columns: 6
  });
  // Photo size configurations
  const photoSizeConfig = {
    small: { size: 'w-16 h-16', container: 'w-20', text: 'text-xs' },
    medium: { size: 'w-20 h-20', container: 'w-24', text: 'text-sm' },
    large: { size: 'w-24 h-24', container: 'w-28', text: 'text-base' }
  };

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = !filters.search ||
        employee.personalInfo.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.personalInfo.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.workInfo.position.toLowerCase().includes(filters.search.toLowerCase()) ||
        employee.personalInfo.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTeam = !filters.team || employee.workInfo.team.id === filters.team;
      const matchesStatus = !filters.status || employee.status === filters.status;
      const matchesDepartment = !filters.department || employee.workInfo.department === filters.department;

      return matchesSearch && matchesTeam && matchesStatus && matchesDepartment;
    });
  }, [employees, filters]);

  // Get status configuration
  const getStatusConfig = (status: Employee['status']) => {
    const configs = {
      active: { color: 'bg-green-500', label: 'Активен' },
      vacation: { color: 'bg-yellow-500', label: 'В отпуске' },
      probation: { color: 'bg-blue-500', label: 'Испытательный' },
      inactive: { color: 'bg-gray-400', label: 'Неактивен' },
      terminated: { color: 'bg-red-500', label: 'Уволен' }
    };
    return configs[status] || configs.inactive;
  };

  // Get unique departments
  const departments = useMemo(() => {
    const unique = new Set(employees.map(emp => emp.workInfo.department));
    return Array.from(unique);
  }, [employees]);

  // Handle employee selection
  const handleEmployeeSelect = (employeeId: string) => {
    if (onEmployeeSelect) {
      onEmployeeSelect(employeeId);
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Галерея сотрудников пуста</h3>
          <p className="text-gray-500">Добавьте сотрудников для создания галереи фотографий</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Галерея сотрудников</h1>
            <p className="text-gray-600">
              Фото-каталог всех сотрудников с возможностью поиска и фильтрации
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              📸 Массовая загрузка фото
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              📤 Экспорт галереи
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="vacation">В отпуске</option>
              <option value="probation">На испытательном</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Отдел</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Все отделы</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gallery Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Настройки отображения</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Размер фото</label>
              <select
                value={settings.photoSize}
                onChange={(e) => setSettings(prev => ({ ...prev, photoSize: e.target.value as any }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">Малый</option>
                <option value="medium">Средний</option>
                <option value="large">Большой</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showNames}
                  onChange={(e) => setSettings(prev => ({ ...prev, showNames: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Имена</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showPositions}
                  onChange={(e) => setSettings(prev => ({ ...prev, showPositions: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Должности</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showTeams}
                  onChange={(e) => setSettings(prev => ({ ...prev, showTeams: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Команды</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.showStatus}
                  onChange={(e) => setSettings(prev => ({ ...prev, showStatus: e.target.checked }))}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Статусы</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Колонки</label>
              <select
                value={settings.columns}
                onChange={(e) => setSettings(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={10}>10</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-600">
            Показано <span className="font-semibold">{filteredEmployees.length}</span> из <span className="font-semibold">{employees.length}</span> сотрудников
          </p>
          
          {showSelectionMode && (
            <p className="text-sm text-blue-600">
              Выбрано: {selectedEmployees.size} сотрудник(ов)
            </p>
          )}
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Фотогалерея</h2>
        
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Сотрудники не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить критерии поиска или фильтры</p>
          </div>
        ) : (
          <div 
            className="grid gap-6"
            style={{ 
              gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))` 
            }}
          >
            {filteredEmployees.map((employee) => {
              const statusConfig = getStatusConfig(employee.status);
              const isSelected = selectedEmployees.has(employee.id);
              const sizeConfig = photoSizeConfig[settings.photoSize];
              
              return (
                <div
                  key={employee.id}
                  className={`relative group cursor-pointer transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
                  }`}
                  onClick={() => {
                    if (showSelectionMode) {
                      handleEmployeeSelect(employee.id);
                    } else {
                      onEmployeeClick?.(employee);
                    }
                  }}
                >
                  {/* Selection Checkbox */}
                  {showSelectionMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleEmployeeSelect(employee.id);
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 bg-white border-gray-300"
                      />
                    </div>
                  )}

                  {/* Employee Card */}
                  <div className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Photo with Status Indicator */}
                    <div className="relative mx-auto mb-3" style={{ width: 'fit-content' }}>
                      <img
                        src={employee.personalInfo.photo || 'https://i.pravatar.cc/150?img=1'}
                        alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
                        className={`${sizeConfig.size} rounded-full object-cover border-4 border-gray-100 shadow-sm group-hover:shadow-md transition-shadow`}
                      />
                      
                      {/* Status Indicator */}
                      {settings.showStatus && (
                        <div 
                          className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusConfig.color} rounded-full border-2 border-white shadow-sm`}
                          title={statusConfig.label}
                        ></div>
                      )}
                    </div>

                    {/* Employee Info */}
                    <div className="space-y-1">
                      {settings.showNames && (
                        <h3 className={`font-semibold text-gray-900 ${sizeConfig.text} leading-tight`}>
                          {employee.personalInfo.firstName}
                        </h3>
                      )}
                      {settings.showNames && (
                        <h3 className={`font-semibold text-gray-900 ${sizeConfig.text} leading-tight`}>
                          {employee.personalInfo.lastName}
                        </h3>
                      )}
                      
                      {settings.showPositions && (
                        <p className={`text-gray-600 ${sizeConfig.text === 'text-xs' ? 'text-xs' : 'text-sm'} leading-tight`}>
                          {employee.workInfo.position}
                        </p>
                      )}
                      
                      {settings.showTeams && (
                        <div className="flex items-center justify-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: employee.workInfo.team.color }}
                          ></div>
                          <span className={`text-gray-500 ${sizeConfig.text === 'text-xs' ? 'text-xs' : 'text-sm'}`}>
                            {employee.workInfo.team.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEmployeeClick?.(employee);
                          }}
                          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                          title="Просмотр"
                        >
                          <span className="text-sm">👁️</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEmployeeEdit?.(employee);
                          }}
                          className="p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                          title="Редактировать"
                        >
                          <span className="text-sm">✏️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistics Footer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика галереи</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {employees.filter(e => e.personalInfo.photo).length}
            </div>
            <div className="text-sm text-gray-600">С фотографиями</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {employees.filter(e => !e.personalInfo.photo).length}
            </div>
            <div className="text-sm text-gray-600">Без фотографий</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Активных</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {departments.length}
            </div>
            <div className="text-sm text-gray-600">Отделов</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePhotoGallery;