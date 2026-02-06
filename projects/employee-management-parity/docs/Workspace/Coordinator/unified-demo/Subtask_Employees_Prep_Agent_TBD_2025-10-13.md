## Subtask — Employees Prep for Unification (Executor)

Agent Header
- Agent: employee-management-exec-2025-10-13-codex
- Role: Executor
- Demo: Employee Management (package prep)
- Repo: ${EMPLOYEE_MGMT_REPO}
- Task: docs/Tasks/employee-management_prep-for-unification.task.md
- Outcome: Export `Root` and isolate `setupRU()`; package mounts under shell

Steps
- [x] Create `src/Root.tsx` exporting the mountable app; remove internal BrowserRouter
- [x] Extract `setupRU()`; document mount instructions
- [x] Build; PR; update CodeMap in unified demo coordinator

Artifacts
- Mount guide: `docs/Workspace/Coordinator/unified-demo/employee-management-mount.md`
- Entry points: `src/Root.tsx`, `src/setup/setupRU.ts`
- Build/test: `npm run build`, `npm run test:unit -- --run`
