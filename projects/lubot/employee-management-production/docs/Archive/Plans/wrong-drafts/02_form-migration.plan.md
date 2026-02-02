# Form Migration – Phase 6 Task 2

## Metadata
## Required Reading (read in full)
- PROGRESS.md
- docs/SOP/plan-execution-sop.md
- docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md

- **Objective**: replace bespoke Quick Add + Employee edit forms with RHF/Zod implementations that use shared `@wrappers/form` components.
- **Inputs**: Stage 2 of `docs/Tasks/06_phase-6-migration-planning-prd.md`, schema files `src/schemas/quickAddSchema.ts` and `src/schemas/employeeEditSchema.ts`.
- **Target Files**:
  - `src/components/QuickAddEmployee.tsx`
  - `src/components/EmployeeEditDrawer.tsx`
  - `src/components/forms/employeeEditFormHelpers.ts` (new)
  - `tests/employee-list.spec.ts`

## Pre-checks
```bash
set -euo pipefail
npm install
git status -sb
```

## Change Steps

### 1. Add employee edit form helpers
```bash
cat <<'EOF_HELPERS' > src/components/forms/employeeEditFormHelpers.ts
import { Employee } from '../../types/employee';
import { createTaskEntry } from '../../utils/task';
import {
  employeeEditSchema,
  type EmployeeEditFormValues,
} from '../../schemas/employeeEditSchema';

export const mapEmployeeToForm = (employee: Employee): EmployeeEditFormValues => ({
  personalInfo: {
    lastName: employee.personalInfo.lastName,
    firstName: employee.personalInfo.firstName,
    middleName: employee.personalInfo.middleName ?? '',
    email: employee.personalInfo.email,
    phone: employee.personalInfo.phone,
    address: employee.personalInfo.address ?? '',
    dateOfBirth: employee.personalInfo.dateOfBirth
      ? employee.personalInfo.dateOfBirth.toISOString().slice(0, 10)
      : '',
  },
  credentials: {
    wfmLogin: employee.credentials.wfmLogin,
    externalLogins: employee.credentials.externalLogins.join(', '),
    password: '',
  },
  orgPlacement: {
    orgUnit: employee.orgPlacement.orgUnit,
    office: employee.orgPlacement.office,
    timeZone: employee.orgPlacement.timeZone,
    hourNorm: employee.orgPlacement.hourNorm.toString(),
    workScheme: employee.orgPlacement.workScheme?.name ?? '',
  },
  workInfo: {
    position: employee.workInfo.position,
    hireDate: employee.workInfo.hireDate
      .toISOString()
      .slice(0, 10),
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
  status: employee.status,
});

export const mapFormToEmployee = (
  values: EmployeeEditFormValues,
  current: Employee,
): Employee => {
  const externalLogins = values.credentials.externalLogins
    .split(',')
    .map((login) => login.trim())
    .filter(Boolean);

  const preferredShifts = values.preferences.preferredShifts
    .split(',')
    .map((shift) => shift.trim())
    .filter(Boolean);

  const schemePreferences = values.preferences.schemePreferences
    .split(',')
    .map((scheme) => scheme.trim())
    .filter(Boolean);

  const newTaskMessages = values.additional.tasks
    .split(/\r?\n/)
    .map((task) => task.trim())
    .filter(Boolean);

  const updatedTasks =
    newTaskMessages.length > 0
      ? [
          ...(current.tasks ?? []),
          ...newTaskMessages.map((message) => createTaskEntry(message, 'manual')),
        ]
      : current.tasks ?? [];

  return {
    ...current,
    status: values.status,
    personalInfo: {
      ...current.personalInfo,
      lastName: values.personalInfo.lastName.trim(),
      firstName: values.personalInfo.firstName.trim(),
      middleName: values.personalInfo.middleName.trim(),
      email: values.personalInfo.email.trim(),
      phone: values.personalInfo.phone.trim(),
      address: values.personalInfo.address.trim(),
      dateOfBirth: values.personalInfo.dateOfBirth
        ? new Date(values.personalInfo.dateOfBirth)
        : undefined,
    },
    credentials: {
      ...current.credentials,
      wfmLogin: values.credentials.wfmLogin.trim(),
      externalLogins,
      passwordSet:
        current.credentials.passwordSet || values.credentials.password.trim().length > 0,
      passwordLastUpdated:
        values.credentials.password.trim().length > 0
          ? new Date()
          : current.credentials.passwordLastUpdated,
    },
    orgPlacement: {
      ...current.orgPlacement,
      orgUnit: values.orgPlacement.orgUnit.trim(),
      office: values.orgPlacement.office.trim(),
      timeZone: values.orgPlacement.timeZone.trim(),
      hourNorm: Number(values.orgPlacement.hourNorm),
      workScheme: values.orgPlacement.workScheme.trim()
        ? {
            ...(current.orgPlacement.workScheme ?? { id: 'manual', type: 'custom' }),
            name: values.orgPlacement.workScheme.trim(),
            effectiveFrom:
              current.orgPlacement.workScheme?.effectiveFrom ?? new Date(),
          }
        : undefined,
    },
    workInfo: {
      ...current.workInfo,
      position: values.workInfo.position.trim(),
      hireDate: values.workInfo.hireDate
        ? new Date(values.workInfo.hireDate)
        : current.workInfo.hireDate,
    },
    preferences: {
      ...current.preferences,
      preferredShifts:
        preferredShifts.length > 0
          ? preferredShifts
          : current.preferences.preferredShifts,
      schemePreferences:
        schemePreferences.length > 0
          ? schemePreferences
          : current.preferences.schemePreferences,
    },
    personnelNumber: values.additional.personnelNumber.trim() || undefined,
    actualAddress: values.additional.actualAddress.trim() || undefined,
    tasks: updatedTasks,
    tags: values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    metadata: {
      ...current.metadata,
      updatedAt: new Date(),
      lastModifiedBy: 'agent',
    },
  };
};

export const employeeEditResolver = employeeEditSchema;
EOF_HELPERS
```

### 2. Rewrite Quick Add modal
```bash
cat <<'EOF_QUICKADD' > src/components/QuickAddEmployee.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Overlay } from './common/Overlay';
import { Button } from '@wrappers/ui/Button';
import { FormField } from '@wrappers/form/FormField';
import { quickAddEmployeeSchema, type QuickAddEmployeeFormValues } from '../schemas/quickAddSchema';
import { Employee, Team } from '../types/employee';
import { createTaskEntry } from '../utils/task';

interface QuickAddEmployeeProps {
  teams: Team[];
  isOpen: boolean;
  onClose: (options?: { restoreFocus?: boolean }) => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'metadata'>) => void;
}

const FALLBACK_TEAM: Team = {
  id: 'team_default',
  name: 'Основная команда',
  description: 'Команда по умолчанию для быстрого добавления',
  color: '#2563eb',
  managerId: 'mgr_default',
  memberCount: 0,
  targetUtilization: 0.8,
};

const buildEmployeePayload = (
  login: string,
  password: string,
  team: Team,
): Omit<Employee, 'id' | 'metadata'> => {
  const timestamp = Date.now();
  const employeeId = `EMP${timestamp.toString().slice(-5)}`;
  const email = `${login}@demo.local`;

  return {
    employeeId,
    status: 'probation',
    personalInfo: {
      firstName: 'Новый',
      lastName: 'Сотрудник',
      middleName: '',
      email,
      phone: '+7 (000) 000-00-00',
      photo: `https://i.pravatar.cc/150?u=${encodeURIComponent(login)}`,
      address: team.description ? `Офис: ${team.description}` : 'Офис по умолчанию',
    },
    credentials: {
      wfmLogin: login,
      externalLogins: [login],
      passwordSet: true,
      passwordLastUpdated: new Date(),
    },
    workInfo: {
      position: 'Сотрудник (черновик)',
      team,
      manager: typeof team.managerId === 'string' ? team.managerId : 'Менеджер команды',
      hireDate: new Date(),
      contractType: 'full-time',
      workLocation: team.description ?? 'Офис 1010.ru',
      department: team.name,
    },
    orgPlacement: {
      orgUnit: team.name,
      office: team.description ?? 'Офис 1010.ru',
      timeZone: 'Europe/Moscow',
      hourNorm: 40,
      workScheme: {
        id: `scheme_quick_add_${timestamp}`,
        name: 'Административный график',
        effectiveFrom: new Date(),
      },
    },
    skills: [],
    reserveSkills: [],
    tags: ['Новый сотрудник'],
    preferences: {
      preferredShifts: ['day'],
      notifications: {
        email: true,
        sms: true,
        push: true,
        scheduleChanges: true,
        announcements: true,
        reminders: true,
      },
      language: 'ru',
      workingHours: {
        start: '09:00',
        end: '18:00',
      },
      schemePreferences: ['Административный график'],
    },
    performance: {
      averageHandleTime: 0,
      callsPerHour: 0,
      qualityScore: 0,
      adherenceScore: 0,
      customerSatisfaction: 0,
      lastEvaluation: new Date(),
    },
    certifications: [],
    personnelNumber: `PN-${timestamp.toString().slice(-5)}`,
    actualAddress: team.description ? `Офис ${team.description}` : 'Офис 1010.ru, ул. Токтогула 12',
    tasks: [
      createTaskEntry('Проверка учётных данных', 'system', { createdBy: 'system' }),
      createTaskEntry('Назначение наставника', 'system', { createdBy: 'system' }),
    ],
  };
};

const QuickAddEmployee: React.FC<QuickAddEmployeeProps> = ({ teams, isOpen, onClose, onSubmit }) => {
  const defaultTeam = useMemo(() => teams[0] ?? FALLBACK_TEAM, [teams]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickAddEmployeeFormValues>({
    resolver: zodResolver(quickAddEmployeeSchema),
    mode: 'onSubmit',
    defaultValues: { login: '', password: '', confirm: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ login: '', password: '', confirm: '' });
    }
  }, [isOpen, reset]);

  const submit = async (values: QuickAddEmployeeFormValues) => {
    const payload = buildEmployeePayload(values.login.trim().toLowerCase(), values.password.trim(), defaultTeam);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onSubmit(payload);
    onClose({ restoreFocus: false });
  };

  return (
    <Overlay
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose({ restoreFocus: true });
        }
      }}
      variant="modal"
      title="Быстрое добавление сотрудника"
      description="Создавайте черновик карточки: только логин и пароль — как в WFM."
      testId="quick-add-dialog"
      contentClassName="bg-white rounded-xl max-w-md w-full shadow-2xl"
      contentStyles={{ padding: 0 }}
    >
      <form onSubmit={handleSubmit(submit)} className="px-6 py-5 space-y-5" noValidate>
        <FormField label="Логин WFM" required error={errors.login}>
          <input
            {...register('login')}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.login ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            autoComplete="username"
            autoFocus
            placeholder="Например, i.ivanov"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Пароль" required error={errors.password}>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Минимум 6 символов"
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Подтверждение" required error={errors.confirm}>
            <input
              type="password"
              {...register('confirm')}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.confirm ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
          </FormField>
        </div>

        <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
          <p>
            Новый сотрудник добавится в команду «{defaultTeam.name}». Все дополнительные поля доступны в карточке сразу после сохранения.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose({ restoreFocus: true })}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Создаём…' : 'Создать черновик'}
          </Button>
        </div>
      </form>
    </Overlay>
  );
};

export default QuickAddEmployee;
EOF_QUICKADD
```

### 3. Rewrite EmployeeEditDrawer to use RHF
```bash
cat <<'EOF_DRAWER' > src/components/EmployeeEditDrawer.tsx
import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Overlay } from './common/Overlay';
import { Button } from '@wrappers/ui/Button';
import { FormField } from '@wrappers/form/FormField';
import { employeeEditResolver, mapEmployeeToForm, mapFormToEmployee } from './forms/employeeEditFormHelpers';
import { Employee, EmployeeStatus } from '../types/employee';
import { EmployeeEditFormValues } from '../schemas/employeeEditSchema';

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

const statusOptions: Array<{ value: EmployeeStatus; label: string }> = [
  { value: 'active', label: 'Активен' },
  { value: 'probation', label: 'Испытательный' },
  { value: 'vacation', label: 'В отпуске' },
  { value: 'inactive', label: 'Неактивен' },
  { value: 'terminated', label: 'Уволен' },
];

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
  const defaultValues = useMemo(() => (employee ? mapEmployeeToForm(employee) : undefined), [employee]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<EmployeeEditFormValues>({
    resolver: zodResolver(employeeEditResolver),
    mode: 'onSubmit',
    defaultValues,
  });

  React.useEffect(() => {
    if (employee && isOpen) {
      reset(mapEmployeeToForm(employee));
    }
  }, [employee, isOpen, reset]);

  const submit = async (values: EmployeeEditFormValues) => {
    if (!employee) {
      return;
    }
    const updated = mapFormToEmployee(values, employee);
    await onSave(updated);
    onClose();
  };

  const currentTags = watch('tags');

  return (
    <Overlay
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting && !isLoading) {
          onClose();
        }
      }}
      variant="sheet"
      title={employee ? `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim() || 'Карточка сотрудника' : 'Карточка сотрудника'}
      description={mode === 'create' ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
      preventClose={isLoading || isSubmitting}
      contentClassName="ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
      overlayClassName="items-stretch"
      contentStyles={{ padding: 0 }}
      testId="employee-edit-drawer"
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase text-gray-500">{mode === 'create' ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}</p>
            <p className="text-sm text-gray-500">Логин WFM: {employee?.credentials.wfmLogin ?? '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            {!employee || employee.status !== 'terminated' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => employee && onDismiss?.(employee)}
                disabled={isLoading || isSubmitting || !employee}
              >
                Уволить
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => employee && onRestore?.(employee)}
                disabled={isLoading || isSubmitting || !employee}
              >
                Восстановить
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading || isSubmitting}
              aria-label="Закрыть"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          <section className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">Личные данные</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Фамилия" required error={errors.personalInfo?.lastName}>
                <input
                  {...register('personalInfo.lastName')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.personalInfo?.lastName ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Имя" required error={errors.personalInfo?.firstName}>
                <input
                  {...register('personalInfo.firstName')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.personalInfo?.firstName ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Отчество" error={errors.personalInfo?.middleName}>
                <input
                  {...register('personalInfo.middleName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Email" required error={errors.personalInfo?.email}>
                <input
                  type="email"
                  {...register('personalInfo.email')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.personalInfo?.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Телефон" required error={errors.personalInfo?.phone}>
                <input
                  {...register('personalInfo.phone')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.personalInfo?.phone ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Дата рождения" error={errors.personalInfo?.dateOfBirth}>
                <input
                  type="date"
                  {...register('personalInfo.dateOfBirth')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Адрес" error={errors.personalInfo?.address}>
                <input
                  {...register('personalInfo.address')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">Учётные данные и статус</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Логин WFM" required error={errors.credentials?.wfmLogin}>
                <input
                  {...register('credentials.wfmLogin')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.credentials?.wfmLogin ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Внешние логины" required error={errors.credentials?.externalLogins}>
                <input
                  {...register('credentials.externalLogins')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.credentials?.externalLogins ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="crm, telephony"
                />
              </FormField>
              <FormField label="Временный пароль" error={errors.credentials?.password}>
                <input
                  type="password"
                  {...register('credentials.password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Укажите пароль для сброса"
                />
              </FormField>
              <FormField label="Статус" required error={errors.status}>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">Оргструктура и график</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Точка оргструктуры" required error={errors.orgPlacement?.orgUnit}>
                <input
                  {...register('orgPlacement.orgUnit')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.orgPlacement?.orgUnit ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Офис" required error={errors.orgPlacement?.office}>
                <input
                  {...register('orgPlacement.office')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.orgPlacement?.office ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Часовой пояс" required error={errors.orgPlacement?.timeZone}>
                <input
                  {...register('orgPlacement.timeZone')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.orgPlacement?.timeZone ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Europe/Moscow"
                />
              </FormField>
              <FormField label="Норма часов" required error={errors.orgPlacement?.hourNorm}>
                <input
                  {...register('orgPlacement.hourNorm')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.orgPlacement?.hourNorm ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  inputMode="numeric"
                />
              </FormField>
              <FormField label="Схема работы" error={errors.orgPlacement?.workScheme}>
                <input
                  {...register('orgPlacement.workScheme')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Административный график"
                />
              </FormField>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">Дополнительно</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Должность" required error={errors.workInfo?.position}>
                <input
                  {...register('workInfo.position')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.workInfo?.position ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
              </FormField>
              <FormField label="Дата найма" error={errors.workInfo?.hireDate}>
                <input
                  type="date"
                  {...register('workInfo.hireDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Номер сотрудника" error={errors.additional?.personnelNumber}>
                <input
                  {...register('additional.personnelNumber')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Предпочитаемые смены" error={errors.preferences?.preferredShifts}>
                <input
                  {...register('preferences.preferredShifts')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Утро, День"
                />
              </FormField>
              <FormField label="Предпочитаемые схемы" error={errors.preferences?.schemePreferences}>
                <input
                  {...register('preferences.schemePreferences')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Административный график, Гибрид"
                />
              </FormField>
              <FormField label="Фактический адрес" error={errors.additional?.actualAddress}>
                <textarea
                  {...register('additional.actualAddress')}
                  className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
            <FormField label="Теги" error={errors.tags}>
              <textarea
                {...register('tags')}
                className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VIP, Наставник"
              />
            </FormField>
            <FormField label="Активные задачи" hint="Новые строки будут добавлены к таймлайну вместе с отметкой времени." error={errors.additional?.tasks}>
              <textarea
                {...register('additional.tasks')}
                className="w-full min-h-[92px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              {current.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {current.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400">Теги появятся после массового назначения или сохранения</span>
              )}
            </div>
          </section>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting ? 'Сохранение…' : mode === 'create' ? 'Создать сотрудника' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </Overlay>
  );
};

export default EmployeeEditDrawer;
EOF_DRAWER
```

### 4. Update imports and remove legacy hook
Ensure no references to `useFocusTrap` remain.
```bash
rg --hidden --files-with-matches "useFocusTrap" src | xargs -r sed -i '' 's/useFocusTrap[^;]*;//'
```
(Expect no matches; verify afterwards.)

### 5. Adjust Playwright selectors
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
-const DRAWER_TEXT = 'Редактирование данных сотрудника';
+const DRAWER_TEST_ID = 'employee-edit-drawer';
@@
-    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
+    await expect(page.getByTestId(DRAWER_TEST_ID)).toBeVisible();
@@
-    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await page.getByRole('button', { name: /Абдуллаева Динара/i }).click();
+    await expect(page.getByTestId(DRAWER_TEST_ID)).toBeVisible();
*** End Patch
PATCH
```

### 6. Clean test artifacts
```bash
rm -rf test-results
```

## Tests & Verification
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1 --grep "Employee list"
```

## Acceptance Checklist
- [ ] Quick Add modal validation errors surface via `FormField` and RHF.
- [ ] Employee edit drawer uses RHF + schema; saving triggers `onSave` with updated employee instance.
- [ ] Playwright suite passes without “DialogTitle” console warnings.

## Rollback
```bash
set -euo pipefail
git reset --hard HEAD
git clean -fd src/components/QuickAddEmployee.tsx src/components/EmployeeEditDrawer.tsx src/components/forms/employeeEditFormHelpers.ts tests/employee-list.spec.ts
```

---

**Next Plan:** `plans/03_table-migration.plan.md`
