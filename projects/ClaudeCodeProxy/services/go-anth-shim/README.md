Go Anthropic-Compatible Shim (Haiku → Z.AI)

Purpose
- Single-binary local proxy that speaks Anthropic’s API on localhost and routes by model:
  - haiku* → Z.AI Anthropic-compatible endpoint
  - everything else → Anthropic
- Preserves SSE; no body logging; header firewalls.

Quick Start
- Prereq: Go 1.21+ installed
- From repo root:
  - make go-shim-build
  - ZAI_API_KEY=… ./services/go-anth-shim/bin/ccp serve --port 8082
  - In a new shell (client): export ANTHROPIC_BASE_URL=http://127.0.0.1:8082; export ANTHROPIC_AUTH_TOKEN=…
  - Prove: claude -p --model haiku "ok" --output-format json; claude -p --model sonnet "ok" --output-format json

Env
- ZAI_API_KEY: required for Z.AI lane
- ZAI_HEADER_MODE: x-api-key (default) | authorization
- MITM_FORCE_H1: 1 to disable HTTP/2 upstream
- OFFLOAD_PAUSED: 1 to force Anthropc lane (failover)
- FORCE_HAIKU_TO_ZAI: 1 to route any haiku model regardless of metadata (default pilot)
- CCP_UPSTREAM_ANTH / CCP_UPSTREAM_ZAI: optional explicit upstream base URLs (override policy). Note: the shim ignores client-facing envs `ANTHROPIC_BASE_URL`/`ZAI_BASE_URL` when selecting upstreams.

 Notes
- Logs to logs/usage.jsonl (or `$CCP_LOGS_DIR/usage.jsonl` when set)
- Policy cache at `$CCP_LOGS_DIR/policy-cache.json` (fallback `logs/policy-cache.json`)
- SSE: streamed via io.Copy; gzip disabled upstream to avoid buffering
