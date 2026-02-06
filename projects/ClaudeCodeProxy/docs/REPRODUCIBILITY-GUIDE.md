# Reproducibility Guide — P0 Pilot (Haiku ⇒ Z.AI, Sonnet ⇒ Anthropic)

This guide is a copy/paste runbook to reproduce the clean routing proof, run real work safely, and hand off a shareable bundle.

See also: `docs/HANDOFF-DUAL-TERMINAL-PILOT.md` for the two‑terminal (proxied + stock) workflow when shipping real work.

## Prerequisites
- mitmproxy (mitmdump) installed; `~/.mitmproxy/mitmproxy-ca-cert.pem` present
- Z.AI key in `.env` (git-ignored) — either `ZAI_API_KEY=...` or a single-line key
- Repo root: `/Users/m/git/tools/ClaudeCodeProxy`

## Clean Start + Sanity (copy/paste)
```
cd /Users/m/git/tools/ClaudeCodeProxy
MITM_FILTER_CHAIN=1 MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=1 make mitm
source scripts/sub-env.sh 8082
# Refresh login interactively only if 401 appears:
# claude; /login; /exit
# Minimal proofs (real /v1/messages calls):
claude -p --model haiku  "Say ok" --output-format json
claude -p --model sonnet "Say ok" --output-format json
```

## Proof (routing + header hygiene)
```
LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"
# Recent Haiku completions on Z.AI
rg -n '"lane":"zai"' "$LOG_FILE" | rg -i 'haiku' | tail -n 5
# No Haiku completions on Anthropic
rg -n '"lane":"anthropic"' "$LOG_FILE" | rg -i 'haiku' || echo "OK: none"
# Z.AI header must never appear on Anthropic
rg -n '"lane":"anthropic".*"header_mode":"x-api-key"' "$LOG_FILE" || echo "OK: no Z.AI header on Anthropic"
# Summary
make summarize && make verify-routing
```
Expected lines include:
- `{"lane":"zai","model":"...haiku...","status":200,"upstream":"zai","header_mode":"x-api-key"}`
- `OK: none` for Haiku on Anthropic

## Sonnet Orchestration + Haiku Subagent (real work)
Interactive session (recommended for long prompts):
```
cd /Users/m/git/tools/ClaudeCodeProxy
source scripts/sub-env.sh 8082
claude
# In session:
# /model sonnet
# Use the haiku-subagent for scans/greps; keep SSE untouched; save results under results/
```
One-shot examples:
```
# Sonnet one-shot
claude -p --model sonnet "Summarize last 10 changes in services/; propose 3 tiny refactors."
# Haiku one-shot
claude -p --model haiku  "Scan scripts/*.sh for secrets or curl -v usage; output a short table."
```

## Parallel Haiku (multi-terminal or script)
```
# Simple parallel loop (4 shards)
for i in 1 2 3 4; do \
  claude -p --model haiku "Process shard $i (keep output short)" --output-format json > tmp/shard_$i.json 2>/dev/null & \
done; wait
# or use the helper
bash scripts/parallel-subagents.sh 4
```
Afterwards:
```
make summarize && make verify-routing
```

## Troubleshooting
- Port busy on 8082: `pkill -f "mitmdump.*-p 8082" || true` then restart MITM; or use 8083 + `source scripts/sub-env.sh 8083`
- OAuth 401 (Anthropic): `claude; /login; /exit`
- Z.AI 401: `export ZAI_HEADER_MODE=authorization` then restart MITM
- HTTP/2 jitter on host retarget: `export MITM_FORCE_H1=1` then restart MITM
- Kill switch: `export OFFLOAD_PAUSED=1` (forces Anthropic for safety)
- Keep body tee OFF by default; enable only with audit: `make tee-on` / `make tee-off`

## Clean Routing Demo (one command)
```
bash scripts/demo-clean-routing.sh
```
This performs a clean restart, runs 3× Haiku + 1× Sonnet, prints grep proofs, and shows routing summary.

## Bundle for Review
```
make bundle
# => ~/Downloads/agentos_tmp_review-<timestamp> and .tgz
```

## Environment Knobs (reference)
- `FORCE_HAIKU_TO_ZAI=1` — model-only routing (Haiku ⇒ Z.AI)
- `MITM_FILTER_CHAIN=1` — load message-only filter + (optional) body tee addon
- `MITM_FORCE_H1=1` — disable HTTP/2 upstream if needed
- `ZAI_HEADER_MODE=authorization|x-api-key` — Z.AI header selection (default x-api-key)
- `OFFLOAD_PAUSED=1` — force Anthropic (manual failover)
- `HTTPS_PROXY=http://127.0.0.1:<port>` — proxy for Claude CLI
- `NODE_EXTRA_CA_CERTS=~/.mitmproxy/mitmproxy-ca-cert.pem` — trust MITM CA

## Acceptance Gates (P0)
- Routing: Haiku ⇒ Z.AI; Sonnet ⇒ Anthropic; no cross‑leak
- Stability: streams intact; no stalls in short proofs
- Observability: usage.jsonl + summarize/verify-routing are consistent
- Safety: body tee off; no secrets logged

## Where Things Land
- Live telemetry: `logs/usage.jsonl`
- Anomalies (backoff): `logs/anomalies.jsonl` (when enabled)
- Claude traces: `.claude-trace/log-*.{jsonl,html}`
- Metrics: `results/METRICS.json` (make summarize)
- Review bundle: `~/Downloads/agentos_tmp_review-*.tgz`

---
This guide keeps the process reproducible for operators and reviewers. For a smaller, single-purpose proof, see `docs/DEMO-CLEAN-ROUTING.md`.
