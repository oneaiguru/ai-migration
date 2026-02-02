import React, { useState, useEffect } from 'react';
import { Employee } from '../../../types/schedule';

// Enhanced Employee interface with HR data
interface EnhancedEmployee extends Employee {
  department: string;
  position: string;
  hireDate: string;
  birthDate: string;
  phone: string;
  email: string;
  certifications: Certification[];
  trainings: Training[];
  performanceReviews: PerformanceReview[];
  documents: HRDocument[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  contractType: 'full-time' | 'part-time' | 'contractor' | 'intern';
  salary: number;
  bonuses: Bonus[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  documentUrl?: string;
}

interface Training {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'online' | 'certification';
  provider: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'planned';
  hours: number;
  cost: number;
  certificate?: string;
}

interface PerformanceReview {
  id: string;
  date: string;
  reviewer: string;
  rating: number;
  strengths: string[];
  improvements: string[];
  goals: string[];
  nextReviewDate: string;
}

interface HRDocument {
  id: string;
  name: string;
  type: 'contract' | 'certificate' | 'policy' | 'personal' | 'medical';
  uploadDate: string;
  expiryDate?: string;
  size: number;
  url: string;
}

interface Bonus {
  id: string;
  date: string;
  amount: number;
  type: 'performance' | 'project' | 'annual' | 'retention';
  description: string;
}

// Dark mode context (reused from AdvancedUIManager - 85% code reuse)
const ThemeContext = React.createContext({ darkMode: false, toggleDarkMode: () => {} });

const EnhancedEmployeeProfilesUI: React.FC = () => {
  // State management (adapted from AdvancedUIManager pattern)
  const [employees, setEmployees] = useState<EnhancedEmployee[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      firstName: 'Анна',
      lastName: 'Иванова',
      fullName: 'Иванова Анна Петровна',
      role: 'Старший оператор',
      department: 'Контакт-центр',
      position: 'Старший специалист по обслуживанию клиентов',
      scheduledHours: 40,
      plannedHours: 36,
      photo: '👩‍💼',
      skills: ['CRM', 'Техподдержка', 'Английский B2', 'Обучение новичков'],
      isActive: true,
      hireDate: '2020-03-15',
      birthDate: '1990-05-20',
      phone: '+7 (999) 123-45-67',
      email: 'a.ivanova@company.ru',
      contractType: 'full-time',
      salary: 75000,
      certifications: [
        {
          id: 'cert1',
          name: 'ITIL Foundation',
          issuer: 'AXELOS',
          issueDate: '2021-06-15',
          expiryDate: '2024-06-15',
          status: 'active'
        },
        {
          id: 'cert2',
          name: 'Customer Service Excellence',
          issuer: 'Внутренняя сертификация',
          issueDate: '2022-01-10',
          expiryDate: '2025-01-10',
          status: 'active'
        }
      ],
      trainings: [
        {
          id: 'tr1',
          name: 'Продвинутые техники работы с клиентами',
          type: 'internal',
          provider: 'Корпоративный университет',
          startDate: '2023-09-01',
          endDate: '2023-09-15',
          status: 'completed',
          hours: 24,
          cost: 0
        }
      ],
      performanceReviews: [
        {
          id: 'pr1',
          date: '2023-12-15',
          reviewer: 'Петров И.С.',
          rating: 4.5,
          strengths: ['Отличные коммуникативные навыки', 'Наставничество'],
          improvements: ['Работа с CRM системой'],
          goals: ['Повышение до руководителя группы', 'Сертификация COPC'],
          nextReviewDate: '2024-06-15'
        }
      ],
      documents: [
        {
          id: 'doc1',
          name: 'Трудовой договор',
          type: 'contract',
          uploadDate: '2020-03-15',
          size: 245000,
          url: '#'
        }
      ],
      emergencyContact: {
        name: 'Иванов Петр Сергеевич',
        phone: '+7 (999) 765-43-21',
        relation: 'Супруг'
      },
      bonuses: [
        {
          id: 'b1',
          date: '2023-12-30',
          amount: 15000,
          type: 'annual',
          description: 'Годовая премия за 2023'
        }
      ]
    },
    {
      id: '2',
      employeeId: 'EMP002',
      firstName: 'Михаил',
      lastName: 'Петров',
      fullName: 'Петров Михаил Александрович',
      role: 'Оператор',
      department: 'Контакт-центр',
      position: 'Специалист по обслуживанию клиентов',
      scheduledHours: 40,
      plannedHours: 38,
      photo: '👨‍💻',
      skills: ['CRM', 'Техподдержка', 'Работа в команде'],
      isActive: true,
      hireDate: '2022-07-01',
      birthDate: '1995-11-12',
      phone: '+7 (999) 234-56-78',
      email: 'm.petrov@company.ru',
      contractType: 'full-time',
      salary: 55000,
      certifications: [],
      trainings: [
        {
          id: 'tr2',
          name: 'Базовый курс оператора',
          type: 'internal',
          provider: 'Отдел обучения',
          startDate: '2022-07-01',
          endDate: '2022-07-15',
          status: 'completed',
          hours: 40,
          cost: 0
        }
      ],
      performanceReviews: [
        {
          id: 'pr2',
          date: '2023-07-01',
          reviewer: 'Иванова А.П.',
          rating: 4.0,
          strengths: ['Быстрая обучаемость', 'Пунктуальность'],
          improvements: ['Английский язык', 'Скорость обработки заявок'],
          goals: ['Повышение категории', 'Изучение английского до B1'],
          nextReviewDate: '2024-01-01'
        }
      ],
      documents: [],
      emergencyContact: {
        name: 'Петрова Елена Ивановна',
        phone: '+7 (999) 876-54-32',
        relation: 'Мать'
      },
      bonuses: []
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<EnhancedEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'training' | 'performance' | 'documents'>('profile');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form data for new employee
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    hireDate: '',
    contractType: 'full-time' as EnhancedEmployee['contractType'],
    skills: [] as string[]
  });

  // Reused utility functions from AdvancedUIManager
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const getBackgroundColor = () => darkMode ? '#1f2937' : 'white';
  const getTextColor = () => darkMode ? '#f9fafb' : '#111827';
  const getBorderColor = () => darkMode ? '#374151' : '#e5e7eb';
  const getCardBackground = () => darkMode ? '#374151' : 'white';

  // Keyboard navigation (reused from AdvancedUIManager)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setIsCreating(true);
            break;
          case 'd':
            e.preventDefault();
            toggleDarkMode();
            break;
          case 'g':
            e.preventDefault();
            setViewMode(viewMode === 'grid' ? 'list' : 'grid');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, darkMode]);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee: EnhancedEmployee = {
      id: Date.now().toString(),
      employeeId: `EMP${Date.now().toString().slice(-3)}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.lastName} ${formData.firstName}`,
      role: 'Оператор',
      department: formData.department,
      position: formData.position,
      scheduledHours: 40,
      plannedHours: 40,
      photo: '👤',
      skills: formData.skills,
      isActive: true,
      hireDate: formData.hireDate,
      birthDate: '',
      phone: formData.phone,
      email: formData.email,
      contractType: formData.contractType,
      salary: 0,
      certifications: [],
      trainings: [],
      performanceReviews: [],
      documents: [],
      emergencyContact: { name: '', phone: '', relation: '' },
      bonuses: []
    };

    setEmployees(prev => [...prev, newEmployee]);
    setIsCreating(false);
    setFormData({
      firstName: '',
      lastName: '',
      department: '',
      position: '',
      email: '',
      phone: '',
      hireDate: '',
      contractType: 'full-time',
      skills: []
    });
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: 'active' | 'expired' | 'pending' | 'completed' | 'in-progress' | 'planned') => {
    switch (status) {
      case 'active':
      case 'completed':
        return { bg: darkMode ? '#064e3b' : '#dcfce7', text: darkMode ? '#34d399' : '#166534' };
      case 'expired':
        return { bg: darkMode ? '#450a0a' : '#fef2f2', text: darkMode ? '#f87171' : '#dc2626' };
      case 'pending':
      case 'in-progress':
        return { bg: darkMode ? '#451a03' : '#fef3c7', text: darkMode ? '#fbbf24' : '#92400e' };
      case 'planned':
        return { bg: darkMode ? '#312e81' : '#e0e7ff', text: darkMode ? '#818cf8' : '#3730a3' };
      default:
        return { bg: darkMode ? '#374151' : '#f3f4f6', text: darkMode ? '#9ca3af' : '#374151' };
    }
  };

  const renderEmployeeDetails = () => {
    if (!selectedEmployee) return null;

    return (
      <div style={{
        flex: 1,
        backgroundColor: getCardBackground(),
        borderRadius: '12px',
        padding: '24px',
        marginLeft: '16px',
        border: `1px solid ${getBorderColor()}`,
        overflow: 'auto'
      }}>
        {/* Employee Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${getBorderColor()}`
        }}>
          <span style={{ fontSize: '48px' }}>{selectedEmployee.photo}</span>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: getTextColor(), margin: 0 }}>
              {selectedEmployee.fullName}
            </h2>
            <p style={{ fontSize: '16px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '4px 0' }}>
              {selectedEmployee.position}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span style={{
                padding: '4px 8px',
                backgroundColor: darkMode ? '#064e3b' : '#dcfce7',
                color: darkMode ? '#34d399' : '#166534',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                {selectedEmployee.department}
              </span>
              <span style={{
                padding: '4px 8px',
                backgroundColor: darkMode ? '#312e81' : '#e0e7ff',
                color: darkMode ? '#818cf8' : '#3730a3',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                ID: {selectedEmployee.employeeId}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedEmployee(null)}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: darkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          borderBottom: `1px solid ${getBorderColor()}`,
          paddingBottom: '8px'
        }}>
          {[
            { id: 'profile', label: 'Профиль', icon: '👤' },
            { id: 'skills', label: 'Навыки и сертификаты', icon: '🎯' },
            { id: 'training', label: 'Обучение', icon: '📚' },
            { id: 'performance', label: 'Оценка', icon: '📊' },
            { id: 'documents', label: 'Документы', icon: '📄' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === tab.id ? (darkMode ? '#4b5563' : '#f3f4f6') : 'transparent',
                color: activeTab === tab.id ? getTextColor() : (darkMode ? '#9ca3af' : '#6b7280'),
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                  Основная информация
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Телефон</label>
                    <p style={{ fontSize: '14px', color: getTextColor(), margin: '4px 0' }}>{selectedEmployee.phone}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Email</label>
                    <p style={{ fontSize: '14px', color: getTextColor(), margin: '4px 0' }}>{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Дата рождения</label>
                    <p style={{ fontSize: '14px', color: getTextColor(), margin: '4px 0' }}>
                      {selectedEmployee.birthDate || 'Не указана'}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Дата найма</label>
                    <p style={{ fontSize: '14px', color: getTextColor(), margin: '4px 0' }}>
                      {new Date(selectedEmployee.hireDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>Тип контракта</label>
                    <p style={{ fontSize: '14px', color: getTextColor(), margin: '4px 0' }}>
                      {selectedEmployee.contractType === 'full-time' ? 'Полная занятость' : 
                       selectedEmployee.contractType === 'part-time' ? 'Частичная занятость' :
                       selectedEmployee.contractType === 'contractor' ? 'Контрактор' : 'Стажер'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                  Экстренный контакт
                </h3>
                <div style={{
                  padding: '16px',
                  backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                  borderRadius: '8px',
                  border: `1px solid ${getBorderColor()}`
                }}>
                  <p style={{ fontSize: '14px', color: getTextColor(), margin: '0 0 8px 0' }}>
                    {selectedEmployee.emergencyContact.name || 'Не указан'}
                  </p>
                  <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '0 0 4px 0' }}>
                    {selectedEmployee.emergencyContact.phone}
                  </p>
                  <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>
                    {selectedEmployee.emergencyContact.relation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                Навыки
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {selectedEmployee.skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: darkMode ? '#312e81' : '#e0e7ff',
                      color: darkMode ? '#818cf8' : '#3730a3',
                      borderRadius: '16px',
                      fontSize: '14px'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                Сертификаты
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedEmployee.certifications.map(cert => {
                  const statusColor = getStatusColor(cert.status);
                  return (
                    <div
                      key={cert.id}
                      style={{
                        padding: '16px',
                        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                        borderRadius: '8px',
                        border: `1px solid ${getBorderColor()}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: getTextColor(), margin: '0 0 4px 0' }}>
                            {cert.name}
                          </h4>
                          <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '0 0 8px 0' }}>
                            {cert.issuer}
                          </p>
                          <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>
                            Выдан: {new Date(cert.issueDate).toLocaleDateString('ru-RU')} | 
                            Истекает: {new Date(cert.expiryDate).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {cert.status === 'active' ? 'Активен' : cert.status === 'expired' ? 'Истек' : 'Ожидается'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                История обучения
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedEmployee.trainings.map(training => {
                  const statusColor = getStatusColor(training.status);
                  return (
                    <div
                      key={training.id}
                      style={{
                        padding: '16px',
                        backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                        borderRadius: '8px',
                        border: `1px solid ${getBorderColor()}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: getTextColor(), margin: '0 0 4px 0' }}>
                            {training.name}
                          </h4>
                          <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '0 0 8px 0' }}>
                            {training.provider} • {training.hours} часов
                          </p>
                          <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>
                            {new Date(training.startDate).toLocaleDateString('ru-RU')} - 
                            {new Date(training.endDate).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {training.status === 'completed' ? 'Завершено' : 
                           training.status === 'in-progress' ? 'В процессе' : 'Запланировано'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                Оценки производительности
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedEmployee.performanceReviews.map(review => (
                  <div
                    key={review.id}
                    style={{
                      padding: '20px',
                      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                      borderRadius: '8px',
                      border: `1px solid ${getBorderColor()}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: getTextColor(), margin: 0 }}>
                          Оценка от {new Date(review.date).toLocaleDateString('ru-RU')}
                        </h4>
                        <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '4px 0 0 0' }}>
                          Оценивающий: {review.reviewer}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: darkMode ? '#064e3b' : '#dcfce7',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: darkMode ? '#34d399' : '#166534' }}>
                          {review.rating}
                        </span>
                        <span style={{ fontSize: '14px', color: darkMode ? '#34d399' : '#166534' }}>/ 5.0</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: getTextColor(), marginBottom: '8px' }}>
                          Сильные стороны
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {review.strengths.map((strength, index) => (
                            <li key={index} style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: '600', color: getTextColor(), marginBottom: '8px' }}>
                          Области для улучшения
                        </h5>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {review.improvements.map((improvement, index) => (
                            <li key={index} style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <h5 style={{ fontSize: '14px', fontWeight: '600', color: getTextColor(), marginBottom: '8px' }}>
                        Цели на следующий период
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {review.goals.map((goal, index) => (
                          <li key={index} style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: '12px' }}>
                      Следующая оценка: {new Date(review.nextReviewDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))}
              </div>

              {selectedEmployee.bonuses.length > 0 && (
                <>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginTop: '24px', marginBottom: '16px' }}>
                    Премии и бонусы
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedEmployee.bonuses.map(bonus => (
                      <div
                        key={bonus.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                          borderRadius: '8px',
                          border: `1px solid ${getBorderColor()}`
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '14px', color: getTextColor(), margin: 0 }}>
                            {bonus.description}
                          </p>
                          <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '4px 0 0 0' }}>
                            {new Date(bonus.date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: darkMode ? '#34d399' : '#166534'
                        }}>
                          +{bonus.amount.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: getTextColor(), marginBottom: '16px' }}>
                HR Документы
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedEmployee.documents.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                      borderRadius: '8px',
                      border: `1px solid ${getBorderColor()}`,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>📄</span>
                      <div>
                        <p style={{ fontSize: '14px', color: getTextColor(), margin: 0 }}>
                          {doc.name}
                        </p>
                        <p style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '4px 0 0 0' }}>
                          Загружен: {new Date(doc.uploadDate).toLocaleDateString('ru-RU')} • 
                          {(doc.size / 1024).toFixed(0)} КБ
                        </p>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '6px 12px',
                        backgroundColor: darkMode ? '#374151' : '#e5e7eb',
                        color: getTextColor(),
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Скачать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div style={{ 
        height: 'calc(100vh - 180px)', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        padding: '24px',
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <header 
          style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: `1px solid ${getBorderColor()}`,
            paddingBottom: '16px'
          }}
        >
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: getTextColor(), 
              margin: 0 
            }}>
              Расширенное управление сотрудниками
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: darkMode ? '#9ca3af' : '#6b7280', 
              margin: '4px 0 0 0' 
            }}>
              Полные профили сотрудников с HR данными, навыками и историей обучения
            </p>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Поиск сотрудников..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
              color: getTextColor(),
              border: `1px solid ${getBorderColor()}`,
              borderRadius: '8px',
              fontSize: '14px',
              width: '300px'
            }}
          />

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div 
              style={{
                display: 'flex',
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                borderRadius: '8px',
                padding: '4px'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: viewMode === 'grid' ? (darkMode ? '#4b5563' : 'white') : 'transparent',
                  color: getTextColor(),
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ⚏ Сетка
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: viewMode === 'list' ? (darkMode ? '#4b5563' : 'white') : 'transparent',
                  color: getTextColor(),
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ☰ Список
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              style={{
                padding: '8px',
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: getTextColor(),
                border: 'none',
                borderRadius: '8px',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Ctrl+D"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setIsCreating(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ea580c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Ctrl+N"
            >
              ➕ Добавить сотрудника
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', overflow: 'hidden' }}>
          {/* Employee List */}
          <div style={{
            width: selectedEmployee ? '400px' : '100%',
            transition: 'width 0.3s ease'
          }}>
            <div style={{ 
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gap: '12px',
              height: '100%',
              overflow: 'auto',
              padding: '4px'
            }}>
              {filteredEmployees.map(employee => (
                <article
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  style={{
                    border: `1px solid ${getBorderColor()}`,
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: getCardBackground(),
                    boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{employee.photo}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: getTextColor(),
                        margin: 0
                      }}>
                        {employee.fullName}
                      </h4>
                      <p style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', margin: '4px 0' }}>
                        {employee.position}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: darkMode ? '#064e3b' : '#dcfce7',
                          color: darkMode ? '#34d399' : '#166534',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          {employee.department}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: darkMode ? '#312e81' : '#e0e7ff',
                          color: darkMode ? '#818cf8' : '#3730a3',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          {employee.skills.length} навыков
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Employee Details Panel */}
          {renderEmployeeDetails()}
        </div>

        {/* Create Employee Modal */}
        {isCreating && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div style={{
              backgroundColor: getCardBackground(),
              borderRadius: '12px',
              padding: '24px',
              width: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: getTextColor()
              }}>
                Добавить сотрудника
              </h2>

              <form onSubmit={handleCreateEmployee}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Имя
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        color: getTextColor()
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Фамилия
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        color: getTextColor()
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    Отдел
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Например: Контакт-центр"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${getBorderColor()}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: darkMode ? '#374151' : 'white',
                      color: getTextColor()
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    Должность
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Например: Специалист по обслуживанию"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${getBorderColor()}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: darkMode ? '#374151' : 'white',
                      color: getTextColor()
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        color: getTextColor()
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+7 (999) 123-45-67"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        color: getTextColor()
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Дата найма
                    </label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        color: getTextColor()
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}>
                      Тип контракта
                    </label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contractType: e.target.value as EnhancedEmployee['contractType']
                      }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: darkMode ? '#374151' : 'white',
                        color: getTextColor()
                      }}
                    >
                      <option value="full-time">Полная занятость</option>
                      <option value="part-time">Частичная занятость</option>
                      <option value="contractor">Контрактор</option>
                      <option value="intern">Стажер</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
                      color: darkMode ? '#d1d5db' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Отмена
                  </button>
                  
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ea580c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Добавить сотрудника
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer 
          style={{ 
            borderTop: `1px solid ${getBorderColor()}`, 
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}
        >
          <div>
            <span>
              Всего сотрудников: <strong>{employees.length}</strong>
            </span>
            <span style={{ margin: '0 16px' }}>|</span>
            <span>
              Активных: <strong>{employees.filter(e => e.isActive).length}</strong>
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px' }}>
              Горячие клавиши: <kbd>Ctrl+N</kbd> Новый | <kbd>Ctrl+D</kbd> Тема | <kbd>Ctrl+G</kbd> Вид
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: darkMode ? '#065f46' : '#dcfce7',
              color: darkMode ? '#34d399' : '#166534',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Система работает
            </span>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
};

export default EnhancedEmployeeProfilesUI;