// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/QuickAddEmployee.tsx

import React, { useState } from 'react';
import { Employee, Team } from '../types/employee';

// ========================
// QUICK ADD EMPLOYEE - Streamlined new employee creation
// Based on Chat 6 form patterns with simplified workflow
// ========================

interface QuickAddEmployeeProps {
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'metadata'>) => void;
  onSuccess?: () => void;
}

interface QuickFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  teamId: string;
  manager: string;
  startDate: string;
}

const QuickAddEmployee: React.FC<QuickAddEmployeeProps> = ({
  teams,
  isOpen,
  onClose,
  onSubmit,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuickFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    teamId: '',
    manager: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Partial<QuickFormData>>({});
  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        teamId: '',
        manager: '',
        startDate: new Date().toISOString().split('T')[0]
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validation for each step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<QuickFormData> = {};

    if (stepNumber === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Обязательное поле';
      if (!formData.lastName.trim()) newErrors.lastName = 'Обязательное поле';
      if (!formData.email.trim()) {
        newErrors.email = 'Обязательное поле';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Неверный формат email';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Обязательное поле';
      }
    }

    if (stepNumber === 2) {
      if (!formData.position.trim()) newErrors.position = 'Обязательное поле';
      if (!formData.teamId) newErrors.teamId = 'Обязательное поле';
      if (!formData.manager.trim()) newErrors.manager = 'Обязательное поле';
      if (!formData.startDate) newErrors.startDate = 'Обязательное поле';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof QuickFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(step - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);

    try {
      const selectedTeam = teams.find(t => t.id === formData.teamId);
      if (!selectedTeam) {
        throw new Error('Команда не найдена');
      }

      // Generate employee ID
      const employeeId = `EMP${Date.now().toString().slice(-4)}`;

      // Create employee object
      const newEmployee: Omit<Employee, 'id' | 'metadata'> = {
        employeeId,
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        workInfo: {
          position: formData.position,
          team: selectedTeam,
          manager: formData.manager,
          hireDate: new Date(formData.startDate),
          contractType: 'full-time',
          workLocation: 'Офис Бишкек',
          department: selectedTeam.name.includes('поддержки') ? 'Клиентская поддержка' : 
                     selectedTeam.name.includes('продаж') ? 'Продажи' : 'Общий'
        },
        skills: [],
        status: 'probation', // New employees start on probation
        preferences: {
          preferredShifts: ['day'],
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
            start: '09:00',
            end: '18:00'
          }
        },
        performance: {
          averageHandleTime: 0,
          callsPerHour: 0,
          qualityScore: 0,
          adherenceScore: 0,
          customerSatisfaction: 0,
          lastEvaluation: new Date()
        },
        certifications: []
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSubmit(newEmployee);
      setStep(3); // Success step
      
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error creating employee:', error);
      setErrors({ email: 'Ошибка создания сотрудника. Попробуйте еще раз.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Быстрое добавление сотрудника</h2>
            <p className="text-sm text-gray-500">Шаг {step} из 3</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {stepNumber === 3 && step >= 3 ? '✓' : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div 
                    className={`
                      flex-1 h-1 mx-2
                      ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-lg font-semibold text-gray-900">Личная информация</h3>
                <p className="text-sm text-gray-600">Основные данные нового сотрудника</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Имя"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Фамилия"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+996 555 123 456"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">💼</div>
                <h3 className="text-lg font-semibold text-gray-900">Рабочая информация</h3>
                <p className="text-sm text-gray-600">Должность и команда сотрудника</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Должность *
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Введите должность"
                />
                {errors.position && (
                  <p className="mt-1 text-xs text-red-600">{errors.position}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Команда *
                </label>
                <select
                  value={formData.teamId}
                  onChange={(e) => handleInputChange('teamId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.teamId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Выберите команду</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.memberCount} чел.)
                    </option>
                  ))}
                </select>
                {errors.teamId && (
                  <p className="mt-1 text-xs text-red-600">{errors.teamId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Менеджер *
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.manager ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Имя менеджера"
                />
                {errors.manager && (
                  <p className="mt-1 text-xs text-red-600">{errors.manager}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата начала работы *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Сотрудник добавлен!</h3>
              <p className="text-gray-600 mb-4">
                {formData.firstName} {formData.lastName} успешно добавлен в систему
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Что дальше:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Добавить фото профиля</li>
                  <li>• Настроить навыки и уровни</li>
                  <li>• Создать расписание работы</li>
                  <li>• Отправить приглашение в систему</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between">
              <button
                onClick={step === 1 ? onClose : handlePrevious}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {step === 1 ? 'Отмена' : 'Назад'}
              </button>
              
              <button
                onClick={step === 1 ? handleNext : handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {step === 1 ? 'Далее' : isSubmitting ? 'Создание...' : 'Создать сотрудника'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAddEmployee;