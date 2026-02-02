import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Employee, Team } from '../types/employee';
import useFocusTrap from '../hooks/useFocusTrap';
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
      manager:
        typeof displayTeam.managerId === 'string'
          ? displayTeam.managerId
          : 'Менеджер команды',
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
    actualAddress: displayTeam.description ? `Офис ${displayTeam.description}` : 'Офис 1010.ru, ул. Токтогула 12',
    tasks: [
      createTaskEntry('Проверка учётных данных', 'system', { createdBy: 'system' }),
      createTaskEntry('Назначение наставника', 'system', { createdBy: 'system' }),
    ],
  };
};

const QuickAddEmployee: React.FC<QuickAddEmployeeProps> = ({ teams, isOpen, onClose, onSubmit }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ login?: string; password?: string; confirm?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headingId = useId();
  const descriptionId = useId();

  const defaultTeam = useMemo(() => teams[0] ?? FALLBACK_TEAM, [teams]);

  useEffect(() => {
    if (isOpen) {
      setLogin('');
      setPassword('');
      setConfirm('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useFocusTrap(containerRef, {
    enabled: isOpen,
    onEscape: () => {
      if (!isSubmitting) {
        onClose({ restoreFocus: true });
      }
    },
  });

  if (!isOpen) {
    return null;
  }

  const validate = () => {
    const nextErrors: { login?: string; password?: string; confirm?: string } = {};
    const trimmedLogin = login.trim();

    if (!trimmedLogin) {
      nextErrors.login = 'Укажите логин';
    } else if (!/^[a-zA-Z0-9._-]{3,}$/.test(trimmedLogin)) {
      nextErrors.login = 'Минимум 3 символа (латиница, цифры, ._- )';
    }

    if (!password.trim()) {
      nextErrors.password = 'Введите временный пароль';
    } else if (password.trim().length < 6) {
      nextErrors.password = 'Пароль от 6 символов';
    }

    if (!confirm.trim()) {
      nextErrors.confirm = 'Повторите пароль';
    } else if (password.trim() !== confirm.trim()) {
      nextErrors.confirm = 'Пароли должны совпадать';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedLogin = login.trim().toLowerCase();
      const payload = buildEmployeePayload(trimmedLogin, password.trim(), defaultTeam);
      await new Promise((resolve) => setTimeout(resolve, 200));
      onSubmit(payload);
      onClose({ restoreFocus: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        className="bg-white rounded-xl max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 id={headingId} className="text-lg font-semibold text-gray-900">
              Быстрое добавление сотрудника
            </h2>
            <p id={descriptionId} className="text-sm text-gray-500">
              Создавайте черновик карточки: только логин и пароль — как в WFM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose({ restoreFocus: true })}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Закрыть быстрое добавление"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1" htmlFor="quick-add-login">
              Логин WFM
            </label>
            <input
              id="quick-add-login"
              type="text"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              autoFocus
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.login ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
              }`}
              placeholder="Например, i.ivanov"
            />
            {errors.login && <p className="mt-1 text-xs text-red-600">{errors.login}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1" htmlFor="quick-add-password">
                Пароль
              </label>
              <input
                id="quick-add-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Минимум 6 символов"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1" htmlFor="quick-add-confirm">
                Подтверждение
              </label>
              <input
                id="quick-add-confirm"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirm ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Повторите пароль"
              />
              {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>}
            </div>
          </div>

          <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 space-y-1">
            <p>
              Новый сотрудник добавится в команду «{defaultTeam.name}». Все дополнительные поля доступны в карточке сразу после сохранения.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onClose({ restoreFocus: true })}
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
      </div>
    </div>
  );
};

export default QuickAddEmployee;
