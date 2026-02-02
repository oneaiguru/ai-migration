// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/CertificationTracker.tsx

import React, { useState, useMemo } from 'react';
import { Employee, Certification } from '../types/employee';

// ========================
// CERTIFICATION TRACKER - Training and certification management
// Comprehensive tracking of employee certifications, training progress, and compliance
// ========================

interface CertificationTrackerProps {
  employees: Employee[];
  onCertificationUpdate?: (employeeId: string, certifications: Certification[]) => void;
  onTrainingAssign?: (employeeIds: string[], trainingId: string) => void;
  onCertificationRenew?: (employeeId: string, certificationId: string) => void;
}

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  duration: number; // hours
  category: 'mandatory' | 'optional' | 'role-specific';
  skills: string[];
  expirationPeriod?: number; // months
  provider: string;
  cost?: number;
  format: 'online' | 'classroom' | 'hybrid';
  prerequisites?: string[];
  certificationAwarded: boolean;
}

interface TrainingProgress {
  employeeId: string;
  trainingId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'expired' | 'failed';
  startDate?: Date;
  completionDate?: Date;
  expirationDate?: Date;
  score?: number;
  attempts: number;
  lastActivity: Date;
}

interface CertificationAlert {
  type: 'expiring' | 'expired' | 'missing' | 'renewal-due';
  employeeId: string;
  certificationId?: string;
  trainingId?: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
}

const CertificationTracker: React.FC<CertificationTrackerProps> = ({
  employees,
  onCertificationUpdate,
  onTrainingAssign,
  onCertificationRenew
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'training' | 'compliance'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedTraining, setSelectedTraining] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: ''
  });

  // Mock training programs
  const trainingPrograms: TrainingProgram[] = [
    {
      id: 'customer-service-101',
      name: 'Основы обслуживания клиентов',
      description: 'Базовый курс по работе с клиентами для новых сотрудников',
      duration: 16,
      category: 'mandatory',
      skills: ['Коммуникация', 'Решение проблем'],
      expirationPeriod: 24,
      provider: 'Учебный центр компании',
      format: 'hybrid',
      certificationAwarded: true
    },
    {
      id: 'crm-advanced',
      name: 'Продвинутая работа с CRM',
      description: 'Расширенные возможности CRM системы',
      duration: 8,
      category: 'role-specific',
      skills: ['CRM система', 'Аналитика'],
      expirationPeriod: 12,
      provider: 'Внешний провайдер',
      cost: 15000,
      format: 'online',
      prerequisites: ['crm-basics'],
      certificationAwarded: true
    },
    {
      id: 'safety-training',
      name: 'Охрана труда и безопасность',
      description: 'Обязательное обучение по охране труда',
      duration: 4,
      category: 'mandatory',
      skills: ['Безопасность'],
      expirationPeriod: 12,
      provider: 'Сертифицированный центр',
      format: 'classroom',
      certificationAwarded: true
    }
  ];

  // Mock training progress data
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([
    {
      employeeId: 'emp_001',
      trainingId: 'customer-service-101',
      status: 'completed',
      startDate: new Date('2024-01-15'),
      completionDate: new Date('2024-01-22'),
      expirationDate: new Date('2026-01-22'),
      score: 92,
      attempts: 1,
      lastActivity: new Date('2024-01-22')
    },
    {
      employeeId: 'emp_001',
      trainingId: 'safety-training',
      status: 'completed',
      startDate: new Date('2024-02-01'),
      completionDate: new Date('2024-02-01'),
      expirationDate: new Date('2025-02-01'),
      score: 85,
      attempts: 1,
      lastActivity: new Date('2024-02-01')
    },
    {
      employeeId: 'emp_002',
      trainingId: 'customer-service-101',
      status: 'in-progress',
      startDate: new Date('2024-02-10'),
      attempts: 1,
      lastActivity: new Date('2024-02-15')
    }
  ]);

  // Calculate certification alerts
  const certificationAlerts = useMemo((): CertificationAlert[] => {
    const alerts: CertificationAlert[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    employees.forEach(employee => {
      // Check for expiring certifications
      employee.certifications.forEach(cert => {
        if (cert.expirationDate) {
          if (cert.expirationDate < now && cert.status === 'active') {
            alerts.push({
              type: 'expired',
              employeeId: employee.id,
              certificationId: cert.id,
              message: `Сертификат "${cert.name}" истек`,
              priority: 'high',
              dueDate: cert.expirationDate
            });
          } else if (cert.expirationDate < thirtyDaysFromNow && cert.status === 'active') {
            alerts.push({
              type: 'expiring',
              employeeId: employee.id,
              certificationId: cert.id,
              message: `Сертификат "${cert.name}" истекает через ${Math.ceil((cert.expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))} дней`,
              priority: 'medium',
              dueDate: cert.expirationDate
            });
          }
        }
      });

      // Check for missing mandatory training
      const mandatoryTraining = trainingPrograms.filter(t => t.category === 'mandatory');
      const employeeProgress = trainingProgress.filter(p => p.employeeId === employee.id);
      
      mandatoryTraining.forEach(training => {
        const progress = employeeProgress.find(p => p.trainingId === training.id);
        if (!progress || progress.status === 'expired' || progress.status === 'failed') {
          alerts.push({
            type: 'missing',
            employeeId: employee.id,
            trainingId: training.id,
            message: `Требуется обучение: ${training.name}`,
            priority: 'high'
          });
        }
      });
    });

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [employees, trainingProgress]);

  // Get employee progress summary
  const getEmployeeProgressSummary = (employeeId: string) => {
    const progress = trainingProgress.filter(p => p.employeeId === employeeId);
    const completed = progress.filter(p => p.status === 'completed').length;
    const inProgress = progress.filter(p => p.status === 'in-progress').length;
    const expired = progress.filter(p => p.status === 'expired').length;
    
    return { completed, inProgress, expired, total: progress.length };
  };

  // Get status configuration
  const getStatusConfig = (status: TrainingProgress['status']) => {
    const configs = {
      'not-started': { color: 'bg-gray-100 text-gray-800', text: 'Не начато', icon: '⏸️' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', text: 'В процессе', icon: '▶️' },
      'completed': { color: 'bg-green-100 text-green-800', text: 'Завершено', icon: '✅' },
      'expired': { color: 'bg-red-100 text-red-800', text: 'Истекло', icon: '❌' },
      'failed': { color: 'bg-orange-100 text-orange-800', text: 'Не сдано', icon: '⚠️' }
    };
    return configs[status];
  };

  // Training assignment modal
  const TrainingAssignmentModal: React.FC = () => {
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    
    if (!showAssignModal) return null;

    const training = trainingPrograms.find(t => t.id === selectedTraining);
    if (!training) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900">Назначить обучение</h3>
            <p className="text-gray-600 mt-1">{training.name}</p>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Выберите сотрудников:</h4>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {employees.map(employee => {
                  const isSelected = selectedEmployees.has(employee.id);
                  const progress = trainingProgress.find(p => 
                    p.employeeId === employee.id && p.trainingId === training.id
                  );
                  
                  return (
                    <div
                      key={employee.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedEmployees);
                        if (newSelected.has(employee.id)) {
                          newSelected.delete(employee.id);
                        } else {
                          newSelected.add(employee.id);
                        }
                        setSelectedEmployees(newSelected);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-blue-600"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{employee.workInfo.position}</p>
                          </div>
                        </div>
                        
                        {progress && (
                          <span className={`px-2 py-1 text-xs rounded ${getStatusConfig(progress.status).color}`}>
                            {getStatusConfig(progress.status).text}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Информация об обучении:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Длительность:</span> {training.duration} часов
                </div>
                <div>
                  <span className="text-blue-700">Формат:</span> {
                    training.format === 'online' ? 'Онлайн' :
                    training.format === 'classroom' ? 'Очно' : 'Смешанный'
                  }
                </div>
                <div>
                  <span className="text-blue-700">Категория:</span> {
                    training.category === 'mandatory' ? 'Обязательное' :
                    training.category === 'optional' ? 'Опциональное' : 'По роли'
                  }
                </div>
                {training.cost && (
                  <div>
                    <span className="text-blue-700">Стоимость:</span> {training.cost} сом
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
            <button
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                onTrainingAssign?.(Array.from(selectedEmployees), training.id);
                setShowAssignModal(false);
                setSelectedEmployees(new Set());
              }}
              disabled={selectedEmployees.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Назначить обучение ({selectedEmployees.size})
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Управление сертификациями</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-medium mb-2 uppercase tracking-wide">
              Демонстрационный модуль
            </span>
            <p className="text-gray-600">
              Отслеживание обучения, сертификаций и соответствия требованиям
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span className="mr-2">🎓</span>
              Назначить обучение
            </button>
          </div>
        </div>

        {/* Alerts Summary */}
        {certificationAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-1">
                  Требуют внимания: {certificationAlerts.length} уведомлений
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="text-red-800">
                    Истекшие: {certificationAlerts.filter(a => a.type === 'expired').length}
                  </div>
                  <div className="text-red-800">
                    Истекают: {certificationAlerts.filter(a => a.type === 'expiring').length}
                  </div>
                  <div className="text-red-800">
                    Отсутствуют: {certificationAlerts.filter(a => a.type === 'missing').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Обзор', icon: '📊' },
            { id: 'certifications', label: 'Сертификации', icon: '🏆' },
            { id: 'training', label: 'Обучение', icon: '🎓' },
            { id: 'compliance', label: 'Соответствие', icon: '✅' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Активные сертификации</p>
                    <p className="text-2xl font-bold text-green-900">
                      {employees.reduce((sum, emp) => sum + emp.certifications.filter(c => c.status === 'active').length, 0)}
                    </p>
                  </div>
                  <span className="text-3xl text-green-600">🏆</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">В процессе обучения</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {trainingProgress.filter(p => p.status === 'in-progress').length}
                    </p>
                  </div>
                  <span className="text-3xl text-blue-600">📚</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 text-sm font-medium">Истекают скоро</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {certificationAlerts.filter(a => a.type === 'expiring').length}
                    </p>
                  </div>
                  <span className="text-3xl text-yellow-600">⏰</span>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Требуют действий</p>
                    <p className="text-2xl font-bold text-red-900">
                      {certificationAlerts.filter(a => a.type === 'expired' || a.type === 'missing').length}
                    </p>
                  </div>
                  <span className="text-3xl text-red-600">⚠️</span>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние уведомления</h3>
              <div className="space-y-3">
                {certificationAlerts.slice(0, 5).map((alert, index) => {
                  const employee = employees.find(e => e.id === alert.employeeId);
                  if (!employee) return null;

                  return (
                    <div key={index} className={`border rounded-lg p-4 ${
                      alert.priority === 'high' ? 'border-red-200 bg-red-50' :
                      alert.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {alert.type === 'expired' ? '❌' :
                             alert.type === 'expiring' ? '⏰' :
                             alert.type === 'missing' ? '⚠️' : '🔄'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.personalInfo.firstName} {employee.personalInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {alert.type === 'expiring' && (
                            <button
                              onClick={() => {
                                if (alert.certificationId) {
                                  onCertificationRenew?.(alert.employeeId, alert.certificationId);
                                }
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Продлить
                            </button>
                          )}
                          {alert.type === 'missing' && (
                            <button
                              onClick={() => {
                                if (alert.trainingId) {
                                  setSelectedTraining(alert.trainingId);
                                  setShowAssignModal(true);
                                }
                              }}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Назначить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            {/* Training Programs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Программы обучения</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trainingPrograms.map(training => {
                  const assignedCount = trainingProgress.filter(p => p.trainingId === training.id).length;
                  const completedCount = trainingProgress.filter(p => 
                    p.trainingId === training.id && p.status === 'completed'
                  ).length;

                  return (
                    <div key={training.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{training.name}</h4>
                          <p className="text-sm text-gray-600">{training.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTraining(training.id);
                            setShowAssignModal(true);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Назначить
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Длительность:</span> {training.duration}ч
                        </div>
                        <div>
                          <span className="text-gray-600">Формат:</span> {
                            training.format === 'online' ? 'Онлайн' :
                            training.format === 'classroom' ? 'Очно' : 'Смешанный'
                          }
                        </div>
                        <div>
                          <span className="text-gray-600">Назначено:</span> {assignedCount}
                        </div>
                        <div>
                          <span className="text-gray-600">Завершено:</span> {completedCount}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded ${
                          training.category === 'mandatory' ? 'bg-red-100 text-red-800' :
                          training.category === 'role-specific' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {training.category === 'mandatory' ? 'Обязательное' :
                           training.category === 'role-specific' ? 'По роли' : 'Опциональное'}
                        </span>
                        
                        {training.certificationAwarded && (
                          <span className="text-sm text-green-600">🏆 Сертификация</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-6xl text-gray-400 mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Отчеты о соответствии</h3>
            <p className="text-gray-500 mb-4">
              Детальные отчеты по соответствию требованиям и регулятивным нормам
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">Планируемые возможности:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Автоматические отчеты о соответствии</li>
                <li>• Уведомления о нарушениях</li>
                <li>• Интеграция с внешними системами</li>
                <li>• Аудиторские следы</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-6xl text-gray-400 mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Управление сертификациями</h3>
            <p className="text-gray-500">Детальное управление сертификатами сотрудников</p>
          </div>
        )}
      </div>

      {/* Training Assignment Modal */}
      <TrainingAssignmentModal />
    </div>
  );
};

export default CertificationTracker;
