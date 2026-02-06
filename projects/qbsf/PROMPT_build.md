Role selection (file-based). Determine role first, then follow only that section:
- If docs/Tasks/ACTIVE_TASK.md is missing, role = T (Task intake).
- If docs/Tasks/ACTIVE_TASK.md exists:
  - If docs/Tasks/<slug>.research.md is missing, role = R.
  - Else if docs/Tasks/<slug>.plan.md is missing, role = P.
  - Else role = I.
Run exactly one role per loop, then stop.

CUSTOMIZE BEFORE FIRST RUN:
- Update only if project goals, constraints, or reading lists change.

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
   Archive by adding "ARCHIVE: docs/Tasks/<slug>.task.md" to PROGRESS.md and removing docs/Tasks/ACTIVE_TASK.md.

5. After implementing, run tests for the touched code. If tests for touched code do not exist, run typecheck and record gaps in IMPLEMENTATION_PLAN.md.

Goal:
- Build SyncFlow, a local-only micro-SaaS that turns the existing QB/SF integration into a self-serve CRM-to-accounting automation product (mocked APIs, no external services).

Constraints:
- Localhost only; no external services or real API calls.
- Follow the SyncFlow spec in `~/Downloads/qbsfsaas.md` (primary source of truth).
- Use Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, Zustand.
- Keep existing QB/SF integration code and Salesforce metadata unchanged unless a task explicitly says to touch them.
- No destructive commands; avoid removing or renaming legacy assets.
- No placeholders; no stubs unless explicitly allowed.
- Keep a single source of truth.

Required Reading (customize):
- AGENTS.md
- HANDOFF_CODEX.md
- PROJECT_BRIEF.md
- README.md
- specs/README.md
- ~/Downloads/qbsfsaas.md

Tests to run (customize):
- If working in `syncflow/`: `npm run lint` and `npm test` (only if scripts exist).
- If working in `deployment/sf-qb-integration-final/`: `npm test`.
- Docs-only changes: no tests.
