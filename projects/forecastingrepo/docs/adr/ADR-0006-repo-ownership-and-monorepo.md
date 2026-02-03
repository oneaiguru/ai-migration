# Architectural Decision Record — ADR-0006: Repository Ownership & Monorepo Stance

**Status:** Accepted (2025-11-05)
**Owners:** Engineering Leadership

## Context
The project currently uses two repositories (backend under `oneaiguru`, UI under `granin`). Reviewers asked about ownership consolidation and monorepo alignment, but coordinators deferred structural changes until after the demo.

## Decision
- Keep the two-repo setup through the demo for stability.
- Document the plan to establish a shared organization and evaluate a monorepo after the demo window closes.
- Record operational SOPs for switching GitHub identities (`docs/SOP/GITHUB_ACCOUNTS.md`).

## Consequences
- Avoids risk of last-minute repo migrations.
- Provides a clear post-demo action item without creating blockers now.
- Maintains clarity on who owns each repository during the review window.

## References
- Coordinator decision memo (2025-11-05)
- `docs/SOP/GITHUB_ACCOUNTS.md`
- `README_COORDINATOR_DROP.md`
