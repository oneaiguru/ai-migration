# Architectural Decision Record — ADR-0003: Test Pyramid with Behave & Playwright

**Status:** Accepted (2025-11-05)
**Owners:** QA & Engineering

## Context
The review cycle called out the need for evidence that our API and UI workflows are covered by behaviour-driven smokes and lightweight end-to-end tests. Existing CI ran `behave` in dry-run mode and Playwright only manually.

## Decision
- Adopt a test pyramid: unit/integration tests remain the bulk; Behave scenarios cover API acceptance; Playwright handles UI smokes (serial on PR, extended nightly).
- Run Behave smokes (`@smoke`) as part of CI (not dry-run) with deterministic env.
- Keep Playwright PR smokes serialized (≤30s per spec, 45s for routes) and nightly runs with downloads enabled.

## Consequences
- Provides reviewer-visible acceptance evidence without bloating CI times.
- Behave features double as living documentation for API contracts.
- Aligns UI/BE workflows with the coordinator’s "pyramid" expectation and future BDD expansion.

## References
- `specs/bdd/features/api_metrics_smoke.feature` (and friends)
- `.github/workflows/ci.yml`
- `docs/System/Testing.md`
