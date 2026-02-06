# Stage 6 AI UAT Agent Brief

Follow this brief exactly so you can execute the Stage 6 browser-agent pass, capture evidence, and ship the deployment with minimal turnaround. All prerequisite reading is line-referenced—stick to those ranges before touching anything.

## 1. Read list (in order)
1. `PROGRESS.md:1-80` – confirm role expectation and active plan.
2. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md:1-80` – evidence inventory so you know which reports exist.
3. `docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-gnlqewuz2.md:1-220` – comparison baseline between sequential refactor builds; note improvements vs parity.
4. `docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md:1-220` – final comparison against the legacy refactor build; capture any remaining deltas.
5. `docs/Archive/Demo-Modules-Trim-Plan.md:1-200` – instructions for the trimmed (no demo tabs) build, deployment naming, rollback path.
6. `docs/prompts/stage-6-uat-agent-note.md:1-80` – guardrails for manual-only verification.
7. `plans/05_stage6-uat-report.plan.md:1-200` – sed-ready plan for archiving any new report artifacts; use this if you gather additional evidence.
8. `docs/SESSION_HANDOFF.md:32-110` – current TODOs and deployment expectations.

## 2. Execution steps
1. Launch the Stage 6 checklist defined in `plans/05_stage6-uat-report.plan.md` (Phase 1) against both builds:
   - Latest refactor: `https://employee-management-parity-nsp559gx9-granins-projects.vercel.app`
   - Previous refactor: `https://employee-management-parity-qmpbx1nh9-granins-projects.vercel.app`
   - Trimmed build (no demo tabs, optional): `https://employee-management-parity-trimmed-<id>.vercel.app` (see `docs/Archive/Demo-Modules-Trim-Plan.md` for the active deployment ID)
   - Legacy snapshot (reference only if needed): `https://employee-management-parity-legacy-7b28yt9nh-granins-projects.vercel.app`
2. Record pass/fail notes inline in the checklist and summarize outcomes in `docs/SESSION_HANDOFF.md` section “Stage 6 AI UAT”.
3. If new discrepancies emerge, update `docs/Archive/stage-6-ai-uat/Stage-6-Refactor-Issues-Beyond-the-Checklist.md` (Resolved/Deferred) and regenerate evidence via the plan in `plans/05_stage6-uat-report.plan.md`.
4. Leave structural lists (e.g., numbered readlists) untouched; this is an evidence-and-deployment run. If you must change code, pause and request confirmation.
5. Do **not** run Playwright or other automated tests against the production URLs—manual verification only at this stage (any temporary remote configs have been cleaned up).
6. After reviewing the items above, proceed directly to the execution steps—do not send interim status summaries unless you encounter a blocker.

## 3. Tests & build commands
Run the standard suite to confirm parity before deployment:
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1 --grep "Import"
```
(Only rerun the targeted Playwright suite if import flows change; otherwise, the Stage 6 UAT checklist evidence suffices.)

## 4. Deployment
Once evidence is logged and tests pass:
```bash
vercel deploy --prod --yes
```
Record the resulting URL in `docs/SESSION_HANDOFF.md` (Deployment log section).

## 5. Handoff updates
- `docs/SESSION_HANDOFF.md` – add UAT results, deployment URL, outstanding issues.
- `docs/TODO_AGENT.md` – mark Stage 6 checklist as done or note remaining follow-ups.
- `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` – append any new evidence references if additional artifacts were created (use the plan file to stay consistent).

Stick to this script to keep context tight and ensure the next agent can resume instantly.
