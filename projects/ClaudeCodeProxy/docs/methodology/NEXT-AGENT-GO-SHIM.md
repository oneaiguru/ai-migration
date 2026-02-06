# Next Agent — Go Shim Spike (90–120 min)

Objectives
- Stand up the Go Anthropic-compatible shim locally and prove routing (Haiku→Z.AI, Sonnet→Anthropic)
- Verify SSE passthrough and basic JSON latency with simple probes
- Keep logs compatible so existing summarize/verify/bundle continue to work

Steps
1) Build & run
- make go-shim-build
- ZAI_API_KEY=… ./services/go-anth-shim/bin/ccp serve --port 8082
- In a proxied shell: export ANTHROPIC_BASE_URL=http://127.0.0.1:8082; export ANTHROPIC_AUTH_TOKEN=…

2) Prove routing
- claude -p --model haiku  "ok" --output-format json
- claude -p --model sonnet "ok" --output-format json
- make summarize && make verify-routing

3) SSE probe
- python3 scripts/perf/sse_probe.py
- Expect steady dots and p50 < ~50 ms chunk gap (short outputs)

4) JSON micro-bench (rough)
- ANTHROPIC_BASE_URL=https://api.anthropic.com AUTH_HEADER="Bearer $ANTHROPIC_AUTH_TOKEN" bash scripts/perf/json_bench.sh 10
- ANTHROPIC_BASE_URL=http://127.0.0.1:8082 AUTH_HEADER="Bearer $ANTHROPIC_AUTH_TOKEN" bash scripts/perf/json_bench.sh 10
- Compare wall-clock; target added overhead ≤ p50 ~15 ms (very rough)

5) Bundle & handoff
- make summarize && make verify-routing && make bundle
- Update docs/SESSION_HANDOFF.md with toggles, versions, bundle path

Toggles
- ZAI_HEADER_MODE=authorization to switch Z.AI header style
- MITM_FORCE_H1=1 to disable upstream HTTP/2 in the shim transport
- OFFLOAD_PAUSED=1 to force Anthropc lane (failover)

Deliverables
- Running ccp on :8082 with proofs (results/METRICS.json updated)
- Notes in docs/SESSION_HANDOFF.md and a fresh bundle

