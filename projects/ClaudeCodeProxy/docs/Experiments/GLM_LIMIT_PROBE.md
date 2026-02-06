# GLM Limit Probe (5-hour window)

This playbook captures the data we need to understand GLM's enforcement window
(e.g., confirm whether the published 5-hour limit applies to request count or
tokens, and whether a hidden multiplier such as 0.5× is applied).

## Prerequisites

- Local shim running on :8082 with GLM routing enabled (see `docs/ops/000-quickstart-zai-routing.md`).
- GLM API key exported via the provider catalog (`scoped_env` or `key_env`).
- Logging enabled (`logs/usage.jsonl` and `results/GLM_LIMIT_PROBE.log`).

## Experiments

1. **Deterministic burst (requests)**
   - Use the probe script to issue N identical, low-token GLM calls until the
     first quota failure.
   - Record the call index of the first failure and any headers returned by the
     upstream.

2. **Token sweep**
   - Repeat the burst with different request sizes (`--tokens small|medium|large`).
   - Determine whether the enforcement window is request-count or token-count.

3. **Boundary timing**
   - Re-run bursts near the 5-hour reset boundary (wait until the probe reports
     near-zero rolling usage) to distinguish sliding vs. calendar windows.

4. **Cross-account sanity** (optional)
   - If multiple GLM tenants are available, repeat with a second key to detect
     per-account variance.

## Running the probe script

```bash
# 1. Start shim on :8082
make go-shim-build
./services/go-anth-shim/bin/ccp serve --port 8082 &

# 2. Run a burst of 120 small completions (adjust model/tokens as needed)
bash scripts/experiments/glm-limit-probe.sh --model glm-4-6 --repeat 120 --tokens 50 --sleep 2

# 3. Capture results
tail -n 40 results/GLM_LIMIT_PROBE.log
```

The script logs the timestamp, request index, tokens, and `/v1/usage` rolling
usage after each run. It also snapshots the shim's rolling totals so you can
compare our calculated window to the upstream rejection.

## Recording results

After each experiment append a JSON block to `results/GLM_LIMIT_PROBE.md`
so calibration can ingest the gaps automatically:

```json
[
  {"model": "glm-4-6", "gap_seconds_p50": 180, "gap_seconds_p95": 240, "samples": 6}
]
```

The calibration loop reads the latest block on every pass and seeds
`gap_seconds_p50`, `gap_seconds_p95`, and `gap_samples` for the corresponding
model.

## Manual notes to capture after each run

- First 429/rejection time and index.
- `calc_window_usage` vs. vendor response payload (if available).
- Hour-of-day, day-of-week.
- Model and tenant identifiers.

Record findings in `results/GLM_LIMIT_PROBE.md`. Once we have data across a few
windows, feed it into the calibration loop (bias table) outlined in
`docs/Architecture/R3_SPEEDS_TELEMETRY_PLAN.md`.
