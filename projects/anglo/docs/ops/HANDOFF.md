# Handoff: master-tasks phase 1-4 patch set (anglo)

Context
- Worktree: /Users/m/ai-anglo (branch: anglo)
- Scope: projects/anglo/tasks/master-tasks-phase-{1..5}.md copied from user sources and patched for consistency.
- Sparse checkout: root files + projects/anglo + projects/qbsf; large subprojects not checked out.
- Canonical set: only one phase doc per phase exists in this worktree (master-tasks-phase-1..5.md).

What changed
- Phase 1: added canonical note; removed early workspace deps in PWA to avoid install ordering; added .env.example files; added @types/uuid in api/lesson-engine; switched BDD to Cucumber (cucumber.cjs + step-def support); updated PWA configs to import.meta.url aliases and ASCII UI text; removed @duolingoru/content from lesson-engine dependency list; added Vite dev proxy for API routes; test verification uses exit codes (no exact counts); wired favicon package copy with placeholder fallback.
- Phase 2: added canonical note; removed brittle test-count verifications; aligned MatchPair to tuple type; updated session UserAnswer to allow tuple arrays; updated gradeMatchPairs types; re-exported SM2State from spaced-rep and made lesson-engine barrel exports explicit to avoid duplicate Session/SessionConfig during AGENT_03 verification; run order keeps AGENT_11 immediately after AGENT_03.
- Phase 3: added canonical note; feature files extracted from the BDD spec in projects/anglo/docs/bdd; removed vitest-based BDD tests; updated Lesson page to use gradeMatchPairs and pass tuple answers without stringifying; added apiFetch helper (VITE_API_BASE_URL + auth headers) with fallback manifest/policy/entitlements; offline sync uses apiFetch; clarified Vite proxy preservation; precheck snippet uses .js extensions; packs mkdir added.
- Phase 4: added canonical note; clarified Fastify migration at top and replaced app.ts snippets with full-file replacements to prevent lost imports; ensured auth plugin registration order; made health route/test explicit replacements; switched content service to async readFile + import.meta.url pathing.
- Phase 5: placeholder validation moved to release checklist; scaffold verification only checks for template presence.
- blocking-issues-analysis.md: added dev-proxy, duplicate-export, SM2State, and fragile test-count resolution notes.
Artifacts added
- projects/anglo/docs/ops/blocking-issues-analysis.md (copied from provided analysis file)
- projects/anglo/docs/ops/anglo_handoff_checklist.md (blocker-fix checklist)

Known critical invariants (handoff checklist)
- One canonical doc per phase: master-tasks-phase-1.md .. master-tasks-phase-5.md.
- MatchPairs shape is tuple arrays end-to-end (schema, content, models, session answers, UI grading).
- GradeResult defined once and imported/exported from models (no duplicates).
- BDD uses Cucumber with feature files under projects/anglo/apps/pwa/tests/features and step definitions under projects/anglo/apps/pwa/tests/bdd.
- No local machine paths; feature spec lives at projects/anglo/docs/bdd/duolingoru_feature_files-3.md.
- Phase 4 and Phase 5 task files live in `projects/anglo/tasks/` and define the API contracts Phase 3 expects.

Audio hosting handoff (v1.3)
- Primary: Timeweb Cloud S3 (RU region, Standard class) -> audio.english.dance via CNAME + Timeweb domain binding + SSL.
- Fallback: Yandex Cloud Object Storage warm standby (optional Yandex CDN for HTTPS custom domain).
- Cutover: CNAME swap only, dual-host for 7 days, RU SIM verification, update allowlist + release notes.
- Runbook: `projects/anglo/docs/ops/audio-hosting-runbook.md`.

Pasteable note to reviewer/agent
- BDD source spec: projects/anglo/docs/bdd/duolingoru_feature_files-3.md (50 headings).
- Extracted features: projects/anglo/apps/pwa/tests/features/ (50 .feature files).
- BDD now uses Cucumber (see projects/anglo/tasks/master-tasks-phase-1.md + projects/anglo/tasks/master-tasks-phase-3.md), not vitest filename mapping.
- Favicon assets committed in projects/anglo/pwa_favicon_package/ and copied into projects/anglo/apps/pwa/public/ during Phase 1.
- Vite proxy is limited by design; use VITE_API_BASE_URL for full API coverage.

Files
- projects/anglo/tasks/master-tasks-phase-1.md
- projects/anglo/tasks/master-tasks-phase-2.md
- projects/anglo/tasks/master-tasks-phase-3.md
- projects/anglo/tasks/master-tasks-phase-4.md
- projects/anglo/tasks/master-tasks-phase-5.md

Next steps
- User plans to provide additional Phase 1-4 details; incorporate them into the task docs above.
- Use `projects/anglo/docs/ops/BDD_HANDOFF.md` for BDD extraction + Cucumber alignment.
- If pushing, use scripts/dev/push_with_codex.sh and confirm gh auth status for oneaiguru.
- Remove sparse-checkout if full repo access is needed.
