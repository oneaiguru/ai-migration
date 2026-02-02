// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeListContainer.tsx

import React, { useState, useEffect } from 'react';
import { Employee, Team, EmployeeFilters, BulkAction, ViewModes } from '../types/employee';

// ========================
// FOUNDATION COMPONENT 1: Employee List Container
// Based on successful patterns from Chat 6 (PersonalSchedule.tsx style)
// ========================

interface EmployeeListContainerProps {
  teamId?: string;
  showAll?: boolean;
}

const EmployeeListContainer: React.FC<EmployeeListContainerProps> = ({ 
  teamId, 
  showAll = true 
}) => {
  // State management following Chat 6 patterns
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewModes['current']>('grid');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<EmployeeFilters>({
    search: '',
    team: teamId || '',
    status: '',
    skill: '',
    position: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showInactive: false
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data with realistic structure (following Chat 6 data patterns)
  const generateMockEmployees = (): Employee[] => {
    return [
      {
        id: 'emp_001',
        employeeId: 'EMP001',
        personalInfo: {
          firstName: 'Динара',
          lastName: 'Абдуллаева',
          email: 'dinara.abdullaeva@company.com',
          phone: '+996555123456',
          photo: 'https://i.pravatar.cc/150?img=1',
          emergencyContact: {
            name: 'Марат Абдуллаев',
            phone: '+996555123457',
            relationship: 'супруг'
          }
        },        workInfo: {
          position: 'Старший оператор',
          team: { 
            id: 't1', 
            name: 'Группа поддержки', 
            color: '#3b82f6',
            managerId: 'mgr_001',
            memberCount: 12,
            targetUtilization: 0.85
          },
          manager: 'Иванов И.И.',
          hireDate: new Date('2022-03-15'),
          contractType: 'full-time',
          salary: 45000,
          workLocation: 'Офис Бишкек',
          department: 'Клиентская поддержка'
        },
        skills: [
          { 
            id: 's1', 
            name: 'Консультирование клиентов', 
            level: 5, 
            category: 'communication', 
            verified: true,
            lastAssessed: new Date('2024-01-15'),
            assessor: 'Иванов И.И.',
            certificationRequired: false
          },
          { 
            id: 's2', 
            name: 'CRM система', 
            level: 4, 
            category: 'technical', 
            verified: true,
            lastAssessed: new Date('2024-02-01'),
            assessor: 'Петров А.В.',
            certificationRequired: true
          }
        ],
        status: 'active',
        preferences: {
          preferredShifts: ['morning', 'day'],
          notifications: {
            email: true,
            sms: true,
            push: true,
            scheduleChanges: true,
            announcements: true,
            reminders: true
          },
          language: 'ru',
          workingHours: {
            start: '08:00',
            end: '17:00'
          }
        },
        performance: {
          averageHandleTime: 7.5,
          callsPerHour: 12.5,
          qualityScore: 94,
          adherenceScore: 87,
          customerSatisfaction: 4.8,
          lastEvaluation: new Date('2024-01-30')
        },
        certifications: [],
        metadata: {
          createdAt: new Date('2022-03-15'),
          updatedAt: new Date('2024-02-15'),
          createdBy: 'admin_001',
          lastModifiedBy: 'mgr_001',
          lastLogin: new Date('2024-02-14T09:30:00')
        }
      }
    ];
  };
  // Load employees (following Chat 6 async patterns)
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockData = generateMockEmployees();
        setEmployees(mockData);
      } catch (err) {
        setError('Ошибка загрузки данных сотрудников. Попробуйте еще раз.');
        console.error('Employee loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [teamId]);

  // Loading state (following Chat 6 loading patterns)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Загрузка сотрудников...</p>
            <p className="text-sm text-gray-600">Получение данных из системы</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (following Chat 6 error patterns)
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Ошибка загрузки данных</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with basic employee list placeholder */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление сотрудниками</h1>
        <p className="text-gray-600">
          Полное управление персоналом контакт-центра с детальной информацией о навыках и производительности
        </p>
        <div className="mt-6">
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Основные компоненты загружены</h3>
            <p className="text-gray-500">Система готова к интеграции всех компонентов</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeListContainer;