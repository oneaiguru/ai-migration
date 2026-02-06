Purpose
Reference fixtures to validate speeds (ELR/dirty TPS), TTFT, and hour‑of‑day bins without live providers.

Files

`fixtures/usage/ccc_usage_with_speeds.json`
A minimal `/v1/usage` example containing two models (haiku, sonnet) with populated `speeds`, `ttft_ms_*`, and HOD arrays. Use this in a loader test on the Agent‑OS side to ensure rendering.

`fixtures/metrics/ccp_metrics_fallback_429.prom`
Golden snippet of Prometheus metrics when a forced 429 triggers a single fallback, e.g.:
ccp_requests_total{lane="zai",status="429"} 1
ccp_requests_total{lane="anthropic",status="200"} 1
ccp_fallbacks_total{model="claude-haiku-4.5"} 1
ccp_stream_seconds_total{lane="anthropic"} 1.23
ccp_preferred_attempt_total{lane="zai",model="claude-haiku-4.5"} 1
ccp_rerouted_on_limit_total{mode="hybrid",model="claude-haiku-4.5"} 1
ccp_wasted_retry_ms_total{model="claude-haiku-4.5"} 450

How to use

• CCC: unit test validates `/v1/usage` serialization; integration test scrapes `/metrics` and diff‑checks against golden text.
• Agent‑OS: load `ccc_usage_with_speeds.json`; preview should show “Speeds” panel per model and a fallback counter.
