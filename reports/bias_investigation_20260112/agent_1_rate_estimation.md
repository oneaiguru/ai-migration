## Agent 1: Rate Estimation Analysis

**File:** `reports/bias_investigation_20260112/agent_1_rate_estimation.md`

## Findings
- Sensitivity (sample 1,000 sites, Nov’24–May’25 window, horizon 212, pred deltas from simulate_fill):
  - window/min_obs → bias_pct / WAPE:
    - 28/2: -33.9% / 42.23
    - 28/4: -33.1% / 41.67
    - 28/6: -22.0% / 37.95
    - 56/2: -28.1% / 39.63
    - 56/4 (current): -27.5% / 39.91
    - 56/6: -27.5% / 39.88
    - 84/2: -26.6% / 38.26
    - 84/4: -26.5% / 38.25
    - 84/6: -26.5% / 38.23
  - Trend: longer window reduces under-bias modestly (~3pp improvement going 56→84); higher min_obs matters mainly when window is short (28d, min_obs=6 improves bias by ~11pp vs current).
- Fallback pressure: With window=56/min_obs=4, 430/937 sampled sites had at least one weekday with <4 obs (falling back to overall mean). Weekday obs distribution shows many 1–3 count buckets, so per-weekday rates often collapse to the site-wide mean.
- First-event handling: Code applies default_gap up to 7 days for the first event in-window. For sites with high-frequency pickups and a first event near window start, this caps the first interval and can understate true rate; no explicit correction for denser pre-window history.
- Weekday fill rules: Missing weekday counts fall back to overall mean (no smoothing), zeros persist; this likely contributes to underestimation when certain weekdays are sparsely observed.

## Root cause identified? PARTIAL
- Under-bias partly driven by short windows + sparse weekdays causing fallback to lower overall means; extending window helps slightly. First-event 7d cap may also depress rates for high-frequency sites entering the window mid-stream.

## Recommended fix
- Increase window_days to 84 (low risk) and optionally raise min_obs to 6 only if paired with a longer window to avoid over-penalizing sparse sites; rerun full backtest to validate bias/WAPE.
- Add a flag to treat the first in-window interval as (dt - prev_dt_clipped_to_window_start) without the 7-day cap, or at least log/share how often the 7-day default is used.
- Consider smoothing missing weekdays (e.g., borrow from adjacent weekdays or site mean weighted toward recent days) instead of plain overall mean.

## Estimated impact
- Switching to window=84/min_obs=4 could recover ~1–2 pp bias improvement vs current (sample-based). 28d windows with min_obs=6 showed larger gains but are riskier; needs full backtest confirmation.
