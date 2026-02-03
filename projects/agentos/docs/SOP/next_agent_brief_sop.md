# SOP — Next Agent Briefs (Sequential, Repeatable)

Purpose
- Provide a concise, self‑contained brief the next agent can execute autonomously for a single session/window.
- Standardise where briefs live, what they contain, and how they reference plans, SOPs, and validation.

Where briefs live
- Path: `docs/CurrentPlan/<NNN>_Agent_Brief.md` (three-digit sequential numbering).
- A matching TLDR lives alongside it: `docs/CurrentPlan/<NNN>_PRO_TLDR.md`.
- One brief per session. Keep the folder flat (no subdirectories) for grepability.

When to create
- At the end of a session (handoff) or immediately before the next session starts, after running the UAT opener.
 - If an external TLDR was provided, ingest and process it first per `docs/SOP/external_tldr_ingestion_sop.md`, then draft/update the brief and board.

Required structure
- Required Reading (ordered list)
- Session Cadence (short bullets)
- Top Priorities (two blocks — Must‑Ship/Our Picks and Pro Picks if relevant)
- Validation Matrix (exact commands)
- E2E Testing Augmentation (optional, fold into priorities when possible)
- End‑of‑Session SOP (close‑out checklist)
- Guardrails (product focus, append‑only corrections)
- Tasks: Briefs must reference task specs under `docs/Tasks/` (single source of truth). Do not duplicate task content in briefs; track progress in `docs/Tasks/*` (e.g., `tracker_cli_todo.md`).
 - Link the paired `docs/CurrentPlan/<NNN>_PRO_TLDR.md` at the top so the operator can cross‑check intent vs brief.

Naming & metadata
- Filenames are flat and sequential (no nesting):
  - `docs/CurrentPlan/<NNN>_Agent_Brief.md`
  - `docs/CurrentPlan/<NNN>_PRO_TLDR.md`
  - `plans/<NNN>_next_session.plan.md`
  - `docs/SessionBoards/<NNN>_board.md`
  - `docs/SessionReports/<NNN>_Learnings.md`
- Use the same `<NNN>` across the set; titles should reference the brief number (e.g., “Brief #1”).

Template (copy/paste and fill)

```
# Next Agent Brief — <Brief #N>

## Required Reading
- docs/SOP/PRD_v1.6-final.md
- docs/SOP/week0_final_protocol.md
- docs/System/contracts.md (and UPS doc)
- docs/SOP/saturday_prep_checklist.md
- docs/Recipes/{codex_status_capture,ccusage_ingest}.md
- docs/Tasks/tracker_cli_todo.md
- docs/SessionBoards/<NNN>_board.md

## Session Cadence
- UAT (green) → execute priorities in order → update ledgers + handoff → leave plan pointer.
- Data is append‑only; corrections are new rows.

## Top Priorities (Our Picks)
- <Priority‑1>
  - Outcome: <one‑liner>
  - Validate: <tests/behave/preview>
  - Budget: <~tokens>
- <Priority‑2>
  - Outcome/Validate/Budget …

## Top Priorities (Pro Picks)
- Optional supporting items (e.g., deliverables bundle, docs/wiki sync) with outcomes/validation/budgets.

## Validation Matrix
- PYTHONPATH=tracker/src pytest
- PYTHONPATH=tracker/src behave features
- PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>

## E2E Testing Augmentation (if applicable)
- Live Codex automation sanity; ccusage daily/weekly ingest; alias delete robustness; narrow/multi‑pane guards.

## End‑of‑Session SOP
- Follow docs/SOP/session_reflection_sop.md: TLDR, plan vs actual, shipped scenarios, risks/blockers, next steps; update ledgers + handoff; ensure a new dated plan exists under `plans/` and is linked from progress.md and docs/SESSION_HANDOFF.md.

## Guardrails
- Follow docs/SOP/product_focus_guardrails.md. No data‑padding features. Tie work to PRD/board only.
```

Appendix — Example content (for reference only)
- Session Cadence and two “Top 4” blocks used previously:
  - UAT opener → execute priorities → update ledgers + handoff → dated plan pointer.
  - Our Picks: schema/tool version stamping; Claude automation wrapper; live ccusage daily/weekly; preview audit line.
  - Pro Picks: UAT at start; deliverables bundle; docs/wiki sync; backlog hygiene.
- Keep example snippets as guidance; do not copy verbatim when the board has changed.

References
- docs/SOP/uat_opener.md
- docs/SOP/product_focus_guardrails.md
- docs/SessionBoards/<date>_board.md
