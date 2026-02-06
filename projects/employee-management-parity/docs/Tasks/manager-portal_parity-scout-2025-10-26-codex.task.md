# Task — Manager Portal Behaviour Parity Gaps (Scout)

Meta
- Agent: manager-portal-scout-2025-10-26-codex
- Date: 2025-10-26
- Repo: ${MANAGER_PORTAL_REPO}
- Inputs reviewed: `/Users/m/Desktop/e.tex`, `docs/Archive/UAT/2025-10-13_real-vs-demo-comparison.md`, `docs/Workspace/Coordinator/manager-portal/{CodeMap.md,Localization_Backlog.md, UAT_Findings_2025-10-13_template.md}`
- Required reading for next role: `PROGRESS.md`, `docs/System/context-engineering.md` (Planner prompts), `docs/SOP/code-change-plan-sop.md` (planning section), `docs/SOP/demo-refactor-playbook.md` (Manager Portal notes), `docs/System/parity-roadmap.md`

## Summary
Latest RU-localised Manager Portal (https://manager-portal-demo-46qb9mity-granins-projects.vercel.app) still diverges from the real Naumen flows captured in the 2025-10-26 UAT deep-dive (`/Users/m/Desktop/e.tex`) and archived comparison (`docs/Archive/UAT/2025-10-13_real-vs-demo-comparison.md:14-62`). Behaviour gaps cluster around navigation parity, requests processing, organisational context, and reporting. Planner must outline behaviour-first work that layers these features without regressing the recent localisation pass.

## Findings & Evidence
1. **Navigation parity + org tree missing** — Real header shows Прогнозы / Расписание / Сотрудники / Отчёты and the "Рабочая структура" drawer (`docs/Archive/UAT/2025-10-13_real-vs-demo-comparison.md:18-22`). Demo sidebar lists only dashboard-centric items with no org selector (`${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:12-104`). Need a plan to expose equivalent modules (even as stubs) and surface hierarchy controls.
2. **Requests workflow lacks CH5 categories** — Approvals view groups everything by priority (`${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:90-200`); real Naumen differentiates schedule-change vs shift-exchange with bulk actions and iconography (manual CH5 §5.4). Planner should scope category filters, bulk approve/reject, and shift-exchange dataset.
3. **Teams dashboard doesn’t reflect organisational structure** — Cards (Teams view) replace the "Рабочая структура" navigation; planners must decide whether to add a department tree, link to org filter, or harmonize both (`${MANAGER_PORTAL_REPO}/src/pages/Teams.tsx:1-240`). Mock data uses Russian names but lacks hierarchical metadata.
4. **Reporting/export hooks absent** — Reports page is placeholder (`${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-40`). Real managers can export T-13/Work Schedule/Deviation reports from approvals (manual CH6 §6.1-6.3). Planner should define how to surface exports (buttons, modals) from approvals + reports routes.
5. **Unified shell misalignment** — Current shell deploy 404s; previous versions only had Employees/Schedule. Need coordination so the shell exposes all four modules and mounts Manager Portal appropriately (`docs/Workspace/Coordinator/unified-demo/CodeMap.md`, `docs/SESSION_HANDOFF.md:760-782`).
6. **Mock data too narrow** — `src/data/mockData.ts:40-210` only stores simple requests (vacation/sick/personal/overtime). CH5 expects shift exchange, replacement, and monitoring statuses. Planner should enumerate required fields (e.g., request category, bulkEligible, shiftPairing) for future adapters/tests.

## Risks / Open Questions
- How will new navigation modules coexist with the unified shell once it’s restored? Need route ownership plan to avoid duplicate tabs.
- Do we keep the Teams dashboard while adding the org tree, or convert cards into an organisational browser? Requires product/UX call.
- Shift-exchange journeys likely need new dialogs/actions; confirm minimum behaviour (per CH5) before planner commits to scope.

## Suggested Next Steps for Planner
1. Outline navigation/org-tree work (modules, header/side-bar, unified shell contract, accessibility notes).
2. Define CH5-compliant request workflows (filters, bulk actions, shift-exchange UI/data, adapter/test updates).
3. Specify reporting/export integration (Approvals buttons + Reports route) with data contracts.
4. Capture unified shell dependencies (deploy restore, tab order, routing) and assign coordination steps.
5. Document required mock/data schema changes and corresponding adapter/test additions.

## Hand-off
- Discovery aligns with `manager-portal-scout` role; no code changes performed beyond prior localisation.
- Planner ID suggestion: `manager-portal-plan-2025-10-26-<handle>`.
- All references captured with file:line to facilitate planning.
