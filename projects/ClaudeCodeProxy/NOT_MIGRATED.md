# Working copy path
/Users/m/ai-claudeproxy-pr3/projects/ClaudeCodeProxy

## Items intentionally not migrated (kept local-only)
- Archives/tars: `Archive*.zip`, `claude-proxy.tar.gz`.
- Logs/traces: `logs/`, `logs/prod/`, `.claude-trace/`, `results/`, `usage_logs/`.
- Large binaries/artifacts: `services/go-anth-shim/bin/`, `services/go-anth-shim/ccp-agg`, `services/go-anth-shim/logs/`, `artifacts/`.
- Temp/staging: `tmp*`, `work/`.
- Samples/fixtures: `samples/`, `fixtures/`.
- Task/notes inbox: `inbox/`, `.fileselect/`.
- Env/locals: `.env`, `users.json` (already ignored), `Archive*`/logs as above.

## Why excluded
These paths are heavy, environment-specific, or contain logs/traces. Keeping them out prevents repo bloat and avoids leaking local data. They remain available in this working copy and the source tree `/Users/m/git/tools/ClaudeCodeProxy`.

## If you need them
- For backup: copy the listed folders/files to your storage target (e.g., network backup) from this path.
- For future imports: remove the corresponding patterns in `.gitignore` and re-add selectively.
