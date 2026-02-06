# Forecasting & Analytics – Executor Subtask Template

```
Agent Header
- Agent: <name>
- Role: Executor
- Demo: Forecasting & Analytics
- Repo: ${FORECASTING_ANALYTICS_REPO}
- Active Plan: plans/2025-10-24_forecasting-analytics-refactor.plan.md
- Deploy URL: <url>
- Commit: <sha>
- Outcome: Deploy + UAT Pass + Reports/Checklist/CodeMap updated
```

## Session Checklist
1. Update your row in `docs/Tasks/post-phase9-demo-execution.md` (Agent Assignments & Outcomes).
2. Review the Code Map (`docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`) and append new evidence (wrappers, adapters, tests, UAT notes).
3. Audit existing charts (`AccuracyDashboard`, `TrendAnalysisDashboard`, `ManualAdjustmentSystem`) and note any non-wrapper usage.
4. Add or update adapters in `src/adapters/forecasting/*`; cover calculations with Vitest.
5. Run validations: `npm install`, `npm run build`, `npm test -- --run`, `npm run storybook:build`.
6. Execute UAT packs (`parity_static`, `chart_visual_spec`) on the live deploy; record Pass/Fail with screenshot aliases (`playwright-forecasting-accuracy.png`, etc.).
7. Log learnings in `docs/System/learning-log.md` (topic/finding/evidence/impact/proposal/owner).
8. Update wrapper gaps in `docs/System/WRAPPER_ADOPTION_MATRIX.md` for any new props/patterns.
9. Register Playwright captures in `docs/SCREENSHOT_INDEX.md`.
10. Summarize work + deploy URL in `docs/SESSION_HANDOFF.md` and sync `PROGRESS.md`.

Use `docs/Workspace/Templates/11_Agent_Header_Block.md` and `12_Agent_Handoff_Checklist.md` for final sign-off.
