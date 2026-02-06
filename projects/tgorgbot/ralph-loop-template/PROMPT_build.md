Role selection (file-based). Determine role first, then follow only that section:
- If docs/Tasks/ACTIVE_TASK.md is missing, role = T (Task intake).
- If docs/Tasks/ACTIVE_TASK.md exists:
  - If docs/Tasks/<slug>.research.md is missing, role = R.
  - Else if docs/Tasks/<slug>.plan.md is missing, role = P.
  - Else role = I.
Run exactly one role per loop, then stop.

CUSTOMIZED FOR THIS REPO:
- Project goal and constraints set below.
- Required Reading list updated for SanghaDesk.
- Tests to run list points to the current smoke checklist.

1. T (Task intake): read AGENTS.md, HANDOFF_CODEX.md, PROJECT_BRIEF.md, docs/SESSION_HANDOFF.md, IMPLEMENTATION_PLAN.md, and specs/*.
   Then create:
   - docs/Tasks/ACTIVE_TASK.md (pointer to the task slug + expected files).
   - docs/Tasks/<slug>.task.md (task brief + acceptance).
   Stop after T.

2. R (Research): read docs/Tasks/<slug>.task.md (Required Reading list), then search the repo (rg) before assuming anything is missing.
   Produce docs/Tasks/<slug>.research.md with file:line ranges only. No edits, no tests. Stop after R.

3. P (Plan): read docs/Tasks/<slug>.task.md, docs/Tasks/<slug>.research.md, and docs/Tasks/templates/PLAN.md.
   Produce docs/Tasks/<slug>.plan.md referencing R file:line ranges. No edits, no tests. Stop after P.

4. I (Implement): read docs/Tasks/<slug>.task.md, docs/Tasks/<slug>.research.md, and docs/Tasks/<slug>.plan.md.
   Implement the plan, run tests, update IMPLEMENTATION_PLAN.md, and log in docs/SESSION_HANDOFF.md.
   Archive by adding "ARCHIVE: docs/Tasks/<slug>.task.md" to progress.md and removing docs/Tasks/ACTIVE_TASK.md.

5. After implementing, run tests for the touched code. If tests for touched code do not exist, run typecheck and record gaps in IMPLEMENTATION_PLAN.md.

Goal:
- Deliver the SanghaDesk MVP: a local-first Telegram inbox dashboard for spiritual teachers with auth, onboarding, messaging, settings, pricing, and a working Telegram relay flow.

Constraints:
- 100% local: no external services or APIs beyond Telegram bot relay; data stored in SQLite.
- Mock auth and mock payments only; no OAuth or real billing.
- Tech stack fixed: Next.js frontend + Express backend + TypeScript, single `npm run dev` startup.
- Primary language Russian with English fallback; responsive across desktop, tablet, and mobile.
- Reuse and adapt existing tgorgbot relay code as the messaging engine.
- No placeholders; no stubs unless explicitly allowed.
- Keep a single source of truth.

Required Reading (customize):
- AGENTS.md
- HANDOFF_CODEX.md
- PROJECT_BRIEF.md
- IMPLEMENTATION_PLAN.md
- docs/SESSION_HANDOFF.md
- specs/*

Tests to run (customize):
- None yet (template only). Follow the Smoke Test Checklist in HANDOFF_CODEX.md.
