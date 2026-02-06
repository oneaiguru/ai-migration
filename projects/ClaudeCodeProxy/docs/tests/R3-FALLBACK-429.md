```
## Purpose
Prove the single‑retry fallback path on HTTP 429 (Anthropic → Z.AI) using local mocks and assert both usage and metrics surfaces.

## Preflight
- ZAI key available in env (`export ZAI_API_KEY=dummy`) to allow Anth→ZAI fallback.
- Use the built-in test helpers via `go test ./...`. No external network calls.

## Quick run (unit)
- `cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test -run FallbackOn429 ./cmd/ccp`

## Manual demo (optional)
1) Start mock upstreams:
   - Anth mock on :9001 returns 429
   - ZAI mock on :9002 returns 200
   (You can adapt scripts/perf/mock_upstream.go if preferred.)
2) Save configs/providers.r3.429.yaml with those base URLs.
3) Launch shim:
   - `./services/go-anth-shim/bin/ccp serve --port 8082 --providers-file configs/providers.r3.429.yaml &`
4) POST one JSON message with a Sonnet model:
   - `curl -sS :8082/v1/messages -H content-type:application/json -H anthropic-version:2023-06-01 -d '{"model":"claude-3.5-sonnet-20241001","messages":[{"role":"user","content":"ok"}],"max_tokens":16}' | jq .`
5) Inspect evidence:
   - `rg '"decision":"fallback"' logs/usage.jsonl`
   - `rg '"retry":true' logs/usage.jsonl`
   - `curl -s :8082/metrics | sed -n '1,160p'`  (look for `ccp_preferred_attempt_total`, `ccp_rerouted_on_limit_total`, `ccp_wasted_retry_ms_total`)

## Acceptance
- Response 200 to the client after the initial 429.
- One `decision:"fallback"` line and a final usage entry with `"retry":true` in `logs/usage.jsonl` (check `preferred_attempt:false`, `wasted_retry_ms>0`).
- /metrics shows `ccp_preferred_attempt_total`, `ccp_rerouted_on_limit_total`, and `ccp_wasted_retry_ms_total` incremented for the test model.
```

Notes: The manual path mirrors the server’s fallback behavior and uses the lightweight metrics writer the project added in R0. The repo already contains a `scripts/perf/mock_upstream.go` you can adapt if you prefer CLI‑driven mocks instead of `httptest` servers.

---

If you want, I can also drop a tiny `testdata/providers/min.yaml` alongside these (same content as `configs/providers.r3.min.yaml`) to let the loader tests exercise real file reads without touching user config.
