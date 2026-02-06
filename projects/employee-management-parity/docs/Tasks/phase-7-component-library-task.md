# Phase 7 Task – Component Library & Wrapper Stabilisation

> **Status:** Completed — see `docs/SESSION_HANDOFF.md` (2025-10-15 planner/executor entries)

## Goal
Create a reusable wrapper/component library inside this repository so upcoming modules (Schedule, Reporting, Forecasting) can adopt the Employee Management patterns without duplicating code. Harden APIs under `src/wrappers/`, document usage, and prepare testing/packaging hooks while keeping implementation local (per ADR 0002).

## Scope
- **In scope**
  - Inventory all wrappers (`ui`, `form`, `data`, `shared`) and confirm current consumers in Employee Management.
  - Harden high-use wrappers first (`ui/Dialog`, `components/common/Overlay`, `ui/Button`, `form/FormField`, `form/EmployeeForm`) with documented props, examples, and smoke tests.
  - Call out experimental wrappers explicitly (e.g. `data/DataTable`) and defer implementation work to the table-migration task unless a planner states otherwise.
  - Add or expand documentation (`src/wrappers/ui/README.md`, new README for `form/` if needed) plus usage snippets that demonstrate `titleHidden`/`descriptionHidden`, button variants, and form error handling.
  - Update barrel exports so consumers import via `@wrappers/ui`, `@wrappers/form`, etc., without reaching into leaf files.
  - Refresh system docs (`docs/System/project-structure.md`, `docs/System/parity-roadmap.md`) to explain wrapper ownership and when to copy updates into the production parity repo.
- **Out of scope**
  - Publishing a standalone npm package.
  - Migrating Schedule/Reporting modules (future phases).
  - Reworking `data/DataTable` virtualisation logic; leave deep changes for the dedicated table-migration initiative while documenting its current alpha status.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md` (role mapping + prompts)
3. `docs/ADR/0002-wrapper-layer-ownership.md`
4. `docs/Tasks/06_phase-6-migration-planning-prd.md`
5. `ai-docs/RESEARCH_BRIEF.md`

## Pre-Discovery Checklist (MANDATORY)
- [ ] Read the AI workspace files listed above **plus**:
  - `ai-docs/README.md`
  - `ai-docs/MANIFEST.md`
  - All relevant wrapper drafts under `ai-docs/wrappers-draft/`
  - Corresponding playground demos under `ai-docs/playground/src/examples/`
  - `ai-docs/QUESTIONS.md` for open wrapper issues
- [ ] Note any missing drafts or demos for follow-up during discovery.

## Discovery Doc Requirements
- Provide an **AI-Docs References** section with file:line citations for every workspace asset consulted.
- Provide a **Wrapper Gap Inventory** section identifying production gaps with file:line evidence.
- Include a **Missing Assets** note describing absent AI-doc materials and recommended next steps.

## Current Baseline (2025-10-11)
- `ui/Dialog` and `components/common/Overlay` now expose `titleHidden`/`descriptionHidden` props and rely on `@radix-ui/react-visually-hidden`; documentation needs to reflect the new contract and the Playwright warning guardrail.
- `ui/Button` ships variants (`primary`, `secondary`, `ghost`, `danger`) and sizes but lacks README coverage and examples for focus management.
- `form/FormField` + `form/EmployeeForm` wrap React Hook Form + Zod, yet have no dedicated README or integration smoke test; exports live under `src/wrappers/form/index.ts`.
- `data/DataTable` provides TanStack hooks with virtualization and keyboard nav and is now used in production; reviewers expect documentation, Storybook demos, and wrapper smoke tests before declaring it stable.
- Component review (`ai-docs/llm-reference/1760097242546_10-07-1_Comprehensive_WFM_Demo_Stack_Evaluation.md`) flagged missing Storybook examples, READMEs, and wrapper test coverage plus the need to refactor `EmployeeListContainer.tsx` into smaller components to support extraction.
- Barrel exports (`src/wrappers/index.ts`, `src/wrappers/ui/index.ts`, `src/wrappers/form/index.ts`) currently expose everything but need validation that new props remain typed and tree-shakeable.

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Trace wrapper usage, record API gaps, capture file:line evidence, list external dependencies (Radix/TanStack/RHF). | `docs/Tasks/phase-7-component-library-discovery.md` (create/update) + `docs/SESSION_HANDOFF.md` entry. |
| **Planner** | Produce sed-friendly plan covering API changes, docs/tests updates, TypeScript barrel tweaks, and documentation refresh (README + system docs). Explicitly flag any deferred work (e.g. `DataTable`) with rationale. | `plans/YYYY-MM-DD_component-library-stabilization.plan.md` (Magic template) + handoff note. |
| **Executor** | Apply plan commands, run `npm run build` + targeted Playwright slice, update wrapper docs and system references, archive plan. | Code changes + `docs/SESSION_HANDOFF.md` update + `PROGRESS.md` status + plan archived under `docs/Archive/Plans/executed/`. |

## Milestones
1. **Discovery** – Capture wrapper usage and gaps with file:line evidence (e.g., `ui/Button` lacks README, `form/EmployeeForm` missing tests). Confirm if any wrappers are demo-only so production trim work can avoid regressions.
2. **Planning** – Author plan with phased sections (UI wrappers → form wrappers → docs/tests → system-doc updates). Include rollback and acceptance criteria; specify the targeted Playwright subset (e.g., `--grep "Employee list"`) plus any wrapper-specific smoke suite.
3. **Execution** – Run plan, validate tests, update parity/system docs, archive plan, and note follow-ons (e.g., schedule DataTable hardening under the table-migration initiative).

## Validation Checklist
- `npm run build`
- Targeted Playwright subset covering overlays/forms using wrappers (planner specifies exact command, e.g. `npm run test -- --project=chromium --workers=1 --grep "Employee list"`).
- Newly added wrapper smoke tests (if introduced) pass locally.
- Updated docs reviewed (`src/wrappers/ui/README.md`, `docs/System/project-structure.md`, parity roadmap entry for wrapper ownership).

Document results and blockers in `docs/SESSION_HANDOFF.md` each time a milestone completes.
