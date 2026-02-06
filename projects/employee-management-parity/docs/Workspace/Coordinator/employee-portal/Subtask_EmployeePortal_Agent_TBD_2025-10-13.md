## Subtask — WFM Employee Portal (Executor)

Agent Header
- Agent: Agent_Codex
- Role: Executor
- Demo: WFM Employee Portal
- Repo: ${EMPLOYEE_PORTAL_REPO}
- Active Plan: plans/2025-10-12_employee-portal-parity.plan.md
- Deploy URL: https://wfm-employee-portal.vercel.app
- Commit: b91773e1e968b1103a6e6608b5c156b6d17bbe0a
- Outcome: UAT Fail (EP-1 duplicate rows) + reports/checklists updated

First Check/Fix (this pass)
- EP‑1: Verify/fix vacation‑request filters/sorting on `/vacation-requests`.

UAT on Re‑deploy
- Packs: docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md}
- Record results in Findings table and Code Map; register screenshots.

Docs to Update
- docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, CHART_COVERAGE_BY_DEMO.md, APPENDIX1_SCOPE_CROSSWALK.md}
- docs/Reports/PARITY_MVP_CHECKLISTS.md
- docs/Workspace/Coordinator/employee-portal/CodeMap.md
- docs/SESSION_HANDOFF.md
