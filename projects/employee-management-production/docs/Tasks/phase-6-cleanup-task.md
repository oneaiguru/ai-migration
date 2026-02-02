# Phase 6 Task – Cleanup & Polish (Stage 4)

## Goal
Sweep legacy artifacts left after overlays, forms, and table migrations. Remove dead code, retire temporary feature flags, align documentation, and ensure the repository is ready for final QA.

## Scope
- **In scope**
  - Remove unused utilities, hooks, and feature-flag branches made obsolete by Radix/TanStack/RHF migrations.
  - Harmonise environment variables and `.env.example` with the new defaults.
  - Refresh documentation (parity plan, README, roadmap) to reflect the final architecture.
  - Delete obsolete test fixtures or snapshots, regenerate screenshots if required by parity evidence.
  - Ensure test-results/ and temp artifacts are cleaned.
- **Out of scope**
  - Performance optimisations or new feature development.
  - Component-library hardening (handled in Phase 7).
  - Trimmed demo creation (Phase 8).

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. `docs/SOP/plan-execution-sop.md`
4. `docs/Tasks/06_phase-6-migration-planning-prd.md` (Stage 4)
5. **AI workspace references:**
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md`
   - Relevant clean-up notes in `ai-docs/wrappers-draft/README.md` and `ai-docs/reference/`
   - Any automation scripts under `ai-docs/scripts/`

Document in discovery which AI-doc resources informed the cleanup so future plans can re-use them.

## Pre-Discovery Checklist (MANDATORY)
- [ ] Review every AI-doc asset listed above before scanning the production repository.
- [ ] Note any missing cleanup scripts or outdated references for escalation.
- [ ] Read `ai-docs/QUESTIONS.md` and carry open cleanup items into discovery.

## Discovery Doc Requirements
- Add an **AI-Docs References** section citing file:line details for each workspace artifact consulted.
- Add a **Legacy Artifact Inventory** section listing code/doc assets to remove or update (with file:line evidence).
- Capture a **Missing Assets** note describing absent or stale AI-doc guidance and recommended follow-ups.

## Current Baseline (2025-10-11)
- Legacy hooks (`useFocusTrap`, etc.) have been removed, but other dead code and feature flags remain.
- Documentation references the pre-migration state in several places.
- test-results/ still contains archived failure logs from earlier work.

### 2025-10-11 Review Notes (Actionable Cleanup Targets)
- **Wrapper documentation gaps** – reviewers flagged missing READMEs for UI/Form/Data wrappers (`src/wrappers/ui`, `src/wrappers/form`, `src/wrappers/data`) plus matching AI-doc entries. Capture these in discovery and schedule edits so Phase 6 closes with up-to-date guidance.
- **AI-doc alignment** – ensure `ai-docs/wrappers-draft/form/README.md` exists and mirrors production props, and note any absent TanStack selection/pinning snippets for follow-up.
- **Large component refactor pre-work** – inventory domains within `src/components/EmployeeListContainer.tsx` (toolbar, bulk edit, tag manager, import/export, virtual table) so the Phase 7 refactor plan has precise file:line references.
- **Charts/search placeholders** – document TODO blocks left in `PerformanceMetricsView.tsx` and any MiniSearch references so ownership is clear before handoff.
- **Testing artifacts** – confirm `test-results/` and local-report directories are cleared or ignored post-migration; record any remaining assets for removal.

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Catalogue remaining legacy files/flags/docs, identify AI-doc guidance for cleanup automation. | `docs/Tasks/phase-6-cleanup-discovery.md` + handoff entry citing AI-doc references. |
| **Planner** | Build step-by-step cleanup plan (file deletions, doc edits, env updates, screenshot refresh instructions) with rollback commands. | `plans/YYYY-MM-DD_cleanup.plan.md` + handoff entry. |
| **Executor** | Perform cleanup per plan, run build + tests, ensure docs/screenshots updated, archive plan, update PROGRESS. | Code/doc updates + test evidence. |

## Milestones
1. **Discovery** – Inventory leftover artifacts and AI-doc scripts/resources.
2. **Planning** – Produce comprehensive cleanup plan with validation and rollback steps.
3. **Execution** – Apply cleanup, validate tests/docs, archive plan, log outcomes.

## Validation Checklist
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual check that test-results/ is empty and documentation references are current.

Capture results in `docs/SESSION_HANDOFF.md` and mark completion in `PROGRESS.md` once done.

> 2025-10-11 update: NVDA sweep is deferred to Phase 8 (final UAT). Scouts should skip NVDA evidence gathering during Phase 6 cleanup; focus on screenshot backlog + documentation refresh instead.
