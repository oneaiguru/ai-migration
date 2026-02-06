## Manager Portal – Parity Execution Task (Outcome‑Based)

Inputs
- Code Map: `docs/Workspace/Coordinator/manager-portal/CodeMap.md`
- Plan: `plans/2025-10-12_manager-portal-refactor.plan.md`
- UAT packs: `docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md, chart_visual_spec.md}`

Do
- Replace Recharts with wrappers; add adapters, RU registrar, tests
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
