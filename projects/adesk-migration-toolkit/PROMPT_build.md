Role selection (file-based). Determine role first, then follow only that section:
- If docs/Tasks/ACTIVE_TASK.md is missing, role = T (Task intake).
- If docs/Tasks/ACTIVE_TASK.md exists:
  - If docs/Tasks/<slug>.research.md is missing, role = R.
  - Else if docs/Tasks/<slug>.plan.md is missing, role = P.
  - Else role = I.
Run exactly one role per loop, then stop.

CUSTOMIZE BEFORE FIRST RUN:
- Replace <PROJECT_GOAL> and <CONSTRAINTS>.
- Update Required Reading paths for your repo.
- Update Tests to run list.

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
- Build the local-only MigrateFlow web app described in `specs/adesk.md`, porting the PHP migration toolkit into a Next.js + Express + SQLite stack while keeping the legacy CLI intact.

Constraints:
- `specs/adesk.md` is the single source of truth for product scope and sequence.
- No external services; all auth, billing, and destination APIs are mocked locally.
- Keep existing PHP scripts and classes unchanged; port logic into new JS modules instead.
- Use Next.js 14 + Tailwind for frontend and Express + SQLite for backend.
- Preserve migration entity order and mapping behavior from `migrate.php` and `config.php`.
- No placeholders; no stubs unless explicitly allowed.
- Keep a single source of truth.

Required Reading (customize):
- AGENTS.md
- HANDOFF_CODEX.md
- PROJECT_BRIEF.md
- specs/adesk.md
- README.md
- config.php
- classes/

Tests to run (customize):
- None by default (no automated tests yet).
- If modifying PHP scripts, run `php -l <changed file>`.
- If the new app exists, run `npm run lint` and `npm run test` as available.
