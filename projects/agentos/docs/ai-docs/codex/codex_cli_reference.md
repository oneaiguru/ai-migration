# Codex CLI Reference (2025-10-19)

Mirrors key sections of the official Codex CLI docs relevant to automation and alias workflows.

## Non-interactive Mode

```
codex exec "count the total number of lines of code in this project"
```

- Runs Codex without launching the interactive TUI.
- Defaults to read-only mode (no file edits, network commands blocked).
- Use `codex exec --full-auto` to permit file edits.
- Use `codex exec --sandbox danger-full-access` to allow edits and networked commands.

## Output Control

- Activity streams to `stderr`; only the final assistant message prints to `stdout`.
- Redirect to a file using shell redirection or `--output-last-message` (short `-o`).

## JSON Output Mode

```
codex exec --json "run unit tests"
```

- Streams JSON Lines (JSONL) events to `stdout` while the agent runs.
- Event types: `thread.started`, `turn.started`, `turn.completed`, `turn.failed`, `item.started`, `item.updated`, `item.completed`.
- Item types: `assistant_message`, `reasoning`, `command_execution`, `file_change`, `mcp_tool_call`, `web_search`.

## Session Management

- `codex resume --last` reopens the most recent session (useful after `codex exec`).
- `codex resume <session_id>` targets a specific session; combine with piped commands (`/status`, `/quit`) for scripted captures.

## Error Notes

- Observed frequent MCP timeouts for the `playwright` client during `codex exec`; automation scripts should ignore these stderr lines.

## References

- Official repo: https://github.com/openai/codex
- Task workflow: `docs/Tasks/codex_status_automation.md`
