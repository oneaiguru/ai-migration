import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type FieldError } from 'react-hook-form';
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
import { RichTextEditor } from './common/RichTextEditor';

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
  editor?: 'rich-text';
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
  editor: 'rich-text',
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
    trigger,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EmployeeEditFormValues>({
    resolver: employeeEditFormResolver,
    defaultValues: createEmployeeEditDefaultValues(),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (employee && isOpen) {
      reset(mapEmployeeToForm(employee), { keepErrors: false, keepTouched: false, keepIsDirty: false });
      trigger();
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

  const skillsList = useMemo(() => (employee ? employee.skills.map((skill) => skill.name).join(', ') : ''), [employee]);

  const reserveSkillsList = useMemo(
    () => (employee ? employee.reserveSkills.map((skill) => skill.name).join(', ') : ''),
    [employee],
  );

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

  const isSubmitDisabled = isLoading || isSaving || isSubmitting || !isValid;

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
      setValue('additional.tasks', '<p></p>', { shouldDirty: false, shouldTouch: false });
      setValue('credentials.password', '');
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
    const { id: ariaControlId, labelId, ...ariaProps } = formFieldAriaProps({
      controlId: fieldId,
      hasError: Boolean(error),
      errorId: error ? `${fieldId}-error` : undefined,
      hintId: config.hint ? `${fieldId}-hint` : undefined,
    });

    const describedBy = ariaProps['aria-describedby'] as string | undefined;
    const ariaInvalid = ariaProps['aria-invalid'] as boolean | undefined;

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
          {config.editor === 'rich-text' ? (
            <Controller
              name={config.name as keyof EmployeeEditFormValues & string}
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={(field.value as string) ?? ''}
                  onChange={(next) => field.onChange(next)}
                  onBlur={field.onBlur}
                  disabled={isLoading}
                  placeholder={config.placeholder}
                  id={ariaControlId}
                  ariaDescribedBy={describedBy}
                  ariaInvalid={ariaInvalid}
                  ariaLabelledBy={labelId}
                />
              )}
            />
          ) : config.type === 'textarea' ? (
            <textarea
              id={ariaControlId}
              className={`${inputClass} min-h-[92px]`}
              placeholder={config.placeholder}
              {...register(config.name as keyof EmployeeEditFormValues & string)}
              {...ariaProps}
            />
          ) : (
            <input
              id={ariaControlId}
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

  const {
    id: statusFieldId,
    labelId: _statusLabelId,
    ...statusAria
  } = formFieldAriaProps({
    controlId: 'employee-status',
    hasError: Boolean(errors.status),
    errorId: errors.status ? 'employee-status-error' : undefined,
  });

  const {
    id: tagsFieldId,
    labelId: _tagsLabelId,
    ...tagsAria
  } = formFieldAriaProps({
    controlId: 'employee-tags',
    hasError: Boolean(errors.tags),
    errorId: errors.tags ? 'employee-tags-error' : undefined,
  });

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
      contentClassName="relative ml-auto flex h-full w-full max-w-2xl flex-col"
      showCloseButton={false}
      preventClose={isLoading || isSaving}
    >
      <DialogTitle asChild>
        <VisuallyHidden>{headerName}</VisuallyHidden>
      </DialogTitle>
      <DialogDescription asChild>
        <VisuallyHidden>{overlayDescription}</VisuallyHidden>
      </DialogDescription>

      <div className="flex items-start justify-between py-4 border-b border-gray-200">
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
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
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
          <div className="py-5 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Обязательные поля</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {personalFields.map(renderField)}
                <div className="sm:col-span-2">
                  <FormField label="Статус" fieldId={statusFieldId} error={errors.status}>
                    <select
                      id={statusFieldId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register('status')}
                      {...statusAria}
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
                  fieldId={tagsFieldId}
                  hint="Разделяйте теги запятыми (максимум 4 сохраняемых тега)"
                  error={errors.tags}
                >
                  <textarea
                    id={tagsFieldId}
                    className={`w-full min-h-[72px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      errors.tags ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="VIP, Наставник"
                    {...register('tags')}
                    {...tagsAria}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">История схем работы</h3>
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
            <div className="pb-2 text-sm text-red-600" role="alert">
              {formError}
            </div>
          )}

          <div className="border-t border-gray-200 py-4 flex items-center justify-between">
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
