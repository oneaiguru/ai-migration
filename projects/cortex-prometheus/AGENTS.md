# AGENTS

Repo-specific guidance for the Ralph loop.

Run/test commands
- ./make_scripts_executable.sh (ensure scripts are executable)
- ./scripts/validate_config.sh (validate Prometheus/Grafana/Cortex config)
- ./scripts/verify_deployment.sh (requires a running stack; optional)
- Frontend dev (after scaffold): cd frontend && npm run dev
- Backend dev (after scaffold): cd backend && python src/app.py
- Tests: none yet (record gaps in IMPLEMENTATION_PLAN.md)

Tooling
- node: 20 LTS (for Next.js 14)
- npm: 10+ (pnpm ok if added)
- python: 3.11+
- docker: optional (docker-compose for local stack)

Workflow
- Use the Ralph loop (PROMPT_build.md).
- One role per loop; stop after each role.
- Do not edit specs unless explicitly asked.

Git/push
- Before gh or push, confirm GitHub account: `gh auth status -h github.com` (switch with `gh auth switch -u oneaiguru`).
- New PR: may push via `gh` (no wrapper).
- After PR exists: use `scripts/dev/push_with_codex.sh` or `git pushcodex` so @codex review is posted.
- Direct-to-main only if explicitly instructed.
