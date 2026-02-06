# Plan — Employee Portal Parity Remediation (Work Structure · History Export · Profile Appendix 1)

## Metadata
- Task: docs/Tasks/employee-portal_parity-gap-scout-2025-10-31-codex.task.md
- Planner: employee-portal-plan-2025-11-01-codex
- Source scout: docs/Workspace/Coordinator/employee-portal/Scout_Parity_Gap_2025-10-31.md
- Additional references: docs/Archive/UAT/2025-10-31_employee-portal_parity-gap-report.md; docs/Tasks/employee-portal_manual-parity-review.task.md; docs/Workspace/Coordinator/employee-portal/{Visio_Parity_Vision.md,Visio_Scout_2025-10-14.md,CodeMap.md}; `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/{CH2_Login_System.md,CH3_Employees.md,CH5_Schedule_Advanced.md,CH7_Appendices.md}` + `~/Desktop/employee-portal-manual-pack/images/{image76.png,image79.png,image162.png,image163.png,image175.png,image178.png}`; docs/UAT/real-naumen/2025-10-13_xds/README.md
- Target repo: ${EMPLOYEE_PORTAL_REPO}

## Desired End State
The Employee Portal demo mirrors the Naumen production experience highlighted in CH2/CH5/CH7: the header exports a searchable "Рабочая структура" drawer with hierarchical navigation and RU formatted metadata (image162–163), the vacation requests module exposes the "Заявки за период" history dialog plus RU-localised CSV export (image76/79) and import/export buttons with meaningful behaviour, and the profile surface includes Appendix 1 identifiers, communication channels, calendar/scheme history, avatar and password self-service (image175/178). Types/mocks drive the new data, Vitest suites cover drawer search, history export, and profile interactions, and documentation/UAT packs point to the refreshed flows and screenshots. `npm run build` and `npm run test -- --run` succeed, and parity_static + trimmed_smoke packs can mark the previously failing rows as Pass using the new deploy.

### Key Discoveries
- Work Structure drawer currently renders only `structurePath` with no search/tree, per scout findings (`src/components/WorkStructureDrawer.tsx:15-37`, `${MANUALS_ROOT}/.../CH2_Login_System.md:23`, image162.png).
- Layout keeps employee data static and exposes no org selection context downstream (`src/components/Layout.tsx:9-62`).
- Vacation requests export emits raw enum values and lacks a dedicated history dialog (`src/pages/VacationRequests.tsx:91-117` & 565-606; CH5_Schedule_Advanced.md:159, image76/79).
- Profile omits Appendix 1 fields and self-service controls required by CH2/CH7 (`src/types/index.ts:35-58`, `src/pages/Profile.tsx:174-552`, CH7_Appendices.md:12-24, CH2_Login_System.md:42).
- Tests only cover dedupe regression and basic profile edits; drawer search/history/profile additions need new Vitest coverage (`src/__tests__/Layout.work-structure.test.tsx:1-33`, `src/__tests__/VacationRequests.test.tsx:1-180`, `src/__tests__/Profile.test.tsx:1-62`).

## What We're NOT Doing
- No API integrations or real authentication—mock data only.
- No redesign of dashboard KPIs or new analytics widgets; focus on parity gaps cited in the UAT report.
- No Playwright additions beyond documenting new screenshot aliases (Playwright coverage remains optional for this pass).
- No expansion into manager-only actions (shift exchange tooling, schedule graph builder) beyond documenting them as out-of-scope.

## Implementation Approach
Start by extending the shared types and mock fixtures so Work Structure nodes, vacation-history records, RU export strings, and Appendix 1 identifiers exist end-to-end. Layer a hierarchy/search experience into `WorkStructureDrawer` with reusable tree utilities and expose the selected org via a new context provider in `Layout`, mirroring CH2 behaviour without altering downstream filtering yet. Upgrade `VacationRequests` to include the “Заявки за период” dialog, RU CSV export, and button behaviours while keeping existing wrappers. Refresh the Profile page with Appendix 1 sections, self-service password/avatar actions, and history chips referencing CH3. Close with Vitest updates, documentation/UAT refresh, and a clean validation loop capturing the new deploy and evidence.

## Phase 1: Domain & Mock Data Foundations

### Overview
Extend employee and vacation request domain objects, localisation helpers, and fixtures so downstream UI updates have complete data to render (tree search metadata, history records, Appendix 1 identifiers, RU export copy).

### Changes Required:

1. **Expand employee/vacation types with parity fields**
   - **File:** `src/types/index.ts`
   - **Changes:** Add search index + hierarchy metadata, Appendix 1 fields, RU export helpers, and vacation history entries.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/types/index.ts
@@
-export interface VacationRequest {
-  id: string;
-  requestedAt: string;
-  type: VacationRequestType;
-  status: VacationRequestStatus;
-  period: {
-    start: string;
-    end: string;
-  };
-  durationDays: number;
-  approver?: string;
-  comment?: string;
-}
+export interface VacationRequestHistoryEntry {
+  id: string;
+  createdAt: string;
+  status: VacationRequestStatus;
+  approver?: string;
+  comment?: string;
+  period: {
+    start: string;
+    end: string;
+  };
+}
+
+export interface VacationRequest {
+  id: string;
+  requestedAt: string;
+  type: VacationRequestType;
+  status: VacationRequestStatus;
+  /** RU label used in history drawer + CSV (CH5 image76). */
+  statusLabel?: string;
+  /** RU type label surfaced in exports. */
+  typeLabel?: string;
+  period: {
+    start: string;
+    end: string;
+  };
+  durationDays: number;
+  approver?: string;
+  comment?: string;
+  history?: VacationRequestHistoryEntry[];
+}
@@
-export interface Employee {
+export interface WorkStructureSearchIndex {
+  nodeId: string;
+  label: string;
+  path: string[];
+}
+
+export interface Employee {
   id: string;
   employeeId: string;
   status: EmployeeStatus;
@@
-  structurePath?: string[];
-  /** Optional drawer tree for sibling departments. */
-  structureTree?: WorkStructureNode[];
-  /** Direct manager full name surfaced in the drawer. */
-  managerName?: string;
-  /** Contact details exposed alongside the structure. */
-  contacts?: WorkContacts;
-  /** Work setting chips (office, time zone, scheme). */
-  workSettings?: EmployeeWorkSettings;
-  /** Emergency contact block duplicated from Appendix 1 requirements. */
-  emergencyContact?: EmergencyContact;
+  structurePath?: string[];
+  structureTree?: WorkStructureNode[];
+  /** Flattened index to support drawer search suggestions (CH2 image163). */
+  structureIndex?: WorkStructureSearchIndex[];
+  managerName?: string;
+  contacts?: WorkContacts;
+  workSettings?: EmployeeWorkSettings;
+  emergencyContact?: EmergencyContact;
+  /** Appendix 1 identifiers surfaced on Profile (CH7 §1.3). */
+  personnelNumber?: string;
+  messageType?: 'phone' | 'email' | 'messenger';
+  externalSystemIds?: Array<{ system: string; value: string }>;
+  calendarId?: string;
+  workCalendarHistory?: Array<{ id: string; name: string; effectiveFrom: string; effectiveTo?: string }>;
+  scheduleSchemeId?: string;
+  schemeHistory?: Array<{ id: string; name: string; effectiveFrom: string; effectiveTo?: string }>;
+  allowAvatarUpload?: boolean;
+  allowPasswordReset?: boolean;
 }
*** End Patch
PATCH
```

2. **Seed mock employee and requests with hierarchy/search/history data**
   - **File:** `src/data/mockData.ts`
   - **Changes:** Populate `structureTree`, `structureIndex`, RU contact/time-zone labels, request history records, Appendix 1 identifiers, and RU status/type labels.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
 export const mockEmployee: Employee = {
   id: 'emp_001',
   employeeId: 'EMP001',
   status: 'active',
@@
-  structurePath: ['Naumen WFM', 'Контактный центр', 'Отдел поддержки клиентов', 'Группа 2_1'],
-  structureTree: [
-    {
-      id: 'contact-center',
-      label: 'Контактный центр',
-      children: [
-        {
-          id: 'support',
-          label: 'Отдел поддержки клиентов',
-          children: [
-            { id: 'group-21', label: 'Группа 2_1' },
-            { id: 'group-22', label: 'Группа 2_2' },
-            { id: 'group-23', label: 'Группа 2_3' },
-          ],
-        },
-        {
-          id: 'quality',
-          label: 'Отдел качества',
-          children: [
-            { id: 'group-qa-1', label: 'Группа QA 1' },
-            { id: 'group-qa-2', label: 'Группа QA 2' },
-          ],
-        },
-      ],
-    },
-  ],
-  managerName: 'Наталья Кузьмина',
-  contacts: {
-    corporateEmail: 'operator9@naumen.ru',
-    workPhone: '+7 (495) 123-45-67',
-    location: 'Москва, ул. Лесная, 5',
-  },
-  workSettings: {
-    office: 'Москва',
-    timeZone: 'Europe/Moscow',
-    workScheme: '5/2 (09:00–18:00)',
-  },
-  emergencyContact: {
-    name: 'Анна Иванова',
-    relation: 'Сестра',
-    phone: '+7 (921) 000-11-22',
-  },
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
+  structureIndex: [
+    { nodeId: 'contact-center', label: 'Контактный центр', path: ['Naumen WFM', 'Контактный центр'] },
+    { nodeId: 'support', label: 'Отдел поддержки клиентов', path: ['Naumen WFM', 'Контактный центр', 'Отдел поддержки клиентов'] },
+    { nodeId: 'group-21', label: 'Группа 2_1', path: ['Naumen WFM', 'Контактный центр', 'Отдел поддержки клиентов', 'Группа 2_1'] },
+    { nodeId: 'group-22', label: 'Группа 2_2', path: ['Naumen WFM', 'Контактный центр', 'Отдел поддержки клиентов', 'Группа 2_2'] },
+    { nodeId: 'group-23', label: 'Группа 2_3', path: ['Naumen WFM', 'Контактный центр', 'Отдел поддержки клиентов', 'Группа 2_3'] },
+    { nodeId: 'quality', label: 'Отдел качества', path: ['Naumen WFM', 'Контактный центр', 'Отдел качества'] },
+    { nodeId: 'group-qa-1', label: 'Группа QA 1', path: ['Naumen WFM', 'Контактный центр', 'Отдел качества', 'Группа QA 1'] },
+    { nodeId: 'group-qa-2', label: 'Группа QA 2', path: ['Naumen WFM', 'Контактный центр', 'Отдел качества', 'Группа QA 2'] },
+  ],
+  managerName: 'Наталья Кузьмина',
+  contacts: {
+    corporateEmail: 'operator9@naumen.ru',
+    workPhone: '+7 (495) 123-45-67',
+    location: 'Москва, ул. Лесная, 5',
+  },
+  workSettings: {
+    office: 'Москва',
+    timeZone: 'МСК (UTC+3)',
+    workScheme: '5/2 (09:00–18:00)',
+  },
+  emergencyContact: {
+    name: 'Анна Иванова',
+    relation: 'Сестра',
+    phone: '+7 (921) 000-11-22',
+  },
+  personnelNumber: '000231-24',
+  messageType: 'email',
+  externalSystemIds: [
+    { system: 'SCUD', value: 'SCUD-4421' },
+    { system: 'HRIS', value: 'HR-99012' },
+  ],
+  calendarId: 'CAL-OPS-2025',
+  workCalendarHistory: [
+    { id: 'CAL-OPS-2024', name: 'Календарь операций 2024', effectiveFrom: '2024-01-01', effectiveTo: '2024-12-31' },
+  ],
+  scheduleSchemeId: 'SCH-REG-52',
+  schemeHistory: [
+    { id: 'SCH-NIGHT-49', name: 'Ночной график', effectiveFrom: '2023-03-01', effectiveTo: '2024-03-01' },
+  ],
+  allowAvatarUpload: true,
+  allowPasswordReset: true,
 };
@@
-export const vacationRequests: VacationRequest[] = [
+export const vacationRequests: VacationRequest[] = [
   {
     id: 'vac_req_001',
     requestedAt: '2025-02-10',
     type: 'annual',
-    status: 'approved',
+    status: 'approved',
+    statusLabel: 'Одобрено',
+    typeLabel: 'Ежегодный отпуск',
     period: {
       start: '2025-03-01',
       end: '2025-03-14',
     },
     durationDays: 14,
     approver: 'Смирнова О.А.',
     comment: 'Утверждено в рамках квартального графика',
+    history: [
+      {
+        id: 'vac_hist_001',
+        createdAt: '2025-02-12T09:30:00+03:00',
+        status: 'approved',
+        approver: 'Смирнова О.А.',
+        comment: 'График отпусков согласован',
+        period: { start: '2025-03-01', end: '2025-03-14' },
+      },
+    ],
   },
   {
     id: 'vac_req_002',
     requestedAt: '2025-02-18',
     type: 'sick_leave',
-    status: 'pending',
+    status: 'pending',
+    statusLabel: 'На рассмотрении',
+    typeLabel: 'Больничный лист',
     period: {
       start: '2025-02-19',
       end: '2025-02-21',
     },
     durationDays: 3,
     approver: 'Орлова К.М.',
     comment: 'Ожидается подтверждение медицинской справки',
+    history: [
+      {
+        id: 'vac_hist_002',
+        createdAt: '2025-02-18T11:05:00+03:00',
+        status: 'pending',
+        period: { start: '2025-02-19', end: '2025-02-21' },
+        comment: 'Запрос создан сотрудником',
+      },
+    ],
   },
@@
 export const vacationSummary = {
   total: 5,
   pending: 2,
   approved: 2,
   upcoming: 1,
 };
*** End Patch
PATCH
```

3. **Provide RU status/type dictionaries for exports and UI**
   - **File:** `src/utils/format.ts`
   - **Changes:** Add helper maps for `VacationRequestStatus`/`VacationRequestType` → RU strings + expose `formatTimeZoneRu` utility referenced by drawer/profile.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/utils/format.ts
@@
 export const formatPhone = (value?: string) => {
   if (!value) {
     return '—';
   }
   return value
     .replace(/[^\d+]/g, '')
     .replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 ($2) $3-$4-$5');
 };
+
+export const VACATION_STATUS_LABEL: Record<VacationRequestStatus, string> = {
+  approved: 'Одобрено',
+  pending: 'На рассмотрении',
+  rejected: 'Отклонено',
+  cancelled: 'Отменено',
+};
+
+export const VACATION_TYPE_LABEL: Record<VacationRequestType, string> = {
+  annual: 'Ежегодный отпуск',
+  unpaid: 'Отпуск без оплаты',
+  sick_leave: 'Больничный лист',
+  maternity: 'Декретный отпуск',
+  study: 'Учебный отпуск',
+};
+
+export const formatTimeZoneRu = (tz: string) => (tz === 'Europe/Moscow' ? 'МСК (UTC+3)' : tz);
*** End Patch
PATCH
```

## Phase 2: Work Structure Drawer Search & Layout State

### Overview
Implement the searchable organisational hierarchy, connect it to layout state, and surface the selected unit per CH2 (image162–163) while keeping drawer accessible via wrappers.

### Changes Required:

1. **Introduce shared org selection context**
   - **File:** `src/components/OrgSelectionContext.tsx` (new)
   - **Changes:** Provide context with selected org node + setter so pages can react later.
```bash
cat <<'FILE' > src/components/OrgSelectionContext.tsx
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { WorkStructureNode, WorkStructureSearchIndex } from '../types/index';

export interface OrgSelection {
  nodeId: string;
  label: string;
  path: string[];
}

interface OrgSelectionContextValue {
  selection: OrgSelection | null;
  setSelection: (value: OrgSelection | null) => void;
  tree: WorkStructureNode[];
  index: WorkStructureSearchIndex[];
}

const OrgSelectionContext = createContext<OrgSelectionContextValue | undefined>(undefined);

export const useOrgSelection = () => {
  const ctx = useContext(OrgSelectionContext);
  if (!ctx) {
    throw new Error('useOrgSelection must be used within OrgSelectionProvider');
  }
  return ctx;
};

interface Props {
  children: ReactNode;
  tree: WorkStructureNode[];
  index: WorkStructureSearchIndex[];
  defaultSelection?: OrgSelection | null;
}

export const OrgSelectionProvider = ({ children, tree, index, defaultSelection }: Props) => {
  const [selection, setSelectionState] = useState<OrgSelection | null>(defaultSelection ?? null);

  const setSelection = useCallback((value: OrgSelection | null) => {
    setSelectionState(value);
  }, []);

  const value = useMemo<OrgSelectionContextValue>(
    () => ({ selection, setSelection, tree, index }),
    [selection, tree, index]
  );

  return <OrgSelectionContext.Provider value={value}>{children}</OrgSelectionContext.Provider>;
};
FILE
```

2. **Upgrade WorkStructureDrawer with search, tree, and selection callbacks**
   - **File:** `src/components/WorkStructureDrawer.tsx`
   - **Changes:** Add search input, highlight active node, allow selecting nodes to update context, apply RU timezone helper.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/WorkStructureDrawer.tsx
@@
-import type { ReactNode } from 'react';
-import { Dialog } from '../wrappers';
-import type { Employee } from '../types/index';
-import { formatPhone } from '../utils/format';
+import { ReactNode, useMemo, useState } from 'react';
+import { Dialog, FormField } from '../wrappers';
+import type { Employee, WorkStructureNode, WorkStructureSearchIndex } from '../types/index';
+import { formatPhone, formatTimeZoneRu, VACATION_STATUS_LABEL } from '../utils/format';
+import { useOrgSelection } from './OrgSelectionContext';
@@
-interface WorkStructureDrawerProps {
-  trigger: ReactNode;
-  employee: Employee;
-}
+interface WorkStructureDrawerProps {
+  trigger: ReactNode;
+  employee: Employee;
+}
@@
-const WorkStructureDrawer = ({ trigger, employee }: WorkStructureDrawerProps) => {
-  const path = employee.structurePath ?? [];
-  const tree = employee.structureTree ?? [];
+const WorkStructureDrawer = ({ trigger, employee }: WorkStructureDrawerProps) => {
+  const path = employee.structurePath ?? [];
+  const tree = employee.structureTree ?? [];
+  const index = employee.structureIndex ?? [];
   const emergency = employee.emergencyContact ?? employee.personalInfo.emergencyContact;
   const contacts = employee.contacts;
   const workSettings = employee.workSettings;
   const managerName = employee.managerName ?? (typeof employee.workInfo.manager === 'string'
     ? employee.workInfo.manager
     : employee.workInfo.manager.fullName);
+  const { selection, setSelection } = useOrgSelection();
+  const [query, setQuery] = useState('');
+
+  const normalizedIndex = useMemo(
+    () =>
+      index.map((item) => ({
+        ...item,
+        searchable: `${item.label} ${item.path.join(' ')}`.toLowerCase(),
+      })),
+    [index]
+  );
+
+  const filteredResults = useMemo(() => {
+    if (!query.trim()) {
+      return normalizedIndex;
+    }
+    const q = query.trim().toLowerCase();
+    return normalizedIndex.filter((item) => item.searchable.includes(q));
+  }, [normalizedIndex, query]);
+
+  const handleSelect = (node: WorkStructureSearchIndex) => {
+    setSelection({ nodeId: node.nodeId, label: node.label, path: node.path });
+  };
@@
-      <div className="flex flex-col gap-8">
+      <div className="flex flex-col gap-8">
+        <section className="space-y-3">
+          <SectionTitle>Поиск подразделения</SectionTitle>
+          <FormField
+            label="Введите название подразделения"
+            name="org-search"
+            renderInput={(props) => (
+              <input
+                {...props}
+                type="search"
+                value={query}
+                onChange={(event) => setQuery(event.target.value)}
+                placeholder="Например, Группа 2_1"
+                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
+              />
+            )}
+            hint="Поддерживаются части названия и иерархии (CH2, image163)."
+          />
+          {filteredResults.length > 0 ? (
+            <ul className="max-h-48 overflow-y-auto rounded-md border border-slate-200 text-sm">
+              {filteredResults.map((item) => {
+                const isActive = selection?.nodeId === item.nodeId;
+                return (
+                  <li key={item.nodeId}>
+                    <button
+                      type="button"
+                      onClick={() => handleSelect(item)}
+                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition hover:bg-blue-50 ${
+                        isActive ? 'bg-blue-100 text-blue-700' : ''
+                      }`}
+                    >
+                      <span>{item.label}</span>
+                      <span className="text-xs text-slate-500">{item.path.join(' / ')}</span>
+                    </button>
+                  </li>
+                );
+              })}
+            </ul>
+          ) : (
+            <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
+              Совпадений не найдено
+            </p>
+          )}
+        </section>
@@
-          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
+          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
             <SectionTitle>Рабочие параметры</SectionTitle>
             <dl className="mt-3 space-y-2 text-sm text-slate-700">
               <div className="flex justify-between gap-4">
                 <dt className="text-slate-500">Офис</dt>
                 <dd className="text-right font-medium text-slate-900">{workSettings?.office}</dd>
               </div>
               <div className="flex justify-between gap-4">
                 <dt className="text-slate-500">Часовой пояс</dt>
-                <dd className="text-right font-medium text-slate-900">{workSettings?.timeZone}</dd>
+                <dd className="text-right font-medium text-slate-900">
+                  {workSettings?.timeZone ? formatTimeZoneRu(workSettings.timeZone) : '—'}
+                </dd>
               </div>
@@
-          <section className="rounded-lg border border-slate-200 p-4">
-            <SectionTitle>Дерево подразделений</SectionTitle>
-            <ul className="mt-3 space-y-3 text-sm text-slate-700">
-              {tree.map((node) => (
-                <li key={node.id}>
-                  <p className="font-medium text-slate-900">{node.label}</p>
-                  {node.children ? (
-                    <ul className="mt-2 space-y-1 border-l border-dashed border-slate-300 pl-4">
-                      {node.children.map((child) => (
-                        <li key={child.id}>
-                          <span>{child.label}</span>
-                        </li>
-                      ))}
-                    </ul>
-                  ) : null}
-                </li>
-              ))}
-            </ul>
-          </section>
+          <section className="rounded-lg border border-slate-200 p-4">
+            <SectionTitle>Дерево подразделений</SectionTitle>
+            <OrgTreeList nodes={tree} activeId={selection?.nodeId} onSelectNode={setSelection} />
+          </section>
@@
-      </div>
+      </div>
     </Dialog>
   );
 };
+
+interface OrgTreeListProps {
+  nodes: WorkStructureNode[];
+  activeId?: string | null;
+  onSelectNode: (selection: { nodeId: string; label: string; path: string[] } | null) => void;
+  trail?: string[];
+}
+
+const OrgTreeList = ({ nodes, activeId, onSelectNode, trail = [] }: OrgTreeListProps) => {
+  if (!nodes.length) {
+    return null;
+  }
+
+  return (
+    <ul className="mt-3 space-y-3 text-sm text-slate-700">
+      {nodes.map((node) => {
+        const nextTrail = [...trail, node.label];
+        const isActive = node.id === activeId;
+        return (
+          <li key={node.id}>
+            <button
+              type="button"
+              onClick={() => onSelectNode({ nodeId: node.id, label: node.label, path: nextTrail })}
+              className={`w-full rounded-md px-3 py-2 text-left transition hover:bg-blue-50 ${
+                isActive ? 'bg-blue-100 text-blue-700' : 'bg-transparent'
+              }`}
+            >
+              {node.label}
+            </button>
+            {node.children ? (
+              <div className="mt-2 border-l border-dashed border-slate-300 pl-4">
+                <OrgTreeList nodes={node.children} activeId={activeId} onSelectNode={onSelectNode} trail={nextTrail} />
+              </div>
+            ) : null}
+          </li>
+        );
+      })}
+    </ul>
+  );
+};
*** End Patch
PATCH
```

3. **Wrap Layout with OrgSelectionProvider & expose selected unit**
   - **File:** `src/components/Layout.tsx`
   - **Changes:** Derive default selection from mock employee, use context provider, display active unit in header summary, and pass selection down via outlet context.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-import { NavLink, Outlet } from 'react-router-dom';
-import WorkStructureDrawer from './WorkStructureDrawer';
-import { mockEmployee } from '../data/mockData';
+import { NavLink, Outlet } from 'react-router-dom';
+import WorkStructureDrawer from './WorkStructureDrawer';
+import { mockEmployee } from '../data/mockData';
+import { OrgSelectionProvider, useOrgSelection } from './OrgSelectionContext';
@@
-const Layout = () => {
-  const employee = mockEmployee;
-
-  return (
-    <div className="min-h-screen bg-slate-50 text-slate-900">
+const InnerLayout = () => {
+  const employee = mockEmployee;
+  const { selection } = useOrgSelection();
+
+  return (
+    <div className="min-h-screen bg-slate-50 text-slate-900">
       <header className="border-b border-slate-200 bg-white shadow-sm">
         <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-5">
           <div className="flex items-center justify-between gap-6">
             <div className="flex flex-col">
               <span className="text-xs uppercase tracking-wide text-blue-600">Naumen WFM</span>
-              <h1 className="text-xl font-semibold text-slate-900">Личный кабинет сотрудника</h1>
+              <h1 className="text-xl font-semibold text-slate-900">Личный кабинет сотрудника</h1>
+              {selection ? (
+                <span className="mt-1 text-xs text-slate-500">
+                  Текущее подразделение: {selection.path.join(' / ')}
+                </span>
+              ) : null}
             </div>
@@
-              <WorkStructureDrawer
-                employee={employee}
-                trigger={
+              <WorkStructureDrawer
+                employee={employee}
+                trigger={
@@
-  );
-};
-
-export default Layout;
+  );
+};
+
+const Layout = () => {
+  const employee = mockEmployee;
+
+  const defaultSelection = employee.structureIndex?.find((entry) =>
+    entry.nodeId === employee.structurePath?.slice(-1)[0]
+  );
+
+  return (
+    <OrgSelectionProvider
+      tree={employee.structureTree ?? []}
+      index={employee.structureIndex ?? []}
+      defaultSelection={
+        defaultSelection
+          ? {
+              nodeId: defaultSelection.nodeId,
+              label: defaultSelection.label,
+              path: defaultSelection.path,
+            }
+          : null
+      }
+    >
+      <InnerLayout />
+    </OrgSelectionProvider>
+  );
+};
+
+export default Layout;
*** End Patch
PATCH
```

4. **Expose selected org to routed pages**
   - **File:** `src/App.tsx`
   - **Changes:** Supply outlet context so Dashboard/Requests/Profile can consume selection later via `useOutletContext`.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-import Layout from './components/Layout';
+import Layout from './components/Layout';
+import { useOrgSelection } from './components/OrgSelectionContext';
@@
-export default function App() {
-  return (
-    <Routes>
-      <Route element={<Layout />}>
+export function LayoutOutlet() {
+  const { selection } = useOrgSelection();
+  return <Outlet context={{ orgSelection: selection }} />;
+}
+
+export default function App() {
+  return (
+    <Routes>
+      <Route element={<Layout />}>
-        <Route index element={<Dashboard />} />
-        <Route path="vacation-requests" element={<VacationRequests />} />
-        <Route path="profile" element={<Profile />} />
+        <Route element={<LayoutOutlet />}>
+          <Route index element={<Dashboard />} />
+          <Route path="vacation-requests" element={<VacationRequests />} />
+          <Route path="profile" element={<Profile />} />
+        </Route>
       </Route>
     </Routes>
   );
 }
*** End Patch
PATCH
```

## Phase 3: Vacation Requests — History Dialog & RU Export

### Overview
Implement the "Заявки за период" modal, RU-localised CSV export, and meaningful button behaviours to close EP‑VR gaps from CH5 (image76/79).

### Changes Required:

1. **Add RU dictionary usage + history dialog state**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Import RU helpers, track history dialog open state, and derive RU labels for counters/export.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-import { downloadCsv } from '../utils/export';
+import { downloadCsv } from '../utils/export';
+import { VACATION_STATUS_LABEL, VACATION_TYPE_LABEL } from '../utils/format';
@@
-const VacationRequests = () => {
+const VacationRequests = () => {
   const [filters, setFilters] = useState(initialFilters);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [quickAddOpen, setQuickAddOpen] = useState(false);
+  const [historyOpen, setHistoryOpen] = useState(false);
+  const [historySource, setHistorySource] = useState<VacationRequest | null>(null);
@@
-  const exportToCsv = () => {
-    const rows = filteredRequests.map((request) => ({
-      Номер: request.id,
-      'Дата создания': formatDate(request.requestedAt),
-      Тип: request.type,
-      Статус: request.status,
-      'Период c': formatDate(request.period.start),
-      'Период по': formatDate(request.period.end),
-      'Количество дней': request.durationDays,
-      Согласующий: request.approver ?? '—',
-      Комментарий: request.comment ?? '—',
-    }));
+  const exportToCsv = () => {
+    const rows = filteredRequests.map((request) => ({
+      Номер: request.id,
+      'Дата создания': formatDate(request.requestedAt),
+      Тип: request.typeLabel ?? VACATION_TYPE_LABEL[request.type],
+      Статус: request.statusLabel ?? VACATION_STATUS_LABEL[request.status],
+      'Период c': formatDate(request.period.start),
+      'Период по': formatDate(request.period.end),
+      'Количество дней': request.durationDays,
+      Согласующий: request.approver ?? '—',
+      Комментарий: request.comment ?? '—',
+    }));
@@
-    downloadCsv('vacation-requests.csv', rows);
+    downloadCsv('zayavki-za-period.csv', rows);
+  };
+
+  const openHistory = (request: VacationRequest) => {
+    setHistorySource(request);
+    setHistoryOpen(true);
   };
*** End Patch
PATCH
```

2. **Render history dialog and attach to actions**
   - **File:** `src/pages/VacationRequests.tsx`
   - **Changes:** Add history dialog component referencing manual CH5, wire buttons ("Заявки за период" + per-row action) to open it, ensure RU copy.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/VacationRequests.tsx
@@
-      <div className="flex flex-wrap items-center gap-3">
-        <Button variant="secondary" onClick={() => console.log('TODO: построить график')}>
-          Построить график отпусков
-        </Button>
-        <Button variant="outline" onClick={() => console.log('TODO: импорт графика')}>
-          Импорт графика
-        </Button>
-        <Button onClick={exportToCsv}>Экспорт заявок</Button>
-      </div>
+      <div className="flex flex-wrap items-center gap-3">
+        <Button variant="secondary" onClick={() => setHistoryOpen(true)}>
+          Заявки за период
+        </Button>
+        <Button variant="outline" onClick={() => window.alert('Импорт отпусков доступен менеджеру (CH5 §5.4)')}>
+          Импорт графика
+        </Button>
+        <Button onClick={exportToCsv}>Экспорт заявок</Button>
+      </div>
@@
-            <Button variant="ghost" size="xs" onClick={() => console.log('history')}>
-              История
-            </Button>
+            <Button variant="ghost" size="xs" onClick={() => openHistory(request)}>
+              История
+            </Button>
@@
-      <QuickAddVacationDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} onSubmit={handleCreateRequest} />
+      <QuickAddVacationDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} onSubmit={handleCreateRequest} />
+      <VacationHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} request={historySource} />
     </div>
   );
 };
@@
 export default VacationRequests;
+
+interface VacationHistoryDialogProps {
+  open: boolean;
+  onOpenChange: (open: boolean) => void;
+  request: VacationRequest | null;
+}
+
+const VacationHistoryDialog = ({ open, onOpenChange, request }: VacationHistoryDialogProps) => {
+  if (!request) {
+    return null;
+  }
+
+  const entries = request.history ?? [];
+
+  return (
+    <Dialog
+      open={open}
+      onOpenChange={onOpenChange}
+      title="Заявки за период"
+      description="История изменений по выбранной заявке (CH5, image79)."
+      size="lg"
+      variant="modal"
+      testId="vacation-history"
+    >
+      <div className="space-y-4">
+        <header className="flex items-center justify-between">
+          <div>
+            <h3 className="text-sm font-semibold text-slate-900">{request.typeLabel ?? VACATION_TYPE_LABEL[request.type]}</h3>
+            <p className="text-xs text-slate-500">
+              Период: {formatDate(request.period.start)} — {formatDate(request.period.end)}
+            </p>
+          </div>
+          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
+            {request.statusLabel ?? VACATION_STATUS_LABEL[request.status]}
+          </div>
+        </header>
+
+        {entries.length > 0 ? (
+          <ul className="space-y-3">
+            {entries.map((entry) => (
+              <li key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
+                <div className="flex items-center justify-between">
+                  <span className="text-sm font-medium text-slate-900">
+                    {VACATION_STATUS_LABEL[entry.status]}
+                  </span>
+                  <span className="text-xs text-slate-500">{formatDate(entry.createdAt)}</span>
+                </div>
+                <p className="mt-1 text-xs text-slate-500">
+                  Период: {formatDate(entry.period.start)} — {formatDate(entry.period.end)}
+                </p>
+                {entry.comment ? <p className="mt-2 text-sm text-slate-700">{entry.comment}</p> : null}
+                {entry.approver ? (
+                  <p className="mt-2 text-xs text-slate-500">Согласующий: {entry.approver}</p>
+                ) : null}
+              </li>
+            ))}
+          </ul>
+        ) : (
+          <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
+            История изменений пока отсутствует
+          </p>
+        )}
+      </div>
+    </Dialog>
+  );
+};
*** End Patch
PATCH
```

3. **Document RU status labels in export helper**
   - **File:** `src/utils/export.ts`
   - **Changes:** Ensure export uses UTF-8 BOM for RU compatibility and docstring citing CH5.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/utils/export.ts
@@
-export const downloadCsv = (filename: string, rows: Record<string, string | number>[]) => {
-  const headers = Object.keys(rows[0] ?? {});
-  const csv = [headers.join(';'), ...rows.map((row) => headers.map((key) => row[key]).join(';'))].join('\n');
-  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
+export const downloadCsv = (filename: string, rows: Record<string, string | number>[]) => {
+  const headers = Object.keys(rows[0] ?? {});
+  const csv = [headers.join(';'), ...rows.map((row) => headers.map((key) => row[key]).join(';'))].join('\n');
+  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
   const link = document.createElement('a');
   link.href = URL.createObjectURL(blob);
   link.setAttribute('download', filename);
   link.click();
   URL.revokeObjectURL(link.href);
 };
*** End Patch
PATCH
```

## Phase 4: Profile — Appendix 1 & Self-Service

### Overview
Expose Appendix 1 identifiers, calendar/scheme history, and CH2 self-service actions on the Profile screen, driven by new mock data.

### Changes Required:

1. **Surface Appendix 1 identifiers and RU copy**
   - **File:** `src/pages/Profile.tsx`
   - **Changes:** Add sections for personnel number, message type, external IDs, calendar/scheme history, plus buttons for avatar/password updates with stubbed handlers.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Profile.tsx
@@
-import { Employee } from '../types/index';
+import { Employee } from '../types/index';
+import { useOrgSelection } from '../components/OrgSelectionContext';
@@
-const Profile = () => {
+const Profile = () => {
   const [isEditing, setIsEditing] = useState(false);
   const [formState, setFormState] = useState(() => buildFormState(employee));
   const [toast, setToast] = useState<ToastState>(null);
+  const { selection } = useOrgSelection();
@@
         <section className="space-y-6">
           <header className="flex flex-wrap items-center justify-between gap-4">
             <div>
               <h2 className="text-lg font-semibold text-slate-900">Личная информация</h2>
               <p className="text-sm text-slate-500">Данные сотрудника согласно Appendix 1.</p>
             </div>
             <div className="flex items-center gap-3">
+              {selection ? (
+                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
+                  {selection.path.join(' / ')}
+                </span>
+              ) : null}
               <Button variant="outline" onClick={() => setIsEditing((state) => !state)}>
                 {isEditing ? 'Отмена' : 'Редактировать'}
               </Button>
               {isEditing ? (
@@
-          <div className="grid gap-6 md:grid-cols-2">
+          <div className="grid gap-6 md:grid-cols-2">
             <Card title="Основные данные" description="Имя, контакты, должность">
@@
                 <FormField label="Персональный номер" name="personnelNumber">
-                  {employee.personnelNumber ?? '—'}
+                  {employee.personnelNumber ?? '—'}
                 </FormField>
                 <FormField label="Тип уведомлений" name="messageType">
-                  {employee.messageType ?? 'email'}
+                  {formatMessageType(employee.messageType)}
                 </FormField>
@@
               <Card title="Служебные идентификаторы" description="Внешние системы и доступы">
                 <FormField label="WFM логин" name="credentials.wfmLogin">
                   {employee.credentials.wfmLogin}
                 </FormField>
                 <FormField label="Внешние логины" name="credentials.externalLogins">
                   {employee.credentials.externalLogins.join(', ')}
                 </FormField>
+                <FormField label="Внешние системы" name="externalSystemIds">
+                  {employee.externalSystemIds && employee.externalSystemIds.length > 0
+                    ? employee.externalSystemIds.map((item) => `${item.system}: ${item.value}`).join(', ')
+                    : '—'}
+                </FormField>
               </Card>
@@
-          <Card title="Адрес и рабочие настройки" description="Адрес проживания, офис и график">
+          <Card title="Адрес и рабочие настройки" description="Адрес проживания, офис и график">
             <div className="grid gap-6 md:grid-cols-2">
               <FormField label="Фактический адрес" name="personalInfo.address">
                 {employee.personalInfo.address ?? '—'}
               </FormField>
@@
               <FormField label="Рабочая схема" name="orgPlacement.workScheme">
                 {employee.orgPlacement.workScheme?.name ?? '—'}
               </FormField>
+              <FormField label="Идентификатор календаря" name="calendarId">
+                {employee.calendarId ?? '—'}
+              </FormField>
+              <FormField label="График (ID)" name="scheduleSchemeId">
+                {employee.scheduleSchemeId ?? '—'}
+              </FormField>
             </div>
+            <HistoryList
+              label="История календаря"
+              entries={employee.workCalendarHistory?.map((entry) => ({
+                id: entry.id,
+                title: entry.name,
+                effectiveFrom: entry.effectiveFrom,
+                effectiveTo: entry.effectiveTo,
+              })) ?? []}
+            />
+            <HistoryList
+              label="История схем"
+              entries={employee.schemeHistory?.map((entry) => ({
+                id: entry.id,
+                title: entry.name,
+                effectiveFrom: entry.effectiveFrom,
+                effectiveTo: entry.effectiveTo,
+              })) ?? []}
+            />
           </Card>
@@
-          <Card title="Инструменты самообслуживания" description="Обновление пароля, фото и настроек уведомлений">
-            <div className="flex flex-wrap items-center gap-3">
-              <Button variant="secondary" onClick={() => console.log('reset password')}>
-                Сбросить пароль
-              </Button>
-              <Button variant="outline" onClick={() => console.log('upload avatar')}>
-                Обновить фото профиля
-              </Button>
-              <Button variant="ghost" onClick={() => console.log('notification prefs')}>
-                Настройки уведомлений
-              </Button>
-            </div>
-          </Card>
+          <Card title="Инструменты самообслуживания" description="Обновление пароля, фото и настроек уведомлений">
+            <div className="flex flex-wrap items-center gap-3">
+              <Button
+                variant="secondary"
+                disabled={!employee.allowPasswordReset}
+                onClick={() => window.alert('Ссылка на сброс пароля отправлена на корпоративную почту')}
+              >
+                Сбросить пароль
+              </Button>
+              <Button
+                variant="outline"
+                disabled={!employee.allowAvatarUpload}
+                onClick={() => window.alert('Загрузите файл JPG/PNG до 5 МБ (CH2, image175)')}
+              >
+                Обновить фото профиля
+              </Button>
+              <Button variant="ghost" onClick={() => window.alert('Настройки уведомлений пока доступны через менеджера')}>
+                Настройки уведомлений
+              </Button>
+            </div>
+          </Card>
@@
 const Card = ({ title, description, children }: CardProps) => (
   <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
     <header>
       <h3 className="text-md font-semibold text-slate-900">{title}</h3>
       <p className="text-sm text-slate-500">{description}</p>
     </header>
     {children}
   </section>
 );
+
+interface HistoryListProps {
+  label: string;
+  entries: Array<{ id: string; title: string; effectiveFrom: string; effectiveTo?: string }>;
+}
+
+const HistoryList = ({ label, entries }: HistoryListProps) => {
+  if (entries.length === 0) {
+    return null;
+  }
+
+  return (
+    <div className="space-y-2">
+      <h4 className="text-sm font-semibold text-slate-800">{label}</h4>
+      <ul className="space-y-2">
+        {entries.map((entry) => (
+          <li key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
+            <div className="font-medium text-slate-900">{entry.title}</div>
+            <div className="text-slate-500">
+              {formatDate(entry.effectiveFrom)} — {entry.effectiveTo ? formatDate(entry.effectiveTo) : 'по настоящее время'}
+            </div>
+          </li>
+        ))}
+      </ul>
+    </div>
+  );
+};
+
+const formatMessageType = (value: Employee['messageType']) => {
+  switch (value) {
+    case 'phone':
+      return 'Телефон';
+    case 'messenger':
+      return 'Мессенджер';
+    case 'email':
+    default:
+      return 'Электронная почта';
+  }
+};
*** End Patch
PATCH
```

## Phase 5: Tests & Fixtures

### Overview
Update Vitest suites to cover drawer search/selection, history dialog export, and profile Appendix 1 fields to prevent regressions.

### Changes Required:

1. **Extend Work Structure drawer test**
   - **File:** `src/__tests__/Layout.work-structure.test.tsx`
   - **Changes:** Add assertions for search results, selection highlight, and RU timezone.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/__tests__/Layout.work-structure.test.tsx
@@
-  const trigger = screen.getByRole('button', { name: /Рабочая структура/i });
-  await user.click(trigger);
+  const trigger = screen.getByRole('button', { name: /Рабочая структура/i });
+  await user.click(trigger);
@@
-  expect(screen.getByText('Контакты')).toBeInTheDocument();
+  expect(screen.getByText('Контакты')).toBeInTheDocument();
+  const search = screen.getByRole('searchbox', { name: /Введите название подразделения/i });
+  await user.type(search, 'Группа 2_2');
+  const result = await screen.findByRole('button', { name: /Группа 2_2/i });
+  await user.click(result);
+  expect(result).toHaveClass('bg-blue-100');
+  expect(await screen.findByText(/Текущее подразделение/im)).toBeInTheDocument();
+  expect(screen.getByText('МСК (UTC+3)')).toBeInTheDocument();
*** End Patch
PATCH
```

2. **Add history dialog & export coverage**
   - **File:** `src/__tests__/VacationRequests.test.tsx`
   - **Changes:** Assert RU CSV headers, BOM presence, and dialog rendering.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/__tests__/VacationRequests.test.tsx
@@
-  it('exports requests to CSV', async () => {
+  it('exports requests to CSV with RU headers', async () => {
     const user = userEvent.setup();
     render(<VacationRequests />);
@@
-    const csvBlob = new Blob([mockAnchor.downloadCalls[0].content], { type: 'text/csv' });
-    const text = await csvBlob.text();
-    expect(text).toContain('Номер;Дата создания;Тип;Статус;Период c;Период по;Количество дней;Согласующий;Комментарий');
+    const csvBlob = new Blob([mockAnchor.downloadCalls[0].content], { type: 'text/csv' });
+    const text = await csvBlob.text();
+    expect(text).toContain('Номер;Дата создания;Тип;Статус');
+    expect(text).toContain('Одобрено');
+  });
+
+  it('opens history dialog with RU status labels', async () => {
+    const user = userEvent.setup();
+    render(<VacationRequests />);
+
+    await user.click(screen.getAllByRole('button', { name: /История/i })[0]);
+
+    expect(await screen.findByRole('dialog', { name: /Заявки за период/i })).toBeInTheDocument();
+    expect(screen.getByText('Одобрено')).toBeInTheDocument();
   });
*** End Patch
PATCH
```

3. **Cover Appendix 1 fields on Profile**
   - **File:** `src/__tests__/Profile.test.tsx`
   - **Changes:** Assert new identifiers, calendar history, and self-service buttons.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/__tests__/Profile.test.tsx
@@
-  it('renders personal info sections', () => {
+  it('renders Appendix 1 identifiers and history blocks', () => {
     render(<Profile />);
-    expect(screen.getByText(/Персональный номер/i)).toBeInTheDocument();
-    expect(screen.getByText(/Настройки уведомлений/i)).toBeInTheDocument();
+    expect(screen.getByText('Персональный номер')).toBeInTheDocument();
+    expect(screen.getByText('Идентификатор календаря')).toBeInTheDocument();
+    expect(screen.getByText(/История календаря/i)).toBeInTheDocument();
+    expect(screen.getByRole('button', { name: /Сбросить пароль/i })).not.toBeDisabled();
   });
*** End Patch
PATCH
```

## Phase 6: Documentation & UAT Artefacts

### Overview
Mirror the implementation changes across parity documentation, UAT packs, and screenshots so the next UAT pass has guidance and evidence.

### Changes Required:

1. **Update manual crosswalk & parity packs**
   - `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`: add Work Structure search steps, reference image162/163, note new history dialog.
   - `docs/Tasks/uat-packs/parity_static.md` & `docs/Tasks/uat-packs/trimmed_smoke.md`: mark EP‑WS, EP‑VR, EP‑PR rows with new steps (history dialog, Appendix 1 fields, RU CSV export).

2. **Refresh screenshot references**
   - Capture new screenshots (`portal-work-structure-search.png`, `portal-vacation-history.png`, `portal-profile-appendix.png`) and add to `docs/SCREENSHOT_INDEX.md` + `docs/Tasks/screenshot-checklist.md`.

3. **Sync Coordinator docs & reports**
   - Update `docs/Workspace/Coordinator/employee-portal/CodeMap.md` (new file:line references, context provider) and `UAT_Findings_2025-10-13_template.md` (close EP gaps).
   - Mirror status in `docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, PARITY_MVP_CHECKLISTS.md, CHART_COVERAGE_BY_DEMO.md, APPENDIX1_SCOPE_CROSSWALK.md}` and `docs/Reports/PARITY_MVP_CHECKLISTS.md`.
   - Append learning log entries for history export localisation resolution and Appendix 1 completion.

4. **Handoff & tracker updates**
   - Log plan execution + results in `docs/SESSION_HANDOFF.md` and update `docs/Tasks/post-phase9-demo-execution.md` row (Employee Portal → Completed once UAT passes).

## Tests & Validation
- `npm_config_workspaces=false npm run lint` (if lint script exists) — should pass without new warnings.
- `npm_config_workspaces=false npm run build` — succeeds without type errors.
- `npm_config_workspaces=false npm run test -- --run` — Vitest suite passes; expect existing Radix `act` warnings only.
- Manual verification: open `npm run preview` (or Vercel deploy) and run `docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md}` focusing on Work Structure search, history dialog, RU export, Appendix 1 fields.
- Capture updated screenshots and attach to UAT evidence bundle (`~/Desktop/tmp-employee-portal-uat/`).

## Rollback
- To discard code changes: `git checkout -- src/components/OrgSelectionContext.tsx src/components/Layout.tsx src/components/WorkStructureDrawer.tsx src/App.tsx src/pages/VacationRequests.tsx src/pages/Profile.tsx src/types/index.ts src/data/mockData.ts src/utils/format.ts src/utils/export.ts src/__tests__/Layout.work-structure.test.tsx src/__tests__/VacationRequests.test.tsx src/__tests__/Profile.test.tsx`.
- To remove new file: `git rm src/components/OrgSelectionContext.tsx` if commit not yet made.
- Revert documentation updates individually using `git checkout -- docs/...` where necessary.
- If deploy introduced regressions, redeploy previous commit hash recorded in `docs/SESSION_HANDOFF.md` via `vercel deploy --prod --yes -- --target=previous`.

## Handoff
- Record plan completion + implementation summary in `docs/SESSION_HANDOFF.md` under Planner with link `plans/2025-11-01_employee-portal-parity-remediation.plan.md` and highlight validation commands.
- Call out required screenshots and UAT packs for executor.
- Ensure `PROGRESS.md` references this plan as the active execution target for Employee Portal parity remediation.
