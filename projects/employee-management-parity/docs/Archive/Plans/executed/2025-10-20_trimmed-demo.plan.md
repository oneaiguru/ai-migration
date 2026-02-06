# Plan: Phase 8 Trimmed Demo – Production Repo

## Metadata
- **Task**: Stand up a production-only clone without demo tabs and document the dual-repo workflow
- **Date**: 2025-10-20
- **Planner**: Codex (automation)
- **Target Repo**: `employee-management-production` (fresh mirror of this demo repo)
- **Discovery**: `docs/Tasks/phase-8-trimmed-demo-discovery.md`
- **Related Docs**:
  - `docs/Archive/Demo-Modules-Trim-Plan.md`
  - `docs/System/trimmed-demo-repo-strategy.md`
  - `docs/System/parity-roadmap.md`
  - `docs/Tasks/phase-8-trimmed-demo-task.md`
  - Stage 6 UAT triage `docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md`

## Desired End State
- Production repo boots with only the Employees experience; no demo tabs/components are bundled or reachable in the UI.
- Documentation clearly differentiates the demo repo from the production repo and records the trimmed navigation.
- Build + Playwright checks pass in the production repo, and a dedicated Vercel deployment URL is captured.
- Sync strategy between repos is recorded, with checklist items in `docs/System/trimmed-demo-repo-strategy.md` marked complete.

### Key Discoveries
- `docs/Tasks/phase-8-trimmed-demo-discovery.md:18-43` – inventory of navigation entries, components, and docs impacted by the trim.
- `src/App.tsx:1411-1478` – current `views` array and conditional renders that expose demo tabs.
- `src/components/EmployeePhotoGallery.tsx:128-143`, `PerformanceMetricsView.tsx:107-210`, `EmployeeStatusManager.tsx:241-259`, `CertificationTracker.tsx:347-369` – demo badges and mock data confirming these modules are placeholders.
- `docs/Archive/Demo-Modules-Trim-Plan.md:11-28` – prior playbook endorsing removal of demo modules and navigation entries for lean builds.
- `docs/System/trimmed-demo-repo-strategy.md:3-37` – dual-repo deployment guidance and sync checklist to complete once the production repo exists.
- `tests/employee-list.spec.ts:36-160` – Playwright slice that covers only the Employees flow (no dependencies on trimmed tabs).

## What We're NOT Doing
- No sweeping refactors to employee data models, quick add, or list interactions beyond ensuring the UI still functions with a single tab.
- No deletions inside the demo repo – demo modules stay intact here for ongoing parity work.
- No Storybook or analytics reinstatements; Phase 9 handles charting and accessibility sweeps separately.
- No attempt to reconcile historic screenshots yet—executor will capture new trimmed screenshots in a later documentation task.

## Implementation Approach
Mirror the demo repo into a new `employee-management-production` repository, re-point remotes, and install dependencies. Inside the production clone, strip demo tabs by removing imports and conditional renders from `src/App.tsx`, then delete the demo module files so the build excludes unused React trees. Finish by updating roadmap/strategy docs to document the dual build, run build + targeted Playwright tests, deploy to a dedicated Vercel project, and log the new URL plus sync workflow in both repos.

## Phase 1: Stand up the production clone

### Overview
Create a new GitHub repository, mirror the current demo repo into it, and prepare the workspace for edits/tests.

### Changes Required:
1. Create the remote repository (replace `<org>` with the actual owner):
   ```bash
   set -euo pipefail
   gh repo create <org>/employee-management-production --public --confirm
   ```
2. Mirror the demo repo into a sibling folder and retarget the origin:
   ```bash
   set -euo pipefail
   cd ~/git/client
   git clone git@github.com:<org>/employee-management-parity.git employee-management-production
   cd employee-management-production
   git remote rename origin demo-origin
   git remote add origin git@github.com:<org>/employee-management-production.git
   git push -u origin main
   ```
3. Install dependencies and verify Node version (should match `package.json` engines):
   ```bash
   set -euo pipefail
   corepack enable
   node -v
   npm install
   ```
4. Copy over any repo-local environment secrets (Vercel tokens, CI secrets) using the deployment checklist in `docs/System/trimmed-demo-repo-strategy.md`.

## Phase 2: Remove demo navigation from the app shell

### Overview
Within the production clone, strip tab registrations and conditional renders so only the Employees list remains.

### Changes Required:
1. Update `src/App.tsx` to remove unused imports, collapse the `views` array, hide the tab bar when only one view exists, and drop demo component renders:
   ```bash
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/App.tsx
   @@
   -import EmployeePhotoGallery from './components/EmployeePhotoGallery';
   -import PerformanceMetricsView from './components/PerformanceMetricsView';
   @@
   -import EmployeeStatusManager from './components/EmployeeStatusManager';
   -import CertificationTracker from './components/CertificationTracker';
   @@
   -  const views = [
   -    { id: 'list', label: 'Список сотрудников', icon: '📋' },
   -    { id: 'gallery', label: 'Фото галерея', icon: '🖼️' },
   -    { id: 'performance', label: 'Показатели', icon: '📈' },
   -    { id: 'statusManager', label: 'Статусы', icon: '✅' },
   -    { id: 'certifications', label: 'Сертификации', icon: '🎓' },
   -    { id: 'skills', label: 'Навыки', icon: '🎯' },
   -  ];
   +  const views = [{ id: 'list', label: 'Список сотрудников', icon: '📋' }];
   @@
   -      <div className="bg-white border-b border-gray-200">
   -        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   -          <nav className="flex space-x-1">
   -            {views.map((tab) => (
   -              <button
   -                key={tab.id}
   -                onClick={() => setCurrentView(tab.id)}
   -                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
   -                  currentView === tab.id
   -                    ? 'border-blue-500 text-blue-600 bg-blue-50'
   -                    : 'border-transparent text-gray-500 hover:text-gray-700'
   -                }`}
   -              >
   -                <span aria-hidden>{tab.icon}</span> {tab.label}
   -              </button>
   -            ))}
   -          </nav>
   -        </div>
   -      </div>
   -
   -      <div className="bg-blue-50 border-b border-blue-200 py-2">
   -        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   -          <span className="text-sm text-blue-800">
   -            <strong>Текущий раздел:</strong> {views.find((view) => view.id === currentView)?.label}
   -          </span>
   -        </div>
   -      </div>
   +      {views.length > 1 && (
   +        <div className="bg-white border-b border-gray-200">
   +          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   +            <nav className="flex space-x-1">
   +              {views.map((tab) => (
   +                <button
   +                  key={tab.id}
   +                  onClick={() => setCurrentView(tab.id)}
   +                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
   +                    currentView === tab.id
   +                      ? 'border-blue-500 text-blue-600 bg-blue-50'
   +                      : 'border-transparent text-gray-500 hover:text-gray-700'
   +                  }`}
   +                >
   +                  <span aria-hidden>{tab.icon}</span> {tab.label}
   +                </button>
   +              ))}
   +            </nav>
   +          </div>
   +        </div>
   +      )}
   +
   +      {views.length > 1 && (
   +        <div className="bg-blue-50 border-b border-blue-200 py-2">
   +          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
   +            <span className="text-sm text-blue-800">
   +              <strong>Текущий раздел:</strong> {views.find((view) => view.id === currentView)?.label}
   +            </span>
   +          </div>
   +        </div>
   +      )}
   @@
   -        {currentView === 'gallery' && <EmployeePhotoGallery employees={employees} teams={teams} />}
   -        {currentView === 'performance' && <PerformanceMetricsView employees={employees} />}
   -        {currentView === 'statusManager' && <EmployeeStatusManager employees={employees} />}
   -        {currentView === 'certifications' && <CertificationTracker employees={employees} />}
   -        {currentView === 'skills' && (
   -          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
   -            <div className="text-gray-400 text-6xl mb-4">🎯</div>
   -            <h3 className="text-lg font-medium text-gray-900 mb-2">Навыки</h3>
   -            <p className="text-gray-500">Компонент управления навыками в разработке</p>
   -          </div>
   -        )}
   *** End Patch
   PATCH
   ```
2. Run `npm run lint -- --max-warnings=0` (or `npm run typecheck`) to confirm no unused imports remain after the update.

## Phase 3: Prune demo module source files in the production repo

### Overview
Remove unused demo modules so the trimmed production bundle stays lean and future builds fail fast if they accidentally return.

### Changes Required:
1. Delete the demo component files inside the production clone:
   ```bash
   set -euo pipefail
   git rm src/components/EmployeePhotoGallery.tsx \
     src/components/PerformanceMetricsView.tsx \
     src/components/EmployeeStatusManager.tsx \
     src/components/CertificationTracker.tsx \
     src/components/EmployeeComparisonTool.tsx
   ```
2. Search for lingering references (should be none after Phase 2):
   ```bash
   rg "EmployeePhotoGallery|PerformanceMetricsView|EmployeeStatusManager|CertificationTracker|EmployeeComparisonTool" -n src || true
   ```
3. If the search surfaces unexpected references, halt execution and coordinate with stakeholders before proceeding.

## Phase 4: Update roadmap and strategy docs

### Overview
Document the trimmed navigation, link both repos, and mark the sync checklist so future agents understand the split.

### Changes Required:
1. In `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, add a "Trimmed Production Variant" subsection highlighting that the production repo ships only the Employees module and referencing the demo repo for parity tabs:
   ```bash
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
   @@
   ## 4. Current Implementation Snapshot (Code Audit)
  +- **Trimmed production variant (Phase 8)** – The sibling repo `employee-management-production` exposes only the Employees experience. Demo modules (Фото галерея, Показатели, Статусы, Сертификации, Навыки) remain in this demo repo for future roadmap work; see `docs/Archive/Demo-Modules-Trim-Plan.md` for reinstatement steps.
   *** End Patch
   PATCH
   ```
2. Update `docs/System/trimmed-demo-repo-strategy.md` to check off the sync checklist now that owners/processes are defined:
   ```bash
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: docs/System/trimmed-demo-repo-strategy.md
   @@
  -- [ ] Document any shared assets (schemas, datasets) that must be copied when syncing repos.
  -- [ ] Maintain a CHANGELOG or merge log in the trimmed repo noting commits pulled from the demo repo.
  -- [ ] Re-run validation (build + Playwright) after every sync to catch placeholder dependencies early.
  +- [x] Document any shared assets (schemas, datasets) that must be copied when syncing repos (see Phase 8 discovery trim impact inventory).
  +- [x] Maintain a CHANGELOG or merge log in the trimmed repo noting commits pulled from the demo repo.
  +- [x] Re-run validation (build + Playwright) after every sync to catch placeholder dependencies early.
   *** End Patch
   PATCH
   ```
3. Add a new entry to `docs/SESSION_HANDOFF.md` (production repo copy) summarising the trimmed deployment and linking back to the demo repo for parity modules.
4. Update `docs/System/parity-roadmap.md` Phase 8 bullet list to reference the production deployment URL captured during execution.

## Tests & Validation
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Optional smoke: `npm run preview -- --host 127.0.0.1 --port 4174` (close the server after verifying the Employees flow)
- Manual QA checklist: confirm no navigation tabs beyond Employees, quick add + edit drawer still function, toolbar modals open without errors.
- Record the new Vercel production URL after `vercel deploy --prod --yes` in both this repo’s and the production repo’s handoff docs.

## Rollback
- To undo code/doc changes in the production repo before pushing:
  ```bash
  set -euo pipefail
  git restore src/App.tsx docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md docs/System/trimmed-demo-repo-strategy.md docs/System/parity-roadmap.md
  git checkout -- src/components
  ```
- If the trimmed repo is unstable post-push, reset to the initial mirror commit and force-push:
  ```bash
  set -euo pipefail
  git checkout main
  git reset --hard <initial-mirror-commit>
  git push --force-with-lease origin main
  ```
- The demo repo remains untouched; no rollback required here.

## Handoff
- In the production repo: update `PROGRESS.md` to mark this plan executed, log validation/deployment details in `docs/SESSION_HANDOFF.md`, and archive the plan under `docs/Archive/Plans/executed/`.
- In this demo repo: add a new `docs/SESSION_HANDOFF.md` entry pointing to the production deployment URL and noting any follow-up tasks (e.g., screenshot refresh).
- Mark `docs/Tasks/phase-8-trimmed-demo-discovery.md` checklist items (“PROGRESS updated” and “Plan linked”) as complete and link to this plan.
- Leave the modal shadow regression task (`docs/Tasks/modal-shadow-regression.md`) on deck for the next prioritised executor.
