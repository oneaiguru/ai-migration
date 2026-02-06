# Tracker Long-Session Plan (2025-10-19)

## Operating Mode
- **Single-agent loop (Codex)**: continue in the same terminal session, rotating through Scout → Planner → Executor activities without resetting context until the Codex 5‑hour cap forces a pause.
- **Documentation cadence**: every micro-cycle ends with updates to `progress.md`, `docs/SESSION_HANDOFF.md`, and the relevant task brief. No external agents are involved this round.
- **Spec-first rule**: follow `docs/SOP/standard-operating-procedures.md#bdd-workflow-tracker-tooling` before touching code—author/extend `.feature` scenarios, fixtures, step definitions, pytest coverage, and run `behave features`.

## Task Order (Current Backlog)
1. SOP BDD section ✅ (completed this session).
2. BDD parity sweep (see `docs/Tasks/bdd_tracker_standardization.md`).
3. Codex `/status` multi-pane handling (fixture + parser update).
4. ccusage-Codex bridge (JSON ingest, aliases, tests).
5. Claude monitor integration (JSON export, parser, aliases).
6. Any new findings → log in `docs/ai-docs/` + update this plan.

## Execution Notes
- Keep fixtures under `tests/fixtures/` with ASCII names; note the source (e.g., `/Users/m/Desktop/...`).
- Maintain live data integrity: when testing alias flows, reset `data/week0/live/` to the verified state before ending the session.
- Record every command that mutates data or state in `progress.md`.
- Use `docs/Tasks/tracker_feature_log.md` to tally feature files/specs produced during the session.

## Handoff Checklist
- Update `progress.md` + `docs/SESSION_HANDOFF.md` with references to this plan and any completed steps.
- Leave `docs/Tasks/tracker_cli_todo.md` in sync with these priorities (checked boxes, new subtasks as required).
- Ensure the next agent starts by reading this plan + the SOP BDD section before picking up coding tasks.
