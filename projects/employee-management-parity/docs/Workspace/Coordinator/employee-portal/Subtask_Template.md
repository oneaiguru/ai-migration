# WFM Employee Portal – Executor Subtask Template

Paste the header, then fill details. Work to the outcome; no timebox required.

Agent: <name> · Role: Executor · Demo: Employee Portal
Start: <YYYY‑MM‑DD HH:mm> · ETA: <YYYY‑MM‑DD>
Repo: ${EMPLOYEE_PORTAL_REPO}
Plan: plans/2025-10-12_employee-portal-parity.plan.md · Deploy: <url> · Commit: <sha>

Scope (this pass)
- Wire behaviours for forms/tables/dialogs (ReportTable, Dialog, FormField, FilterGroup)
- RU dates/numbers; validations/masks per CH3/Appendix 1
- Build + deploy; run UAT packs: docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md}

Artifacts to update (per pass)
- Code Map: docs/Workspace/Coordinator/employee-portal/CodeMap.md (file:line evidence)
- System reports: docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, CHART_COVERAGE_BY_DEMO.md, APPENDIX1_SCOPE_CROSSWALK.md}
- Canonical checklist: docs/Reports/PARITY_MVP_CHECKLISTS.md (sync System mirror)
- Handoff + progress: docs/SESSION_HANDOFF.md, PROGRESS.md
- Screenshots: docs/SCREENSHOT_INDEX.md (add aliases)
- Learning log: docs/System/learning-log.md (3–5 concise entries)

Acceptance (behaviour only)
- Forms/dialogs behave per CH3; RU formats; no console errors
- UAT packs Pass

Notes / Risks
- Tailwind v3 lock; SPA fallback rewrite; Radix Dialog test warnings (log to learning‑log)

Result Summary
- Deployed: <url> · Commit: <sha>
- UAT: Pass/Fail snapshot + packs used
- Docs updated: System reports + Checklist + CodeMap + Handoff

Evidence
- Screenshot aliases used, key file:line refs
