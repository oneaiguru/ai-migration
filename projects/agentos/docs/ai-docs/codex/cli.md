# Codex CLI Notes (2025-10-20)

## Non-interactive Mode
- `codex exec` cannot send control commands like `/status`; it always treats the argument as a plain user message.
- To capture `/status` non-interactively, first seed a session (`codex exec "hi"`) and then pipe `/status\n/quit` into `codex resume --last` (as used by `scripts/automation/codex_status.sh`).
- Expect Codex to print an update prompt; the automation wrapper ignores it and captures the final pane.

## Flags & Output
- `codex exec --json` emits event streams; useful for logging automation but the status pane still requires the resume trick above.
- Use `--sandbox danger-full-access` only when the plan explicitly allows network/file writes.

## References
- Automation recipe: `docs/Recipes/codex_status_capture.md`
- Context pruning & reset behaviour: `docs/ai-docs/codex/context_pruning.md`, `docs/ai-docs/codex-status-refresh.md`
