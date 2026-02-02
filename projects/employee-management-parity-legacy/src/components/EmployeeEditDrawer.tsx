import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Employee, EmployeeStatus, EmployeeTask } from '../types/employee';
import { createTaskEntry } from '../utils/task';
import useFocusTrap from '../hooks/useFocusTrap';

interface EmployeeEditDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void | Promise<void>;
  mode?: 'edit' | 'create';
  isLoading?: boolean;
  onDismiss?: (employee: Employee) => void;
  onRestore?: (employee: Employee) => void;
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
    hireDate: string;
  };
  preferences: {
    preferredShifts: string;
    schemePreferences: string;
  };
  additional: {
    personnelNumber: string;
    actualAddress: string;
    tasks: string;
  };
  tags: string;
  status: EmployeeStatus;
}

interface RequiredFieldConfig {
  section: keyof FormState;
  field: string;
  label: string;
}

const REQUIRED_FIELDS: RequiredFieldConfig[] = [
  { section: 'personalInfo', field: 'lastName', label: 'Фамилия' },
  { section: 'personalInfo', field: 'firstName', label: 'Имя' },
  { section: 'personalInfo', field: 'email', label: 'Email' },
  { section: 'personalInfo', field: 'phone', label: 'Телефон' },
  { section: 'credentials', field: 'wfmLogin', label: 'Логин WFM' },
  { section: 'credentials', field: 'externalLogins', label: 'Внешние логины' },
  { section: 'orgPlacement', field: 'orgUnit', label: 'Точка оргструктуры' },
  { section: 'orgPlacement', field: 'office', label: 'Офис' },
  { section: 'workInfo', field: 'position', label: 'Должность' },
  { section: 'orgPlacement', field: 'timeZone', label: 'Часовой пояс' },
  { section: 'orgPlacement', field: 'hourNorm', label: 'Норма часов' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+?[0-9()\s-]{7,})$/;

const statusOptions: Array<{ value: EmployeeStatus; label: string }> = [
  { value: 'active', label: 'Активен' },
  { value: 'probation', label: 'Испытательный' },
  { value: 'vacation', label: 'В отпуске' },
  { value: 'inactive', label: 'Неактивен' },
  { value: 'terminated', label: 'Уволен' }
];

const TASK_SOURCE_LABELS: Record<EmployeeTask['source'], string> = {
  manual: 'Вручную',
  'bulk-edit': 'Массовое редактирование',
  system: 'Система',
};

const EmployeeEditDrawer: React.FC<EmployeeEditDrawerProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
  mode = 'edit',
  isLoading = false,
  onDismiss,
  onRestore,
}) => {
  const [formState, setFormState] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateIntro, setShowCreateIntro] = useState(mode === 'create');

  const computeValidationErrors = useCallback((state: FormState) => {
    const validationErrors: Record<string, string> = {};

    REQUIRED_FIELDS.forEach(({ section, field }) => {
      const sectionValue = (state as Record<string, unknown>)[section] as Record<string, unknown> | undefined;
      const rawValue = sectionValue ? sectionValue[field] : undefined;
      const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

      if (value === undefined || value === null || value === '') {
        validationErrors[`${section}.${field}`] = 'Обязательное поле';
      }
    });

    const email = state.personalInfo.email.trim();
    if (!email) {
      validationErrors['personalInfo.email'] = 'Укажите email';
    } else if (!EMAIL_PATTERN.test(email)) {
      validationErrors['personalInfo.email'] = 'Неверный формат email';
    }

    const phone = state.personalInfo.phone.trim();
    if (!phone) {
      validationErrors['personalInfo.phone'] = 'Укажите телефон';
    } else if (!PHONE_PATTERN.test(phone)) {
      validationErrors['personalInfo.phone'] = 'Неверный формат телефона';
    }

    const hourNormValue = Number(state.orgPlacement.hourNorm);
    if (!Number.isFinite(hourNormValue) || hourNormValue <= 0) {
      validationErrors['orgPlacement.hourNorm'] = 'Укажите положительное число';
    }

    return validationErrors;
  }, []);

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
          hireDate: employee.workInfo.hireDate.toISOString().slice(0, 10)
        },
        preferences: {
          preferredShifts: employee.preferences.preferredShifts.join(', '),
          schemePreferences: (employee.preferences.schemePreferences ?? []).join(', '),
        },
        additional: {
          personnelNumber: employee.personnelNumber ?? '',
          actualAddress: employee.actualAddress ?? employee.personalInfo.address ?? '',
          tasks: '',
        },
        tags: employee.tags.join(', '),
        status: employee.status
      });
      setErrors({});
      setFormError(null);
      setIsSaving(false);
    }
  }, [employee, isOpen]);

  useEffect(() => {
    if (mode === 'create' && isOpen) {
      setShowCreateIntro(true);
    } else {
      setShowCreateIntro(false);
    }
    setFormError(null);
    setErrors({});
  }, [mode, isOpen, employee?.id]);

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

const handleChange = (
  section: 'personalInfo' | 'credentials' | 'orgPlacement' | 'workInfo' | 'preferences' | 'additional',
  field: string,
  value: string
) => {
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
    if (formError) {
      setFormError(null);
    }
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

  const validate = useCallback(() => {
    if (!formState) {
      return false;
    }
    const validationErrors = computeValidationErrors(formState);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [computeValidationErrors, formState]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employee || !formState || isSaving) {
      return;
    }

    const isValid = validate();
    if (!isValid) {
      setFormError('Исправьте ошибки перед сохранением.');
      return;
    }

    setFormError(null);
    setIsSaving(true);

    const externalLogins = formState.credentials.externalLogins
      .split(',')
      .map(login => login.trim())
      .filter(Boolean);

    const preferredShifts = formState.preferences.preferredShifts
      .split(',')
      .map((shift) => shift.trim())
      .filter(Boolean);

    const schemePreferences = formState.preferences.schemePreferences
      .split(',')
      .map((scheme) => scheme.trim())
      .filter(Boolean);

    const newTaskMessages = formState.additional.tasks
      .split(/\r?\n/)
      .map((task) => task.trim())
      .filter(Boolean);

    const actualAddress = formState.additional.actualAddress.trim();
    const personnelNumber = formState.additional.personnelNumber.trim();

    const existingTasks = employee.tasks ?? [];
    const combinedTasks =
      newTaskMessages.length > 0
        ? [
            ...existingTasks,
            ...newTaskMessages.map((message) => createTaskEntry(message, 'manual')),
          ]
        : existingTasks;

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
        hireDate: formState.workInfo.hireDate
          ? new Date(formState.workInfo.hireDate)
          : employee.workInfo.hireDate
      },
      preferences: {
        ...employee.preferences,
        preferredShifts: preferredShifts.length > 0 ? preferredShifts : employee.preferences.preferredShifts,
        schemePreferences: schemePreferences.length > 0 ? schemePreferences : employee.preferences.schemePreferences,
      },
      personnelNumber: personnelNumber || undefined,
      actualAddress: actualAddress || undefined,
      tasks: combinedTasks,
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

    try {
      await onSave(updatedEmployee);
      setErrors({});
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника', error);
      setFormError('Не удалось сохранить изменения. Повторите попытку.');
    } finally {
      setIsSaving(false);
    }
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

  const taskTimeline = useMemo(() => {
    if (!employee?.tasks) {
      return [] as Array<{
        id: string;
        message: string;
        createdAt: Date;
        createdBy: string;
        source: EmployeeTask['source'];
      }>;
    }

    return employee.tasks
      .map((task) => ({
        ...task,
        createdAt: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [employee]);

  const schemeHistory = useMemo(() => {
    if (!employee) {
      return [] as Array<{
        id: string;
        name: string;
        effectiveFrom: Date | null;
        effectiveTo: Date | null;
        isCurrent: boolean;
      }>;
    }

    const normalizeDate = (value: Date | string | undefined) => {
      if (!value) {
        return null;
      }
      return value instanceof Date ? value : new Date(value);
    };

    const history = (employee.orgPlacement.workSchemeHistory ?? []).map((item) => ({
      id: item.id ?? `history-${item.name}`,
      name: item.name,
      effectiveFrom: normalizeDate(item.effectiveFrom),
      effectiveTo: normalizeDate(item.effectiveTo),
      isCurrent: false,
    }));

    const current = employee.orgPlacement.workScheme
      ? [{
          id: employee.orgPlacement.workScheme.id ?? 'current-scheme',
          name: employee.orgPlacement.workScheme.name,
          effectiveFrom: normalizeDate(employee.orgPlacement.workScheme.effectiveFrom),
          effectiveTo: null,
          isCurrent: true,
        }]
      : [];

    const combined = [...current, ...history];
    return combined.sort((a, b) => {
      const timeA = a.effectiveFrom ? a.effectiveFrom.getTime() : 0;
      const timeB = b.effectiveFrom ? b.effectiveFrom.getTime() : 0;
      return timeB - timeA;
    });
  }, [employee]);

  const drawerRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(drawerRef, {
    enabled: isOpen,
    onEscape: () => {
      if (!isLoading) {
        onClose();
      }
    },
  });

  const validationSnapshot = useMemo(
    () => (formState ? computeValidationErrors(formState) : {}),
    [computeValidationErrors, formState]
  );

  const isSubmitDisabled = isLoading || isSaving || !formState || Object.keys(validationSnapshot).length > 0;

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
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-drawer-heading"
        className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
        onClick={handleContentClick}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500">
              {isCreateMode ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
            </p>
            <h2 id="employee-drawer-heading" className="text-lg font-semibold text-gray-900">{headerName}</h2>
            <p className="text-sm text-gray-500">Логин WFM: {headerLogin}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCreateMode && employee.status !== 'terminated' && (
              <button
                type="button"
                onClick={() => {
                  if (!isLoading && employee) {
                    onDismiss?.(employee);
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                disabled={isLoading}
              >
                Уволить
              </button>
            )}
            {!isCreateMode && employee.status === 'terminated' && (
              <button
                type="button"
                onClick={() => {
                  if (!isLoading && employee) {
                    onRestore?.(employee);
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-60"
                disabled={isLoading}
              >
                Восстановить
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Закрыть"
              data-testid="drawer-close-button"
            >
              ✕
            </button>
          </div>
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

                {schemeHistory.length > 0 && (
                  <div className="sm:col-span-2 space-y-2">
                    <span className="block text-xs uppercase font-medium text-gray-500">История схем работы</span>
                    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3" role="list">
                      {schemeHistory.map((entry) => {
                        const fromLabel = entry.effectiveFrom
                          ? entry.effectiveFrom.toLocaleDateString('ru-RU')
                          : '—';
                        const toLabel = entry.isCurrent
                          ? 'по наст. время'
                          : entry.effectiveTo
                            ? entry.effectiveTo.toLocaleDateString('ru-RU')
                            : '—';
                        return (
                          <div
                            key={`scheme-history-${entry.id}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
                            role="listitem"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{entry.name}</span>
                              {entry.isCurrent && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  Текущая
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{fromLabel} — {toLabel}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <div
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50"
                    data-testid="drawer-skills-summary"
                  >
                    {skillsList || 'Навыки не назначены'}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Резервные навыки</label>
                  <div
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50"
                    data-testid="drawer-reserve-skills-summary"
                  >
                    {reserveSkillsList || 'Резервные навыки не назначены'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Номер сотрудника</label>
                  <input
                    type="text"
                    value={formState.additional.personnelNumber}
                    onChange={(event) => handleChange('additional', 'personnelNumber', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PN-001"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Предпочитаемые смены</label>
                  <input
                    type="text"
                    value={formState.preferences.preferredShifts}
                    onChange={(event) => handleChange('preferences', 'preferredShifts', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Утро, День"
                  />
                  <p className="mt-1 text-xs text-gray-400">Разделяйте смены запятыми, например «Утро, Вечер».</p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Предпочитаемые схемы</label>
                  <input
                    type="text"
                    value={formState.preferences.schemePreferences}
                    onChange={(event) => handleChange('preferences', 'schemePreferences', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Административный график, Гибрид"
                  />
                  <p className="mt-1 text-xs text-gray-400">Если схем несколько, перечислите через запятую.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-medium text-gray-500 mb-1">Фактический адрес</label>
                  <textarea
                    value={formState.additional.actualAddress}
                    onChange={(event) => handleChange('additional', 'actualAddress', event.target.value)}
                    className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="г. Бишкек, ул. ..."
                  />
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <label className="block text-xs uppercase font-medium text-gray-500">Активные задачи</label>
                  <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {taskTimeline.length === 0 ? (
                      <p className="p-3 text-sm text-gray-500">Задачи ещё не добавлены.</p>
                    ) : (
                      taskTimeline.map((task) => (
                        <div key={task.id} className="px-3 py-2 text-sm text-gray-700 flex flex-col gap-1">
                          <span>{task.message}</span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{task.createdAt.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              ⚙️ {TASK_SOURCE_LABELS[task.source] ?? task.source}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div>
                    <textarea
                      value={formState.additional.tasks}
                      onChange={(event) => handleChange('additional', 'tasks', event.target.value)}
                      className="w-full min-h-[92px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Добавьте новые задачи: одна строка — одна запись"
                    />
                    <p className="mt-1 text-xs text-gray-400">Новые строки будут добавлены к таймлайну вместе с отметкой времени.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {formError && (
            <div className="px-6 pb-2 text-sm text-red-600" role="alert">
              {formError}
            </div>
          )}
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
              disabled={isSubmitDisabled}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSubmitDisabled
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              aria-disabled={isSubmitDisabled}
            >
              {isSaving
                ? 'Сохранение…'
                : isCreateMode
                  ? 'Создать сотрудника'
                  : 'Сохранить изменения'}
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
