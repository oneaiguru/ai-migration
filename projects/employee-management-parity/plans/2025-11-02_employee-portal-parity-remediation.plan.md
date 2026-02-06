# Plan — Employee Portal Parity Remediation (History Dialog & Locale Polish)

## Metadata
- Task: docs/Tasks/employee-portal_parity-remediation-2025-11-02.task.md
- Planner: employee-portal-plan-2025-11-02-codex
- Source scout: docs/Workspace/Coordinator/employee-portal/Scout_Parity_Remediation_2025-11-02.md
- Additional references: docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md; docs/Workspace/Coordinator/employee-portal/{Visio_Parity_Vision.md,CodeMap.md}; plans/2025-11-01_employee-portal-parity-remediation.plan.md; `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/{CH2_Login_System.md,CH3_Employees.md,CH5_Schedule_Advanced.md,CH7_Appendices.md}`; `~/Desktop/employee-portal-manual-pack/images/{image76.png,image79.png,image162.png,image163.png,image175.png,image178.png}`
- Target repo: ${EMPLOYEE_PORTAL_REPO}

## Desired End State
The Employee Portal vacation history flow matches the Naumen manual: clicking “📂 Заявки за период” opens a dialog with RU-labelled date pickers and status toggles (under consideration / approved / rejected / cancelled), returning an aggregated timeline of requests in the chosen period. CSV export, Work Structure drawer, and Appendix 1 profile sections remain functional. RU placeholders replace English `mm/dd/yyyy`, tests cover the new history filters, and documentation/UAT packs point to the expanded behaviour. `npm_config_workspaces=false npm run build` and `npm_config_workspaces=false npm run test -- --run` both succeed, and the next deploy exposes the updated dialog for UAT verification.

### Key Discoveries
- The dialog currently shows history for a single request only; manual CH5_Schedule_Advanced.md:159 expects period and status controls inside the “Заявки за период” flow (docs/Workspace/Coordinator/employee-portal/Scout_Parity_Remediation_2025-11-02.md:18-27).
- English placeholders remain on date inputs, causing audit failures noted in docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md (Dashboard/Vacation section).
- Work Structure drawer, CSV export, and Appendix 1 profile fields now exist in repo; plan should preserve them while extending history tooling (Scout_Parity_Remediation_2025-11-02.md:9-44).

## What We're NOT Doing
- No manager-facing approval workflows, bulk transfers, or attachments for requests.
- No Playwright additions or live API integrations beyond existing mocks.
- No redesign of dashboard metrics or Work Structure drawer (already at parity).

## Implementation Approach
Reuse existing mock data and Vitest coverage to layer an aggregated history experience inside `VacationRequests.tsx`. Introduce helper types/constants to flatten request histories, capture period/status filters, and surface RU localisation for date inputs. Replace the history dialog with a two-mode component (single request vs period) that renders manual-accurate controls and summaries. Extend unit tests to exercise the new filters, then refresh documentation and UAT artefacts so reviewers know the dialog now supports date/status selections from the manual.

## Phase 1: History Aggregation State & Helpers

### Overview
Augment `VacationRequests.tsx` with history filter types, RU placeholders, and derived collections so the period dialog can surface manual-compliant data.

### Changes Required:

1. **Add helper types/constants for history filters**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Introduce history filter types, default status options, and a flattening helper.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-import { VacationRequest, VacationRequestStatus, VacationSummary } from '../types';
+import { VacationRequest, VacationRequestStatus, VacationSummary } from '../types';
@@
 const calculateDays = (startDate: string, endDate: string) => {
   const start = new Date(startDate);
   const end = new Date(endDate);
   return Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
 };
+
+type VacationHistoryMode = 'single' | 'period';
+type HistoryFilterStatus = Extract<VacationRequestStatus, 'pending' | 'approved' | 'rejected' | 'cancelled'>;
+
+interface HistoryFilters {
+  start: string;
+  end: string;
+  statuses: HistoryFilterStatus[];
+}
+
+interface AggregatedHistoryItem {
+  id: string;
+  requestId: string;
+  requestTypeLabel: string;
+  requestStatusLabel: string;
+  createdAt: string;
+  status: VacationRequestStatus;
+  statusLabel: string;
+  periodStart: string;
+  periodEnd: string;
+  comment?: string;
+  approver?: string;
+  actor?: string;
+}
+
+interface HistoryCounter {
+  total: number;
+  pending: number;
+  approved: number;
+  rejected: number;
+  cancelled: number;
+}
+
+const DEFAULT_HISTORY_STATUSES: HistoryFilterStatus[] = ['pending', 'approved', 'rejected'];
+
+const HISTORY_STATUS_OPTIONS: { id: HistoryFilterStatus; label: string }[] = [
+  { id: 'pending', label: 'На рассмотрении' },
+  { id: 'approved', label: 'Одобрено' },
+  { id: 'rejected', label: 'Отклонено' },
+  { id: 'cancelled', label: 'Отменено' },
+];
+
+const EMPTY_HISTORY_COUNTER: HistoryCounter = {
+  total: 0,
+  pending: 0,
+  approved: 0,
+  rejected: 0,
+  cancelled: 0,
+};
+
+const collectHistoryEntries = (requests: VacationRequest[]): AggregatedHistoryItem[] =>
+  requests.flatMap((request) =>
+    request.history.map((entry) => ({
+      id: `${request.id}-${entry.id}`,
+      requestId: request.id,
+      requestTypeLabel: request.typeLabel ?? VACATION_TYPE_LABEL[request.type],
+      requestStatusLabel: request.statusLabel ?? VACATION_STATUS_LABEL[request.status],
+      createdAt: entry.createdAt,
+      status: entry.status,
+      statusLabel: VACATION_STATUS_LABEL[entry.status],
+      periodStart: entry.period.start,
+      periodEnd: entry.period.end,
+      comment: entry.comment,
+      approver: entry.approver ?? request.reviewedBy,
+      actor: entry.actor ?? request.employeeName,
+    })),
+  );
*** End Patch
PATCH
```

2. **Restructure component state and derived memos**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Track dialog mode/filters, compute aggregated history, toggle statuses, and sync RU placeholders.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-  const [filter, setFilter] = useState<RequestFilter>('all');
-  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
-  const [periodStart, setPeriodStart] = useState<string>(`${selectedYear}-01-01`);
-  const [periodEnd, setPeriodEnd] = useState<string>(`${selectedYear}-12-31`);
+  const [filter, setFilter] = useState<RequestFilter>('all');
+  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
+  const [periodStart, setPeriodStart] = useState<string>(`${selectedYear}-01-01`);
+  const [periodEnd, setPeriodEnd] = useState<string>(`${selectedYear}-12-31`);
   const [searchValue, setSearchValue] = useState('');
   const [sort, setSort] = useState<SortState>({ key: 'submittedAt', direction: 'desc' });
   const [isDialogOpen, setDialogOpen] = useState(false);
-  const [historyOpen, setHistoryOpen] = useState(false);
-  const [historySource, setHistorySource] = useState<VacationRequest | null>(null);
+  const [historyOpen, setHistoryOpen] = useState(false);
+  const [historyMode, setHistoryMode] = useState<VacationHistoryMode>('single');
+  const [historySource, setHistorySource] = useState<VacationRequest | null>(null);
+  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>(() => ({
+    start: `${selectedYear}-01-01`,
+    end: `${selectedYear}-12-31`,
+    statuses: DEFAULT_HISTORY_STATUSES,
+  }));
@@
-  const filteredRequests = useMemo(() => {
+  const filteredRequests = useMemo(() => {
@@
-  const requestRows = useMemo(
+  const requestRows = useMemo(
@@
   );
+
+  const aggregatedHistory = useMemo(() => collectHistoryEntries(requests), [requests]);
+
+  const filteredHistoryEntries = useMemo(() => {
+    if (!aggregatedHistory.length) {
+      return [];
+    }
+
+    const hasStatuses = historyFilters.statuses.length > 0;
+    const startDate = historyFilters.start ? new Date(historyFilters.start) : null;
+    const endDate = historyFilters.end ? new Date(historyFilters.end) : null;
+
+    return aggregatedHistory
+      .filter((item) => (hasStatuses ? historyFilters.statuses.includes(item.status as HistoryFilterStatus) : false))
+      .filter((item) => {
+        const createdAt = new Date(item.createdAt);
+        if (startDate && createdAt.getTime() < startDate.getTime()) {
+          return false;
+        }
+        if (endDate) {
+          const inclusiveEnd = new Date(endDate);
+          inclusiveEnd.setHours(23, 59, 59, 999);
+          if (createdAt.getTime() > inclusiveEnd.getTime()) {
+            return false;
+          }
+        }
+        return true;
+      })
+      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
+  }, [aggregatedHistory, historyFilters]);
+
+  const historyCounters = useMemo<HistoryCounter>(() => {
+    if (!filteredHistoryEntries.length) {
+      return { ...EMPTY_HISTORY_COUNTER };
+    }
+
+    return filteredHistoryEntries.reduce((acc, item) => {
+      const next = { ...acc };
+      next.total += 1;
+      next[item.status as HistoryFilterStatus] += 1;
+      return next;
+    }, { ...EMPTY_HISTORY_COUNTER });
+  }, [filteredHistoryEntries]);
@@
-  const openHistory = (request: VacationRequest) => {
-    setHistorySource(request);
-    setHistoryOpen(true);
-  };
-
-  const handleHistoryOpenChange = (open: boolean) => {
-    setHistoryOpen(open);
-    if (!open) {
-      setHistorySource(null);
-    }
-  };
-
-  const openPeriodHistory = () => {
-    if (sortedRequests.length > 0) {
-      setHistorySource(sortedRequests[0]);
-    } else {
-      setHistorySource(null);
-    }
-    setHistoryOpen(true);
-  };
+  const handleHistoryDateChange = (field: 'start' | 'end', value: string) => {
+    setHistoryFilters((prev) => ({ ...prev, [field]: value }));
+  };
+
+  const handleHistoryStatusToggle = (status: HistoryFilterStatus) => {
+    setHistoryFilters((prev) => {
+      const hasStatus = prev.statuses.includes(status);
+      const nextStatuses = hasStatus ? prev.statuses.filter((item) => item !== status) : [...prev.statuses, status];
+      return { ...prev, statuses: nextStatuses };
+    });
+  };
+
+  const openHistory = (request: VacationRequest) => {
+    setHistoryMode('single');
+    setHistorySource(request);
+    setHistoryOpen(true);
+  };
+
+  const handleHistoryOpenChange = (open: boolean) => {
+    setHistoryOpen(open);
+    if (!open) {
+      setHistorySource(null);
+      setHistoryMode('single');
+    }
+  };
+
+  const openPeriodHistory = () => {
+    setHistoryMode('period');
+    setHistorySource(null);
+    setHistoryFilters((prev) => ({
+      ...prev,
+      start: periodStart,
+      end: periodEnd,
+      statuses: prev.statuses.length ? prev.statuses : DEFAULT_HISTORY_STATUSES,
+    }));
+    setHistoryOpen(true);
+  };
@@
-  const handleClearFilters = () => {
-    setFilter('all');
-    setSearchValue('');
-    setPeriodStart(`${selectedYear}-01-01`);
-    setPeriodEnd(`${selectedYear}-12-31`);
-  };
+  const handleClearFilters = () => {
+    setFilter('all');
+    setSearchValue('');
+    setPeriodStart(`${selectedYear}-01-01`);
+    setPeriodEnd(`${selectedYear}-12-31`);
+    setHistoryFilters({
+      start: `${selectedYear}-01-01`,
+      end: `${selectedYear}-12-31`,
+      statuses: DEFAULT_HISTORY_STATUSES,
+    });
+  };
+
+  useEffect(() => {
+    setHistoryFilters((prev) => ({
+      ...prev,
+      start: `${selectedYear}-01-01`,
+      end: `${selectedYear}-12-31`,
+    }));
+  }, [selectedYear]);
*** End Patch
PATCH
```

3. **Localise date inputs in filters and form**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Add RU placeholders/`lang` attributes to date inputs to eliminate English defaults noted in UAT.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-              <FormField fieldId="period-start" label="Заявки с">
+              <FormField fieldId="period-start" label="Заявки с">
                 <input
                   id="period-start"
                   type="date"
+                  lang="ru"
+                  placeholder="дд.мм.гггг"
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
+                  lang="ru"
+                  placeholder="дд.мм.гггг"
                   className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                   value={periodEnd}
                   min={periodStart}
                   onChange={(event) => setPeriodEnd(event.target.value)}
                 />
@@
-          <FormField fieldId="start-date" label="Дата начала" required error={formErrors.startDate}>
+          <FormField fieldId="start-date" label="Дата начала" required error={formErrors.startDate}>
             <input
               id="start-date"
               type="date"
+              lang="ru"
+              placeholder="дд.мм.гггг"
               className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
               value={formState.startDate}
               onChange={(event) =>
                 setFormState((prev) => ({ ...prev, startDate: event.target.value }))
@@
-          <FormField fieldId="end-date" label="Дата окончания" required error={formErrors.endDate}>
+          <FormField fieldId="end-date" label="Дата окончания" required error={formErrors.endDate}>
             <input
               id="end-date"
               type="date"
+              lang="ru"
+              placeholder="дд.мм.гггг"
               className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
               value={formState.endDate}
               min={formState.startDate}
               onChange={(event) =>
                 setFormState((prev) => ({ ...prev, endDate: event.target.value }))
*** End Patch
PATCH
```

## Phase 2: Vacation History Dialog Rewrite

### Overview
Replace the dialog with a mode-aware component that renders manual-accurate filters, summaries, and aggregated entries while preserving single-request history.

### Changes Required:

1. **Update dialog props and rendering logic**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Expand props to accept mode, filters, counters, and entry list; render status/date controls and RU timeline.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-interface VacationHistoryDialogProps {
-  open: boolean;
-  onOpenChange: (open: boolean) => void;
-  request: VacationRequest | null;
-}
-
-const VacationHistoryDialog = ({ open, onOpenChange, request }: VacationHistoryDialogProps) => {
-  const entries = request?.history ?? [];
-
-  return (
-    <Dialog
-      open={open}
-      onOpenChange={onOpenChange}
-      title="Заявки за период"
-      description="История изменений по выбранной заявке"
-      size="lg"
-      testId="vacation-history"
-    >
-      {!request ? (
-        <p className="text-sm text-slate-600">Выберите заявку, чтобы просмотреть историю.</p>
-      ) : (
-        <div className="space-y-4">
-          <header className="flex items-center justify-between gap-4">
-            <div>
-              <h3 className="text-sm font-semibold text-slate-900">
-                {request.typeLabel ?? VACATION_TYPE_LABEL[request.type]}
-              </h3>
-              <p className="text-xs text-slate-500">
-                Период: {formatDate(request.startDate)} — {formatDate(request.endDate)}
-              </p>
-            </div>
-            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
-              {request.statusLabel ?? VACATION_STATUS_LABEL[request.status]}
-            </span>
-          </header>
-
-          {entries.length > 0 ? (
-            <ul className="space-y-3">
-              {entries.map((entry) => (
-                <li key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
-                  <div className="flex items-center justify-between">
-                    <span className="text-sm font-semibold text-slate-900">
-                      {VACATION_STATUS_LABEL[entry.status]}
-                    </span>
-                    <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
-                  </div>
-                  <p className="text-xs text-slate-500">
-                    Период: {formatDate(entry.period.start)} — {formatDate(entry.period.end)}
-                  </p>
-                  {entry.comment ? (
-                    <p className="mt-2 text-sm text-slate-700">{entry.comment}</p>
-                  ) : null}
-                  {entry.approver ? (
-                    <p className="mt-2 text-xs text-slate-500">Согласующий: {entry.approver}</p>
-                  ) : null}
-                  {entry.actor && !entry.approver ? (
-                    <p className="mt-2 text-xs text-slate-500">Инициатор: {entry.actor}</p>
-                  ) : null}
-                </li>
-              ))}
-            </ul>
-          ) : (
-            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
-              История изменений пока отсутствует
-            </p>
-          )}
-        </div>
-      )}
-    </Dialog>
-  );
-};
+interface VacationHistoryDialogProps {
+  open: boolean;
+  mode: VacationHistoryMode;
+  onOpenChange: (open: boolean) => void;
+  request: VacationRequest | null;
+  entries: AggregatedHistoryItem[];
+  filters: HistoryFilters;
+  counters: HistoryCounter;
+  onDateChange: (field: 'start' | 'end', value: string) => void;
+  onToggleStatus: (status: HistoryFilterStatus) => void;
+}
+
+const VacationHistoryDialog = ({
+  open,
+  mode,
+  onOpenChange,
+  request,
+  entries,
+  filters,
+  counters,
+  onDateChange,
+  onToggleStatus,
+}: VacationHistoryDialogProps) => {
+  const isPeriodMode = mode === 'period';
+  const selectedStatuses = new Set(filters.statuses);
+  const noStatusesSelected = filters.statuses.length === 0;
+
+  return (
+    <Dialog
+      open={open}
+      onOpenChange={onOpenChange}
+      title="Заявки за период"
+      description={
+        isPeriodMode
+          ? 'Выберите период и статусы, чтобы просмотреть историю заявок.'
+          : 'История изменений по выбранной заявке'
+      }
+      size="lg"
+      testId="vacation-history"
+    >
+      {isPeriodMode ? (
+        <div className="space-y-5">
+          <div className="grid gap-4 md:grid-cols-2">
+            <FormField fieldId="history-start" label="Период с">
+              <input
+                id="history-start"
+                type="date"
+                lang="ru"
+                placeholder="дд.мм.гггг"
+                value={filters.start}
+                max={filters.end || undefined}
+                onChange={(event) => onDateChange('start', event.target.value)}
+                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
+              />
+            </FormField>
+            <FormField fieldId="history-end" label="по">
+              <input
+                id="history-end"
+                type="date"
+                lang="ru"
+                placeholder="дд.мм.гггг"
+                value={filters.end}
+                min={filters.start || undefined}
+                onChange={(event) => onDateChange('end', event.target.value)}
+                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
+              />
+            </FormField>
+          </div>
+
+          <section className="space-y-2">
+            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Статусы</h3>
+            <div className="flex flex-wrap gap-3">
+              {HISTORY_STATUS_OPTIONS.map((option) => {
+                const isActive = selectedStatuses.has(option.id);
+                return (
+                  <label
+                    key={option.id}
+                    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
+                      isActive
+                        ? 'border-blue-200 bg-blue-50 text-blue-700'
+                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
+                    }`}
+                  >
+                    <input
+                      type="checkbox"
+                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
+                      checked={isActive}
+                      onChange={() => onToggleStatus(option.id)}
+                    />
+                    <span>{option.label}</span>
+                  </label>
+                );
+              })}
+            </div>
+          </section>
+
+          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
+            <p className="font-semibold text-slate-900">
+              Найдено записей: <span className="text-xl">{counters.total}</span>
+            </p>
+            <div className="mt-2 grid gap-2 sm:grid-cols-2">
+              <p>На рассмотрении: {counters.pending}</p>
+              <p>Одобрено: {counters.approved}</p>
+              <p>Отклонено: {counters.rejected}</p>
+              <p>Отменено: {counters.cancelled}</p>
+            </div>
+          </section>
+
+          {noStatusesSelected ? (
+            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
+              Выберите хотя бы один статус, чтобы увидеть историю заявок.
+            </p>
+          ) : entries.length ? (
+            <ul className="space-y-3">
+              {entries.map((item) => (
+                <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
+                  <div className="flex flex-wrap items-center justify-between gap-3">
+                    <div>
+                      <p className="text-sm font-semibold text-slate-900">{item.requestTypeLabel}</p>
+                      <p className="text-xs text-slate-500">
+                        Заявка {item.requestId} • {formatDate(item.periodStart)} — {formatDate(item.periodEnd)}
+                      </p>
+                    </div>
+                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
+                      {item.statusLabel}
+                    </span>
+                  </div>
+                  <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-slate-500">
+                    <span>Изменено: {formatDateTime(item.createdAt)}</span>
+                    {item.approver ? (
+                      <span>Согласующий: {item.approver}</span>
+                    ) : item.actor ? (
+                      <span>Инициатор: {item.actor}</span>
+                    ) : null}
+                  </div>
+                  {item.comment ? (
+                    <p className="mt-3 text-sm text-slate-700">{item.comment}</p>
+                  ) : null}
+                </li>
+              ))}
+            </ul>
+          ) : (
+            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
+              Нет истории для выбранного периода и статусов.
+            </p>
+          )}
+        </div>
+      ) : !request ? (
+        <p className="text-sm text-slate-600">Выберите заявку, чтобы просмотреть историю.</p>
+      ) : (
+        <div className="space-y-4">
+          <header className="flex items-center justify-between gap-4">
+            <div>
+              <h3 className="text-sm font-semibold text-slate-900">
+                {request.typeLabel ?? VACATION_TYPE_LABEL[request.type]}
+              </h3>
+              <p className="text-xs text-slate-500">
+                Период: {formatDate(request.startDate)} — {formatDate(request.endDate)}
+              </p>
+            </div>
+            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
+              {request.statusLabel ?? VACATION_STATUS_LABEL[request.status]}
+            </span>
+          </header>
+
+          {request.history.length ? (
+            <ul className="space-y-3">
+              {request.history.map((entry) => (
+                <li key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
+                  <div className="flex items-center justify-between">
+                    <span className="text-sm font-semibold text-slate-900">
+                      {VACATION_STATUS_LABEL[entry.status]}
+                    </span>
+                    <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
+                  </div>
+                  <p className="text-xs text-slate-500">
+                    Период: {formatDate(entry.period.start)} — {formatDate(entry.period.end)}
+                  </p>
+                  {entry.comment ? (
+                    <p className="mt-2 text-sm text-slate-700">{entry.comment}</p>
+                  ) : null}
+                  {entry.approver ? (
+                    <p className="mt-2 text-xs text-slate-500">Согласующий: {entry.approver}</p>
+                  ) : null}
+                  {entry.actor && !entry.approver ? (
+                    <p className="mt-2 text-xs text-slate-500">Инициатор: {entry.actor}</p>
+                  ) : null}
+                </li>
+              ))}
+            </ul>
+          ) : (
+            <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
+              История изменений пока отсутствует
+            </p>
+          )}
+        </div>
+      )}
+    </Dialog>
+  );
+};
*** End Patch
PATCH
```

2. **Wire new props into component usage**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Pass mode, filters, counters, and handlers when rendering the dialog.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-      <VacationHistoryDialog
-        open={historyOpen}
-        onOpenChange={handleHistoryOpenChange}
-        request={historySource}
-      />
+      <VacationHistoryDialog
+        open={historyOpen}
+        mode={historyMode}
+        onOpenChange={handleHistoryOpenChange}
+        request={historySource}
+        entries={filteredHistoryEntries}
+        filters={historyFilters}
+        counters={historyCounters}
+        onDateChange={handleHistoryDateChange}
+        onToggleStatus={handleHistoryStatusToggle}
+      />
*** End Patch
PATCH
```

## Phase 3: Vitest Coverage Updates

### Overview
Adjust the existing unit tests to reflect the new period dialog, verify RU placeholders, and ensure status toggles filter results.

### Changes Required:

1. **Refresh fixtures for multi-status history**
   - **File:** `src/__tests__/VacationRequests.test.tsx`
   - **Changes:** Expand mock history entries and add a second request to cover rejected/cancelled states.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/__tests__/VacationRequests.test.tsx
@@
-const baseHistory = [
-  {
-    id: 'hist-1',
-    status: 'pending' as const,
-    createdAt: '2024-03-10T08:00:00+03:00',
-    actor: 'Иванова Анна Петровна',
-    period: { start: '2024-04-01', end: '2024-04-05' },
-  },
-];
+const baseHistory = [
+  {
+    id: 'hist-1',
+    status: 'pending' as const,
+    createdAt: '2024-03-10T08:00:00+03:00',
+    actor: 'Иванова Анна Петровна',
+    period: { start: '2024-04-01', end: '2024-04-05' },
+  },
+  {
+    id: 'hist-2',
+    status: 'approved' as const,
+    createdAt: '2024-03-12T09:00:00+03:00',
+    approver: 'Петров И.С.',
+    comment: 'Согласовано без замечаний',
+    period: { start: '2024-04-01', end: '2024-04-05' },
+  },
+];
@@
-const mockRequests = [
+const mockRequests = [
   {
     id: 'req-1',
@@
     history: baseHistory,
   },
+  {
+    id: 'req-2',
+    employeeId: 'EMP001',
+    employeeName: 'Иванова Анна Петровна',
+    type: 'personal' as const,
+    typeLabel: 'Личные дела',
+    startDate: '2024-06-10',
+    endDate: '2024-06-12',
+    totalDays: 3,
+    reason: 'Семейные обстоятельства',
+    isEmergency: true,
+    status: 'rejected' as const,
+    statusLabel: 'Отклонено',
+    submittedAt: '2024-05-31T12:00:00+03:00',
+    reviewedAt: '2024-06-01T09:30:00+03:00',
+    reviewedBy: 'Смирнова Л.В.',
+    reviewNotes: 'Необходим полноценный график присутствия',
+    managerComment: 'Запрос отклонён',
+    lastUpdatedAt: '2024-06-01T09:30:00+03:00',
+    history: [
+      {
+        id: 'hist-3',
+        status: 'pending' as const,
+        createdAt: '2024-05-31T12:00:00+03:00',
+        actor: 'Иванова Анна Петровна',
+        period: { start: '2024-06-10', end: '2024-06-12' },
+      },
+      {
+        id: 'hist-4',
+        status: 'rejected' as const,
+        createdAt: '2024-06-01T09:30:00+03:00',
+        approver: 'Смирнова Л.В.',
+        comment: 'Запрос не соответствует производственному плану',
+        period: { start: '2024-06-10', end: '2024-06-12' },
+      },
+    ],
+  },
 ];
*** End Patch
PATCH
```

2. **Update expectations for counts and placeholders**
   - **File:** `src/__tests__/VacationRequests.test.tsx`
   - **Changes:** Adjust assertions to reflect RU placeholders and button text.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/__tests__/VacationRequests.test.tsx
@@
-    await screen.findByText(/Все \(1\)/i);
+    await screen.findByText(/Все \(2\)/i);
@@
-    const startInput = screen.getByLabelText(/Дата начала/i) as HTMLInputElement;
-    const endInput = screen.getByLabelText(/Дата окончания/i) as HTMLInputElement;
+    const startInput = screen.getByLabelText(/Дата начала/i) as HTMLInputElement;
+    const endInput = screen.getByLabelText(/Дата окончания/i) as HTMLInputElement;
+    expect(startInput.placeholder).toBe('дд.мм.гггг');
+    expect(endInput.placeholder).toBe('дд.мм.гггг');
@@
-    await screen.findByText(/Все \(1\)/i);
+    await screen.findByText(/Все \(2\)/i);
@@
-    await user.click(screen.getByRole('button', { name: /Экспорт заявок/i }));
+    await user.click(screen.getByRole('button', { name: /Экспорт CSV/i }));
*** End Patch
PATCH
```

3. **Assert new history dialog behaviour**
   - **File:** `src/__tests__/VacationRequests.test.tsx`
   - **Changes:** Replace the toolbar history test with checks for filters, summary text, and status toggling.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/__tests__/VacationRequests.test.tsx
@@
-  it('opens history dialog with RU labels when triggered from toolbar', async () => {
-    const user = userEvent.setup();
-    render(<VacationRequests />);
-
-    await screen.findByText(/Все \(1\)/i);
-    await user.click(screen.getByRole('button', { name: /Заявки за период/i }));
-
-    const dialog = await screen.findByRole('dialog', { name: /Заявки за период/i });
-    expect(dialog).toHaveTextContent('Ежегодный отпуск');
-    expect(dialog).toHaveTextContent('Одобрено');
-  });
+  it('opens period history dialog with filters and aggregates', async () => {
+    const user = userEvent.setup();
+    render(<VacationRequests />);
+
+    await screen.findByText(/Все \(2\)/i);
+    await user.click(screen.getByRole('button', { name: /Заявки за период/i }));
+
+    await screen.findByRole('dialog', { name: /Заявки за период/i });
+    expect(screen.getAllByPlaceholderText('дд.мм.гггг')).toHaveLength(4);
+    expect(screen.getByRole('checkbox', { name: /На рассмотрении/i })).toBeChecked();
+    expect(screen.getByText(/Найдено записей: 4/)).toBeInTheDocument();
+
+    await user.click(screen.getByRole('checkbox', { name: /Одобрено/i }));
+    expect(screen.getByText(/Найдено записей: 3/)).toBeInTheDocument();
+
+    await user.click(screen.getByRole('checkbox', { name: /Отклонено/i }));
+    expect(screen.getByText(/Найдено записей: 2/)).toBeInTheDocument();
+  });
*** End Patch
PATCH
```

## Phase 4: Documentation & UAT Updates

### Overview
Align evidence packs and reports with the enhanced history dialog and localisation pass.

### Changes Required:

1. `docs/Tasks/uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md` — add a row describing the updated “Заявки за период” dialog (date/status controls, RU placeholders) with file:line references to `VacationRequests.tsx` and screenshots `portal-vacation-history.png`/`image79.png`.
2. `docs/Tasks/uat-packs/parity_static.md` & `docs/Tasks/uat-packs/trimmed_smoke.md` — update Employee Portal steps to include verification of status toggles and RU placeholders, marking previous FAIL row as pending re-run.
3. `docs/SCREENSHOT_INDEX.md` & `docs/Tasks/screenshot-checklist.md` — ensure new dialog captures (`portal-vacation-history.png`) map to the period mode view.
4. `docs/Workspace/Coordinator/employee-portal/CodeMap.md` — refresh Vacation Requests section to cite new helper blocks and dialog props.
5. System reports (`docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, PARITY_MVP_CHECKLISTS.md, CHART_COVERAGE_BY_DEMO.md, APPENDIX1_SCOPE_CROSSWALK.md}`) and `docs/System/learning-log.md` — record that period history parity is restored and placeholders localised.
6. `docs/SESSION_HANDOFF.md`, `docs/Tasks/post-phase9-demo-execution.md`, `PROGRESS.md` — log execution/deploy details once the plan ships.

## Tests & Validation
- `npm_config_workspaces=false npm run build`
- `npm_config_workspaces=false npm run test -- --run`
- Optional lint: `npm_config_workspaces=false npm run lint` (if script exists)
- Manual smoke on reserved port (`npm run dev -- --port 4180`): verify organised statuses/filters, RU placeholders, and per-request history.
- Deploy via `vercel deploy --prod --yes`; rerun `docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md}` and capture updated screenshots.

## Rollback
- Restore code changes: `git checkout -- src/pages/VacationRequests.tsx src/__tests__/VacationRequests.test.tsx`.
- Revert documentation edits individually (`git checkout -- docs/...`).
- If deploy regresses behaviour, redeploy previous stable commit recorded in `docs/SESSION_HANDOFF.md` via `vercel deploy --prod --yes -- --target=previous`.

## Handoff
- Record plan publication in `docs/SESSION_HANDOFF.md` (include validation commands and phase summary).
- Update `PROGRESS.md` to note this plan as the active Employee Portal remediation work.
- Provide executor reminders: follow this plan verbatim, rerun build/tests, redeploy, refresh UAT packs/screenshots, and sync parity reports.
