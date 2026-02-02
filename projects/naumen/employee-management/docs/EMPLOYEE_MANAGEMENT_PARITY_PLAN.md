# Employee Management Parity Plan

## 1. Purpose
- Align the `employee-management` demo with the real WFM Employee Management module so the UI can serve as an executable specification for back-end work.
- Provide a checklist and evidence map that browser agents can follow without context loss.
- Keep all build tooling (Vite config, npm scripts) untouched until the UI/ref data updates are complete and verified.

## 2. Evidence Inventory
- **Parity report** (browser agent output): `/home/oai/share/report.md` (mirror into repo for permanence).
- **Internal documentation** (chapter extracts used by browser agent):
  - `/Users/m/Documents/replica/CH3_Employees.pdf`
  - `/Users/m/Documents/replica/CH5_Schedule_Advanced.pdf`
  - `/Users/m/Documents/replica/CH5_Schedule_Build.pdf`
  - `/Users/m/Documents/replica/CH6_Reports.pdf`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CH7_Appendices.md`
- **Screenshots** (stored in `~/Desktop/shots epml mamgnt/`; open with `open "~/Desktop/shots epml mamgnt/<filename>.png"` before working on a feature):
  - `1a43259c-9d43-4ecd-a25b-987334e72fc4.png` – Employee list header & toolbar (display settings, tags, import/export, dismissed toggle, filters).
  - `1e958a67-4c07-48f1-8f6c-b797d9be0f60.png` – Schedule grid view (`/schedule/graph`): employee rows, day columns, shift blocks, KPIs in left column.
  - `37abcec4-2d1c-4732-bc54-d7cdbb1261e8.png` – Schedule graph loading state (spinner, date range controls, queue filters).
  - `638fdb1b-1f4d-4da2-b0c4-167f2550345d.png` – Column picker side drawer (field toggles, save button).
  - `6427ca80-ee3c-4783-b79e-64ca40f4276b.png` – Edit employee drawer (Обязательные поля, Дополнительные поля, save button).
  - `85c56853-a71a-4073-8973-4732e848f165.png` – Edit drawer loading state (skeleton before fields render).
  - `90f0786c-862e-4737-ac8c-7afb2567e962.png` – Edit drawer (optional fields: scheme, skills, tags, contact info) close-up.
  - `b52ecd6a-0028-45fb-a91c-299d97c2eee6.png` – Employee list header/tool bar (spreadsheet icon area to open column picker).
  - `bd20ff73-e081-44c5-a4b9-2db4541e9d23.png` – Employee list (duplicate framing, use with `1a43...` for cross-check).
  - `d1cf682d-ab3d-4417-8223-195716783ad8.png` – Employees module loading state (`Загрузка...`).
  - `d4d86894-87ba-454c-8678-f76c46829fd7.png` – Employees list (reference view).
  - `fafa2f56-7047-4055-8b50-f2475f2af74d.png` – Edit drawer (duplicate reference for field labels).
- **Prototype screenshots** (current mock UI in this repo, `~/Desktop/Screenshot 2025-10-05 ...`):
  - `Screenshot 2025-10-05 at 21.46.05.png` – Quick add wizard step 1 (current implementation: only personal info fields).
  - `Screenshot 2025-10-05 at 21.46.01.png` – Prototype performance dashboard (cards, ranking table, trend placeholder).
  - `Screenshot 2025-10-05 at 21.45.57.png` – Prototype photo gallery (filters, display settings, gallery stats).
  - `Screenshot 2025-10-05 at 21.45.54.png` – Prototype photo gallery loading state (blank shell before cards load).
- **Live product URLs** (require auth):
  - Base: `https://wfm-practice51.dc.oswfm.ru/`
  - Employees: `/employee`
  - Schedule graph: `/schedule/graph`
  - Shifts: `/schedule/shifts`
  - Schemes: `/schedule/schemes`
  - Requests: `/schedule/requests`
  - Reports: `/reports` (and subpaths)

## 3. Current Toolchain Status
- Repo path: `~/git/client/naumen/employee-management`
- Dependencies not yet installed (`npm install` blocked by lingering proxy); fix proxy settings before implementation starts.
- Vite config untouched; keep as-is until we have successful local builds.
- Git remote not configured; plan to push to a new GitHub repository once the first UI slice is complete.

## 4. Current Implementation Snapshot (Code Audit)
- `src/App.tsx` renders tabs (`Список сотрудников`, `Фото галерея`, `Показатели`, `Быстрое добавление`, `Статусы`, `Сертификации`, `Навыки`). Only the photo/performance/quick-add components show content; list tab renders a placeholder card; status/certifications tabs display static “component in development” messages.
- `EmployeeListContainer.tsx`: fetches mock data after timeout, then shows only the placeholder card “Основные компоненты загружены”; no table, filters, or edit drawer. View/filter state objects exist but aren’t used yet.
- `QuickAddEmployee.tsx`: implements a 3-step modal (personal info, job info, success). Lacks many required fields from real wizard (logins, passwords, work scheme, skills, tags). Step validation only covers basic fields; success step auto-closes after timeout.
- `EmployeePhotoGallery.tsx`: fully styled gallery with filters, settings, statistics; currently backed by the same single mock employee dataset.
- `PerformanceMetricsView.tsx`: renders KPI cards, ranking table, and chart placeholder with random trend values; requires real data integration and alignment with actual reports.
- Supporting components (`EmployeeStatusManager`, `CertificationTracker`, etc.) still placeholders (to be reviewed later).
- `src/types/employee.ts` defines extensive data models but duplicates `ViewModes` and `BulkAction` at the bottom; cleanup needed when refactoring.


## 5. Feature Backlog (Delta vs Reality)
| Area | Target (Reality) | Current Mock | Evidence | Required Actions |
| ---- | ---------------- | ------------ | -------- | ---------------- |
| Employee List & Toolbar | Full table, column picker, tag/import/export actions, dismissed toggle, filter chips, row click opens edit drawer | Placeholder headline only | Screenshots `1a43...`, `1e95...`, `37ab...`, `638f...`; report Section “Employee list”; CH3 Employees | Build data grid component, toolbar actions, filter state, row click → drawer |
| Edit Drawer | Required/optional sections, validations, save flow | Not present | Screenshots `638f...`, `6427...`; CH3 Employees | Create drawer UI, align form schema, implement validation |
| Quick Add Wizard | Multi-step flow (names→logins→org structure→scheme/skills→summary) | Single step stub | Screenshots `85c5...`, `90f0...`, `b52e...`; prototype `Screenshot 2025-10-05 at 21.46.05.png`; report “Quick add”; CH3 | Implement stepper, shared schema, validation, summary |
| Filters & Display Settings | Persistent filters, dismissed toggle, saved column settings | Missing | Screenshots `1a43...`, `37ab...`; report; CH3 | Build filter chips, toggle, column settings drawer with local persistence |
| Tags / Import / Export | Manage tags & Excel import/export | Missing | Screenshot `1a43...`; CH7 Appendices; report | Define placeholder dialogs, integrate with future API |
| Photo Gallery | Not in real system (optional add-on) | Exists w/ placeholders | Prototype `Screenshot 2025-10-05 at 21.45.57.png`, `...54.png`; report | Decide to keep (spec backend requirements) or remove |
| Performance Dashboard | Metrics part of reports, not standalone ranking | Custom dashboard | Prototype `Screenshot 2025-10-05 at 21.46.01.png`; report “Performance indicators”; CH6 | Decide to keep & define endpoints or align with actual reports |
| Future Modules | Scheduling, reports, requests | Out of scope currently | Screenshot `1e95...`; CH5/CH6 docs; report sections | Gather evidence, plan later UI pages |

## 6. Prioritised Phases
1. **Environment Fix**
   - Remove SOCKS proxy exports from shell profiles; ensure `npm install`, `npm run build` succeed. (See `docs/ENVIRONMENT_FIX_TODO.md`.)
   - Capture before/after commands in task log.
2. **Data & Types Baseline**
   - Define TypeScript models for employee card (required vs optional fields) using CH3 + screenshot evidence.
   - Create mock data mirroring real fields (login, POS, scheme, tags, etc.).
3. **Employee List & Drawer**
   - Implement table with columns, actions, filters, row drawer.
   - Match label text with real system (using translations from screenshots/docs).
4. **Quick Add Wizard**
   - Build multi-step form with shared validation aligning to real wizard steps.
5. **Top-Bar Utilities**
   - Column settings, tags, import/export, dismissed toggle.
   - Reference Appendix templates for import/export placeholders.
6. **Optional Modules Decision**
   - Photo gallery & performance pages: keep with specs or remove; document rationale.
7. **Evidence Capture for Future Work**
   - Document scheduling/reporting needs (CH5/CH6 references) for later implementation.

## 7. Agent Workstreams (from parity report)
- **Delta detection (200 tasks):** side-by-side comparisons for all prototype tabs.
- **Evidence capture (100 tasks):** document uncovered sections (employee card, scheduling, requests, reports, imports, permissions).
- **Golden journeys (50 tasks):** onboard employee, schedule assignment, request approval, report export, data import.
- Log findings back into this plan (Sections 4 & 9 obligations).

## 8. Implementation Cadence
- Work in feature branches (e.g., `feature/employee-table`).
- For each slice: edit UI → `npm run build` → capture screenshots → update plan → commit.
- Hold off on Vercel deployment until slice 3 completes or stakeholders request preview.
- Once ready: create GitHub repo, push, connect to new Vercel project, deploy.

## 9. QA Checklist (expand per feature)
- [ ] Employee table renders with real column labels.
- [ ] Column picker opens/toggles visibility.
- [ ] Filters show counts/responsive to interactions.
- [ ] Row click opens drawer with required/optional sections.
- [ ] Quick add wizard steps match real workflow.
- [ ] Russian translations match screenshots/docs.

## 10. Open Questions
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
- Incorporate any mandatory steps/macros/logging formats from these docs into agent task templates.

## 12. Next Immediate Steps
1. Confirm screenshot interpretations in Section 2 against parity report.
2. Clean proxy settings and confirm npm toolchain works.
3. Begin Phase 2: define shared form models and mock data.
4. Draft agent task templates using MAGIC PROMPTS/HUMAN_LAYER guidance.
