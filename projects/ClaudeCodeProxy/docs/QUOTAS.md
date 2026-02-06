# Quotas & Usage

CCP tracks two caps per model: **rolling** and **weekly**.

- **Rolling**: tokens over a sliding window (default 5 h). At `warn_pct` (default 80 %) HUD warns; at 100 % the router blocks/reroutes.
- **Weekly tokens**: sum of input+output tokens within the last `weekly_seconds` window. Use this for real budget guards.
- **Weekly hours (telemetry)**: wall-clock seconds per request. Great for spotting busy periods, but keep `weekly_limit_type:"tokens"` for enforcement.

## Files & env

- Config path precedence: `CCP_QUOTAS_FILE` → `~/.config/ccp/quotas.json` → `configs/quotas.json` → `configs/quotas.example.json`.
- Hot reload: `POST /v1/quotas/reload[?file=/abs/path.json]`.
- Introspection: `GET /v1/usage` (tokens, flags, speeds) and `GET /v1/quotas`.
- Dev simulate (optional): set `CCP_DEV_ENABLE=1` and `POST /v1/dev/sim-usage`.

## CLI

- `cc status` — table view with roll %, warn/block flags, rolling & session tokens/sec, `WARN_AUTO%`, and the fastest hour-of-day.
  - `cc status --debug-quota` adds the calibration gap columns (`gap_seconds_p50`, `gap_seconds_p95`, sample count).
  - `cc status --json` returns the raw payload for scripts/`jq`.

## Acceptance

1. Configure small limits in `configs/quotas.json`.
2. Simulate usage: `curl -X POST :8082/v1/dev/sim-usage -d '{"model":"claude-haiku-4.5","in":1000,"out":2000,"repeat":50,"interval_ms":10}' -H 'content-type: application/json'`
3. `./bin/cc status` prints a table with roll %, warn/block flags, TPS (ELR vs dirty), and peak hour-of-day.

## Speeds (tokens/sec)

Every usage sample now stores two durations per model:

- **ELR** — output tokens ÷ streaming time (first byte → last byte). Captures pure model throughput.
- **Dirty** — output tokens ÷ wall-clock time (decision → final byte). Includes networking, retries, backoff.

`/v1/usage` surfaces rolling/session averages and a 24-hour trend:

```json
"speeds": {
  "rolling": {"out_elr_tps": 6.2, "out_dirty_tps": 5.4, ...},
  "session": {"out_elr_tps": 5.9, ...},
  "hourly": [
    {"hour": 0, "out_elr_tps": 4.1, "out_dirty_tps": 3.8},
    ...
  ]
}
```

Use the hourly array to pick the fastest windows (e.g., highest `out_elr_tps` > 0). `cc status` highlights the current peak hour so operators can schedule heavy runs when the lane is fastest.
Bins surface only once they have at least 10 samples; otherwise the TPS fields remain `null`.

## Reroute policy modes

`CCP_REROUTE_MODE` controls how the shim behaves near the quota edge:

| Mode | Behaviour |
|------|-----------|
| `hybrid` (default) | Attempt the preferred lane once even when warn is triggered (`decision:"quota_warn_attempt"`). On a real 429 it records `decision:"quota_overshoot"`, starts a cooldown, and reroutes subsequent calls (`decision:"quota_cooldown"`). |
| `run2cap` | Ignore cooldown and warn thresholds; always send to the preferred lane until the provider blocks (`decision:"quota_run_to_limit"`). |
| `preemptive` | Switch lanes as soon as warn triggers (`decision:"quota_preemptive_warn"`). Useful when you want to guarantee zero user-visible 429s. |

Cool-down length defaults to 5 minutes. Set `CCP_QUOTA_COOLDOWN_SEC=120` (seconds) to
adjust or `=0` to disable. Every decision is logged in `logs/usage.jsonl` with extra
fields:

- `reroute_mode`, `reroute_decision`
- `preferred_attempt` (true if we hit the preferred lane)
- `headroom_pct_rolling`, `headroom_pct_weekly`
- `warn_pct_auto`, `warn_pct_confidence`
- `gap_seconds_p50`, `gap_seconds_p95`, `gap_samples`

These fields make it easy to audit why a lane swap occurred and feed data back into
AgentOS.

## Auto warn & calibration

In addition to the static `warn_pct`, the shim maintains a per-model
`warn_pct_auto` derived from observed usage and probe results. The calibration loop:

- Runs every `CCP_CAL_SAMPLE_MINUTES` (default 60) on the server.
- Tracks the number of recent samples in the rolling window and reports
  `warn_pct_confidence` (0–1).
- Records over-shoot events (`gap_seconds_p50`, `gap_seconds_p95`, `gap_samples`).
- Ingests optional probe output from `results/GLM_LIMIT_PROBE.md` to seed gaps for GLM.

`/v1/usage` exposes these values per model; `cc status --debug-quota` prints them in
the table view.
