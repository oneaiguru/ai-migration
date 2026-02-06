# Task 2: Implement Bias Fixes and Full Backtest

## Context
- Read investigation results in:
  - reports/bias_investigation_20260112/SYNTHESIS.md
  - reports/bias_investigation_20260112/agent_1_rate_estimation.md
  - reports/bias_investigation_20260112/agent_4_kp_segmentation.md
- Current backtest (cutoff 2024-10-31, horizon 212): bias -29%, WAPE 39%.

## Changes to implement (one PR)

1) Increase window_days (low risk)  
   - File: src/sites/baseline.py (`estimate_weekday_rates`), default window_days → 84 (was 56).  
   - Mirror constant in src/sites/rolling_types.py (DEFAULT_WINDOW_DAYS = 84) and pass through generate_rolling_forecast.

2) Weekday smoothing when counts < min_obs (medium risk)  
   - File: src/sites/baseline.py.  
   - Add helper to borrow rates from adjacent weekdays (±1, ±2) before falling back to overall mean. If no neighbor with ≥ min_obs, use overall mean. Apply in rate_m3_per_day calculation instead of plain overall mean fallback.

3) Remove 7-day cap on first interval (low risk)  
   - File: src/sites/baseline.py (first-event handling).  
   - Current: `default_gap = max(1, min(7, (dt - start).days if ... else 7))`.  
   - Change to use full gap from window start with no 7-day cap: `default_gap = max(1, (dt - start).days) if (dt - start).days > 0 else 1`.

4) Configurability plumbing (low risk)  
   - Files: src/sites/rolling_types.py (DEFAULT_WINDOW_DAYS, DEFAULT_MIN_OBS), src/sites/rolling_forecast.py (pass window_days/min_obs through to estimate_weekday_rates).  
   - Ensure generate_rolling_forecast accepts window_days override and uses the new defaults.

5) Low-confidence flag (reporting only)  
   - File: src/sites/rolling_forecast.py (after forecast_df built).  
   - Compute per-site stats from service history up to cutoff: events_per_week over last window_days, history_days = (last_service - first_service).  
   - Add `low_confidence` boolean to forecast_df: events_per_week < 1 OR history_days < 365. (No model change.)

## Validation: full backtest (cutoff 2024-10-31, horizon 212)
1. Clear forecast cache to force regeneration (use src/sites/forecast_cache helper if available, else delete cached file manually).  
2. Regenerate forecast with new defaults (window_days=84, min_obs=4) and compute bias/WAPE on site/date intersection using daily deltas (`diff` on pred_volume_m3, clip at 0).  
3. If bias improvement < 2pp, also run variant window=84, min_obs=6 and report both.

Suggested snippet (can adapt):
```
from datetime import date
import pandas as pd
from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest
from src.sites.data_loader import load_service_data

cutoff = date(2024, 10, 31)
horizon = 212

res = generate_rolling_forecast(ForecastRequest(cutoff, horizon), use_cache=False, window_days=84)
fc = res.forecast_df.copy()
fc['site_id'] = fc['site_id'].astype(str)
fc['date'] = pd.to_datetime(fc['date'])
fc['forecast_m3'] = fc.sort_values(['site_id','date']).groupby('site_id')['pred_volume_m3'].diff().fillna(fc['pred_volume_m3']).clip(lower=0)

act = load_service_data(start_date=(cutoff + pd.Timedelta(days=1)).date(), end_date=(cutoff + pd.Timedelta(days=horizon)).date())
act = act.rename(columns={'service_dt': 'date'})
act['date'] = pd.to_datetime(act['date'])
act['site_id'] = act['site_id'].astype(str)
act = act.groupby(['site_id','date'])['collect_volume_m3'].sum().reset_index(name='actual_m3')

sites = set(fc['site_id']) & set(act['site_id'])
merged = fc[fc['site_id'].isin(sites)].merge(act[act['site_id'].isin(sites)], on=['site_id','date'])
tot_f = merged['forecast_m3'].sum(); tot_a = merged['actual_m3'].sum()
bias_m3 = tot_f - tot_a
bias_pct = bias_m3 / tot_a * 100
wape = merged['forecast_m3'].sub(merged['actual_m3']).abs().sum() / tot_a * 100
print(bias_pct, bias_m3, wape, len(sites))
```

## Output required
1) Update reports/bias_investigation_20260112/SYNTHESIS.md with measured results (bias, WAPE), replacing the expected placeholders.  
2) Add before/after comparison table:
```
| Metric | Before | After | Δ |
|--------|--------|-------|---|
| Bias   | -29.0% | ???%  | +?.?pp |
| WAPE   | 39.0%  | ???%  | -?.?pp |
```
3) Update Jury message in SYNTHESIS.md with actual numbers (bias/WAPE) and list the applied changes.  
4) Note variant run (84/6) if primary improvement < 2pp.

## Files to modify
- src/sites/baseline.py
- src/sites/rolling_forecast.py
- src/sites/rolling_types.py
- reports/bias_investigation_20260112/SYNTHESIS.md

## Branch / commit
- Branch: bias-report
- Commit message: `feat: bias fixes (window 84, smoothing, no first-cap)`
