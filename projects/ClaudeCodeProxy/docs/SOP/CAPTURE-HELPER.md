Title
Capture Helper — rid and partial streams

Purpose
Quickly capture the relevant request id (rid), adjacent usage entries, and any partial stream dump when investigating `/context` errors, flicker/hang, or parse issues.

Prerequisites
- Proxy running on :8082 (adjust if different)
- Logs in `logs/prod/` (default profile)

Procedure
1) Find the rid around a problematic window (e.g., near `/context`):

   rg -n "\\/context|status":400 logs/prod/usage.jsonl | tail -n 5

   # Or search by time window or model switch
   rg -n "model":"claude-(haiku|sonnet).*" logs/prod/usage.jsonl | tail -n 10

2) Once you have the rid (e.g., `868eab99`), collect adjacent entries for that rid:

   rg -n "\"rid\":\"868eab99\"" logs/prod/usage.jsonl -n | sed -n '1,200p'

3) If streaming started, inspect the partial stream dump (CLI crash/parse cases):

   ls -l logs/prod/partials/868eab99.partial 2>/dev/null || true
   ${PAGER:-less} logs/prod/partials/868eab99.partial 2>/dev/null || true

4) Include CLI trace references printed by the CLI during repro (look under `~/.claude-trace/`):

   ls -lt ~/.claude-trace | head -n 5

Verification
- A matching `rid` appears in `usage.jsonl` with adjacent lines showing lane, status, and timing.
- A `.partial` file exists when a stream ended early (tool_use JSON mid‑stream, etc.).
- The snippet you collect allows the next agent to reproduce or reason about the failure without a fresh repro.

Rollback
- None. Optional: prune partials after review with `./bin/cc partials clean`.

