# Task 3: Medium-tier KP Tuning

## Context
- After bias fixes: overall bias -22.7%, WAPE 37% (cutoff 2024-10-31, horizon 212).
- Medium tier (10-100 m3 per 30d): bias about -38% and ~40% of volume.
- Goal: explain why medium tier underpredicts and test segment-specific parameters.

## Inputs to read
- reports/bias_investigation_20260112/SYNTHESIS.md
- reports/bias_investigation_20260112/agent_1_rate_estimation.md
- reports/bias_investigation_20260112/agent_4_kp_segmentation.md
- src/sites/baseline.py (estimate_weekday_rates, smoothing, first-interval)
- src/sites/rolling_forecast.py (generate_rolling_forecast, window_days/min_obs)
- src/sites/data_loader.py (load_service_data)
- data/sites_service.csv (actuals)
- data/sites_registry.csv (optional district context)

## Definitions (use consistently)
- Cutoff: 2024-10-31
- Forecast window: 2024-11-01 to 2025-05-31 (horizon 212)
- Per-30d actual volume: total_actual / 212 * 30
- Tiers:
  - Small: <10 m3/30d
  - Medium: 10-100 m3/30d
  - Large: >100 m3/30d
- Use daily deltas: forecast_m3 = diff(pred_volume_m3) per site, clip at 0

## Investigate (diagnostics)
1) Frequency distribution
   - Compare medium vs large: events_per_week in the forecast window.
   - Report median/quantiles and share of <1/wk, 1-3/wk, 3+/wk.
2) Weekday coverage
   - For each site, count weekdays with >= min_obs in the training window.
   - Compare medium vs large (distribution and median).
3) Seasonality
   - By month (Nov to May), compute actual/forecast ratio for medium vs large.
   - Identify months with largest underprediction.
4) Check smoothing impact
   - For medium tier, compute how often smoothing uses neighbor vs overall mean.

## Experiments (segment-specific tuning)
Run forecast + metrics for medium tier only (site_ids subset) and compare to baseline.
Baseline parameters: window_days=84, min_obs=4.

Variants to test for medium tier:
1) window_days=112, min_obs=4
2) window_days=84, min_obs=6
3) (Optional) smoothing variant: only +/-1 neighbors (if easy)

Keep large tier as a reference on baseline parameters.
If variant improves medium tier bias by >2pp without large WAPE degradation, note it.

## Suggested analysis snippet (adapt as needed)
```
from datetime import date
import pandas as pd
from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest
from src.sites.data_loader import load_service_data

cutoff = date(2024, 10, 31)
horizon = 212
start = pd.Timestamp(cutoff) + pd.Timedelta(days=1)
end = start + pd.Timedelta(days=horizon - 1)

act = load_service_data(start_date=start.date(), end_date=end.date())
act['site_id'] = act['site_id'].astype(str)
act['service_dt'] = pd.to_datetime(act['service_dt'])
act = act.groupby(['site_id','service_dt'])['collect_volume_m3'].sum().reset_index()
act = act.rename(columns={'service_dt':'date','collect_volume_m3':'actual_m3'})

per = act.groupby('site_id')['actual_m3'].sum().reset_index()
per['per30_actual'] = per['actual_m3'] / horizon * 30
medium_ids = per[(per['per30_actual'] >= 10) & (per['per30_actual'] <= 100)]['site_id'].tolist()
large_ids = per[per['per30_actual'] > 100]['site_id'].tolist()

def eval_segment(site_ids, window_days, min_obs):
    res = generate_rolling_forecast(
        ForecastRequest(cutoff, horizon, site_ids=site_ids),
        use_cache=False,
        window_days=window_days,
        min_obs=min_obs,
    )
    fc = res.forecast_df.copy()
    fc['site_id'] = fc['site_id'].astype(str)
    fc['date'] = pd.to_datetime(fc['date'])
    fc = fc.sort_values(['site_id','date'])
    fc['forecast_m3'] = fc.groupby('site_id')['pred_volume_m3'].diff().fillna(fc['pred_volume_m3']).clip(lower=0)
    fc = fc[['site_id','date','forecast_m3']]
    merged = fc.merge(act[act['site_id'].isin(site_ids)], on=['site_id','date'])
    tot_f = merged['forecast_m3'].sum()
    tot_a = merged['actual_m3'].sum()
    bias_pct = (tot_f - tot_a) / tot_a * 100
    wape = (merged['forecast_m3'].sub(merged['actual_m3']).abs().sum() / tot_a) * 100
    return bias_pct, wape, len(site_ids), len(merged)

print(eval_segment(medium_ids, 84, 4))
print(eval_segment(medium_ids, 112, 4))
print(eval_segment(medium_ids, 84, 6))
print(eval_segment(large_ids, 84, 4))
```

## Output
- Write findings to: reports/bias_investigation_20260112/agent_task3_medium_tier.md
- Include:
  - Diagnostic comparisons (frequency, weekday coverage, seasonal ratios)
  - Table of parameter variants vs bias/WAPE for medium tier
  - Recommendation: which parameter set to adopt for medium tier
  - Expected bias improvement for medium tier (and any trade-offs)

## Branch/commit
- Branch: bias-report (no new PR)
- Commit message (if code changed): `analysis: medium tier tuning`
