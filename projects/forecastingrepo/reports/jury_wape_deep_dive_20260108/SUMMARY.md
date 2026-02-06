# Jury WAPE Deep Dive Summary

## Key checks
- Excel parsed sites: 22,761 (duplicates: 0)
- Forecast rows (daily wide): 22,761
- Jun–Oct forecast total: 3,227,211.746348 (expected 3,227,211.746323, diff 0.000025)
- Joined rows: 22,230 (97.67% of Excel)
- Missing in forecast (first 20 IDs): 38100250, 38100296, 38100382, 38100394, 38100404, 38100466, 38100525, 38100561, 38100751, 38101011, 38101155, 38101157, 38101192, 38101209, 38101299, 38101535, 38101594, 38101877, 38101905, 38101910
- Missing in Excel (first 20 IDs): 38101190, 38101874, 38102502, 38103207, 38103541, 38103790, 38104041, 38104043, 38104083, 38104087, 38104152, 38104509, 38105334, 38105667, 38105857, 38106530, 38109640, 38110232, 38111433, 38111660
- Jury total row WAPE: 1.2783 (127.8%)

## WAPE distribution (per-site)
- mean 6.9389; median 0.9382; p75 2.7956; p90 11.6667; p95 25.0521; p99 100.2846; max 2669.4299
- WAPE==0: 169; >10: 2,578; >100: 230; >1000: 6
- WAPE values are ratios; multiply by 100 to interpret as percent.

## Why “~4% overall” vs 127.8% WAPE
A small overall % usually reflects net bias on total sum (sum forecast vs sum actual). WAPE is sum of absolute errors over sum actual and does not cancel, so it can be large even if totals match.
If actuals are spiky (service days) and the forecast is smooth, day-level absolute errors are large while totals can still align.

## Small-site dominance checks
Per-site WAPE can look bad because many sites have tiny volume; small denominators inflate WAPE, while aggregate bias can remain small due to cancellation across sites.
Volume deciles show WAPE falling with size: decile 1 median 5.4732 vs decile 10 median 0.9147 (see metrics_by_volume_bin.csv).
- Correlation log10(forecast_total+1) vs WAPE (clipped to 50): -0.3522
- WAPE micro proxy (forecast-weighted): 1.5432
- Top 80% volume WAPE: median 0.8843, p90 1.0033
Volume share from sites with high WAPE: >1: 11.76%, >5: 3.23%, >10: 1.63%

## Service-day pattern check (limited by inputs)
- Correlation WAPE vs days available: -0.0762 (weak). Most sites have 121–153 days, so sparse coverage alone does not explain high WAPE.
To confirm service-day spikes vs smooth forecasts, we need per-site sum_actual, sum_forecast, sum_abs_error, days, and ideally count_nonzero_actual_days (no raw daily table).
If the business goal is totals, consider weekly/monthly evaluation, or infer pickup intervals and allocate volume to service days.

## District highlights
Top districts by weighted WAPE (forecast-weighted):
- Жигаловский район: weighted WAPE 3.8777, volume 10828.7
- Качугский район: weighted WAPE 3.7630, volume 12732.5
- Нукутский район: weighted WAPE 3.3518, volume 12428.3
- Баяндаевский район: weighted WAPE 3.3270, volume 14936.5
- Балаганский район: weighted WAPE 3.2014, volume 6600.2
- Аларский район: weighted WAPE 2.8325, volume 30748.7
- Слюдянский район: weighted WAPE 2.5972, volume 65331.4
- Осинский район: weighted WAPE 2.4285, volume 27864.2
- Куйтунский район: weighted WAPE 2.0844, volume 23384.7
- Тулунский район: weighted WAPE 2.0587, volume 106617.0
Top districts by share of bad sites (WAPE>5):
- Жигаловский район: bad-site share 32.35%, n=204
- Эхирит-Булагатский район: bad-site share 25.69%, n=362
- Бодайбинский район: bad-site share 25.30%, n=249
- Ольхонский район: bad-site share 23.30%, n=206
- Качугский район: bad-site share 22.85%, n=267
- Слюдянский район: bad-site share 22.75%, n=712
- Усольский район: bad-site share 22.20%, n=1257
- Балаганский район: bad-site share 21.91%, n=178
- Тулунский район: bad-site share 20.46%, n=1090
- Иркутский район: bad-site share 20.16%, n=1830

See metrics_by_volume_bin.csv, metrics_by_days_bin.csv, best_sites.csv, worst_sites.csv, and district_summary.csv for detail.