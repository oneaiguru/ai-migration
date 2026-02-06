# Evaluation Run Plan — Real Data (Backtests + Consolidation)

## Objectives
- Use the client’s real XLSX reports (2024 H1 + H2) to build daily/monthly CSV actuals.
- Run three backtests via `scripts/backtest_eval.py` for 2024 Q2/Q3/Q4 windows.
- Consolidate scoreboards, compute percentiles and provisional thresholds (T₁/T₂).
- Package an evaluation bundle ZIP for review. No behavior or golden changes.

## Data Inventory (local, not in Git)
- XLSX (local, git‑ignored):
  - `data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_01_2024_по_30_06_2024,_для_всех_участков_1.xlsx`
  - `data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.xlsx`
- Weather ZIP (external, do not commit):
  - `/Users/m/Downloads/Telegram Desktop/wr352420a1 (1).zip`
  - Extraction target (local): `data/raw/weather/` (documented; not versioned)

## Steps
1) Ingest XLSX to CSV actuals (no model change)
   - Command:
     - `python scripts/ingest_and_forecast.py ingest <H1.xlsx> <H2.xlsx>`
   - Outputs (versioned):
     - `data/daily_waste_by_district.csv`
     - `data/monthly_waste_by_district.csv`
     - `data/monthly_waste_region.csv`

2) Backtests (three cutoffs)
   - 2024‑03‑31 → windows 2024‑04..06
   - 2024‑06‑30 → windows 2024‑07..09
   - 2024‑09‑30 → windows 2024‑10..12
   - Command pattern (example):
     - `python scripts/backtest_eval.py --train-until 2024-09-30 --daily-window 2024-10-01:2024-12-31 --monthly-window 2024-10:2024-12 --scopes region,districts --methods daily=weekday_mean,monthly=last3m_mean --actual-daily data/daily_waste_by_district.csv --actual-monthly data/monthly_waste_by_district.csv --outdir reports/backtest_real_2024-09-30`

3) Consolidation + thresholds (analysis only)
   - Add `scripts/eval/concat_scoreboards.py` (pandas+numpy; with stdlib fallback).
   - Run:
     - `python scripts/eval/concat_scoreboards.py --inputs reports/backtest_real_2024-03-31 reports/backtest_real_2024-06-30 reports/backtest_real_2024-09-30 --outdir reports/backtest_consolidated_auto`
   - Outputs:
     - `reports/backtest_consolidated_auto/scoreboard_consolidated.csv`
     - `reports/backtest_consolidated_auto/SUMMARY.md`
     - `reports/backtest_consolidated_auto/hist_region.png`
     - `reports/backtest_consolidated_auto/hist_district_micro.png`
     - `docs/contract/thresholds_provisional.md`

4) Evaluation bundle
   - Add `scripts/make_eval_bundle.sh` and run it to build `~/Downloads/eval_bundle_YYYYMMDD_HHMM.zip`.
   - Content includes: scripts/, src/, specs/, tests/, .tools/, .github/, docs/, scenarios/ plus reports/backtest_* and consolidated outputs; excludes raw data and heavy artifacts.

## Gates (every PR)
- `pytest -q --cov=scripts --cov-report=term-missing`
- `python .tools/spec_sync.py`
- `python .tools/docs_check.py`
- Determinism env in CI: `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg MPLCONFIGDIR=${{ runner.temp }}`

## Non‑Goals / Policy
- Do not commit raw data or weather ZIP (data/raw/**, *.xlsx) — local only.
- No changes to forecast behavior or golden outputs.
- Thresholds are advisory (docs) — not CI gates.

## Deliverables
- The three backtest directories under `reports/`.
- Consolidated CSV + SUMMARY + histogram PNGs.
- `docs/contract/thresholds_provisional.md` with suggested T₁/T₂.
- Evaluation bundle ZIP path and HEAD SHA.
