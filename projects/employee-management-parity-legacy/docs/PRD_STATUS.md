# PRD Status Index

| PRD | Scope | Status | Last Updated | Owner | Notes |
| --- | --- | --- | --- | --- | --- |
| [Phase 1 – Bulk Edit & Tag Parity](Tasks/phase-1-bulk-edit-prd.md) | Matrix bulk edit, tag manager parity, task timeline integration | ✅ Completed | 2025-10-06 | Agent Ops | Implemented in parity repo; verified build/tests; docs & walkthrough refreshed. |
| [Phase 2 – Interaction & Accessibility Parity](Tasks/phase-2-accessibility-and-parity-prd.md) | Row interactions, Esc/focus trap, exports, tag catalogue, timeline parity | ✅ Completed | 2025-10-07 | Agent Ops | VoiceOver sweep logged; NVDA follow-up tracked in TODO. |
| [Phase 3 – CRUD & Data Parity](Tasks/phase-3-crud-and-data-parity-prd.md) | CRUD UI flows, bulk edit completeness, import/export validation | ✅ Completed | 2025-10-07 | Agent Ops | Bulk-edit add/remove flows and Appendix 1/3/4/8 validation landed; persistence note pending backend coordination. |
| [Phase 4 – Accessibility & Final Parity](Tasks/phase-4-accessibility-and-final-parity.md) | Screen-reader audit, matrix hardening, doc refresh | ✅ Completed | 2025-10-07 | Agent Ops | ARIA wiring + Playwright extensions delivered; outstanding NVDA + screenshots tracked in TODO. |
| [Phase 5 – Stabilization & Validation](Tasks/phase-5-stabilization-and-validation-prd.md) | Persistence, validation, copy/accessibility polish | 🟡 In Progress | 2025-10-07 | Agent Ops | Edits now persist with toasts, validation/summary/heading polish live; NVDA sweep + follow-up docs pending. |
| [Phase 6 – Migration Planning](Tasks/phase-6-migration-planning-prd.md) | Component wrapper roadmap (dialogs, table, forms, validation) | 🟢 Planned | 2025-10-07 | Migration Agent (post-Phase 5) | Follows Phase 5 sign-off; uses `migration-prep/` workspace to stage Radix/TanStack/RHF adoption plan. |

**Status legend**: 🟢 Planned · 🟡 In Progress · ✅ Completed · 🔴 Blocked

Update this table whenever a PRD is created, started, or finished (see `docs/SOP/prd-feedback-sop.md`).
