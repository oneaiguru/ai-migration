# Plan — Employee Portal Work Structure Header Parity

## Metadata
- Task: Restore Work Structure header behaviour and shell parity for the Employee Portal demo.
- Repo: ${EMPLOYEE_PORTAL_REPO}
- Discovery: docs/Tasks/employee-portal_work-structure-scout-2025-10-28-codex.task.md
- Vision: docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md
- Manuals: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`, `CH3_Employees.md`, `CH5_Schedule_Advanced.md`, `CH7_Appendices.md`
- Supporting docs: docs/Tasks/employee-portal_manual-parity-review.task.md, uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md, ~/Desktop/g.tex (UAT parity report)

## Desired End State
The Employee Portal shell mirrors Naumen’s header: RU module tabs, notification/help icons, and a dedicated “Рабочая структура” trigger that opens a sheet displaying the employee’s organisational path, contacts, work settings, and emergency information. The drawer supports keyboard focus, RU copy, and closes when expected. Layout cells no longer expose the dark-mode toggle and route avatars to the profile menu. Types and mock data supply the structure path/tree so Drawer renders deterministic content. Vitest coverage proves the drawer opens and lists structure items, and documentation/UAT packs are updated with the new evidence and screenshot aliases.

### Key Discoveries
- Missing header controls and drawer captured in scout notes (`docs/Tasks/employee-portal_work-structure-scout-2025-10-28-codex.task.md:10-29`).
- UAT parity report highlights absent Work Structure trigger and icons (`~/Desktop/g.tex:10-14`).
- Vision requires RU module bar and Work Structure parity (`docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md:6-14`).
- Manual crosswalk ties shell behaviour to CH2 §§2.1–2.2 (`uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md:5-9`).
- Manual CH2 describes Work Structure interaction (`${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md:20-42`).
- Appendix 1 informs contact/emergency data to surface (`${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH7_Appendices.md:14-48`).

## What We're NOT Doing
- Rebuilding the unified shell host or touching other demos.
- Implementing live Work Structure filtering; drawer stays mock-backed but content matches manual copy.
- Adding notification logic beyond static badge counts.
- Modifying dashboard, requests, or profile flows outside header scope.

## Implementation Approach
Extend portal data/types with organisational metadata, author a reusable Work Structure drawer component using the Dialog wrapper, then replace the Layout header with a manual-aligned variant that exposes module navigation, drawer trigger, notification/help icons, and avatar menu. Add Vitest coverage proving the drawer renders correctly, and update parity documentation/UAT assets with the new screenshot alias and checks.

## Phase 1: Domain & Mock Data Preparation
### Overview
Provide Work Structure metadata, contacts, and helpers consumed by the header and drawer.

### Changes Required:
1. **Extend employee types with Work Structure metadata**
   - **File:** src/types/index.ts
   - **Changes:** Add structure path/tree, contacts, work settings, and emergency contact fields plus helper interface for tree nodes.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/types/index.ts
@@
 export interface Employee {
   id: string;
   employeeId: string;
   status: EmployeeStatus;
   personalInfo: EmployeePersonalInfo;
   credentials: EmployeeCredentials;
   workInfo: EmployeeWorkInfo;
   orgPlacement: EmployeeOrgPlacement;
   skills: SkillAssignment[];
   reserveSkills: SkillAssignment[];
   tags: string[];
   preferences: EmployeePreferences;
   performance: EmployeePerformance;
   certifications: Certification[];
   metadata: EmployeeMetadata;
   personnelNumber?: string;
   actualAddress?: string;
   tasks?: EmployeeTask[];
+  /** Ordered Naumen hierarchy from company → подразделение → группа (CH2 §2.2). */
+  structurePath?: string[];
+  /** Optional tree of sibling nodes for drawer display/search. */
+  structureTree?: WorkStructureNode[];
+  /** Manager full name displayed under contacts. */
+  managerName?: string;
+  /** Work contacts surfaced in the drawer. */
+  contacts?: {
+    corporateEmail: string;
+    workPhone: string;
+    location?: string;
+  };
+  /** Work settings chip (office, timezone, scheme). */
+  workSettings?: {
+    office: string;
+    timeZone: string;
+    workScheme: string;
+  };
+  /** Emergency contact (Appendix 1). */
+  emergencyContact?: {
+    name: string;
+    relation: string;
+    phone: string;
+  };
 }
+
+export interface WorkStructureNode {
+  id: string;
+  label: string;
+  children?: WorkStructureNode[];
+}
*** End Patch
PATCH
```

2. **Populate mock employee with hierarchy/contact data**
   - **File:** src/data/mockData.ts
   - **Changes:** Inject structure path/tree, manager/contact/work settings data, and emergency contact for the signed-in employee.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
   metadata: {
     createdAt: new Date('2021-01-04T09:34:00Z'),
     updatedAt: new Date('2025-10-18T11:12:00Z'),
     createdBy: 'system',
     lastModifiedBy: 'system',
     lastLogin: new Date('2025-10-28T06:42:00Z'),
   },
+  structurePath: ['Naumen WFM', 'Контактный центр', 'Отдел поддержки клиентов', 'Группа 2_1'],
+  structureTree: [
+    {
+      id: 'contact-center',
+      label: 'Контактный центр',
+      children: [
+        {
+          id: 'support',
+          label: 'Отдел поддержки клиентов',
+          children: [
+            { id: 'group-21', label: 'Группа 2_1' },
+            { id: 'group-22', label: 'Группа 2_2' },
+            { id: 'group-23', label: 'Группа 2_3' },
+          ],
+        },
+        {
+          id: 'quality',
+          label: 'Отдел качества',
+          children: [
+            { id: 'group-qa-1', label: 'Группа QA 1' },
+            { id: 'group-qa-2', label: 'Группа QA 2' },
+          ],
+        },
+      ],
+    },
+  ],
+  managerName: 'Наталья Кузьмина',
+  contacts: {
+    corporateEmail: 'operator9@naumen.ru',
+    workPhone: '+7 (495) 123-45-67',
+    location: 'Москва, ул. Лесная, 5',
+  },
+  workSettings: {
+    office: 'Москва',
+    timeZone: 'Europe/Moscow',
+    workScheme: '5/2 (09:00–18:00)',
+  },
+  emergencyContact: {
+    name: 'Анна Иванова',
+    relation: 'Сестра',
+    phone: '+7 (921) 000-11-22',
+  },
 };
*** End Patch
PATCH
```

3. **Expose RU-centric format helpers**
   - **File:** src/utils/format.ts (create if missing)
   - **Changes:** Provide date range + phone helpers reused by drawer sections.
```bash
cat <<'EOF' > src/utils/format.ts
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (value: Date | string): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return format(date, 'dd.MM.yyyy', { locale: ru });
};

export const formatDateRange = (start: Date | string, end: Date | string): string => {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return '';
  }
  return `${format(startDate, 'dd.MM.yyyy', { locale: ru })} — ${format(endDate, 'dd.MM.yyyy', { locale: ru })}`;
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  }
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
  }
  return value;
};
EOF
```

## Phase 2: Work Structure Drawer Component
### Overview
Create the reusable sheet component with hierarchy, contacts, work settings, and emergency block aligned to CH2/Appendix 1 terminology.

### Changes Required:
1. **Author WorkStructureDrawer component**
   - **File:** src/components/WorkStructureDrawer.tsx
   - **Changes:** Compose sheet Dialog with RU copy, hierarchy list, contacts, and emergency section.
```bash
cat <<'EOF' > src/components/WorkStructureDrawer.tsx
import type { ReactNode } from 'react';
import { Dialog } from '../wrappers';
import type { Employee } from '../types';
import { formatPhone } from '../utils/format';

interface WorkStructureDrawerProps {
  trigger: ReactNode;
  employee: Employee;
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</h3>
);

const WorkStructureDrawer = ({ trigger, employee }: WorkStructureDrawerProps) => {
  const path = employee.structurePath ?? [];
  const tree = employee.structureTree ?? [];
  const contacts = employee.contacts;
  const workSettings = employee.workSettings;
  const emergency = employee.emergencyContact;

  return (
    <Dialog
      variant="sheet"
      size="lg"
      trigger={trigger}
      title="Рабочая структура"
      description="Организационная и контактная информация сотрудника"
      testId="work-structure"
      overlayClassName="bg-slate-900/40"
    >
      <div className="flex flex-col gap-8">
        <section className="space-y-3">
          <SectionTitle>Организационная структура</SectionTitle>
          <ol className="space-y-2 text-sm text-slate-800">
            {path.map((label, index) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {index + 1}
                </span>
                <span>{label}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SectionTitle>Контакты</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Руководитель</dt>
                <dd className="text-right font-medium text-slate-900">{employee.managerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Рабочий телефон</dt>
                <dd className="text-right font-medium text-slate-900">{contacts ? formatPhone(contacts.workPhone) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Корпоративная почта</dt>
                <dd className="text-right font-medium text-slate-900">{contacts?.corporateEmail}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <SectionTitle>Рабочие параметры</SectionTitle>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Офис</dt>
                <dd className="text-right font-medium text-slate-900">{workSettings?.office}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Часовой пояс</dt>
                <dd className="text-right font-medium text-slate-900">{workSettings?.timeZone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Схема работы</dt>
                <dd className="text-right font-medium text-slate-900">{workSettings?.workScheme}</dd>
              </div>
            </dl>
          </div>
        </section>

        {tree.length > 0 ? (
          <section className="rounded-lg border border-slate-200 p-4">
            <SectionTitle>Дерево подразделений</SectionTitle>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {tree.map((node) => (
                <li key={node.id}>
                  <p className="font-medium text-slate-900">{node.label}</p>
                  {node.children ? (
                    <ul className="mt-2 space-y-1 border-l border-dashed border-slate-300 pl-4">
                      {node.children.map((child) => (
                        <li key={child.id}>{child.label}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {emergency ? (
          <section className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <SectionTitle>Экстренный контакт</SectionTitle>
            <p className="mt-2 text-sm text-slate-800">
              {emergency.name} • {emergency.relation} • {formatPhone(emergency.phone)}
            </p>
          </section>
        ) : null}
      </div>
    </Dialog>
  );
};

export default WorkStructureDrawer;
EOF
```

## Phase 3: Layout Header Integration
### Overview
Replace the existing dark-mode header with the manual-aligned shell (module tabs, Work Structure trigger, notification/help icons, avatar menu) and mount Layout via nested routes.

### Changes Required:
1. **Rewrite Layout component**
   - **File:** src/components/Layout.tsx
   - **Changes:** Provide RU shell, module tabs, Work Structure trigger wired to drawer, notifications/help, avatar menu, and page tabs.
```bash
cat <<'EOF' > src/components/Layout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import WorkStructureDrawer from './WorkStructureDrawer';
import { mockEmployee } from '../data/mockData';

const MODULE_TABS = [
  { id: 'forecasts', label: 'Прогнозы' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'employees', label: 'Сотрудники' },
  { id: 'reports', label: 'Отчеты' },
];

const PAGE_TABS = [
  { to: '/', label: 'Главная', end: true },
  { to: '/vacation-requests', label: 'Мои заявки' },
  { to: '/profile', label: 'Профиль' },
];

const Layout = () => {
  const employee = mockEmployee;
  const initials = `${employee.personalInfo.firstName?.[0] ?? ''}${employee.personalInfo.lastName?.[0] ?? ''}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-wide text-blue-600">Naumen WFM</span>
              <h1 className="text-xl font-semibold">Личный кабинет сотрудника</h1>
            </div>
            <div className="flex items-center gap-4">
              <WorkStructureDrawer
                employee={employee}
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    Рабочая структура
                  </button>
                }
              />
              <button
                type="button"
                aria-label="Уведомления"
                className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span aria-hidden>🔔</span>
                <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  3
                </span>
              </button>
              <a
                href="https://docs.naumen.ru"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ? Справка
              </a>
              <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-500 text-white">
                  <span className="flex h-full w-full items-center justify-center text-sm font-semibold">{initials}</span>
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-slate-900">
                    {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                  </span>
                  <NavLink to="/profile" className="text-xs text-blue-600 hover:underline">
                    Профиль
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Модули системы">
            {MODULE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="rounded-full border border-slate-200 px-4 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                disabled
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <nav className="flex gap-2" aria-label="Навигация по порталу">
            {PAGE_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-white text-slate-600 shadow-sm hover:text-blue-600'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Naumen WFM • Все права защищены</span>
          <span>Поддержка: support@naumen.ru • +7 (495) 123-45-67</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
EOF
```

2. **Mount Layout using nested routes**
   - **File:** src/App.tsx
   - **Changes:** Remove dark-mode state and wrap routes with Layout route element.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-import { useState } from 'react';
-import Layout from './components/Layout';
-import Dashboard from './pages/Dashboard';
-import VacationRequests from './pages/VacationRequests';
-import Profile from './pages/Profile';
-
-const App = () => {
-  const [isDarkMode, setIsDarkMode] = useState(false);
-
-  return (
-    <Layout isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode((prev) => !prev)}>
-      <Routes>
-        <Route path="/" element={<Dashboard />} />
-        <Route path="/vacation-requests" element={<VacationRequests />} />
-        <Route path="/profile" element={<Profile />} />
-      </Routes>
-    </Layout>
-  );
-};
+import Layout from './components/Layout';
+import Dashboard from './pages/Dashboard';
+import VacationRequests from './pages/VacationRequests';
+import Profile from './pages/Profile';
+
+const App = () => {
+  return (
+    <Routes>
+      <Route element={<Layout />}>
+        <Route path="/" element={<Dashboard />} />
+        <Route path="/vacation-requests" element={<VacationRequests />} />
+        <Route path="/profile" element={<Profile />} />
+      </Route>
+    </Routes>
+  );
+};
*** End Patch
PATCH
```

## Phase 4: Tests & Documentation
### Overview
Add Vitest coverage for the drawer and update UAT documentation with the new screenshot alias and verification instructions.

### Changes Required:
1. **Add Layout drawer test**
   - **File:** src/__tests__/Layout.work-structure.test.tsx (new)
   - **Changes:** Render Layout via MemoryRouter, click trigger, assert drawer sections.
```bash
cat <<'EOF' > src/__tests__/Layout.work-structure.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div data-testid="dashboard" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

test('opens Work Structure drawer with hierarchy and contact details', async () => {
  const user = userEvent.setup();
  renderLayout();

  const trigger = screen.getByRole('button', { name: /Рабочая структура/i });
  await user.click(trigger);

  const drawer = await screen.findByTestId('work-structure');
  expect(drawer).toBeInTheDocument();
  expect(screen.getByText('Контактный центр')).toBeVisible();
  expect(screen.getByText('Руководитель')).toBeVisible();
  expect(screen.getByText('Экстренный контакт')).toBeVisible();
});
EOF
```

2. **Update UAT crosswalk instructions**
   - **File:** uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md
   - **Changes:** Expand shell row with screenshot alias and verification checklist.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md
@@
-| Authentication flow, landing shell (header, tabs, work structure) | CH2_Login_System.md §2.1–2.2 | Launch supplied OIDC URL, enter credentials, allow notifications, then use the top header links ("Рабочая структура", avatar menu) shown on the start page (рис.2). | Confirms layout mirrored by the portal layout component (`src/components/Layout.tsx`). Manual pp. 1–40. |
+| Authentication flow, landing shell (header, tabs, work structure) | CH2_Login_System.md §2.1–2.2 | Launch supplied OIDC URL, enter credentials, allow notifications; header shows module tabs + «Рабочая структура» + колокольчик + ? help (рис.2). | `Layout` + `WorkStructureDrawer` (`${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx`, `WorkStructureDrawer.tsx`). Capture `portal-work-structure.png`; confirm trigger opens sheet with path Naumen→Отдел→Группа, contacts, emergency block. |
*** End Patch
PATCH
```

3. **Add screenshot alias to checklist**
   - **File:** docs/Tasks/screenshot-checklist.md
   - **Changes:** Append Work Structure capture guidance.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/screenshot-checklist.md
@@
 - portal-dashboard-overview.png — Главная с приветствием и KPI
 - portal-requests-playwright.png — Таблица заявок + фильтры (после отправки новой заявки)
 - portal-profile-edit.png — Профиль с обязательными полями и тостом «Профиль сохранён»
+- portal-work-structure.png — Открытая шторка «Рабочая структура» (иерархия, контакты, экстренный контакт)
*** End Patch
PATCH
```

## Tests & Validation
- `npm run build`
- `npm run test -- --run`
- Manual check: run `npm run dev -- --port 4180`, open `/`, trigger “Рабочая структура” via keyboard and mouse; confirm hierarchy order per CH2, close via Esc and overlay click.

## Rollback
```bash
set -euo pipefail
cd ${EMPLOYEE_PORTAL_REPO}
git checkout -- src/types/index.ts src/data/mockData.ts src/utils/format.ts \
  src/components/WorkStructureDrawer.tsx src/components/Layout.tsx src/App.tsx \
  src/__tests__/Layout.work-structure.test.tsx uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md \
  docs/Tasks/screenshot-checklist.md
```

## Handoff
- Log this plan in `docs/SESSION_HANDOFF.md` with key actions and validation commands.
- When execution completes, update `PROGRESS.md`, Code Map, parity checklists, screenshot index, and UAT packs with new evidence.
- Ensure UAT bundle references `portal-work-structure.png` and the restored shell behaviour before handoff.
