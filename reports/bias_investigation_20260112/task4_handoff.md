# Task 4: Jury Deliverable + Grid Search + Medium-tier Root Cause (Overnight)

## Context
- We told Jury about bias improvement but did NOT deliver a new forecast file.
- He needs the same CSV shape as the last file for his Excel checker.
- This run should generate the new Jury file AND explore parameter space + medium-tier root causes.

Read:
- reports/bias_investigation_20260112/agent_task3_medium_tier.md
- reports/bias_investigation_20260112/SYNTHESIS.md
- sent/forecast_jun_dec_2025_jury_format_daily.csv (exact column/order reference)
- src/sites/baseline.py
- src/sites/rolling_forecast.py
- src/sites/data_loader.py

Important clarifications:
- **Do NOT change the column headers** format; copy them from the prior Jury file.
- **Do NOT use cache** for any backtest/grid run (cache does not key by window/min_obs).
- Tiering uses **pre-cutoff 84-day history**, with optional 365-day sensitivity.

---

## PART A: Generate Forecast for Jury (priority)

Generate new forecast with best params: window_days=84, min_obs=4.

### Output files
```
sent/forecast_jun_dec_2025_v2_daily.csv
sent/forecast_jun_dec_2025_v2_daily_README.txt
```

### Format requirements
- Use **exact header row** from `sent/forecast_jun_dec_2025_jury_format_daily.csv`:
  - First column: `Код КП`
  - Remaining columns are day headers in Jury’s legacy format (e.g., `1`, `2`, `...`, `1.1`, `...`)
  - Keep column order identical to previous file.
- Semicolon delimiter `;`
- Decimal comma (e.g., `0,75`)
- Values are **daily deltas** (diff of pred_volume_m3 per site; first day uses pred_volume_m3).
- Period: 2025-06-01 to 2025-12-31 (214 days)
- Use cutoff=2025-05-31 and horizon_days=214.
- Filter/align site_id rows to match the **prior file’s site list and order**.

### README content (use these lines)
```
Прогноз объемов КП на июнь-декабрь 2025
Формат: Код КП + объемы по дням (дельты, не накопительные)
Разделитель: ;  Десятичная: запятая

Изменения относительно предыдущей версии:
- Окно оценки ставок: 56 → 84 дня
- Сглаживание редких будней (соседние дни вместо нулей)
- Убрано ограничение 7 дней на первый интервал

Бэктест (ноя'24–май'25):
- Bias: -22.7% (было -29.0%)
- WAPE: 37.0% (было 39.0%)

Cutoff: 2025-05-31
```

### Validation before saving
- Row count = previous file rows (~22,761).
- Column count = 215 (Код КП + 214 days).
- No NaN/inf values.
- Total sum of values reasonable (millions of m3).

---

## PART B: Parameter Grid Search (overnight)

Grid (45 combos):
```
window_days_grid = [56, 63, 70, 77, 84, 91, 98, 105, 112]
min_obs_grid = [2, 3, 4, 5, 6]
```

For each combination:
1) estimate_weekday_rates(window_days=X, min_obs=Y)
2) simulate_fill()
3) compute bias_pct + wape on Nov'24–May'25 backtest
4) record window_days, min_obs, bias_pct, wape_pct, runtime_seconds

Output:
```
reports/bias_investigation_20260112/grid_search_results.csv
reports/bias_investigation_20260112/grid_search_summary.md
```

Summary should include:
- Best by bias (closest to 0)
- Best by WAPE (lowest)
- Pareto best (bias vs WAPE)
- Heatmap table: window_days (rows) × min_obs (cols) → bias

Note: min_obs may have low effect because baseline uses interval-day counts (not event counts).

---

## PART C: Medium-tier Root Cause Checks

Use cutoff=2024-10-31, horizon=212, tiering from Task 3 (84d pre-cutoff).

### C1: Same-day duplicates / zero-gap volume loss
- Training window (84d pre-cutoff), by tier.
- Count site-days with >1 event and the **extra volume** beyond the first event.
- Report: duplicate site-days count, dropped volume m3, % of tier total.

### C2: Volume per event by tier + gap bucket
- Compute median/p25/p75 m3/event for medium vs large.
- Gap buckets: <3d, 3–7d, 7–14d, 14–28d, 28d+.
- Use forecast window (Nov–May) for primary results; if time allows, also run on training window and note differences.

### C3: Post-processing uplift test
Test calibration multipliers on medium-tier forecast deltas:
```
multipliers_to_test = [
    ("global_medium", 1.5),
    ("global_medium", 1.4),
    ("global_medium", 1.3),
    ("gap_3_7d", 2.0),
    ("gap_7plus", 2.5),
    ("freq_1_3wk", 1.5),
]
```
Recompute bias/WAPE after applying multiplier(s).

Output:
```
reports/bias_investigation_20260112/agent_task4_medium_rootcause.md
```
Include tables for:
- Duplicate volume share by tier
- Per-event volume by tier/bucket
- Uplift impact (bias_before, bias_after, wape_before, wape_after)

---

## PART D: Draft Telegram message for Jury (after Part A)

```
Юра, подготовил обновлённый прогноз с фиксами:

📁 forecast_jun_dec_2025_v2_daily.csv
Формат тот же: Код КП + объемы по дням (дельты)
Разделитель ; , запятая десятичная

Изменения:
• Окно оценки: 56 → 84 дня
• Сглаживание редких будней
• Исправлен первый интервал

Бэктест показал bias -22.7% (было -29%), WAPE 37% (было 39%).

Можешь прогнать через свой Excel как раньше?
Интересно сравнить с предыдущей версией.
```

---

## Execution order
1) PART A (forecast file)
2) PART D (message)
3) PART B (grid search, overnight)
4) PART C (root cause checks, parallel with B)

## Branch
- bias-report
- Commit Part A outputs immediately (so we can send to Jury).
- Parts B/C/D can be committed together when done.
