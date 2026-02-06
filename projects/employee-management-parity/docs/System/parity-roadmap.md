# Parity Roadmap – Module Staging

This document tracks the planned order of parity work across product modules and captures reusable patterns from Employee Management.

## Completed / In Progress
- **Employee Management (Phase 1 & 2)** – Bulk edit, tag manager, selection mode, dismiss/restore, scheme history, navigation cleanup.
- **Employee Management (Phase 3)** – CRUD/data parity (in progress). Reusable assets:
  - Selection-mode toggle (toolbar-controlled multi-select).
  - Shared Radix overlay wrapper (`src/components/common/Overlay.tsx`).
  - Task timeline helper (`src/utils/task.ts`).
  - Import/export validation patterns (`src/components/EmployeeList/ImportExportModals.tsx`).
  - Tag limit enforcement pattern (≤4 на сотрудника, см. `TagManagerOverlay.tsx`).
- **Employee Management (Phase 5)** – Stabilization (localStorage persistence + toast, validation gating, tag catalogue persistence, context-aware import/export headings, bulk-edit summary/count). NVDA sweep pending before closing the phase.

## Upcoming Modules
1. **Schedule** (graphs, shifts, optimization UI)
   - Reuse selection-mode pattern for bulk shift actions.
   - Apply aria-live/overlay handling from Employee Management.
2. **Analytics / Reporting**
   - Adopt export templates (CSV placeholders) and validation copy.
   - Mirror timeline-style audit logs for generated reports.
3. **Forecasting**
   - Leverage import validation SOP for forecast uploads.
   - Extend accessibility checks to high-density charts/tables.
4. **Personal Portal**
   - Reuse drawer/modal focus patterns; incorporate dismiss/restore badge logic for requests.

## Long‑Term Strategy (Demo → Reference → Scale → Integrate)
- Draft demo(s) to explore UI and slot definitions (no library changes).
- Choose frontend approach/wrappers; migrate one demo end‑to‑end as the reference implementation.
- Migrate a second demo to validate scalability of the approach (adjust wrappers/APIs if needed).
- Run the outcome‑based UAT↔Code loop per demo until behaviour parity; then trim each demo into a clean production reference.
- Work demos in parallel once two are stable; keep the library frozen and update only behaviour.
- End state: a full prototype of the original product represented across separate trimmed demos.
- Final step (later): mount the trimmed demos under a single shell for unified navigation; treat this as integration work after all demos reach parity.

## Cross-Module Checklist
- [ ] Confirm SOP references (`session-prep-and-handoff`, `ui-walkthrough`) are module-agnostic.
- [ ] Document shared utilities whenever new patterns emerge.
- [ ] Update this roadmap after each module phase completes; reference the latest Desktop audits (e.g., `2025-10-07_09-00_comprehensive-validation-report.markdown`).

## Phase Timeline (ASCII Overview)
```
Phase 1  ── Bulk Edit / Tag Parity
  │       • Matrix actions (Add/Replace/Remove)
  │       • Tag manager catalogue + timeline logging
  ├─────────────▶ Archived: docs/Archive/Tasks/01_phase-1-bulk-edit-prd.md
Phase 2  ── Interaction & Accessibility
  │       • Row/drawer behaviour, focus traps, Esc handling
  │       • Toolbar utilities (export/import, tag access)
  ├─────────────▶ Archived: docs/Archive/Tasks/02_phase-2-accessibility-and-parity-prd.md
Phase 3  ── CRUD & Data Parity
  │       • Quick add/edit parity, scheme history
  │       • Import/export validation (Appendix templates)
  ├─────────────▶ Archived: docs/Archive/Tasks/03_phase-3-crud-and-data-parity-prd.md
Phase 4  ── Accessibility Sweep & Polish
  │       • VoiceOver/NVDA laps, bulk edit matrix hardening
  │       • Screenshot + documentation refresh
  ├─────────────▶ Archived: docs/Archive/Tasks/04_phase-4-accessibility-and-final-parity.md
Phase 5  ── Stabilization & Validation
  │       • Local persistence, validation gating, tag catalogue retention
  │       • Import/export copy, bulk-edit summary panel
  ├─────────────▶ Archived: docs/Archive/Tasks/05_phase-5-stabilization-and-validation-prd.md
Phase 6  ── Migration & Reuse
  │       • Stage 1: Overlay migration (`plans/2025-10-10_overlay-migration.plan.md`)
  │       • Stage 2: Form migration (RHF/Zod wrappers)
  │       • Stage 3: Table migration (TanStack)
  │       • Supporting tasks:
  │           - `docs/Tasks/phase-6-overlay-discovery.md`
  │       • Stage 4+: Cleanup, QA, AI UAT (see `docs/Tasks/06_phase-6-migration-planning-prd.md`)
  └─────────────▶ Execution playbook archived: docs/Archive/Tasks/06_phase-6-migration-execution-plan.md
Phase 7  ── Wrapper & Component Library Hardening
  │       • Stabilise shared wrappers (Dialog/Overlay, Button, FormField, EmployeeForm)
  │       • Employee list split into hook + sectional components under `src/components/EmployeeList/`
  │       • Document imports/usage via README + Storybook, add wrapper smoke tests, mark experimental DataTable usage
  │       • Employee list search upgraded to MiniSearch (`src/utils/search.ts`, `tests/employee-list.spec.ts`)
  │       • TipTap tasks editor wired with accessible labels + helper conversions; CSV/Excel flows reuse shared utilities
  │         (`src/components/common/RichTextEditor.tsx`, `src/utils/importExport.ts`, `src/components/EmployeeList/useEmployeeListState.tsx`)
  │       • Defer performance dashboard charts to Phase 9 analytics demo selection (tentative)
  │       • Task reference: `docs/Tasks/phase-7-component-library-task.md`
Phase 8  ── Trimmed Production Demo & Dual Deployments
  │       • Clone repo for production parity build, remove demo-only tabs/components
  │       • Configure dedicated Vercel target and document sync workflow with demo repo
  │       • Discovery/plan references: `docs/Tasks/phase-8-trimmed-demo-discovery.md`, `plans/2025-10-20_trimmed-demo.plan.md`
  │       • Strategy note: `docs/System/trimmed-demo-repo-strategy.md`
  │       • Primary task reference: `docs/Tasks/phase-8-trimmed-demo-task.md`
Phase 9  ── Scheduling Behavior Parity (Current)
  │       • Execute `plans/2025-10-12_scheduling-behavior-parity.plan.md`
  │       • Validate behaviors via `docs/Tasks/phase-9-scheduling-behavior-parity.md`
  │       • Capture findings + UAT evidence before handoff
Phase A  ── Manager Portal Refactor-First (Post Phase 9)
  │       • Adopt Chart.js wrappers per `plans/2025-10-12_manager-portal-refactor.plan.md`
  │       • Reference roadmap: `docs/Tasks/post-phase9-demo-execution.md`
Phase B  ── Analytics Dashboard Refactor-First (Post Phase 9)
  │       • Componentise CDN demos using wrappers per `plans/2025-10-12_analytics-extraction.plan.md`
  │       • Reference roadmap: `docs/Tasks/post-phase9-demo-execution.md`
Phase C  ── WFM Employee Portal Parity-First (Post Phase 9)
  │       • Wire forms/tables/dialogs with shared wrappers per `plans/2025-10-12_employee-portal-parity.plan.md`
  │       • Reference roadmap: `docs/Tasks/post-phase9-demo-execution.md`
Phase D  ── Forecasting Analytics Refactor-First (New)
  │       • Migrate accuracy/trend/adjustment views to shared wrappers per `plans/2025-10-24_forecasting-analytics-refactor.plan.md`
  │       • Validate dual‑axis + confidence bands + undo/redo; add adapter tests; integrate into System reports
```
