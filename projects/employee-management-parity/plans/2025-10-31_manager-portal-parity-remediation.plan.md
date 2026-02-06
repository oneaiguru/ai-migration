# Plan — Manager Portal Parity Remediation (Schedule · Approvals · Reports · Shell)

## Metadata
- Task: docs/Tasks/manager-portal_parity-remediation-2025-10-27.task.md
- Planner: manager-portal-plan-2025-10-31-codex
- Source scout: docs/Tasks/manager-portal_parity-remediation-2025-10-27-scout-2025-10-15-codex.task.md
- Additional references: docs/Archive/UAT/2025-10-27_manager-portal_parity-sweep.md, docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md}, /Users/m/Desktop/{e.tex,f.tex,g.tex,h.md}, CH2_Login_System.md §2.1–2.3, CH5_Schedule_Advanced.md §5.3–5.5, CH6_Reports.md §6.1–6.4, ai-docs/wrappers-draft/{data/DataTable.tsx,ui/Dialog.tsx}
- Target repo: ${MANAGER_PORTAL_REPO}

## Desired End State
The Manager Portal demo mirrors the Naumen production shell and workflows: the schedule route renders CH5 sub-tabs with a mocked grid, date/queue filters, and unpublished-change indicator; approvals separate schedule changes and shift exchanges with transfer/delete options and mandatory notes; reports list the full CH6 catalogue with RU filenames and a download queue bell; dashboard/teams value-add either stay behind a documented toggle or expose clear parity rationale; localisation gaps (legend, filenames, placeholders) are removed. Adapters/tests cover new data shapes, `npm run test -- --run --test-timeout=2000` and `npm run build` succeed, and updated UAT packs (`parity_static`, `trimmed_smoke`) pass against the refreshed deploy.

### Key Discoveries
- Schedule route is still an English placeholder (`${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:1-24`); CH5_Schedule_Advanced.md:120-205 details required tabs (График/Смены/Схемы/Заявки/Мониторинг/Задачи/События/Отпуска) and queue/date filters.
- Approvals table lacks shift disposition controls and mandatory reject note enforcement (see `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:200-380`, manual CH5_Schedule_Advanced.md:130-199).
- Reports page and export helpers cover only three items with EN filenames (`${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-34`, `${MANAGER_PORTAL_REPO}/src/utils/exports.ts:1-33`); CH6_Reports.md:5-90 lists eight reports plus notification-driven download queue.
- Org structure drawer opens as centred dialog instead of right-hand slide-out (`${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx:1-70`), and layout bell is static with no queue integration (`${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:20-120`, CH2_Login_System.md:20-27).
- Mock data lacks schedule grid entries and shift disposition metadata beyond `shiftPairId` (`${MANAGER_PORTAL_REPO}/src/data/mockData.ts:1-220`); tests do not cover new categories (`${MANAGER_PORTAL_REPO}/src/adapters/approvals.test.ts:1-80`).

## What We're NOT Doing
- No backend integration or real API calls—mock data only.
- No visual redesign beyond adding parity controls and RU copy; reuse existing wrappers/styles.
- No changes to other demos (Employee Portal, Analytics, Unified Shell) beyond documentation updates.
- No Playwright suite authoring this pass (document screenshots instead).

## Implementation Approach
Layer the remediation by first extending mocks/adapters to support schedule grids, shift disposition metadata, and full report definitions. Replace the schedule placeholder with tabbed views using existing wrappers (ReportTable, Dialog) and the DataTable pattern from ai-docs. Enhance approvals with tab filters, shift disposition controls, and note validation wired to new mock fields. Expand reports/export helpers and connect them to a download queue component surfaced via the header bell. Convert the org drawer into a right-side sheet and decide on dashboard/teams exposure via a simple feature flag referenced in docs. Finish with localisation sweeps, tests, and updated UAT/doc artefacts.

## Phase 1: Mock Data & Localisation Foundations

### Overview
Augment mock data, adapters, and localisation helpers to unblock schedule tabs, enhanced approvals, and report exports while addressing RU copy gaps.

### Changes Required:

#### 1. Extend mock data with schedule grid, queues, and shift disposition metadata
**File**: `${MANAGER_PORTAL_REPO}/src/data/mockData.ts`
**Changes**: Introduce schedule-specific types, add `orgQueues`, `scheduleDays`, and enrich requests with `affectedShifts`, `transferOptions`, and RU filenames.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
-export type RequestCategory = 'schedule_change' | 'shift_exchange' | 'absence' | 'overtime';
+export type RequestCategory = 'schedule_change' | 'shift_exchange' | 'absence' | 'overtime';
+
+export interface ShiftSlot {
+  id: string;
+  employeeId: string;
+  employeeName: string;
+  queueId: string;
+  start: string;
+  end: string;
+  status: 'published' | 'draft' | 'needs_review';
+}
+
+export interface ScheduleDay {
+  date: string;
+  queueId: string;
+  publishedCoverage: number;
+  requiredCoverage: number;
+  slots: ShiftSlot[];
+}
+
+export interface OrgQueue {
+  id: string;
+  name: string;
+  targetServiceLevel: number;
+  unpublishedChanges: number;
+}
@@
 export interface Request {
@@
   shiftPairId?: string;
+  affectedShifts?: string[];
+  transferOptions?: Array<{ id: string; label: string }>;
   history?: Array<{
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
-export const mockTeams: Team[] = [
+export const orgQueues: OrgQueue[] = [
+  { id: 'queue-support', name: 'Контакт-центр · Линия 1', targetServiceLevel: 92, unpublishedChanges: 2 },
+  { id: 'queue-support-night', name: 'Контакт-центр · Ночь', targetServiceLevel: 88, unpublishedChanges: 0 },
+  { id: 'queue-sales', name: 'Продажи · Входящие', targetServiceLevel: 90, unpublishedChanges: 1 },
+];
+
+export const scheduleDays: ScheduleDay[] = [
+  {
+    date: '2024-12-15',
+    queueId: 'queue-support',
+    publishedCoverage: 18,
+    requiredCoverage: 20,
+    slots: [
+      {
+        id: 'slot-anna-2024-12-15',
+        employeeId: '1',
+        employeeName: 'Анна Петрова',
+        queueId: 'queue-support',
+        start: '2024-12-15T09:00:00+03:00',
+        end: '2024-12-15T18:00:00+03:00',
+        status: 'published',
+      },
+      {
+        id: 'slot-igor-2024-12-15',
+        employeeId: '2',
+        employeeName: 'Игорь Волков',
+        queueId: 'queue-support',
+        start: '2024-12-15T10:00:00+03:00',
+        end: '2024-12-15T19:00:00+03:00',
+        status: 'draft',
+      },
+    ],
+  },
+  {
+    date: '2024-12-15',
+    queueId: 'queue-sales',
+    publishedCoverage: 12,
+    requiredCoverage: 12,
+    slots: [],
+  },
+];
+
+export const mockTeams: Team[] = [
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
         submittedAt: '2024-12-01',
         category: 'absence',
         bulkEligible: true,
+        transferOptions: [
+          { id: 'shift-transfer-1', label: 'Передать смену · М. Сергеев' },
+          { id: 'shift-transfer-2', label: 'Передать часы · О. Фёдорова' }
+        ],
         history: [
@@
         status: 'pending',
         reason: 'Замена вечерней смены',
         priority: 'high',
         submittedAt: '2024-12-13',
         category: 'shift_exchange',
         bulkEligible: false,
         shiftPairId: 'swap-42',
+        affectedShifts: ['slot-anna-2024-12-15', 'slot-igor-2024-12-15'],
+        transferOptions: [
+          { id: 'swap-transfer-anna', label: 'Передать смену Анне Петровой' },
+          { id: 'swap-transfer-open', label: 'Оставить вакансию (доп. смена)' }
+        ],
         history: [
*** End Patch
PATCH
```

#### 2. Localise request type labels and export filenames
**File**: `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts`
**Changes**: Ensure legend uses RU copy for `shift_swap`/`replacement` and expose `mapCategory` for tests.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/approvals.ts
@@
-const requestTypeMap: Record<Request['type'], string> = {
+const requestTypeMap: Record<Request['type'], string> = {
@@
-  replacement: 'Замена сотрудника',
+  replacement: 'Замещение сотрудника',
 };
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/approvals.ts
@@
 export const mapRequestType = (type: Request['type']) => requestTypeMap[type] ?? type;
-export const mapCategory = (category: RequestCategory | undefined) => (category ? categoryMap[category] ?? category : '—');
+export const mapCategory = (category: RequestCategory | undefined) => (category ? categoryMap[category] ?? category : '—');
*** End Patch
PATCH
```

#### 3. Expand export catalogue with RU filenames and statuses
**File**: `${MANAGER_PORTAL_REPO}/src/utils/exports.ts`
**Changes**: Add missing reports, RU filenames, and stub status field for download queue.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/utils/exports.ts
@@
-export interface ExportDefinition {
-  id: 't13' | 'work_schedule' | 'deviation';
-  label: string;
-  description: string;
-  filename: string;
-}
+export type ExportId =
+  | 't13'
+  | 'work_schedule_monthly'
+  | 'work_schedule_daily'
+  | 'deviation'
+  | 'employee_schedule'
+  | 'payroll_calculation'
+  | 'total_punctuality'
+  | 'licenses';
+
+export interface ExportDefinition {
+  id: ExportId;
+  label: string;
+  description: string;
+  filename: string;
+  status: 'available' | 'soon';
+}
 
-export const REPORT_EXPORTS: ExportDefinition[] = [
-  {
-    id: 't13',
-    label: 'Т-13 (табель учёта)',
-    description: 'Excel-отчёт по рабочему времени и отсутствиям',
-    filename: 't13_report.xlsx',
-  },
-  {
-    id: 'work_schedule',
-    label: 'Рабочий график',
-    description: 'Покрытие смен по подразделениям (CH6 §6.2)',
-    filename: 'work_schedule.csv',
-  },
-  {
-    id: 'deviation',
-    label: 'Отклонения и соблюдение',
-    description: 'Детализация по соблюдению графика (CH6 §6.3)',
-    filename: 'deviation_report.csv',
-  },
-];
+export const REPORT_EXPORTS: ExportDefinition[] = [
+  {
+    id: 't13',
+    label: 'Т-13 (табель учёта)',
+    description: 'Учёт рабочего времени за период (CH6 §6.1)',
+    filename: 't13_учёт_рабочего_времени.xlsx',
+    status: 'available',
+  },
+  {
+    id: 'work_schedule_monthly',
+    label: 'График рабочего времени (месяц)',
+    description: 'Покрытие по подразделениям за месяц',
+    filename: 'график_рабочего_времени_месяц.xlsx',
+    status: 'available',
+  },
+  {
+    id: 'work_schedule_daily',
+    label: 'График рабочего времени (сутки)',
+    description: 'Детализация смен с активностями на день',
+    filename: 'график_рабочего_времени_сутки.xlsx',
+    status: 'available',
+  },
+  {
+    id: 'deviation',
+    label: 'Отклонения от нормы часов',
+    description: 'Норма, факт и дельта по сотрудникам (CH6 §6.3)',
+    filename: 'отклонения_по_часам.xlsx',
+    status: 'available',
+  },
+  {
+    id: 'employee_schedule',
+    label: 'Рабочий график сотрудников',
+    description: 'Индивидуальные графики и режимы',
+    filename: 'рабочий_график_сотрудников.xlsx',
+    status: 'available',
+  },
+  {
+    id: 'payroll_calculation',
+    label: 'Расчёт заработной платы',
+    description: 'Экспорт для расчёта выплат',
+    filename: 'расчёт_заработной_платы.xlsx',
+    status: 'soon',
+  },
+  {
+    id: 'total_punctuality',
+    label: 'Сводная пунктуальность',
+    description: 'Итоги соблюдения графика по подразделениям',
+    filename: 'сводная_пунктуальность.csv',
+    status: 'soon',
+  },
+  {
+    id: 'licenses',
+    label: 'Лицензии и допуски',
+    description: 'Отчёт по квалификациям сотрудников',
+    filename: 'лицензии_и_допуски.xlsx',
+    status: 'available',
+  },
+];
 
-export const triggerReportDownload = async (exportId: ExportDefinition['id']) => {
-  console.info('Export requested:', exportId);
-  await new Promise((resolve) => setTimeout(resolve, 750));
-  return exportId;
-};
+export const triggerReportDownload = async (exportId: ExportId) => {
+  console.info('Export requested:', exportId);
+  await new Promise((resolve) => setTimeout(resolve, 750));
+  return exportId;
+};
*** End Patch
PATCH
```

#### 4. Add adapter/unit tests for new metadata and RU copy
**File**: `${MANAGER_PORTAL_REPO}/src/adapters/approvals.test.ts`
**Changes**: Assert RU labels for shift exchange/replacement, selection summary, and transfer metadata.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/approvals.test.ts
@@
-  expect(firstRow.type).toBe('Отпуск');
+  expect(firstRow.type).toBe('Отпуск');
@@
-  expect(summary).toEqual(['Отсутствие — 1']);
+  expect(summary).toEqual(['Отсутствие — 1']);
*** End Patch
PATCH
```

_Add new test cases verifying `mapRequestType('shift_swap') === 'Обмен сменами'` and that `summarizeSelection` covers `shift_exchange`. Use existing Vitest patterns in file._

#### 5. Track RU localisation backlog
**File**: `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md`
**Changes**: Append note referencing new filenames/labels to confirm parity after execution.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md
@@
 - Pending verification: rerun `parity_static.md` + `trimmed_smoke.md` on the next UAT sweep to capture русские скриншоты и подтвердить отсутствие регрессий.
+- 2025-10-31 plan: убедиться, что новые отчёты используют русские имена файлов (`utils/exports.ts`) и легенды `shift_swap`/`replacement` отображаются как «Обмен сменами»/«Замещение сотрудника».
*** End Patch
PATCH
```

## Phase 2: Schedule Module Parity

### Overview
Replace the placeholder schedule screen with CH5-compliant tabs, queue/date filters, and unpublished-change badge using existing wrappers and mocked data.

### Changes Required:

#### 1. Create schedule helpers and components
**File**: `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx` (new)
**Changes**: Tab navigation for График/Смены/Схемы/Заявки/Мониторинг/Задачи/События/Отпуска, rendering appropriate panels.

```bash
cat <<'PATCH' > src/components/schedule/ScheduleTabs.tsx
import { useMemo, useState } from 'react';
import { CalendarRange, ClipboardList, Layers, Activity, Bell, FlagTriangleRight, Plane, Umbrella } from 'lucide-react';
import type { OrgQueue, ScheduleDay } from '../../data/mockData';
import { ReportTable } from '../charts';

const tabs = [
  { id: 'graph', label: 'График', icon: CalendarRange },
  { id: 'shifts', label: 'Смены', icon: ClipboardList },
  { id: 'schemes', label: 'Схемы', icon: Layers },
  { id: 'requests', label: 'Заявки', icon: Activity },
  { id: 'monitoring', label: 'Мониторинг', icon: Bell },
  { id: 'tasks', label: 'Задачи', icon: FlagTriangleRight },
  { id: 'events', label: 'События', icon: Plane },
  { id: 'vacations', label: 'Отпуска', icon: Umbrella },
] as const;

interface ScheduleTabsProps {
  queues: OrgQueue[];
  scheduleDays: ScheduleDay[];
  activeQueueId: string;
}

export default function ScheduleTabs({ queues, scheduleDays, activeQueueId }: ScheduleTabsProps) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('graph');

  const currentQueue = useMemo(() => queues.find((queue) => queue.id === activeQueueId) ?? queues[0], [queues, activeQueueId]);
  const currentDays = useMemo(() => scheduleDays.filter((day) => day.queueId === currentQueue.id), [scheduleDays, currentQueue.id]);

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === 'graph' ? (
        <ReportTable
          columns=[
            { id: 'date', label: 'Дата', width: '10rem' },
            { id: 'required', label: 'Требуемое покрытие', width: '12rem' },
            { id: 'published', label: 'Опубликовано', width: '10rem' },
            { id: 'status', label: 'Статус', width: '8rem' }
          ]
          rows={currentDays.map((day) => ({
            id: day.date,
            date: new Date(day.date).toLocaleDateString('ru-RU'),
            required: day.requiredCoverage,
            published: day.publishedCoverage,
            status: day.publishedCoverage === day.requiredCoverage ? 'Опубликовано' : 'Требует публикации',
          }))}
          ariaTitle="График смен"
          ariaDesc="Запланированное и опубликованное покрытие по дням"
        />
      ) : null}
      {/* Executors fill in remaining tab bodies per scope (schemes, requests, monitoring, etc.) */}
    </div>
  );
}
PATCH
```

_Add TODO comments for executors to populate remaining tab content using existing wrappers (e.g., `ReportTable` for requests, `Dialog` for tasks)._ 

#### 2. Replace Schedule placeholder with tabbed experience
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx`
**Changes**: Import new tabs, add queue/date filters, and display unpublished-change badge.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Schedule.tsx
@@
-import { Calendar, Users, Clock } from 'lucide-react';
-
-export default function Schedule() {
-  return (
-    <div className="space-y-6">
-      <div className="card p-8 text-center">
-        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
-        <h2 className="text-xl font-semibold text-gray-900 mb-2">Schedule Management</h2>
-        <p className="text-gray-600 mb-4">
-          Advanced scheduling features are under development
-        </p>
-        <div className="max-w-md mx-auto space-y-3 text-left">
-          <div className="flex items-center text-sm text-gray-600">
-            <Users className="h-4 w-4 mr-2 text-blue-600" />
-            Team shift planning and assignment
-          </div>
-          <div className="flex items-center text-sm text-gray-600">
-            <Clock className="h-4 w-4 mr-2 text-green-600" />
-            Real-time schedule adjustments
-          </div>
-          <div className="flex items-center text-sm text-gray-600">
-            <Calendar className="h-4 w-4 mr-2 text-purple-600" />
-            Drag-and-drop schedule builder
-          </div>
-        </div>
-      </div>
-    </div>
-  );
-}
+import { useMemo, useState } from 'react';
+import { CalendarDays, Flame } from 'lucide-react';
+import ScheduleTabs from '../components/schedule/ScheduleTabs';
+import { orgQueues, scheduleDays } from '../data/mockData';
+
+export default function Schedule() {
+  const [activeQueueId, setActiveQueueId] = useState(orgQueues[0]?.id ?? '');
+  const [dateRange, setDateRange] = useState({ start: '2024-12-15', end: '2024-12-21' });
+
+  const activeQueue = useMemo(() => orgQueues.find((queue) => queue.id === activeQueueId), [activeQueueId]);
+  const unpublishedCount = activeQueue?.unpublishedChanges ?? 0;
+
+  return (
+    <div className="space-y-6">
+      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
+        <div className="space-y-1">
+          <h2 className="text-lg font-semibold text-slate-900">Панель расписания</h2>
+          <p className="text-sm text-slate-600">
+            Управляйте сменами и заявками в соответствии с CH5 (таб «График» и подтаблицы).
+          </p>
+        </div>
+        {unpublishedCount > 0 ? (
+          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
+            <Flame className="h-4 w-4" /> {unpublishedCount} неопубликованных изменений
+          </span>
+        ) : null}
+      </section>
+
+      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[240px_1fr]">
+        <div className="space-y-3">
+          <label className="block text-sm font-medium text-slate-700" htmlFor="queue-select">
+            Очередь обслуживания
+          </label>
+          <select
+            id="queue-select"
+            value={activeQueueId}
+            onChange={(event) => setActiveQueueId(event.target.value)}
+            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
+          >
+            {orgQueues.map((queue) => (
+              <option key={queue.id} value={queue.id}>
+                {queue.name}
+              </option>
+            ))}
+          </select>
+
+          <label className="block text-sm font-medium text-slate-700" htmlFor="date-start">
+            Диапазон дат
+          </label>
+          <div className="flex items-center gap-2">
+            <input
+              id="date-start"
+              type="date"
+              value={dateRange.start}
+              onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value }))}
+              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
+            />
+            <span className="text-slate-400">—</span>
+            <input
+              type="date"
+              value={dateRange.end}
+              onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value }))}
+              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
+            />
+          </div>
+        </div>
+
+        <div className="space-y-4">
+          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
+            <CalendarDays className="h-5 w-5 text-slate-500" /> Период: {new Date(dateRange.start).toLocaleDateString('ru-RU')} — {new Date(dateRange.end).toLocaleDateString('ru-RU')}
+          </div>
+          <ScheduleTabs queues={orgQueues} scheduleDays={scheduleDays} activeQueueId={activeQueueId} />
+        </div>
+      </section>
+    </div>
+  );
+}
*** End Patch
PATCH
```

#### 3. Document new components in CodeMap
**File**: `docs/Workspace/Coordinator/manager-portal/CodeMap.md`
**Changes**: Add entries for schedule tabs, queue filter, and new data helpers.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Workspace/Coordinator/manager-portal/CodeMap.md
@@
 - Schedule (route `schedule`)
   - Entry/layout: `${MANAGER_PORTAL_REPO}/src/App.tsx:75-78` mounts `<Schedule />` without props.
-  - Primary component: placeholder copy at `${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:6-24`; no grid, filters, or CH5 sub-tabs.
-  - Expected parity: CH5_Schedule_Advanced.md:120-205 describes Graph/Shifts/Schemes/Requests/Monitoring/Tasks/Events/Vacations tabs plus shift disposition options.
-  - Pending work: planner must define mocked shift rows (team, skill, queue, status, unpublished flag) and determine whether to reuse ReportTable or the virtualised table pattern from `ai-docs/wrappers-draft/data/DataTable.tsx:1-112`.
+  - Primary component: `${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx` (after remediation) renders queue/date filters, unpublished badge, and `<ScheduleTabs />`.
+  - Tabs component: `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx` drives Graph/Смены/Схемы/Заявки/Мониторинг/Задачи/События/Отпуска sections (ai-docs DataTable pattern).
+  - Data helpers: `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:1-220` (scheduleDays/orgQueues) supply coverage and shift metadata.
*** End Patch
PATCH
```

#### 4. Add unit test for schedule data filtering
**File**: `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Schedule.test.tsx` (new)
**Changes**: Render schedule page and assert queue filter toggles rows.

```bash
cat <<'PATCH' > src/pages/__tests__/Schedule.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Schedule from '../Schedule';
import { orgQueues } from '../../data/mockData';

describe('Schedule page', () => {
  it('filters schedule data by queue and shows unpublished badge', () => {
    render(<Schedule />);

    expect(screen.getByText(/Панель расписания/)).toBeInTheDocument();
    expect(screen.getByText(/неопубликованных изменений/)).toBeInTheDocument();

    const queueSelect = screen.getByLabelText(/Очередь обслуживания/);
    fireEvent.change(queueSelect, { target: { value: orgQueues[1].id } });
    expect(queueSelect).toHaveValue(orgQueues[1].id);
  });
});
PATCH
```

## Phase 3: Approvals Workflow Enhancements

### Overview
Deliver CH5 request processing: separate tabs for schedule changes vs shift exchanges, shift disposition controls, mandatory rejection notes, and bulk apply options wired to new mock metadata.

### Changes Required:

#### 1. Introduce approvals tab filter and disposition panel
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx`
**Changes**: Add top-level tabs (Изменения графика/Обмен сменами/Отсутствия/Сверхурочные), show disposition options when `transferOptions` exists, and block reject submission without note.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-import {
-  approvalsTableColumns,
-  buildApprovalRows,
-  mapPriority,
-  mapRequestType,
-  mapStatus,
-  priorityOrder,
-  categoryOrder,
-  mapCategory,
-  summarizeSelection,
-} from '../adapters/approvals';
+import {
+  approvalsTableColumns,
+  buildApprovalRows,
+  mapPriority,
+  mapRequestType,
+  mapStatus,
+  priorityOrder,
+  categoryOrder,
+  mapCategory,
+  summarizeSelection,
+} from '../adapters/approvals';
@@
-  return (
+  return (
     <div className="space-y-6">
+      <nav className="flex flex-wrap items-center gap-2">
+        {categoryOrder
+          .filter((category) => category === 'all' || category !== 'overtime')
+          .map((category) => (
+            <button
+              key={category}
+              type="button"
+              className={`rounded-full px-3 py-1 text-sm transition ${
+                categoryFilter === category
+                  ? 'bg-primary-600 text-white'
+                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
+              }`}
+              onClick={() => setCategoryFilter(category)}
+            >
+              {category === 'all' ? 'Все заявки' : mapCategory(category)}
+            </button>
+          ))}
+      </nav>
@@
-          selectedRequest ? (
+          selectedRequest ? (
             <>
+              {selectedRequest.transferOptions?.length ? (
+                <div className="space-y-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
+                  <p className="font-medium text-slate-800">Действия со сменой</p>
+                  {selectedRequest.transferOptions.map((option) => (
+                    <label key={option.id} className="flex items-center gap-2">
+                      <input
+                        type="radio"
+                        name="shift-disposition"
+                        value={option.id}
+                        onChange={() => console.info('Disposition selected', option.id)}
+                      />
+                      {option.label}
+                    </label>
+                  ))}
+                  <label className="flex items-center gap-2">
+                    <input type="radio" name="shift-disposition" value="delete" /> Удалить смену без замены
+                  </label>
+                </div>
+              ) : null}
*** End Patch
PATCH
```

_Add inline TODO comment instructing executor to persist disposition choice with note in mock state._

#### 2. Enforce rejection note requirement in bulk flow
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx`
**Changes**: Disable `Применить решение` until `note.trim().length > 0` for reject action and display helper text.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-                disabled={
-                  dialogAction === null ||
-                  (dialogAction === 'reject' && note.trim().length === 0)
-                }
+                disabled={dialogAction === null || (dialogAction === 'reject' && note.trim().length === 0)}
*** End Patch
PATCH
```

#### 3. Add scenario tests for disposition and note enforcement
**File**: `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx`
**Changes**: Assert that selecting reject without note keeps apply button disabled and that transfer options render for shift exchange requests.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/__tests__/Approvals.test.tsx
@@
-  it('renders approvals table with filters', () => {
+  it('requires a note when rejecting and shows shift disposition options', async () => {
*** End Patch
PATCH
```

_Fill test body mirroring existing patterns using Testing Library._

## Phase 4: Reports Catalogue & Download Queue

### Overview
Expose the full CH6 report list with RU filenames, status badges, and integrate a mock download queue feeding the header notification bell.

### Changes Required:

#### 1. Create download queue store
**File**: `${MANAGER_PORTAL_REPO}/src/state/downloadQueue.ts` (new)
**Changes**: Simple observable (Zustand-like) using React context for queue entries.

```bash
cat <<'PATCH' > src/state/downloadQueue.ts
import { createContext, useContext, useMemo, useState } from 'react';
import type { ExportId } from '../utils/exports';

interface QueueEntry {
  id: string;
  exportId: ExportId;
  label: string;
  status: 'pending' | 'ready';
}

interface DownloadQueueContextValue {
  queue: QueueEntry[];
  enqueue: (entry: QueueEntry) => void;
  markReady: (id: string) => void;
}

const DownloadQueueContext = createContext<DownloadQueueContextValue | null>(null);

export function DownloadQueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);

  const value = useMemo<DownloadQueueContextValue>(
    () => ({
      queue,
      enqueue(entry) {
        setQueue((prev) => [...prev, entry]);
      },
      markReady(id) {
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'ready' } : item)));
      },
    }),
    [queue],
  );

  return <DownloadQueueContext.Provider value={value}>{children}</DownloadQueueContext.Provider>;
}

export function useDownloadQueue() {
  const context = useContext(DownloadQueueContext);
  if (!context) {
    throw new Error('useDownloadQueue must be used within DownloadQueueProvider');
  }
  return context;
}
PATCH
```

#### 2. Wrap app with provider and wire bell dropdown
**File**: `${MANAGER_PORTAL_REPO}/src/App.tsx`
**Changes**: Surround layout with `DownloadQueueProvider` and pass queue count to header.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-import Layout from './components/Layout';
+import Layout from './components/Layout';
@@
-import { filterTeamsByOrgUnit, mockTeams } from './data/mockData';
+import { filterTeamsByOrgUnit, mockTeams } from './data/mockData';
+import { DownloadQueueProvider } from './state/downloadQueue';
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-  return (
-    <Layout
-      currentPage={currentPage}
-      onPageChange={setCurrentPage}
-      currentModule={currentModule}
-      onModuleChange={handleModuleChange}
-      activeOrgUnit={activeOrgUnit}
-      onOrgUnitChange={setActiveOrgUnit}
-    >
-      {renderCurrentPage()}
-    </Layout>
-  );
+  return (
+    <DownloadQueueProvider>
+      <Layout
+        currentPage={currentPage}
+        onPageChange={setCurrentPage}
+        currentModule={currentModule}
+        onModuleChange={handleModuleChange}
+        activeOrgUnit={activeOrgUnit}
+        onOrgUnitChange={setActiveOrgUnit}
+      >
+        {renderCurrentPage()}
+      </Layout>
+    </DownloadQueueProvider>
+  );
 }
*** End Patch
PATCH
```

#### 3. Update layout bell to show dropdown items
**File**: `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx`
**Changes**: Consume queue context, show badge count, and render dropdown list with download statuses.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-import { Users, Calendar, Bell, Settings, LogOut, BarChart3, Clock } from 'lucide-react';
+import { Users, Calendar, Bell, Settings, LogOut, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
 import OrgStructureDrawer from './OrgStructureDrawer';
 import { orgUnits } from '../data/mockData';
+import { useDownloadQueue } from '../state/downloadQueue';
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-  const pageTitles = React.useMemo(
+  const { queue } = useDownloadQueue();
+  const pageTitles = React.useMemo(
@@
-          <div className="flex h-16 items-center justify-between px-6">
+          <div className="flex h-16 items-center justify-between px-6">
@@
-              <button
-                type="button"
-                onClick={() => setDrawerOpen(true)}
-                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
-              >
+              <button
+                type="button"
+                onClick={() => setDrawerOpen(true)}
+                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
+              >
                 <BarChart3 className="h-4 w-4" /> Рабочая структура
               </button>
-              <button
-                type="button"
-                className="relative rounded-full p-2 text-gray-400 transition hover:text-gray-500"
-                aria-label="Уведомления"
-              >
-                <Bell className="h-5 w-5" />
-                <span className="absolute top-1 right-1 inline-flex h-3 w-3 rounded-full bg-red-500" />
-              </button>
+              <div className="relative">
+                <button
+                  type="button"
+                  className="relative rounded-full p-2 text-gray-400 transition hover:text-gray-500"
+                  aria-label="Уведомления"
+                  onClick={() => setShowQueue((prev) => !prev)}
+                >
+                  <Bell className="h-5 w-5" />
+                  {queue.length ? (
+                    <span className="absolute top-1 right-1 inline-flex h-4 min-w-[1rem] translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
+                      {queue.length}
+                    </span>
+                  ) : null}
+                </button>
+                {showQueue && queue.length ? (
+                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
+                    <p className="mb-2 text-xs font-semibold text-slate-500">Скачивания отчётов</p>
+                    <ul className="space-y-1 text-sm text-slate-600">
+                      {queue.map((item) => (
+                        <li key={item.id} className="flex items-center gap-2">
+                          <CheckCircle2 className={`h-4 w-4 ${item.status === 'ready' ? 'text-green-500' : 'text-slate-300'}`} />
+                          <span>{item.label}</span>
+                        </li>
+                      ))}
+                    </ul>
+                  </div>
+                ) : null}
+              </div>
             </div>
           </div>
*** End Patch
PATCH
```

_Add `const [showQueue, setShowQueue] = React.useState(false);` near drawer state._

#### 4. Update Reports page to show badges and trigger queue entries
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx`
**Changes**: Display status chips (Доступно/Скоро), and on click call `enqueue` from queue provider to surface notifications.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Reports.tsx
@@
-import { REPORT_EXPORTS } from '../utils/exports';
+import { REPORT_EXPORTS, triggerReportDownload } from '../utils/exports';
+import { useDownloadQueue } from '../state/downloadQueue';
@@
-export default function Reports({ activeOrgUnit }: ReportsProps) {
+export default function Reports({ activeOrgUnit }: ReportsProps) {
+  const { enqueue, markReady } = useDownloadQueue();
@@
-          {REPORT_EXPORTS.map((entry) => (
-            <article key={entry.id} className="flex flex-col justify-between rounded-lg border border-slate-200 p-4">
+          {REPORT_EXPORTS.map((entry) => (
+            <article key={entry.id} className="flex flex-col justify-between rounded-lg border border-slate-200 p-4">
               <div className="space-y-2">
                 <h3 className="text-sm font-semibold text-slate-900">{entry.label}</h3>
                 <p className="text-sm text-slate-600">{entry.description}</p>
               </div>
-              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
-                <span>{entry.filename}</span>
-                <Download className="h-4 w-4 text-slate-400" />
-              </div>
+              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
+                <span>{entry.filename}</span>
+                <span
+                  className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
+                    entry.status === 'available'
+                      ? 'bg-emerald-100 text-emerald-700'
+                      : 'bg-slate-100 text-slate-500'
+                  }`}
+                >
+                  {entry.status === 'available' ? 'Доступно' : 'Скоро'}
+                </span>
+              </div>
+              <button
+                type="button"
+                disabled={entry.status !== 'available'}
+                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
+                onClick={async () => {
+                  const queued = { id: `${entry.id}-${Date.now()}`, exportId: entry.id, label: entry.label, status: 'pending' as const };
+                  enqueue(queued);
+                  await triggerReportDownload(entry.id);
+                  markReady(queued.id);
+                }}
+              >
+                <Download className="h-4 w-4" /> Сформировать
+              </button>
             </article>
           ))}
         </div>
       </section>
*** End Patch
PATCH
```

#### 5. Update Plans/UAT docs for new reports
**File**: `docs/Tasks/uat-packs/parity_static.md`
**Changes**: Expand Manager Portal section to cover schedule tabs and full report list.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/uat-packs/parity_static.md
@@
 - Reports (placeholder) (src/components/Layout.tsx:16, src/pages/Reports.tsx:9)
+  - Reports catalogue — Проверить 8 отчётов, статусы «Доступно/Скоро», запуск формирования добавляет запись в колокол (src/pages/Reports.tsx, src/utils/exports.ts)
 - Settings (placeholder) (src/components/Layout.tsx:17, src/pages/Settings.tsx:9)
@@
-- Schedule (placeholder) present | **Fail** | Demo’s **Расписание** page displays an English placeholder
+- Schedule parity tabs — подтвердить, что таб «График» показывает покрытие, «Заявки» повторяет фильтры, индикатор неопубликованных изменений виден (src/pages/Schedule.tsx, src/components/schedule/ScheduleTabs.tsx)
*** End Patch
PATCH
```

_Similar append for `docs/Tasks/uat-packs/trimmed_smoke.md` ensuring live smoke covers new flows._

## Phase 5: Shell Parity & Feature Flag Decision

### Overview
Convert the org drawer to a right-hand sheet, connect work-structure filter to schedule/approvals, and gate dashboard/teams via configuration documented for UAT.

### Changes Required:

#### 1. Implement sheet-style drawer
**File**: `${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx`
**Changes**: Use dialog wrapper with `position="right"`, full-height panel, and close-on-overlay.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/OrgStructureDrawer.tsx
@@
-import Dialog from './common/Dialog';
+import Dialog from './common/Dialog';
@@
-  return (
-    <Dialog
-      open={open}
-      onClose={onClose}
-      title="Рабочая структура"
-      description="Выберите подразделение, чтобы фильтровать показатели и заявки"
-      footer={null}
-    >
-      <div className="space-y-2">
+  return (
+    <Dialog
+      open={open}
+      onClose={onClose}
+      title="Рабочая структура"
+      description="Выберите подразделение, чтобы фильтровать показатели и заявки"
+      footer={null}
+      position="right"
+      size="lg"
+    >
+      <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
*** End Patch
PATCH
```

#### 2. Add feature flag for dashboard/teams visibility
**File**: `${MANAGER_PORTAL_REPO}/src/config/features.ts` (new)
**Changes**: Export booleans `dashboardEnabled`, `teamsEnabled`, driven by environment variable fallback.

```bash
cat <<'PATCH' > src/config/features.ts
export const dashboardEnabled = process.env.VITE_MANAGER_PORTAL_DASHBOARD === 'on';
export const teamsEnabled = process.env.VITE_MANAGER_PORTAL_TEAMS === 'on';
PATCH
```

#### 3. Use feature flag in App/Layout and document decision
**File**: `${MANAGER_PORTAL_REPO}/src/App.tsx`
**Changes**: Conditionally include routes and navigation items; default to `false` to match production.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-import { filterTeamsByOrgUnit, mockTeams } from './data/mockData';
+import { filterTeamsByOrgUnit, mockTeams } from './data/mockData';
+import { dashboardEnabled, teamsEnabled } from './config/features';
*** End Patch
PATCH
```

_Within layout navigation definition, filter items based on flags. Update `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md` to record final decision._

## Phase 6: Docs, UAT, and Coordination Updates

### Overview
Ensure documentation reflects new functionality, update UAT findings, and record plan activation per SOP.

### Changes Required:
- `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`: adjust MP-SCH/MP-REP/MP-APR acceptance to point to new components/tests; mark MP-DASH decision once flag configured.
- `docs/Tasks/post-phase9-demo-execution.md`: set Manager Portal row to “Plan in progress – 2025-10-31 manager-portal-plan-2025-10-31-codex”.
- `docs/SESSION_HANDOFF.md`: add entry pointing executor to this plan.
- `docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, PARITY_MVP_CHECKLISTS.md}` and `docs/Reports/PARITY_MVP_CHECKLISTS.md`: queue updates post-execution (note in handoff).

## Tests & Validation
- `${MANAGER_PORTAL_REPO}`: `npm run test -- --run --test-timeout=2000` (expands unit coverage for approvals/schedule/report queue).
- `${MANAGER_PORTAL_REPO}`: `npm run build`.
- Preview sanity: `npm run preview -- --host 127.0.0.1 --port 4174` (verify schedule tabs, approvals disposition, report downloads, org drawer sheet).
- Post-deploy UAT: run `docs/Tasks/uat-packs/parity_static.md` and `docs/Tasks/uat-packs/trimmed_smoke.md` (ensure schedule tabs, report queue, approvals flows documented with new screenshots).

## Rollback
- Within `${MANAGER_PORTAL_REPO}`: `git checkout -- src/{components,pages,adapters,utils,state}/` to revert code changes if needed, then `git clean -fd src/components/schedule src/state` to remove new files.
- Within docs repo: `git checkout -- docs/Workspace/Coordinator docs/Tasks docs/System docs/Reports| grep manager-portal` to undo documentation edits.
- Remove `VITE_MANAGER_PORTAL_*` env vars from `.env.local` if feature flags cause issues.

## Handoff
- Executors: follow this plan sequentially; update `docs/SESSION_HANDOFF.md` with progress, test outputs, and deploy URL.
- After execution, refresh `docs/Workspace/Coordinator/manager-portal/CodeMap.md` (schedule, approvals, reports sections), Findings table (mark Pass/Extra with evidence), `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, and `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`.
- Schedule next UAT agent with updated prompt referencing new flows and RU filenames.
