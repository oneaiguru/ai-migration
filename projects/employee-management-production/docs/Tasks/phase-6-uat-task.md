# Phase 6 Task – Stage 6 AI UAT & Final Report

## Goal
Execute the Stage 6 AI-assisted UAT checklist against the migrated Employees module, compare current and previous builds, and produce the final UAT report that closes Phase 6.

## Scope
- **In scope**
  - Run the scripted browser-agent walkthrough using the Stage 6 checklist.
  - Capture evidence (screens, logs) for any regressions or confirmations.
  - Update `docs/Archive/stage-6-ai-uat/` with a new comparison report, referencing prior sessions.
  - Refresh `docs/SESSION_HANDOFF.md`, `docs/SESSION_SUMMARY.md`, and `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` with UAT outcomes.
  - Coordinate with deployment targets (Vercel URLs) per SOP.
- **Out of scope**
  - Fixing issues beyond minor doc/test updates; significant bugs need new plans.
  - Introducing new manual test cases outside the approved checklist.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. `docs/SOP/plan-execution-sop.md`
4. `docs/SOP/ai-uat-browser-agent.md`
5. `docs/Tasks/06_phase-6-migration-planning-prd.md` (Stage 6 section)
6. **AI workspace references:**
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md`
   - `ai-docs/QUESTIONS.md` (open issues to verify)
   - `ai-docs/reference/` materials relevant to UAT tooling
   - Previous UAT assets under `ai-docs/playground` if applicable

Discovery and reports must cite the AI-doc files reviewed before running the checklist.

## Pre-Discovery Checklist (MANDATORY)
- [ ] Complete all AI workspace readings listed above before reviewing deployments or checklists.
- [ ] Capture any missing UAT tooling notes or outdated prompts for follow-up.
- [ ] Ensure `ai-docs/QUESTIONS.md` items are copied into the discovery focus list.

## Discovery Doc Requirements
- Include an **AI-Docs References** section with file:line citations for each workspace artifact reviewed.
- Include a **UAT Focus Areas** section mapping checklist steps to current deployment assets (with references).
- Document a **Missing Assets** note outlining any AI-doc gaps and proposed remediation.

## Current Baseline (2025-10-11)
- Latest UAT report compares builds `nsp559gx9` vs `gnlqewuz2`; new migrations may shift behaviours.
- SOP requires keeping both legacy and refactor deployments available during testing.
- Stage 6 checklist resides in `docs/Tasks/stage-6-ai-uat-checklist.md`.

## Role Cadence & Deliverables
| Role | Key Actions | Deliverables |
| --- | --- | --- |
| **Scout** | Confirm deployments, checklist steps, AI-doc guidance; list test focus areas and evidence requirements. | `docs/Tasks/phase-6-uat-discovery.md` + handoff entry citing AI-doc references. |
| **Planner** | Produce plan detailing UAT execution order, capture tooling, log locations, follow-up thresholds, and rollback/abort criteria. | `plans/YYYY-MM-DD_stage6-uat.plan.md` + handoff entry. |
| **Executor** | Execute checklist, capture evidence, compile final report, update docs, run build/tests if needed for verification, archive plan. | New Stage 6 report + documentation updates + PROGRESS update. |

## Milestones
1. **Discovery** – Validate deployments, gather AI-doc context, outline test matrix.
2. **Planning** – Draft execution plan with evidence capture steps and failure handling.
3. **Execution** – Run UAT, document findings, archive plan, close Phase 6.

## Validation Checklist
- `npm run build` (if required by plan)
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"` (if plan requests automated sanity checks)
- AI UAT checklist completion with screenshots/logs stored and referenced.

Document results and next steps in `docs/SESSION_HANDOFF.md` and mark Phase 6 complete in `PROGRESS.md` once all acceptance criteria are met.
