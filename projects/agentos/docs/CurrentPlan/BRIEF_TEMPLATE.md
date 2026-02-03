# Next Agent Brief — <Brief #N>

## Required Reading
- docs/SOP/PRD_v1.6-final.md
- docs/SOP/week0_final_protocol.md
- docs/System/contracts.md (and UPS doc)
- docs/SOP/saturday_prep_checklist.md
- docs/Recipes/{codex_status_capture,ccusage_ingest}.md
- docs/Tasks/tracker_cli_todo.md
- docs/SessionBoards/<board>_board.md

## Session Cadence
- UAT (green) → execute priorities in order → update ledgers + handoff → leave plan pointer.
- Append‑only data; corrections are new rows.

## Top Priorities (Our Picks)
- <Priority‑1>
  - Outcome: <one‑liner>
  - Validate: <tests/behave/preview>
  - Budget: <~tokens>
- <Priority‑2>
  - Outcome/Validate/Budget …

## Top Priorities (Pro Picks)
- Optional supporting items with outcomes/validation/budgets.

## Validation Matrix
- PYTHONPATH=tracker/src pytest
- PYTHONPATH=tracker/src behave features
- PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>

## E2E Testing Augmentation (optional)
- Live Codex automation; ccusage daily/weekly ingest; alias delete robustness; narrow/multi‑pane guards.

## End‑of‑Session SOP
- Follow docs/SOP/session_reflection_sop.md; update ledgers + handoff; link new plan in progress.md and docs/SESSION_HANDOFF.md.

## Guardrails
- See docs/SOP/product_focus_guardrails.md. No data‑padding features.
