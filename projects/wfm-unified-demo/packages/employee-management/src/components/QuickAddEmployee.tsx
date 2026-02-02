import React, { useEffect, useMemo, useRef } from 'react';
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
  const isSubmittingRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickAddEmployeeFormValues>({
    resolver: zodResolver(quickAddEmployeeSchema),
    defaultValues: createQuickAddDefaults(),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      reset(createQuickAddDefaults());
      isSubmittingRef.current = false;
    }
  }, [isOpen, reset]);

  const submit = async (values: QuickAddEmployeeFormValues) => {
    isSubmittingRef.current = true;
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

  const {
    id: loginFieldId,
    labelId: _loginLabelId,
    ...loginAria
  } = formFieldAriaProps({
    controlId: 'quick-add-login',
    hasError: Boolean(errors.login),
    errorId: errors.login ? 'quick-add-login-error' : undefined,
  });

  const {
    id: passwordFieldId,
    labelId: _passwordLabelId,
    ...passwordAria
  } = formFieldAriaProps({
    controlId: 'quick-add-password',
    hasError: Boolean(errors.password),
    errorId: errors.password ? 'quick-add-password-error' : undefined,
  });

  const {
    id: confirmFieldId,
    labelId: _confirmLabelId,
    ...confirmAria
  } = formFieldAriaProps({
    controlId: 'quick-add-confirm',
    hasError: Boolean(errors.confirm),
    errorId: errors.confirm ? 'quick-add-confirm-error' : undefined,
  });

  return (
    <Overlay
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          if (isSubmittingRef.current) {
            isSubmittingRef.current = false;
            return;
          }
          handleCancel();
        }
      }}
      variant="modal"
      title="Быстрое добавление сотрудника"
      description="Создаёт черновик карточки по логину и паролю"
      titleHidden
      descriptionHidden
      testId="quick-add-modal"
      contentClassName="max-w-md w-full mx-auto"
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

      <div className="flex items-start justify-between py-4 border-b border-gray-200">
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

      <form onSubmit={handleSubmit(submit)} noValidate className="py-5 space-y-5">
        <FormField
          label="Логин WFM"
          required
          fieldId={loginFieldId}
          error={errors.login}
        >
          <input
            id={loginFieldId}
            type="text"
            autoFocus
            placeholder="Например, i.ivanov"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.login ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
            }`}
            {...register('login')}
            {...loginAria}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Пароль"
            required
            fieldId={passwordFieldId}
            error={errors.password}
          >
            <input
              id={passwordFieldId}
              type="password"
              placeholder="Минимум 6 символов"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              {...register('password')}
              {...passwordAria}
            />
          </FormField>
          <FormField
            label="Подтверждение"
            required
            fieldId={confirmFieldId}
            error={errors.confirm}
          >
            <input
              id={confirmFieldId}
              type="password"
              placeholder="Повторите пароль"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.confirm ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              {...register('confirm')}
              {...confirmAria}
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
