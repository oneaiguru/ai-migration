# PRO TLDR — Next Session + Immediate Follow‑ups (Brief #1)

## Next Session — Churn Automation follow-through
1. **Ledger checkpoint script** — build the end-of-session job sketched in `docs/System/scheduler/standing_jobs.md`: run `tracker churn`, append `Token_Churn_Ledger.csv`, add to `docs/Ledgers/Churn_Ledger.csv`, update handoff pointers. Ship it as `scripts/tools/ledger_checkpoint.sh` (or Python equivalent) with README/SOP notes.
2. **Alias integration plan** (optional stretch) — decide whether alias flows should trigger churn automatically once commit hashes exist; if yes, draft the spec under `docs/Backlog/` for later execution.
3. **Docs sync** — once automation lands, reflect it in `docs/Tasks/tracker_cli_todo.md`, `docs/SESSION_HANDOFF.md`, and wiki (`~/wiki/.../TrackerAliases.md`).

## Minimal Clean‑Data Automation Pack (post Ready‑Next)
1) ccusage daily capture (Codex)
- Run after daily reset +1h; ingest with `--scope daily`; notes=automation:ccusage-daily.

2) Codex /status before/after wrappers
- Use `codex_status.sh` at window start/end; lockfile in `TRACKER_ALIAS_STATE_DIR`.

3) Claude monitor snapshot
- Pipe realtime view to `claude_monitor.sh`; time out and tag errors if needed.

4) Weekly usage snapshot
- If weekly endpoint absent, aggregate daily; notes=derived:weekly.

5) Ledger checkpoint
- End of session script appends token plan vs actual, runs `tracker churn`, and updates handoff paths.

## Code Review (tight)
- `_load` sort: consider `(captured_at or finalized_at, provider)` to stabilise multi‑provider ordering.
- Ensure parsers always emit `errors: []`.
- Keep stamping policy documented: bump `SCHEMA_VERSION` with a short migration note.

## Do Now Checklist
- [x] Ship Ready‑Next (Stats/CI, Outcome, UPS links).
- [x] Churn instrumentation — docs + CLI + preview (completed).
- [ ] Populate `docs/System/scheduler/standing_jobs.md` ledger checkpoint job (script + docs + tests).
- [ ] Keep all ledgers append-only; corrections via new rows (validate script respects this).

Guardrails
- No data‑padding features. All work must tie back to PRD: measurement (Stats/CI), quality capture, UPS alignment, churn instrumentation, or ops time reduction.
- Corrections are append‑only; do not rewrite history.
