# Plan — Employee Portal Localization Polish & UAT Follow-Through

## Metadata
- Trigger: UAT report `/Users/m/Desktop/z.markdown` (2025-11-02 parity pass)
- Scope owner: employee-portal-plan-2025-11-03-codex
- Source context: `docs/Tasks/employee-portal_parity-remediation-2025-11-02.task.md`, `docs/Workspace/Coordinator/employee-portal/CodeMap.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md}`
- Repo: ${EMPLOYEE_PORTAL_REPO}

## Desired End State
All employee self-service flows ship fully localised RU UI, matching Naumen behaviour. Date inputs display `дд.мм.гггг` consistently, validation/tooltips/toasts are Russian only, and parity/UAT docs no longer flag localisation gaps. Validation runs (`npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run test -- --run`) succeed, production deploy is refreshed, and parity_static/trimmed_smoke get updated to Pass with new evidence.

## Phase 1 – Localisation Audit & String Catalogue

### Actions
1. Grep the codebase for English placeholders/messages to build a list of offenders.
   ```bash
   rg --pretty "mm/dd/yyyy|Please|Enter|Invalid" src
   ```
2. Record each occurrence (file:line) in a working table (planner note) and map to the correct RU copy from Appendix 1 / parity packs.
3. Confirm the current format helper usage (`src/utils/format.ts`) and note any missing helpers (e.g., toast text).

### Output
- Annotated checklist of localisation fixes to implement in Phase 2/3.

## Phase 2 – Date Field RU Placeholder Implementation

### Approach
Browsers ignore `placeholder` for native `type="date"`. Introduce a lightweight `DateField` wrapper that renders a text input with RU mask but falls back to native picker when supported.

### Changes
1. Create `src/components/inputs/DateField.tsx`:
   - Accept props `{ id, label, value, onChange, min, max, errorId, hasError }`.
   - Render an `input type="text"` with `placeholder="дд.мм.гггг"`, `inputMode="numeric"`, and `pattern="\\d{2}\\.\\d{2}\\.\\d{4}"`.
   - On focus, switch to native date picker if available (set `type` to `date`, restore on blur).
   - Format incoming value to `yyyy-MM-dd` when issuing the change event.
2. Replace existing `<input type="date">` usages in `src/pages/VacationRequests.tsx` and new-request form with `DateField`.
   - Files/lines: `VacationRequests.tsx:674-715`, `:782-804`.
3. Update tests (`src/__tests__/VacationRequests.test.tsx`) to interact with the new field via label text.

### Validation
- `npm_config_workspaces=false npm run test -- --run src/__tests__/VacationRequests.test.tsx`

## Phase 3 – RU Copy for Validation/Tooltips/Toasts

### Changes
1. Centralise copy in `src/locale/ru.ts` (new file) with keys for errors, tooltips, and toasts.
2. Update:
   - `src/pages/VacationRequests.tsx` (validation messages + export toast).
   - `src/pages/Profile.tsx` (validation/toast strings).
   - Any inline English strings surfaced in Phase 1.
3. Ensure toasts invoke RU text via locale helper.
4. Extend unit tests to assert RU toast content where relevant (`VacationRequests.test.tsx`, `Profile.test.tsx`).

## Phase 4 – Documentation & UAT Updates

### Docs to Refresh
- `docs/Tasks/uat-packs/parity_static.md` (clear localisation TODO note).
- `docs/Tasks/uat-packs/trimmed_smoke.md` (update instructions for date placeholder check).
- `docs/Workspace/Coordinator/employee-portal/CodeMap.md` (cite new `DateField` component + locale file).
- System reports & logs: `docs/System/{PARITY_MVP_CHECKLISTS.md, WRAPPER_ADOPTION_MATRIX.md, DEMO_PARITY_INDEX.md, learning-log.md}`, coordinator findings `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md`, tracker `docs/Tasks/post-phase9-demo-execution.md`.

### Evidence
- Capture fresh screenshots for `portal-vacation-history.png` and any new copy the tester checks.

## Phase 5 – Validation & Deploy

1. `npm_config_workspaces=false npm run build`
2. `npm_config_workspaces=false npm run test -- --run`
3. Optional lint: `npm_config_workspaces=false npm run lint` (if available).
4. Manual smoke (`npm run dev -- --port 4180`): confirm date fields display RU placeholder, toasts read RU text.
5. Deploy: `vercel deploy --prod --yes`.
6. Rerun UAT packs (`parity_static.md`, `trimmed_smoke.md`) on the new URL; update findings template, parity packs, and screenshot index.

## Rollback Strategy
- Revert `DateField.tsx` and all touched files via `git checkout -- <file>`.
- Restore locale file if needed and redeploy previous production commit (per `docs/SESSION_HANDOFF.md`).

## Post-Execution Handoff Checklist
- Update `PROGRESS.md` (Active Plan status + Test Log entries).
- Append plan completion to `docs/SESSION_HANDOFF.md` with validation commands and deploy URL.
- Ensure parity packs & findings reflect Pass state with localisation confirmed.
