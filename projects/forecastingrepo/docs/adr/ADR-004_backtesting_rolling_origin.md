# Architectural Decision Record — ADR-004: Backtesting with Rolling Origin

**Status:** Accepted
**Date:** 2025‑11‑02

## Context
We must estimate expected accuracy and robustness to data gaps.

## Decision
- Use **rolling forecasting origin**:
  - E1: Train 2023 → predict all 2024.
  - E2: Cutoffs 2024‑03‑31 / 06‑30 / 09‑30 → predict next 3 months.
  - E3: Exclude Dec‑2024 (train through Nov‑2024) → predict Dec‑2024.

## Consequences
- Seasonality and robustness are measured across multiple origins.
- Consistent, defensible evaluation protocol.

## Implementation Notes
- Implemented in `scripts/backtest_eval.py` (driver) + `docs/System/Quicklook.md` (“Backtest mode”).