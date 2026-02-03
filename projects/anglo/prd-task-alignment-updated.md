# PRD Task Alignment (Updated)

This checklist reflects PRD v1.1 alignment gaps in the master task files.

## Already aligned
- Phase 1: GradeResult export/import fix (done)
- Phase 2: MatchPair tuple + UserAnswer.answer union (done)
- Phase 3: match_pairs grading call uses tuple answer (done)
- Local path removal: N/A in current master tasks

## Remaining for PRD v1.1 alignment (tasks added; implementation pending)
- Phase 2: Add PolicyConfig type (hearts | energy variants)
- Phase 2: Add CoursePack/CoursePackMeta types + schema (packId, version, checksum, sizeBytes, url)

- Phase 3: Gate offline downloads by entitlements (Max vs free/sample)
- Phase 3: Replace navigator.onLine-only with backend reachability (/health) -> Zombie Mode indicator
- Phase 3: Replace /packs/:id.json downloads with manifest + versioned packs + checksum verification
- Phase 3: Replace naive /progress drain with batch sync to POST /sync/reconcile

- Phase 4: Add EntitlementsService + GET /entitlements/me
- Phase 4: Add Policy service + GET /policy/config (deprecate or alias /monetization/policy)
- Phase 4: Add packs service + GET /packs/manifest + GET /packs/:packId/:version
- Phase 4: Add sync reconciliation endpoint POST /sync/reconcile (idempotent action IDs)
- Phase 4: Add notifications provider abstraction + device registration endpoint

## Distribution
- Phase 5 tasks for Android TWA wrapper + RuStore packaging added in master-tasks-phase-5.md
