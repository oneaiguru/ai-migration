## Subtask — Scheduling Prep for Unification (Executor)

Agent Header
- Agent: scheduling-exec-2025-10-13-tbd
- Role: Executor
- Demo: Schedule (package prep)
- Repo: ${SCHEDULE_REPO}
- Task: docs/Tasks/scheduling_prep-for-unification.task.md
- Outcome: Export `Root` + `setupRU()`; package mounts under shell; Day/Period + overlays work under `/schedule`

Steps
- Create `src/Root.tsx` exporting the mountable app; ensure basename routing
- Extract `setupRU()`; document mount instructions
- Build; PR; update CodeMap in unified demo coordinator
