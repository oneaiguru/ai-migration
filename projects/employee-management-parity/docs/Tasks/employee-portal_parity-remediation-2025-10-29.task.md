# Task — Employee Portal Parity Follow-up (2025-10-29)

## Objective
Run the full remediation loop for the WFM Employee Portal after the 2025‑11‑01 code updates: confirm the new Work Structure drawer/search, vacation history dialog + CSV export, and Appendix 1 profile fields. Deliver fresh UAT evidence, update documentation, and prepare for any remaining gaps.

## Current State
- Code updates landed (OrgSelection context, drawer search, history dialog, RU CSV, Appendix 1 fields, tests) — see `plans/2025-11-01_employee-portal-parity-remediation.plan.md`.
- Vitest + build passing locally.
- UAT rerun pending on https://wfm-employee-portal-jf96k5u9o-granins-projects.vercel.app.
- Guides added:
  - UAT walkthrough: `docs/Workspace/Coordinator/employee-portal/Guide_UAT_EmployeePortal_2025-10-29.md`
  - Dev implementation map: `docs/Workspace/Coordinator/employee-portal/Guide_Dev_EmployeePortal_2025-10-29.md`
- Staging images folder: `~/Desktop/shots epml mamgnt/` (capture fresh evidence with the alias list below).

## Roles & Deliverables

### Scout (if a fresh recon is needed)
- Read: PROGRESS.md, new guides above, `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`, manual CH2/CH3/CH5/CH7.
- Validate code locations from Guides vs repository to confirm no drift.
- Output: update CodeMap with any newly discovered file/line changes; log findings in SESSION_HANDOFF.

### Planner (only if gaps are found during Scout/UAT)
- If UAT uncovers regressions, author a focused plan (`plans/YYYY-MM-DD_employee-portal_<topic>.plan.md`) referencing the guides and manual sections.
- Include regression tests, docs, and rollback steps.

### Executor (primary next action)
1. Run parity_static + trimmed_smoke packs using `Guide_UAT_EmployeePortal_2025-10-29.md`.
2. Capture screenshots:
   - `portal-work-structure.png`
   - `portal-work-structure-search.png`
   - `portal-vacation-history.png`
   - `portal-profile-appendix.png`
3. Update:
   - `docs/Tasks/uat-packs/parity_static.md` (Employee Portal rows)
   - `docs/Tasks/uat-packs/trimmed_smoke.md`
   - `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md`
   - `docs/SESSION_HANDOFF.md`, `PROGRESS.md`, `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`
   - `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`
4. Verify Vitest + build (`npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run test -- --run`).
5. If everything passes, create the outbound prompt in `uat-agent-tasks/` using the session naming convention and attach screenshots before messaging UAT.

## Acceptance Criteria
- UAT packs updated with Pass results and manual references.
- Screenshot aliases captured and added to the gallery.
- System reports/checklists mirror the new status.
- No localisation regressions (date placeholders, toasts).
- SESSION_HANDOFF + PROGRESS reflect completion.

## Notes
- If any feature is still missing, open a new findings row (Fail) with CH references and raise a follow-up plan before redeploying.
- Keep screenshots and prompts tracked via `uat-agent-tasks/`; folder-based packages are deprecated.
