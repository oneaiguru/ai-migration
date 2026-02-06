# Task — Orchestrator: Merge Portal Drafts + Queue Execution Plans

## Objective
Merge WFM Employee Portal Drafts into canonical reports, log handoff, update PROGRESS, and queue execution plans per decision record. No code changes.

## Inputs
- Drafts (staging):
  - docs/Workspace/Coordinator/employee-portal/Drafts/RU_LABELS.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/DEMO_PARITY_INDEX.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/PARITY_MVP_CHECKLISTS.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/WRAPPER_ADOPTION_MATRIX.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/CHART_COVERAGE_BY_DEMO.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/APPENDIX1_SCOPE_CROSSWALK.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/UAT_chart_visual_spec.md
  - docs/Workspace/Coordinator/employee-portal/Drafts/screenshot-checklist.md
- Canonical targets:
  - docs/System/*.md, docs/Tasks/uat-packs/*.md, docs/SOP/demo-refactor-playbook.md, docs/Tasks/screenshot-checklist.md
- Decision: docs/System/DEMO_EXECUTION_DECISION.md

## Steps
1) Review Drafts for path:line and CH § evidence quality
2) Merge into canonical docs (overwrite or append as needed); keep structure
3) Append a short “Portal merge complete” note to docs/SESSION_HANDOFF.md with links
4) Update PROGRESS.md: add “Docs/Coordinator pass complete for Manager Portal, Analytics Dashboard, and WFM Employee Portal; execution planning queued via DEMO_EXECUTION_DECISION.md”
5) Queue execution plans:
   - plans/2025-10-12_manager-portal-refactor.plan.md
   - plans/2025-10-12_analytics-extraction.plan.md
   - plans/2025-10-12_employee-portal-parity.plan.md

## Acceptance
- Canonical docs reflect Portal Drafts; SESSION_HANDOFF updated; PROGRESS updated
- Three plan files exist with actionable steps and acceptance criteria
- No code changes
