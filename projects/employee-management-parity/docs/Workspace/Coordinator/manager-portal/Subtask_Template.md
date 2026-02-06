# Manager Portal – Executor Subtask Template

Paste this block at the top of your working notes (Code Map, PR description, handoff). Update fields before you start and keep them current during the session.

```
Agent Header
- Agent: <name>
- Role: Executor
- Demo: Manager Portal
- Repo: ${MANAGER_PORTAL_REPO}
- Active Plan: plans/2025-10-12_manager-portal-refactor.plan.md
- Deploy URL: <url>
- Commit: <sha>
- Outcome: Deploy + UAT Pass + Reports/Checklist/CodeMap updated
```

When you finish, copy/paste the Handoff Checklist from `docs/Workspace/Templates/12_Agent_Handoff_Checklist.md` and tick each item.

## Session Checklist
1. Update your row in `docs/Tasks/post-phase9-demo-execution.md` (Agent Assignments & Outcomes table).
2. Sync the Code Map (`docs/Workspace/Coordinator/manager-portal/CodeMap.md`) with any new files, adapters, tests, or UAT notes.
3. Run required validations (`npm test -- --run`, `npm run build`) before touching the tracker.
4. Execute UAT packs (`parity_static.md`, `trimmed_smoke.md`, `chart_visual_spec.md`) on the latest deploy and log Pass/Fail with screenshot aliases.
5. Record new learnings in `docs/System/learning-log.md` (topic/finding/evidence/impact/proposal/owner).
6. Update wrapper gaps in `docs/System/WRAPPER_ADOPTION_MATRIX.md` when you add props or behaviour.
7. Capture at least one Playwright artifact per new flow and register it in `docs/SCREENSHOT_INDEX.md`.
8. Summarise work in `docs/SESSION_HANDOFF.md` (include deploy URL, tests, UAT results, learning references).

Keep prior history intact—only edit your row and your sections.
