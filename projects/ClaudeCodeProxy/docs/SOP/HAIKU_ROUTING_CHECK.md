# Haiku → Z.ai Sanity Check

Run this whenever you need to prove the shim routes Haiku traffic to Z.ai (or to diagnose when it does not).

## Prereqs
- CCP running on :8082 (`make go-proxy`).
- `scripts/go-env.sh` sourced in the shell:
  ```bash
  source scripts/go-env.sh 8082
  mkdir -p ~/.claude/debug   # avoid CLI EPERM
  ```
- `ZAI_API_KEY` available (either exported or in `.env`).
- Z.ai key verified via curl (optional but recommended; see investigation note).
- If testing licensed mode: run `scripts/dev/dev-license-activate.sh` (writes `logs/dev-license/exports.sh`) and `source` it before `make go-proxy` so the shim loads the pubkey + license paths.
- Anthropic authentication relies on the Claude CLI login (`claude /login`); you do **not** need to set `ANTHROPIC_AUTH_TOKEN`.

### Community-only pass-through (optional)
- To prove the Anthropic-only path, clear any license exports and disable Z.ai routing:
  ```bash
  unset CC_LICENSE_JSON CC_LICENSE_SIG CCP_LICENSE_PUBKEY_B64 ZAI_HEADER_MODE
  export FORCE_HAIKU_TO_ZAI=0
  ```
- Restart the shim (`make go-proxy`) and re-run the commands below; `ccp-logs` (or `tail -f logs/prod/usage.jsonl`) will now show only `lane:"anthropic"` entries.

## Command
```bash
timeout 60 env ANTHROPIC_BASE_URL=http://127.0.0.1:8082 \
  claude -p --model haiku "Say ok" --output-format json
```

## Expected Output
- CLI prints a JSON result (assistant says “ok”).
- `logs/usage.jsonl` shows entries with `"lane":"zai"` and status `200` (or the corresponding success code from Z.ai).
- `/metrics` includes counters for `lane="zai"`:
  ```bash
  rg -n '"lane":"zai"' logs/usage.jsonl
  curl -s :8082/metrics | rg 'ccp_requests_total.*lane="zai"'
  ```

## If it fails
- `license_block` in logs → CCP is in community mode (no license). Export trial license env and restart.
- `status":401"` from Z.ai → header mode mismatch or wrong key. Try:
  ```bash
  export ZAI_HEADER_MODE=authorization
  pkill -f 'services/go-anth-shim/bin/ccp' || true
  make go-proxy
  ```
- CLI errors about `/Users/.../.claude/debug` → create the directory (`mkdir -p ~/.claude/debug`).
- CLI hangs/no output → ensure you’re using `-p` (non-interactive). Interactive `claude` may attempt other endpoints.
- 502 or "http2: timeout awaiting response headers" in `ccp.out` → your network is stalling on HTTP/2. Force HTTP/1.1 and retry:
  ```bash
  export MITM_FORCE_H1=1
  pkill -f 'services/go-anth-shim/bin/ccp' || true
  make go-proxy && source scripts/go-env.sh 8082
  ```

- After an Anthropic 429 (rate limit), switching to Haiku returns 502 upstream error → this is usually the same Z.ai HTTP/2 header stall. Mitigations:
  - Use the full model id: `claude-haiku-4-5-20251001` (alias `haiku` may hit Anth and 404).
  - Ensure the terminal points to the shim: `source scripts/go-env.sh 8082`.
  - Prefer HTTP/1.1 for Z.ai during reproductions (env above) to avoid intermittent header timeouts.
  - Evidence pattern: `usage.jsonl` shows `event:"decision"` for `lane:"zai"` with no subsequent 200 entry; `ccp.out` logs `http2: timeout awaiting response headers` for the same `rid`.

## Logs to Inspect
- `logs/usage.jsonl`: routing decisions, status codes (use `ccp-logs` to tail the file).
- `/tmp/ccp_uat_ccp.log` (when using `scripts/uat/run_t1_t3_ccp.sh`).
- `/tmp/haiku_*.err` if you pipe output to file (captures CLI stderr).

## When to run this check
- After enabling/disabling license packs.
- After changing Z.ai header mode.
- Post-merge of routing or auth changes.
- Before capturing lane evidence for UAT.
