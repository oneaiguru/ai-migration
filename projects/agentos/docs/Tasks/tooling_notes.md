# Tooling Notes (claude-trace)

Summary of required practices when launching delegated sessions via `claude-trace` (source: ~/Documents/replica/orchestrator/wfm-top/imports/l1/orchestration-rules-refined.md).

- Always `cd` into the target agent folder before invoking `claude-trace --run-with`; skipping the directory change corrupts the session state (`claude-trace --run-with -c -p "task"`).
- Follow the CE five-stage loop by spawning separate `claude-trace` runs: `GOAL` (fresh prompt), `Research` (`-c` continue), `Compact` (fresh), `Plan` (`-c`), `Execute` (`-c`).
- Delegate long-running work with `--dangerously-skip-permissions` and background execution (`&`), then monitor each job every 119 seconds via `BashOutput` to beat the 120-second timeout used by `claude-trace`.
- Use `-c` (`--continue`) when preserving session context; omit it when starting a new phase after compaction or handoff.
- Maintain clean context: compact before plans, limit raw imports, store findings in files between phases, and restart with fresh sessions when context exceeds thresholds.

Keep this doc updated as additional claude-trace conventions surface.
