# SOP – Trim After UAT Pass

Purpose
- Avoid trimming demos prematurely. Trim only after the latest UAT pass confirms behavior parity.

Applies To
- Any demo under active UAT→Code loop (e.g., Scheduling).

Sequence
1) Executor implements behavior changes (visuals frozen).
2) UAT runs delta-focused checks on the new build (see `docs/SOP/uat-delta-walkthrough-sop.md`).
3) If UAT passes → Trim the demo (remove placeholders/hallucinations), then validate.
4) If UAT fails → Return to Planner/Executor; fix; redeploy; re-run UAT. Do not trim.

Rationale
- Trimming before UAT can create duplicate work across repos if defects surface. Gate trimming on a green UAT to keep one clean source of truth.

Acceptance Criteria (before trim starts)
- Mapping doc updated with Pass/Fail for all changed areas.
- Build/tests green; no console errors in smoke.
- UAT agent confirms the feature set intended for trim is behaving correctly.

Artifacts To Update
- Demo repo mapping doc (top URL + Pass/Fail).
- Handoff note in this repo (`docs/SESSION_HANDOFF.md`) with new URL + “UAT passed; proceeding to trim”.

Post-Trim Validation
- Re-run the delta UAT against the trimmed build.
- Update the Parity Index next action and (if applicable) compute reuse % per gate rules.

