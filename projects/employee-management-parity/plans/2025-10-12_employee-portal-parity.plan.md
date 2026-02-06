# Plan — WFM Employee Portal Parity (Forms/Tables)

## Goal
Wire behaviors/validations/RU formatting for forms/tables/dialogs using shared wrappers (ReportTable, Dialog, FormField, FilterGroup). No charts.

## Inputs
- Decision: docs/System/DEMO_EXECUTION_DECISION.md
- Evidence: docs/System/DEMO_PARITY_INDEX.md, docs/System/PARITY_MVP_CHECKLISTS.md,
  docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/APPENDIX1_SCOPE_CROSSWALK.md

## Scope
- Dashboard: stat cards, vacation balance, recent requests list
- Vacation Requests: tabs (filters), requests list, New Request dialog
- Profile: personal/contact/work tabs, emergency contact block, save/cancel

## Tasks
1) RU locale consistency (toLocaleDateString('ru-RU')); number/date format helpers
2) Form validation schemas: requireds for New Request (type/start/end); Profile fields
3) ReportTable columns + sorting/filter behavior for requests list
4) Dialog/form wiring for New Request (submit → item appears)
5) Save/Cancel behavior for Profile edit (update/rollback)
6) Stories for table/dialog/forms; tests for validation + RU formatting
7) UAT: trimmed_smoke and parity_static runs; log unknowns in chart_visual_spec (forms section)

## Acceptance
- Behaviors validated via UAT packs; tests pass; build green
- Appendix 1 mapping statuses confirmed with path:line evidence
- Unknowns (validation/masks/wording) documented

## References
- RU date formatting and strings: src/pages/Dashboard.tsx:62; src/pages/VacationRequests.tsx:119, :124; src/pages/Profile.tsx:41
- New Request requireds: src/pages/VacationRequests.tsx:289, :309, :321; buttons: :376, :383
- Profile requireds: src/pages/Profile.tsx:183, :199, :215; emergency phone: :273
