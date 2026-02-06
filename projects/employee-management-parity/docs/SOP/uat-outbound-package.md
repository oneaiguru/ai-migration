## UAT Outbound Package – Process

Purpose
- Package a single, paste‑ready prompt and any attachments for the external UAT agent (who is not on our filesystem).

Prompt storage
- Every UAT prompt or session log lives in `uat-agent-tasks/` (no additional outbound folders).
- File naming: `<demo-slug>_s<session#>_m<message#>_<YYYYMMDD-HHMM>.md` (24h clock, minute precision). Example: `manager-portal_s03_m01_20251105-1030.md`.
- Session number increments each time we start a new UAT session for that demo; message number increments if we need multiple messages in the same session.
- Attachments (screenshots, JSON, etc.) are staged outside the repo (e.g., `/Users/m/Desktop/tmp-<demo>-uat/`) before sending to the tester; do not check those into git.

Workflow (no-tools path preferred)
1) Create a new markdown file in `uat-agent-tasks/` using the naming scheme above.
2) Draft the single-message prompt inside that file. Include:
   - Targets (deploy URLs pulled from the tracker/hand-off)
   - Packs to run per demo (reference `docs/Tasks/uat-packs/*.md`)
   - Focus checks/deltas for this session
   - Pass/Fail table template for the tester
   - Attachment list (filenames you will upload)
3) Upload the listed attachments in the chat UI and paste the prompt text as one message.
4) When results arrive, append the Pass/Fail table and notes to the same session file and update the consolidated sweep / Findings per the task instructions.

Roles
- Per-demo executors attach any demo-specific artifacts (optional) and update their Findings rows.
- UAT Packager (any agent) assembles the session file and attachment list in `uat-agent-tasks/` and requests orchestrator review.
- Orchestrator reviews and green‑lights the outbound package before the owner sends it.

Notes
- The UAT agent only sees the public URLs and attached files; do not reference local paths in the prompt.
- Keep the prompt single-message, explicit, and outcomes-focused.
- Do **not** embed deploy URLs inside the shared pack files (`docs/Tasks/uat-packs/*.md`). Packs describe the checks only. Use the current deploy URL recorded in `docs/Tasks/post-phase9-demo-execution.md` (Agent Assignments & Outcomes) or the latest `docs/SESSION_HANDOFF.md` entry when assembling the outbound prompt.
- Capture the URL you actually tested in the execution artifacts (`uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` and demo-specific findings). This keeps the git history as the authoritative archive for every run.

### Pack ownership (all demos)
- `docs/Tasks/uat-packs/parity_static.md` — Static parity checklist (Manager Portal, Analytics Dashboard, WFM Employee Portal, Forecasting & Analytics, Employee Management parity demo, Scheduling mock, Unified shell).
- `docs/Tasks/uat-packs/trimmed_smoke.md` — Live smoke checklist for the same demos.
- `docs/Tasks/uat-packs/chart_visual_spec.md` — Visual behaviour checks for Manager Portal, Analytics Dashboard, Forecasting & Analytics.
- When a new demo is added, extend each relevant pack with a new section so all agents share the same canonical instructions.
