## Troubleshooting (Quick Matrix)

- Z.AI 401 Unauthorized
  - Toggle: `export ZAI_HEADER_MODE=authorization` and restart shim/MITM
  - Verify: grep logs for `"err_type":"401"` dropping after retry

- HTTP/2 host retarget jitter / stalls
  - Toggle: `export MITM_FORCE_H1=1` and restart
  - Expect: similar p95, sometimes better p50

- Haiku on Anthropic lane (unexpected)
  - Check: `FORCE_HAIKU_TO_ZAI` is `1`
  - Confirm: `ZAI_API_KEY` is set in the running process env
  - Grep: `LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"; rg '"lane":"anthropic".*haiku' "$LOG_FILE"` → should be empty

- Z.AI header leaked on Anth lane
  - Ensure: only shim/MITM sets Z.AI header; client must not set any `x-api-key`
  - Grep: `LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"; rg '"lane":"anthropic".*"header_mode":' "$LOG_FILE"` → should be empty

- Upstream override confusion
  - The shim ignores client-side `ANTHROPIC_BASE_URL` / `ZAI_BASE_URL`. Use `CCP_UPSTREAM_ANTH` / `CCP_UPSTREAM_ZAI` (and restart) if you need to point at different upstreams. Decision logs include `"upstream_src": "env"` when overrides are active.

- Body tee writing sensitive content
  - Ensure: body-tee is OFF (default). Only enable briefly with `make tee-on` and rotate logs after.

- Port busy on :8082
  - Fix: `pkill -f "mitmdump.*-p 8082"` or `pkill -f go-anth-shim/bin/ccp`
  - Or: switch to `PORT=8083`

- Summarizer is slow / large logs
  - Rotate: move `usage.jsonl` under `CCP_LOGS_DIR` to the archive directory and start fresh
  - Then run `make summarize` on the small file

- Local license issuer returns 429
  - Device-flow endpoints enforce ~30 requests/min per IP. Pause for a minute or restart `licissuer` if you hit the cap during testing.
