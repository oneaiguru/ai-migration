# Phase 6 Task – Table Migration (Stage 3)

## Goal
Replace the bespoke Employees grid with the TanStack-powered `DataTable` wrapper so sorting, filtering, selection, and virtualization match the parity spec and future modules can reuse the table foundation.

## Scope
- **In scope**
  - Swap the grid implementation in `src/components/EmployeeListContainer.tsx` to use `@wrappers/data/DataTable` and its hooks.
  - Ensure toolbar interactions (bulk edit, tag manager, import/export, column visibility) still function with the new table state.
  - Update local state management/selectors to rely on TanStack table APIs.
  - Refresh Playwright coverage (`tests/employee-list.spec.ts`) for selection, filtering, column toggles, and CSV export/import flows.
  - Update documentation describing the table contract and known limitations.
- **Out of scope**
  - Large dataset performance tuning beyond the existing wrapper capabilities (handled in later performance work).
  - Changing the visual design beyond parity adjustments needed by the wrapper.
  - Introducing new toolbar features.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. `docs/SOP/plan-execution-sop.md`
4. `docs/Tasks/06_phase-6-migration-planning-prd.md` (Stage 3 section)
5. **AI workspace (mandatory):**
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md`
   - `ai-docs/wrappers-draft/data/DataTable.tsx`
   - `ai-docs/playground/src/examples/table-demo/TableDemo.tsx`
   - Any TanStack-related notes in `ai-docs/reference/`

Discovery notes must cite the AI-doc files used; missing references invalidate the plan per SOP.

## Pre-Discovery Checklist (MANDATORY)
- [ ] Complete all AI workspace readings listed above before reviewing production code.
- [ ] Document any absent demos or drafts (e.g., missing virtualization samples) for follow-up.
- [ ] Review `ai-docs/QUESTIONS.md` to capture outstanding risks in discovery.

## Discovery Doc Requirements
- Provide an **AI-Docs References** section with file:line citations for each workspace artifact consulted.
- Provide a **Legacy Implementation Gaps** section with file:line evidence covering the existing table logic and toolbar interactions.
- Include a **Missing Assets** note summarizing any AI-doc gaps and proposed follow-up actions.

## Current Baseline (2025-10-11)
- Employee list relies on a custom table with manual sorting/filtering and no virtualization.
- `@wrappers/data/DataTable` exists with virtualization hooks but is unused in production.
- Toolbar actions expect the legacy data structures.
- Playwright specs cover selection and filtering but not virtualization-specific behaviours.

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Read required docs + AI workspace, document how the legacy table works, how the wrapper API behaves, and gaps to bridge. | `docs/Tasks/phase-6-table-migration-discovery.md` + handoff entry referencing AI-doc files. |
| **Planner** | Produce sed-friendly plan covering component refactor, state wiring, toolbar integration, test updates, doc refresh, and rollback steps. | `plans/YYYY-MM-DD_table-migration.plan.md` + handoff entry. |
| **Executor** | Execute plan, migrate table, ensure toolbars/tests pass, update parity docs, run build + tests, archive plan. | Code updates + test evidence + PROGRESS change. |

## Milestones
1. **Discovery** – Inventory legacy table flows vs wrapper capabilities; list dependencies (selection, export, column visibility).
2. **Planning** – Sequence component rewrite, state changes, wrapper integration, tests, docs.
3. **Execution** – Apply plan, run validations, update documentation and screenshots, archive plan.

## Validation Checklist
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Additional Playwright focus areas: multi-select, column toggle persistency, CSV import/export.
- Manual QA for virtualization scroll behaviour and keyboard navigation.

Log results and blockers in `docs/SESSION_HANDOFF.md` after each milestone.
