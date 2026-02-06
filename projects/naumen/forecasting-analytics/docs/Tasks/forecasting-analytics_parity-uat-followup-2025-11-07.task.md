# Task: Forecasting UAT Follow-up (2025-11-07)

## Purpose
Capture priority actions after reviewing the latest real vs demo validation (`docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md`). Ensure the next agent focuses on bell/exports evidence and documents remaining real-system gaps.

## Required Reading
1. `PROGRESS.md` — Forecasting section (latest entry 2025-11-07).
2. `plans/2025-11-06_forecasting-analytics-parity-remediation-v4.plan.md` — for context on shipped changes.
3. `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md` — detailed findings.
4. `uat-agent-tasks/2025-11-06_forecasting-real-vs-demo.md` — navigation script for the real Naumen portal.

## High-Priority Follow-ups
- Rerun `parity_static` + `chart_visual_spec` on https://forecasting-analytics-3pemuiun9-granins-projects.vercel.app and document textual Pass/Fail notes (no screenshots) covering:
  - Inline success messaging for build/template exports.
  - Notification bell entries confirming timezone-aware CSV downloads.
  - Accuracy export behaviour (CSV header + bell entry) recorded as text.
- Update `docs/Tasks/uat/2025-10-26_forecasting-uat.md` with 2025-11-07 results (Pass/Fail table and textual notes only).
- Remove or annotate any obsolete screenshot aliases in `docs/SCREENSHOT_INDEX.md` (no new images).
- Log real-portal gaps (absenteeism button inert, trend data missing, bell inactive) in parity tracker (`docs/System/DEMO_PARITY_INDEX.md` or follow-up note) if remediation requires backend coordination.

## Output Expectations
- Completed UAT updates committed alongside refreshed documentation.
- Summary of real vs demo delta called out in the handoff (PROGRESS + `docs/SESSION_HANDOFF.md`).
