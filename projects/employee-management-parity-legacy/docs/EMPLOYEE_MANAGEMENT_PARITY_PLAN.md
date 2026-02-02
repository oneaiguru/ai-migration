# Employee Management Parity Plan

## 1. Purpose
- Align the `employee-management` demo with the real WFM Employee Management module so the UI can serve as an executable specification for back-end work.
- Provide a checklist and evidence map that browser agents can follow without context loss.
- Keep all build tooling (Vite config, npm scripts) untouched until the UI/ref data updates are complete and verified.

## 2. Evidence Inventory
- **Parity report** (browser agent output): `docs/AGENT_PARITY_REPORT.md` (rewritten for build 9o205nrhz).
- **Internal documentation** (chapter extracts used by browser agent):
  - `/Users/m/Documents/replica/CH3_Employees.pdf`
  - `/Users/m/Documents/replica/CH5_Schedule_Advanced.pdf`
  - `/Users/m/Documents/replica/CH5_Schedule_Build.pdf`
  - `/Users/m/Documents/replica/CH6_Reports.pdf`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CH7_Appendices.md`
- **Screenshots** – see `docs/SCREENSHOT_INDEX.md` for alias ↔ filename mapping (all images live in `~/Desktop/shots epml mamgnt/`).
- **Prototype screenshots** (current mock UI in this repo, `~/Desktop/Screenshot 2025-10-05 ...`; open before coding to match spacing/labels):
  - `Screenshot 2025-10-05 at 21.46.05.png` – Quick-add modal step 1; shows progress tracker (1→3), required personal fields (Имя, Фамилия, Email, Телефон) and CTA copy («Далее», «Отмена»). Use as baseline when extending later steps.
  - `Screenshot 2025-10-05 at 21.46.01.png` – Performance dashboard mock; note KPI card order, goal captions, tab toggle (Обзор/Детали/Сравнение), sort dropdown text, and Chart.js placeholder wording.
  - `Screenshot 2025-10-05 at 21.45.57.png` – Photo gallery mock; confirms filter labels, settings toggles (Имена/Должности/Команды/Статусы) and stats footer layout.
  - `Screenshot 2025-10-05 at 21.45.54.png` – Photo gallery skeleton state; keep for loading UX parity.
- **Desktop validation reports** (chronological):
  - `~/Desktop/2025-10-06_13-49_employee-management-parity-analysis.md`
  - `~/Desktop/2025-10-06_13-49_employee-management-parity-demo-remaining-gaps.md`
  - `~/Desktop/2025-10-06_13-57_comparison-real-wfm-vs-parity-demo.md`
  - `~/Desktop/2025-10-06_14-22_employee-management-demo-vs-wfm-delta-analysis.md`
  - `~/Desktop/2025-10-06_23-08_detailed-parity-feedback-employees-module.markdown`
  - `~/Desktop/2025-10-06_23-34_workflow-validation-report.markdown`
  - `~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown` *(latest source for Phase 4 backlog)*
- **Live product URLs** (require auth):
  - Base: `https://wfm-practice51.dc.oswfm.ru/`
  - Employees: `/employee`
  - Schedule graph: `/schedule/graph`
  - Shifts: `/schedule/shifts`
  - Schemes: `/schedule/schemes`
  - Requests: `/schedule/requests`
  - Reports: `/reports` (and subpaths)

## 3. Current Toolchain Status
- Repo path: `~/git/client/employee-management-parity`
- Node requirement: package.json declares `"node": "^18 || ^20"`; we standardise on Node 20.x (see `docs/ENVIRONMENT_FIX_TODO.md`).
- Environment fix completed (proxy exports removed); `npm install` and `npm run build` succeed on the parity repo. Run `npm run preview -- --host 127.0.0.1 --port 4174` **only when explicitly requested by the repo owner**—stop the server as soon as manual checks finish.
- Deployment flow: `vercel deploy --prod --yes` from this repo publishes to `https://employee-management-parity-<id>.vercel.app` (latest: `https://employee-management-parity-9o205nrhz-granins-projects.vercel.app`).
- Build artefacts (`dist/`, `node_modules/`, `.vercel/`) remain ignored; run `npm install` after every fresh clone before invoking `npm run build`.

## 4. Current Implementation Snapshot (Code Audit)
- `src/App.tsx` renders the primary navigation (`Список сотрудников`, `Фото галерея`, `Показатели`, `Статусы`, `Сертификации`, `Навыки`) and hosts the global quick-add drawer. Невнедрённые разделы остаются заглушками, но держат единый стиль без пометок «демо».
- `EmployeeListContainer.tsx` presents the full employee table with filters, icon toolbar (bulk edit/tag/import/export), selection mode, and the edit drawer. The bulk-edit matrix supports status/team/hour norm/work scheme/skills/reserve skills/tags plus comment timelines, enforces the four-tag cap, and validates imports (extensions + required headers for Теги/Отпуска).
- `QuickAddEmployee.tsx` mirrors WFM’s minimal flow (login + password only), seeds a draft employee with default timelines, and immediately opens the full edit drawer for follow-up fields.
- `EmployeePhotoGallery.tsx`: fully styled gallery with filters, settings, statistics; currently backed by the same single mock employee dataset.
- `PerformanceMetricsView.tsx`: renders KPI cards, ranking table, and chart placeholder with random trend values; requires real data integration and alignment with actual reports.
- Supporting components (`EmployeeStatusManager`, `CertificationTracker`, etc.) still placeholders (to be reviewed later).
- `src/types/employee.ts` defines extensive data models but duplicates `ViewModes` and `BulkAction` at the bottom; cleanup needed when refactoring.

### Completed Worklog
- **2025-10-06** – Phase 1 baseline (bulk edit + tag parity) landed: mock dataset expanded, quick add reduced to login/password, toolbar converted to icon buttons, edit drawer enriched with required/optional sections, initial bulk-edit flow stitched in (status/team/comment).
- **2025-10-07** – Phase 2/3 follow-up: selection mode overhaul, scheme-history readout, dismiss/restore parity, tag catalogue with four-tag cap, import validation (extensions + headers), expanded Playwright coverage (selection, tag limit, imports), nav labels aligned with production (no “демо”).
- **2025-10-07** – Phase 4 polish: overlays wired with `aria-labelledby`/`aria-describedby`, VoiceOver sweep logged, bulk-edit add/remove skills/reserve captured in Playwright, and Appendix 1/3/4/8 import validation plus documentation refresh delivered.
- **2025-10-07** – Phase 5 stabilization (partial): employee edits now persist via localStorage with success toast/error handling, edit drawer validations gate save (email/phone/hour norm), tag catalogue persists across refresh, import/export modals render context-specific headings & file prefixes, bulk-edit drawer shows scrollable selection count + change summary, and Playwright covers the new flows. NVDA sweep remains pending hardware access.

See `docs/SESSION_SUMMARY.md` for a chronological narrative and `docs/Archive/` for historical context (pre-Oct 07 builds).
Historical backlog details have been preserved in `docs/Archive/EMPLOYEE_MANAGEMENT_PARITY_PLAN_2025-10-06.md`.

## 5. Open Gaps & Next Steps (toward 95 % parity)
| Area | Reality target | Current state | Owner | Reference |
| --- | --- | --- | --- | --- |
| NVDA sweep | Cross-platform screen-reader audit (VoiceOver + NVDA) | VoiceOver logged; NVDA run pending hardware access | Next Agent | `docs/SESSION_HANDOFF.md`, Phase 4 doc |
| Evidence refresh | Screenshot updates + archive hygiene | Selection banner / dismiss timeline / tag-limit alert screenshots outstanding; need to archive pre-Oct 07 reports with forward links | Next Agent | `docs/SCREENSHOT_INDEX.md`, `docs/Archive/` |

> Note: Front-end persistence now mirrors WFM behaviour (Phase 5); backend integration remains future scope once APIs are available.

See `docs/Tasks/phase-4-accessibility-and-final-parity.md` for the detailed task list, line ranges, and evidence links. The comprehensive audit (`~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`) remains the canonical gap report.
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
  - `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`
- Incorporate any mandatory steps/macros/logging formats from these docs into agent task templates.

## 12. Next Immediate Steps
1. Capture the remaining screenshots (selection banner, dismiss/restores timeline, tag-limit alert) and register aliases in `docs/SCREENSHOT_INDEX.md`.
2. Schedule the NVDA accessibility sweep to mirror the logged VoiceOver results; append notes to `docs/SESSION_HANDOFF.md`.
3. Align with product on the next parity module (Schedule/Reporting) and spin up the Phase 5 PRD skeleton once scope is confirmed.
