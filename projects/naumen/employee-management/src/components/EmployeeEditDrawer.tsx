import React, { useEffect, useMemo, useState } from 'react';
import { Employee, EmployeeStatus } from '../types/employee';

interface EmployeeEditDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  mode?: 'edit' | 'create';
  isLoading?: boolean;
}

interface FormState {
  personalInfo: {
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
  };
  credentials: {
    wfmLogin: string;
    externalLogins: string;
    password: string;
  };
  orgPlacement: {
    orgUnit: string;
    office: string;
    timeZone: string;
    hourNorm: string;
    workScheme: string;
  };
  workInfo: {
    position: string;
    manager: string;
    hireDate: string;
  };
  tags: string;
  status: EmployeeStatus;
}

const REQUIRED_FIELDS: Array<{ key: keyof FormState['personalInfo'] | 'credentials.wfmLogin' | 'credentials.externalLogins' | 'orgPlacement.orgUnit' | 'orgPlacement.office' | 'orgPlacement.timeZone' | 'orgPlacement.hourNorm' | 'workInfo.position'; label: string }> = [
  { key: 'lastName', label: 'Фамилия' },
  { key: 'firstName', label: 'Имя' },
  { key: 'middleName', label: 'Отчество' },
  { key: 'credentials.wfmLogin', label: 'Логин WFM' },
  { key: 'credentials.externalLogins', label: 'Внешние логины' },
  { key: 'orgPlacement.orgUnit', label: 'Точка оргструктуры' },
  { key: 'orgPlacement.office', label: 'Офис' },
  { key: 'workInfo.position', label: 'Должность' },
  { key: 'orgPlacement.timeZone', label: 'Часовой пояс' },
  { key: 'orgPlacement.hourNorm', label: 'Норма часов' }
];

const statusOptions: Array<{ value: EmployeeStatus; label: string }> = [
  { value: 'active', label: 'Активен' },
  { value: 'probation', label: 'Испытательный' },
  { value: 'vacation', label: 'В отпуске' },
  { value: 'inactive', label: 'Неактивен' },
  { value: 'terminated', label: 'Уволен' }
];

const EmployeeEditDrawer: React.FC<EmployeeEditDrawerProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
  mode = 'edit',
  isLoading = false,
}) => {
  const [formState, setFormState] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCreateIntro, setShowCreateIntro] = useState(mode === 'create');

  const setFieldError = (key: string, message: string) => {
    setErrors((prev) => ({ ...prev, [key]: message }));
  };

  const clearFieldError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  useEffect(() => {
    if (employee && isOpen) {
      setFormState({
        personalInfo: {
          lastName: employee.personalInfo.lastName,
          firstName: employee.personalInfo.firstName,
          middleName: employee.personalInfo.middleName ?? '',
          email: employee.personalInfo.email,
          phone: employee.personalInfo.phone,
          address: employee.personalInfo.address ?? '',
          dateOfBirth: employee.personalInfo.dateOfBirth
            ? employee.personalInfo.dateOfBirth.toISOString().slice(0, 10)
            : ''
        },
        credentials: {
          wfmLogin: employee.credentials.wfmLogin,
          externalLogins: employee.credentials.externalLogins.join(', '),
          password: ''
        },
        orgPlacement: {
          orgUnit: employee.orgPlacement.orgUnit,
          office: employee.orgPlacement.office,
          timeZone: employee.orgPlacement.timeZone,
          hourNorm: employee.orgPlacement.hourNorm.toString(),
          workScheme: employee.orgPlacement.workScheme?.name ?? ''
        },
        workInfo: {
          position: employee.workInfo.position,
          manager: typeof employee.workInfo.manager === 'string' ? employee.workInfo.manager : employee.workInfo.manager.fullName,
          hireDate: employee.workInfo.hireDate.toISOString().slice(0, 10)
        },
        tags: employee.tags.join(', '),
        status: employee.status
      });
      setErrors({});
    }
  }, [employee, isOpen]);

  useEffect(() => {
    if (mode === 'create' && isOpen) {
      setShowCreateIntro(true);
    } else {
      setShowCreateIntro(false);
    }
  }, [mode, isOpen, employee?.id]);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

const handleChange = (section: 'personalInfo' | 'credentials' | 'orgPlacement' | 'workInfo', field: string, value: string) => {
    if (!formState) return;

    setFormState(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      // @ts-expect-error dynamic assignment is safe for our controlled fields
      updated[section][field] = value;
      return updated;
    });
    const errorKey = `${section}.${field}`;
    clearFieldError(errorKey);
  };

  const handleContinueFromIntro = () => {
    if (!formState) {
      return;
    }
    if (!formState.credentials.wfmLogin.trim()) {
      setFieldError('credentials.wfmLogin', 'Укажите логин WFM');
      return;
    }
    clearFieldError('credentials.wfmLogin');
    setShowCreateIntro(false);
  };

  const validate = (): boolean => {
    if (!formState) return false;

    const validationErrors: Record<string, string> = {};

    REQUIRED_FIELDS.forEach(item => {
      const [section, field] = item.key.split('.') as [keyof FormState, string];
      const value = (formState as any)[section][field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        validationErrors[item.key] = 'Обязательное поле';
      }
    });

    if (formState.personalInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.personalInfo.email)) {
      validationErrors['personalInfo.email'] = 'Неверный формат email';
    }

    if (Number.isNaN(Number(formState.orgPlacement.hourNorm)) || Number(formState.orgPlacement.hourNorm) <= 0) {
      validationErrors['orgPlacement.hourNorm'] = 'Укажите положительное число';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!employee || !formState) return;

    if (!validate()) {
      return;
    }

    const externalLogins = formState.credentials.externalLogins
      .split(',')
      .map(login => login.trim())
      .filter(Boolean);

    const updatedEmployee: Employee = {
      ...employee,
      status: formState.status,
      personalInfo: {
        ...employee.personalInfo,
        lastName: formState.personalInfo.lastName.trim(),
        firstName: formState.personalInfo.firstName.trim(),
        middleName: formState.personalInfo.middleName.trim(),
        email: formState.personalInfo.email.trim(),
        phone: formState.personalInfo.phone.trim(),
        address: formState.personalInfo.address.trim(),
        dateOfBirth: formState.personalInfo.dateOfBirth
          ? new Date(formState.personalInfo.dateOfBirth)
          : undefined
      },
      credentials: {
        ...employee.credentials,
        wfmLogin: formState.credentials.wfmLogin.trim(),
        externalLogins,
        passwordSet: employee.credentials.passwordSet || formState.credentials.password.trim().length > 0,
        passwordLastUpdated: formState.credentials.password.trim().length > 0 ? new Date() : employee.credentials.passwordLastUpdated
      },
      orgPlacement: {
        ...employee.orgPlacement,
        orgUnit: formState.orgPlacement.orgUnit.trim(),
        office: formState.orgPlacement.office.trim(),
        timeZone: formState.orgPlacement.timeZone.trim(),
        hourNorm: Number(formState.orgPlacement.hourNorm),
        workScheme: formState.orgPlacement.workScheme.trim()
          ? {
              ...(employee.orgPlacement.workScheme ?? { id: 'manual', type: 'custom' }),
              name: formState.orgPlacement.workScheme.trim(),
              effectiveFrom: employee.orgPlacement.workScheme?.effectiveFrom ?? new Date()
            }
          : undefined
      },
      workInfo: {
        ...employee.workInfo,
        position: formState.workInfo.position.trim(),
        manager: formState.workInfo.manager.trim() || employee.workInfo.manager,
        hireDate: formState.workInfo.hireDate
          ? new Date(formState.workInfo.hireDate)
          : employee.workInfo.hireDate
      },
      tags: formState.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
      metadata: {
        ...employee.metadata,
        updatedAt: new Date(),
        lastModifiedBy: 'agent'
      }
    };

    onSave(updatedEmployee);
  };

  const skillsList = useMemo(() => (employee ? employee.skills.map((skill) => skill.name).join(', ') : ''), [employee]);
  const reserveSkillsList = useMemo(
    () => (employee ? employee.reserveSkills.map((skill) => skill.name).join(', ') : ''),
    [employee]
  );
  const currentTags = useMemo(() => {
    if (!formState) {
      return [] as string[];
    }
    return formState.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [formState?.tags]);

  const fieldError = (key: string) => errors[key];

  if (!isOpen || !employee || !formState) {
    return null;
  }

  const isCreateMode = mode === 'create';
  const displayName = [formState.personalInfo.lastName, formState.personalInfo.firstName]
    .filter(Boolean)
    .join(' ');
  const headerName = displayName || 'Новый сотрудник';
  const headerLogin = formState.credentials.wfmLogin.trim() || '—';

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={handleOverlayClick}>
      <div
        className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
        onClick={handleContentClick}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500">
              {isCreateMode ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">{headerName}</h2>
            <p className="text-sm text-gray-500">Логин WFM: {headerLogin}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>
        {showCreateIntro ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Учетные данные</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Логин WFM</label>
                  <input
                    type="text"
                    value={formState.credentials.wfmLogin}
                    onChange={(event) => handleChange('credentials', 'wfmLogin', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('credentials.wfmLogin') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                    placeholder="Введите логин"
                  />
                  {fieldError('credentials.wfmLogin') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('credentials.wfmLogin')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Пароль</label>
                  <input
                    type="password"
                    value={formState.credentials.password}
                    onChange={(event) => handleChange('credentials', 'password', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Задайте временный пароль"
                  />
                </div>
              </div>
            </section>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleContinueFromIntro}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Продолжить
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Обязательные поля</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([['lastName', 'Фамилия'], ['firstName', 'Имя'], ['middleName', 'Отчество']] as Array<[keyof FormState['personalInfo'], string]>).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-xs uppercase font-medium text-gray-500 mb-1">{label}</label>
                    <input
                      type="text"
                      value={formState.personalInfo[field]}
                      onChange={event => handleChange('personalInfo', field, event.target.value)}
                      className={`w-full px-3 py-2 border ${fieldError(`personalInfo.${field}`) ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                      placeholder={label}
                    />
                    {fieldError(`personalInfo.${field}`) && (
                      <p className="mt-1 text-xs text-red-500">{fieldError(`personalInfo.${field}`)}</p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Логин WFM</label>
                  <input
                    type="text"
                    value={formState.credentials.wfmLogin}
                    onChange={event => handleChange('credentials', 'wfmLogin', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('credentials.wfmLogin') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('credentials.wfmLogin') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('credentials.wfmLogin')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Внешние логины</label>
                  <input
                    type="text"
                    value={formState.credentials.externalLogins}
                    onChange={event => handleChange('credentials', 'externalLogins', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('credentials.externalLogins') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                    placeholder="Логин 1, Логин 2"
                  />
                  {fieldError('credentials.externalLogins') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('credentials.externalLogins')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Пароль</label>
                  <input
                    type="password"
                    value={formState.credentials.password}
                    onChange={event => handleChange('credentials', 'password', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Оставьте пустым чтобы не менять"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Точка оргструктуры</label>
                  <input
                    type="text"
                    value={formState.orgPlacement.orgUnit}
                    onChange={event => handleChange('orgPlacement', 'orgUnit', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('orgPlacement.orgUnit') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('orgPlacement.orgUnit') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('orgPlacement.orgUnit')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Офис</label>
                  <input
                    type="text"
                    value={formState.orgPlacement.office}
                    onChange={event => handleChange('orgPlacement', 'office', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('orgPlacement.office') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('orgPlacement.office') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('orgPlacement.office')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Должность</label>
                  <input
                    type="text"
                    value={formState.workInfo.position}
                    onChange={event => handleChange('workInfo', 'position', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('workInfo.position') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('workInfo.position') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('workInfo.position')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Часовой пояс</label>
                  <input
                    type="text"
                    value={formState.orgPlacement.timeZone}
                    onChange={event => handleChange('orgPlacement', 'timeZone', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('orgPlacement.timeZone') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('orgPlacement.timeZone') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('orgPlacement.timeZone')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Норма часов</label>
                  <input
                    type="number"
                    min="1"
                    value={formState.orgPlacement.hourNorm}
                    onChange={event => handleChange('orgPlacement', 'hourNorm', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('orgPlacement.hourNorm') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('orgPlacement.hourNorm') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('orgPlacement.hourNorm')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Статус</label>
                  <select
                    value={formState.status}
                    onChange={event => setFormState(prev => prev ? { ...prev, status: event.target.value as EmployeeStatus } : prev)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Дополнительные поля</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={formState.personalInfo.email}
                    onChange={event => handleChange('personalInfo', 'email', event.target.value)}
                    className={`w-full px-3 py-2 border ${fieldError('personalInfo.email') ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg text-sm focus:outline-none focus:ring-2`}
                  />
                  {fieldError('personalInfo.email') && (
                    <p className="mt-1 text-xs text-red-500">{fieldError('personalInfo.email')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={formState.personalInfo.phone}
                    onChange={event => handleChange('personalInfo', 'phone', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Адрес</label>
                  <input
                    type="text"
                    value={formState.personalInfo.address}
                    onChange={event => handleChange('personalInfo', 'address', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Дата рождения</label>
                  <input
                    type="date"
                    value={formState.personalInfo.dateOfBirth}
                    onChange={event => handleChange('personalInfo', 'dateOfBirth', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Менеджер</label>
                  <input
                    type="text"
                    value={formState.workInfo.manager}
                    onChange={event => handleChange('workInfo', 'manager', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Дата найма</label>
                  <input
                    type="date"
                    value={formState.workInfo.hireDate}
                    onChange={event => handleChange('workInfo', 'hireDate', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Схема работы</label>
                  <input
                    type="text"
                    value={formState.orgPlacement.workScheme}
                    onChange={event => handleChange('orgPlacement', 'workScheme', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Административный график"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs uppercase font-medium text-gray-500">Теги</label>
                  <input
                    type="text"
                    value={formState.tags}
                    onChange={event => setFormState(prev => prev ? { ...prev, tags: event.target.value } : prev)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Плавающий, Норма, План"
                  />
                  <div className="flex flex-wrap gap-2">
                    {currentTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                      >
                        {tag}
                      </span>
                    ))}
                    {currentTags.length === 0 && (
                      <span className="text-xs text-gray-400">Теги появятся здесь после сохранения</span>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Навыки</label>
                  <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50">
                    {skillsList || 'Навыки не назначены'}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Резервные навыки</label>
                  <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50">
                    {reserveSkillsList || 'Резервные навыки не назначены'}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {isCreateMode ? 'Создать сотрудника' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
        )}

        {isLoading && (
          <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeEditDrawer;
