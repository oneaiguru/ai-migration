# CLAUDE Notes (forecastingrepo)

## Data Handling
- Keep raw data and large generated outputs outside the repo under `/Users/m/git/clients/rtneo/_incoming/`.
- Do not commit backtest bundles (example: `reports/accuracy_backtest_*/`).
- See `docs/SOP/DATA_SOURCES.md` for source staging guidance.

## Spec Tagging Approach (BDD)
- Use file-level tier tags by default.
- Add scenario-level tags only when a file mixes tiers or needs selective execution.
