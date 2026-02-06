## Orchestrator – Swarm + Auto‑Review (Outcome‑Based)

Purpose
- Coordinate multiple Executor agents (“swarm”) across demos and auto‑review each pass so the UAT ↔ Code loop remains fast and predictable.

Scope
- Docs/library repo only (no code here). Works with external demo repos and UAT agents.
- Outcome‑based: Deploy + UAT Pass + System reports + canonical checklist + CodeMap + handoff updated.

Roles
- Orchestrator (you): assigns work, kicks off agents with context, runs auto‑review, updates tracker, gates trim.
- Executor Agent(s): one per demo; fixes behaviour only, redeploys, updates docs, posts Findings.
- UAT Agent: runs the designated UAT packs on each deploy and records Pass/Fail with aliases.

Inputs to an Executor (kickoff pack)
- Plan file for the demo (plans/YYYY‑MM‑DD_*.plan.md)
- Coordinator files: CodeMap.md, Subtask_*.md, UAT_Findings_*.md (in the demo’s Coordinator folder)
- UAT packs and screenshot aliases for the demo
- Tracker row (Agent Assignments & Outcomes)

Lifecycle per pass
1) Kickoff
   - Paste the Agent Header in the demo’s Subtask file and the PR.
   - Remind outcome + UAT packs + docs to update.
2) Execute
   - Agent fixes behaviour only; deploys.
   - UAT agent runs packs; updates Findings table.
3) Auto‑Review (Orchestrator)
   - Run docs/scripts/auto-review-docs.sh <demo> (basic checks; see below).
   - Verify: new deploy URL; UAT Findings updated; System reports and canonical checklist updated; CodeMap touched; handoff entry added; tracker row current.
   - If missing items: file a Findings task using `docs/Workspace/Templates/13_UAT_Findings_Task.md`.
   - If all good: approve the pass; proceed to the next finding or mark Pass for the slice.
4) Gate
   - If all in‑scope checks = Pass: approve trim (if applicable) and capture final handoff.

Auto‑Review checklist (lightweight)
- Tracker row updated with deploy URL
- UAT Findings file exists and contains at least one updated row
- CodeMap contains current file:line references
- System reports updated; canonical checklist in `docs/Reports/PARITY_MVP_CHECKLISTS.md` synced
- SESSION_HANDOFF.md includes the pass summary

Templates
- Agent kickoff: `docs/Workspace/Templates/14_Agent_Kickoff_Message.md`
- Auto‑review comment: `docs/Workspace/Templates/15_Orchestrator_AutoReview_Comment.md`
- UAT Findings → Task: `docs/Workspace/Templates/13_UAT_Findings_Task.md`

Tools
- `docs/scripts/auto-review-docs.sh <demo>` – performs basic file presence and string checks
- `docs/scripts/health-check.sh` – path hygiene + absolute path detection

Concurrency model (3+1)
- Three demos in parallel (Manager, Analytics, Employee). One onboarding demo (Forecasting) joins when ready.
- Use the tracker as the single source of truth and keep each Subtask file outcome‑focused.

Notes
- No timeboxes: only the outcome matters for each pass.
- Visuals remain frozen; behaviour‑only changes.
