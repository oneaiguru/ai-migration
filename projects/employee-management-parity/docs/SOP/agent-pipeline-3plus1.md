## Agent Pipeline – 3 Active + 1 Onboarding (Outcome‑Based)

Purpose
- Coordinate three active Executor agents across demos while a fourth agent onboards to a new demo. Keep the loop simple and artifact‑driven.

Roles
- Active Executors (3): Manager Portal, Analytics Dashboard, Employee Portal
- Onboarding Executor (1): Forecasting & Analytics (joins active set when ready)

Flow (per active demo)
1) UAT → produce findings in the demo repo mapping or curated UAT file.
2) Code → fix behaviour gaps only; build + deploy; no visuals.
3) Docs → update System reports, canonical checklist, CodeMap; log in SESSION_HANDOFF.
4) Create a findings task for next pass using the template `docs/Workspace/Templates/13_UAT_Findings_Task.md` (one file per pass in the demo’s Coordinator folder).
5) Repeat until all in‑scope checks = Pass; then trim (if applicable).

Onboarding Flow (fourth agent)
1) Read plan, CodeMap, UAT packs, and latest findings task for the demo.
2) Fill Subtask_Template.md with the Agent Header and intended outcome.
3) When the first deploy is ready, update the tracker row and begin UAT↔Code loop.

Artifacts
- Findings → Task: `docs/Workspace/Templates/13_UAT_Findings_Task.md`
- Agent Header: `docs/Workspace/Templates/11_Agent_Header_Block.md`
- Handoff Checklist: `docs/Workspace/Templates/12_Agent_Handoff_Checklist.md`

Acceptance (per pass)
- New deploy URL + UAT findings resolved or rolled forward as a findings task
- System reports + canonical checklist updated; CodeMap updated; handoff logged

Notes
- No timeboxes. Work to the outcome: Deploy + UAT Pass + docs updated.
