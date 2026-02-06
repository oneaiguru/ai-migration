# Phase 8 Triple UAT Brief – Legacy vs Demo vs Trimmed Production

> **Status:** Planned – assign to AI UAT agent once trimmed production build is ready for review.

## Objective
Validate that:
1. The full parity demo (`employee-management-parity`) remains regression free against the legacy production system.
2. The trimmed production repo (`granin/employee-management-production`) delivers the Employees-only experience without losing contractual functionality.
3. Any intentional differences between the trimmed build and the legacy product are documented with evidence (screenshots, notes, references).

## Targets & URLs
| Build | Location | Notes |
| --- | --- | --- |
| Legacy Production | Refer to parity plan: `https://wfm-practice51.dc.oswfm.ru/employee` | Use provided OIDC credentials (`user20082025` / `user20082025`). |
| Parity Demo (Full) | `https://employee-management-parity-9o205nrhz-granins-projects.vercel.app` | Six-tab navigation with demo modules intact. |
| Trimmed Production | `https://employee-management-production-crvewjvky-granins-projects.vercel.app` | Employees tab only; built from `granin/employee-management-production`. |

## Credentials & Setup
- Use the standard parity login macro (Ctrl+L → paste OIDC URL → credentials above).
- Clear browser storage between runs (localStorage/sessionStorage) to avoid cross-build persistence.
- For Vercel previews, confirm build ID in the header (`vercel env pull` not required).

## Test Matrix
Evaluate both parity demo and trimmed production against the legacy reference. Record a **Yes/No regression verdict** per area; attach screenshot links or notes.

| Area | Legacy baseline | Parity Demo | Trimmed Production | Notes |
| --- | --- | --- | --- | --- |
| Navigation | 6 tabs | 6 tabs | 1 tab (Employees) | Confirm intentional trims only. |
| Employee list load | ✅ |  |  | Check data parity, row count, column defaults. |
| Row selection & toolbar | ✅ |  |  | Verify selection banner, bulk actions, icon enablement. |
| Quick add flow | ✅ |  |  | Ensure login/password draft behaviour matches legacy. |
| Edit drawer | ✅ |  |  | Required fields, validation, timeline updates. |
| Bulk edit matrix | ✅ |  |  | Add/replace/remove skills, tags, status updates. |
| Import/Export modals | ✅ |  |  | Header copy, validation messages, file prefixes. |
| Tag manager | ✅ |  |  | Four-tag limit, persistence after refresh. |
| Dismiss / Restore timeline | ✅ |  |  | Confirm toasts, log entries, row visibility. |
| Accessibility spot-check | ✅ |  |  | Screen-reader labels, focus return on modal close. |
| Other (specify) |  |  |  | Add any newly discovered flows. |

**Deliverables:**
- Two regression verdicts (`Parity Demo vs Legacy`, `Trimmed Production vs Legacy`).
- Trimmed-specific delta list (only Employees tab; document anything else found).
- Screenshot bundle (see checklist below) with filenames recorded in `docs/SCREENSHOT_INDEX.md`.

## Screenshot Checklist (Trimmed Production)
Capture the following from `https://employee-management-production-…`:
1. Employees list default state (no modals). File alias suggestion: `trimmed-employees-list.png`.
2. Selection mode engaged with toolbar active (`trimmed-selection-mode.png`).
3. Bulk edit drawer open showing change summary (`trimmed-bulk-edit.png`).
4. Quick add modal step (login/password) and follow-on edit drawer (`trimmed-quick-add.png`, `trimmed-edit-drawer.png`).
5. Tag manager catalogue with four-tag limit warning (`trimmed-tag-manager.png`).
6. Import modal (Employees CSV) and Export modal (Tags) headers (`trimmed-import.png`, `trimmed-export.png`).
7. Dismiss/Restore timeline within edit drawer (`trimmed-timeline.png`).

**Instructions:**
- Store screenshots under `~/Desktop/shots epml mamgnt/trimmed/` (create if missing).
- After capture, update `docs/SCREENSHOT_INDEX.md` with alias → filename mapping in both repos if reused.
- Note any UI differences versus legacy alongside each screenshot.

## Reporting Template
When complete, append findings to `docs/SESSION_HANDOFF.md` (both repos) and attach the regression matrix. Include:
- Summary verdicts.
- High-priority regressions (if any) with file/line references.
- Links to screenshots and Playwright logs if re-running tests was required.

## Follow-ups After UAT
- If regressions are found, open tasks under `docs/Tasks/` with evidence.
- If trimmed build passes, schedule documentation refresh (README snippet, roadmap updates) and commence screenshot updates for public artifacts.

Assign this brief to the AI UAT agent once the trimmed deployment URL is confirmed stable.
