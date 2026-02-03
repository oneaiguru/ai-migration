# Token Tracking — Planned vs Actual vs Snapshot

Purpose
- Keep session planning, mid-session checkpoints, and retrospectives consistent by logging three numbers for every session/task: planned tokens, mid-session snapshot(s), and actual usage.

Why (trend analysis)
- **Estimate quality**: comparing planned vs actual over time shows whether 70% window targets are realistic and trending toward stability.
- **Mid-session course correction**: snapshots let us see if we’re veering off plan (e.g., at half session we already burned >70%).
- **Historical trends**: ledger rows become simple data points for charts or simple averages without digging through progress logs.

Workflow
1) Plan next session
   - Set next window budget (target 70–80% of 272K ≈ 190–218K tokens).
   - Append a planning row to `docs/Ledgers/Token_Churn_Ledger.csv` with `tokens_planned`; leave `tokens_actual`/`delta` blank. This gives us the estimate to compare against snapshots and actuals later.
2) Mid-session snapshots
   - Optionally append informational rows (e.g., `session_status_snapshot`) based on `/status` or ccusage.
   - These snapshots have `tokens_planned=0`; they highlight mid-session burn.
3) Session retro
   - Fill in the planning row with `tokens_actual` and `delta = actual − planned`.
   - If scope changed, append a correction row (append-only) describing the adjustment.

Columns (Token_Churn_Ledger.csv)
- `tokens_planned`: budget for the session/task (from planning SOP).
- `tokens_actual`: observed usage at session end (from `/status`, ccusage, etc.).
- `delta`: actual minus planned (positive = overrun, negative = under budget).
- Snapshots: `tokens_planned=0`, `tokens_actual` = context usage at capture time, `delta` optional; they show mid-session burn (e.g., `168K` at 40%).

Append-only discipline
- Never rewrite history; corrections are new rows (see 270k→164k example).
- Use consistent task names (`next_session_planning`, `session_status_snapshot`, etc.) so we can pivot easily.

Outlier guardrails
- If `tokens_actual` consistently exceeds `tokens_planned` by more than ~30% (delta > +60K on 272K window) for three sessions, revisit scoping and the task mix before planning the next run.
- Conversely, if `tokens_actual` is <40% of plan repeatedly, consider combining scopes or raising the target to avoid underutilized windows.
- Log these reviews in `progress.md` or `docs/SESSION_HANDOFF.md` when they trigger, including any scope adjustments or SOP tweaks.

Related SOPs
- `docs/SOP/next_session_planning_sop.md`
- `docs/SOP/session_reflection_sop.md`
