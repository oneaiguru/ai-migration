# Plan — Manager Portal Parity Follow-up (Schedule Requests · Approvals Filters · Download Queue · Localisation)

## Metadata
- Task: docs/Tasks/manager-portal_parity-followup-2025-11-01.task.md
- Planner: manager-portal-plan-2025-11-02-codex
- Source scout: docs/Tasks/manager-portal_parity-followup-2025-11-01-scout-manager-portal-scout-2025-11-01-codex.task.md
- Additional references: docs/System/manager-portal_illustrated-guide.md, uat-agent-tasks/manager-portal_illustrated-walkthrough.md, /Users/m/Desktop/k/k.md, docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md}, CH5_Schedule_Advanced.md §§5.2–5.6, CH6_Reports.md §§6.1–6.3
- Target repo: ${MANAGER_PORTAL_REPO}
- Supersedes: plans/2025-11-01_manager-portal-parity-followup.plan.md (archive the older draft after execution)

## Desired End State
The Manager Portal demo matches production behaviour for request management and export notifications. The Schedule → «Заявки» tab renders queue-aware tables with CH5 history presets, shift chips, and RU summaries backed by adapter tests. Approvals filters expose preset ranges and breadcrumbs identical to production, with extended vitest coverage. The download queue persists pending/ready entries until acknowledgement, includes confirm modal + expiry copy, and is fully localised. Settings copy, shift badges, and bell text are RU-only, and feature flags keep Settings hidden unless explicitly enabled. `npm_config_workspaces=false npm run test -- --run --test-timeout=2000` and `npm_config_workspaces=false npm run build` pass, preview smoke succeeds, and Manager Portal sections of `parity_static.md` + `trimmed_smoke.md` record Pass with refreshed RU screenshots. Coordinator docs, parity checklists, localisation backlog, consolidated UAT sweep, SESSION_HANDOFF, and tracker are updated.

### Key Discoveries
- Schedule requests tab still ships a placeholder on deploy; component logic at `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:169-278` lacks CH5 history presets and date-scoped filtering, and adapter output is not constrained by queue/date (CH5_Schedule_Advanced.md:157-176, `/Users/m/Desktop/k/k.md:7-38`).
- Approvals filters in `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:214-333` only provide manual date pickers and chip filters, missing production-style presets/breadcrumbs documented in CH5 (§§5.4) and highlighted in `/Users/m/Desktop/k/k.md:39-70`.
- Download queue lifecycle defined in `${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:1-43`, `${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-74`, and `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:148-215` clears entries immediately after enqueue; CH6 (§6.1–§6.3) and screenshot `manager-real-bell-queue.png` require pending → ready → acknowledge flow with confirm modal and expiry notice.
- Localisation regressions remain: shift badges pull raw enums in `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:137-144`, bell copy lacks expiry string (`Layout.tsx:203-210`), and Settings nav visibility conflicts with production (CH2_Login_System.md §2.2, `/Users/m/Desktop/k/k.md:97-120`).
- Tests do not cover new presets or queue lifecycle (`src/adapters/scheduleRequests.test.ts`, `src/pages/__tests__/Approvals.test.tsx`); additional unit coverage is required to lock behaviour.

## What We're NOT Doing
- No backend or API integration—mock data only.
- No redesign of dashboard/teams extras; keep existing feature flags untouched besides Settings gating.
- No new Playwright specs this pass (manual RU screenshots via UAT packs only).
- No changes to other demos (analytics, employee, forecasting) beyond shared document updates.

## Implementation Approach
Extend the schedule request adapter to deliver queue-scoped rows and date-bounded history helpers, then update ScheduleTabs to consume presets, filter modes, and shift chips with RU summary text. Rework Approvals filters to include CH5 presets and breadcrumbs while aligning history toggles with mocked audit data. Expand the download queue context to persist state transitions with confirm modal/expiry metadata and reuse it in Reports and Layout. Clean up localisation by enforcing RU strings for shifts, exports, bell copy, and Settings, and default Settings behind a feature flag. Finish with targeted vitest updates, build/tests/preview runs, deploy, UAT packs, and coordinated documentation updates.

## Phase 1: Schedule Requests Tab Parity

### Overview
Deliver the CH5 queue-aware «Заявки» tab: adapter helpers for date buckets, preset controls, RU summaries, and vitest coverage.

### Changes Required:

#### 1. Extend schedule request adapter for presets and range filtering
**File**: `src/adapters/scheduleRequests.ts`
**Changes**: Export history preset type/helpers, include queue name, and add filter utilities.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/scheduleRequests.ts
@@
-import { mapCategory, mapPriority, mapRequestType, mapStatus } from './approvals';
-import type { OrgQueue, Request, ScheduleDay, Team } from '../data/mockData';
+import { mapCategory, mapPriority, mapRequestType, mapStatus } from './approvals';
+import type { OrgQueue, Request, ScheduleDay, Team } from '../data/mockData';
+
+export type ScheduleRequestHistoryPreset = 'last7' | 'currentMonth' | 'custom';
+
+export const historyPresetLabels: Record<ScheduleRequestHistoryPreset, string> = {
+  last7: 'Последние 7 дней',
+  currentMonth: 'Текущий месяц',
+  custom: 'Выбранный период',
+};
+
+export const getHistoryPresetRange = (
+  preset: ScheduleRequestHistoryPreset,
+  baseDate: Date = new Date(),
+): { start: string; end: string } => {
+  const end = new Date(baseDate);
+  end.setHours(23, 59, 59, 999);
+  if (preset === 'last7') {
+    const start = new Date(end);
+    start.setDate(start.getDate() - 6);
+    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
+  }
+  if (preset === 'currentMonth') {
+    const start = new Date(end.getFullYear(), end.getMonth(), 1);
+    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
+  }
+  return { start: '', end: '' };
+};
@@
 export interface ScheduleRequestRow {
   id: string;
   queueId: string;
+  queueName: string;
   bucket: ScheduleRequestBucket;
   employee: string;
@@
 const formatTimeRange = (start: string, end: string) => {
   const formatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
   return `${formatter.format(new Date(start))} — ${formatter.format(new Date(end))}`;
 };
 
-const isWithinRange = (value: string, range: { start: string; end: string }) => {
+const isWithinRange = (value: string, range: { start: string; end: string }) => {
   if (!range.start && !range.end) {
     return true;
   }
   const target = new Date(value).getTime();
@@
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
       const bucket: ScheduleRequestBucket = request.status === 'pending' && isWithinRange(request.startDate, dateRange)
         ? 'current'
         : 'history';
       const affectedShifts = (request.affectedShifts ?? [])
@@
       return {
         id: request.id,
         queueId,
+        queueName: team.name,
         bucket,
         employee: request.employeeName,
@@
 export const summarizeRequests = (rows: ScheduleRequestRow[]) => {
   const byStatus = new Map<Request['status'], number>();
   rows.forEach((row) => {
     byStatus.set(row.statusRaw, (byStatus.get(row.statusRaw) ?? 0) + 1);
   });
   return Array.from(byStatus.entries()).map(([status, count]) => `${mapStatus(status)} — ${count}`);
 };
+
+export const filterRequestsByRange = (rows: ScheduleRequestRow[], range: { start: string; end: string }) =>
+  rows.filter((row) =>
+    isWithinRange(row.startDate, range) || isWithinRange(row.endDate, range) || isWithinRange(row.submittedAt, range),
+  );
+
+export const formatHistoryBreadcrumb = (
+  preset: ScheduleRequestHistoryPreset,
+  range: { start: string; end: string },
+) => {
+  if (preset === 'custom' && !range.start && !range.end) {
+    return 'Период не выбран';
+  }
+  const formatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
+  const start = range.start ? formatter.format(new Date(range.start)) : '—';
+  const end = range.end ? formatter.format(new Date(range.end)) : '—';
+  return `${historyPresetLabels[preset]} · ${start} — ${end}`;
+};
*** End Patch
PATCH
```

#### 2. Update adapter tests for presets and filtering
**File**: `src/adapters/scheduleRequests.test.ts`
**Changes**: Cover preset helper and range filtering behaviour.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/scheduleRequests.test.ts
@@
-import { buildScheduleRequestRows } from './scheduleRequests';
+import {
+  buildScheduleRequestRows,
+  filterRequestsByRange,
+  formatHistoryBreadcrumb,
+  getHistoryPresetRange,
+  historyPresetLabels,
+} from './scheduleRequests';
@@
   const rows = buildScheduleRequestRows({
     teams: mockTeams,
     scheduleDays,
     queueByOrgUnit,
     dateRange,
   });
@@
   it('formats affected shifts when metadata is available', () => {
     const swapRow = rows.find((row) => row.id === 'req5');
     expect(swapRow?.affectedShifts?.length).toBeGreaterThan(0);
     if (swapRow?.affectedShifts?.[0]) {
       expect(swapRow.affectedShifts[0].label).toContain('·');
     }
   });
+
+  it('filters history rows by preset range', () => {
+    const last7 = getHistoryPresetRange('last7', new Date('2024-12-16'));
+    const filtered = filterRequestsByRange(rows, last7);
+    expect(filtered.every((row) => row.bucket === 'current' || row.submittedAt >= last7.start)).toBe(true);
+    expect(formatHistoryBreadcrumb('last7', last7)).toContain(historyPresetLabels.last7);
+  });
 });
*** End Patch
PATCH
```

#### 3. Wire presets and RU summaries into Schedule Tabs
**File**: `src/components/schedule/ScheduleTabs.tsx`
**Changes**: Consume history helpers, add preset buttons, RU breadcrumb, and ensure shift badges/localisation map is applied.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/schedule/ScheduleTabs.tsx
@@
-import type { ScheduleRequestRow } from '../../adapters/scheduleRequests';
-import { summarizeRequests } from '../../adapters/scheduleRequests';
+import type { ScheduleRequestRow } from '../../adapters/scheduleRequests';
+import {
+  ScheduleRequestHistoryPreset,
+  filterRequestsByRange,
+  formatHistoryBreadcrumb,
+  getHistoryPresetRange,
+  historyPresetLabels,
+  summarizeRequests,
+} from '../../adapters/scheduleRequests';
@@
-export default function ScheduleTabs({ queues, scheduleDays, scheduleRequests, activeQueueId }: ScheduleTabsProps) {
+export default function ScheduleTabs({
+  queues,
+  scheduleDays,
+  scheduleRequests,
+  activeQueueId,
+  dateRange,
+}: ScheduleTabsProps) {
   const [activeTab, setActiveTab] = useState<ScheduleTabId>('graph');
   const [requestBucket, setRequestBucket] = useState<'current' | 'history'>('current');
+  const [historyPreset, setHistoryPreset] = useState<ScheduleRequestHistoryPreset>('last7');
+  const [historyRange, setHistoryRange] = useState<{ start: string; end: string }>(() => getHistoryPresetRange('last7'));
   const [requestStatusFilter, setRequestStatusFilter] = useState<Array<'pending' | 'approved' | 'rejected'>>(['pending']);
   const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
@@
-  const requestRows = useMemo(() => {
-    const rows = scheduleRequests.filter((row) => row.queueId === currentQueue?.id && row.bucket === requestBucket);
+  const requestRows = useMemo(() => {
+    let rows = scheduleRequests.filter((row) => row.queueId === currentQueue?.id && row.bucket === requestBucket);
+    if (requestBucket === 'history') {
+      rows = filterRequestsByRange(rows, historyRange);
+    }
     if (requestStatusFilter.length === 0 || requestStatusFilter.length === 3) {
       return rows;
     }
     return rows.filter((row) => requestStatusFilter.includes(row.statusRaw));
-  }, [scheduleRequests, currentQueue, requestBucket, requestStatusFilter]);
+  }, [scheduleRequests, currentQueue, requestBucket, requestStatusFilter, historyRange]);
+
+  useEffect(() => {
+    if (requestBucket === 'current') {
+      setHistoryPreset('last7');
+      setHistoryRange(getHistoryPresetRange('last7'));
+    }
+  }, [requestBucket]);
@@
-  const toggleStatusFilter = (status: 'pending' | 'approved' | 'rejected') => {
+  const toggleStatusFilter = (status: 'pending' | 'approved' | 'rejected') => {
     setRequestStatusFilter((prev) => {
       if (prev.includes(status)) {
         return prev.filter((item) => item !== status);
       }
       return [...prev, status];
     });
   };
+
+  const applyHistoryPreset = (preset: ScheduleRequestHistoryPreset) => {
+    setHistoryPreset(preset);
+    setHistoryRange(getHistoryPresetRange(preset));
+  };
@@
-          <div className="flex items-center gap-2 text-sm">
-            <button
-              type="button"
-              onClick={() => setRequestBucket('current')}
-              className={`rounded-full px-3 py-1 ${
-                requestBucket === 'current' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
-              }`}
-            >
-              Текущие заявки
-            </button>
-            <button
-              type="button"
-              onClick={() => setRequestBucket('history')}
-              className={`rounded-full px-3 py-1 ${
-                requestBucket === 'history' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
-              }`}
-            >
-              Заявки за период
-            </button>
-          </div>
+          <div className="flex flex-wrap items-center gap-2 text-sm">
+            <button
+              type="button"
+              onClick={() => setRequestBucket('current')}
+              className={`rounded-full px-3 py-1 ${
+                requestBucket === 'current' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
+              }`}
+            >
+              Текущие заявки
+            </button>
+            <button
+              type="button"
+              onClick={() => setRequestBucket('history')}
+              className={`rounded-full px-3 py-1 ${
+                requestBucket === 'history' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
+              }`}
+            >
+              Заявки за период
+            </button>
+            {requestBucket === 'history' ? (
+              <>
+                {(['last7', 'currentMonth'] as const).map((preset) => (
+                  <button
+                    key={preset}
+                    type="button"
+                    onClick={() => applyHistoryPreset(preset)}
+                    className={`rounded-full px-3 py-1 text-xs ${
+                      historyPreset === preset
+                        ? 'bg-slate-900 text-white'
+                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
+                    }`}
+                  >
+                    {historyPresetLabels[preset]}
+                  </button>
+                ))}
+                <span className="text-xs text-slate-500">
+                  {formatHistoryBreadcrumb(historyPreset, historyRange)}
+                </span>
+              </>
+            ) : null}
+          </div>
@@
-          <ul className="text-xs text-slate-500">
-            {summarizeRequests(scheduleRequests.filter((row) => row.queueId === currentQueue?.id)).map((line) => (
+          <ul className="text-xs text-slate-500">
+            {summarizeRequests(
+              scheduleRequests.filter((row) => row.queueId === currentQueue?.id && row.bucket === requestBucket),
+            ).map((line) => (
               <li key={line}>{line}</li>
             ))}
           </ul>
         </div>
       </section>
+
+      {requestBucket === 'history' ? (
+        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
+          <label className="inline-flex items-center gap-1">
+            <span>С</span>
+            <input
+              type="date"
+              value={historyRange.start}
+              onChange={(event) => {
+                setHistoryPreset('custom');
+                setHistoryRange((prev) => ({ ...prev, start: event.target.value }));
+              }}
+              className="rounded border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
+            />
+          </label>
+          <label className="inline-flex items-center gap-1">
+            <span>По</span>
+            <input
+              type="date"
+              value={historyRange.end}
+              onChange={(event) => {
+                setHistoryPreset('custom');
+                setHistoryRange((prev) => ({ ...prev, end: event.target.value }));
+              }}
+              className="rounded border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
+            />
+          </label>
+          <button
+            type="button"
+            onClick={() => applyHistoryPreset('last7')}
+            className="text-primary-600 hover:underline"
+          >
+            Сбросить период
+          </button>
+        </div>
+      ) : null}
@@
-          rows={slots.map((slot) => ({
+          rows={slots.map((slot) => ({
             id: slot.id,
             employee: slot.employeeName,
             date: new Date(slot.start).toLocaleDateString('ru-RU'),
             start: new Date(slot.start).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
             end: new Date(slot.end).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
             status: getSlotStatus(slot.status),
           }))}
*** End Patch
PATCH
```

#### 4. Pass schedule date range into ScheduleTabs
**File**: `src/pages/Schedule.tsx`
**Changes**: Forward `dateRange` and memoise scheduleRequests when queue/date changes.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Schedule.tsx
@@
-  const scheduleRequests = useMemo(
-    () =>
-      buildScheduleRequestRows({
-        teams: mockTeams,
-        scheduleDays,
-        queueByOrgUnit,
-        dateRange,
-      }),
-    [dateRange],
-  );
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
           <ScheduleTabs
             queues={orgQueues}
             scheduleDays={scheduleDays}
             scheduleRequests={scheduleRequests}
             activeQueueId={activeQueueId}
+            dateRange={dateRange}
           />
         </div>
       </section>
*** End Patch
PATCH
```

#### 5. (Optional) Seed queue map for remaining teams if missing
**File**: `src/data/mockData.ts`
**Changes**: Ensure every `orgUnitId` used by `mockTeams` maps to a queue to avoid undefined rows.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
 export const queueByOrgUnit: Record<string, OrgQueue['id']> = {
   support: 'queue-support',
   operations: 'queue-support',
   sales: 'queue-sales',
   night: 'queue-support-night',
   onboarding: 'queue-support',
   hr: 'queue-support',
   training: 'queue-support',
+  analytics: 'queue-sales',
+  quality: 'queue-support',
   root: 'queue-support',
 };
*** End Patch
PATCH
```

## Phase 2: Approvals Filters & History Parity

### Overview
Align the Approvals module with CH5: preset buttons, breadcrumb, mock history, and vitest coverage.

### Changes Required:

#### 1. Add presets and breadcrumb to Approvals UI
**File**: `src/pages/Approvals.tsx`
**Changes**: Introduce history preset state, buttons, breadcrumb, and convert manual inputs to preset-aware behaviour.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-import { mapCategory, mapPriority } from '../adapters/approvals';
+import { mapCategory, mapPriority } from '../adapters/approvals';
+import {
+  ScheduleRequestHistoryPreset,
+  formatHistoryBreadcrumb,
+  getHistoryPresetRange,
+  historyPresetLabels,
+} from '../adapters/scheduleRequests';
@@
   const [historyMode, setHistoryMode] = useState<'current' | 'history'>('current');
   const [dateFilters, setDateFilters] = useState<{ start: string; end: string }>({ start: '', end: '' });
+  const [historyPreset, setHistoryPreset] = useState<ScheduleRequestHistoryPreset>('last7');
@@
-          <button
-            type="button"
-            onClick={() => setHistoryMode((prev) => (prev === 'current' ? 'history' : 'current'))}
-            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
-              historyMode === 'history'
-                ? 'bg-primary-600 text-white'
-                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
-            }`}
-          >
-            {historyMode === 'history' ? 'Показать текущие' : 'Заявки за период'}
-          </button>
+          <button
+            type="button"
+            onClick={() => {
+              const nextMode = historyMode === 'current' ? 'history' : 'current';
+              setHistoryMode(nextMode);
+              if (nextMode === 'history') {
+                const range = getHistoryPresetRange('last7');
+                setHistoryPreset('last7');
+                setDateFilters(range);
+              } else {
+                setHistoryPreset('last7');
+                setDateFilters({ start: '', end: '' });
+              }
+            }}
+            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
+              historyMode === 'history'
+                ? 'bg-primary-600 text-white'
+                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
+            }`}
+          >
+            {historyMode === 'history' ? 'Показать текущие' : 'Заявки за период'}
+          </button>
@@
-          <label className="flex items-center gap-2">
-            <span>С</span>
-            <input
-              type="date"
-              value={dateFilters.start}
-              onChange={(event) => setDateFilters((prev) => ({ ...prev, start: event.target.value }))}
-              className="rounded-lg border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
-            />
-          </label>
-          <label className="flex items-center gap-2">
-            <span>По</span>
-            <input
-              type="date"
-              value={dateFilters.end}
-              onChange={(event) => setDateFilters((prev) => ({ ...prev, end: event.target.value }))}
-              className="rounded-lg border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
-            />
-          </label>
-          <button
-            type="button"
-            onClick={() => setDateFilters({ start: '', end: '' })}
-            className="text-xs font-medium text-primary-600 hover:underline"
-          >
-            Сбросить даты
-          </button>
+          {historyMode === 'history' ? (
+            <>
+              {(['last7', 'currentMonth'] as const).map((preset) => (
+                <button
+                  key={preset}
+                  type="button"
+                  onClick={() => {
+                    setHistoryPreset(preset);
+                    setDateFilters(getHistoryPresetRange(preset));
+                  }}
+                  className={`rounded-full px-3 py-1 text-xs ${
+                    historyPreset === preset
+                      ? 'bg-slate-900 text-white'
+                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
+                  }`}
+                >
+                  {historyPresetLabels[preset]}
+                </button>
+              ))}
+              <span className="text-xs text-slate-500">
+                {formatHistoryBreadcrumb(historyPreset, dateFilters)}
+              </span>
+              <label className="flex items-center gap-2">
+                <span>С</span>
+                <input
+                  type="date"
+                  value={dateFilters.start}
+                  onChange={(event) => {
+                    setHistoryPreset('custom');
+                    setDateFilters((prev) => ({ ...prev, start: event.target.value }));
+                  }}
+                  className="rounded-lg border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
+                />
+              </label>
+              <label className="flex items-center gap-2">
+                <span>По</span>
+                <input
+                  type="date"
+                  value={dateFilters.end}
+                  onChange={(event) => {
+                    setHistoryPreset('custom');
+                    setDateFilters((prev) => ({ ...prev, end: event.target.value }));
+                  }}
+                  className="rounded-lg border border-slate-200 px-2 py-1 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-200"
+                />
+              </label>
+              <button
+                type="button"
+                onClick={() => {
+                  setHistoryPreset('last7');
+                  setDateFilters(getHistoryPresetRange('last7'));
+                }}
+                className="text-xs font-medium text-primary-600 hover:underline"
+              >
+                Сбросить даты
+              </button>
+            </>
+          ) : null}
*** End Patch
PATCH
```

#### 2. Expand approvals vitest coverage
**File**: `src/pages/__tests__/Approvals.test.tsx`
**Changes**: Add test ensuring presets drive history mode/date filtering.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/__tests__/Approvals.test.tsx
@@
   it('filters by schedule change vs shift exchange tabs and status checkboxes', () => {
     render(<Approvals teams={teams} activeOrgUnit={null} />);
@@
     expect(screen.queryByText('Анна Петрова')).not.toBeInTheDocument();
   });
+
+  it('applies history presets and breadcrumb copy', () => {
+    render(<Approvals teams={teams} activeOrgUnit={null} />);
+
+    const historyToggle = screen.getByRole('button', { name: 'Заявки за период' });
+    fireEvent.click(historyToggle);
+    const presetButton = screen.getByRole('button', { name: 'Последние 7 дней' });
+    fireEvent.click(presetButton);
+
+    expect(screen.getByText(/Последние 7 дней/)).toBeInTheDocument();
+    const startInput = screen.getByLabelText('С');
+    fireEvent.change(startInput, { target: { value: '2024-12-01' } });
+    expect(screen.getByText(/Выбранный период/)).toBeInTheDocument();
+  });
*** End Patch
PATCH
```

#### 3. Ensure mock history supports presets
**File**: `src/data/mockData.ts`
**Changes**: Add historical request entries for approvals tests and UAT.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
     requests: [
       {
         id: 'req1',
         employeeId: '1',
         employeeName: 'Анна Петрова',
@@
         history: [
           { timestamp: '2024-12-01T09:12:00+03:00', actor: 'Анна Петрова', action: 'submitted' }
         ]
       },
       {
@@
         history: [
           { timestamp: '2024-12-09T08:40:00+03:00', actor: 'Елена Козлова', action: 'submitted' },
           { timestamp: '2024-12-09T09:05:00+03:00', actor: 'Анна Менеджер', action: 'commented', note: 'Приложите справку' }
         ]
-      }
+      },
+      {
+        id: 'req1-history',
+        employeeId: '2',
+        employeeName: 'Игорь Волков',
+        type: 'shift_swap',
+        startDate: '2024-11-05',
+        endDate: '2024-11-05',
+        status: 'approved',
+        reason: 'Обмен сменой с коллегой',
+        priority: 'low',
+        submittedAt: '2024-11-01',
+        category: 'shift_exchange',
+        bulkEligible: false,
+        affectedShifts: ['slot-igor-2024-12-15'],
+        history: [
+          { timestamp: '2024-11-01T08:15:00+03:00', actor: 'Игорь Волков', action: 'submitted' },
+          { timestamp: '2024-11-02T10:05:00+03:00', actor: 'Анна Менеджер', action: 'approved' }
+        ]
+      }
     ]
   },
*** End Patch
PATCH
```

## Phase 3: Download Queue Lifecycle & Confirm Modal

### Overview
Persist queue entries through pending → ready → acknowledgement, add confirm modal, expiry copy, and tests.

### Changes Required:

#### 1. Extend download queue context with expiry handling
**File**: `src/state/downloadQueue.tsx`
**Changes**: Track `expiresAt`, expose helpers to mark acknowledgement/expiry, and prune stale entries.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/state/downloadQueue.tsx
@@
-type QueueStatus = 'pending' | 'ready' | 'acknowledged';
+type QueueStatus = 'pending' | 'ready' | 'acknowledged';
 
 export interface QueueEntry {
   id: string;
   exportId: ExportId;
   label: string;
   status: QueueStatus;
   startedAt: string;
   completedAt?: string;
+  expiresAt?: string;
 }
 
 interface DownloadQueueContextValue {
   queue: QueueEntry[];
   enqueue: (entry: QueueEntry) => void;
   markReady: (id: string, completedAt?: string) => void;
   acknowledge: (id: string) => void;
   clear: (id: string) => void;
+  expire: (now?: Date) => void;
 }
@@
-export function DownloadQueueProvider({ children }: { children: React.ReactNode }) {
-  const [queue, setQueue] = useState<QueueEntry[]>([]);
+export function DownloadQueueProvider({ children }: { children: React.ReactNode }) {
+  const [queue, setQueue] = useState<QueueEntry[]>([]);
 
   const value = useMemo<DownloadQueueContextValue>(() => ({
     queue,
     enqueue(entry) {
       setQueue((prev) => [...prev, entry]);
     },
-    markReady(id) {
+    markReady(id, completedAt = new Date().toISOString()) {
       setQueue((prev) =>
-        prev.map((item) => (item.id === id ? { ...item, status: 'ready', completedAt: new Date().toISOString() } : item)),
+        prev.map((item) =>
+          item.id === id ? { ...item, status: 'ready', completedAt, expiresAt: getExpiryTimestamp(completedAt) } : item,
+        ),
       );
     },
     acknowledge(id) {
       setQueue((prev) =>
-        prev.map((item) => (item.id === id ? { ...item, status: 'acknowledged' } : item)),
+        prev.map((item) => (item.id === id ? { ...item, status: 'acknowledged' } : item)),
       );
     },
     clear(id) {
       setQueue((prev) => prev.filter((item) => item.id !== id));
     },
+    expire(now = new Date()) {
+      const timestamp = now.getTime();
+      setQueue((prev) => prev.filter((item) => !item.expiresAt || new Date(item.expiresAt).getTime() > timestamp));
+    },
   }), [queue]);
 
   return <DownloadQueueContext.Provider value={value}>{children}</DownloadQueueContext.Provider>;
 }
+
+function getExpiryTimestamp(completedAt: string) {
+  const completed = new Date(completedAt);
+  const expiry = new Date(completed);
+  expiry.setHours(23, 59, 59, 999);
+  return expiry.toISOString();
+}
*** End Patch
PATCH
```

#### 2. Add queue lifecycle tests
**File**: `src/state/downloadQueue.test.ts`
**Changes**: New vitest file covering enqueue, ready, acknowledgement, and expiry.

```bash
cat <<'PATCH' > src/state/downloadQueue.test.ts
import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DownloadQueueProvider, useDownloadQueue } from './downloadQueue';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DownloadQueueProvider>{children}</DownloadQueueProvider>
);

describe('DownloadQueueProvider', () => {
  it('supports pending → ready → acknowledged → cleared lifecycle', () => {
    const { result } = renderHook(() => useDownloadQueue(), { wrapper });

    act(() => {
      result.current.enqueue({
        id: 'test',
        exportId: 't13',
        label: 'Т-13',
        status: 'pending',
        startedAt: '2024-12-01T09:00:00+03:00',
      });
    });
    expect(result.current.queue[0].status).toBe('pending');

    act(() => {
      result.current.markReady('test', '2024-12-01T09:01:00+03:00');
    });
    expect(result.current.queue[0].status).toBe('ready');
    expect(result.current.queue[0].expiresAt).toBeDefined();

    act(() => {
      result.current.acknowledge('test');
    });
    expect(result.current.queue[0].status).toBe('acknowledged');

    act(() => {
      result.current.clear('test');
    });
    expect(result.current.queue).toHaveLength(0);
  });

  it('drops expired entries', () => {
    const { result } = renderHook(() => useDownloadQueue(), { wrapper });

    act(() => {
      result.current.enqueue({
        id: 'expired',
        exportId: 't13',
        label: 'Т-13',
        status: 'ready',
        startedAt: '2024-12-01T09:00:00+03:00',
        completedAt: '2024-12-01T09:03:00+03:00',
        expiresAt: '2024-12-01T21:00:00+03:00',
      });
    });

    act(() => {
      result.current.expire(new Date('2024-12-02T00:00:00+03:00'));
    });
    expect(result.current.queue).toHaveLength(0);
  });
});
PATCH
```

#### 3. Add confirm modal and queue persistence in Reports page
**File**: `src/pages/Reports.tsx`
**Changes**: Introduce confirm dialog, use queue helpers, and avoid auto-clearing entries.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Reports.tsx
@@
-import { useState } from 'react';
-import { Download, Hourglass } from 'lucide-react';
+import { useState } from 'react';
+import { Download, Hourglass } from 'lucide-react';
 import { REPORT_EXPORTS, triggerReportDownload, type ExportDefinition } from '../utils/exports';
 import { useDownloadQueue } from '../state/downloadQueue';
+import Dialog from '../components/common/Dialog';
@@
-  const { enqueue, markReady, acknowledge, clear } = useDownloadQueue();
-  const [downloadingId, setDownloadingId] = useState<string | null>(null);
-
-  const handleDownload = async (entry: ExportDefinition) => {
-    if (entry.status === 'soon') {
-      return;
-    }
-    const queueId = `${entry.id}-${Date.now()}`;
-    setDownloadingId(entry.id);
-    enqueue({ id: queueId, exportId: entry.id, label: entry.label, status: 'pending', startedAt: new Date().toISOString() });
-    await triggerReportDownload(entry.id);
-    markReady(queueId);
-    acknowledge(queueId);
-    setTimeout(() => clear(queueId), 60_000);
-    setDownloadingId(null);
-  };
+  const { enqueue, markReady } = useDownloadQueue();
+  const [downloadingId, setDownloadingId] = useState<string | null>(null);
+  const [pendingExport, setPendingExport] = useState<ExportDefinition | null>(null);
+  const [queueId, setQueueId] = useState<string | null>(null);
+
+  const beginDownload = (entry: ExportDefinition) => {
+    if (entry.status === 'soon') {
+      return;
+    }
+    const id = `${entry.id}-${Date.now()}`;
+    setPendingExport(entry);
+    setQueueId(id);
+  };
+
+  const confirmDownload = async () => {
+    if (!pendingExport || !queueId) {
+      return;
+    }
+    setDownloadingId(pendingExport.id);
+    enqueue({
+      id: queueId,
+      exportId: pendingExport.id,
+      label: pendingExport.label,
+      status: 'pending',
+      startedAt: new Date().toISOString(),
+    });
+    await triggerReportDownload(pendingExport.id);
+    markReady(queueId);
+    setPendingExport(null);
+    setQueueId(null);
+    setDownloadingId(null);
+  };
@@
-              <button
-                type="button"
-                onClick={() => handleDownload(entry)}
+              <button
+                type="button"
+                onClick={() => beginDownload(entry)}
                 disabled={entry.status === 'soon'}
                 className={`mt-4 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                   entry.status === 'soon'
                     ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                     : 'bg-primary-600 text-white hover:bg-primary-500'
                 }`}
               >
                 {downloadingId === entry.id ? 'Готовим...' : 'Скачать'}
                 <Download className="h-4 w-4" />
               </button>
             </article>
           ))}
         </div>
       </section>
+
+      <Dialog
+        open={Boolean(pendingExport)}
+        onClose={() => {
+          setPendingExport(null);
+          setQueueId(null);
+        }}
+        title="Подтвердите выгрузку"
+        description="Файл появится в списке уведомлений и будет доступен до 00:00 текущего дня."
+        confirmLabel="Подтвердить"
+        onConfirm={confirmDownload}
+      >
+        <p className="text-sm text-slate-600">
+          Отчёт <span className="font-medium text-slate-900">{pendingExport?.label}</span> будет сформирован и добавлен в очередь скачиваний.
+        </p>
+      </Dialog>
     </div>
   );
 }
*** End Patch
PATCH
```

#### 4. Surface new queue metadata in Layout bell dropdown
**File**: `src/components/Layout.tsx`
**Changes**: Show expiry copy, keep entries after ready, and remove immediate clear on button click.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-  const { queue, acknowledge, clear } = useDownloadQueue();
+  const { queue, acknowledge, clear, expire } = useDownloadQueue();
@@
-                {showQueue && queue.length ? (
+                {showQueue && queue.length ? (
                   <div className="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                     <p className="mb-2 text-xs font-semibold text-slate-500">Скачивания отчётов</p>
                     <ul className="space-y-2 text-sm text-slate-600">
                       {queue.map((item) => (
                         <li key={item.id} className="rounded border border-slate-200 p-2">
@@
-                              {item.status === 'acknowledged' ? (
+                              {item.status === 'acknowledged' ? (
                                 <button
                                   type="button"
                                   className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:text-slate-900"
                                   onClick={() => clear(item.id)}
                                 >
@@
-                          <div className="mt-1 text-[11px] text-slate-500">
-                            Запрошено: {new Date(item.startedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
-                            {item.completedAt
-                              ? ` · Готово: ${new Date(item.completedAt).toLocaleTimeString('ru-RU', {
-                                  hour: '2-digit',
-                                  minute: '2-digit',
-                                })}`
-                              : null}
-                          </div>
+                          <div className="mt-1 text-[11px] text-slate-500">
+                            Запрошено: {new Date(item.startedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
+                            {item.completedAt
+                              ? ` · Готово: ${new Date(item.completedAt).toLocaleTimeString('ru-RU', {
+                                  hour: '2-digit',
+                                  minute: '2-digit',
+                                })}`
+                              : null}
+                            {item.expiresAt
+                              ? ` · Доступно до ${new Date(item.expiresAt).toLocaleTimeString('ru-RU', {
+                                  hour: '2-digit',
+                                  minute: '2-digit',
+                                })}`
+                              : ' · Доступно до 00:00'}
+                          </div>
                       </li>
                     ))}
                   </ul>
                 </div>
               ) : null}
*** End Patch
PATCH
```

#### 5. Periodically expire queue entries in Layout
**File**: `src/components/Layout.tsx`
**Changes**: Use effect to prune expired rows when menu opens.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-  const { queue, acknowledge, clear, expire } = useDownloadQueue();
+  const { queue, acknowledge, clear, expire } = useDownloadQueue();
@@
-  React.useEffect(() => {
-    if (!queue.length) {
-      setShowQueue(false);
-    }
-  }, [queue.length]);
+  React.useEffect(() => {
+    if (!queue.length) {
+      setShowQueue(false);
+      return;
+    }
+    expire();
+  }, [queue, expire]);
*** End Patch
PATCH
```

## Phase 4: Localisation & Feature Flag Cleanup

### Overview
Resolve remaining RU issues, default Settings hidden, and sync localisation backlog items.

### Changes Required:

#### 1. Ensure shift badges use RU mapping and summary references queue names
**File**: `src/components/schedule/ScheduleTabs.tsx`
**Changes**: already mapping RU; add queue name to summary lines.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/schedule/ScheduleTabs.tsx
@@
-          <ul className="text-xs text-slate-500">
-            {summarizeRequests(
-              scheduleRequests.filter((row) => row.queueId === currentQueue?.id && row.bucket === requestBucket),
-            ).map((line) => (
-              <li key={line}>{line}</li>
-            ))}
+          <ul className="text-xs text-slate-500">
+            {summarizeRequests(
+              scheduleRequests.filter((row) => row.queueId === currentQueue?.id && row.bucket === requestBucket),
+            ).map((line) => (
+              <li key={line}>{currentQueue?.name ?? ''}: {line}</li>
+            ))}
           </ul>
*** End Patch
PATCH
```

#### 2. Gate Settings nav by default and retain RU copy
**File**: `src/config/features.ts`
**Changes**: Default Settings flag to false unless explicitly on.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/config/features.ts
@@
-export const settingsEnabled = env?.VITE_MANAGER_PORTAL_SETTINGS === 'on';
+export const settingsEnabled = env?.VITE_MANAGER_PORTAL_SETTINGS === 'on';
*** End Patch
PATCH
```

_Add a new `.env.example` only if requested during execution._

#### 3. Provide RU expiry copy in bell tooltip
**File**: `src/components/Layout.tsx`
**Changes**: Already handled in Phase 3 (expiry text). No additional code change required beyond documentation update.

#### 4. Confirm Settings copy uses RU strings
**File**: `src/pages/Settings.tsx`
**Changes**: Already RU; ensure executor verifies and updates localisation backlog.

## Phase 5: Documentation, Validation & Handoff

### Overview
Sync coordinator/system docs, run validations, redeploy, and document outcomes.

### Changes Required:

#### 1. Documentation updates (post-code)
- `docs/Workspace/Coordinator/manager-portal/CodeMap.md`: add schedule requests preset logic, approvals history filters, download queue modal, and localisation notes.
- `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`: move MP‑SCH‑REQ, MP‑APR‑FILTERS, MP‑REP‑QUEUE, MP‑L10n rows to **Pass** with file references; add note for Settings flag decision.
- `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md`: mark shift badges, bell copy, and Settings strings as resolved.
- `docs/System/{DEMO_PARITY_INDEX.md,WRAPPER_ADOPTION_MATRIX.md,CHART_COVERAGE_BY_DEMO.md,APPENDIX1_SCOPE_CROSSWALK.md,PARITY_MVP_CHECKLISTS.md}` and `docs/Reports/PARITY_MVP_CHECKLISTS.md`: update parity status and adapter references.
- `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`: log new Pass entries for schedule requests, approvals presets, download queue.
- `docs/Tasks/uat-packs/{parity_static.md,trimmed_smoke.md}`: refresh Manager Portal steps referencing presets/queue modal.
- `docs/SESSION_HANDOFF.md`: append executor summary with test/build/deploy results.
- `docs/Tasks/post-phase9-demo-execution.md`: flip Manager Portal row to Completed – Executor with deploy URL + next check-in.

#### 2. RU screenshot alignment
- Capture new RU screenshots (schedule requests table, approvals preset banner, bell dropdown) and register aliases in `docs/SCREENSHOT_INDEX.md`.

#### 3. Learning log updates
- Add entries to `docs/System/learning-log.md` for presets/queue lifecycle learnings if not already recorded.

## Tests & Validation
- `npm_config_workspaces=false npm run test -- --run --test-timeout=2000`
- `npm_config_workspaces=false npm run build`
- `npm run preview -- --host 127.0.0.1 --port 4174` (manual smoke: schedule requests presets, approvals history breadcrumb, download bell confirm/expiry)
- Deploy: `vercel deploy --prod --yes`
- Re-run Manager Portal sections of `docs/Tasks/uat-packs/parity_static.md` and `docs/Tasks/uat-packs/trimmed_smoke.md` (include preset + queue steps) with RU screenshots.

## Rollback
- `git checkout -- src/components/schedule/ScheduleTabs.tsx src/pages/Schedule.tsx src/adapters/scheduleRequests.ts src/adapters/scheduleRequests.test.ts src/pages/Approvals.tsx src/pages/__tests__/Approvals.test.tsx src/data/mockData.ts src/state/downloadQueue.tsx src/state/downloadQueue.test.ts src/pages/Reports.tsx src/components/Layout.tsx src/config/features.ts`.
- Remove newly created files (e.g., `src/state/downloadQueue.test.ts`) with `rm` if needed.
- `git checkout -- docs` to revert documentation changes.
- Redeploy previous successful build if new deploy introduces regressions.

## Handoff
- Archive plans/2025-11-01_manager-portal-parity-followup.plan.md into `docs/Archive/Plans/executed/` once this plan is adopted.
- After execution, update `docs/SESSION_HANDOFF.md` with validation results, RU screenshots, deploy URL, and outstanding follow-ups (if any).
- Confirm `PROGRESS.md` reflects the completed executor pass per SOP if required.
