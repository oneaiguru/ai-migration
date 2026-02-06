## Metadata
- **Task**: Phase 6 – Form Migration (Stage 2)
- **Plan ID**: 2025-10-11_form-migration
- **Target Branch**: main
- **Related Docs**:
  - `docs/Tasks/phase-6-form-migration-task.md`
  - `docs/Tasks/phase-6-form-migration-discovery.md`
  - `docs/SOP/code-change-plan-sop.md`
  - `docs/SOP/plan-execution-sop.md`
  - `ai-docs/wrappers-draft/form/FormField.tsx`
  - `ai-docs/wrappers-draft/form/EmployeeForm.tsx`
  - `ai-docs/playground/src/examples/form-demo/FormDemo.tsx`

## Desired End State
Quick Add (`src/components/QuickAddEmployee.tsx`) and the Employee Edit drawer (`src/components/EmployeeEditDrawer.tsx`) are powered by React Hook Form with Zod resolvers via the shared `@wrappers/form` components. The existing mapping helpers (`src/components/forms/employeeEditFormHelpers.ts`) are reused (not replaced) to translate between form values and domain models, and both flows surface validation errors through `FormField` with the same styling/test ids currently exercised by Playwright. New dependencies (`react-hook-form`, `@hookform/resolvers`, `zod`) are installed and locked. `npm run build` and the targeted Playwright slice continue to succeed without console warnings.

### Key Discoveries
- `docs/Tasks/phase-6-form-migration-discovery.md:5-34` – identifies that helpers already exist, the legacy draft would overwrite them, Quick Add still uses bespoke state, and selectors (`quick-add-modal`, `employee-edit-drawer`) must remain stable.
- `ai-docs/wrappers-draft/form/FormField.tsx:1-76` – documents wrapper expectations (`fieldId`, `error`, `hint`, `formFieldAriaProps`) for consistent label/error wiring.
- `ai-docs/wrappers-draft/form/EmployeeForm.tsx:1-92` – demonstrates wiring RHF + Zod with shared wrappers and default values.
- `ai-docs/playground/src/examples/form-demo/FormDemo.tsx:1-99` – provides a working RHF + Zod example with `handleSubmit`, `register`, and `aria-invalid` patterns.
- `src/components/forms/employeeEditFormHelpers.ts:1-90` – exposes the existing map/resolver helpers that must be reused rather than recreated.
- `tests/employee-list.spec.ts:250-404` – Playwright relies on the stable test ids (`quick-add-modal`, `employee-edit-drawer`, `drawer-close-button`) and UI copy, so selector names cannot change.

## What We're NOT Doing
- No refactors to table or overlay triggers outside Quick Add and Employee Edit.
- No selector or test-id renames (leave `quick-add-modal`, `employee-edit-drawer`, `drawer-close-button` unchanged).
- No schema rewrites beyond helper additions required for defaults/resolvers.
- No copy updates, translation changes, or new fields.
- No deployment or screenshot refresh.

## Implementation Approach
Install the form dependencies, extend existing schemas/helpers with reusable default factories/resolvers, then migrate Quick Add followed by the Employee Edit drawer to RHF. Both components will reuse `FormField` wrappers (per AI-doc patterns) to surface validation while preserving Tailwind styling and behavioural parity. Finish by running build + the targeted Playwright slice, update the discovery note with execution status, and complete the handoff per SOP.

## Phase 1: Dependencies & Helper Preparation

### Overview
Ensure React Hook Form/Zod tooling is available and helpers expose reusable defaults/resolvers before migrating components.

### Changes Required:

#### 1. Add form dependencies
**File**: `package.json`

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: package.json
@@
-    "@radix-ui/react-dialog": "^1.1.15",
-    "@radix-ui/react-visually-hidden": "^1.2.3",
+    "@radix-ui/react-dialog": "^1.1.15",
+    "@radix-ui/react-visually-hidden": "^1.2.3",
+    "@hookform/resolvers": "^3.6.0",
@@
-    "react": "^18.2.0",
-    "react-chartjs-2": "^5.2.0",
-    "react-dom": "^18.2.0",
+    "react": "^18.2.0",
+    "react-chartjs-2": "^5.2.0",
+    "react-dom": "^18.2.0",
+    "react-hook-form": "^7.54.2",
@@
-    "recharts": "^2.8.0"
+    "recharts": "^2.8.0",
+    "zod": "^3.23.8"
*** End Patch
PATCH
```

```bash
npm install
```

#### 2. Extend employee edit helper utilities
**File**: `src/components/forms/employeeEditFormHelpers.ts`

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forms/employeeEditFormHelpers.ts
@@
-import {
-  employeeEditSchema,
-  type EmployeeEditFormValues,
-} from '../../schemas/employeeEditSchema';
+import {
+  employeeEditSchema,
+  type EmployeeEditFormValues,
+} from '../../schemas/employeeEditSchema';
+import { zodResolver } from '@hookform/resolvers/zod';
@@
 export const mapEmployeeToForm = (employee: Employee): EmployeeEditFormValues => ({
@@
 });
 
+export const createEmployeeEditDefaultValues = (): EmployeeEditFormValues => ({
+  personalInfo: {
+    lastName: '',
+    firstName: '',
+    middleName: '',
+    email: '',
+    phone: '',
+    address: '',
+    dateOfBirth: '',
+  },
+  credentials: {
+    wfmLogin: '',
+    externalLogins: '',
+    password: '',
+  },
+  orgPlacement: {
+    orgUnit: '',
+    office: '',
+    timeZone: '',
+    hourNorm: '40',
+    workScheme: '',
+  },
+  workInfo: {
+    position: '',
+    hireDate: '',
+  },
+  preferences: {
+    preferredShifts: '',
+    schemePreferences: '',
+  },
+  additional: {
+    personnelNumber: '',
+    actualAddress: '',
+    tasks: '',
+  },
+  tags: '',
+  status: 'active',
+});
+
 export const mapFormToEmployee = (
   values: EmployeeEditFormValues,
   current: Employee,
 ): Employee => {
@@
 };
 
-export const employeeEditResolver = employeeEditSchema;
+export const employeeEditResolver = employeeEditSchema;
+export const employeeEditFormResolver = zodResolver(employeeEditSchema);
*** End Patch
PATCH
```

#### 3. Add Quick Add defaults helper
**File**: `src/schemas/quickAddSchema.ts`

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/schemas/quickAddSchema.ts
@@
 export type QuickAddEmployeeFormValues = z.infer<typeof quickAddEmployeeSchema>;
+
+export const createQuickAddDefaults = (): QuickAddEmployeeFormValues => ({
+  login: '',
+  password: '',
+  confirm: '',
+});
*** End Patch
PATCH
```

## Phase 2: Migrate Quick Add to React Hook Form

### Overview
Replace bespoke `useState`/regex validation with RHF + Zod, reusing `FormField` for accessibility while preserving styling, test ids, and modal behaviour.

### Changes Required:

#### 1. Rewrite Quick Add component
**File**: `src/components/QuickAddEmployee.tsx`

```bash
cat <<'TSX' > src/components/QuickAddEmployee.tsx
import React, { useEffect, useMemo } from 'react';
import { Employee, Team } from '../types/employee';
import { createTaskEntry } from '../utils/task';
import { Overlay } from './common/Overlay';
import { DialogDescription, DialogTitle } from '../wrappers/ui/Dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  quickAddEmployeeSchema,
  type QuickAddEmployeeFormValues,
  createQuickAddDefaults,
} from '../schemas/quickAddSchema';
import { FormField, formFieldAriaProps } from '../wrappers/form';

type QuickAddEmployeeProps = {
  teams: Team[];
  isOpen: boolean;
  onClose: (options?: { restoreFocus?: boolean }) => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'metadata'>) => void;
};

const FALLBACK_TEAM: Team = {
  id: 'team_default',
  name: 'Основная команда',
  description: 'Команда по умолчанию для быстрого добавления',
  color: '#2563eb',
  managerId: 'mgr_default',
  memberCount: 0,
  targetUtilization: 0.8,
};

const buildEmployeePayload = (login: string, password: string, team: Team): Omit<Employee, 'id' | 'metadata'> => {
  const timestamp = Date.now();
  const employeeId = `EMP${timestamp.toString().slice(-5)}`;
  const displayTeam = { ...team };
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
      address: displayTeam.description ? `Офис: ${displayTeam.description}` : 'Офис по умолчанию',
    },
    credentials: {
      wfmLogin: login,
      externalLogins: [login],
      passwordSet: true,
      passwordLastUpdated: new Date(),
    },
    workInfo: {
      position: 'Сотрудник (черновик)',
      team: displayTeam,
      manager: typeof displayTeam.managerId === 'string' ? displayTeam.managerId : 'Менеджер команды',
      hireDate: new Date(),
      contractType: 'full-time',
      workLocation: displayTeam.description ?? 'Офис 1010.ru',
      department: displayTeam.name,
    },
    orgPlacement: {
      orgUnit: displayTeam.name,
      office: displayTeam.description ?? 'Офис 1010.ru',
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
      workingHours: { start: '09:00', end: '18:00' },
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
    actualAddress: displayTeam.description ? `Офис ${displayTeam.description}` : 'Офис 1010.ru, ул. Токтогула 12',
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
    defaultValues: createQuickAddDefaults(),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (isOpen) {
      reset(createQuickAddDefaults());
    }
  }, [isOpen, reset]);

  const submit = async (values: QuickAddEmployeeFormValues) => {
    const trimmedLogin = values.login.trim().toLowerCase();
    const payload = buildEmployeePayload(trimmedLogin, values.password.trim(), defaultTeam);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onSubmit(payload);
    reset(createQuickAddDefaults());
    onClose({ restoreFocus: false });
  };

  const handleCancel = () => {
    reset(createQuickAddDefaults());
    onClose({ restoreFocus: true });
  };

  return (
    <Overlay
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          handleCancel();
        }
      }}
      variant="modal"
      title="Быстрое добавление сотрудника"
      description="Создаёт черновик карточки по логину и паролю"
      titleHidden
      descriptionHidden
      testId="quick-add-modal"
      contentClassName="bg-white rounded-xl max-w-md w-full shadow-2xl"
      showCloseButton={false}
      preventClose={isSubmitting}
      closeOnOverlayClick={false}
      closeOnEscape={!isSubmitting}
    >
      <DialogTitle asChild>
        <VisuallyHidden>Быстрое добавление сотрудника</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>Создаёт черновик карточки по логину и паролю</VisuallyHidden>
      </DialogDescription>

      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Быстрое добавление сотрудника
          </h2>
          <p className="text-sm text-gray-500">
            Создавайте черновик карточки: только логин и пароль — как в WFM.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!isSubmitting) {
              handleCancel();
            }
          }}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Закрыть быстрое добавление"
          disabled={isSubmitting}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit(submit)} noValidate className="px-6 py-5 space-y-5">
        <FormField
          label="Логин WFM"
          required
          fieldId="quick-add-login"
          error={errors.login}
        >
          <input
            id="quick-add-login"
            type="text"
            autoFocus
            placeholder="Например, i.ivanov"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.login ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            {...register('login')}
            {...formFieldAriaProps({
              controlId: 'quick-add-login',
              hasError: Boolean(errors.login),
              errorId: errors.login ? 'quick-add-login-error' : undefined,
            })}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Пароль"
            required
            fieldId="quick-add-password"
            error={errors.password}
          >
            <input
              id="quick-add-password"
              type="password"
              placeholder="Минимум 6 символов"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              {...register('password')}
              {...formFieldAriaProps({
                controlId: 'quick-add-password',
                hasError: Boolean(errors.password),
                errorId: errors.password ? 'quick-add-password-error' : undefined,
              })}
            />
          </FormField>
          <FormField
            label="Подтверждение"
            required
            fieldId="quick-add-confirm"
            error={errors.confirm}
          >
            <input
              id="quick-add-confirm"
              type="password"
              placeholder="Повторите пароль"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.confirm ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              {...register('confirm')}
              {...formFieldAriaProps({
                controlId: 'quick-add-confirm',
                hasError: Boolean(errors.confirm),
                errorId: errors.confirm ? 'quick-add-confirm-error' : undefined,
              })}
            />
          </FormField>
        </div>

        <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
          <p>
            Новый сотрудник добавится в команду «{defaultTeam.name}». Все дополнительные поля доступны в карточке сразу после сохранения.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создаем…' : 'Создать черновик'}
          </button>
        </div>
      </form>
    </Overlay>
  );
};

export default QuickAddEmployee;
TSX
```

## Phase 3: Migrate Employee Edit Drawer to React Hook Form

### Overview
Replace bespoke state/regex validation in the drawer with RHF + Zod, using `FormField` for error surfacing while preserving layout, timeline, status controls, and existing test ids.

### Changes Required:

#### 1. Rewrite Employee Edit Drawer with configuration-driven fields
**File**: `src/components/EmployeeEditDrawer.tsx`

```bash
cat <<'TSX' > src/components/EmployeeEditDrawer.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useForm, type FieldError } from 'react-hook-form';
import { Employee, EmployeeStatus, EmployeeTask } from '../types/employee';
import { Overlay } from './common/Overlay';
import { DialogDescription, DialogTitle } from '../wrappers/ui/Dialog';
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  employeeEditFormResolver,
  mapEmployeeToForm,
  mapFormToEmployee,
  createEmployeeEditDefaultValues,
  type EmployeeEditFormValues,
} from './forms/employeeEditFormHelpers';
import { FormField, formFieldAriaProps } from '../wrappers/form';

type EmployeeEditDrawerProps = {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void | Promise<void>;
  mode?: 'edit' | 'create';
  isLoading?: boolean;
  onDismiss?: (employee: Employee) => void;
  onRestore?: (employee: Employee) => void;
};

type FieldConfig = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea';
  hint?: string;
  colSpan?: 'full';
};

const statusOptions: Array<{ value: EmployeeStatus; label: string }> = [
  { value: 'active', label: 'Активен' },
  { value: 'probation', label: 'Испытательный' },
  { value: 'vacation', label: 'В отпуске' },
  { value: 'inactive', label: 'Неактивен' },
  { value: 'terminated', label: 'Уволен' },
];

const personalFields: FieldConfig[] = [
  { name: 'personalInfo.lastName', label: 'Фамилия', required: true, placeholder: 'Фамилия' },
  { name: 'personalInfo.firstName', label: 'Имя', required: true, placeholder: 'Имя' },
  { name: 'personalInfo.middleName', label: 'Отчество', placeholder: 'Отчество' },
  { name: 'credentials.wfmLogin', label: 'Логин WFM', required: true, placeholder: 'Введите логин' },
  {
    name: 'credentials.externalLogins',
    label: 'Внешние логины',
    required: true,
    placeholder: 'Логин 1, Логин 2',
    hint: 'Разделяйте значения запятыми',
  },
  {
    name: 'credentials.password',
    label: 'Пароль',
    placeholder: 'Оставьте пустым чтобы не менять',
  },
  { name: 'orgPlacement.orgUnit', label: 'Точка оргструктуры', required: true },
  { name: 'orgPlacement.office', label: 'Офис', required: true },
  { name: 'workInfo.position', label: 'Должность', required: true },
  { name: 'orgPlacement.timeZone', label: 'Часовой пояс', required: true },
  { name: 'orgPlacement.hourNorm', label: 'Норма часов', required: true, type: 'number' },
];

const additionalFields: FieldConfig[] = [
  { name: 'personalInfo.email', label: 'Email', required: true, type: 'email' },
  { name: 'personalInfo.phone', label: 'Телефон', required: true, type: 'tel' },
  { name: 'personalInfo.address', label: 'Адрес', colSpan: 'full' },
  { name: 'personalInfo.dateOfBirth', label: 'Дата рождения', type: 'date' },
  { name: 'workInfo.hireDate', label: 'Дата найма', type: 'date' },
  { name: 'orgPlacement.workScheme', label: 'Схема работы' },
];

const preferenceFields: FieldConfig[] = [
  {
    name: 'preferences.preferredShifts',
    label: 'Предпочитаемые смены',
    hint: 'Разделяйте смены запятыми',
  },
  {
    name: 'preferences.schemePreferences',
    label: 'Предпочитаемые схемы',
    hint: 'Если схем несколько, перечислите через запятую',
  },
  { name: 'additional.personnelNumber', label: 'Номер сотрудника' },
  {
    name: 'additional.actualAddress',
    label: 'Фактический адрес',
    type: 'textarea',
    colSpan: 'full',
  },
];

const tasksField: FieldConfig = {
  name: 'additional.tasks',
  label: 'Новые задачи',
  type: 'textarea',
  hint: 'Одна строка — одна запись (добавятся в таймлайн)',
  colSpan: 'full',
};

const buildFieldId = (name: string) => `employee-${name.replace(/\./g, '-')}`;

const getFieldError = (errors: unknown, path: string): FieldError | undefined => {
  return path.split('.').reduce<FieldError | undefined>((acc, segment) => {
    if (!acc && typeof errors === 'object' && errors !== null) {
      const next: unknown = (errors as Record<string, unknown>)[segment];
      return next as FieldError | undefined;
    }
    if (acc && typeof acc === 'object') {
      const next: unknown = (acc as Record<string, unknown>)[segment];
      return next as FieldError | undefined;
    }
    return undefined;
  }, undefined);
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
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateIntro, setShowCreateIntro] = useState(mode === 'create');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeEditFormValues>({
    resolver: employeeEditFormResolver,
    defaultValues: createEmployeeEditDefaultValues(),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (employee && isOpen) {
      reset(mapEmployeeToForm(employee));
      setIsSaving(false);
      setFormError(null);
    }
  }, [employee, isOpen, reset]);

  useEffect(() => {
    setShowCreateIntro(mode === 'create');
  }, [mode, employee?.id]);

  useEffect(() => {
    if (!isOpen) {
      setFormError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const tagsValue = watch('tags') ?? '';
  const currentTags = useMemo(
    () =>
      tagsValue
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsValue],
  );

  const taskTimeline = useMemo(() => {
    if (!employee?.tasks) {
      return [] as Array<EmployeeTask & { createdAt: Date }>;
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

    const currentScheme = employee.orgPlacement.workScheme
      ? [{
          id: employee.orgPlacement.workScheme.id ?? 'current-scheme',
          name: employee.orgPlacement.workScheme.name,
          effectiveFrom: normalizeDate(employee.orgPlacement.workScheme.effectiveFrom),
          effectiveTo: null,
          isCurrent: true,
        }]
      : [];

    const combined = [...currentScheme, ...history];
    return combined.sort((a, b) => {
      const timeA = a.effectiveFrom ? a.effectiveFrom.getTime() : 0;
      const timeB = b.effectiveFrom ? b.effectiveFrom.getTime() : 0;
      return timeB - timeA;
    });
  }, [employee]);

  const isSubmitDisabled = isLoading || isSaving || isSubmitting;

  if (!isOpen || !employee) {
    return null;
  }

  const isCreateMode = mode === 'create';
  const displayName = [
    watch('personalInfo.lastName')?.trim() || employee.personalInfo.lastName,
    watch('personalInfo.firstName')?.trim() || employee.personalInfo.firstName,
  ]
    .filter(Boolean)
    .join(' ');
  const headerName = displayName || 'Новый сотрудник';
  const headerLogin = watch('credentials.wfmLogin')?.trim() || employee.credentials.wfmLogin || '—';

  const overlayDescription = isCreateMode
    ? 'Создание новой карточки сотрудника'
    : 'Редактирование данных действующего сотрудника';

  const handleIntroContinue = () => {
    const loginValue = watch('credentials.wfmLogin');
    if (!loginValue?.trim()) {
      setFormError('Укажите логин WFM, чтобы продолжить.');
      return;
    }
    setShowCreateIntro(false);
    setFormError(null);
  };

  const submitForm = async (values: EmployeeEditFormValues) => {
    if (!employee) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedEmployee = mapFormToEmployee(values, employee);
      await onSave(updatedEmployee);
      setValue('additional.tasks', '');
      setFormError(null);
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника', error);
      setFormError('Не удалось сохранить изменения. Повторите попытку.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderField = (config: FieldConfig) => {
    const error = getFieldError(errors, config.name);
    const fieldId = buildFieldId(config.name);
    const ariaProps = formFieldAriaProps({
      controlId: fieldId,
      hasError: Boolean(error),
      errorId: error ? `${fieldId}-error` : undefined,
    });

    const inputClass = `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
      error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
    }`;

    return (
      <div key={config.name} className={config.colSpan === 'full' ? 'sm:col-span-2' : ''}>
        <FormField
          label={config.label}
          required={config.required}
          fieldId={fieldId}
          error={error}
          hint={config.hint}
        >
          {config.type === 'textarea' ? (
            <textarea
              id={fieldId}
              className={`${inputClass} min-h-[92px]`}
              placeholder={config.placeholder}
              {...register(config.name as keyof EmployeeEditFormValues & string)}
              {...ariaProps}
            />
          ) : (
            <input
              id={fieldId}
              type={config.type ?? 'text'}
              placeholder={config.placeholder}
              min={config.type === 'number' ? 1 : undefined}
              className={inputClass}
              {...register(config.name as keyof EmployeeEditFormValues & string)}
              {...ariaProps}
            />
          )}
        </FormField>
      </div>
    );
  };

  return (
    <Overlay
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isLoading && !isSaving) {
          onClose();
        }
      }}
      variant="sheet"
      title={headerName}
      description={overlayDescription}
      titleHidden
      descriptionHidden
      testId="employee-edit-drawer"
      contentClassName="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
      showCloseButton={false}
      preventClose={isLoading || isSaving}
    >
      <DialogTitle asChild>
        <VisuallyHidden>{headerName}</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>{overlayDescription}</VisuallyHidden>
      </DialogDescription>

      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
        <div className="space-y-1">
          <p className="text-xs uppercase text-gray-500">
            {isCreateMode ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
          </p>
          <h2 className="text-lg font-semibold text-gray-900">{headerName}</h2>
          <p className="text-sm text-gray-500">Логин WFM: {headerLogin || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isCreateMode && employee.status !== 'terminated' && (
            <button
              type="button"
              onClick={() => {
                if (!isLoading) {
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
                if (!isLoading) {
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
            onClick={() => {
              if (!isLoading && !isSaving) {
                onClose();
              }
            }}
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
              {renderField({ name: 'credentials.wfmLogin', label: 'Логин WFM', required: true, placeholder: 'Введите логин' })}
              {renderField({ name: 'credentials.password', label: 'Пароль', placeholder: 'Задайте временный пароль' })}
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
              onClick={handleIntroContinue}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Продолжить
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(submitForm)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Обязательные поля</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalFields.map(renderField)}
                <div className="sm:col-span-2">
                  <FormField label="Статус" fieldId="employee-status" error={errors.status}>
                    <select
                      id="employee-status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('status')}
                      {...formFieldAriaProps({
                        controlId: 'employee-status',
                        hasError: Boolean(errors.status),
                        errorId: errors.status ? 'employee-status-error' : undefined,
                      })}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Дополнительные поля</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {additionalFields.map(renderField)}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Предпочтения и контакты</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preferenceFields.map(renderField)}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Теги и задачи</h3>
              <div className="space-y-4">
                <FormField
                  label="Теги"
                  fieldId="employee-tags"
                  hint="Разделяйте теги запятыми (максимум 4 сохраняемых тега)"
                  error={errors.tags}
                >
                  <textarea
                    id="employee-tags"
                    className={`w-full min-h-[72px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      errors.tags ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="VIP, Наставник"
                    {...register('tags')}
                    {...formFieldAriaProps({
                      controlId: 'employee-tags',
                      hasError: Boolean(errors.tags),
                      errorId: errors.tags ? 'employee-tags-error' : undefined,
                    })}
                  />
                </FormField>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {currentTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Теги появятся после массового назначения или сохранения</span>
                  )}
                </div>

                {renderField(tasksField)}

                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-medium text-gray-500">Активные задачи</h4>
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
                              ⚙️ {task.source === 'manual'
                                ? 'Вручную'
                                : task.source === 'bulk-edit'
                                  ? 'Массовое редактирование'
                                  : 'Система'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">История схем</h3>
              <div className="space-y-2">
                {schemeHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">История назначений схем отсутствует.</p>
                ) : (
                  schemeHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                    >
                      <span className="font-medium">{entry.name}</span>
                      <span className="text-xs text-gray-500">
                        {entry.isCurrent ? 'Текущая' : ''}
                        {!entry.isCurrent && entry.effectiveFrom
                          ? entry.effectiveFrom.toLocaleDateString('ru-RU')
                          : ''}
                        {entry.effectiveTo ? ` → ${entry.effectiveTo.toLocaleDateString('ru-RU')}` : ''}
                      </span>
                    </div>
                  ))
                )}
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
    </Overlay>
  );
};

export default EmployeeEditDrawer;
TSX
```

## Phase 4: Discovery Note Update

### Overview
Document execution status so the discovery file reflects that the migration landed.

### Changes Required:

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/phase-6-form-migration-discovery.md
@@
-## 2025-10-11 – Execution Notes (to append post-plan)
-- Quick Add and Employee Edit drawer migrated to RHF using shared form wrappers.
-- `@hookform/resolvers`, `react-hook-form`, and `zod` added to dependencies.
-- Helper defaults exported for reuse; discovery references remain accurate.
+## 2025-10-11 – Execution Notes (executor to update after running plan)
+- Quick Add and Employee Edit drawer migrated to RHF using shared form wrappers.
+- `@hookform/resolvers`, `react-hook-form`, and `zod` added to dependencies.
+- Helper defaults/resolvers exported for reuse; discovery references remain accurate.
*** End Patch
PATCH
```

## Tests & Validation
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1 --grep "Employee list"
```
Manual checks: Quick Add submit/cancel flows (focus restoration, validation copy) and Employee Edit drawer save/dismiss/restore interactions, ensuring no console warnings.

## Rollback
```bash
set -euo pipefail
git restore package.json package-lock.json \
  src/schemas/quickAddSchema.ts \
  src/components/forms/employeeEditFormHelpers.ts \
  src/components/QuickAddEmployee.tsx \
  src/components/EmployeeEditDrawer.tsx \
  docs/Tasks/phase-6-form-migration-discovery.md
npm install
```

## Handoff
1. Update `PROGRESS.md` – mark **2025-10-11_form-migration** as Completed, list follow-ups if any.
2. Append execution details (dependencies installed, RHF migration complete, tests run) to `docs/SESSION_HANDOFF.md`.
3. Archive this plan under `docs/Archive/Plans/` (per SOP) after execution handoff is logged.
