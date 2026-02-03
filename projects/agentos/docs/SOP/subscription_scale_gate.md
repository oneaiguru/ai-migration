## SOP — Subscription & Scale Gate (v0)

Decision Policy
- Only expand subscriptions (new provider or higher tier) when ALL gates pass:
  1) Data quality: last 3 windows/provider are A‑grade (automation/alias inputs, clean before/after, non‑negative deltas) with ccusage/monitor corroboration.
  2) Stats: preview shows efficiency with n≥3 and CI not `n/a`; provider CIs do not materially overlap.
  3) Cost signal: quality‑adjusted efficiency (features × quality / capacity) is lower (better) for the candidate arm over last 3 windows.
  4) Ops readiness: standing jobs are operational (daily/weekly ccusage; Codex/Claude wrappers; end‑of‑session ledger checkpoint).

Action
- If green: add one incremental seat/provider and route a specific, instrumented task battery there.
- If not: keep instrumenting; parallelism without clean data increases noise.

References
- docs/System/scheduler/standing_jobs.md
- docs/CurrentPlan/001_PRO_TLDR.md
