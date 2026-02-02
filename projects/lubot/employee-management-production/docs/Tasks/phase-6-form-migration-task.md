# Phase 6 Task – Form Migration (Stage 2)

## Goal
Move the Quick Add and Employee Edit flows onto the shared React Hook Form + Zod wrappers so every form in the Employees module uses the Phase 0 foundation. Preserve validation behaviour, accessibility, and parity evidence while retiring the bespoke form logic.

## Scope
- **In scope**
  - Replace legacy local state forms in `src/components/QuickAddEmployee.tsx` and `src/components/EmployeeEditDrawer.tsx` with the wrappers under `@wrappers/form`.
  - Introduce/adjust helpers in `src/components/forms/` to map between entity data and form shapes.
  - Update schemas in `src/schemas/quickAddSchema.ts` and `src/schemas/employeeEditSchema.ts` as needed to support the new wrappers.
  - Refresh Playwright coverage in `tests/employee-list.spec.ts` to exercise the migrated flows (submit, validation, cancel).
  - Document the new form usage in the wrapper README and the parity plan.
- **Out of scope**
  - Writing generic form builders beyond Employee Management needs.
  - Changing feature scope of Quick Add/Edit Drawer forms.
  - Data persistence beyond current local state/localStorage mock.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md` (role prompts + cadence)
3. `docs/SOP/plan-execution-sop.md`
4. `docs/Tasks/06_phase-6-migration-planning-prd.md` (Stage 2 section)
5. **AI workspace (read before discovery):**
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md`
   - `ai-docs/wrappers-draft/form/` (all files)
   - `ai-docs/playground/src/examples/form-demo/` *(if present; otherwise note absence in discovery)*

Record references to the AI workspace in the discovery notes—plans that omit these references will be rejected per SOP.

## Pre-Discovery Checklist (MANDATORY)
- [ ] Read every item listed under the AI workspace section above before touching production code.
- [ ] Log any missing or outdated AI-doc assets (e.g., absent README) for follow-up.
- [ ] Confirm `ai-docs/QUESTIONS.md` is reviewed so open issues are tracked in discovery notes.

## Discovery Doc Requirements
- Include a dedicated **AI-Docs References** section with file:line citations for each workspace artifact consulted.
- Include a **Current Implementation Gaps** section citing file:line evidence in production code.
- Add a **Missing Assets** note if any expected AI-doc materials are absent or stale.

## Current Baseline (2025-10-11)
- Quick Add and Edit Drawer still rely on bespoke state management and manual validation.
- `@wrappers/form/FormField` + `EmployeeForm` exist but lack production usage documentation.
- Schemas live in `src/schemas/` and are partially used in Quick Add; Edit Drawer remains manually wired.
- Playwright coverage asserts basic submission but does not use wrapper selectors.

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Read required docs + AI workspace, capture file:line evidence for current form logic, schemas, wrappers, and tests. Identify missing helper functions or schema gaps. | `docs/Tasks/phase-6-form-migration-discovery.md` + `docs/SESSION_HANDOFF.md` update pointing to specific AI-doc references. |
| **Planner** | Draft a sed-friendly plan that sequences helper creation, component refactors, schema updates, and test adjustments. Include rollback steps and explicit test commands. Reference AI-doc snippets reused by the plan. | `plans/YYYY-MM-DD_form-migration.plan.md` + handoff entry. |
| **Executor** | Follow the plan, migrate forms, update documentation/screenshots as required, run `npm run build` and the targeted Playwright subset, archive the plan, update PROGRESS and handoff. | Code changes, passing tests, updated docs, archived plan. |

## Milestones
1. **Discovery** – Inventory current form flows, wrapper APIs, schema coverage, and AI-doc examples.
2. **Planning** – Produce plan with helper extraction, component rewrites, schema alignment, documentation updates, and test commands.
3. **Execution** – Apply plan, validate tests, update parity evidence, archive plan, note follow-ups.

## Validation Checklist
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Any new wrapper smoke tests introduced for form components.
- Manual verification that Quick Add + Edit Drawer behave as before (validation messages, saved changes).

Document outcomes and blockers in `docs/SESSION_HANDOFF.md` at each milestone.
