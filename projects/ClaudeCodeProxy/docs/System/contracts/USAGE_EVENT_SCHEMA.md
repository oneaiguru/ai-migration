Name
`ccp.usage.v1` — CCC → AGENT‑OS usage snapshot (per model)

Fields (per model)

* `model`: string (e.g., `claude-haiku-4.5`).
* `rolling_seconds`: int; `rolling_tokens_used`: int; `rolling_tokens_budget`: int; `rolling_pct`: float.
* `weekly_seconds`: int; `weekly_tokens_used`: int; `weekly_tokens_budget`: int; `weekly_pct`: float.
* `flags`: `{ warn: bool, block: bool, reason: "rolling|weekly|none" }`.
* `warn_pct`: `{ cfg: float, auto: float, confidence: float }` — configuration and calibration-derived warn thresholds (0–1).
* `gaps`: `{ seconds_p50: float, seconds_p95: float, samples: int }` — overshoot gap stats from calibration.
* `speeds`:

  * `elr_out_tps_rolling`, `dirty_out_tps_rolling`, `in_tps_rolling`, `total_tps_rolling`: float.
  * `ttft_ms_p50`, `ttft_ms_p95`: int.
  * `hod_elr_out_tps[24]`, `hod_dirty_out_tps[24]`: float[].
* `events`: counters since start — `fallbacks`, `429s`, `timeouts`, `h1_forced`, `stream_resets`.
* `source`: `{ quotas_path: string, providers_path: string, loaded_at: rfc3339 }`.

Notes

• Mirrors CCC’s current `/v1/usage` & quotas fields, adding “speeds” and TTFT; matches Prometheus metrics conceptually but stays JSON for Agent‑OS.
• Keep this contract stable for R3/R4; add fields only. Fields added in R3.5 (`warn_pct.auto`, `gaps`) are backwards compatible.

Validation

• CCC must output an object keyed by model; Agent‑OS loader rejects unknown top‑level types with a clear error.
