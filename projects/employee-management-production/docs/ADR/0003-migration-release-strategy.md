# ADR 0003 – Migration Release Strategy

**Status:** Accepted  
**Date:** 2025-10-07  
**Related Docs:** `docs/Tasks/phase-6-migration-planning-prd.md`, `docs/SESSION_HANDOFF.md`

## Context
- Component migration will touch core surfaces (drawers, bulk edit, list) with limited engineering bandwidth for maintaining parallel implementations.
- We must balance safety (ability to roll back) with delivery speed. Options considered: feature flags toggling old/new components at runtime, or branch-based sequencing with regression gates between stages.
- The project runs a static build (Vite) without existing feature flag infrastructure, making runtime toggles costly.

## Decision
Adopt a **branch-based rollout** for Phase 6:
- Execute each migration stage (overlays → table → forms → bulk flows) on dedicated branches.
- Merge to `main` only after Playwright + screen-reader verification passes and regression artefacts are updated.
- Maintain rollback readiness via git revert of the stage branch if post-deploy issues surface.

Feature flags may be revisited if future modules demand parallel implementations, but Phase 6 will rely on disciplined staging and rollbacks.

## Consequences
- **Pros:**
  - No additional runtime infrastructure required.
  - Keeps build pipeline simple; production bundle contains a single source of truth per component.
  - Encourages complete validation per stage before promotion.
- **Cons:**
  - Rolling back requires git operations rather than a quick toggle.
  - Parallel workstreams must coordinate to avoid long-lived branches drifting from `main`.

## Follow-up Actions
1. Document branch naming convention (`feature/migration-stage-<n>`) in SOPs during Stage 0 hardening.
2. Add rollback procedure (git revert + redeploy) to `docs/SESSION_HANDOFF.md` once the first stage lands.
3. Capture branch merge checkpoints in the migration PRD and handoff logs.

## Status History
- **2025-10-07:** Accepted – branch-based staging selected for Phase 6 migration.
