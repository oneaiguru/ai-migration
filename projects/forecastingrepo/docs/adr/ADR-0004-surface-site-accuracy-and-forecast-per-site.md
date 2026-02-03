# Architectural Decision Record — ADR-0004: Surface Site Accuracy & Forecast per Site

**Status:** Accepted (2025-11-05)
**Owners:** Evaluation & Product

## Context
Reviewers asked for clear visibility into per-site accuracy metrics and forecast fill percentages in both the evaluation bundle and UI. Prior iterations lacked consolidated WAPE headlines for sites, making QA burdensome.

## Decision
- Backtest packs must publish `SUMMARY.md` with overall site WAPE (micro-average) and median per-site WAPE alongside scoreboard CSVs.
- UI surfaces per-site `fill_pct`, risk badge, last service, and volume/schedule when available for the demo date.
- Maintain gallery links and consolidated CSVs inside the review bundle for fast reviewer access.

## Consequences
- Evaluators can answer effectiveness questions quickly using provided packs.
- UI demo viewers see actionable per-site information without digging into CSVs.
- Any change to metrics presentation now requires plan/ADR updates to keep reviewer trust.

## References
- `scripts/backtest_sites.py`
- `reviews/site_backtest_pack_*/SUMMARY.md`
- `reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md`
