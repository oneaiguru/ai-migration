# Employee Management Parity Plan (Archived 06 Oct 2025)

> This snapshot preserves the detailed backlog and rollout notes that were in
> `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` prior to the 07 Oct 2025 update.
> Refer to the live plan for the current summary and links.

## 5. Feature Backlog (Delta vs Reality)
| Area | Target (Reality) | Current Mock | Evidence | Required Actions |
| ---- | ---------------- | ------------ | -------- | ---------------- |
| Row interaction & edit drawer | Row click opens drawer (obligatory + optional sections, edit/save/cancel, skills/tags panels) | Row click reloads page; drawer accessible only via direct import | Screenshots `638f...`, `6427...`; CH3 Employees | Wire row click + “Новый сотрудник” CTA to `EmployeeEditDrawer`; pre-fill data; stub save/reset actions |
| Tag management | Dedicated modal to create/assign/remove tags; updates list filters | Info modal only; no assignment | Screenshot `1a43...`; Appendix 6 | Implement mock tag CRUD + assignment state; persist for selected employees |
| Import / Export | File chooser for imports, downloadable CSV/XLSX respecting column visibility | Info modal only | Appendix 1/3/4/8 | Provide stubbed uploads (accept file, show success toast) & CSV download mirroring template headers |
| Quick Add step 3 | Org unit / office / time zone / hour norm editable; wizard advances | Inputs disabled; validation blocks progress | CH3 Quick Add; screenshots `638f...`, `6427...` | Enable fields, set sensible defaults from team, ensure validation passes |
| Quick Add credentials | Suggested WFM login derived from names; external logins captured | Always `ivanov.il`; external logins empty | CH3 Quick Add | Generate login from form data (transliteration), allow edit, capture external logins list |
| Quick Add completion | On success, summary shows data; employee added to list | Wizard cannot finish | Same as above | After step 4, push new mock employee into list state; show success toast |
| Skills UX | Display/prioritise skills & reserve skills; edit modals | Static text only | CH3 Employees; Appendix 3 | Render read-only pills in drawer + quick add summary; add placeholder edit modal with mock state |
| Toolbar persistence | Column visibility, dismissed toggle, active filter chips persist | Works per session only | Screenshots `1a43...` | Store settings in localStorage; display active filter chips matching real UI |
| Optional modules | Clarify status of Photo Gallery / Performance pages | Present as custom dashboards | Prototype screenshots | Document as demo-only until backend scope defined |

### Screenshot Parity Notes (2025-10-06 review)
- Toolbar baseline (`employee-toolbar-topbar.png`): dark header, icon order (display settings → tags → import → export), `51/51` counter, zebra rows, “Показывать уволенных” checkbox.
- Column picker drawer (`reference/column-picker-drawer.png`): title copy, field checklist, “Сохранить изменения” CTA.
- Employee drawer (`reference/edit-drawer-required-fields.png`, `reference/edit-drawer-optional-fields.png`, `reference/drawer-tags-detail.png`): split sections, inline tags render, skills/reserve skills summaries.
- Loading cues (`reference/employee-module-loader.png`, `edit-employee-loading.png`): semi-transparent overlay with spinner while list/drawer loads data.
- Import/export modals (`import-modal.png`, `export-modal.png`) and tag dialog (`tags-modal.png`) confirm copy alignment.

## 6. Prioritised Phases
1. **Employee card wiring** – connect list row + “Новый сотрудник” CTA to the drawer, pre-fill data, mock save/reset.
2. **Toolbar interactions** – implement functional tag modal and import/export stubs; persist column/dismissed state.
3. **Quick add completion** – fix Step 3 validation, improve login generation, render summary, append new mock employee on success.
4. **Skills presentation** – expose skills/reserve skills read-only pills + placeholder edit modals in drawer/wizard.
5. **Agent feedback loop** – rename screenshots for side-by-side comparisons; craft explicit checklist for browser-agent runs.

## 7. Agent Workstreams (next run)
- **Side-by-side delta check:** open real system & prototype, capture each screen (list, drawer, quick add steps, toolbar modals) and log residual differences.
- **Evidence refresh:** capture updated screenshots/templates if gaps remain; drop into screenshot index.
- **Golden journeys:** re-run once blockers addressed to confirm create → edit → schedule → report flows.

## 8. Implementation Cadence
- Work in focused branches per phase (e.g., `feature/drawer-wiring`, `feature/quick-add-finish`).
- For each slice: update UI → `npm run build` → capture screenshots → update docs → commit.
- Deploy to Vercel after major slices; keep change log for handoff.

## 9. QA Checklist (expand per feature)
- [ ] Row click + “Новый сотрудник” open the edit drawer with correct data.
- [ ] Drawer save/cancel shows validation errors for required fields.
- [ ] Tag modal adds/removes tags and updates filter chips.
- [ ] Import modal accepts a file and reports success.
- [ ] Export creates CSV with correct headers respecting column visibility.
- [ ] Quick add drawer (логин/пароль) creates a draft employee and opens the edit drawer.
- [ ] Drawer exposes required fields with validation.
- [ ] Tag manager adds/removes tags across the selection.
- [ ] Массовое редактирование обновляет статус/команду и добавляет комментарий.

## 10. Open Questions (Oct 2025)
- Do we retain Photo Gallery and Performance tabs as custom additions?
- Which backend endpoints will be available first (employees CRUD, tags, import/export)?
- Do we have direct access to download templates from production system? (Appendix references listed.)
- Authentication process for agent testing on real system?
- How do CE MAGIC PROMPTS & HUMAN_LAYER scripts influence task execution?

## 11. Magic Prompt / Human Layer Integration
- Review orchestration guides before starting browser-agent runs:
  - `/Users/m/Downloads/sort later desktop/HUMAN_LAYER_COMPLETE.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`
