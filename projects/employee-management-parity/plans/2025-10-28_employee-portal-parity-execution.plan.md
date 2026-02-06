# Plan — WFM Employee Portal Parity Execution (Shell • Requests • Profile)

## Metadata
- Task: Align the Employee Portal demo with Naumen manuals for shell navigation, vacation workflows, and profile data entry.
- Repo: ${EMPLOYEE_PORTAL_REPO}
- Discovery: docs/Workspace/Coordinator/employee-portal/Visio_Scout_2025-10-14.md
- Vision: docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md
- Manuals: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`, `CH3_Employees.md`, `CH5_Schedule_Advanced.md`, `CH7_Appendices.md`
- Supporting docs: docs/Tasks/employee-portal_manual-parity-review.task.md, docs/Workspace/Coordinator/employee-portal/CodeMap.md

## Desired End State
The deployed Employee Portal mirrors the real-system shell, vacation requests flow, and profile fields. Navigation exposes RU module tabs, Work Structure drawer, notification/help affordances, and a secondary nav for dashboard/requests/profile. Vacation requests support counters, date-range filtering, export buttons, history dialogs, and RU copy from CH5. Profile editing covers Appendix 1 required fields (FIO, contacts, address, logins, emergency contact, work scheme) with toasts confirming saves. Mock data/types and tests are updated, `npm run build`/`npm run test -- --run` pass, and documentation/checklists cite the new evidence.

### Key Discoveries
- Vision goals for shell, requests, and profile parity (docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md:6-38).
- Scout inventory of actual files to touch and image references (docs/Workspace/Coordinator/employee-portal/Visio_Scout_2025-10-14.md:6-32).
- Manual guidance on shell controls and profile content (CH2_Login_System.md:20-43; CH3_Employees.md:9-27).
- Vacation request UI expectations: counters, history, exports (CH5_Schedule_Advanced.md:109-180).
- Appendix 1 field requirements for import/profile parity (CH7_Appendices.md:14-43).
- Current implementation gaps in shell/layout (src/components/Layout.tsx:13-76), App wrapper (src/App.tsx:9-23), vacation requests (src/pages/VacationRequests.tsx:1-436), profile (src/pages/Profile.tsx:1-360), mock data (src/data/mockData.ts:1-476), and tests (src/__tests__/VacationRequests.test.tsx, Profile.test.tsx).

## What We're NOT Doing
- Implementing manager approval workflows, attachments, or shift exchanges beyond placeholders.
- Wiring real backend APIs; mocks remain authoritative.
- Introducing chart/KPI wrappers or redesigning dashboard cards beyond manual-aligned copy/layout.
- Touching other demos (Manager Portal, Analytics, Forecasting) or shared Storybook stories.

## Implementation Approach
Rebuild the shell layout (Layout/App) around module tabs and Work Structure drawer, powered by expanded mock employee data. Extend types/utilities to support Appendix 1 fields and RU formatting helpers, then refresh mocks to include structure, comments, histories, and 2024/2023 records. Replace dashboard, vacation requests, and profile pages with manual-aligned UI/logic, adding export/download helpers, dialogs, and toast feedback. Update Vitest coverage for the new behaviours, then run build/tests. Close by syncing Code Map, crosswalks, parity checklists, and handoff docs with file:line evidence and manual citations.

## Phase 1: Shell & Layout Parity
### Overview
Replace the English/dark-mode shell with a RU module bar, secondary nav, Work Structure drawer, notifications/help cluster, and contextual footer. Simplify the App wrapper to hand layout control to the new shell.

### Changes Required:
#### 1. Create Work Structure drawer component
```bash
cat <<'EOF' > src/components/WorkStructureDrawer.tsx
import React from 'react';
import { Dialog } from '../wrappers';
import { Employee } from '../types';
import { formatPhone } from '../utils/format';

interface WorkStructureDrawerProps {
  trigger: React.ReactNode;
  employee: Employee;
}

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
);

const WorkStructureDrawer: React.FC<WorkStructureDrawerProps> = ({ trigger, employee }) => {
  const structureItems = employee.structurePath;
  return (
    <Dialog
      variant="sheet"
      size="lg"
      title="Рабочая структура"
      description="Организационная и контактная информация сотрудника."
      trigger={trigger}
      testId="work-structure"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <SectionTitle title="Организационная структура" />
          <ol className="space-y-2 text-sm text-slate-700">
            {structureItems.map((item, index) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SectionTitle title="Контакты" />
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Руководитель</dt>
                <dd className="text-right font-medium text-slate-900">{employee.managerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Рабочий телефон</dt>
                <dd className="text-right font-medium text-slate-900">{formatPhone(employee.contacts.workPhone)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Корпоративная почта</dt>
                <dd className="text-right font-medium text-slate-900">{employee.contacts.corporateEmail}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SectionTitle title="Рабочие параметры" />
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Офис</dt>
                <dd className="text-right font-medium text-slate-900">{employee.office}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Часовой пояс</dt>
                <dd className="text-right font-medium text-slate-900">{employee.timeZone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Схема работы</dt>
                <dd className="text-right font-medium text-slate-900">{employee.workSettings.workScheme}</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 p-4">
          <SectionTitle title="Экстренный контакт" />
          <p className="mt-2 text-sm text-slate-700">
            {employee.emergencyContact.name} • {employee.emergencyContact.relation} • {formatPhone(employee.emergencyContact.phone)}
          </p>
        </section>
      </div>
    </Dialog>
  );
};

export default WorkStructureDrawer;
EOF
```

#### 2. Rewrite the layout shell
```bash
cat <<'EOF' > src/components/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import WorkStructureDrawer from './WorkStructureDrawer';
import { mockEmployee } from '../data/mockData';

interface LayoutProps {
  children: React.ReactNode;
}

const primaryModules = [
  { id: 'forecast', label: 'Прогнозы', path: '/forecast', available: false },
  { id: 'schedule', label: 'Расписание', path: '/schedule', available: false },
  { id: 'employees', label: 'Сотрудники', path: '/', available: true },
  { id: 'reports', label: 'Отчеты', path: '/reports', available: false },
];

const secondaryNav = [
  { path: '/', label: 'Панель управления' },
  { path: '/vacation-requests', label: 'Заявки' },
  { path: '/profile', label: 'Профиль' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const activePath = location.pathname;
  const employee = mockEmployee;
  const notificationCount = 3;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-blue-700">
                <span className="rounded-lg bg-blue-600 px-2 py-1 text-sm font-semibold text-white">WFM</span>
                <span className="text-base font-semibold text-slate-900">Личный кабинет сотрудника</span>
              </Link>
              <nav aria-label="Основные разделы" className="hidden items-center gap-2 lg:flex">
                {primaryModules.map((module) =>
                  module.available ? (
                    <Link
                      key={module.id}
                      to={module.path}
                      className="rounded-full border border-transparent px-3 py-1 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {module.label}
                    </Link>
                  ) : (
                    <span
                      key={module.id}
                      className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-sm font-medium text-slate-400"
                      aria-disabled="true"
                    >
                      {module.label}
                    </span>
                  ),
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                aria-label="Уведомления"
              >
                🔔
                <span className="absolute -top-1 -right-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
                  {notificationCount}
                </span>
              </button>
              <a
                href="https://kb.naumen.ru"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                ❓ Справка
              </a>
              <WorkStructureDrawer
                employee={employee}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    🗂️ Рабочая структура
                  </button>
                }
              />
              <details className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {employee.firstName.charAt(0)}
                  </span>
                  <span>{employee.lastName}</span>
                </summary>
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    to="/profile"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Профиль
                  </Link>
                  <button
                    type="button"
                    className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => console.info('Выход из учетной записи инициирован')}
                  >
                    Выйти
                  </button>
                </div>
              </details>
            </div>
          </div>
          <nav
            aria-label="Навигация портала"
            className="flex gap-2 overflow-x-auto rounded-lg bg-slate-100 p-1 text-sm"
          >
            {secondaryNav.map((item) => {
              const isActive = activePath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-md px-4 py-2 font-medium transition ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-blue-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2024 NAUMEN WFM • Все права защищены</p>
          <p>Подразделение: {employee.orgUnit}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
EOF
```

#### 3. Simplify App wrapper
```bash
cat <<'EOF' > src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VacationRequests from './pages/VacationRequests';
import Profile from './pages/Profile';

const App: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/vacation-requests" element={<VacationRequests />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </Layout>
);

export default App;
EOF
```

## Phase 2: Domain Types & Formatting Utilities
### Overview
Expand Employee/Vacation models to include Appendix 1 fields, request histories, and summary structures. Add formatting helpers for date ranges, phones, and initials used across shell/profile/requests.

### Changes Required:
#### 1. Expand domain types
```bash
cat <<'EOF' > src/types/index.ts
export type EmployeeContractType = 'full-time' | 'part-time' | 'contractor' | 'intern';
export type EmployeeStatus = 'active' | 'inactive';

export interface EmployeeContacts {
  corporateEmail: string;
  personalEmail?: string;
  workPhone: string;
  personalPhone?: string;
  messenger?: string;
}

export interface EmployeeAddress {
  registration: string;
  residence: string;
}

export interface EmployeeLogins {
  portal: string;
  telephonyId: string;
  externalSystems: string[];
}

export interface EmployeeWorkSettings {
  workScheme: string;
  calendar: string;
  allowOvertime: boolean;
}

export interface EmployeeEmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  fullName: string;
  photo?: string;
  birthDate: string;
  hireDate: string;
  department: string;
  position: string;
  orgUnit: string;
  office: string;
  timeZone: string;
  managerName: string;
  structurePath: string[];
  contractType: EmployeeContractType;
  status: EmployeeStatus;
  contacts: EmployeeContacts;
  address: EmployeeAddress;
  logins: EmployeeLogins;
  workSettings: EmployeeWorkSettings;
  emergencyContact: EmployeeEmergencyContact;
}

export type VacationRequestType =
  | 'vacation'
  | 'sick_leave'
  | 'personal'
  | 'unpaid'
  | 'maternity'
  | 'bereavement';

export type VacationRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface VacationRequestStatusEntry {
  status: VacationRequestStatus;
  timestamp: string;
  actor: string;
  comment?: string;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: VacationRequestType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  isEmergency: boolean;
  status: VacationRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  managerComment?: string;
  lastUpdatedAt: string;
  history: VacationRequestStatusEntry[];
}

export interface VacationBalanceCategory {
  total: number;
  used: number;
  pending?: number;
  available: number;
}

export interface VacationBalance {
  employeeId: string;
  updatedAt: string;
  vacation: VacationBalanceCategory;
  sickLeave: VacationBalanceCategory;
  personal: VacationBalanceCategory;
}

export interface DashboardStats {
  year: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  upcomingVacations: number;
  lastUpdatedAt: string;
}

export interface VacationSummary {
  year: number;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}
EOF
```

#### 2. Add formatting helpers
```bash
cat <<'EOF' > src/utils/format.ts
export type DateInput = string | number | Date;

const toDate = (value: DateInput): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};

export const formatDate = (value: DateInput, options?: Intl.DateTimeFormatOptions): string => {
  const date = toDate(value);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatDateTime = (value: DateInput, options?: Intl.DateTimeFormatOptions): string => {
  const date = toDate(value);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string =>
  new Intl.NumberFormat('ru-RU', options).format(value);

export const formatDateRange = (
  start: DateInput,
  end: DateInput,
  options?: Intl.DateTimeFormatOptions,
): string => {
  if (!start || !end) {
    return '';
  }

  return `${formatDate(start, options)} – ${formatDate(end, options)}`;
};

export const formatPhone = (value?: string): string => {
  if (!value?.trim()) {
    return '—';
  }

  return value;
};

export const formatInitials = (lastName: string, firstName: string, middleName?: string): string => {
  const initials: string[] = [];

  if (firstName?.length) {
    initials.push(`${firstName.charAt(0).toUpperCase()}.`);
  }

  if (middleName?.length) {
    initials.push(`${middleName.charAt(0).toUpperCase()}.`);
  }

  return [lastName, initials.join(' ')].filter(Boolean).join(' ');
};
EOF
```

## Phase 3: Mock Data & Services
### Overview
Bring mock data in line with the new types: richer employee profile, request history, 2024 counters, and CSV-friendly exports. Ensure services hand back deep clones so UI state mutations don’t leak.

### Changes Required:
```bash
cat <<'EOF' > src/data/mockData.ts
import {
  DashboardStats,
  Employee,
  VacationBalance,
  VacationRequest,
  VacationRequestStatusEntry,
} from '../types';

const cloneHistory = (entries: VacationRequestStatusEntry[]): VacationRequestStatusEntry[] =>
  entries.map((entry) => ({ ...entry }));

const cloneRequest = (request: VacationRequest): VacationRequest => ({
  ...request,
  history: cloneHistory(request.history),
});

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
};

export const mockEmployee: Employee = {
  id: 'emp-001',
  employeeId: 'EMP001',
  firstName: 'Анна',
  lastName: 'Иванова',
  middleName: 'Петровна',
  fullName: 'Иванова Анна Петровна',
  photo: '👩‍💼',
  birthDate: '1990-05-20',
  hireDate: '2020-03-15',
  department: 'Контакт-центр',
  position: 'Старший специалист по обслуживанию клиентов',
  orgUnit: 'Контакт-центр • Операционный центр • Первая линия',
  office: 'Москва, башня Федерация',
  timeZone: 'Europe/Moscow',
  managerName: 'Петров Иван Сергеевич',
  structurePath: [
    'Российская Федерация',
    'Контакт-центр',
    'Операционный центр',
    'Первая линия поддержки',
  ],
  contractType: 'full-time',
  status: 'active',
  contacts: {
    corporateEmail: 'a.ivanova@company.ru',
    personalEmail: 'anna.private@example.com',
    workPhone: '+7 (495) 100-20-20',
    personalPhone: '+7 (999) 123-45-67',
    messenger: '@anna_support',
  },
  address: {
    registration: 'Москва, ул. Арбат, д. 12, кв. 34',
    residence: 'Москва, ул. Бауманская, д. 5, кв. 17',
  },
  logins: {
    portal: 'anna.ivanova',
    telephonyId: 'SIP-201',
    externalSystems: ['jira-ops-001', 'sap-hr-ivanova'],
  },
  workSettings: {
    workScheme: '5/2 (09:00–18:00, МСК)',
    calendar: 'Производственный календарь РФ 2024',
    allowOvertime: false,
  },
  emergencyContact: {
    name: 'Иванов Петр Сергеевич',
    phone: '+7 (999) 765-43-21',
    relation: 'Супруг',
  },
};

const makeHistory = (entries: VacationRequestStatusEntry[]): VacationRequestStatusEntry[] =>
  cloneHistory(entries);

export const mockVacationRequests: VacationRequest[] = [
  {
    id: 'req-001',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'vacation',
    startDate: '2024-09-16',
    endDate: '2024-09-27',
    totalDays: 12,
    reason: 'Основной отпуск по графику',
    isEmergency: false,
    status: 'approved',
    submittedAt: '2024-08-12T10:15:00+03:00',
    reviewedAt: '2024-08-14T14:30:00+03:00',
    reviewedBy: 'Петров И.С.',
    reviewNotes: 'Замещающие смены согласованы',
    managerComment: 'График подтверждён руководителем группы.',
    lastUpdatedAt: '2024-08-14T14:30:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2024-08-12T10:15:00+03:00',
        actor: mockEmployee.fullName,
        comment: 'Отпуск согласно плану',
      },
      {
        status: 'approved',
        timestamp: '2024-08-14T14:30:00+03:00',
        actor: 'Петров И.С.',
        comment: 'Замену согласовали с планированием',
      },
    ]),
  },
  {
    id: 'req-002',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'sick_leave',
    startDate: '2024-10-02',
    endDate: '2024-10-04',
    totalDays: 3,
    reason: 'Плановый медицинский осмотр',
    isEmergency: true,
    status: 'pending',
    submittedAt: '2024-09-28T19:45:00+03:00',
    lastUpdatedAt: '2024-09-28T19:45:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2024-09-28T19:45:00+03:00',
        actor: mockEmployee.fullName,
        comment: 'Срочное направление от врача',
      },
    ]),
  },
  {
    id: 'req-003',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'vacation',
    startDate: '2024-05-06',
    endDate: '2024-05-10',
    totalDays: 5,
    reason: 'Майские выходные с семьёй',
    isEmergency: false,
    status: 'approved',
    submittedAt: '2024-04-10T11:20:00+03:00',
    reviewedAt: '2024-04-12T15:50:00+03:00',
    reviewedBy: 'Петров И.С.',
    reviewNotes: 'Отпуск укладывается в график',
    managerComment: 'Обязательно передать дела сменщику.',
    lastUpdatedAt: '2024-04-12T15:50:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2024-04-10T11:20:00+03:00',
        actor: mockEmployee.fullName,
      },
      {
        status: 'approved',
        timestamp: '2024-04-12T15:50:00+03:00',
        actor: 'Петров И.С.',
        comment: 'График подтверждён',
      },
    ]),
  },
  {
    id: 'req-004',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'personal',
    startDate: '2024-11-18',
    endDate: '2024-11-18',
    totalDays: 1,
    reason: 'Выпуск ребёнка из школы',
    isEmergency: false,
    status: 'pending',
    submittedAt: '2024-10-25T09:05:00+03:00',
    lastUpdatedAt: '2024-10-25T09:05:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2024-10-25T09:05:00+03:00',
        actor: mockEmployee.fullName,
        comment: 'Нужен один день для семейного события',
      },
    ]),
  },
  {
    id: 'req-005',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'vacation',
    startDate: '2024-07-10',
    endDate: '2024-07-12',
    totalDays: 3,
    reason: 'Короткий отпуск внутри страны',
    isEmergency: false,
    status: 'rejected',
    submittedAt: '2024-06-15T12:30:00+03:00',
    reviewedAt: '2024-06-18T10:00:00+03:00',
    reviewedBy: 'Петров И.С.',
    reviewNotes: 'В указанный период недостаточно сотрудников',
    managerComment: 'Предложено выбрать другое окно с меньшей нагрузкой.',
    lastUpdatedAt: '2024-06-18T10:00:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2024-06-15T12:30:00+03:00',
        actor: mockEmployee.fullName,
      },
      {
        status: 'rejected',
        timestamp: '2024-06-18T10:00:00+03:00',
        actor: 'Петров И.С.',
        comment: 'Нагрузка на смене превышает план',
      },
    ]),
  },
  {
    id: 'req-006',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'personal',
    startDate: '2024-03-01',
    endDate: '2024-03-01',
    totalDays: 1,
    reason: 'Посещение нотариуса',
    isEmergency: false,
    status: 'cancelled',
    submittedAt: '2024-02-20T08:00:00+03:00',
    lastUpdatedAt: '2024-02-22T09:30:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2024-02-20T08:00:00+03:00',
        actor: mockEmployee.fullName,
      },
      {
        status: 'cancelled',
        timestamp: '2024-02-22T09:30:00+03:00',
        actor: mockEmployee.fullName,
        comment: 'Необходимость отпала',
      },
    ]),
  },
  {
    id: 'req-007',
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: 'vacation',
    startDate: '2023-12-20',
    endDate: '2023-12-29',
    totalDays: 10,
    reason: 'Новогодние праздники с семьёй',
    isEmergency: false,
    status: 'approved',
    submittedAt: '2023-11-10T09:00:00+03:00',
    reviewedAt: '2023-11-15T13:45:00+03:00',
    reviewedBy: 'Петров И.С.',
    reviewNotes: 'Утверждено заранее',
    managerComment: 'Смена закрыта коллегой из соседней группы.',
    lastUpdatedAt: '2023-11-15T13:45:00+03:00',
    history: makeHistory([
      {
        status: 'pending',
        timestamp: '2023-11-10T09:00:00+03:00',
        actor: mockEmployee.fullName,
      },
      {
        status: 'approved',
        timestamp: '2023-11-15T13:45:00+03:00',
        actor: 'Петров И.С.',
      },
    ]),
  },
];

export const mockVacationBalance: VacationBalance = {
  employeeId: mockEmployee.employeeId,
  updatedAt: '2024-09-30T10:30:00+03:00',
  vacation: {
    total: 28,
    used: 14,
    pending: 8,
    available: 6,
  },
  sickLeave: {
    total: 10,
    used: 2,
    available: 8,
  },
  personal: {
    total: 5,
    used: 1,
    pending: 1,
    available: 3,
  },
};

const statsYear = 2024;
const requestsForYear = mockVacationRequests.filter(
  (request) => new Date(request.startDate).getFullYear() === statsYear,
);

const countByStatus = (status: VacationRequest['status']): number =>
  requestsForYear.filter((request) => request.status === status).length;

export const mockDashboardStats: DashboardStats = {
  year: statsYear,
  totalRequests: requestsForYear.length,
  pendingRequests: countByStatus('pending'),
  approvedRequests: countByStatus('approved'),
  rejectedRequests: countByStatus('rejected'),
  upcomingVacations: requestsForYear.filter(
    (request) => request.status === 'approved' && new Date(request.startDate) >= new Date(),
  ).length,
  lastUpdatedAt: '2024-09-30T08:15:00+03:00',
};

export const login = async (
  username: string,
  password: string,
): Promise<{ token: string; user: Employee }> => {
  const payload = { username, password };

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        return { token: data.access_token, user: (data.user as Employee) ?? mockEmployee };
      }
    }
  } catch (error) {
    console.error('Login failed:', error);
  }

  const fallbackToken = `mock-token-${Date.now()}`;
  localStorage.setItem('token', fallbackToken);
  return { token: fallbackToken, user: mockEmployee };
};

export const getVacationRequests = async (): Promise<VacationRequest[]> => {
  try {
    const response = await fetch('/api/v1/requests/vacation', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    });

    if (response.ok) {
      const data: VacationRequest[] = await response.json();
      return data.map(cloneRequest);
    }
  } catch (error) {
    console.error('Failed to fetch vacation requests:', error);
  }

  return mockVacationRequests.map(cloneRequest);
};

export const getEmployee = async (): Promise<Employee> => {
  try {
    const response = await fetch('/api/v1/employees/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    });

    if (response.ok) {
      const data: Employee = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch employee profile:', error);
  }

  return { ...mockEmployee };
};

export const getVacationBalance = async (): Promise<VacationBalance> => {
  try {
    const response = await fetch('/api/v1/employees/vacation-balance', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    });

    if (response.ok) {
      const data: VacationBalance = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch vacation balance:', error);
  }

  return { ...mockVacationBalance };
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await fetch('/api/v1/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    });

    if (response.ok) {
      const data: DashboardStats = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  }

  return { ...mockDashboardStats };
};

export const submitVacationRequest = async (
  request: Partial<VacationRequest>,
): Promise<VacationRequest> => {
  const payload = {
    employee_id: request.employeeId ?? mockEmployee.employeeId,
    start_date: request.startDate,
    end_date: request.endDate,
    request_type: request.type,
    reason: request.reason,
    is_emergency: request.isEmergency,
  };

  try {
    const response = await fetch('/api/v1/requests/vacation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data: VacationRequest = await response.json();
      return cloneRequest(data);
    }
  } catch (error) {
    console.error('Failed to submit vacation request:', error);
  }

  const startDate = request.startDate ?? new Date().toISOString().slice(0, 10);
  const endDate = request.endDate ?? startDate;
  const submittedAt = new Date().toISOString();
  const totalDays = request.totalDays ?? calculateDays(startDate, endDate);

  const newRequest: VacationRequest = {
    id: `fallback-${Date.now()}`,
    employeeId: mockEmployee.employeeId,
    employeeName: mockEmployee.fullName,
    type: request.type ?? 'vacation',
    startDate,
    endDate,
    totalDays,
    reason: request.reason,
    isEmergency: request.isEmergency ?? false,
    status: 'pending',
    submittedAt,
    lastUpdatedAt: submittedAt,
    history: cloneHistory([
      {
        status: 'pending',
        timestamp: submittedAt,
        actor: mockEmployee.fullName,
        comment: request.reason,
      },
    ]),
  };

  mockVacationRequests.unshift(newRequest);
  return cloneRequest(newRequest);
};
EOF
```

## Phase 4: Dashboard Behaviour Parity
### Overview
Refresh the dashboard to greet the employee with RU copy, quick actions, stat cards, vacation balance progress, and recent/upcoming requests based on the enriched mock data.

### Changes Required:
```bash
cat <<'EOF' > src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardStats,
  getVacationBalance,
  getVacationRequests,
  mockEmployee,
} from '../data/mockData';
import { DashboardStats, VacationBalance, VacationRequest } from '../types';
import { formatDateRange, formatDateTime, formatNumber } from '../utils/format';

const quickActions = [
  {
    id: 'request',
    title: 'Подать заявку',
    description: 'Отпуск, отгул, больничный',
    to: '/vacation-requests',
    icon: '📝',
  },
  {
    id: 'profile',
    title: 'Обновить профиль',
    description: 'Контакты, адрес, логины',
    to: '/profile',
    icon: '🧾',
  },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [balance, setBalance] = useState<VacationBalance | null>(null);
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, balanceData, requestsData] = await Promise.all([
          getDashboardStats(),
          getVacationBalance(),
          getVacationRequests(),
        ]);
        setStats(statsData);
        setBalance(balanceData);
        setRequests(requestsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const requestsForYear = useMemo(() => {
    if (!stats) {
      return [] as VacationRequest[];
    }

    return requests.filter(
      (request) => new Date(request.startDate).getFullYear() === stats.year,
    );
  }, [requests, stats]);

  const recentRequests = useMemo(
    () =>
      [...requestsForYear]
        .sort(
          (a, b) =>
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
        )
        .slice(0, 3),
    [requestsForYear],
  );

  const upcomingVacations = useMemo(
    () =>
      requests
        .filter(
          (request) =>
            request.status === 'approved' && new Date(request.startDate) >= new Date(),
        )
        .sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        )
        .slice(0, 3),
    [requests],
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="mb-3 text-5xl">⏳</div>
          <p className="text-lg font-medium">Загружаем данные кабинета…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Индивидуальная панель
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {mockEmployee.fullName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {mockEmployee.position} • {mockEmployee.department}
            </p>
            <p className="text-sm text-slate-500">
              Руководитель: {mockEmployee.managerName} • Офис: {mockEmployee.office}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <p className="font-semibold">График работы</p>
              <p>{mockEmployee.workSettings.workScheme}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Часовой пояс</p>
              <p>{mockEmployee.timeZone}</p>
            </div>
          </div>
        </div>
      </section>

      {stats ? (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Всего заявок {stats.year}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {formatNumber(stats.totalRequests)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Обновлено {formatDateTime(stats.lastUpdatedAt)}
            </p>
          </article>
          <article className="rounded-xl border border-yellow-100 bg-yellow-50 p-5 shadow-sm">
            <p className="text-sm text-yellow-700">На рассмотрении</p>
            <p className="mt-2 text-3xl font-semibold text-yellow-700">
              {formatNumber(stats.pendingRequests)}
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              Следите за статусом в разделе «Заявки»
            </p>
          </article>
          <article className="rounded-xl border border-green-100 bg-green-50 p-5 shadow-sm">
            <p className="text-sm text-green-700">Одобрено</p>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {formatNumber(stats.approvedRequests)}
            </p>
            <p className="mt-1 text-xs text-green-600">
              Ближайшие отпуска: {formatNumber(stats.upcomingVacations)}
            </p>
          </article>
          <article className="rounded-xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
            <p className="text-sm text-rose-700">Отклонено</p>
            <p className="mt-2 text-3xl font-semibold text-rose-700">
              {formatNumber(stats.rejectedRequests)}
            </p>
            <p className="mt-1 text-xs text-rose-600">
              Ознакомьтесь с комментариями руководителя
            </p>
          </article>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Последние заявки</h2>
            <Link
              to="/vacation-requests"
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Все заявки →
            </Link>
          </div>
          <ul className="space-y-4">
            {recentRequests.length ? (
              recentRequests.map((request) => (
                <li key={request.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                      📅 {formatDateRange(request.startDate, request.endDate)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Подано {formatDateTime(request.submittedAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-500">
                      {request.type === 'vacation'
                        ? 'Отпуск'
                        : request.type === 'sick_leave'
                        ? 'Больничный'
                        : 'Прочее'}
                    </span>
                    <span>
                      Статус:{' '}
                      <strong className="text-slate-800">
                        {request.status === 'approved'
                          ? 'Одобрено'
                          : request.status === 'pending'
                          ? 'На рассмотрении'
                          : request.status === 'rejected'
                          ? 'Отклонено'
                          : 'Отменено'}
                      </strong>
                    </span>
                    {request.managerComment ? (
                      <span className="text-slate-500">
                        Комментарий: {request.managerComment}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-600">
                    {request.reason || 'Комментарий не указан'}
                  </p>
                </li>
              ))
            ) : (
              <li className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Заявок за {stats?.year ?? 'выбранный период'} пока нет.
              </li>
            )}
          </ul>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Быстрые действия</h2>
            <div className="mt-4 space-y-3">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  to={action.to}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span>
                    <span className="block font-semibold text-slate-900">{action.title}</span>
                    {action.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-800">Ближайшие отпуска</h2>
            <ul className="mt-4 space-y-3 text-sm text-blue-900">
              {upcomingVacations.length ? (
                upcomingVacations.map((request) => (
                  <li key={request.id} className="rounded-lg border border-blue-100 bg-white/70 px-3 py-2">
                    <p className="font-medium text-blue-900">
                      {formatDateRange(request.startDate, request.endDate)}
                    </p>
                    <p className="text-blue-700">
                      Комментарий руководителя:{' '}
                      {request.managerComment ?? 'без комментария'}
                    </p>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-dashed border-blue-200 px-3 py-2 text-blue-700">
                  Одобренные отпуска впереди не найдены.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {balance ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Баланс отпусков</h2>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Обновлено {formatDateTime(balance.updatedAt)}
            </span>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Основной отпуск', data: balance.vacation, color: 'bg-blue-600' },
              { label: 'Больничные', data: balance.sickLeave, color: 'bg-green-600' },
              { label: 'Личные дни', data: balance.personal, color: 'bg-purple-600' },
            ].map((item) => {
              const percent = Math.min(
                100,
                Math.round((item.data.available / item.data.total) * 100),
              );

              return (
                <div key={item.label} className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-900">
                      {item.data.available} дн.
                    </span>
                    <span className="text-xs text-slate-500">
                      доступно из {item.data.total}
                    </span>
                  </div>
                  {'pending' in item.data && item.data.pending !== undefined ? (
                    <p className="text-xs text-slate-500">
                      В ожидании: {item.data.pending} • Использовано: {item.data.used}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Использовано: {item.data.used}
                    </p>
                  )}
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Dashboard;
EOF
```

## Phase 5: Vacation Requests Workflow
### Overview
Rebuild the vacation requests page around manual behaviour: per-year counters, status filters, date-range picker, CSV export, request history dialog, and RU copy. Ensure new form state and toast feedback align with updated services.

### Changes Required:
#### 1. Replace vacation requests page
```bash
cat <<'EOF' > src/pages/VacationRequests.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, FilterGroup, FormField, ReportTable } from '../wrappers';
import { getVacationRequests, submitVacationRequest } from '../data/mockData';
import { VacationRequest, VacationRequestStatus, VacationSummary } from '../types';
import { formatDate, formatDateRange, formatDateTime } from '../utils/format';

type RequestFilter = 'all' | VacationRequestStatus;

type SortKey = 'startDate' | 'submittedAt' | 'status' | 'lastUpdatedAt';
type SortDirection = 'asc' | 'desc';

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

interface RequestFormState {
  type: VacationRequest['type'];
  startDate: string;
  endDate: string;
  reason: string;
  isEmergency: boolean;
}

interface ValidationErrors {
  type?: string;
  startDate?: string;
  endDate?: string;
}

const pluralizeDays = (days: number) => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
  return 'дней';
};

const statusLabels: Record<VacationRequestStatus, string> = {
  approved: 'Одобрено',
  pending: 'На рассмотрении',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
};

const statusBadgeClass = (status: VacationRequestStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-rose-100 text-rose-800';
    case 'cancelled':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const statusSortWeight: Record<VacationRequestStatus, number> = {
  approved: 2,
  pending: 1,
  rejected: 0,
  cancelled: -1,
};

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
};

const defaultFormState: RequestFormState = {
  type: 'vacation',
  startDate: '',
  endDate: '',
  reason: '',
  isEmergency: false,
};

const validateRequestForm = (state: RequestFormState): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!state.type) {
    errors.type = 'Выберите тип отпуска';
  }

  if (!state.startDate) {
    errors.startDate = 'Укажите дату начала';
  }

  if (!state.endDate) {
    errors.endDate = 'Укажите дату окончания';
  }

  if (state.startDate && state.endDate) {
    const start = new Date(state.startDate);
    const end = new Date(state.endDate);
    if (end.getTime() < start.getTime()) {
      errors.endDate = 'Дата окончания не может быть раньше даты начала';
    }
  }

  return errors;
};

const buildCsv = (requests: VacationRequest[]): string => {
  const header = [
    'ID',
    'Тип',
    'Статус',
    'Период',
    'Дней',
    'Комментарий сотрудника',
    'Комментарий руководителя',
    'Подано',
    'Обновлено',
  ];
  const rows = requests.map((request) => [
    request.id,
    request.type,
    statusLabels[request.status],
    `${formatDate(request.startDate)} – ${formatDate(request.endDate)}`,
    request.totalDays.toString(),
    (request.reason ?? '').replace(/\r?\n/g, ' '),
    (request.managerComment ?? '').replace(/\r?\n/g, ' '),
    formatDateTime(request.submittedAt),
    formatDateTime(request.lastUpdatedAt),
  ]);

  return [header, ...rows]
    .map((columns) => columns.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');
};

const downloadCsv = (filename: string, csv: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL?.createObjectURL?.(blob);

  if (!url) {
    console.info('CSV экспорт готов', csv);
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const computeSummary = (requests: VacationRequest[], year: number): VacationSummary => {
  const summary: VacationSummary = {
    year,
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  requests.forEach((request) => {
    if (new Date(request.startDate).getFullYear() !== year) {
      return;
    }

    summary.total += 1;
    summary[request.status] += 1;
  });

  return summary;
};

const HistoryDialog = ({ request }: { request: VacationRequest }) => (
  <Dialog
    title="Хронология изменений"
    description={`Заявка ${formatDateRange(request.startDate, request.endDate)}`}
    trigger={
      <button
        type="button"
        className="text-sm font-medium text-blue-700 hover:text-blue-800"
      >
        Хронология
      </button>
    }
    size="md"
  >
    <ul className="space-y-3">
      {request.history.map((entry, index) => (
        <li key={`${entry.timestamp}-${index}`} className="rounded-lg border border-slate-200 p-3">
          <p className="text-sm font-semibold text-slate-800">
            {statusLabels[entry.status]}
          </p>
          <p className="text-xs text-slate-500">
            {formatDateTime(entry.timestamp)} • {entry.actor}
          </p>
          {entry.comment ? (
            <p className="mt-1 text-sm text-slate-600">{entry.comment}</p>
          ) : null}
        </li>
      ))}
    </ul>
  </Dialog>
);

const VacationRequests: React.FC = () => {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestFilter>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodStart, setPeriodStart] = useState<string>(`${selectedYear}-01-01`);
  const [periodEnd, setPeriodEnd] = useState<string>(`${selectedYear}-12-31`);
  const [searchValue, setSearchValue] = useState('');
  const [sort, setSort] = useState<SortState>({ key: 'submittedAt', direction: 'desc' });
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [formState, setFormState] = useState<RequestFormState>(defaultFormState);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await getVacationRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  useEffect(() => {
    if (!requests.length) {
      return;
    }

    const years = Array.from(
      new Set(requests.map((request) => new Date(request.startDate).getFullYear())),
    ).sort((a, b) => b - a);

    if (!years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [requests, selectedYear]);

  useEffect(() => {
    setPeriodStart(`${selectedYear}-01-01`);
    setPeriodEnd(`${selectedYear}-12-31`);
  }, [selectedYear]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const yearScopedRequests = useMemo(
    () =>
      requests.filter(
        (request) => new Date(request.startDate).getFullYear() === selectedYear,
      ),
    [requests, selectedYear],
  );

  const summary = useMemo(
    () => computeSummary(requests, selectedYear),
    [requests, selectedYear],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<VacationRequestStatus, number> = {
      approved: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0,
    };

    yearScopedRequests.forEach((request) => {
      counts[request.status] += 1;
    });

    return counts;
  }, [yearScopedRequests]);

  const filteredRequests = useMemo(() => {
    const inPeriod = (request: VacationRequest) => {
      if (!periodStart || !periodEnd) {
        return true;
      }

      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      const requestDate = new Date(request.startDate);
      return requestDate >= start && requestDate <= end;
    };

    const matchesSearch = (request: VacationRequest) => {
      if (!searchValue.trim()) {
        return true;
      }

      const query = searchValue.trim().toLowerCase();

      return (
        request.reason?.toLowerCase().includes(query) ||
        request.managerComment?.toLowerCase().includes(query) ||
        request.reviewedBy?.toLowerCase().includes(query) ||
        statusLabels[request.status].toLowerCase().includes(query) ||
        request.type.toLowerCase().includes(query)
      );
    };

    return yearScopedRequests.filter((request) => {
      if (filter !== 'all' && request.status !== filter) {
        return false;
      }

      if (!inPeriod(request)) {
        return false;
      }

      return matchesSearch(request);
    });
  }, [yearScopedRequests, filter, periodStart, periodEnd, searchValue]);

  const sortedRequests = useMemo(() => {
    const sorted = [...filteredRequests];
    sorted.sort((a, b) => {
      const multiplier = sort.direction === 'asc' ? 1 : -1;

      if (sort.key === 'status') {
        return (statusSortWeight[a.status] - statusSortWeight[b.status]) * multiplier;
      }

      const aDate = new Date(a[sort.key]).getTime();
      const bDate = new Date(b[sort.key]).getTime();
      return (aDate - bDate) * multiplier;
    });

    return sorted;
  }, [filteredRequests, sort]);

  const requestRows = useMemo(
    () =>
      sortedRequests.map((request) => ({
        id: request.id,
        period: formatDateRange(request.startDate, request.endDate),
        days: `${request.totalDays} ${pluralizeDays(request.totalDays)}`,
        type: request.type,
        status: request.status,
        reviewer: request.reviewedBy ?? '—',
        submittedAt: formatDateTime(request.submittedAt),
        lastUpdatedAt: formatDateTime(request.lastUpdatedAt),
        employeeComment: request.reason ?? '—',
        managerComment: request.managerComment ?? '—',
        request,
      })),
    [sortedRequests],
  );

  const tableColumns = [
    { id: 'period', label: 'Период' },
    { id: 'days', label: 'Длительность' },
    { id: 'employeeComment', label: 'Комментарий сотрудника' },
    {
      id: 'status',
      label: (
        <button
          type="button"
          className="text-xs font-semibold uppercase text-slate-500"
          onClick={() =>
            setSort((prev) => ({
              key: 'status',
              direction: prev.direction === 'asc' ? 'desc' : 'asc',
            }))
          }
        >
          Статус {sort.key === 'status' ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
        </button>
      ),
      render: (value: unknown) => (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(value as VacationRequestStatus)}`}>
          {statusLabels[value as VacationRequestStatus]}
        </span>
      ),
    },
    { id: 'managerComment', label: 'Комментарий руководителя' },
    { id: 'reviewer', label: 'Рассмотрел' },
    {
      id: 'submittedAt',
      label: (
        <button
          type="button"
          className="text-xs font-semibold uppercase text-slate-500"
          onClick={() =>
            setSort((prev) => ({
              key: 'submittedAt',
              direction:
                prev.key === 'submittedAt' && prev.direction === 'desc' ? 'asc' : 'desc',
            }))
          }
        >
          Подано {sort.key === 'submittedAt' ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
        </button>
      ),
    },
    {
      id: 'lastUpdatedAt',
      label: (
        <button
          type="button"
          className="text-xs font-semibold uppercase text-slate-500"
          onClick={() =>
            setSort((prev) => ({
              key: 'lastUpdatedAt',
              direction:
                prev.key === 'lastUpdatedAt' && prev.direction === 'desc' ? 'asc' : 'desc',
            }))
          }
        >
          Обновлено {sort.key === 'lastUpdatedAt' ? (sort.direction === 'asc' ? '↑' : '↓') : '↕'}
        </button>
      ),
    },
    {
      id: 'history',
      label: 'История',
      render: (_value: unknown, row: Record<string, unknown>) => (
        <HistoryDialog request={row.request as VacationRequest} />
      ),
    },
  ];

  const filterOptions = [
    { id: 'all', label: `Все (${summary.total})` },
    { id: 'pending', label: `На рассмотрении (${statusCounts.pending})` },
    { id: 'approved', label: `Одобрено (${statusCounts.approved})` },
    { id: 'rejected', label: `Отклонено (${statusCounts.rejected})` },
    { id: 'cancelled', label: `Отменено (${statusCounts.cancelled})` },
  ];

  const hasActiveFilters =
    filter !== 'all' ||
    searchValue.trim().length > 0 ||
    periodStart !== `${selectedYear}-01-01` ||
    periodEnd !== `${selectedYear}-12-31`;

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormState(defaultFormState);
      setFormErrors({});
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateRequestForm(formState);
    if (Object.keys(validation).length) {
      setFormErrors(validation);
      return;
    }

    setSubmitting(true);
    try {
      const totalDays = calculateDays(formState.startDate, formState.endDate);
      const newRequest = await submitVacationRequest({
        ...formState,
        totalDays,
      });
      setRequests((prev) => [newRequest, ...prev.filter((request) => request.id !== newRequest.id)]);
      setToast('Заявка отправлена на рассмотрение');
      setDialogOpen(false);
      setFormState(defaultFormState);
      setFormErrors({});
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const csv = buildCsv(sortedRequests);
      downloadCsv(`vacation-requests-${selectedYear}.csv`, csv);
      setToast('Экспорт успешно сформирован');
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setFilter('all');
    setSearchValue('');
    setPeriodStart(`${selectedYear}-01-01`);
    setPeriodEnd(`${selectedYear}-12-31`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="mb-3 text-5xl">⏳</div>
          <p className="text-lg font-medium">Загружаем список заявок…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Мои заявки на отпуск</h1>
          <p className="text-sm text-slate-600">
            Управляйте отпусками, отслеживайте статус согласования и скачивайте отчёты.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => console.info('Запланировано построение графика отпусков')}
          >
            📅 Построить график отпусков
          </button>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            ➕ Новая заявка
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Всего за {selectedYear}
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-yellow-700">На рассмотрении</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-700">{summary.pending}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-green-700">Одобрено</p>
          <p className="mt-1 text-2xl font-semibold text-green-700">{summary.approved}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-rose-700">Отклонено / Отменено</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">
            {summary.rejected + summary.cancelled}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 gap-3">
              <FormField fieldId="year-select" label="Год">
                <select
                  id="year-select"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                >
                  {Array.from(
                    new Set(requests.map((request) => new Date(request.startDate).getFullYear())),
                  )
                    .sort((a, b) => b - a)
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
              </FormField>
              <FormField fieldId="period-start" label="Заявки с">
                <input
                  id="period-start"
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={periodStart}
                  max={periodEnd}
                  onChange={(event) => setPeriodStart(event.target.value)}
                />
              </FormField>
              <FormField fieldId="period-end" label="по">
                <input
                  id="period-end"
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={periodEnd}
                  min={periodStart}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                />
              </FormField>
            </div>
            <FormField fieldId="search" label="Поиск">
              <input
                id="search"
                type="search"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Искать по типу, комментарию или статусу"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </FormField>
          </div>
        </div>
        <div className="flex items-stretch gap-3">
          <button
            type="button"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => console.info('Импорт графика доступен в следующей итерации')}
          >
            📥 Импорт графика
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:text-slate-400"
            onClick={handleExport}
            disabled={isExporting || !sortedRequests.length}
          >
            📤 Экспорт
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:text-slate-400"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            ⟲ Очистить
          </button>
        </div>
      </section>

      <FilterGroup
        options={filterOptions}
        activeId={filter}
        onChange={(id) => setFilter(id as RequestFilter)}
        aria-label="Фильтр по статусу"
      />

      <ReportTable
        columns={tableColumns}
        rows={requestRows}
        ariaTitle="Заявки на отпуск"
        ariaDescription="Список заявок с периодом, статусом и хронологией изменений"
        emptyLabel={filteredRequests.length ? 'Нет записей для выбранных фильтров' : 'Заявки не найдены'}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        title="Новая заявка на отпуск"
        description="Заполните обязательные поля, чтобы отправить заявку на согласование"
        testId="vacation-request-dialog"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField fieldId="request-type" label="Тип отпуска" required error={formErrors.type}>
            <select
              id="request-type"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={formState.type}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, type: event.target.value as VacationRequest['type'] }))
              }
              required
            >
              <option value="vacation">Отпуск</option>
              <option value="sick_leave">Больничный</option>
              <option value="personal">Личные дела</option>
              <option value="unpaid">Неоплачиваемый</option>
              <option value="maternity">Декретный</option>
              <option value="bereavement">По семейным обстоятельствам</option>
            </select>
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField fieldId="request-start" label="Дата начала" required error={formErrors.startDate}>
              <input
                id="request-start"
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.startDate}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, startDate: event.target.value }))
                }
                required
              />
            </FormField>
            <FormField fieldId="request-end" label="Дата окончания" required error={formErrors.endDate}>
              <input
                id="request-end"
                type="date"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formState.endDate}
                min={formState.startDate || undefined}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, endDate: event.target.value }))
                }
                required
              />
            </FormField>
          </div>
          {formState.startDate && formState.endDate ? (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              📅 Продолжительность: {calculateDays(formState.startDate, formState.endDate)}{' '}
              {pluralizeDays(calculateDays(formState.startDate, formState.endDate))}
            </div>
          ) : null}
          <FormField fieldId="request-reason" label="Комментарий сотрудника">
            <textarea
              id="request-reason"
              className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              value={formState.reason}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, reason: event.target.value }))
              }
              placeholder="Укажите причину или дополнительную информацию"
            />
          </FormField>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formState.isEmergency}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, isEmergency: event.target.checked }))
              }
            />
            <span>Экстренная заявка (требует немедленного рассмотрения)</span>
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Отправка…' : 'Подать заявку'}
            </button>
          </div>
        </form>
      </Dialog>

      {toast ? (
        <div className="fixed bottom-6 right-6 rounded-lg border border-blue-100 bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
};

export default VacationRequests;
EOF
```

#### 2. Update vacation request tests
```bash
cat <<'EOF' > src/__tests__/VacationRequests.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const mocks = vi.hoisted(() => ({
  getVacationRequests: vi.fn(),
  submitVacationRequest: vi.fn(),
}));

vi.mock('../data/mockData', () => mocks);

import VacationRequests from '../pages/VacationRequests';

const baseHistory = [
  {
    status: 'pending' as const,
    timestamp: '2024-03-10T08:00:00+03:00',
    actor: 'Иванова Анна Петровна',
  },
];

const mockRequests = [
  {
    id: 'req-1',
    employeeId: 'EMP001',
    employeeName: 'Иванова Анна Петровна',
    type: 'vacation' as const,
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    totalDays: 5,
    reason: 'Отдых',
    isEmergency: false,
    status: 'approved' as const,
    submittedAt: '2024-03-10T08:00:00+03:00',
    reviewedAt: '2024-03-12T09:00:00+03:00',
    reviewedBy: 'Петров И.С.',
    reviewNotes: 'Одобрено',
    managerComment: 'Приятного отдыха',
    lastUpdatedAt: '2024-03-12T09:00:00+03:00',
    history: baseHistory,
  },
];

const mockNewRequest = {
  id: 'req-2',
  employeeId: 'EMP001',
  employeeName: 'Иванова Анна Петровна',
  type: 'vacation' as const,
  startDate: '2024-10-01',
  endDate: '2024-10-03',
  totalDays: 3,
  reason: '',
  isEmergency: false,
  status: 'pending' as const,
  submittedAt: '2024-09-01T10:00:00+03:00',
  lastUpdatedAt: '2024-09-01T10:00:00+03:00',
  history: [
    {
      status: 'pending' as const,
      timestamp: '2024-09-01T10:00:00+03:00',
      actor: 'Иванова Анна Петровна',
    },
  ],
  managerComment: undefined,
  reviewedAt: undefined,
  reviewedBy: undefined,
  reviewNotes: undefined,
};

const fallbackNewRequest = {
  id: 'fallback-1',
  employeeId: 'EMP001',
  employeeName: 'Иванова Анна Петровна',
  type: 'personal' as const,
  startDate: '2025-02-10',
  endDate: '2025-02-12',
  totalDays: 3,
  reason: 'Автотест',
  isEmergency: false,
  status: 'pending' as const,
  submittedAt: '2025-02-13T07:46:00+03:00',
  lastUpdatedAt: '2025-02-13T07:46:00+03:00',
  history: baseHistory,
  managerComment: undefined,
  reviewedAt: undefined,
  reviewedBy: undefined,
  reviewNotes: undefined,
};

describe('VacationRequests', () => {
  beforeEach(() => {
    mocks.getVacationRequests.mockResolvedValue(mockRequests.map((request) => ({ ...request })));
    mocks.submitVacationRequest.mockResolvedValue(mockNewRequest);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits a new request and updates counters', async () => {
    render(<VacationRequests />);

    await screen.findByText(/Все \(1\)/i);

    await userEvent.click(screen.getByRole('button', { name: /Новая заявка/i }));
    await userEvent.click(screen.getByRole('button', { name: /Подать заявку/i }));

    expect(await screen.findByText(/Укажите дату начала/)).toBeInTheDocument();
    expect(screen.getByText(/Укажите дату окончания/)).toBeInTheDocument();

    const startInput = screen.getByLabelText(/Дата начала/i) as HTMLInputElement;
    const endInput = screen.getByLabelText(/Дата окончания/i) as HTMLInputElement;

    await userEvent.clear(startInput);
    await userEvent.type(startInput, '2024-10-01');
    await userEvent.clear(endInput);
    await userEvent.type(endInput, '2024-10-03');

    await userEvent.click(screen.getByRole('button', { name: /Подать заявку/i }));

    await waitFor(() => expect(mocks.submitVacationRequest).toHaveBeenCalled());
    expect(mocks.submitVacationRequest).toHaveBeenCalledWith({
      isEmergency: false,
      reason: '',
      startDate: '2024-10-01',
      endDate: '2024-10-03',
      totalDays: 3,
      type: 'vacation',
    });

    expect(await screen.findByText(/Все \(2\)/)).toBeInTheDocument();
  });

  it('prevents duplicate rows when fallback mutates the source array', async () => {
    const fallbackRequests = mockRequests.map((request) => ({ ...request }));
    mocks.getVacationRequests.mockResolvedValue(fallbackRequests);
    mocks.submitVacationRequest.mockImplementation(async () => {
      fallbackRequests.unshift({ ...fallbackNewRequest });
      return fallbackNewRequest;
    });

    render(<VacationRequests />);

    await screen.findByRole('button', { name: /Новая заявка/i });
    await userEvent.click(screen.getByRole('button', { name: /Новая заявка/i }));

    const startInput = screen.getByLabelText(/Дата начала/i) as HTMLInputElement;
    const endInput = screen.getByLabelText(/Дата окончания/i) as HTMLInputElement;
    const reasonInput = screen.getByLabelText(/Комментарий сотрудника/i) as HTMLTextAreaElement;

    await userEvent.clear(startInput);
    await userEvent.type(startInput, '2025-02-10');
    await userEvent.clear(endInput);
    await userEvent.type(endInput, '2025-02-12');
    await userEvent.clear(reasonInput);
    await userEvent.type(reasonInput, fallbackNewRequest.reason);

    await userEvent.click(screen.getByRole('button', { name: /Подать заявку/i }));

    await waitFor(() => expect(mocks.submitVacationRequest).toHaveBeenCalled());

    const periodCells = await screen.findAllByText('10.02.2025 – 12.02.2025');
    expect(periodCells).toHaveLength(1);
  });
});
EOF
```

## Phase 6: Profile Parity
### Overview
Refine the profile with Appendix 1 fields: RU copy, nested contact/logins/address/emergency data, edit validation, overtime toggle, and toast feedback. Display structure chips and manual-aligned actions (password/avatar).

### Changes Required:
#### 1. Replace profile page
```bash
cat <<'EOF' > src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { getEmployee } from '../data/mockData';
import { Employee } from '../types';
import { FormField } from '../wrappers';
import { formatDate } from '../utils/format';

const calculateWorkYears = (hireDate: string) => {
  const hire = new Date(hireDate);
  const now = new Date();
  let years = now.getFullYear() - hire.getFullYear();
  const monthDifference = now.getMonth() - hire.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < hire.getDate())) {
    years -= 1;
  }
  return years;
};

const contractTypeLabel = (type: Employee['contractType']) => {
  switch (type) {
    case 'full-time':
      return 'Полная занятость';
    case 'part-time':
      return 'Частичная занятость';
    case 'contractor':
      return 'Контрактор';
    case 'intern':
      return 'Стажёр';
    default:
      return type;
  }
};

interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  corporateEmail?: string;
  workPhone?: string;
  registrationAddress?: string;
  portalLogin?: string;
  emergencyName?: string;
  emergencyPhone?: string;
}

const emailRegex = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/u;

const validateProfile = (data: Employee): ProfileErrors => {
  const errors: ProfileErrors = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'Укажите имя';
  }
  if (!data.lastName?.trim()) {
    errors.lastName = 'Укажите фамилию';
  }
  if (!data.middleName?.trim()) {
    errors.middleName = 'Укажите отчество';
  }
  if (!data.birthDate?.trim()) {
    errors.birthDate = 'Укажите дату рождения';
  }
  if (!data.contacts.corporateEmail?.trim()) {
    errors.corporateEmail = 'Введите корпоративный email';
  } else if (!emailRegex.test(data.contacts.corporateEmail)) {
    errors.corporateEmail = 'Неверный формат email';
  }
  if (!data.contacts.workPhone?.trim()) {
    errors.workPhone = 'Укажите рабочий телефон';
  }
  if (!data.address.registration?.trim()) {
    errors.registrationAddress = 'Заполните адрес регистрации';
  }
  if (!data.logins.portal?.trim()) {
    errors.portalLogin = 'Укажите логин портала';
  }
  if (!data.emergencyContact.name?.trim()) {
    errors.emergencyName = 'Укажите контактное лицо';
  }
  if (!data.emergencyContact.phone?.trim()) {
    errors.emergencyPhone = 'Укажите телефон экстренного контакта';
  }

  return errors;
};

const tabs = [
  { id: 'personal', label: 'Личная информация', icon: '👤' },
  { id: 'contact', label: 'Контакты', icon: '📞' },
  { id: 'work', label: 'Рабочие настройки', icon: '💼' },
] as const;

type ActiveTab = (typeof tabs)[number]['id'];

const Profile: React.FC = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const [formErrors, setFormErrors] = useState<ProfileErrors>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const data = await getEmployee();
        setEmployee(data);
        setFormData(data);
      } catch (error) {
        console.error('Error loading employee data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleSave = () => {
    if (!formData) {
      return;
    }

    const errors = validateProfile(formData);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setEmployee(formData);
    setIsEditing(false);
    setFormErrors({});
    setFeedback('Профиль сохранён');
  };

  const handleCancel = () => {
    if (employee) {
      setFormData(employee);
    }
    setIsEditing(false);
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="mb-3 text-5xl">⏳</div>
          <p className="text-lg font-medium">Загружаем профиль…</p>
        </div>
      </div>
    );
  }

  if (!employee || !formData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="mb-3 text-5xl">❌</div>
          <p className="text-lg font-medium">Не удалось загрузить данные профиля</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-7xl" aria-hidden>
              {employee.photo || '👤'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{employee.fullName}</h1>
              <p className="text-lg text-slate-600">{employee.position}</p>
              <p className="text-sm text-slate-500">
                {employee.department} • {employee.employeeId}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                  employee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {employee.status === 'active' ? '✅ Активен' : '⛔ Неактивен'}
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {calculateWorkYears(employee.hireDate)} лет стажа
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                  {contractTypeLabel(employee.contractType)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => console.info('Загрузка аватара не реализована в демо')}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              📷 Обновить аватар
            </button>
            <button
              type="button"
              onClick={() => console.info('Смена пароля доступна в продуктивной системе')}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              🔐 Сменить пароль
            </button>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ✏️ Редактировать
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <nav className="flex gap-4 border-b border-slate-200 pb-2" aria-label="Разделы профиля">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-1 pb-1 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-1">
          {activeTab === 'personal' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField fieldId="profile-last-name" label="Фамилия" required error={formErrors.lastName}>
                  {isEditing ? (
                    <input
                      id="profile-last-name"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.lastName}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev ? { ...prev, lastName: value } : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, lastName: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.lastName}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-first-name" label="Имя" required error={formErrors.firstName}>
                  {isEditing ? (
                    <input
                      id="profile-first-name"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.firstName}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev ? { ...prev, firstName: value } : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, firstName: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.firstName}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-middle-name" label="Отчество" required error={formErrors.middleName}>
                  {isEditing ? (
                    <input
                      id="profile-middle-name"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.middleName}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev ? { ...prev, middleName: value } : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, middleName: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.middleName}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-birth-date" label="Дата рождения" required error={formErrors.birthDate}>
                  {isEditing ? (
                    <input
                      id="profile-birth-date"
                      type="date"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.birthDate}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev ? { ...prev, birthDate: value } : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, birthDate: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{formatDate(employee.birthDate)}</p>
                  )}
                </FormField>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField fieldId="profile-registration" label="Адрес регистрации" required error={formErrors.registrationAddress}>
                  {isEditing ? (
                    <textarea
                      id="profile-registration"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      rows={2}
                      value={formData.address.registration}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? { ...prev, address: { ...prev.address, registration: value } }
                            : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, registrationAddress: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.address.registration}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-residence" label="Адрес проживания">
                  {isEditing ? (
                    <textarea
                      id="profile-residence"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      rows={2}
                      value={formData.address.residence}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? { ...prev, address: { ...prev.address, residence: value } }
                            : prev,
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.address.residence}</p>
                  )}
                </FormField>
              </div>
            </div>
          ) : null}

          {activeTab === 'contact' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField fieldId="profile-corporate-email" label="Корпоративный email" required error={formErrors.corporateEmail}>
                  {isEditing ? (
                    <input
                      id="profile-corporate-email"
                      type="email"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.contacts.corporateEmail}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                contacts: { ...prev.contacts, corporateEmail: value },
                              }
                            : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, corporateEmail: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.contacts.corporateEmail}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-personal-email" label="Личный email">
                  {isEditing ? (
                    <input
                      id="profile-personal-email"
                      type="email"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.contacts.personalEmail ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                contacts: { ...prev.contacts, personalEmail: value },
                              }
                            : prev,
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">
                      {employee.contacts.personalEmail ?? '—'}
                    </p>
                  )}
                </FormField>
                <FormField fieldId="profile-work-phone" label="Рабочий телефон" required error={formErrors.workPhone}>
                  {isEditing ? (
                    <input
                      id="profile-work-phone"
                      type="tel"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.contacts.workPhone}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                contacts: { ...prev.contacts, workPhone: value },
                              }
                            : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, workPhone: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.contacts.workPhone}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-personal-phone" label="Личный телефон">
                  {isEditing ? (
                    <input
                      id="profile-personal-phone"
                      type="tel"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.contacts.personalPhone ?? ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                contacts: { ...prev.contacts, personalPhone: value },
                              }
                            : prev,
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">
                      {employee.contacts.personalPhone ?? '—'}
                    </p>
                  )}
                </FormField>
              </div>
              <FormField fieldId="profile-messenger" label="Мессенджер / ник">
                {isEditing ? (
                  <input
                    id="profile-messenger"
                    type="text"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={formData.contacts.messenger ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setFormData((prev) =>
                        prev ? { ...prev, contacts: { ...prev.contacts, messenger: value } } : prev,
                      );
                    }}
                  />
                ) : (
                  <p className="text-sm text-slate-700">
                    {employee.contacts.messenger ?? '—'}
                  </p>
                )}
              </FormField>
            </div>
          ) : null}

          {activeTab === 'work' ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField fieldId="profile-portal-login" label="Портал (логин)" required error={formErrors.portalLogin}>
                  {isEditing ? (
                    <input
                      id="profile-portal-login"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.logins.portal}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev ? { ...prev, logins: { ...prev.logins, portal: value } } : prev,
                        );
                        setFormErrors((prev) => ({ ...prev, portalLogin: undefined }));
                      }}
                      required
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.logins.portal}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-telephony" label="Телефония / SIP">
                  {isEditing ? (
                    <input
                      id="profile-telephony"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.logins.telephonyId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev ? { ...prev, logins: { ...prev.logins, telephonyId: value } } : prev,
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.logins.telephonyId}</p>
                  )}
                </FormField>
              </div>
              <FormField fieldId="profile-external-systems" label="Внешние системы (через запятую)" hint="ID интеграций, настроенных для сотрудника">
                {isEditing ? (
                  <textarea
                    id="profile-external-systems"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    rows={2}
                    value={formData.logins.externalSystems.join(', ')}
                    onChange={(event) => {
                      const value = event.target.value
                        .split(/[,\n]/)
                        .map((part) => part.trim())
                        .filter(Boolean);
                      setFormData((prev) =>
                        prev ? { ...prev, logins: { ...prev.logins, externalSystems: value } } : prev,
                      );
                    }}
                  />
                ) : (
                  <p className="text-sm text-slate-700">
                    {employee.logins.externalSystems.length
                      ? employee.logins.externalSystems.join(', ')
                      : '—'}
                  </p>
                )}
              </FormField>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField fieldId="profile-work-scheme" label="Схема работы">
                  {isEditing ? (
                    <input
                      id="profile-work-scheme"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.workSettings.workScheme}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                workSettings: { ...prev.workSettings, workScheme: value },
                              }
                            : prev,
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.workSettings.workScheme}</p>
                  )}
                </FormField>
                <FormField fieldId="profile-calendar" label="Производственный календарь">
                  {isEditing ? (
                    <input
                      id="profile-calendar"
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={formData.workSettings.calendar}
                      onChange={(event) => {
                        const value = event.target.value;
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                workSettings: { ...prev.workSettings, calendar: value },
                              }
                            : prev,
                        );
                      }}
                    />
                  ) : (
                    <p className="text-sm text-slate-700">{employee.workSettings.calendar}</p>
                  )}
                </FormField>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="profile-overtime"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.workSettings.allowOvertime}
                  disabled={!isEditing}
                  onChange={(event) => {
                    const value = event.target.checked;
                    setFormData((prev) =>
                      prev
                        ? {
                            ...prev,
                            workSettings: { ...prev.workSettings, allowOvertime: value },
                          }
                        : prev,
                    );
                  }}
                />
                <label htmlFor="profile-overtime" className="text-sm text-slate-700">
                  Допускать переработки
                </label>
              </div>
              <FormField fieldId="profile-structure" label="Маршрут в оргструктуре" hint="Структура компании по данным Naumen">
                <div className="flex flex-wrap gap-2">
                  {employee.structurePath.map((node) => (
                    <span
                      key={node}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {node}
                    </span>
                  ))}
                </div>
              </FormField>
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Экстренный контакт</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField fieldId="profile-emergency-name" label="Контактное лицо" required error={formErrors.emergencyName}>
            {isEditing ? (
              <input
                id="profile-emergency-name"
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.emergencyContact.name}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact, name: value },
                        }
                      : prev,
                  );
                  setFormErrors((prev) => ({ ...prev, emergencyName: undefined }));
                }}
                required
              />
            ) : (
              <p className="text-sm text-slate-700">{employee.emergencyContact.name}</p>
            )}
          </FormField>
          <FormField fieldId="profile-emergency-relation" label="Связь">
            {isEditing ? (
              <input
                id="profile-emergency-relation"
                type="text"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.emergencyContact.relation}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact, relation: value },
                        }
                      : prev,
                  );
                }}
              />
            ) : (
              <p className="text-sm text-slate-700">{employee.emergencyContact.relation}</p>
            )}
          </FormField>
          <FormField fieldId="profile-emergency-phone" label="Телефон" required error={formErrors.emergencyPhone}>
            {isEditing ? (
              <input
                id="profile-emergency-phone"
                type="tel"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.emergencyContact.phone}
                onChange={(event) => {
                  const value = event.target.value;
                  setFormData((prev) =>
                    prev
                      ? {
                          ...prev,
                          emergencyContact: { ...prev.emergencyContact, phone: value },
                        }
                      : prev,
                  );
                  setFormErrors((prev) => ({ ...prev, emergencyPhone: undefined }));
                }}
                required
              />
            ) : (
              <p className="text-sm text-slate-700">{employee.emergencyContact.phone}</p>
            )}
          </FormField>
        </div>
      </section>

      {feedback ? (
        <div className="fixed bottom-6 right-6 rounded-lg border border-blue-100 bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {feedback}
        </div>
      ) : null}
    </div>
  );
};

export default Profile;
EOF
```

#### 2. Update profile tests
```bash
cat <<'EOF' > src/__tests__/Profile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const mocks = vi.hoisted(() => ({
  getEmployee: vi.fn(),
}));

vi.mock('../data/mockData', () => mocks);

import Profile from '../pages/Profile';

const mockEmployee = {
  id: 'emp-001',
  employeeId: 'EMP001',
  firstName: 'Анна',
  lastName: 'Иванова',
  middleName: 'Петровна',
  fullName: 'Иванова Анна Петровна',
  photo: '👩‍💼',
  birthDate: '1990-05-20',
  hireDate: '2020-03-15',
  department: 'Контакт-центр',
  position: 'Старший специалист',
  orgUnit: 'Контакт-центр • Операционный центр',
  office: 'Москва',
  timeZone: 'Europe/Moscow',
  managerName: 'Петров И.С.',
  structurePath: ['Контакт-центр', 'Операционный центр', 'Первая линия'],
  contractType: 'full-time' as const,
  status: 'active' as const,
  contacts: {
    corporateEmail: 'a.ivanova@company.ru',
    personalEmail: 'anna.private@example.com',
    workPhone: '+7 (495) 100-20-20',
    personalPhone: '+7 (999) 123-45-67',
    messenger: '@anna_support',
  },
  address: {
    registration: 'Москва, ул. Арбат, д. 12',
    residence: 'Москва, ул. Бауманская, д. 5',
  },
  logins: {
    portal: 'anna.ivanova',
    telephonyId: 'SIP-201',
    externalSystems: ['jira-ops-001'],
  },
  workSettings: {
    workScheme: '5/2 (09:00–18:00)',
    calendar: 'Производственный календарь РФ 2024',
    allowOvertime: false,
  },
  emergencyContact: {
    name: 'Иванов Петр',
    phone: '+7 (999) 765-43-21',
    relation: 'Супруг',
  },
};

describe('Profile', () => {
  beforeEach(() => {
    mocks.getEmployee.mockResolvedValue({ ...mockEmployee });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('validates required personal fields before saving', async () => {
    render(<Profile />);

    await screen.findByRole('button', { name: /Редактировать/i });
    await userEvent.click(screen.getByRole('button', { name: /Редактировать/i }));

    const middleNameInput = await screen.findByLabelText(/Отчество/i);
    await userEvent.clear(middleNameInput);
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/i }));

    expect(await screen.findByText('Укажите отчество')).toBeInTheDocument();

    await userEvent.type(middleNameInput, 'Петровна');
    await userEvent.click(screen.getByRole('button', { name: /Сохранить/i }));

    await waitFor(() => expect(screen.queryByText('Укажите отчество')).not.toBeInTheDocument());
  });
});
EOF
```

## Phase 7: Validation & Tooling
- `npm run build`
- `npm run test -- --run`
- Manual smoke after `npm run dev -- --port $(grep employees docs/System/ports-registry.md | awk '{print $2}')` (verify shell nav, Work Structure drawer, requests filters, profile save toast).

## Phase 8: Documentation & Reporting
- Update docs/Workspace/Coordinator/employee-portal/CodeMap.md with new file:line references (layout, data mocks, dashboard/requests/profile) and cite manual sections.
- Refresh uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md with new toolbar, filters, Work Structure, profile fields.
- Sync Appendix and parity matrices: docs/System/APPENDIX1_SCOPE_CROSSWALK.md, docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/DEMO_PARITY_INDEX.md, docs/System/PARITY_MVP_CHECKLISTS.md, docs/Reports/PARITY_MVP_CHECKLISTS.md.
- Log UAT results and screenshots in docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md and docs/SCREENSHOT_INDEX.md.
- Add session summary (tests, local preview host/port) to docs/SESSION_HANDOFF.md and mark status in PROGRESS.md & docs/Tasks/post-phase9-demo-execution.md.

## Rollback
- `git checkout -- src/components/WorkStructureDrawer.tsx src/components/Layout.tsx src/App.tsx src/types/index.ts src/utils/format.ts src/data/mockData.ts src/pages/Dashboard.tsx src/pages/VacationRequests.tsx src/pages/Profile.tsx src/__tests__/VacationRequests.test.tsx src/__tests__/Profile.test.tsx`
- `git clean -fd` if new files persist and plan is aborted.

## Handoff
- Confirm clean `git status`.
- Record build/test commands and preview port in docs/SESSION_HANDOFF.md.
- Update PROGRESS.md active plan status and list remaining follow-ups (if any).
- Provide deploy instructions/URL for UAT agent once redeployed.
