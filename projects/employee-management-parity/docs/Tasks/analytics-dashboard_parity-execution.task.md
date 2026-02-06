## Analytics Dashboard – Parity Execution Task (Outcome‑Based)

Inputs
- Code Map: `docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md`
- Plan: `plans/2025-10-12_analytics-extraction.plan.md`
- UAT packs: `docs/Tasks/uat-packs/{parity_static.md, chart_visual_spec.md}`

Do
- Extract CDN/inline → React components using wrappers; RU registrar; tests
- Build + deploy; run UAT packs on the new URL
- Update System reports + Checklist + CodeMap; add handoff entry

Deliver
- Deploy URL + Commit SHA
- UAT Pass/Fail tables + screenshot aliases
- Updated docs (reports, checklist, CodeMap, handoff)

Done‑When
- All in‑scope UAT checks = Pass
- No console errors
- Reports/Checklist/CodeMap updated
