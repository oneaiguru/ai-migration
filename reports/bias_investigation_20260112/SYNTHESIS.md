## Agent 5 (Final): Synthesis

**File:** `reports/bias_investigation_20260112/SYNTHESIS.md`

## Root cause ranking
| Cause | Confidence | Impact | Fix Effort |
|-------|------------|--------|------------|
| Short window + weekday sparsity → fallback to low overall means (baseline rates) | High | Med-High (bias -29% → -26.5% in sample) | Low |
| Low-volume / low-frequency sites dominate bias (small + <1–3/wk) | High | Medium (pulls median bias to -76%, volume share ~25%) | Low |
| Simulator accumulation/units bug | High (no bug) | None | None |
| Data quality gaps/units | High (clean) | None | None |

## Recommended action plan
- Immediate (this week): bump `window_days` to 84 (keep `min_obs=4` default), rerun full backtest; log first-interval gap usage; optionally expose `min_obs`/window as config for fast tuning. ✅ Done; see measured outcome below.
- Short-term (this month): add weekday smoothing for missing days (not just overall mean), add flag to disable 7-day cap on first interval; consider uplift/low-confidence labeling for small + <1/wk sites to avoid dragging headline bias. ✅ Done in this PR.
- Longer-term: wire real bin capacities/schedules (if available) and recalibrate per segment; add CI backtest to watch bias/WAPE.

## Measured outcome (cutoff 2024-10-31, horizon 212, window=84, min_obs=4)
- Bias -22.7% (vs. -29.0% prior), WAPE 37.0% (vs. 39.0%); +6.3 pp bias improvement and -2.0 pp WAPE on site/date intersection using daily deltas.
- Sites: 21,853; merged site-date rows: 1,437,141; variant min_obs=6 not run (already >2 pp gain).

| Metric | Before | After | Δ |
|--------|--------|-------|---|
| Bias   | -29.0% | -22.7% | +6.3pp |
| WAPE   | 39.0%  | 37.0%  | -2.0pp |

## Code changes summary
- src/sites/baseline.py: default `window_days` to 84; weekday smoothing when counts < min_obs (borrow ±1/±2 before overall mean); first-event interval uses full gap from window start (no 7-day cap).
- src/sites/rolling_types.py: defaults `DEFAULT_WINDOW_DAYS=84`, `DEFAULT_MIN_OBS=4`.
- src/sites/rolling_forecast.py: pass window/min_obs through to baseline; add `low_confidence` flag (events_per_week < 1 or history_days < 365 based on service history).

## Message for Jury (RU)
Юра, сделали фиксы и перегнали бэктест (cutoff 31.10.2024, горизонт 212): было bias -29%, WAPE 39%; стало bias -22.7%, WAPE 37.0% (+6.3 п.п. к bias, -2.0 п.п. к WAPE). Изменения: окно ставок 56→84 дней, сглаживание редких будней (берём соседние ±1/±2 вместо нулей), убрали 7-дневный cap на первый интервал, добавили флаг low_confidence для <1/нед или истории <1 года. Вариант min_obs=6 не запускали — уже получили >2 п.п. улучшения; дальше можно донастраивать сегменты средних/малых КП.
