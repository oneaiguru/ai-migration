# Jury — “Spikeify” Service-Day Postprocess (Daily WAPE Fix)

## Goal

Jury evaluates forecast quality at **daily resolution** (calendar days), where **actuals are sparse** (many `0` days) and the current “daily” forecast export is effectively **smooth** (positive almost every day for most KPs). This creates very large daily WAPE even when **totals/bias** are acceptable.

This task defines a reproducible evaluation + delivery workflow for a **postprocess** that redistributes forecast volume onto inferred **service weekdays** (“spikeify”), while preserving totals (weekly and month boundaries).

We validate the approach on **Jan–May 2025** (actuals available in the repo) and ship an **alternative Jun–Dec 2025** wide daily file for Jury to re-check on his **Jun–Oct 2025** actuals (which we do not have).

## Key constraint

- We **cannot** compute Jun–Oct 2025 daily WAPE ourselves without Jury’s actuals for that period.
- We **can**:
  - backtest on Jan–May 2025 actuals;
  - ship a Jun–Dec spikeified forecast file that keeps totals unchanged;
  - ask Jury to rerun his Excel check on Jun–Oct actuals and report WAPE.

## Read first (context + current state)

- Deep-dive summary from Jury’s Excel: `reports/jury_wape_deep_dive_20260108/SUMMARY.md`
- Spikeify implementation:
  - Core utility: `src/sites/service_day_adjust.py`
  - Wide forecast spikeify: `scripts/jury_spikeify_daily_forecast.py`
  - Holdout sanity check: `scripts/eval_service_day_spikeify_backtest.py`
  - Repro notes: `reports/jury_spikeify_20260108/REPRO.md`
  - Tests: `tests/sites/test_service_day_adjust.py`
- Baseline wide daily forecast (Jun–Dec 2025): `sent/forecast_jun_dec_2025_jury_format_daily.csv`
- Jan–May 2025 report that includes `График вывоза` + daily cells:
  - `data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv`
  - Notes: `docs/data/JURY_VOLUMES_2025_JAN_MAY.md`

## Metric definition (lock this)

When discussing WAPE, be explicit which definition is used. For this task, use:

- **Daily micro-WAPE (calendar days):**
  - Window: all calendar days in the evaluation window.
  - For each KP/day:
    - `actual_d` is `0` on non-service days.
  - Formula:
    - `WAPE = SUM_{kp,day} |pred - actual| / SUM_{kp,day} actual`
  - Report both:
    - ratio form (e.g. `1.2783`)
    - percent form (e.g. `127.83%`)

Notes:
- This definition can be **very large** even when totals match, because absolute errors do not cancel.
- We may additionally report:
  - per-site WAPE distribution (median/p90/p95),
  - weekly/monthly micro-WAPE as “planning-level” views,
  - event-based metrics (optional) — but do **not** confuse them with Jury’s daily Excel WAPE.

## What “spikeify” does

Given a wide daily forecast for a window (e.g. Jun–Dec):

- Infer a per-KP **service weekday pattern** from history:
  1) Prefer parsing weekdays from `График вывоза` (when safely parseable).
  2) Fallback: infer top-K weekdays from observed nonzero day counts.
- For each ISO week (split at month boundaries), redistribute that week’s forecast total onto the service weekdays only.
- Preserve totals:
  - weekly totals preserved by construction
  - month-boundary split prevents shifting volume across calendar months
  - overall totals preserved (within rounding)

## Deliverables (keep outputs small + safe)

Create/refresh a report folder:
- `reports/jury_spikeify_<YYYYMMDD>/`
  - `SUMMARY.md` (decision-ready)
  - `REPRO.md` (exact commands)
  - `holdout_metrics.csv` (few rows)
  - `regressions_top20.csv` (KP only + deltas; no addresses)
  - `district_regressions_top20.csv` (district + aggregates; no addresses)

Produce the file to send Jury (store under `_incoming`):
- `/Users/m/git/clients/rtneo/_incoming/jury_spikeify_<YYYYMMDD>/forecast_jun_dec_2025_jury_format_daily_spikeified.csv`

## Guardrails / hygiene

- No model/pipeline changes in this task (postprocess + evaluation only).
- Never commit raw data or large generated reports.
- Store exports (especially wide forecasts / XLSX) under `/Users/m/git/clients/rtneo/_incoming/`.
- Do not output addresses in reports; KP/site_id + aggregates only.
- Do not delete tracked artifacts. If you must delete untracked backups for disk reasons, list exact paths in the report.

## Required reporting: coverage vs impact

Separate “coverage” from “impact” so we don’t “prove” the wrong thing.

Coverage:
- `%KPs` with parsed `График вывоза` weekdays
- `%KPs` with fallback inferred weekdays
- `%KPs` with no pattern (no spikeify applied)

Impact:
- `%KPs modified` (spikeify applied)
- `%forecast volume from modified KPs` (use forecast totals as weights)
- `sum_abs_delta / sum_pred` where:
  - `sum_abs_delta = SUM |new_pred - old_pred|`
  - `sum_pred = SUM old_pred`

## Add a schedule-quality gate (high value)

Problem: `График вывоза` strings can be wrong/stale/ambiguous; blindly trusting them can worsen WAPE.

For KPs with a parsed `График вывоза`, compute alignment on the **train** window:
- `alignment = (# nonzero actual days whose weekday ∈ schedule_weekdays) / (# nonzero actual days)`

Only apply schedule-based spikeify when `alignment >= X` (choose a default, justify it, and report sensitivity if you can).
If gated out, fallback to inferred weekdays (or no spikeify).

Report:
- how many KPs were gated out
- volume share gated out
- holdout micro-WAPE with and without gating (A/B)

## Parsing scope clarity (avoid accidental overreach)

Current safe parsing in `parse_grafik_weekdays()` supports:
- weekday tokens: `пн вт ср чт пт сб вс`
- `Ежедневно`

Requirements:
- List top unparsed `График вывоза` strings and their share.
- If expanding parsing, keep it **safe**:
  - allow full weekday words (e.g. “понедельник”), still mapping to weekdays
  - keep ordinal patterns unparsed by default (e.g. “1-й и 3-й четверг”) unless implemented behind a flag with tests and correct date logic

Also:
- Treat `Ежедневно` as a **no-op** by default (or A/B it explicitly). If service is truly daily, spikeify should not change anything.

## Totals validation (required)

Always validate:
- total (Jun–Oct) matches baseline within ±0.01
- each month total matches baseline within ±0.01
- report a single “max per-KP per-month diff” number (no huge tables)

## Regression reporting (required)

On the Jan–May holdout (where actuals exist):
- Report volume share where per-site WAPE worsened (weights = actual totals in holdout).
- Top-20 per-site regressions by `ΔΣ|err|` (KP only).
- Aggregate regressions by district (district + sums only).

## Repro commands (current baseline)

Run from `projects/forecastingrepo/`.

Holdout sanity check (Jan–Mar train, Apr–May eval):
```bash
python3.11 scripts/eval_service_day_spikeify_backtest.py
```

Generate spikeified Jun–Dec wide forecast:
```bash
python3.11 scripts/jury_spikeify_daily_forecast.py \
  --forecast-wide sent/forecast_jun_dec_2025_jury_format_daily.csv \
  --start 2025-06-01 \
  --out /Users/m/git/clients/rtneo/_incoming/jury_spikeify_<YYYYMMDD>/forecast_jun_dec_2025_jury_format_daily_spikeified.csv
```

Validate Jun–Oct total matches baseline:
```bash
python3.11 - <<'PY'
import csv
from pathlib import Path
EXPECTED = 3227211.74632277
NUM_DAYS = 153
path = Path('/Users/m/git/clients/rtneo/_incoming/jury_spikeify_<YYYYMMDD>/forecast_jun_dec_2025_jury_format_daily_spikeified.csv')
def f(s): return float((s or '').strip().replace(',', '.') or 0.0)
with path.open(newline='') as fh:
    r = csv.reader(fh, delimiter=';')
    next(r)
    total = 0.0
    for row in r:
        total += sum(f(x) for x in row[1:1+NUM_DAYS])
print('total', total)
print('diff', total - EXPECTED)
PY
```

## Acceptance criteria

- Backtest is reproducible and reports the locked WAPE definition.
- Coverage + impact metrics are reported (not conflated).
- Schedule-quality gate is implemented (or explicitly rejected with data-driven justification).
- `Ежедневно` handling is explicit (no-op by default or A/B results shown).
- Unparsed `График вывоза` strings are summarized with shares.
- Totals preservation checks pass (overall + per-month + max per-KP per-month diff).
- Regression reporting exists (volume share worsened + top regressions by KP and district).
- Output forecast file is Jury-compatible (wide, `;`, decimal comma) and contains **no addresses**.

## Appendix: Message to Jury (optional)

Human-only helper text. Do **not** treat this as an implementation deliverable.

RU template:
> «Юра, спасибо за Excel. Похоже, основной источник большого WAPE — дневная форма: в факте много нулевых дней и всплески по графику вывоза, а прогноз сейчас распределён почти ровно по дням. Я сделал альтернативную версию прогноза: тот же суммарный объём по месяцам/периоду, но объём “переложен” на вероятные дни вывоза (по вашему “График вывоза”/истории). Можешь тем же способом пересчитать WAPE на Jun–Oct и сказать, стало ли лучше?»
