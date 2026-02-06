# Customize Before First Run

This template is not ready until you edit the files below.
Start with `docs/SOP/loop_start.md` for the Ralph loop setup checklist.

Checklist
1. AGENTS.md
- Fill in run/test commands, tooling, and push workflow.
- Add repo guardrails (no network, no destructive commands, etc).

2. HANDOFF_CODEX.md
- Update loop-specific guardrails and entrypoint/run expectations.

3. PROJECT_BRIEF.md
- Write a one-page brief describing the repo and the current goal.

4. .mergify.yml (optional)
- Configure merge rules and required checks (if you use Mergify).

5. scripts/dev/ (optional)
- Update repo defaults (OWNER_REPO/ALLOWED_REPOS) and adjust smoke/build scripts.

6. PROMPT_build.md
- Replace <PROJECT_GOAL> and <CONSTRAINTS>.
- Update Required Reading paths for your repo.
- Update the Tests to run list.

7. PROMPT_plan.md
- Replace <PROJECT_GOAL>.
- Update Non-negotiables to match architecture decisions.

8. IMPLEMENTATION_PLAN.md
- Seed 5-10 tasks, ordered by impact.
- Each task should be small enough for one loop.

9. specs/
- Create or update specs/ and update prompts to reference the relevant files.

Example: Python to TypeScript migration
- Inventory python entrypoints, modules, and runtime dependencies.
- Extract data models and message formats; define TS types and runtime schemas.
- Identify side effects (filesystem, subprocess, network) and design adapters.
- Port modules in dependency order; write parity tests per module.
- Switch entrypoints only after TS parity tests pass.
