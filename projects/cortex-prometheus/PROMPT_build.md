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
- Build the FleetPulse MVP (frontend + backend) per `specs/cortexfleet.md` using this repo as the base.

Constraints:
- Localhost-only; no external services or real payment processing.
- Tech stack: Next.js 14 + TypeScript + Tailwind; Flask + SQLite.
- Reuse alert rule patterns from `config/prometheus-rules.yml`.
- Reuse installer logic from `scripts/install_node_exporter.sh` and `scripts/install_windows_exporter.ps1`.
- Keep existing infrastructure assets intact unless a task explicitly requires changes.
- No placeholders; no stubs unless explicitly allowed.
- Keep a single source of truth.

Required Reading (customize):
- AGENTS.md
- HANDOFF_CODEX.md
- PROJECT_BRIEF.md
- specs/cortexfleet.md
- docs/installation-guide.md
- docs/technical-documentation.md
- config/prometheus-rules.yml
- scripts/install_node_exporter.sh
- scripts/install_windows_exporter.ps1

Tests to run (customize):
- ./scripts/validate_config.sh (only when config/ or docker-compose.yml changes)
- ./scripts/verify_deployment.sh (optional; requires a running stack)
- No automated tests for FleetPulse yet; note gaps in IMPLEMENTATION_PLAN.md.
