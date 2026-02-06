# Task — Employee Portal Parity Remediation (UAT 2025-11-02)

## Context & Inputs
- Live audit: `docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md`
- Current repo: `${EMPLOYEE_PORTAL_REPO}` (`main` branch)
- Manuals & screenshots: `${MANUALS_ROOT}/process/chapters/{CH2_Login_System.md, CH3_Employees.md, CH5_Schedule_Advanced.md, CH7_Appendices.md}` + `~/Desktop/employee-portal-manual-pack/images/`
- Supporting parity vision: `docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md`
- Latest scout dossier: `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Gap_2025-10-31.md`
- Active remediation plan (pre-work-structure): `plans/2025-11-01_employee-portal-parity-remediation.plan.md`

## Goal
Restore the Employee Portal demo to full parity with the real Naumen portal as described in the audit. Ship a new production deploy where the Work Structure drawer, vacation history/export tools, and Appendix 1 profile fields function exactly as documented, with RU localisation preserved end-to-end.

## Deliverables
- Updated source in `${EMPLOYEE_PORTAL_REPO}` implementing missing behaviours
- Passing validations (`npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run test -- --run`)
- Production deploy (`vercel deploy --prod --yes`) with URL captured in `docs/SESSION_HANDOFF.md`
- Documentation updates: `docs/Workspace/Coordinator/employee-portal/CodeMap.md`, `docs/Tasks/uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/System/{DEMO_PARITY_INDEX.md, WRAPPER_ADOPTION_MATRIX.md, CHART_COVERAGE_BY_DEMO.md, APPENDIX1_SCOPE_CROSSWALK.md}`, `docs/System/learning-log.md`, `docs/SESSION_HANDOFF.md`, `PROGRESS.md`
- Refreshed UAT packs and screenshots (parity_static.md, trimmed_smoke.md; assets under `docs/Screenshots/employee-portal/`)

## Required Reading Order
1. `PROGRESS.md`
2. `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`
3. `${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
4. `docs/SOP/task-author-sop.md` (new role guidance)
5. `docs/SOP/code-change-plan-sop.md` (Exploration section), `docs/SOP/plan-execution-sop.md`
6. `docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md`
7. `docs/Workspace/Coordinator/employee-portal/Visio_Parity_Vision.md`
8. `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Gap_2025-10-31.md`
9. Manuals `CH2`, `CH3`, `CH5`, `CH7` + screenshot pack (match each failing feature to manual evidence)

## Scope & Acceptance Criteria
### Header / Work Structure Drawer
- **Implement / verify** `🗂️ Рабочая структура` trigger in `src/components/Layout.tsx` renders in the live build; button opens the drawer defined in `src/components/WorkStructureDrawer.tsx`
- Drawer must include: search index, hierarchy trail, contacts/emergency info, timezone formatting (`src/components/WorkStructureDrawer.tsx:20-188`)
- Selecting a node updates portal context via `src/components/OrgSelectionContext.tsx` and reflects in header/footer
- Ensure mock data exposes `structureTree`, `structureIndex`, `emergencyContact`, `workSettings`, etc. (`src/data/mockData.ts`)

### Vacation Requests — History & Export
- Add toolbar actions for “Заявки за период” dialog and CSV export in `src/pages/VacationRequests.tsx`
- History dialog shows timeline per CH5 §5.4.1 with RU date formatting (`src/pages/VacationRequests.tsx:524-673` expected)
- CSV export produces RU headers and values (`src/utils/export.ts` if reused) and shows confirmation toast
- Date pickers use RU placeholders (“дд.мм.гггг”) and default to RU locale strings

### Profile — Appendix 1 & Persistence
- Tabs: Личные данные / Контакты / Рабочие настройки / Адрес / Экстренный контакт (five tabs)
- Appendix 1 fields: personnel number, portal login, telephony ID, external systems, calendar scheme history, message preferences; validations on required fields
- Save action persists edits in component state, resets on cancel, emits toast/banner “Профиль сохранён”
- Ensure Org selection badge reflects drawer selection (integration with context)

### Localisation & UX
- Replace English placeholders and copy in dialogs (e.g., date inputs)
- Confirm all new toasts/tooltips use RU text and existing token styles
- No console warnings beyond known Radix `act()` notices during tests

### Documentation & Evidence
- Update parity crosswalks and learning log with new evidence (file:line refs)
- Provide UAT prompt + bundle following `docs/SOP/uat-prep-package.md` (trimmed to text references if screenshots already captured)

## Role Handoff Expectations
### Scout
- Validate the audit findings against current code; record file:line evidence in a new discovery doc (`docs/Workspace/Coordinator/employee-portal/Scout_Parity_Remediation_2025-11-02.md`)
- Cross-reference manuals/screenshots; flag any additional gaps or risks
- Update `docs/SESSION_HANDOFF.md` with summary + blockers

### Planner
- Read scout doc, manuals, vision, plan SOP
- Produce execution plan `plans/2025-11-02_employee-portal-parity-remediation.plan.md` covering domain updates, UI changes, tests, docs, validation & rollback
- Log handoff entry and mark plan active in `PROGRESS.md`

### Executor
- Follow plan precisely; run validations; deploy via Vercel
- Update parity docs, UAT packs, screenshot index, CodeMap
- Record outcomes + URL in `docs/SESSION_HANDOFF.md` and `PROGRESS.md`

## Testing & Validation
- `npm_config_workspaces=false npm run lint` (if configured)
- `npm_config_workspaces=false npm run build`
- `npm_config_workspaces=false npm run test -- --run`
- Manual smoke: verify Work Structure drawer, history dialog, CSV export, profile edits in local preview (`npm run dev -- --port 4180`)
- UAT packs: `docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/trimmed_smoke.md`

## Risks & Mitigations
- **Risk:** Drawer/search may rely on mock data not seeded → ensure `mockEmployee` data includes all fields.
- **Risk:** CSV export may break on RU characters → reuse existing CSV utilities, add Vitest coverage.
- **Risk:** Profile persistence limited to client state → document as demo-only; ensure toast communicates limitation.

## Completion Checklist
- [ ] Discovery doc created with manual + code evidence
- [ ] Plan authored and logged
- [ ] Code/tests/docs updated; build + tests pass
- [ ] Vercel deploy completed; URL recorded
- [ ] UAT prompt/bundle prepared; findings logged
- [ ] `docs/System/learning-log.md` entry appended
- [ ] `docs/System/WRAPPER_ADOPTION_MATRIX.md` updated if new wrapper behaviour added
