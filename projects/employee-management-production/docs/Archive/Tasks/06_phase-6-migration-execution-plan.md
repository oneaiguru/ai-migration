<!-- ARCHIVED FILE -->
# 06 - Phase 6 Migration Execution (archived)


# Phase 6 – Migration Execution Playbook (Magic Prompt Aligned)

This playbook converts the migration PRD into a concrete 12-session roadmap so every agent can progress without ad‑hoc coordination. It integrates the CE Magic Prompt / Human Layer workflow (plan → research → execute) and sets explicit evidence checkpoints for each slice.

## Core Objectives
- Replace all bespoke overlays, tables, and form shells with the shared Radix / RHF / TanStack wrappers.
- Remove legacy fallbacks (`useFocusTrap`, manual table markup, conditional flags) and leave a canonical, reusable component library for downstream repos.
- Preserve functional parity at every step with automated + manual verification (Playwright, bundle metrics, VoiceOver/NVDA, targeted UI captures).

## Required References Before Each Session
1. **Magic Prompt workflow**
   - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
   - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
   - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`
   - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`
2. **Human Layer context engineering brief**: `/Users/m/Downloads/sort later desktop/HUMAN_LAYER_COMPLETE.md`
3. **Repo artifacts**: `docs/Tasks/phase-6-migration-planning-prd.md`, `ai-docs/ACCESSIBILITY_CHECKLIST.md`, `ai-docs/RESEARCH_BRIEF.md`, `docs/SOP/ui-walkthrough-checklist.md`, `docs/SESSION_HANDOFF.md`.

> **Agent workflow**: before touching code, run PLAN Magic Prompt; record research stubs in `ai-docs/RESEARCH_BRIEF.md`; execute via EXECUTE prompt; finish with compact summary for session handoff.

## Session Roadmap (12 Slices)

| Session | Theme | Key Tasks | Deliverables / Evidence |
| --- | --- | --- | --- |
| 1 | Context & Guardrails | - Read CE Magic Prompt docs<br>- Capture current bundle/test metrics<br>- Flag any blocking env issues | `ai-docs/RESEARCH_BRIEF.md` entry, metrics snapshot in `docs/SESSION_HANDOFF.md` |
| 2 | Overlay Audit | - Catalogue every overlay (Quick Add, drawer, bulk edit, etc.)<br>- Identify Radix gaps (sheet layout, close controls, focus behaviour)<br>- Draft component checklist | Overlay inventory in `ai-docs/RESEARCH_BRIEF.md`, update `ACCESSIBILITY_CHECKLIST.md` statuses |
| 3 | Overlay Implementation (Modal Slice) | - Migrate Quick Add + import/export modals to `Overlay`/Radix<br>- Remove legacy focus shim for these surfaces<br>- Playwright subset run | PR in repo, Playwright spec subset green (`npm run test -- --grep "quick add"`); notes in `SESSION_HANDOFF.md` |
| 4 | Overlay Implementation (Drawer Slice) | - Migrate EmployeeEditDrawer, bulk edit, column settings, tag manager<br>- Delete `useFocusTrap` references<br>- VoiceOver lap | Code merged, `ai-docs/ACCESSIBILITY_CHECKLIST.md` updated, VoiceOver findings logged |
| 5 | Forms Migration | - Wire `EmployeeEditDrawer` + Quick Add to RHF/Zod wrappers<br>- Align validation copy and disabled states<br>- Update tests | Passing Playwright drawer specs, validation docs refreshed in `docs/Tasks/phase-5-stabilization-and-validation-prd.md` |
| 6 | Table Research & Mapping | - Map existing table functionality to TanStack (selection, keyboard, exports)<br>- Produce column definition plan<br>- Prepare fixture data strategy | Plan section in this file (appendix) + entries in `ai-docs/RESEARCH_BRIEF.md` |
| 7 | Table Implementation Core | - Swap legacy markup for `DataTable` wrapper<br>- Ensure selection mode & drawer triggers still function<br>- Run targeted tests (`--grep "Employee list interactions"`) | Implementation commit, Playwright subset 🟢, manual keyboard check logged |
| 8 | Table Enhancements | - Rebuild column settings & exports on top of new table<br>- Validate virtualization with >1k rows (playground data)<br>- Capture bundle delta (`npm run build --report`) | Bundle diff in `SESSION_HANDOFF.md`, updated `ACCESSIBILITY_CHECKLIST.md` (table row nav) |
| 9 | Cleanup & Flag Removal | - Remove feature flags (`VITE_USE_RADIX_OVERLAYS`, `VITE_USE_TANSTACK_TABLE`)<br>- Delete dead code / storage keys<br>- Update docs referencing flags | Clean diff, `docs/System/documentation-index.md` + `PRD_STATUS.md` refreshed |
| 10 | Regression Suite | - Full Playwright run (`npm run test -- --project=chromium --workers=1`)<br>- Rebuild staging + run smoke preview (on request)<br>- VoiceOver + NVDA (if hardware ready) | Test report attached, accessibility notes appended to `SESSION_HANDOFF.md` |
| 11 | Evidence & Handoff | - Refresh required screenshots per `screenshot-capture-guide.md`<br>- Update parity docs (`SESSION_HANDOFF`, `EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`)<br>- Prepare Stage 6 AI-UAT diff check | Updated docs committed, screenshot references resolved |
| 12 | Production Flip & Postmortem | - Deploy via `vercel deploy --prod --yes`<br>- Run Stage 6 AI-UAT against legacy build<br>- Summarise learnings / follow-ups | Production URL logged, AI-UAT findings noted, postmortem section in `SESSION_HANDOFF.md` |

## Research & Placeholder Conventions
- **Research notes**: add bullets under `ai-docs/RESEARCH_BRIEF.md` with `Session X – topic` headings.
- **Open questions**: log in `ai-docs/QUESTIONS.md` with owner + due date.
- **Doc updates**: keep `docs/SESSION_HANDOFF.md` as the canonical timeline—append a subsection per session.
- **Evidence placeholders**: if a screenshot/audio review is pending, use `TODO – capture <state>` in the relevant doc and link to the session entry.

## Execution Checklist per Session
1. Run PLAN Magic Prompt with scope + objectives.
2. Log research tasks using RESEARCH prompt (store outputs in `ai-docs/RESEARCH_BRIEF.md`).
3. Execute changes following EXECUTE prompt; commit or stage diff.
4. Update `SESSION_HANDOFF.md`, parity plan, and relevant SOPs.
5. Compact context (Human Layer guidance) before ending session—summarise outcomes + blockers.

Sticking to this sequence keeps the migration focused and lets subsequent agents resume immediately, cutting the session count needed to reach the canonical post‑migration repo.
