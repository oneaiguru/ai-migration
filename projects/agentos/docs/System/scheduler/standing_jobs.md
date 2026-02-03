# Standing Jobs — Clean-Data Automation Pack (v0)

Purpose
- Keep data A-grade by automating recurring captures with simple, local scripts.

Jobs
- ccusage daily capture (Codex)
  - When: daily, +1h after reset
  - Command:
    - `npx @ccusage/codex@latest daily --json | tracker ingest codex-ccusage --window <W0-XX> --scope daily --stdin --notes automation:ccusage-daily`
  - Notes: write to `data/week0/live`; stamp `reset_at`; offline mode acceptable if pricing fetch fails.

- ccusage weekly capture (Codex)
  - When: weekly, +1h after reset
  - Command:
    - If upstream weekly exists: `npx @ccusage/codex@latest weekly --json | tracker ingest codex-ccusage --window <W0-XX> --scope weekly --stdin --notes automation:ccusage-weekly`
    - Else: aggregate daily; tag `notes=derived:weekly`.

- Codex /status wrappers (before/after)
  - When: at window start and end
  - Prep: `AGENT_ID=main source scripts/tracker-aliases.sh` (state recorded under `data/week0/live/state/main`).
  - Command:
    - BEFORE → `codex /status | scripts/automation/codex_status.sh --phase before --window <W0-XX> --pipe-alias os --data-dir data/week0/live --state-dir data/week0/live/state/$AGENT_ID`
    - AFTER  → `codex /status | scripts/automation/codex_status.sh --phase after  --window <W0-XX> --pipe-alias oe --data-dir data/week0/live --state-dir data/week0/live/state/$AGENT_ID`
  - Guardrails: script enforces ADR‑004 (default `--buffer-seconds 300` for AFTER/cross); keep aliases append-only (`od1`/`od2`) for corrections.

- Claude monitor snapshot (end of window)
  - When: at window end
  - Command:
    - `claude-monitor --view realtime | scripts/automation/claude_monitor.sh --window <W0-XX> --data-dir data/week0/live --notes automation:claude-monitor`
  - Notes: exit fast with helpful message if no stdin/fixture provided to avoid CI hangs.

- End-of-session ledger checkpoint
  - When: session close
  - Command:
    - `scripts/automation/ledger_checkpoint.sh --window <W0-XX> --provider codex --task end_of_session --plan <PLANNED> --actual <ACTUAL> --features <N> --commit-start <shaA> --commit-end <shaB> --notes session-close --decision-card`
    - Use `--data-dir <path>` when running against a sandbox instead of `data/week0/live`.
  - Behaviour:
    - Appends plan/actual (+delta) to `docs/Ledgers/Token_Churn_Ledger.csv` (append-only)
    - Invokes `tracker churn` (non-fatal if window not yet finalized); rerun when commit hashes are known, otherwise note the `decision=missing-commit-range` skip.
    - Encouraged: run `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>`, paste GO/SOFT GO/NO-GO output into `docs/SESSION_HANDOFF.md`, and capture preview excerpts.

- Window audit (read-only hygiene)
  - When: before handoff, or whenever duplicate finalize/snapshot rows are suspected.
  - Command:
    - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <W0-XX>` (human-readable)
    - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <W0-XX> --format json` (machine-friendly bundle)
  - Notes: prints snapshot/finalize counts, highlights duplicates, and shows anomaly/churn tallies. JSON mode mirrors the same data for Show-&-Ask packs. Output is audit-only; no files are modified.

Environment
- Use `TRACKER_ALIAS_STATE_DIR` for alias state; default data dir is `data/week0/live`.
- Keep raw panes outside git; tracker records are stamped (`schema_version`, `tool_version`, `source`, `notes`).

Validation
- For each job, keep a dry-run note and fixture path where possible; ensure UAT opener remains green.

Wiki reference: `~/wiki/replica/work/KnownQuirks.md` (tracks automation quirks, reset timing notes, and standing-job overrides).
