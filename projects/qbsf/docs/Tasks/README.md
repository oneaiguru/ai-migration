# Tasks

Task files live here. Roles are determined by file existence:

- T: create `docs/Tasks/ACTIVE_TASK.md` and `docs/Tasks/<slug>.task.md`.
- R: create `docs/Tasks/<slug>.research.md` (file:line ranges only).
- P: create `docs/Tasks/<slug>.plan.md`.
- I: implement the plan, then remove `docs/Tasks/ACTIVE_TASK.md`.

Archive without moving files: add `ARCHIVE: docs/Tasks/<slug>.task.md` to `PROGRESS.md`.
After a task is fully complete, and only once the next task has been created and its completion is confirmed, copy the task's research/plan artifacts into `/output/runs/...` and remove them from `docs/Tasks/`.
