Title
Fix Plan — Interactive /context Errors (Mixed Z.ai ↔ Anth)

Problem
- In interactive sessions, `/context` returns errors:
  - On Haiku (Z.ai): 400 invalid_request_error — "temperature may only be set to 1 when thinking is enabled".
  - After switching to Sonnet (Anth): `SyntaxError: Unexpected token … is not valid JSON`.
- Routing itself works (Z.ai 200s present); errors are due to meta‑command payload and response encoding/streaming.

Repro (captured 2025‑10‑28)
```
claude
> /model claude-haiku-4-5-20251001
> /context   # 400 invalid_request_error (thinking/temperature constraint)
> /model claude-sonnet-4-5-20250929
> /context   # SyntaxError: not valid JSON
```

Artifacts / Evidence
- CLI traces: `/Users/m/Documents/replica/.claude-trace/log-2025-10-28-13-54-58.{jsonl,html}`
- Routing proofs (Z.ai 200):
  - `logs/prod/usage.jsonl:2573`
  - `logs/prod/usage.jsonl:2574`
  - `logs/prod/usage.jsonl:2575`
- Shim status: `logs/prod/ccp.out` shows licensed and listening on :8082.

Root Causes (hypothesis)
1) CLI constraint: `/context` payload includes `temperature=1` without enabling "thinking"; Anthropic rejects with 400.
2) Encoding: Anth lane may return gzip/streamed content for `/v1/messages` meta‑commands; CLI expects identity JSON and throws SyntaxError.

Proposed Fix
1) Normalize encoding on Anth lane for JSON paths (match Z.ai behavior):
   - In `services/go-anth-shim/cmd/ccp/main.go`, within the Anth branch when building the upstream request for non‑stream JSON, set:
     - `Accept-Encoding: identity`
   - Ensure we do not forward client gzip to Anth for JSON meta‑commands.
2) Optional: Guarded debug for meta‑commands:
   - When `SHIM_DEBUG_HEADERS=1`, log `content-type` and `content-encoding` for `/v1/messages` to confirm path‑by‑path encoding.
3) Docs: add a note on CLI constraints for `/context` (thinking/temperature) to SOP.

Acceptance Criteria
- `/context` returns valid JSON without SyntaxError after switching models (Haiku→Sonnet and Sonnet→Haiku).
- No gzip surfaces to the CLI on Anth lane for JSON meta‑commands (verified via debug or header inspection).
- Existing Z.ai flows remain green (FW2, FW3).

Verification Steps
```
# Licensed and running on :8082
timeout 60 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 claude -p --model claude-haiku-4-5-20251001 "Say ok" --output-format json

claude
> /model claude-sonnet-4-5-20250929
> /context   # should succeed
> /model claude-haiku-4-5-20251001
> /context   # should either succeed or show a clear 400 if CLI constraints apply; no JSON parse error
```

Files to Touch
- `services/go-anth-shim/cmd/ccp/main.go` — Anth lane header normalization (Accept-Encoding for JSON paths) and optional debug.
- `docs/SOP/HAIKU_ROUTING_CHECK.md` — add CLI constraints note under troubleshooting.

Rollback
- Revert the header normalization if any regressions are observed and reopen this task.

