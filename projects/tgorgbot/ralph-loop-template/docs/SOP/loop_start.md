# Starting a New Loop

Goal: bootstrap a new repo with a single source of truth for context and a clear first loop.

## 1) Write the Project Brief
Fill `PROJECT_BRIEF.md` with a one-page description of the repo and the current goal.
Keep it short and specific; this is the single prompt-level context.

Example goal (Python -> TypeScript migration):
- "Migrate the Python runtime to TypeScript while preserving behavior and CLI flags."

## 2) Customize the Prompts
- Update `PROMPT_plan.md` and `PROMPT_build.md` placeholders (`<PROJECT_GOAL>`, constraints, tests).
- Ensure both prompts list `PROJECT_BRIEF.md` in Required Reading.

## 3) Run the Plan Loop (one iteration)
Generate or refresh the high-level backlog in `IMPLEMENTATION_PLAN.md`.

```bash
./loop.sh plan 1
```

## 4) Start the Build Loop (T role)
If no task is active, the next build loop iteration will create it (T).

```bash
./loop.sh 1
```

## 5) Continue T/R/P/I one role at a time
- T creates `docs/Tasks/ACTIVE_TASK.md` and `docs/Tasks/<slug>.task.md`.
- R creates `docs/Tasks/<slug>.research.md`.
- P creates `docs/Tasks/<slug>.plan.md`.
- I implements and archives the task.

## 6) Update the Brief When the Goal Changes
Treat `PROJECT_BRIEF.md` as the single source of truth for repo context + goal.
