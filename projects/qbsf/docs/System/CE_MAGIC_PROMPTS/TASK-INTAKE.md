# TASK INTAKE MAGIC PROMPT - T ONLY

Use this prompt when there is no active task (no `docs/Tasks/ACTIVE_TASK.md`).

1. PICK THE NEXT TASK
- Read `PROJECT_BRIEF.md` and `IMPLEMENTATION_PLAN.md` and select the single most important item.
- Confirm any constraints from `HANDOFF_CODEX.md` and `specs/*`.

2. CREATE THE TASK FILES
- Create `docs/Tasks/ACTIVE_TASK.md` with the task slug and file paths.
- Create `docs/Tasks/<slug>.task.md` using the task template.

3. STOP
- Do not run R/P/I in the same loop.

TEMPLATE: docs/Tasks/templates/TASK.md
