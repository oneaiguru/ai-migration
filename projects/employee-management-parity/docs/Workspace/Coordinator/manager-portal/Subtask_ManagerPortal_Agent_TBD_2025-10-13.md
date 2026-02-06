## Subtask — Manager Portal (Executor)

Agent Header
- Agent: Agent_Codex
- Role: Executor
- Demo: Manager Portal
- Repo: ${MANAGER_PORTAL_REPO}
- Active Plan: plans/2025-10-12_manager-portal-refactor.plan.md
- Deploy URL: https://manager-portal-demo-80u2ylmlg-granins-projects.vercel.app
- Commit: b91773e1e968b1103a6e6608b5c156b6d17bbe0a
- Outcome: Deploy + UAT Pass + Reports/Checklist/CodeMap updated

First Fix (this pass)
- MP‑1: Implement coverage/adherence toggle via adapters (`src/adapters/dashboard.ts`) and viewToggle wiring in `src/pages/Dashboard.tsx`.

UAT on Re‑deploy
- Packs: docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md, chart_visual_spec.md}
- Record results in the Findings table and Code Map; register screenshots in docs/SCREENSHOT_INDEX.md

Docs to Update
- docs/System/{DEMO_PARITY_INDEX.md, PARITY_MVP_CHECKLISTS.md, WRAPPER_ADOPTION_MATRIX.md}
- docs/Reports/PARITY_MVP_CHECKLISTS.md
- docs/Workspace/Coordinator/manager-portal/CodeMap.md
- docs/SESSION_HANDOFF.md
