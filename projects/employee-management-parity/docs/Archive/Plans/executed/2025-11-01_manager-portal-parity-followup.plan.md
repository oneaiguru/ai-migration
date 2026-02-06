# Plan — Manager Portal Parity Follow-up (Schedule Requests · Approvals Filters · Download Queue · Settings RU)

## Metadata
- Task: docs/Tasks/manager-portal_parity-followup-2025-10-31.task.md
- Planner: manager-portal-plan-2025-11-01-codex
- Source scout: docs/Tasks/manager-portal_parity-followup-2025-10-31-scout-manager-portal-scout-2025-10-31-codex.task.md
- Additional references: docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md, docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md}, CH5_Schedule_Advanced.md §5.4 (lines 151-204), CH6_Reports.md §6.1-§6.4 (lines 15-90)
- Target repo: ${MANAGER_PORTAL_REPO}

## Desired End State
The Manager Portal demo shows the same request workflows and notifications as Naumen production. The schedule route renders a fully functional «Заявки» tab backed by mock data filtered by queue/date, approvals expose CH5-compatible status/date filters plus a history toggle, the header download bell runs a multi-stage queue with confirm/download controls, and the Settings page is localised or hidden behind a feature flag. Updated adapters/tests cover the new data paths, `npm run test -- --run --test-timeout=2000` and `npm run build` succeed, preview smoke (`npm run preview -- --host 127.0.0.1 --port 4174`) passes, and UAT packs (`parity_static.md`, `trimmed_smoke.md`) record Pass with refreshed RU screenshots. Docs (Code Map, Findings, localisation backlog, system parity reports, SESSION_HANDOFF) all reflect the changes.

### Key Discoveries
- Schedule «Заявки» tab still renders a placeholder (`src/components/schedule/ScheduleTabs.tsx:139-146`); CH5_Schedule_Advanced.md lines 151-204 detail required filters, bulk actions, and shift lists.
- Approvals screen filters rely on a single status dropdown and manual date range (`src/pages/Approvals.tsx:221-312`), diverging from production’s checkbox set + «Заявки за период» history (`CH5_Schedule_Advanced.md:151-161`).
- Download bell only lists labels with a ready icon (`src/components/Layout.tsx:140-177`) and the queue provider lacks status transitions (`src/state/downloadQueue.tsx:1-34`); CH6_Reports.md lines 15-29 describe pending → confirm → download flow.
- Settings page copy remains in English (`src/pages/Settings.tsx:1-23`), flagged in coordinator localisation backlog.
- Discovery doc notes feature-flag expectations for extras (dashboard/teams) and to decide Settings visibility (`src/config/features.ts:1-3`, Layout nav at `src/components/Layout.tsx:25-44`).

## What We're NOT Doing
- No backend integration or live API calls—mock data only.
- No redesign of dashboard/teams extras beyond gating (visual polish unchanged).
- No Playwright additions this pass; capture RU screenshots manually during UAT.
- No changes to other demos (analytics/employee/forecasting) besides required doc updates.

## Implementation Approach
Extend mock helpers plus a new adapter to aggregate requests by queue/date, then render the schedule tab with ReportTable, filters, and a detail dialog reusing approvals metadata. Update approvals to start with all requests but default filters to pending, swap in checkbox/status presets, and surface history. Expand the download queue context to track pending/ready/acknowledged states with timestamps and use it from both Reports and Layout. Localise Settings copy and hide the nav via a new feature flag unless explicitly enabled. Finish with targeted tests (adapter + UI filters + queue logic), run build/tests/preview, and refresh documentation/UAT artefacts.

## Phase 1: Schedule Request Data & Adapter

### Overview
Expose queue-aware request metadata so the schedule tab can reuse approvals mocks without duplicating logic.

### Changes Required:

#### 1. Add queue lookup helpers for requests
**File**: `src/data/mockData.ts`
**Changes**: Export a `queueByOrgUnit` map used to infer queue IDs for teams without explicit `affectedShifts`. Keep existing data intact.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
 export const orgQueues: OrgQueue[] = [
   { id: 'queue-support', name: 'Контакт-центр · Линия 1', targetServiceLevel: 92, unpublishedChanges: 2 },
   { id: 'queue-support-night', name: 'Контакт-центр · Ночь', targetServiceLevel: 88, unpublishedChanges: 0 },
   { id: 'queue-sales', name: 'Продажи · Входящие', targetServiceLevel: 90, unpublishedChanges: 1 },
 ];
+
+export const queueByOrgUnit: Record<string, OrgQueue['id']> = {
+  support: 'queue-support',
+  sales: 'queue-sales',
+  engineering: 'queue-support-night',
+  marketing: 'queue-sales',
+  finance: 'queue-support',
+  hr: 'queue-support',
+  product: 'queue-support',
+  strategy: 'queue-sales',
+  root: 'queue-support',
+};
*** End Patch
PATCH
```

#### 2. Create schedule request adapter
**File**: `src/adapters/scheduleRequests.ts`
**Changes**: New adapter builds queue/date buckets with formatted labels, pulling helpers from approvals adapter for RU strings.

```bash
cat <<'EOT' > src/adapters/scheduleRequests.ts
import { mapCategory, mapPriority, mapRequestType, mapStatus } from './approvals';
import type { OrgQueue, Request, ScheduleDay, Team } from '../data/mockData';

export type ScheduleRequestBucket = 'current' | 'history';

export interface ScheduleRequestRow {
  id: string;
  queueId: string;
  bucket: ScheduleRequestBucket;
  employee: string;
  team: string;
  category: string;
  type: string;
  priority: string;
  priorityRaw: Request['priority'];
  status: string;
  statusRaw: Request['status'];
  period: string;
  submittedAt: string;
  startDate: string;
  endDate: string;
  affectedShifts: Array<{ id: string; label: string }>;
}

interface BuildArgs {
  teams: Team[];
  scheduleDays: ScheduleDay[];
  queueByOrgUnit: Record<string, OrgQueue['id']>;
  dateRange: { start: string; end: string };
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));

const formatTimeRange = (start: string, end: string) => {
  const formatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${formatter.format(new Date(start))} — ${formatter.format(new Date(end))}`;
};

const isWithinRange = (value: string, range: { start: string; end: string }) => {
  if (!range.start && !range.end) {
    return true;
  }
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) {
    return true;
  }
  const start = range.start ? new Date(range.start).getTime() : Number.NEGATIVE_INFINITY;
  const end = range.end ? new Date(range.end).getTime() : Number.POSITIVE_INFINITY;
  return target >= start && target <= end;
};

export function buildScheduleRequestRows({ teams, scheduleDays, queueByOrgUnit, dateRange }: BuildArgs) {
  const slotById = new Map<ScheduleDay['slots'][number]['id'], ScheduleDay['slots'][number]>();
  scheduleDays.forEach((day) => {
    day.slots.forEach((slot) => {
      slotById.set(slot.id, slot);
    });
  });

  return teams.flatMap((team) => {
    const fallbackQueueId = queueByOrgUnit[team.orgUnitId] ?? queueByOrgUnit.root;

    return team.requests.map<ScheduleRequestRow>((request) => {
      const slotQueueId = request.affectedShifts?.map((shiftId) => slotById.get(shiftId)?.queueId).find(Boolean);
      const queueId = slotQueueId ?? fallbackQueueId;
      const bucket: ScheduleRequestBucket = request.status === 'pending' && isWithinRange(request.startDate, dateRange) ? 'current' : 'history';
      const affectedShifts = (request.affectedShifts ?? [])
        .map((shiftId) => {
          const slot = slotById.get(shiftId);
          if (!slot) {
            return null;
          }
          return {
            id: shiftId,
            label: `${formatDate(slot.start)} · ${formatTimeRange(slot.start, slot.end)} · ${mapStatus(slot.status === 'needs_review' ? 'pending' : 'approved')}`,
          };
        })
        .filter(Boolean) as Array<{ id: string; label: string }>;

      return {
        id: request.id,
        queueId,
        bucket,
        employee: request.employeeName,
        team: team.name,
        category: mapCategory(request.category),
        type: mapRequestType(request.type),
        priority: mapPriority(request.priority),
        priorityRaw: request.priority,
        status: mapStatus(request.status),
        statusRaw: request.status,
        period: `${formatDate(request.startDate)} — ${formatDate(request.endDate)}`,
        submittedAt: formatDate(request.submittedAt),
        startDate: request.startDate,
        endDate: request.endDate,
        affectedShifts,
      };
    });
  });
}

export const summarizeRequests = (rows: ScheduleRequestRow[]) => {
  const byStatus = new Map<Request['status'], number>();
  rows.forEach((row) => {
    byStatus.set(row.statusRaw, (byStatus.get(row.statusRaw) ?? 0) + 1);
  });
  return Array.from(byStatus.entries()).map(([status, count]) => `${mapStatus(status)} — ${count}`);
};
EOT
```

#### 3. Add adapter tests
**File**: `src/adapters/scheduleRequests.test.ts`
**Changes**: Cover bucket separation, queue inference, and affected shift formatting.

```bash
cat <<'EOT' > src/adapters/scheduleRequests.test.ts
import { describe, expect, it } from 'vitest';
import { buildScheduleRequestRows } from './scheduleRequests';
import { mockTeams, scheduleDays, orgQueues, queueByOrgUnit } from '../data/mockData';

const dateRange = { start: '2024-12-01', end: '2024-12-31' };

describe('buildScheduleRequestRows', () => {
  const rows = buildScheduleRequestRows({
    teams: mockTeams,
    scheduleDays,
    queueByOrgUnit,
    dateRange,
  });

  it('groups requests by queue inferred from affected shifts or org unit', () => {
    const supportRow = rows.find((row) => row.id === 'req1');
    expect(supportRow?.queueId).toBe('queue-support');

    const salesRow = rows.find((row) => row.id === 'req3');
    expect(salesRow?.queueId).toBe('queue-sales');
  });

  it('marks pending requests in range as current bucket', () => {
    const current = rows.filter((row) => row.bucket === 'current');
    expect(current.every((row) => row.statusRaw === 'pending')).toBe(true);
  });

  it('formats affected shifts when metadata is available', () => {
    const swapRow = rows.find((row) => row.id === 'req5');
    expect(swapRow?.affectedShifts?.length).toBeGreaterThan(0);
    if (swapRow?.affectedShifts?.[0]) {
      expect(swapRow.affectedShifts[0].label).toContain('·');
    }
  });
});
EOT
```

## Phase 2: Schedule Tab Requests UI

### Overview
Render the new request rows inside the schedule tab with filters, queue/date awareness, and a detail dialog.

### Changes Required:

#### 1. Pass request data from schedule page
**File**: `src/pages/Schedule.tsx`
**Changes**: Import adapter/mocks, compute request rows filtered by queue/date, and pass to `ScheduleTabs`.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Schedule.tsx
@@
-import ScheduleTabs from '../components/schedule/ScheduleTabs';
-import { orgQueues, scheduleDays } from '../data/mockData';
+import ScheduleTabs from '../components/schedule/ScheduleTabs';
+import { orgQueues, scheduleDays, mockTeams, queueByOrgUnit } from '../data/mockData';
+import { buildScheduleRequestRows } from '../adapters/scheduleRequests';
@@
-  const activeQueue = useMemo(() => orgQueues.find((queue) => queue.id === activeQueueId), [activeQueueId]);
-  const unpublishedCount = activeQueue?.unpublishedChanges ?? 0;
+  const activeQueue = useMemo(() => orgQueues.find((queue) => queue.id === activeQueueId), [activeQueueId]);
+  const unpublishedCount = activeQueue?.unpublishedChanges ?? 0;
+
+  const scheduleRequests = useMemo(
+    () =>
+      buildScheduleRequestRows({
+        teams: mockTeams,
+        scheduleDays,
+        queueByOrgUnit,
+        dateRange,
+      }),
+    [dateRange],
+  );
@@
-        <div>
-          <ScheduleTabs queues={orgQueues} scheduleDays={scheduleDays} activeQueueId={activeQueueId} />
+        <div>
+          <ScheduleTabs
+            queues={orgQueues}
+            scheduleDays={scheduleDays}
+            scheduleRequests={scheduleRequests}
+            activeQueueId={activeQueueId}
+            dateRange={dateRange}
+          />
         </div>
       </section>
     </div>
   );
 }
*** End Patch
PATCH
```

#### 2. Replace schedule-tab placeholder with ReportTable & dialog
**File**: `src/components/schedule/ScheduleTabs.tsx`
**Changes**: Accept new props, add filters (status checkboxes, bucket toggle), render table, and show affected shifts in Dialog.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/schedule/ScheduleTabs.tsx
@@
-import { useMemo, useState } from 'react';
+import { useMemo, useState } from 'react';
 import {
   Activity,
   Bell,
@@
   Umbrella,
 } from 'lucide-react';
-import type { OrgQueue, ScheduleDay, ShiftSlot } from '../../data/mockData';
-import { ReportTable } from '../charts';
+import type { OrgQueue, ScheduleDay, ShiftSlot } from '../../data/mockData';
+import { ReportTable } from '../charts';
+import Dialog from '../common/Dialog';
+import type { ScheduleRequestRow } from '../../adapters/scheduleRequests';
+import { summarizeRequests } from '../../adapters/scheduleRequests';
@@
-interface ScheduleTabsProps {
-  queues: OrgQueue[];
-  scheduleDays: ScheduleDay[];
-  activeQueueId: string;
-}
+interface ScheduleTabsProps {
+  queues: OrgQueue[];
+  scheduleDays: ScheduleDay[];
+  scheduleRequests: ScheduleRequestRow[];
+  activeQueueId: string;
+  dateRange: { start: string; end: string };
+}
@@
-export default function ScheduleTabs({ queues, scheduleDays, activeQueueId }: ScheduleTabsProps) {
+export default function ScheduleTabs({ queues, scheduleDays, scheduleRequests, activeQueueId }: ScheduleTabsProps) {
   const [activeTab, setActiveTab] = useState<ScheduleTabId>('graph');
+  const [requestBucket, setRequestBucket] = useState<'current' | 'history'>('current');
+  const [requestStatusFilter, setRequestStatusFilter] = useState<Array<'pending' | 'approved' | 'rejected'>>(['pending']);
+  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
@@
-  const renderRequests = () => (
-    <div className="space-y-3">
-      <p className="text-sm text-slate-600">
-        Заявки, созданные в «Заявках» менеджера, появляются здесь для контекстной работы: переносы смен,
-        обмены и отсутствие. Используйте фильтры по дате и статусу, чтобы увидеть ожидающие действия.
-      </p>
-      {renderEmptyState('Интеграция с заявками будет подключена на следующем цикле. Сейчас отображаются данные из вкладки «Заявки» в меню менеджера.')}
-    </div>
-  );
+  const requestRows = useMemo(() => {
+    const rows = scheduleRequests.filter((row) => row.queueId === currentQueue?.id && row.bucket === requestBucket);
+    if (requestStatusFilter.length === 0 || requestStatusFilter.length === 3) {
+      return rows;
+    }
+    return rows.filter((row) => requestStatusFilter.includes(row.statusRaw));
+  }, [scheduleRequests, currentQueue, requestBucket, requestStatusFilter]);
+
+  const selectedRequest = useMemo(
+    () => (selectedRequestId ? scheduleRequests.find((row) => row.id === selectedRequestId) ?? null : null),
+    [scheduleRequests, selectedRequestId],
+  );
+
+  const toggleStatusFilter = (status: 'pending' | 'approved' | 'rejected') => {
+    setRequestStatusFilter((prev) => {
+      if (prev.includes(status)) {
+        return prev.filter((item) => item !== status);
+      }
+      return [...prev, status];
+    });
+  };
+
+  const renderRequests = () => (
+    <div className="space-y-4">
+      <section className="flex flex-wrap items-start justify-between gap-4">
+        <div className="space-y-2">
+          <div className="flex flex-wrap items-center gap-2">
+            {(['pending', 'approved', 'rejected'] as const).map((status) => (
+              <label key={status} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
+                <input
+                  type="checkbox"
+                  checked={requestStatusFilter.includes(status)}
+                  onChange={() => toggleStatusFilter(status)}
+                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
+                />
+                {status === 'pending' ? 'На рассмотрении' : status === 'approved' ? 'Одобрено' : 'Отклонено'}
+              </label>
+            ))}
+          </div>
+          <div className="flex items-center gap-2 text-sm">
+            <button
+              type="button"
+              onClick={() => setRequestBucket('current')}
+              className={`rounded-full px-3 py-1 ${requestBucket === 'current' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
+            >
+              Текущие заявки
+            </button>
+            <button
+              type="button"
+              onClick={() => setRequestBucket('history')}
+              className={`rounded-full px-3 py-1 ${requestBucket === 'history' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}
+            >
+              Заявки за период
+            </button>
+          </div>
+          <ul className="text-xs text-slate-500">
+            {summarizeRequests(scheduleRequests.filter((row) => row.queueId === currentQueue?.id)).map((line) => (
+              <li key={line}>{line}</li>
+            ))}
+          </ul>
+        </div>
+      </section>
+
+      {requestRows.length === 0 ? (
+        renderEmptyState('По выбранным фильтрам заявок нет. Измените статус или период.')
+      ) : (
+        <ReportTable
+          columns={[
+            { id: 'employee', label: 'Сотрудник', width: '14rem' },
+            { id: 'team', label: 'Команда', width: '12rem' },
+            { id: 'category', label: 'Категория', width: '12rem' },
+            { id: 'type', label: 'Тип заявки', width: '12rem' },
+            { id: 'priority', label: 'Приоритет', width: '8rem' },
+            { id: 'status', label: 'Статус', width: '10rem' },
+            { id: 'period', label: 'Период', width: '14rem' },
+            { id: 'submittedAt', label: 'Подано', width: '10rem' },
+          ]}
+          rows={requestRows.map((row) => ({
+            id: row.id,
+            employee: row.employee,
+            team: row.team,
+            category: row.category,
+            type: row.type,
+            priority: row.priority,
+            status: row.status,
+            period: row.period,
+            submittedAt: row.submittedAt,
+          }))}
+          ariaTitle="Заявки расписания"
+          ariaDesc="Список заявок по выбранной очереди с фильтрами статуса"
+          onRowClick={(row) => setSelectedRequestId(String(row.id))}
+        />
+      )}
+
+      <Dialog
+        open={Boolean(selectedRequest)}
+        onClose={() => setSelectedRequestId(null)}
+        title={selectedRequest ? `Заявка · ${selectedRequest.employee}` : 'Заявка'}
+        description={selectedRequest ? `${selectedRequest.type} · ${selectedRequest.period}` : undefined}
+        footer={null}
+      >
+        {selectedRequest ? (
+          <div className="space-y-3 text-sm text-slate-600">
+            <p>
+              Статус: <span className="font-medium text-slate-900">{selectedRequest.status}</span>
+            </p>
+            <p>
+              Подано: <span className="font-medium text-slate-900">{selectedRequest.submittedAt}</span>
+            </p>
+            {selectedRequest.affectedShifts.length ? (
+              <div>
+                <h4 className="font-medium text-slate-900">Затронутые смены</h4>
+                <ul className="mt-1 space-y-1 text-slate-600">
+                  {selectedRequest.affectedShifts.map((shift) => (
+                    <li key={shift.id} className="rounded bg-slate-100 px-3 py-2 text-xs">
+                      {shift.label}
+                    </li>
+                  ))}
+                </ul>
+              </div>
+            ) : null}
+          </div>
+        ) : null}
+      </Dialog>
+    </div>
+  );
*** End Patch
PATCH
```

## Phase 3: Approvals Filters & History

### Overview
Align approvals filters with production by starting from the full request set, introducing status checkboxes, quick period presets, and a history toggle.

### Changes Required:

#### 1. Keep all requests in state and reshape filters
**File**: `src/pages/Approvals.tsx`
**Changes**: Store all requests, default filters to pending, replace status dropdown with checkbox set, add history toggle and presets.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-const buildInitialRequests = (teams: Team[]): RequestWithTeam[] =>
-  teams
-    .flatMap((team) => team.requests.map((request) => ({ ...request, teamName: team.name })))
-    .filter((request) => request.status === 'pending');
+const buildInitialRequests = (teams: Team[]): RequestWithTeam[] =>
+  teams.flatMap((team) => team.requests.map((request) => ({ ...request, teamName: team.name })));
@@
-  const [statusFilter, setStatusFilter] = useState<'all' | Request['status']>('all');
-  const [dateFilters, setDateFilters] = useState<{ start: string; end: string }>({ start: '', end: '' });
+  const [statusFilters, setStatusFilters] = useState<Array<Request['status']>>(['pending']);
+  const [historyMode, setHistoryMode] = useState<'current' | 'history'>('current');
+  const [dateFilters, setDateFilters] = useState<{ start: string; end: string }>({ start: '', end: '' });
@@
-  const filteredRequests = useMemo(() => {
-    return requests.filter((request) => {
-      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
-      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
-      const matchesView = viewFilter === 'all' || request.category === viewFilter;
-      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
-      const matchesStart = !dateFilters.start || request.startDate >= dateFilters.start;
-      const matchesEnd = !dateFilters.end || request.endDate <= dateFilters.end;
-      return matchesPriority && matchesCategory && matchesView && matchesStatus && matchesStart && matchesEnd;
-    });
-  }, [requests, priorityFilter, categoryFilter, viewFilter, statusFilter, dateFilters.end, dateFilters.start]);
+  const filteredRequests = useMemo(() => {
+    return requests.filter((request) => {
+      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
+      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
+      const matchesView = viewFilter === 'all' || request.category === viewFilter;
+      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(request.status);
+      const matchesHistory = historyMode === 'current' ? request.status === 'pending' : request.status !== 'pending';
+      const matchesStart = !dateFilters.start || request.startDate >= dateFilters.start;
+      const matchesEnd = !dateFilters.end || request.endDate <= dateFilters.end;
+      return matchesPriority && matchesCategory && matchesView && matchesStatus && matchesHistory && matchesStart && matchesEnd;
+    });
+  }, [requests, priorityFilter, categoryFilter, viewFilter, statusFilters, historyMode, dateFilters.end, dateFilters.start]);
@@
-  const pendingCount = requests.length;
+  const pendingCount = requests.filter((request) => request.status === 'pending').length;
@@
-        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
-          <label className="flex items-center gap-2">
-            <span>Статус</span>
-            <select
-              value={statusFilter}
-              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
-              className="rounded-lg border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
-            >
-              <option value="all">Все</option>
-              <option value="pending">На рассмотрении</option>
-              <option value="approved">Одобрено</option>
-              <option value="rejected">Отклонено</option>
-            </select>
-          </label>
-          <label className="flex items-center gap-2">
+        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
+          <div className="flex flex-wrap items-center gap-2">
+            {([
+              { id: 'pending', label: 'На рассмотрении' },
+              { id: 'approved', label: 'Одобрено' },
+              { id: 'rejected', label: 'Отклонено' },
+            ] as const).map((option) => (
+              <label key={option.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
+                <input
+                  type="checkbox"
+                  checked={statusFilters.includes(option.id)}
+                  onChange={() =>
+                    setStatusFilters((prev) =>
+                      prev.includes(option.id) ? prev.filter((status) => status !== option.id) : [...prev, option.id],
+                    )
+                  }
+                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
+                />
+                {option.label}
+              </label>
+            ))}
+          </div>
+          <button
+            type="button"
+            onClick={() => setHistoryMode((prev) => (prev === 'current' ? 'history' : 'current'))}
+            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
+              historyMode === 'history'
+                ? 'bg-primary-600 text-white'
+                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
+            }`}
+          >
+            {historyMode === 'history' ? 'Показать текущие' : 'Заявки за период'}
+          </button>
+          <label className="flex items-center gap-2">
             <span>С</span>
             <input
               type="date"
@@
       ) : (
         <ReportTable
*** End Patch
PATCH
```

#### 2. Update approvals tests for new filters
**File**: `src/pages/__tests__/Approvals.test.tsx`
**Changes**: Adjust expectations to new status checkboxes/history toggle.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/__tests__/Approvals.test.tsx
@@
-  it('filters by schedule change vs shift exchange tabs', () => {
+  it('filters by schedule change vs shift exchange tabs and status checkboxes', () => {
     render(<Approvals teams={teams} activeOrgUnit={null} />);
@@
-    const allTab = screen.getByRole('button', { name: 'Все заявки' });
-    fireEvent.click(allTab);
-    expect(screen.getByText('Анна Петрова')).toBeInTheDocument();
+    const allTab = screen.getByRole('button', { name: 'Все заявки' });
+    fireEvent.click(allTab);
+    expect(screen.getByText('Анна Петрова')).toBeInTheDocument();
+
+    const historyToggle = screen.getByRole('button', { name: 'Заявки за период' });
+    fireEvent.click(historyToggle);
+    const pendingCheckbox = screen.getByRole('checkbox', { name: 'На рассмотрении' });
+    fireEvent.click(pendingCheckbox);
+    expect(screen.queryByText('Анна Петрова')).not.toBeInTheDocument();
   });
 });
*** End Patch
PATCH
```

## Phase 4: Download Queue Lifecycle

### Overview
Implement pending → ready → acknowledged lifecycle with controls in both the header bell and reports grid.

### Changes Required:

#### 1. Expand queue context
**File**: `src/state/downloadQueue.tsx`
**Changes**: Track timestamps, expose `acknowledge`/`clear`, and update enqueue/markReady semantics.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/state/downloadQueue.tsx
@@
-type QueueStatus = 'pending' | 'ready';
+type QueueStatus = 'pending' | 'ready' | 'acknowledged';
@@
 export interface QueueEntry {
   id: string;
   exportId: ExportId;
   label: string;
   status: QueueStatus;
+  startedAt: string;
+  completedAt?: string;
 }
 
 interface DownloadQueueContextValue {
   queue: QueueEntry[];
   enqueue: (entry: QueueEntry) => void;
   markReady: (id: string) => void;
+  acknowledge: (id: string) => void;
+  clear: (id: string) => void;
 }
@@
-    enqueue(entry) {
-      setQueue((prev) => [...prev, entry]);
+    enqueue(entry) {
+      setQueue((prev) => [...prev, entry]);
     },
     markReady(id) {
-      setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'ready' } : item)));
+      setQueue((prev) =>
+        prev.map((item) => (item.id === id ? { ...item, status: 'ready', completedAt: new Date().toISOString() } : item)),
+      );
+    },
+    acknowledge(id) {
+      setQueue((prev) =>
+        prev.map((item) => (item.id === id ? { ...item, status: 'acknowledged' } : item)),
+      );
+    },
+    clear(id) {
+      setQueue((prev) => prev.filter((item) => item.id !== id));
     },
   }), [queue]);
*** End Patch
PATCH
```

#### 2. Update reports page to use lifecycle
**File**: `src/pages/Reports.tsx`
**Changes**: Add startedAt when enqueueing, call acknowledge before clearing, and keep button labels in sync.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Reports.tsx
@@
-import { useDownloadQueue } from '../state/downloadQueue';
+import { useDownloadQueue } from '../state/downloadQueue';
@@
-  const { enqueue, markReady } = useDownloadQueue();
+  const { enqueue, markReady, acknowledge, clear } = useDownloadQueue();
@@
-    enqueue({ id: queueId, exportId: entry.id, label: entry.label, status: 'pending' });
+    enqueue({ id: queueId, exportId: entry.id, label: entry.label, status: 'pending', startedAt: new Date().toISOString() });
     await triggerReportDownload(entry.id);
     markReady(queueId);
     setDownloadingId(null);
+    acknowledge(queueId);
+    setTimeout(() => clear(queueId), 60_000);
   };
*** End Patch
PATCH
```

#### 3. Render queue dropdown with status transitions
**File**: `src/components/Layout.tsx`
**Changes**: Show status labels, started/completed timestamps, and action buttons (Подтвердить/Удалить).

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-import { Users, Calendar, Bell, Settings, LogOut, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
+import { Users, Calendar, Bell, Settings, LogOut, BarChart3, Clock, CheckCircle2, Download as DownloadIcon, Trash2 } from 'lucide-react';
@@
-import { useDownloadQueue } from '../state/downloadQueue';
-import { dashboardEnabled, teamsEnabled } from '../config/features';
+import { useDownloadQueue } from '../state/downloadQueue';
+import { dashboardEnabled, teamsEnabled, settingsEnabled } from '../config/features';
@@
-  const { queue } = useDownloadQueue();
+  const { queue, acknowledge, clear } = useDownloadQueue();
@@
-  { name: 'Расписание', id: 'schedule', icon: Calendar },
-  { name: 'Отчёты', id: 'reports', icon: BarChart3 },
-  { name: 'Настройки', id: 'settings', icon: Settings },
+  { name: 'Расписание', id: 'schedule', icon: Calendar },
+  { name: 'Отчёты', id: 'reports', icon: BarChart3 },
+  ...(settingsEnabled ? ([{ name: 'Настройки', id: 'settings', icon: Settings }] as const) : []),
@@
-                {showQueue && queue.length ? (
-                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
-                    <p className="mb-2 text-xs font-semibold text-slate-500">Скачивания отчётов</p>
-                    <ul className="space-y-1 text-sm text-slate-600">
-                      {queue.map((item) => (
-                        <li key={item.id} className="flex items-center gap-2">
-                          <CheckCircle2
-                            className={`h-4 w-4 ${item.status === 'ready' ? 'text-emerald-500' : 'text-slate-300'}`}
-                          />
-                          <span>{item.label}</span>
-                        </li>
-                      ))}
-                    </ul>
-                  </div>
-                ) : null}
+                {showQueue && queue.length ? (
+                  <div className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
+                    <p className="mb-2 text-xs font-semibold text-slate-500">Скачивания отчётов</p>
+                    <ul className="space-y-2 text-sm text-slate-600">
+                      {queue.map((item) => (
+                        <li key={item.id} className="rounded border border-slate-200 p-2">
+                          <div className="flex items-center justify-between gap-2">
+                            <div className="flex items-center gap-2">
+                              <CheckCircle2
+                                className={`h-4 w-4 ${
+                                  item.status === 'ready' || item.status === 'acknowledged'
+                                    ? 'text-emerald-500'
+                                    : 'text-amber-500'
+                                }`}
+                              />
+                              <span className="font-medium text-slate-900">{item.label}</span>
+                            </div>
+                            <div className="flex items-center gap-1">
+                              {item.status === 'pending' ? (
+                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Готовим…</span>
+                              ) : null}
+                              {item.status === 'ready' ? (
+                                <button
+                                  type="button"
+                                  className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-1 text-[10px] font-semibold text-white"
+                                  onClick={() => acknowledge(item.id)}
+                                >
+                                  <DownloadIcon className="h-3 w-3" /> Подтвердить
+                                </button>
+                              ) : null}
+                              {item.status === 'acknowledged' ? (
+                                <button
+                                  type="button"
+                                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900"
+                                  onClick={() => clear(item.id)}
+                                >
+                                  <Trash2 className="h-3 w-3" /> Удалить
+                                </button>
+                              ) : null}
+                            </div>
+                          </div>
+                          <div className="mt-1 text-[11px] text-slate-500">
+                            Запрошено: {new Date(item.startedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
+                            {item.completedAt
+                              ? ` · Готово: ${new Date(item.completedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
+                              : null}
+                          </div>
+                        </li>
+                      ))}
+                    </ul>
+                  </div>
+                ) : null}
               </div>
             </div>
*** End Patch
PATCH
```

## Phase 5: Settings Localisation & Feature Flags

### Overview
Localise the Settings page and gate it under a feature flag so parity builds match production navigation.

### Changes Required:

#### 1. Expose settings feature flag
**File**: `src/config/features.ts`
**Changes**: Export `settingsEnabled` (default off) so Layout can gate navigation.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/config/features.ts
@@
 export const dashboardEnabled = env?.VITE_MANAGER_PORTAL_DASHBOARD === 'on';
 export const teamsEnabled = env?.VITE_MANAGER_PORTAL_TEAMS === 'on';
 export const settingsEnabled = env?.VITE_MANAGER_PORTAL_SETTINGS === 'on';
*** End Patch
PATCH
```

#### 2. Translate Settings copy
**File**: `src/pages/Settings.tsx`
**Changes**: Replace placeholder English copy with approved RU terms noted in localisation backlog.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Settings.tsx
@@
-      <div className="card p-8 text-center">
-        <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
-        <h2 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h2>
-        <p className="text-gray-600 mb-4">
-          Configuration and preferences panel
-        </p>
+      <div className="card p-8 text-center">
+        <SettingsIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
+        <h2 className="mb-2 text-xl font-semibold text-gray-900">Настройки системы</h2>
+        <p className="mb-4 text-gray-600">Раздел для управления профилем, уведомлениями и правами доступа.</p>
         <div className="max-w-md mx-auto space-y-3 text-left">
           <div className="flex items-center text-sm text-gray-600">
-            <User className="h-4 w-4 mr-2 text-blue-600" />
-            User profile and preferences
+            <User className="mr-2 h-4 w-4 text-blue-600" />
+            Профиль пользователя и предпочтения
           </div>
           <div className="flex items-center text-sm text-gray-600">
-            <Bell className="h-4 w-4 mr-2 text-green-600" />
-            Notification settings
+            <Bell className="mr-2 h-4 w-4 text-green-600" />
+            Настройки уведомлений
           </div>
           <div className="flex items-center text-sm text-gray-600">
-            <Shield className="h-4 w-4 mr-2 text-purple-600" />
-            Security and access controls
+            <Shield className="mr-2 h-4 w-4 text-purple-600" />
+            Безопасность и контроль доступа
           </div>
         </div>
       </div>
*** End Patch
PATCH
```

#### 3. Document feature flag usage
- `.env.example` (if present): add `VITE_MANAGER_PORTAL_SETTINGS=on` commented example.
- `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md`: mark Settings strings resolved and note flag default off.

## Phase 6: Documentation & UAT Prep

### Overview
Record the changes across coordinator docs, localisation backlog, parity checklists, and handoff materials.

### Changes Required:

#### 1. Coordinator updates
- `docs/Workspace/Coordinator/manager-portal/CodeMap.md`: add schedule requests tab implementation details (new adapter, filters, dialog), approvals filter updates, download queue lifecycle.
- `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`: move MP‑SCH‑REQ/MP‑APR‑FILTERS/MP‑REP‑QUEUE statuses to **Pass** with file references.
- `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md`: mark settings copy as translated and note feature flag guard.

#### 2. System docs & reports
- Update `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, and `docs/System/APPENDIX1_SCOPE_CROSSWALK.md` with new parity status and adapter references.
- Mirror checklist changes in `docs/Reports/PARITY_MVP_CHECKLISTS.md`.

#### 3. UAT assets
- Refresh Manager Portal sections in `docs/Tasks/uat-packs/parity_static.md` and `docs/Tasks/uat-packs/trimmed_smoke.md` to cover schedule requests, approvals history, and download queue confirmations.
- Update `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` with new evidence (MP rows).
- Capture RU screenshots for schedule requests table & download queue, register aliases in `docs/SCREENSHOT_INDEX.md`.

#### 4. Handoff & tracker
- Append detailed entry to `docs/SESSION_HANDOFF.md` summarising execution/test/deploy.
- Update Manager Portal row in `docs/Tasks/post-phase9-demo-execution.md` (status → Completed – Executor, with deploy URL & next check-in).
- Note plan adoption in `PROGRESS.md` if required by SOP.

## Tests & Validation
- `npm run test -- --run --test-timeout=2000`
- `npm run build`
- `npm run preview -- --host 127.0.0.1 --port 4174` (manual smoke: schedule requests filters, approvals history toggle, download bell actions)
- After deploy: run Manager Portal sections of `docs/Tasks/uat-packs/parity_static.md` and `trimmed_smoke.md`, attach RU screenshots, update consolidated UAT log.

## Rollback
- Revert code changes via `git checkout -- src/components/schedule/ScheduleTabs.tsx src/pages/Schedule.tsx src/adapters/scheduleRequests.ts src/adapters/scheduleRequests.test.ts src/pages/Approvals.tsx src/pages/__tests__/Approvals.test.tsx src/state/downloadQueue.tsx src/pages/Reports.tsx src/components/Layout.tsx src/pages/Settings.tsx`.
- Remove generated adapter/test files if necessary.
- Restore documentation updates with `git checkout -- docs/`.
- Redeploy previous build if the new deploy introduces regressions.

## Handoff
- Save this plan (`plans/2025-11-01_manager-portal-parity-followup.plan.md`).
- Log completion in `docs/SESSION_HANDOFF.md` with next steps for executor (follow plan, run tests/build/preview, update docs/UAT, deploy via Vercel CLI).
- Mention plan filename and validation commands in the handoff entry and update the Manager Portal tracker row accordingly.
