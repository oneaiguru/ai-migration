# Claude Monitor Integration Notes (2025-11-06)

## Snapshot Findings
- `claude-monitor` installs via `uv tool install claude-monitor`; multiple entrypoints (`claude-monitor`, `ccmonitor`, etc.) land in `~/.local/bin/` as recorded in `~/wiki/dotfiles/tools/claude-monitor.md`.
- Interactive views default to a full-screen TUI with ASCII progress bars (see `tests/fixtures/claude_monitor/realtime_sample.txt`). Raw STDIN parsing must ignore ANSI escape codes when present.
- Current release (v0.4.3) does not expose a `--format json` switch despite historical wiki notes. All built-in modes stream formatted text only; JSON export will require upstream contributions or log scraping.
- Without an active Claude desktop session the tool prints a static “No active session” banner. For fixture generation we captured the idle banner as a deterministic baseline.

## Proposed Bridge Strategy
1. Accept realtime text output on STDIN and normalise it into structured metrics (`token_usage_pct`, `tokens_used`, `token_limit`, `burn_rate_per_min`, `cost_rate_per_min`, `message_count`).
2. Store summaries in a dedicated JSONL (`claude_monitor.jsonl`) flagged with `source="claude-monitor"`. The data supplements `/usage` panes rather than replacing them.
3. Provide an alias wrapper (`acm <window>`) so operators can run `claude-monitor --view realtime | acm W0-19` after window close.
4. If upstream reintroduces JSON exports, extend the parser to accept both formats (text fallback, JSON preferred) without changing the CLI surface.

## Open Questions
- Confirm whether future releases add JSON export; if so, keep backward compatibility with text fixtures.
- Determine which claude metrics (session vs monthly percentages) align with PRD needs; the realtime view currently surfaces overall plan usage only.
- Evaluate how frequently to poll the monitor to avoid noisy duplicates (default refresh is 10s).

## Next Actions
- Maintain fixture set (`tests/fixtures/claude_monitor/claude_monitor_help.txt`, `tests/fixtures/claude_monitor/realtime_sample.txt`) for parser regression tests.
- Extend parser/test coverage when new monitor fields appear (e.g., plan resets, cost projections).
- Update README/SOP/wiki with alias usage once the workflow is exercised in a live session (still pending real data capture).

- [ ] Build shell automation (`claude-monitor --view realtime`) mirroring Codex wrapper; include PYTHONPATH bootstrap and optional lockfile.
