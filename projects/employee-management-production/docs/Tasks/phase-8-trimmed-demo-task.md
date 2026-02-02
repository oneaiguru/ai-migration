# Phase 8 Task – Trimmed Demo Variant (No Placeholder Tabs)

> **Status:** Active — pending Phase 8 discovery (last updated 2025-10-20)

## Goal
Produce and maintain a “trimmed” Employee Management build without the demo-only tabs (Фото галерея, Показатели, Статусы, Сертификации, Навыки) while preserving the full-featured main branch. The trimmed variant lives in a separate production repository/branch so customer demos stay clean while the demo repo keeps experimental features.

## Scope
- **In scope**
  - Clone the parity repo into a dedicated production workspace (`employee-management-production`) after Phase 6 stabilization completes on `main`.
  - Audit navigation (`src/App.tsx`) and related components to identify demo-only views.
  - Remove unused components/routes in the production repo while keeping the original demo repo untouched.
  - Update docs (README, project-structure, screenshots, parity roadmap) in the production repo to explain the dual-build approach and cross-reference the demo repo.
  - Configure a dedicated Vercel project for the production repo (distinct domain from the demo deployment).
- **Out of scope**
  - Deleting legacy components from the demo repo once the trimmed build exists (demo retains them).
  - Adjusting backend data models.
  - Broad UI redesigns beyond tab removal.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. `docs/Archive/Demo-Modules-Trim-Plan.md`
4. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`
5. `tests/employee-list.spec.ts` (confirm current coverage).
6. `docs/System/parity-roadmap.md` (dual-repo deployment guidance once updated).
7. AI workspace overview:
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md`
   - `ai-docs/QUESTIONS.md`
   - Relevant wrapper drafts in `ai-docs/wrappers-draft/`
   - Applicable playground demos in `ai-docs/playground/src/examples/`

## Pre-Discovery Checklist (MANDATORY)
- [ ] Complete all AI workspace readings listed above before cloning or editing repositories.
- [ ] Note any missing trim-specific guidance (e.g., absent demos) for follow-up in discovery.
- [ ] Capture questions from `ai-docs/QUESTIONS.md` that affect the trimmed build and surface them in discovery notes.

## Discovery Doc Requirements
- Provide an **AI-Docs References** section with file:line citations for each workspace artifact reviewed.
- Provide a **Trim Impact Inventory** enumerating components/docs/tests to adjust (with file:line references).
- Provide a **Missing Assets** note listing any AI-doc gaps plus recommended next steps.

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Map all demo-only components, capture dependencies (imports, screenshots, docs), and note impacts to tests/build inside the new production repo. Document cloning steps and any files that must stay in sync with the demo repo. | `docs/Tasks/phase-8-trimmed-demo-discovery.md` (production repo copy) + `docs/SESSION_HANDOFF.md` entry. |
| **Planner** | Write sed-friendly plan covering repo preparation (clone/init), nav changes, component cleanup, documentation updates, and deployment instructions for the production Vercel project. | `plans/YYYY-MM-DD_trimmed-demo.plan.md` (production repo) + handoff note. |
| **Executor** | Apply plan inside the production repo, run required tests/build, update screenshots/docs, log trimmed deployment URL, and capture sync steps for future updates. | Code changes + `docs/SESSION_HANDOFF.md` update + `PROGRESS.md` status (in production repo). |

## Milestones
1. **Discovery** – Confirm cloning steps, file touch list, required screenshot updates, and blockers (e.g., shared assets) before editing the production repo.
2. **Planning** – Outline phased edits (repo prep, nav cleanup, docs/tests, deployment). Include rollback (e.g., revert to clean clone) and acceptance steps.
3. **Execution** – Run plan end-to-end within the production repo, validate builds/tests, capture updated evidence, archive plan, and note any follow-up required in the demo repo.

## Validation Checklist
- `npm run build`
- Targeted Playwright run ensuring Employees tab flows still pass (planner specifies command).
- Screenshot/index updates verified if UI changes occur.
- Trimmed deployment URL recorded in `docs/SESSION_HANDOFF.md` (production repo) along with the demo repo reference URL.
- Document sync procedure between demo and production repos (e.g., cherry-pick workflow) in the execution handoff.

Capture outcomes and follow-ups in `docs/SESSION_HANDOFF.md` at each milestone.
