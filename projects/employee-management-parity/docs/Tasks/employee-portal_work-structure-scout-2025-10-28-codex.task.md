# Task — Employee Portal Header & Work Structure Parity (Scout)

Meta
- Agent: employee-portal-scout-2025-10-28-codex
- Date: 2025-10-28
- Repo: ${EMPLOYEE_PORTAL_REPO}
- Inputs reviewed: `~/Desktop/g.tex`, `docs/Workspace/Coordinator/employee-portal/CodeMap.md`, `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md`
- Required reading for next role: `PROGRESS.md`, `docs/System/context-engineering.md` (Planner prompts), `docs/SOP/code-change-plan-sop.md` (planning section), `docs/System/parity-roadmap.md`, `docs/Tasks/employee-portal_manual-parity-review.task.md`

## Summary
The latest Employee Portal deploy (https://wfm-employee-portal-jf96k5u9o-granins-projects.vercel.app) aligns with the vacation/profile flows in the manual, but the shell still diverges from the real Naumen experience captured in the 2025-10-28 UAT report (`~/Desktop/g.tex`). The biggest gaps are the missing Work Structure header controls and associated filtering behaviour. A planner now needs to scope restoration of the production header/navigation pattern, wire the Work Structure drawer, and ensure future UAT compares evenly across shell, dashboard, requests, and profile screens.

## Findings & Evidence
1. **Work Structure controls absent in demo header** — Real portal header shows notification bell, help link, and the "Рабочая структура" trigger; the demo only has dark-mode toggle and lacks organisation navigation (`~/Desktop/g.tex`, rows 1–3; `${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:23-136`).
2. **Org drawer missing entirely** — Real portal opens a dark-blue drawer listing the organisational tree with search; demo has no drawer or filtering hook (`~/Desktop/g.tex` pass/fail table row 3; `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx` currently unused in header).
3. **Dashboard parity requires Work Structure integration** — Quick actions/stat cards exist only in demo; planner must clarify how to keep them while adding production-style header cues (reference `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`).
4. **UAT verification needs refreshed evidence** — Updated screenshot checklist (`docs/Tasks/screenshot-checklist.md:37-44`) and parity pack matrix (`docs/Tasks/uat-packs/parity_static.md:76-99`) expect new captures once behaviour lands.

## Risks / Open Questions
- Unified shell uses its own header; planner must define how portal-specific header elements interact with the shell mount.
- Do we surface real Work Structure filtering in demo (affecting mock data) or scope a read-only drawer first?
- Need to confirm where notification/help icons should route in demo context.

## Recommended Next Steps for Planner
1. Outline shell/header changes (icons, Work Structure trigger, drawer wiring, accessibility focus order).
2. Describe Work Structure drawer behaviour (mock data schema updates, filtering expectations, search interaction) referencing manual screenshots.
3. Identify interactions between portal header and potential unified shell host.
4. Update parity plan to capture necessary mock data and tests (unit + integration) for header/drawer features.
5. Schedule follow-up UAT (parity_static + trimmed_smoke) once implementation is done.

## Handoff
- Scout role complete; no code changes were made.
- Planner ID suggestion: `employee-portal-plan-2025-10-28-<handle>`.
- All evidence lines recorded to accelerate planning.
