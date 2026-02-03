# Architectural Decision Record — ADR-0002: Module Size & Waiver Policy

**Status:** Accepted (2025-11-05)
**Owners:** Engineering Enablement

## Context
Reviewer feedback highlighted the need to keep modules small (<500 LoC) and prevent large monoliths from accruing without explicit review. Existing CI checks warn on big files but enforcement was ad-hoc.

## Decision
- Enforce "warn at 500, block at 600" non-empty line counts for Python/TypeScript sources via pre-commit + CI.
- UI components target 300–400 LoC; anything larger must be split into hooks/presentational pieces.
- Allow temporary waivers using the existing `allow-large-file:<ticket>` header, reviewed case-by-case until the offending file is refactored.

## Consequences
- Keeps bundles within reviewer size budgets (~400KB) and simplifies diff review.
- Encourages earlier refactors (ingest/forecast helpers, UI components) without derailing the demo freeze.
- CI/Pre-commit configuration becomes authoritative; developers know when a waiver is active.

## References
- Coordinator decision package (2025-11-05)
- `docs/SOP/review-process.md`
- `scripts/ci/check_large_files.sh`
