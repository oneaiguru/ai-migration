// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/HierarchyTreeView.tsx

import React, { useState, useMemo } from 'react';
import { Employee, Team } from '../types/employee';

// ========================
// HIERARCHY TREE VIEW - Organizational chart visualization
// Interactive org chart showing reporting relationships and team structure
// ========================

interface HierarchyTreeViewProps {
  employees: Employee[];
  teams: Team[];
  onEmployeeClick?: (employee: Employee) => void;
  onManagerChange?: (employeeId: string, newManagerId: string) => void;
  showPhotos?: boolean;
  showTeamColors?: boolean;
  expandable?: boolean;
}

interface HierarchyNode {
  employee: Employee;
  directReports: HierarchyNode[];
  level: number;
  teamMembers?: Employee[];
}

interface TreeSettings {
  layout: 'vertical' | 'horizontal';
  showPhotos: boolean;
  showTeamColors: boolean;
  showEmployeeCount: boolean;
  compactMode: boolean;
}

const HierarchyTreeView: React.FC<HierarchyTreeViewProps> = ({
  employees,
  teams,
  onEmployeeClick,
  onManagerChange,
  showPhotos = true,
  showTeamColors = true,
  expandable = true
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [settings, setSettings] = useState<TreeSettings>({
    layout: 'vertical',
    showPhotos: true,
    showTeamColors: true,
    showEmployeeCount: true,
    compactMode: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedEmployees, setHighlightedEmployees] = useState<Set<string>>(new Set());
  // Build hierarchy tree from flat employee list
  const hierarchyTree = useMemo(() => {
    const employeeMap = new Map<string, Employee>();
    const nodeMap = new Map<string, HierarchyNode>();
    
    // Create employee map
    employees.forEach(emp => {
      employeeMap.set(emp.id, emp);
    });
    
    // Create nodes for all employees
    employees.forEach(emp => {
      nodeMap.set(emp.id, {
        employee: emp,
        directReports: [],
        level: 0,
        teamMembers: []
      });
    });
    
    const roots: HierarchyNode[] = [];
    
    // Build parent-child relationships
    employees.forEach(emp => {
      const node = nodeMap.get(emp.id)!;
      const managerId = typeof emp.workInfo.manager === 'string' 
        ? emp.workInfo.manager 
        : emp.workInfo.manager?.id;
      
      if (managerId && employeeMap.has(managerId)) {
        const managerNode = nodeMap.get(managerId)!;
        managerNode.directReports.push(node);
        node.level = managerNode.level + 1;
      } else {
        // No manager found, this is a root node
        roots.push(node);
      }
    });
    
    // Sort direct reports by name
    const sortDirectReports = (node: HierarchyNode) => {
      node.directReports.sort((a, b) => 
        `${a.employee.personalInfo.firstName} ${a.employee.personalInfo.lastName}`
          .localeCompare(`${b.employee.personalInfo.firstName} ${b.employee.personalInfo.lastName}`)
      );
      node.directReports.forEach(sortDirectReports);
    };
    
    roots.forEach(sortDirectReports);
    
    return roots;
  }, [employees]);

  // Toggle node expansion
  const toggleNode = (employeeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Search functionality
  const filterEmployees = (term: string) => {
    if (!term) {
      setHighlightedEmployees(new Set());
      return;
    }
    
    const matching = employees
      .filter(emp => 
        emp.personalInfo.firstName.toLowerCase().includes(term.toLowerCase()) ||
        emp.personalInfo.lastName.toLowerCase().includes(term.toLowerCase()) ||
        emp.workInfo.position.toLowerCase().includes(term.toLowerCase())
      )
      .map(emp => emp.id);
    
    setHighlightedEmployees(new Set(matching));
    
    // Auto-expand paths to highlighted employees
    const newExpanded = new Set(expandedNodes);
    matching.forEach(empId => {
      const employee = employees.find(e => e.id === empId);
      if (employee) {
        // Expand all ancestors
        let currentManager = typeof employee.workInfo.manager === 'string' 
          ? employee.workInfo.manager 
          : employee.workInfo.manager?.id;
        
        while (currentManager) {
          newExpanded.add(currentManager);
          const manager = employees.find(e => e.id === currentManager);
          currentManager = manager ? (typeof manager.workInfo.manager === 'string' 
            ? manager.workInfo.manager 
            : manager.workInfo.manager?.id) : undefined;
        }
      }
    });
    
    setExpandedNodes(newExpanded);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterEmployees(term);
  };

  // Get employee stats
  const getEmployeeStats = (node: HierarchyNode): { total: number; active: number } => {
    let total = 1;
    let active = node.employee.status === 'active' ? 1 : 0;
    
    node.directReports.forEach(child => {
      const childStats = getEmployeeStats(child);
      total += childStats.total;
      active += childStats.active;
    });
    
    return { total, active };
  };

  // Render employee node
  const renderEmployeeNode = (node: HierarchyNode, isLast = false, prefix = '') => {
    const { employee, directReports } = node;
    const isExpanded = expandedNodes.has(employee.id);
    const hasDirectReports = directReports.length > 0;
    const isHighlighted = highlightedEmployees.has(employee.id);
    const stats = getEmployeeStats(node);
    
    return (
      <div key={employee.id} className="relative">
        {/* Employee Card */}
        <div className={`flex items-center mb-2 p-3 rounded-lg border transition-all ${
          isHighlighted 
            ? 'bg-yellow-50 border-yellow-300 shadow-md' 
            : selectedEmployee?.id === employee.id
              ? 'bg-blue-50 border-blue-300 shadow-md'
              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}>
          {/* Expand/Collapse Button */}
          {hasDirectReports && (
            <button
              onClick={() => toggleNode(employee.id)}
              className="mr-3 p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶️
              </span>
            </button>
          )}
          
          {/* Employee Photo */}
          {settings.showPhotos && (
            <img
              src={employee.personalInfo.photo || 'https://i.pravatar.cc/50?img=1'}
              alt={`${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`}
              className="w-12 h-12 rounded-full mr-3 border-2 border-gray-200"
            />
          )}
          
          {/* Employee Info */}
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => {
              setSelectedEmployee(employee);
              onEmployeeClick?.(employee);
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {employee.personalInfo.firstName} {employee.personalInfo.lastName}
              </h3>
              
              {/* Team Color Indicator */}
              {settings.showTeamColors && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: employee.workInfo.team.color }}
                  title={employee.workInfo.team.name}
                ></div>
              )}
              
              {/* Status Badge */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                employee.status === 'active' ? 'bg-green-100 text-green-800' :
                employee.status === 'vacation' ? 'bg-yellow-100 text-yellow-800' :
                employee.status === 'probation' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {employee.status === 'active' ? 'Активен' :
                 employee.status === 'vacation' ? 'Отпуск' :
                 employee.status === 'probation' ? 'Испытательный' : 'Неактивен'}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{employee.workInfo.position}</span>
              <span className="text-gray-400">•</span>
              <span>{employee.workInfo.team.name}</span>
              
              {/* Employee Count */}
              {settings.showEmployeeCount && hasDirectReports && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">
                    {stats.total - 1} подчиненных ({stats.active - (employee.status === 'active' ? 1 : 0)} активных)
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Performance Indicator */}
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              {employee.performance.qualityScore}%
            </div>
            <div className="text-xs text-gray-500">Качество</div>
          </div>
        </div>
        
        {/* Direct Reports */}
        {hasDirectReports && isExpanded && (
          <div className="ml-8 border-l-2 border-gray-200 pl-4">
            {directReports.map((childNode, index) => 
              renderEmployeeNode(
                childNode, 
                index === directReports.length - 1,
                prefix + (isLast ? '    ' : '│   ')
              )
            )}
          </div>
        )}
      </div>
    );
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных об организационной структуре</h3>
          <p className="text-gray-500">Добавьте сотрудников для построения иерархии</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Организационная структура</h1>
            <p className="text-gray-600">
              Интерактивная схема подчиненности и командной структуры
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск сотрудника..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            
            <button
              onClick={() => setExpandedNodes(new Set(employees.map(e => e.id)))}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Развернуть все
            </button>
            
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Свернуть все
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Настройки отображения</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showPhotos}
                onChange={(e) => setSettings(prev => ({ ...prev, showPhotos: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Показать фото</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showTeamColors}
                onChange={(e) => setSettings(prev => ({ ...prev, showTeamColors: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Цвета команд</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showEmployeeCount}
                onChange={(e) => setSettings(prev => ({ ...prev, showEmployeeCount: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Счетчики</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => setSettings(prev => ({ ...prev, compactMode: e.target.checked }))}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Компактный вид</span>
            </label>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
            <div className="text-sm text-blue-800">Всего сотрудников</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {employees.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm text-green-800">Активных</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{teams.length}</div>
            <div className="text-sm text-purple-800">Команд</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{hierarchyTree.length}</div>
            <div className="text-sm text-orange-800">Руководителей</div>
          </div>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Структура подчиненности</h2>
        
        {hierarchyTree.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🔍</div>
            <p className="text-gray-500">Нет сотрудников, соответствующих критериям поиска</p>
          </div>
        ) : (
          <div className="space-y-2">
            {hierarchyTree.map((rootNode, index) => 
              renderEmployeeNode(rootNode, index === hierarchyTree.length - 1)
            )}
          </div>
        )}
      </div>

      {/* Selected Employee Details */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Детали сотрудника</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Основная информация</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Email:</span> {selectedEmployee.personalInfo.email}</div>
                <div><span className="text-gray-500">Телефон:</span> {selectedEmployee.personalInfo.phone}</div>
                <div><span className="text-gray-500">Дата найма:</span> {selectedEmployee.workInfo.hireDate.toLocaleDateString()}</div>
                <div><span className="text-gray-500">Тип контракта:</span> {selectedEmployee.workInfo.contractType}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Производительность</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Качество:</span> {selectedEmployee.performance.qualityScore}%</div>
                <div><span className="text-gray-500">Соблюдение:</span> {selectedEmployee.performance.adherenceScore}%</div>
                <div><span className="text-gray-500">Звонков/час:</span> {selectedEmployee.performance.callsPerHour}</div>
                <div><span className="text-gray-500">Время обработки:</span> {selectedEmployee.performance.averageHandleTime} мин</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTreeView;