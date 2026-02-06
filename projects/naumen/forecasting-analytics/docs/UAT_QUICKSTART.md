# UAT Quickstart – Forecasting & Analytics

Use this checklist before every UAT handoff so each agent starts with the same baseline.

1. **Confirm context**
   - Read `PROGRESS.md` (top section) and the active plan in `plans/`.
   - Review the latest UAT evidence: `docs/Tasks/uat/2025-10-26_forecasting-uat.md`, `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md`, `docs/Tasks/uat/2025-11-07_forecasting-illustrated-guide-review.md`.

2. **Prep the outbound package**
   - Follow the master workflow in `docs/SOP/uat/master-uat-workflow.md` and packaging rules in `docs/SOP/uat-outbound-package.md` (in the parity docs repo).
   - Create or reuse the Desktop folder named `tmp-forecasting-uat` if you need to stage text logs; do **not** create new screenshots or images.
   - Draft a single-message prompt under `uat-agent-tasks/` (naming guidance lives in `uat-agent-tasks/READ_THIS_FIRST.md`). For this session, use or update `uat-agent-tasks/forecasting_s04_m01_20251107-1200.md`. Reference the current deploy URL from `PROGRESS.md`/`docs/SESSION_HANDOFF.md` and list any text artifacts you will attach from `tmp-forecasting-uat`.

3. **Execute UAT**
   - Point the agent at the latest production build (current: `https://forecasting-analytics-3pemuiun9-granins-projects.vercel.app`).
   - If the run compares against Naumen production, include `uat-agent-tasks/forecasting-illustrated-quick-sheet.md` for navigation.
   - Document findings with textual notes (pass/fail summary, timestamps, console output). Do **not** request or fabricate screenshots.

4. **Archive the results**
   - Append Pass/Fail notes and any links to `uat-agent-tasks/forecasting_s04_m01_20251107-1200.md`.
   - Update `docs/Tasks/uat/2025-10-26_forecasting-uat.md` (replace any “Queued” placeholders with text notes) and refresh `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md` if the comparison changed.
   - Log the outcome and deploy URL in `docs/SESSION_HANDOFF.md` and `PROGRESS.md` when status changes.

5. **Before the next loop**
   - Keep `tmp-forecasting-uat` clean—leave only the text artifacts you just attached.
   - Note blockers or new findings in the active plan and, if lasting, in `docs/System/learning-log.md`.

Pin this file next to the plan when you prep UAT so no steps are missed.
