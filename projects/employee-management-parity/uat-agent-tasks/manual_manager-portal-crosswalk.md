# Manager Portal Demo × NAUMEN Manual Crosswalk

Use this guide with the live build (`https://manager-portal-demo-80u2ylmlg-granins-projects.vercel.app`) so the UAT agent can jump straight from demo screens to the matching sections of the NAUMEN processing manual. File names below refer to the chapters in `/process/chapters/`.

## Quick Start
1. Log in as described in **CH2_Login_System.md §2.1–2.2** (web entry, top navigation bar, organisational "Рабочая структура").
2. Pin the three UAT packs for task flow reference:
   - `parity_static.md` – slot inventory
   - `trimmed_smoke.md` – live smoke checklist
   - `chart_visual_spec.md` – behaviour-only chart validation

## Feature → Manual Mapping

| Demo feature / user goal | Where to look in demo | Manual section(s) to read | Key takeaways for real system navigation | Notes / gaps |
| --- | --- | --- | --- | --- |
| Access NAUMEN WFM workspace | Global header (user avatar, menu tabs) | **CH2_Login_System.md §2.1–2.3** | Covers web login, notification prompt, top-level tabs, “Рабочая структура” side menu, profile panel. | Required starting point for every walkthrough. |
| Work structure / organisation tree | Layout header → кнопка «Рабочая структура» + Drawer | **CH2_Login_System.md §2.2** | Drawer теперь доступен в демо: выберите подразделение и убедитесь, что Dashboard/Approvals/Teams фильтруются. | Подтвердите названия подразделений против структуры в реальной системе. |
| Understand employee counts & profiles (supports KPI tiles) | Dashboard → KPI cards; Teams → member lists | **CH3_Employees.md §3.0–3.1** | Explains employee list grid, profile cards, required fields, skill assignment, and how work schemes tie into totals. | No direct "Total employees" widget in manual; use list export/profile view as analog. |
| Review pending absence / schedule-change requests | Dashboard → “Pending requests” KPI; Approvals tab | **CH5_Schedule_Advanced.md §5.4** | Step-by-step for opening the “Заявки” section, filtering, approving/rejecting, bulk actions, request history. Mirrors Approvals table + dialog. | Manual also covers shift exchange tab; note whether demo exposes it (currently no). |
| Inspect upcoming vacations / balance impact | Dashboard → “Upcoming vacations” KPI; Approvals dialog (shift handling) | **CH5_Schedule_Advanced.md §5.4.1 (Vacation example)** | Shows how approved requests adjust schedules, including options to delete/transfer shifts when approving vacation. | Highlight to agent that demo’s KPI summarizes same data the manual reviews in detail. |
| View team staffing & drill into team members | Teams tab | **CH2_Login_System.md §2.2** (structure) + **CH3_Employees.md** (profiles) | Navigation panel lets managers jump to organisational units; profiles describe member composition and skills (mirrors Teams card data). | Manual lacks a dedicated “Teams dashboard”; use structure + employee filters to reproduce. |
| Monitor coverage / workload metrics | Dashboard → “Team Coverage” bar chart | **CH6_Reports.md §6.2 (Work Schedule)** & §6.4 (Deviation reports) | Reports chapters explain generating workload/coverage outputs from “Отчеты”. Use them to validate the percentages the bar chart summarizes. | No one-click chart in manual; agent must run reports and compare numbers. |
| Analyse request distribution by type | Dashboard → “Request Distribution” pie | **CH5_Schedule_Advanced.md §5.4 (Request Information Display)** | Table columns include request type, comments, submission dates; pairs with manual to confirm type counts and comments reflected in chart. | Manual doesn’t include visual pie; rely on request filters + exports. |
| Approve/reject requests with comments | Approvals tab → review dialog | **CH5_Schedule_Advanced.md §5.4 (Processing Requests, Bulk Processing)** | Manual details left-side form, comment fields, approve/reject buttons, and mass actions exactly matching the modal workflow. | Ensure agent tests both single and bulk actions per manual guidance. |
| Export evidence / reports | Reports таб (карточки) + кнопка «Экспортировать отчёты» в Approvals | **CH6_Reports.md §6.1–6.3** | Формирует T-13, Рабочий график и отклонения; сверяйте имена файлов и описание с CH6 перед валидацией. | После выдачи файла отметьте, что экспорты запускаются только для выбранного подразделения. |

## What to Skip for This Demo
- **CH4_Forecasts.md** – forecasting operations power analytics dashboards, not surfaced in the Manager Portal slice you’re testing.
- **CH5_Schedule_Shifts.md & CH5_Schedule_Build.md** – deep shift/scheme configuration; useful for scheduling parity tasks but not required for dashboard/approvals smoke tests.
- **CH7_Appendices.md** – import templates / CSV schemas; only relevant if verifying data ingest.

## Agent Checklist (Manager Portal Focus)
1. Login per **CH2** → land on Dashboard.
2. Compare Dashboard KPIs/charts with manual references:
   - Employee totals & active share → cross-check employee list data (CH3) and request load (CH5 §5.4).
   - Coverage chart numbers → run Work Schedule or Deviations report (CH6).
   - Request type split → use request filters & exports (CH5 §5.4).
3. Open **Approvals** tab → follow approval workflow (CH5 §5.4), including history view and bulk actions.
4. Visit **Teams** tab → validate sorting & detail modal using organisation structure guidance (CH2) and employee profiles (CH3).
5. Document results directly in the UAT packs, citing manual sections from the table above and attaching screenshots per `screenshot-checklist.md`.

