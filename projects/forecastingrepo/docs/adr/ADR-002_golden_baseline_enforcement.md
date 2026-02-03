# Architectural Decision Record — ADR-002: Golden Baseline Enforcement

**Status:** Accepted
**Date:** 2025‑11‑02

## Context
We must prevent silent regressions. The default pipeline should remain byte‑identical unless we explicitly change a scenario or bump the golden.

## Decision
- Pin a **golden run** (full‑year daily/monthly) via `tests/golden/golden.yml` (SHA256).
- Default (baseline) scenario must reproduce golden outputs **bit‑for‑bit**.
- Golden updates only via a dedicated “golden update” PR.

## Consequences
- Predictable releases; safe iteration.
- Extra step to bump golden when intended changes occur.

## Implementation Notes
- Test: `tests/golden/test_golden_baseline.py` asserts hashes.
- CI gate fails if hashes differ on default scenario.