# Architectural Decision Record — ADR-003: Metrics (WAPE, SMAPE, MAE)

**Status:** Accepted
**Date:** 2025‑11‑02

## Context
We need scale‑aware, interpretable metrics for monthly (primary) and daily (secondary) accuracy that are robust to zeros.

## Decision
- **Primary:** WAPE = sum(|y−ŷ|) / sum(|y| + ε)
- **Secondary:** SMAPE = mean( 2|y−ŷ| / (|y|+|ŷ|+ε) )
- **Units:** MAE = mean(|y−ŷ|)
- Use ε = 1e‑9. Exclude rows with y=ŷ=0 from SMAPE. Report micro‑averaged WAPE.

## Consequences
- Business‑friendly headline (WAPE), with SMAPE for scale‑balanced view.
- Consistent denominators across experiments.

## Implementation Notes
- Definitions mirrored in `docs/eval/METRICS.md` and used by `scripts/backtest_eval.py`.