# Analytics Dashboard – Executor Subtask Template

Paste the header, then fill details. Work to the outcome; no timebox required.

Agent: <name> · Role: Executor · Demo: Analytics
Start: <YYYY‑MM‑DD HH:mm> · ETA: <YYYY‑MM‑DD>
Repo: ${ANALYTICS_REPO}
Plan: plans/2025-10-12_analytics-extraction.plan.md · Deploy: <url> · Commit: <sha>

Scope (this pass)
- Extract CDN/inline charts → React components using wrappers (LineChart, DoughnutGauge, HeatmapChart, RadarChart, ReportTable, KpiCardGrid)
- Wire RU registrar and formatters; add tests/stories from plan
- Build + deploy; run UAT packs: docs/Tasks/uat-packs/{parity_static.md, chart_visual_spec.md}

Artifacts to update (per pass)
- Code Map: docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md (file:line evidence)
- System reports: docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, CHART_COVERAGE_BY_DEMO.md, APPENDIX1_SCOPE_CROSSWALK.md}
- Canonical checklist: docs/Reports/PARITY_MVP_CHECKLISTS.md (sync System mirror)
- Handoff + progress: docs/SESSION_HANDOFF.md, PROGRESS.md
- Screenshots: docs/SCREENSHOT_INDEX.md (add aliases)
- Learning log: docs/System/learning-log.md (3–5 concise entries)

Acceptance (behaviour only)
- No CDN/inline; wrappers only
- RU formatting, no console errors
- UAT packs Pass

Notes / Risks
- Secondary axis/targets requirements (log gaps to WRAPPER_ADOPTION_MATRIX.md)

Result Summary
- Deployed: <url> · Commit: <sha>
- UAT: Pass/Fail snapshot + packs used
- Docs updated: System reports + Checklist + CodeMap + Handoff

Evidence
- Screenshot aliases used, key file:line refs
