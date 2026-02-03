# Architectural Decision Record — ADR-005: Hierarchical Strategy (Region = ΣDistricts)

**Status:** Accepted
**Date:** 2025‑11‑02

## Context
We deliver both district and region forecasts. Consistent aggregation is critical for QA and acceptance.

## Decision
- Client CSVs: **region = sum(districts)** (canonical).
- Direct region models are **auxiliary** (QA only) and may warn on divergence.

## Consequences
- Exact reconciliation in delivered files.
- Optional future experiments (e.g., MinT) run in evaluation only.

## Implementation Notes
- Enforcement via QA checks; debug CSVs record region vs direct deltas.