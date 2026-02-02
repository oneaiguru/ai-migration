# Parity Roadmap – Module Staging

This document tracks the planned order of parity work across product modules and captures reusable patterns from Employee Management.

## Completed / In Progress
- **Employee Management (Phase 1 & 2)** – Bulk edit, tag manager, selection mode, dismiss/restore, scheme history, navigation cleanup.
- **Employee Management (Phase 3)** – CRUD/data parity (in progress). Reusable assets:
  - Selection-mode toggle (toolbar-controlled multi-select).
  - Shared focus trap hook (`src/hooks/useFocusTrap.ts`).
  - Task timeline helper (`src/utils/task.ts`).
  - Import/export validation patterns (`EmployeeListContainer.tsx`).
  - Tag limit enforcement pattern (≤4 per employee).
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

## Cross-Module Checklist
- [ ] Confirm SOP references (`session-prep-and-handoff`, `ui-walkthrough`) are module-agnostic.
- [ ] Document shared utilities whenever new patterns emerge.
- [ ] Update this roadmap after each module phase completes; reference the latest Desktop audits (e.g., `2025-10-07_09-00_comprehensive-validation-report.markdown`).
