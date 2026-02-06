# ADR 0002 – Wrapper Layer Ownership Strategy

**Status:** Accepted  
**Date:** 2025-10-07  
**Related Docs:** `docs/Tasks/phase-6-migration-planning-prd.md`, `ai-docs/QUESTIONS.md`

## Context
- Wrapper prototypes currently live inside `ai-docs/wrappers-draft/` and are meant to abstract Radix/TanStack/RHF usage.
- We must decide whether to ship wrappers as an internal module in this repo or extract them into a shared package for other parity efforts (Schedule, Reporting, etc.).
- External packaging increases coordination overhead; internal modules simplify iteration during the initial migration.

## Decision
Keep the wrapper layer **inside this repository** during Phase 6. Treat it as a local module (e.g., `src/wrappers/`) once APIs are stabilised. Revisit extraction after Employee Management migrates and at least one additional module (Schedule or Reporting) confirms reuse requirements.

## Consequences
- **Pros:**
  - Faster iteration while wrappers evolve; no versioning between repos required.
  - Simplifies troubleshooting alongside existing parity tests.
  - Allows per-commit validation in the same CI pipeline.
- **Cons:**
  - Other teams cannot reuse wrappers until they are extracted.
  - Potential duplication if another repo needs them before we extract.

## Follow-up Actions
1. During Phase 6 Stage 0, move hardened wrappers from `ai-docs/wrappers-draft/` into `src/wrappers/` and add documentation.
2. Record lessons learned; evaluate packaging once the second module adopts the wrappers (create new ADR when ready).
3. Update `ai-docs/QUESTIONS.md` to mark the packaging question as resolved.

## Status History
- **2025-10-07:** Accepted – local ownership until migration proves stable.
