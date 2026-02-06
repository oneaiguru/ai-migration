# Metrics JSONL Schema (logs/usage.jsonl)

Each line is a JSON object capturing a decision or completion/error event. Fields:

- ts (float): epoch seconds with sub-second precision
- rid (string): short correlation id per flow
- lane (string): "zai" | "anthropic" | "test" | "unknown"
- model (string): model name from request body
- status (int): HTTP status code (200 on success, -1 on decision pre-dial)
- event (string, optional): "decision" | "error" (absent on normal completion)
- decision (string, optional): "forced_model" | "failover_paused" | "pass_through"
- decision_reason (string, optional): copy of the routing reason (quota_block, fallback, manual_override, etc.)
- reason (string): "ok" | "streaming" | "unknown"
- op (string): "nonstream" | "stream"
- latency_ms (int): end-to-end request time in milliseconds (0 on decision)
- stream_ms (int, optional): streaming duration (first chunk → last chunk)
- ttft_ms (int, optional): time-to-first-token (decision → first streamed chunk)
- input_tokens / output_tokens (int, optional): tokens reported by upstream usage extracts
- rolling_used_tokens / rolling_capacity_tokens (int, optional): rolling-window usage and configured cap (tokens)
- weekly_used_tokens / weekly_capacity_tokens (int, optional): weekly usage and cap when token-based
- headroom_pct_rolling / headroom_pct_weekly (float, optional): remaining headroom (0–1) at decision time
- warn_pct_cfg (float, optional): configured warn threshold for the model
- warn_pct_auto / warn_pct_confidence (float, optional): calibration-derived warn threshold and confidence (0–1)
- gap_seconds_p50 / gap_seconds_p95 (float, optional): observed reset gap percentiles (seconds)
- gap_samples (int, optional): number of overshoot samples informing the gap stats
- err_type (string, optional): "401" | "429" | "5xx" | "4xx" | "net" | "timeout"
- retry (bool, optional): true if an automatic retry was attempted (e.g., 401 fallback)
- backoff_ms (int, optional): backoff time applied on 429/503 (instrumentation)
- upstream (string): "zai" | "anth" | custom test label
- h2 (bool): whether upstream client used HTTP/2 (false when forced H1)
- header_mode (string, optional): set for Z.AI lane, "x-api-key" | "authorization"
- reroute_mode (string, optional): `hybrid` | `run2cap` | `preemptive`
- reroute_decision (string, optional): `quota_run_to_limit`, `quota_warn_attempt`, `quota_cooldown`, etc.
- preferred_attempt (bool, optional): true if the request hit the preferred lane before reroute
- cooldown_active (bool, optional) & cooldown_next_ts (float, optional): active cooldown state and expiry timestamp
- wasted_retry_ms (int, optional): elapsed milliseconds spent on the failed attempt before reroute

Summaries
- scripts/summarize-usage.js produces results/METRICS*.json with:
  - byLane: counts, errors, tokens, p50/p95
  - ops: per-lane stream/nonstream p50/p95
  - headerModes: distribution for Z.AI lane
  - byLaneH2: H1/H2 grouping
  - decisions: decision event counts
- Prometheus `/metrics` adds counters:
  - `ccp_preferred_attempt_total{lane,model}` — preferred-lane attempts under quota pressure
  - `ccp_rerouted_on_limit_total{mode,model}` — reroutes triggered by quota policy or 429 overshoot
  - `ccp_wasted_retry_ms_total{model}` — milliseconds spent on failed attempts before reroute
