# Task — Scout: Employee Portal Parity Remediation (2025-10-31)

## Context
- Report to analyse: `docs/Archive/UAT/2025-10-31_employee-portal_parity-gap-report.md` (moved from Desktop `k.markdown`).
- Latest executed work structure plan: `plans/2025-10-28_employee-portal-work-structure.plan.md`.
- Prior parity execution plan: `plans/2025-10-28_employee-portal-parity-execution.plan.md`.
- Manual parity backlog anchor: `docs/Tasks/employee-portal_manual-parity-review.task.md`.
- Vision + scout to keep in sync: `docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md`, `docs/Workspace/Coordinator/employee-portal/Visio_Scout_2025-10-14.md`.

The UAT report flags behaviour gaps that go beyond quick fixes (header icons, Work Structure drawer parity, request history, CSV/export, RU copy). We need a fresh scout pass to catalogue each gap, map it to code, manual evidence, and tests so the planner/executor can deliver a complete remediation cycle.

## Role & Required Reading
1. `PROGRESS.md` — verify role is **Scout** and confirm active plans.
2. CE prompts for Scout: `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`, `${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`.
3. SOP: `docs/SOP/code-change-plan-sop.md` (Exploration section).
4. Manuals for reference: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`, `CH3_Employees.md`, `CH5_Schedule_Advanced.md`, `CH7_Appendices.md`.
5. Screenshot gallery: `~/Desktop/employee-portal-manual-pack/images/` (mirrors manual figures) + `docs/UAT/real-naumen/2025-10-13_xds/README.md`.

## Objectives
- Decompose every failing row in the parity gap report into concrete workstreams:
  - Shell/Header & Work Structure.
  - Vacation requests filtering/history/export.
  - Profile parity (Appendix 1 fields, periodic data, contacts).
  - Localisation gaps (icons, RU copy, glossary alignment).
  - Attachments/shift exchange placeholders (document if out-of-scope for this pass).
- For each workstream capture:
  - Manual citation (chapter, section, image id).
  - Current code location(s) in `${EMPLOYEE_PORTAL_REPO}`.
  - Tests that must be added/updated (Vitest, Playwright, csv export harness, etc.).
  - Data/mocks impacted (`src/data/mockData.ts`, services, CSV builders).
  - UAT pack updates (parity_static, trimmed_smoke, screenshot aliases).
- Identify dependencies on other demos or shared wrappers (e.g., Drawer/ReportTable patterns) and flag any coordination required with unified shell.

## Deliverables
- Update (or create if missing) a scout notes file: `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Gap_2025-10-31.md` (structure: Findings, Evidence with file:line, Manuals, Risks, Questions).
- Log summary in `docs/SESSION_HANDOFF.md` under a new **Scout** entry with key findings + recommended next plan focus.
- Add relevant learning-log entries if new insights arise (`docs/System/learning-log.md`) and any wrapper gaps to `docs/System/WRAPPER_ADOPTION_MATRIX.md`.
- No code changes.

## Checklist for Scout Output
- [ ] Findings grouped by workstream with manual + code references.
- [ ] File:line evidence for current implementation gaps.
- [ ] Proposed test coverage additions (unit + E2E) spelled out.
- [ ] Documentation/UAT artefacts to touch listed explicitly.
- [ ] Risks + open questions captured for planner.

