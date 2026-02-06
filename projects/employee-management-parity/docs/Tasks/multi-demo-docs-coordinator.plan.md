# Multi‑Demo Documentation Plan – Docs/Coordinator

## Objective
Prepare decision‑ready documentation for Demos #3–#5 so we can start parallel work immediately after Scheduling (Demo #2).
No code changes — documentation only.

## Targets (confirm and extend if needed)
- Manager Portal: /Users/m/Documents/wfm/main/intelligence/naumen/manager-portal-demo
- Analytics Dashboard: /Users/m/Documents/wfm/main/intelligence/naumen/analytics-dashboard-demo
- WFM Employee Portal: /Users/m/Documents/wfm/main/intelligence/naumen/wfm-employee-portal

## Required Reading (local docs)
- CH5 (Schedule) – docs/Reference/CH5_Scheduling_UAT_Notes.md (UAT notes copy) and original: /Users/m/Documents/wfm/main/deliverables/frame-002/module-employee-management/final_package/ru/
- CH6 (Reports): /Users/m/Documents/wfm/main/deliverables/frame-002/module-employee-management/final_package/ru/
- Appendix 1: /Users/m/Documents/wfm/main/deliverables/frame-002/module-employee-management/final_package/ru/wfm_appendix_1.md

## Deliverables (edit these files in this repo)
- docs/System/DEMO_PARITY_INDEX.md – add/update rows per demo
- docs/System/PARITY_MVP_CHECKLISTS.md – must‑have parity slots per screen (used for reuse scoring)
- docs/System/WRAPPER_ADOPTION_MATRIX.md – screen → slot → wrapper + props (unit, clamps, toggles, targets) + CH refs
- docs/System/CHART_COVERAGE_BY_DEMO.md – which CH5/CH6 visuals exist per demo
- docs/System/APPENDIX1_SCOPE_CROSSWALK.md – Appendix 1 features mapped to implemented/deferred per demo
- docs/Tasks/uat-packs/parity_static.md, trimmed_smoke.md, chart_visual_spec.md – add demo‑specific prompt blocks
- docs/SOP/demo-refactor-playbook.md – append a section for the demo (registrar + wrappers + stories/tests + acceptance)
- docs/Tasks/screenshot-checklist.md – list the exact screens to capture for the demo

## Evidence & Citation Rules
- Use workspace‑relative or absolute path:line (no ranges). Example: src/pages/Dashboard.tsx:22
- For engines/labels, cite file:line showing imports and RU strings.
- For parity items, cite CH page/section (e.g., CH5 §Day/Period toggle).

## Slot Definition (for reuse %)
- Use the parity MVP list as slots for each target screen (e.g., "Line chart", "Bar chart", "KPI grid", "Report table", "Dialog", "Filters").
- One component type per slot; define slots before any refactor begins.

## Order of Work
1) Validate the target demo path and read CH5/CH6 + Appendix 1 references.
2) Inventory features/routes/components; define screens and slots.
3) Populate the reports listed under Deliverables with file:line evidence and CH refs.
4) Update UAT packs with demo‑specific blocks and screenshot checklist.
5) Add a summary entry to docs/SESSION_HANDOFF.md referencing the updated sections.

## Acceptance
- DEMO_PARITY_INDEX.md updated for all three demos
- PARITY_MVP_CHECKLISTS.md filled with slots per screen
- WRAPPER_ADOPTION_MATRIX.md includes at least one mapped screen per demo with props and CH refs
- CHART_COVERAGE_BY_DEMO.md lists visuals present/missing
- APPENDIX1_SCOPE_CROSSWALK.md updated per demo
- UAT packs contain demo‑specific prompt blocks
- No code changes were made
