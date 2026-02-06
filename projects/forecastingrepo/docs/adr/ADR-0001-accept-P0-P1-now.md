# Architectural Decision Record — ADR-0001: Accept P0/P1 Reviewer Items Immediately

**Status:** Accepted (2025-11-05)
**Owners:** Backend & Platform engineering

## Context
The demo freeze review cycle produced a consolidated list of P0/P1 items (core pipeline, API hardening, evaluation reporting, UI polish). These items are already implemented in the codebase and called out by the coordinator as non-negotiable for the demo handoff.

## Decision
- Treat every reviewer P0/P1 item from the 2025-11-05 bundles as accepted and in-scope for the demo release.
- Keep the shipped fixes locked in: CORS origin env, CSV DictWriter safeguards, SlowAPI limiter, `/api/metrics.demo_default_date`, simulator reset flag defaulting to OFF, NaN fallbacks in baselines, site-level WAPE summary, sidebar/tab alignment, and CSV UX feedback.
- Defer only repo/monorepo restructuring and post-demo refactors explicitly marked “after demo”.

## Consequences
- Demo reviewers can rely on the current packs; no open P0/P1 debt remains.
- Any future change that alters these behaviours must go through a new ADR or review approval.
- Post-demo backlog starts from P2 items and structural improvements (router split, deeper extraction, etc.).

## References
- `reviews/20251105/original/MASTER_CODE_REVIEW.md`
- Coordinator decision log (2025-11-05)
- `reviews/README_STATUS.md`
