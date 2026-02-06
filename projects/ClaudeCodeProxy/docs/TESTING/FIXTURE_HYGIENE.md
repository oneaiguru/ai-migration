# Fixture Hygiene

Purpose: keep fixtures authoritative and predictable across repos.

Authoritative fixtures (CCC)
- `fixtures/usage/ccc_usage_r35_full.json`
- `fixtures/usage/ccc_usage_with_speeds.json`
- `fixtures/metrics/ccp_metrics_fallback_429.prom`
- `configs/providers.r3.matrix.yaml` (+ 429 variant if needed)

Rules
- Treat these as source of truth; update with care and document changes.
- Keep versions small and deterministic.

