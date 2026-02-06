# Plan — Manager Portal Behaviour Parity (Navigation, Requests, Reporting)

## Metadata
- Task: Manager Portal parity follow-up (navigation tree, CH5 request workflows, reporting hooks)
- Planner: manager-portal-plan-2025-10-27-codex
- Source scout: docs/Tasks/manager-portal_parity-scout-2025-10-26-codex.task.md
- Additional references: docs/Workspace/Coordinator/manager-portal/CodeMap.md, docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md, uat-agent-tasks/manual_manager-portal-crosswalk.md, docs/Archive/UAT/2025-10-13_real-vs-demo-comparison.md, /Users/m/Desktop/e.tex, CH2_Login_System.md §2.1–2.3, CH3_Employees.md §3.0, CH5_Schedule_Advanced.md §5.4, CH6_Reports.md §6.1–§6.3
- Target repo: ${MANAGER_PORTAL_REPO}

## Desired End State
Managers navigating the demo see the same top-level modules as the real Naumen shell, can pick organisational units via a "Рабочая структура" drawer, and the dashboard/approvals/teams screens filter to that unit. The approvals workflow exposes CH5 categories (schedule change vs shift exchange vs absence), supports bulk approve/reject with note handling, and shows shift pair details. Reporting actions surface export buttons tied to the correct report types, and the Reports page lists available downloads with RU copy. Tests cover the new adapters, selection behaviour, and RU labels; docs and coordinator artefacts reflect the new flows. Verification: `npm run test -- --run --test-timeout=2000`, `npm run build`, run `docs/Tasks/uat-packs/parity_static.md` + `trimmed_smoke.md` dashboard/approvals passes, confirm drawer toggles and bulk actions in preview.

### Key Discoveries
- Layout currently hardcodes sidebar items and lacks module header or org drawer (`${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:10-120`).
- Dashboards/approvals pull data from global mocks without org filtering (`${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:2-82`, `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:20-239`).
- Mock data has only four request types and no category metadata (`${MANAGER_PORTAL_REPO}/src/data/mockData.ts:10-200`), while manual CH5 §5.4 highlights shift exchange, replacements, and bulk processing.
- Reports route is placeholder only (`${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-27`); manual CH6 §6.1–§6.3 expects T-13 & deviation exports from approvals context.
- Unified shell references require coordination (docs/Workspace/Coordinator/unified-demo/CodeMap.md, docs/SESSION_HANDOFF.md:760-782) so new tabs wire cleanly when the shell deploy is restored.

## What We're NOT Doing
- No backend integration or real API calls—mock data only.
- No visual redesign beyond adding required controls; keep existing Tailwind styling where possible.
- No rework of chart wrappers beyond using existing props.
- No unified shell code changes outside docs/coordination steps.
- No Employee Portal or Analytics changes.

## Implementation Approach
Reuse the existing Chart.js wrappers and dialog/table components, extending them minimally to match the manual. Add organisational metadata to mocks and flow it through adapters so the dashboard, approvals, and teams pages can filter by org unit. Enhance the ReportTable wrapper to support checkbox selection for bulk actions, add category filters and export hooks around the approvals table, and expose module navigation plus an org drawer in the layout. Touch accompanying tests/docs to lock behaviour.

## Phase 1: Navigation & Org Tree Parity

### Overview
Introduce a top-level module header with Russian labels, add a "Рабочая структура" drawer backed by mock data, and filter dashboard/approvals/teams content by the selected unit.

### Changes Required:

#### 1. Add organisational metadata to mocks
**File**: `${MANAGER_PORTAL_REPO}/src/data/mockData.ts`
**Changes**: Add `OrgUnit` type, attach `orgUnitId` to teams, expose `orgUnits` tree, and export helper for filtering by org unit.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
-export interface Team {
+export interface OrgUnit {
+  id: string;
+  name: string;
+  parentId?: string;
+}
+
+export interface Team {
   id: string;
   name: string;
   department: string;
   managerId: string;
+  orgUnitId: string;
   employees: Employee[];
   requests: Request[];
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
 export const mockTeams: Team[] = [
   {
     id: '1',
     name: 'Служба поддержки',
     department: 'Операции',
     managerId: 'mgr1',
+    orgUnitId: 'support',
@@
   {
     id: '2',
     name: 'Отдел продаж',
     department: 'Продажи',
     managerId: 'mgr2',
+    orgUnitId: 'sales',
@@
   {
     id: '3',
     name: 'Команда разработки',
     department: 'Разработка',
     managerId: 'mgr3',
+    orgUnitId: 'engineering',
@@
   {
     id: '4',
     name: 'Отдел кадров',
     department: 'HR',
     managerId: 'mgr4',
+    orgUnitId: 'hr',
@@
   {
     id: '5',
     name: 'Маркетинг',
     department: 'Маркетинг',
     managerId: 'mgr5',
+    orgUnitId: 'marketing',
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
 export const mockTeams: Team[] = [
   {
@@
   },
 ];
+
+export const orgUnits: OrgUnit[] = [
+  { id: 'root', name: 'Головной офис' },
+  { id: 'support', name: 'Контакт-центр', parentId: 'root' },
+  { id: 'sales', name: 'Продажи', parentId: 'root' },
+  { id: 'engineering', name: 'Разработка', parentId: 'root' },
+  { id: 'hr', name: 'HR', parentId: 'root' },
+  { id: 'marketing', name: 'Маркетинг', parentId: 'root' },
+];
+
+export const filterTeamsByOrgUnit = (teams: Team[], orgUnitId: string | null) => {
+  if (!orgUnitId || orgUnitId === 'root') {
+    return teams;
+  }
+  return teams.filter((team) => team.orgUnitId === orgUnitId);
+};
*** End Patch
PATCH
```

#### 2. Add organisation drawer component
**File**: `${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx` (new)
**Changes**: Create drawer listing org units with active selection callback.

```bash
cat <<'PATCH' > src/components/OrgStructureDrawer.tsx
import { Fragment } from 'react';
import Dialog from './common/Dialog';
import type { OrgUnit } from '../data/mockData';

interface OrgStructureDrawerProps {
  open: boolean;
  onClose: () => void;
  units: OrgUnit[];
  activeUnitId: string | null;
  onSelect: (unitId: string | null) => void;
}

const buildTree = (units: OrgUnit[]) => {
  const byParent = new Map<string | undefined, OrgUnit[]>();
  units.forEach((unit) => {
    const bucket = byParent.get(unit.parentId) ?? [];
    bucket.push(unit);
    byParent.set(unit.parentId, bucket);
  });
  return byParent;
};

export default function OrgStructureDrawer({ open, onClose, units, activeUnitId, onSelect }: OrgStructureDrawerProps) {
  const tree = buildTree(units);
  const rootUnits = tree.get(undefined) ?? tree.get('root') ?? [];

  const renderBranch = (unit: OrgUnit, depth = 0) => {
    const children = tree.get(unit.id) ?? [];
    const isActive = activeUnitId === unit.id;
    return (
      <div key={unit.id} className="space-y-1">
        <button
          type="button"
          onClick={() => onSelect(unit.id)}
          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition ${
            isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {unit.name}
        </button>
        {children.length > 0 ? (
          <div className="border-l border-slate-200 pl-2">
            {children.map((child) => renderBranch(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Рабочая структура"
      description="Выберите подразделение, чтобы фильтровать показатели и заявки"
    >
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition ${
            !activeUnitId ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Все подразделения
        </button>
        <div className="space-y-2">
          {rootUnits.map((unit) => (
            <Fragment key={unit.id}>{renderBranch(unit)}</Fragment>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
PATCH
```

#### 3. Update layout with module header and org drawer toggles
**File**: `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx`
**Changes**: Accept module/org props, add header buttons, wire drawer.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-interface LayoutProps {
-  children: React.ReactNode;
-  currentPage: string;
-  onPageChange: (page: string) => void;
-}
-
-export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
-  const navigation = [
+interface LayoutProps {
+  children: React.ReactNode;
+  currentPage: string;
+  onPageChange: (page: string) => void;
+  currentModule: string;
+  onModuleChange: (module: string) => void;
+  activeOrgUnit: string | null;
+  onOrgUnitChange: (unit: string | null) => void;
+}
+
+export default function Layout({
+  children,
+  currentPage,
+  onPageChange,
+  currentModule,
+  onModuleChange,
+  activeOrgUnit,
+  onOrgUnitChange,
+}: LayoutProps) {
+  const modules = [
+    { id: 'forecasts', name: 'Прогнозы' },
+    { id: 'schedule', name: 'Расписание' },
+    { id: 'employees', name: 'Сотрудники' },
+    { id: 'reports', name: 'Отчёты' },
+  ];
+
+  const navigation = [
@@
-  const pageTitles = Object.fromEntries(navigation.map((item) => [item.id, item.name] as const));
+  const pageTitles = Object.fromEntries(navigation.map((item) => [item.id, item.name] as const));
+
+  const [drawerOpen, setDrawerOpen] = React.useState(false);
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
+        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
           <div className="flex h-full flex-col">
@@
-          <div className="flex h-16 items-center px-6">
-            <div className="flex items-center space-x-2">
-              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
-                <Users className="h-5 w-5 text-white" />
-              </div>
-              <span className="text-xl font-bold text-gray-900">WFM Менеджер</span>
-            </div>
-          </div>
+          <div className="flex h-16 items-center px-6">
+            <div className="flex items-center space-x-2">
+              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
+                <Users className="h-5 w-5 text-white" />
+              </div>
+              <span className="text-xl font-bold text-gray-900">Naumen WFM</span>
+            </div>
+          </div>
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
-          <div className="flex h-16 items-center justify-between px-6">
-            <h1 className="text-2xl font-semibold text-gray-900">
-              {pageTitles[currentPage] ?? currentPage}
-            </h1>
-            
-            <div className="flex items-center space-x-4">
-              <button className="relative p-2 text-gray-400 hover:text-gray-500">
-                <Bell className="h-6 w-6" />
-                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
-              </button>
-            </div>
-          </div>
-        </div>
+        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white">
+          <div className="flex h-16 items-center justify-between px-6">
+            <nav className="flex items-center gap-2">
+              {modules.map((module) => (
+                <button
+                  key={module.id}
+                  type="button"
+                  onClick={() => onModuleChange(module.id)}
+                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
+                    currentModule === module.id
+                      ? 'bg-primary-600 text-white'
+                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
+                  }`}
+                >
+                  {module.name}
+                </button>
+              ))}
+            </nav>
+
+            <div className="flex items-center gap-4">
+              <button
+                type="button"
+                onClick={() => setDrawerOpen(true)}
+                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
+              >
+                <BarChart3 className="h-4 w-4" /> Рабочая структура
+              </button>
+              <button className="relative rounded-full p-2 text-gray-400 hover:text-gray-500" aria-label="Уведомления">
+                <Bell className="h-5 w-5" />
+                <span className="absolute top-1 right-1 inline-flex h-3 w-3 rounded-full bg-red-500"></span>
+              </button>
+            </div>
+          </div>
+
+          <div className="border-t border-gray-200 px-6 py-3">
+            <h1 className="text-2xl font-semibold text-gray-900">
+              {pageTitles[currentPage] ?? currentPage}
+            </h1>
+            {activeOrgUnit ? (
+              <p className="text-sm text-slate-600">Отфильтровано по подразделению: {activeOrgUnit}</p>
+            ) : (
+              <p className="text-sm text-slate-500">Показаны все подразделения</p>
+            )}
+          </div>
+        </div>
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
       <div className="pl-64">
@@
         <main className="p-6">
           {children}
         </main>
       </div>
-    </div>
+      <OrgStructureDrawer
+        open={drawerOpen}
+        onClose={() => setDrawerOpen(false)}
+        units={orgUnits}
+        activeUnitId={activeOrgUnit}
+        onSelect={(unit) => {
+          onOrgUnitChange(unit);
+          setDrawerOpen(false);
+        }}
+      />
+    </div>
   );
 }
*** End Patch
PATCH
```

> Import `OrgStructureDrawer` and `orgUnits` at top of `Layout.tsx`.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/Layout.tsx
@@
-import React from 'react';
-import { Users, Calendar, Bell, Settings, LogOut, BarChart3, Clock } from 'lucide-react';
+import React from 'react';
+import { Users, Calendar, Bell, Settings, LogOut, BarChart3, Clock } from 'lucide-react';
+import OrgStructureDrawer from './OrgStructureDrawer';
+import { orgUnits } from '../data/mockData';
*** End Patch
PATCH
```

#### 4. Wire layout state in App and filter teams per org unit
**File**: `${MANAGER_PORTAL_REPO}/src/App.tsx`
**Changes**: Manage module + org unit state, pass filtered teams to pages, create forecasts placeholder route.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-import { useState } from 'react';
-import Layout from './components/Layout';
-import Dashboard from './pages/Dashboard';
-import Teams from './pages/Teams';
-import Approvals from './pages/Approvals';
-import Schedule from './pages/Schedule';
-import Reports from './pages/Reports';
-import Settings from './pages/Settings';
+import { useMemo, useState } from 'react';
+import Layout from './components/Layout';
+import Dashboard from './pages/Dashboard';
+import Teams from './pages/Teams';
+import Approvals from './pages/Approvals';
+import Schedule from './pages/Schedule';
+import Reports from './pages/Reports';
+import Settings from './pages/Settings';
+import Forecasts from './pages/Forecasts';
+import { filterTeamsByOrgUnit, mockTeams } from './data/mockData';
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-function App() {
-  const [currentPage, setCurrentPage] = useState('dashboard');
-
-  const renderCurrentPage = () => {
-    switch (currentPage) {
-      case 'dashboard':
-        return <Dashboard />;
-      case 'teams':
-        return <Teams />;
-      case 'approvals':
-        return <Approvals />;
-      case 'schedule':
-        return <Schedule />;
-      case 'reports':
-        return <Reports />;
-      case 'settings':
-        return <Settings />;
-      default:
-        return <Dashboard />;
-    }
-  };
+function App() {
+  const [currentPage, setCurrentPage] = useState('dashboard');
+  const [currentModule, setCurrentModule] = useState<'forecasts' | 'schedule' | 'employees' | 'reports'>('schedule');
+  const [activeOrgUnit, setActiveOrgUnit] = useState<string | null>(null);
+
+  const teams = useMemo(() => filterTeamsByOrgUnit(mockTeams, activeOrgUnit), [activeOrgUnit]);
+
+  const handleModuleChange = (module: typeof currentModule) => {
+    setCurrentModule(module);
+    switch (module) {
+      case 'forecasts':
+        setCurrentPage('forecasts');
+        break;
+      case 'schedule':
+        setCurrentPage('schedule');
+        break;
+      case 'employees':
+        setCurrentPage('teams');
+        break;
+      case 'reports':
+        setCurrentPage('reports');
+        break;
+      default:
+        setCurrentPage('dashboard');
+    }
+  };
+
+  const renderCurrentPage = () => {
+    switch (currentPage) {
+      case 'dashboard':
+        return <Dashboard teams={teams} />;
+      case 'teams':
+        return <Teams teams={teams} activeOrgUnit={activeOrgUnit} />;
+      case 'approvals':
+        return <Approvals teams={teams} activeOrgUnit={activeOrgUnit} />;
+      case 'schedule':
+        return <Schedule />;
+      case 'reports':
+        return <Reports activeOrgUnit={activeOrgUnit} />;
+      case 'settings':
+        return <Settings />;
+      case 'forecasts':
+        return <Forecasts />;
+      default:
+        return <Dashboard teams={teams} />;
+    }
+  };
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/App.tsx
@@
-  return (
-    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
-      {renderCurrentPage()}
-    </Layout>
-  );
+  return (
+    <Layout
+      currentPage={currentPage}
+      onPageChange={setCurrentPage}
+      currentModule={currentModule}
+      onModuleChange={handleModuleChange}
+      activeOrgUnit={activeOrgUnit}
+      onOrgUnitChange={setActiveOrgUnit}
+    >
+      {renderCurrentPage()}
+    </Layout>
+  );
 }
*** End Patch
PATCH
```

#### 5. Create forecasts placeholder page
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Forecasts.tsx`
**Changes**: Add RU copy aligning with manual CH4.

```bash
cat <<'PATCH' > src/pages/Forecasts.tsx
import { LineChart } from 'lucide-react';

export default function Forecasts() {
  return (
    <div className="space-y-6">
      <div className="card space-y-4 p-8 text-center">
        <LineChart className="mx-auto h-16 w-16 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Прогнозирование спроса</h2>
        <p className="text-gray-600">
          Раздел находится в разработке. Здесь появятся инструменты для анализа исторических данных и построения прогнозов графиков работы.
        </p>
      </div>
    </div>
  );
}
PATCH
```

#### 6. Update dashboard, approvals, teams signatures for props
**Files**: `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx`, `/src/pages/Approvals.tsx`, `/src/pages/Teams.tsx`
**Changes**: Accept `teams` and optional `activeOrgUnit`, adjust builders to use props, display unit label.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Dashboard.tsx
@@
-import { mockTeams } from '../data/mockData';
+import type { Team } from '../data/mockData';
@@
-const buildRecentActivityRows = () => {
-  return mockTeams
+const buildRecentActivityRows = (teams: Team[]) => {
+  return teams
@@
-}
-
-export default function Dashboard() {
-  const kpiItems = buildKpiItems(mockTeams);
-  const coverageSeries = buildCoverageSeries(mockTeams);
-  const coverageCategories = buildCoverageCategories(mockTeams);
-  const distributionSeries = buildDistributionSeries(mockTeams);
-  const recentActivityRows = buildRecentActivityRows();
+};
+
+interface DashboardProps {
+  teams: Team[];
+}
+
+export default function Dashboard({ teams }: DashboardProps) {
+  const kpiItems = buildKpiItems(teams);
+  const coverageSeries = buildCoverageSeries(teams);
+  const coverageCategories = buildCoverageCategories(teams);
+  const distributionSeries = buildDistributionSeries(teams);
+  const recentActivityRows = buildRecentActivityRows(teams);
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-import { mockTeams, type Request } from '../data/mockData';
+import type { Request, Team } from '../data/mockData';
@@
-const buildInitialRequests = (): RequestWithTeam[] =>
-  mockTeams
-    .flatMap((team) => team.requests.map((request) => ({ ...request, teamName: team.name })))
-    .filter((request) => request.status === 'pending');
+const buildInitialRequests = (teams: Team[]): RequestWithTeam[] =>
+  teams
+    .flatMap((team) => team.requests.map((request) => ({ ...request, teamName: team.name })))
+    .filter((request) => request.status === 'pending');
@@
-export default function Approvals() {
-  const [requests, setRequests] = useState<RequestWithTeam[]>(() => buildInitialRequests());
+interface ApprovalsProps {
+  teams: Team[];
+  activeOrgUnit: string | null;
+}
+
+export default function Approvals({ teams, activeOrgUnit }: ApprovalsProps) {
+  const [requests, setRequests] = useState<RequestWithTeam[]>(() => buildInitialRequests(teams));
@@
-  const tableRows = useMemo(
-    () => buildApprovalRows(filteredRequests, mockTeams),
-    [filteredRequests],
-  );
+  const tableRows = useMemo(
+    () => buildApprovalRows(filteredRequests, teams),
+    [filteredRequests, teams],
+  );
@@
-          <div className="flex items-center gap-3">
+          <div className="flex items-center gap-3">
             <Clock className="h-8 w-8 text-blue-600" />
             <div>
               <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
               <p className="text-sm text-gray-500">Заявки в работе</p>
             </div>
           </div>
           <p className="text-xs text-gray-400">
-            Показаны заявки для всех команд
+            {activeOrgUnit ? `Подразделение: ${activeOrgUnit}` : 'Показаны все подразделения'}
           </p>
         </div>
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Teams.tsx
@@
-import { useState } from 'react';
-import { Users, Clock } from 'lucide-react';
-import { mockTeams, Team } from '../data/mockData';
+import { useState } from 'react';
+import { Users, Clock } from 'lucide-react';
+import type { Team } from '../data/mockData';
@@
-export default function Teams() {
-  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
-  const [sortBy, setSortBy] = useState<'name' | 'coverage' | 'requests'>('name');
-
-  const sortedTeams = [...mockTeams].sort((a, b) => {
+interface TeamsProps {
+  teams: Team[];
+  activeOrgUnit: string | null;
+}
+
+export default function Teams({ teams, activeOrgUnit }: TeamsProps) {
+  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
+  const [sortBy, setSortBy] = useState<'name' | 'coverage' | 'requests'>('name');
+
+  const sortedTeams = [...teams].sort((a, b) => {
@@
-      <div className="flex justify-between items-center">
-        <div>
-          <h1 className="text-2xl font-bold text-gray-900">Обзор команд</h1>
-          <p className="text-gray-500">Следите за показателями и загрузкой сотрудников</p>
-        </div>
+      <div className="flex justify-between items-center">
+        <div>
+          <h1 className="text-2xl font-bold text-gray-900">Обзор команд</h1>
+          <p className="text-gray-500">{activeOrgUnit ? `Подразделение: ${activeOrgUnit}` : 'Следите за показателями и загрузкой сотрудников'}</p>
+        </div>
@@
-      <TeamDetailModal
-        team={selectedTeam}
-        onClose={() => setSelectedTeam(null)}
-      />
+      <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
*** End Patch
PATCH
```
## Phase 2: CH5 Request Workflow Enhancements

### Overview
Encode request categories (schedule change, shift exchange, absence), extend adapters to expose category/shift metadata, support bulk approve/reject with selection, and enhance the approval dialog.

### Changes Required:

#### 1. Extend request model with categories and history
**File**: `${MANAGER_PORTAL_REPO}/src/data/mockData.ts`
**Changes**: Add `RequestCategory` union, optional shift pairing metadata, and update mock entries accordingly.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
-export interface Request {
+export type RequestCategory = 'schedule_change' | 'shift_exchange' | 'absence' | 'overtime';
+
+export interface Request {
   id: string;
   employeeId: string;
   employeeName: string;
-  type: 'vacation' | 'sick_leave' | 'personal' | 'overtime';
+  type: 'vacation' | 'sick_leave' | 'personal' | 'overtime' | 'shift_swap' | 'replacement';
   startDate: string;
   endDate: string;
   status: 'pending' | 'approved' | 'rejected';
   reason: string;
   priority: 'low' | 'medium' | 'high';
   submittedAt: string;
+  category: RequestCategory;
+  bulkEligible?: boolean;
+  shiftPairId?: string;
+  history?: Array<{
+    timestamp: string;
+    actor: string;
+    action: 'submitted' | 'approved' | 'rejected' | 'commented';
+    note?: string;
+  }>;
 }
*** End Patch
PATCH
```

> Update mock requests to include new fields (show pattern for first request; executor applies to rest).

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/data/mockData.ts
@@
       {
         id: 'req1',
         employeeId: '1',
         employeeName: 'Анна Петрова',
         type: 'vacation',
         startDate: '2024-12-15',
         endDate: '2024-12-20',
         status: 'pending',
         reason: 'Праздничный отпуск',
         priority: 'medium',
-        submittedAt: '2024-12-01'
+        submittedAt: '2024-12-01',
+        category: 'absence',
+        bulkEligible: true,
+        history: [
+          { timestamp: '2024-12-01T09:12:00+03:00', actor: 'Анна Петрова', action: 'submitted' }
+        ],
       },
@@
       {
         id: 'req5',
         employeeId: '10',
         employeeName: 'Роман Петров',
-        type: 'overtime',
+        type: 'shift_swap',
         startDate: '2024-12-14',
         endDate: '2024-12-14',
         status: 'pending',
-        reason: 'Деплой релиза',
-        priority: 'high',
-        submittedAt: '2024-12-13'
+        reason: 'Замена вечерней смены',
+        priority: 'high',
+        submittedAt: '2024-12-13',
+        category: 'shift_exchange',
+        bulkEligible: false,
+        shiftPairId: 'swap-42',
+        history: [
+          { timestamp: '2024-12-13T18:05:00+03:00', actor: 'Роман Петров', action: 'submitted' }
+        ],
       }
*** End Patch
PATCH
```

*Repeat pattern for remaining requests: assign `category`, `bulkEligible`, `history`, and create matching paired request for shift exchange (e.g., add new request with same `shiftPairId` for teammate).* 

#### 2. Update approvals adapter for categories and RU labels
**File**: `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts`
**Changes**: Add category mapping, shift pair metadata, RU labels, and helper to build bulk selection summary.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/approvals.ts
@@
-import { formatDate, formatDateRange } from '../utils/charts/format';
-import type { ReportTableColumn } from '../components/charts';
-import type { Request, Team } from '../data/mockData';
+import { formatDate, formatDateRange } from '../utils/charts/format';
+import type { ReportTableColumn } from '../components/charts';
+import type { Request, RequestCategory, Team } from '../data/mockData';
@@
 export const approvalsTableColumns: ReportTableColumn[] = [
   { id: 'employee', label: 'Сотрудник', width: '16rem' },
   { id: 'team', label: 'Команда', width: '12rem' },
+  { id: 'category', label: 'Категория', width: '12rem' },
   { id: 'type', label: 'Тип заявки', width: '12rem' },
   { id: 'period', label: 'Период', width: '12rem' },
   { id: 'priority', label: 'Приоритет', width: '8rem' },
   { id: 'submittedAt', label: 'Подано', width: '10rem' },
   { id: 'status', label: 'Статус', width: '8rem' },
 ];
@@
-    return {
+    return {
       id: request.id,
       employee: request.employeeName,
       team: team?.name ?? '—',
+      category: mapCategory(request.category),
       type: mapRequestType(request.type),
       period: formatDateRange(request.startDate, request.endDate),
       submittedAt: formatDate(request.submittedAt),
       priority: mapPriority(request.priority),
       status: mapStatus(request.status),
+      shiftPairId: request.shiftPairId,
+      bulkEligible: request.bulkEligible ?? false,
     };
   });
 };
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/approvals.ts
@@
-const requestTypeMap: Record<Request['type'], string> = {
-  vacation: 'Отпуск',
-  sick_leave: 'Больничный',
-  personal: 'Личные дела',
-  overtime: 'Сверхурочная работа',
-};
+const requestTypeMap: Record<Request['type'], string> = {
+  vacation: 'Отпуск',
+  sick_leave: 'Больничный',
+  personal: 'Личные дела',
+  overtime: 'Сверхурочная работа',
+  shift_swap: 'Обмен сменами',
+  replacement: 'Замена сотрудника',
+};
+
+const categoryMap: Record<RequestCategory, string> = {
+  schedule_change: 'Изменение графика',
+  shift_exchange: 'Обмен сменами',
+  absence: 'Отсутствие',
+  overtime: 'Сверхурочная работа',
+};
@@
 export const mapRequestType = (type: Request['type']) => requestTypeMap[type] ?? type;
+export const mapCategory = (category: RequestCategory | undefined) => (category ? categoryMap[category] ?? category : '—');
@@
 export const priorityOrder: Array<Request['priority'] | 'all'> = ['all', 'high', 'medium', 'low'];
+export const categoryOrder: Array<RequestCategory | 'all'> = ['all', 'schedule_change', 'shift_exchange', 'absence', 'overtime'];
*** End Patch
PATCH
```

> Add helper for bulk selection summary (used in Approvals component).

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/adapters/approvals.ts
@@
+export const summarizeSelection = (requests: Request[]) => {
+  const byCategory = new Map<RequestCategory, number>();
+  requests.forEach((request) => {
+    const key = request.category;
+    if (!key) return;
+    byCategory.set(key, (byCategory.get(key) ?? 0) + 1);
+  });
+  return Array.from(byCategory.entries()).map(([category, count]) => `${categoryMap[category]} — ${count}`);
+};
*** End Patch
PATCH
```

#### 3. Extend ReportTable wrapper to support selection
**File**: `${MANAGER_PORTAL_REPO}/src/components/charts/types.ts`
**Changes**: Add optional selection props, column flag.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/charts/types.ts
@@
 export interface ReportTableColumn {
   id: string;
   label: string;
   width?: string;
 }
 
-export interface ReportTableProps {
+export interface ReportTableProps {
   columns: ReportTableColumn[];
   rows: Array<Record<string, unknown>>;
   ariaTitle?: string;
   ariaDesc?: string;
   onRowClick?: (row: Record<string, unknown>) => void;
+  selectableRows?: boolean;
+  selectedRowIds?: string[];
+  onSelectionChange?: (rowIds: string[]) => void;
 }
*** End Patch
PATCH
```

**File**: `${MANAGER_PORTAL_REPO}/src/components/charts/ReportTable.tsx`
**Changes**: Render checkbox column and emit selection callbacks.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/charts/ReportTable.tsx
@@
-const ReportTable: React.FC<ReportTableProps> = ({
+const ReportTable: React.FC<ReportTableProps> = ({
   columns,
   rows,
   ariaTitle,
   ariaDesc,
   onRowClick,
+  selectableRows = false,
+  selectedRowIds = [],
+  onSelectionChange,
 }) => {
@@
-  const hasRows = rows.length > 0;
+  const hasRows = rows.length > 0;
+
+  const toggleRow = (rowId: string) => {
+    if (!onSelectionChange) return;
+    if (selectedRowIds.includes(rowId)) {
+      onSelectionChange(selectedRowIds.filter((value) => value !== rowId));
+    } else {
+      onSelectionChange([...selectedRowIds, rowId]);
+    }
+  };
+
+  const toggleAll = () => {
+    if (!onSelectionChange) return;
+    if (selectedRowIds.length === rows.length) {
+      onSelectionChange([]);
+    } else {
+      onSelectionChange(rows.map((row) => String(row.id ?? '')));
+    }
+  };
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/charts/ReportTable.tsx
@@
-          <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
+          <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
             <tr>
+              {selectableRows ? (
+                <th className="px-3 py-2">
+                  <input
+                    type="checkbox"
+                    aria-label="Выбрать все"
+                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
+                    checked={rows.length > 0 && selectedRowIds.length === rows.length}
+                    onChange={toggleAll}
+                  />
+                </th>
+              ) : null}
               {columns.map((col) => (
                 <th
@@
-              {columns.map((col) => (
-                <th
+              {columns.map((col) => (
+                <th
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/charts/ReportTable.tsx
@@
-              rows.map((row, rowIndex) => (
+              rows.map((row, rowIndex) => {
+                const rowId = String(row.id ?? `${rowIndex}`);
+                const isSelected = selectedRowIds.includes(rowId);
+                return (
                 <tr
-                  key={`${rowIndex}-${columns[0]?.id ?? 'row'}`}
-                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${onRowClick ? 'cursor-pointer transition hover:bg-slate-100' : ''}`}
-                  onClick={() => (onRowClick ? onRowClick(row) : undefined)}
+                  key={`${rowIndex}-${columns[0]?.id ?? 'row'}`}
+                  className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${
+                    onRowClick || selectableRows ? 'cursor-pointer transition hover:bg-slate-100' : ''
+                  }`}
+                  onClick={() => {
+                    if (selectableRows) {
+                      toggleRow(rowId);
+                    }
+                    if (onRowClick) {
+                      onRowClick(row);
+                    }
+                  }}
                 >
+                  {selectableRows ? (
+                    <td className="px-3 py-2">
+                      <input
+                        type="checkbox"
+                        aria-label={`Выбрать заявку ${row.employee ?? rowId}`}
+                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
+                        checked={isSelected}
+                        onChange={() => toggleRow(rowId)}
+                        onClick={(event) => event.stopPropagation()}
+                      />
+                    </td>
+                  ) : null}
                   {columns.map((col) => (
                     <td key={col.id} className="whitespace-nowrap px-3 py-2 text-gray-900">
                       {String(row[col.id] ?? '—')}
                     </td>
                   ))}
                 </tr>
-              ))
+              });
*** End Patch
PATCH
```

#### 4. Enhance Approvals page with category filters and bulk actions
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx`
**Changes**: Track category filter, selection state, show summary, add bulk approve/reject buttons, display shift pair details and history.

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
-  const [filter, setFilter] = useState<(typeof priorityOrder)[number]>('all');
+  const [priorityFilter, setPriorityFilter] = useState<(typeof priorityOrder)[number]>('all');
+  const [categoryFilter, setCategoryFilter] = useState<(typeof categoryOrder)[number]>('all');
   const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
   const [note, setNote] = useState('');
   const [dialogAction, setDialogAction] = useState<DialogAction>(null);
+  const [selectedRows, setSelectedRows] = useState<string[]>([]);
@@
-  const filteredRequests = useMemo(() => {
-    if (filter === 'all') return requests;
-    return requests.filter((request) => request.priority === filter);
-  }, [filter, requests]);
+  const filteredRequests = useMemo(() => {
+    return requests.filter((request) => {
+      const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
+      const matchesCategory = categoryFilter === 'all' || request.category === categoryFilter;
+      return matchesPriority && matchesCategory;
+    });
+  }, [priorityFilter, categoryFilter, requests]);
@@
-  const pendingCount = requests.length;
+  const pendingCount = requests.length;
+  const selectedRequests = filteredRequests.filter((request) => selectedRows.includes(request.id));
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
+      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
         <div className="card flex items-center justify-between p-4">
@@
-      <div className="flex flex-wrap items-center gap-2">
-        {priorityOrder.map((option) => (
-          <button
-            key={option}
-            type="button"
-            onClick={() => setFilter(option)}
-            className={`rounded-full px-3 py-1 text-sm transition ${
-              filter === option
-                ? 'bg-primary-600 text-white'
-                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
-            }`}
-          >
-            {option === 'all' ? 'Все приоритеты' : mapPriority(option)}
-          </button>
-        ))}
-      </div>
+      <div className="flex flex-wrap items-center gap-2">
+        {priorityOrder.map((option) => (
+          <button
+            key={option}
+            type="button"
+            onClick={() => setPriorityFilter(option)}
+            className={`rounded-full px-3 py-1 text-sm transition ${
+              priorityFilter === option
+                ? 'bg-primary-600 text-white'
+                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
+            }`}
+          >
+            {option === 'all' ? 'Все приоритеты' : mapPriority(option)}
+          </button>
+        ))}
+      </div>
+
+      <div className="flex flex-wrap items-center gap-2">
+        {categoryOrder.map((option) => (
+          <button
+            key={option}
+            type="button"
+            onClick={() => setCategoryFilter(option)}
+            className={`rounded-full px-3 py-1 text-sm transition ${
+              categoryFilter === option
+                ? 'bg-slate-900 text-white'
+                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
+            }`}
+          >
+            {option === 'all' ? 'Все категории' : mapCategory(option)}
+          </button>
+        ))}
+      </div>
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-      {filteredRequests.length === 0 ? (
+      {filteredRequests.length === 0 ? (
         <div className="flex flex-col items-center justify-center gap-3 p-12 text-center text-gray-500">
           <Clock className="h-12 w-12 text-gray-400" />
           <h3 className="text-lg font-semibold text-gray-900">Все обработано</h3>
           <p>Нет заявок, ожидающих решения.</p>
         </div>
       ) : (
         <ReportTable
           columns={approvalsTableColumns}
           rows={tableRows}
           ariaTitle="Таблица заявок"
           ariaDesc="Заявки в работе с фильтрами по приоритету"
-          onRowClick={(row) => setSelectedRequestId(String(row.id))}
+          selectableRows
+          selectedRowIds={selectedRows}
+          onSelectionChange={setSelectedRows}
+          onRowClick={(row) => setSelectedRequestId(String(row.id))}
         />
       )}
*** End Patch
PATCH
```

> Add bulk action toolbar when rows selected, using `summarizeSelection`.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-      <Dialog
+      {selectedRows.length > 0 ? (
+        <section className="flex flex-col gap-3 rounded-lg border border-primary-100 bg-primary-50 p-4">
+          <div className="flex flex-wrap items-center justify-between gap-2">
+            <div>
+              <h3 className="text-sm font-medium text-primary-800">Выбрано заявок: {selectedRows.length}</h3>
+              <ul className="text-xs text-primary-700">
+                {summarizeSelection(selectedRequests).map((entry) => (
+                  <li key={entry}>{entry}</li>
+                ))}
+              </ul>
+            </div>
+            <div className="flex gap-2">
+              <button
+                type="button"
+                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50"
+                onClick={() => {
+                  setDialogAction('reject');
+                  if (selectedRequests.length === 1) {
+                    setSelectedRequestId(selectedRequests[0].id);
+                  }
+                }}
+              >
+                Отклонить выбранные
+              </button>
+              <button
+                type="button"
+                className="rounded-lg border border-green-200 px-4 py-2 text-sm font-medium text-green-600 transition hover:border-green-400 hover:bg-green-50"
+                onClick={() => {
+                  selectedRequests.forEach((request) => handleApprove(request.id));
+                  setSelectedRows([]);
+                }}
+              >
+                Одобрить выбранные
+              </button>
+            </div>
+          </div>
+        </section>
+      ) : null}
+
+      <Dialog
         open={Boolean(selectedRequest)}
         onClose={closeDialog}
         title={selectedRequest ? `Заявка · ${selectedRequest.employeeName}` : 'Заявка'}
         description={selectedRequest ? `Статус: ${mapStatus(selectedRequest.status)}` : undefined}
@@
-            <div className="grid gap-2 text-sm">
+            <div className="grid gap-2 text-sm">
               <p>
                 <span className="font-medium text-gray-500">Команда:</span> {selectedRequest.teamName}
               </p>
               <p>
                 <span className="font-medium text-gray-500">Тип:</span> {mapRequestType(selectedRequest.type)}
               </p>
               <p>
                 <span className="font-medium text-gray-500">Период:</span> {formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}
               </p>
               <p>
                 <span className="font-medium text-gray-500">Приоритет:</span> {mapPriority(selectedRequest.priority)}
               </p>
+              <p>
+                <span className="font-medium text-gray-500">Категория:</span> {mapCategory(selectedRequest.category)}
+              </p>
+              {selectedRequest.shiftPairId ? (
+                <p>
+                  <span className="font-medium text-gray-500">Обмен:</span> {selectedRequest.shiftPairId}
+                </p>
+              ) : null}
               <p>
                 <span className="font-medium text-gray-500">Комментарий:</span> {selectedRequest.reason}
               </p>
             </div>
+            {selectedRequest.history?.length ? (
+              <div className="space-y-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
+                <p className="font-medium text-slate-700">История</p>
+                <ul className="space-y-1">
+                  {selectedRequest.history.map((entry) => (
+                    <li key={`${entry.timestamp}-${entry.actor}`}>
+                      {formatDate(entry.timestamp)} · {entry.actor} · {entry.action}
+                      {entry.note ? ` — ${entry.note}` : ''}
+                    </li>
+                  ))}
+                </ul>
+              </div>
+            ) : null}
*** End Patch
PATCH
```

> Ensure `formatDate` imported to render history entries.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-import { formatDateRange } from '../utils/charts/format';
+import { formatDate, formatDateRange } from '../utils/charts/format';
*** End Patch
PATCH
```

> Update `handleApprove`/`handleReject` to manage selection state.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
   const handleApprove = (requestId: string, message?: string) => {
     setRequests((prev) => prev.filter((request) => request.id !== requestId));
+    setSelectedRows((prev) => prev.filter((rowId) => rowId !== requestId));
     console.info('Approved request:', requestId, message);
   };
 
   const handleReject = (requestId: string, message: string) => {
     setRequests((prev) => prev.filter((request) => request.id !== requestId));
+    setSelectedRows((prev) => prev.filter((rowId) => rowId !== requestId));
     console.info('Rejected request:', requestId, message);
   };
*** End Patch
PATCH
```

#### 5. Add bulk export dialog component
**Files**: `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx`, `src/utils/exports.ts`
**Changes**: Provide export hooks for CH6 T-13, Work Schedule, Deviations, add button to approvals toolbar.

```bash
cat <<'PATCH' > src/utils/exports.ts
export interface ExportDefinition {
  id: 't13' | 'work_schedule' | 'deviation';
  label: string;
  description: string;
  filename: string;
}

export const REPORT_EXPORTS: ExportDefinition[] = [
  {
    id: 't13',
    label: 'Т-13 (табель учёта)',
    description: 'Excel-отчёт по рабочему времени и отсутствиям',
    filename: 't13_report.xlsx',
  },
  {
    id: 'work_schedule',
    label: 'Рабочий график',
    description: 'Покрытие смен по подразделениям (CH6 §6.2)',
    filename: 'work_schedule.csv',
  },
  {
    id: 'deviation',
    label: 'Отклонения и соблюдение',
    description: 'Детализация по соблюдению графика (CH6 §6.3)',
    filename: 'deviation_report.csv',
  },
];

export const triggerReportDownload = async (exportId: ExportDefinition['id']) => {
  // Placeholder for future integration; mimic async operation so UI can show spinners.
  console.info('Export requested:', exportId);
  await new Promise((resolve) => setTimeout(resolve, 750));
  return exportId;
};
PATCH
```

> Add export button & dialog to Approvals.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
-import { AlertCircle, Check, Clock, X } from 'lucide-react';
+import { AlertCircle, Check, Clock, Download, X } from 'lucide-react';
@@
-import Dialog from '../components/common/Dialog';
+import Dialog from '../components/common/Dialog';
+import { REPORT_EXPORTS, triggerReportDownload } from '../utils/exports';
@@
   const [dialogAction, setDialogAction] = useState<DialogAction>(null);
+  const [exportDialogOpen, setExportDialogOpen] = useState(false);
+  const [exportingId, setExportingId] = useState<string | null>(null);
@@
       <div className="flex flex-wrap items-center gap-2">
         {priorityOrder.map((option) => (
@@
       </div>
+
+      <div className="flex items-center justify-end">
+        <button
+          type="button"
+          onClick={() => setExportDialogOpen(true)}
+          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700"
+        >
+          <Download className="h-4 w-4" /> Экспортировать отчёты
+        </button>
+      </div>
*** End Patch
PATCH
```

> Append export dialog component at end of component.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Approvals.tsx
@@
       <Dialog
         open={Boolean(selectedRequest)}
         onClose={closeDialog}
@@
       </Dialog>
+
+      <Dialog
+        open={exportDialogOpen}
+        onClose={() => setExportDialogOpen(false)}
+        title="Экспорт отчётов"
+        description="Выберите нужный отчёт. Загрузка доступна после формирования файла."
+      >
+        <div className="space-y-3">
+          {REPORT_EXPORTS.map((entry) => (
+            <button
+              key={entry.id}
+              type="button"
+              className="flex w-full flex-col rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-primary-300 hover:bg-primary-50"
+              onClick={async () => {
+                setExportingId(entry.id);
+                await triggerReportDownload(entry.id);
+                setExportingId(null);
+              }}
+            >
+              <span className="text-sm font-medium text-slate-900">{entry.label}</span>
+              <span className="text-xs text-slate-600">{entry.description}</span>
+              <span className="text-xs text-slate-400">Скачиваемый файл: {entry.filename}</span>
+              {exportingId === entry.id ? <span className="text-xs text-primary-600">Готовим файл...</span> : null}
+            </button>
+          ))}
+        </div>
+      </Dialog>
*** End Patch
PATCH
```

## Phase 3: Reports Route & Documentation Alignment

### Overview
Replace placeholder Reports page with CH6 export cards linked to the new helper, expose selected org unit summary, and update docs to reflect navigation changes.

### Changes Required:

#### 1. Update Reports page content
**File**: `${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx`
**Changes**: Show list of available exports referencing `REPORT_EXPORTS`, display active org unit.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/pages/Reports.tsx
@@
-import { BarChart3, TrendingUp, Download } from 'lucide-react';
+import { Download } from 'lucide-react';
+import { REPORT_EXPORTS } from '../utils/exports';
+
+interface ReportsProps {
+  activeOrgUnit: string | null;
+}
 
-export default function Reports() {
+export default function Reports({ activeOrgUnit }: ReportsProps) {
   return (
-    <div className="space-y-6">
-      <div className="card p-8 text-center">
-        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
-        <h2 className="text-xl font-semibold text-gray-900 mb-2">Advanced Reports</h2>
-        <p className="text-gray-600 mb-4">
-          Comprehensive reporting and analytics coming soon
-        </p>
-        <div className="max-w-md mx-auto space-y-3 text-left">
-          <div className="flex items-center text-sm text-gray-600">
-            <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
-            Team performance analytics
-          </div>
-          <div className="flex items-center text-sm text-gray-600">
-            <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
-            Attendance and productivity metrics
-          </div>
-          <div className="flex items-center text-sm text-gray-600">
-            <Download className="h-4 w-4 mr-2 text-purple-600" />
-            Exportable reports and dashboards
-          </div>
-        </div>
-      </div>
-    </div>
+    <div className="space-y-6">
+      <section className="rounded-lg border border-slate-200 bg-white p-6">
+        <header className="mb-4">
+          <h2 className="text-xl font-semibold text-slate-900">Экспорт отчётов</h2>
+          <p className="text-sm text-slate-600">
+            {activeOrgUnit ? `Текущее подразделение: ${activeOrgUnit}` : 'Все подразделения'}. Отчёты формируются по данным графиков (CH6 §6.1–6.3).
+          </p>
+        </header>
+        <div className="grid gap-4 md:grid-cols-3">
+          {REPORT_EXPORTS.map((entry) => (
+            <article key={entry.id} className="flex flex-col justify-between rounded-lg border border-slate-200 p-4">
+              <div className="space-y-2">
+                <h3 className="text-sm font-semibold text-slate-900">{entry.label}</h3>
+                <p className="text-sm text-slate-600">{entry.description}</p>
+              </div>
+              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
+                <span>{entry.filename}</span>
+                <Download className="h-4 w-4 text-slate-400" />
+              </div>
+            </article>
+          ))}
+        </div>
+      </section>
+    </div>
   );
 }
*** End Patch
PATCH
```

#### 2. Update docs with new navigation/flows
**File**: `docs/Workspace/Coordinator/manager-portal/CodeMap.md`
**Changes**: Reference module header/org drawer/exports.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Workspace/Coordinator/manager-portal/CodeMap.md
@@
- - Layout shell: `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:10-120` (sidebar, header, notification badge, Logout placeholder).
- - Additional stubs: Reports/Schedule placeholders `${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-18`, `${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:1-18` remain static.
+ - Layout shell: `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:10-210` (module header, sidebar, уведомления, кнопка «Рабочая структура»).
+ - Org drawer: `${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx:1-94` (дерево подразделений, выбор фильтра).
+ - Reports страница: `${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-80` (карточки T-13/Рабочий график/Отклонения).
+ - Forecasts заглушка: `${MANAGER_PORTAL_REPO}/src/pages/Forecasts.tsx:1-40` (ожидает интеграции аналитики).
@@
- - Adapters: `${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:12-80` (coverage/pie/KPI), `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:5-53` (rows, enums, priority ordering).
+ - Adapters: `${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:12-90` (фильтр подразделений), `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:5-140` (категории, bulk summary, RU labels).
*** End Patch
PATCH
```

**File**: `uat-agent-tasks/manual_manager-portal-crosswalk.md`
**Changes**: Update navigation/export rows to reflect new behaviour.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: uat-agent-tasks/manual_manager-portal-crosswalk.md
@@
-| Work structure / organisation tree | In Naumen, the “Рабочая структура” button in the header toggles a side menu where users can select organisational units. This affects Employees lists and schedule views. | Not implemented in the unified pilot. | The employee portal does not include an organisation tree; it assumes a single user context. | Manager portal also omits the organisation tree; it shows aggregated team cards instead of a hierarchical selector. | Analytics dashboard is focused on KPIs; no organisation tree. | Missing organisational hierarchy means demos cannot filter by departments like the real system. |
+| Work structure / organisation tree | In Naumen, the “Рабочая структура” button in the header toggles a side menu where users can select organisational units. This affects Employees lists and schedule views. | Not implemented in the unified pilot. | The employee portal does not include an organisation tree; it assumes a single user context. | Manager portal: боковое меню + кнопка «Рабочая структура» (Layout.tsx) фильтрует Dashboard/Approvals/Teams. | Analytics dashboard is focused on KPIs; no organisation tree. | Drawer now mirrors production behaviour per CH2_Login_System.md §2.2. |
@@
-| Export evidence / reports | Global downloads menu; Approvals export icons | **CH6_Reports.md §6.1–6.3** | Walks through generating T-13, Work Schedule, and other exports; explains downloads icon and lifecycle of generated files. | Use this when verifying export links in Approvals or future report integrations. |
+| Export evidence / reports | Global downloads menu; Approvals export icons | **CH6_Reports.md §6.1–6.3** | Walks through generating T-13, Work Schedule, and other exports; explains downloads icon and lifecycle of generated files. | Approvals export диалог (`Approvals.tsx`) + Reports страница показывают тот же список файлов; УАТ проверяет подписи/имена. |
*** End Patch
PATCH
```

**File**: `docs/System/WRAPPER_ADOPTION_MATRIX.md`
**Changes**: Record new selection props.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/WRAPPER_ADOPTION_MATRIX.md
@@
-| ReportTable | Manager Portal | Approvals table | columns, rows, ariaTitle/Desc, onRowClick | ✅ RU | Needs selection props for bulk actions |
+| ReportTable | Manager Portal | Approvals table | columns, rows, ariaTitle/Desc, onRowClick, selectableRows, selectedRowIds, onSelectionChange | ✅ RU | Selection props adopted for CH5 bulk actions |
*** End Patch
PATCH
```

**File**: `docs/System/DEMO_PARITY_INDEX.md`
**Changes**: Update navigation status.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/DEMO_PARITY_INDEX.md
@@
-| Manager Portal | Navigation parity pending (no org tree, modules) | Phase A |
+| Manager Portal | Navigation parity (module header + org drawer) scheduled via 2025-10-27 plan | Phase A |
*** End Patch
PATCH
```

**File**: `docs/System/PARITY_MVP_CHECKLISTS.md`
**Changes**: Mark navigation/bulk actions with references.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/PARITY_MVP_CHECKLISTS.md
@@
-| ☐ | Manager Portal | Approvals bulk actions mirror CH5 (filters, bulk approve/reject) |
+| ☑ | Manager Portal | Approvals bulk actions mirror CH5 (filters, bulk approve/reject) | `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:31-330`, `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:5-140` |
@@
-| ☐ | Manager Portal | Navigation exposes modules + Рабочая структура drawer |
+| ☑ | Manager Portal | Navigation exposes modules + Рабочая структура drawer | `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:10-210`, `${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx:1-94` |
*** End Patch
PATCH
```

**File**: `docs/Tasks/post-phase9-demo-execution.md`
**Changes**: Capture planner status.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/post-phase9-demo-execution.md
@@
-| Manager Portal | Executor | Coverage toggle | ✅ Pass (2025-10-26) | Next: navigation/org tree parity plan |
+| Manager Portal | Planner | Navigation/org tree + approvals bulk plan drafted | — | Follow plan `plans/2025-10-27_manager-portal-behavior-parity.plan.md` |
*** End Patch
PATCH
```

> Document execution results in `docs/SESSION_HANDOFF.md` during the run (append new entry with tests/UAT/URLs).

## Phase 4: Unified Shell & Coordination Steps

### Overview
Document integration points so when the unified shell deploy returns, the Manager Portal tabs align with the new navigation.

### Changes Required:

1. Update `docs/Workspace/Coordinator/unified-demo/CodeMap.md` to include Manager Portal module IDs and routes.
2. Log shell dependency in `docs/SESSION_HANDOFF.md` and assign follow-up for shell repo to expose modules (reference `${UNIFIED_DEMO_REPO}/src/routes/manager.tsx` once available).
3. Confirm port reservation in `docs/System/ports-registry.md` for local dev port (set Status to Confirmed with planner ID if not already).

## Phase 5: Tests, Stories, and Validation Assets

### Overview
Align unit tests with RU labels, add coverage for new adapters/category logic, ensure docs & screenshots capture updates.

### Changes Required:

1. Update `src/adapters/approvals.test.ts` to expect RU labels and new columns (`category`, `status`), add tests for `mapCategory`, `summarizeSelection`.
2. Add new test file `src/adapters/exports.test.ts` verifying helper returns list.
3. Update `src/adapters/dashboard.test.ts` to accept filtered team inputs (if dependent on new props).
4. Add Playwright or Vitest integration test for `ReportTable` selection (optional to extend existing tests or create `tests/approvals-selection.spec.ts` verifying toggles).
5. Update `docs/SCREENSHOT_INDEX.md` with new screenshot aliases for org drawer and bulk action banner.
6. Record learnings in `docs/System/learning-log.md` and wrapper adjustments in `docs/System/WRAPPER_ADOPTION_MATRIX.md` (ReportTable selection props).

## Tests & Validation
- `npm install`
- `npm run lint` (if available)
- `npm run test -- --run --test-timeout=2000`
- `npm run build`
- `npm run preview -- --host 127.0.0.1 --port <reserved>` to verify navigation drawer, filters, exports
- UAT: Run `docs/Tasks/uat-packs/parity_static.md` (Dashboard, Approvals sections) and `docs/Tasks/uat-packs/trimmed_smoke.md` (bulk actions, exports)

## Rollback
- `git restore src` and `git restore docs` to discard code/doc changes
- Remove newly created files: `rm src/components/OrgStructureDrawer.tsx src/pages/Forecasts.tsx src/utils/exports.ts`
- `git clean -fd` to drop artefacts if necessary

## Handoff
- Update `PROGRESS.md` with phase status
- Append execution results to `docs/SESSION_HANDOFF.md` (tests, preview URL, UAT outcomes)
- Sync coordinator docs and parity checklists (`docs/Workspace/Coordinator/manager-portal/*.md`, `docs/System/*`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`)
- Log tracker status in `docs/Tasks/post-phase9-demo-execution.md` (Manager Portal row → Completed when UAT passes)
