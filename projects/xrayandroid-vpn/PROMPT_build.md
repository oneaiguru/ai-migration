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
- Build the FreeGate VPN localhost demo (web UI + mock API + SQLite) per `vpn-saas-spec.md`, preserving existing Android assets.

Constraints:
- Localhost only; no external services or network dependencies.
- Use the specified stack: Next.js, Tailwind CSS, Node.js, SQLite.
- Mock payments, metrics, and VPN sessions (no real integrations).
- Keep `android/` assets unchanged unless explicitly requested.
- No placeholders; no stubs unless explicitly allowed.
- Keep a single source of truth.

Required Reading (customize):
- AGENTS.md
- HANDOFF_CODEX.md
- PROJECT_BRIEF.md
- vpn-saas-spec.md
- docs/INTEGRATION_GUIDE.md
- docs/VPN_PACKAGE_README.md
- specs/*
- android/

Tests to run (customize):
- None yet (no runnable test harness). If a Node app is added, run `npm run lint` and `npm run typecheck`.
