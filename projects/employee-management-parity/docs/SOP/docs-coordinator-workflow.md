# SOP – Docs/Coordinator Workflow (Multi‑Demo)

## Scope
Prepare decision‑ready documentation for target demos without changing code. Use the staging workspace; merge into canonical docs only after review.

## Sources
- Demo paths (read‑only): see `docs/System/DEMO_PARITY_INDEX.md`
- Contract docs: `/Users/m/Documents/wfm/main/deliverables/frame-002/module-employee-management/final_package/ru/` (Appendix 1, CH5, CH6)

## Staging vs Canonical
- Staging: `docs/Workspace/Coordinator/<demo>/Drafts/*` (agents write here)
- Canonical (orchestrator merges): `docs/System/*.md`, `docs/Tasks/uat-packs/*.md`, `docs/SOP/demo-refactor-playbook.md`, `docs/Tasks/screenshot-checklist.md`

## Evidence Rules
- Use path:line (single line) for code (e.g., `src/pages/Dashboard.tsx:126`)
- Cite CH §section for every slot/MVP item
- If unknown/ambiguous, mark as UAT unknown with a pointer

## Deliverables (per demo)
- Reports: DEMO_PARITY_INDEX, PARITY_MVP_CHECKLISTS, WRAPPER_ADOPTION_MATRIX, CHART_COVERAGE_BY_DEMO, APPENDIX1_SCOPE_CROSSWALK
- UAT Packs: parity_static, trimmed_smoke, chart_visual_spec
- Playbook: demo‑refactor‑playbook (append a section)
- Screenshot checklist: add demo items
- Handoff: append summary in `docs/SESSION_HANDOFF.md`

## Order of Work
1. Validate demo path; scan package.json/pages for screens
2. Define screens + feature slots (KPI/Line/Bar/Table/Dialog/Filters)
3. Populate Drafts with facts (path:line + CH refs)
4. Update UAT packs and screenshot checklist
5. Log handoff summary

## Acceptance (per demo)
- Reports updated with citations; ≥1 mapped screen in wrapper matrix (props: units/clamps/toggles/targets)
- Chart coverage row present; Appendix 1 mapping status set with evidence
- UAT packs + playbook section appended; screenshots listed
- No code changes

## Merge Procedure (Orchestrator)
1. Review Drafts for evidence quality
2. Copy Drafts into canonical docs (preserving structure)
3. Update `docs/SESSION_HANDOFF.md` with links to merged sections
4. Queue execution plans (parity‑first/refactor‑first) as per `docs/System/DEMO_EXECUTION_DECISION.md`
