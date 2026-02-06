# Manager Portal – Illustrated UAT Walkthrough (2025-11-01)

Use this guide with the latest production build (`https://wfm-practice51.dc.oswfm.ru`) and the parity demo (`https://manager-portal-demo-doeresnrv-granins-projects.vercel.app`). Screenshots for each step live in `docs/UAT/real-naumen/2025-11-01_manager-portal/`.

## 1. Shell & Notifications
1. Sign in via the OIDC login macro (username/password `user20082025`).
2. Confirm module tabs (Прогнозы/Расписание/Сотрудники/Отчёты) and bell badge. Compare against `05079efd-059e-42cf-9746-f38036dd41cf.png`.
3. Trigger any export (e.g., T‑13) and verify the bell tray shows pending → ready states with expiry copy.

## 2. Schedule Tabs
1. Open «Расписание».
2. Walk through each sub-tab, matching the captures:
   - «Схемы»: day-type matrix (`33141990-adfd-4183-92e1-c49e79f9cf9a.png`).
   - «Смены»: shift designer warning + templates list (`333a9acc-6b2d-438e-9d4c-5ed71c57802f.png`).
   - «События»: event form with distribution toggles (`00e86d66-f39d-4f52-916b-8aa7cf9921bc.png`).
   - «Отпуска»: tab actions + year picker (`5f9a3b0d-63c2-491a-a26c-a7b81f8e245f.png`).
3. For each tab, note any missing controls or RU copy mismatches.

## 3. Schedule → «Заявки» Sub-tab
1. Switch to the «Заявки» sub-tab (within Schedule).
2. Validate status chips, history toggle, and queue summary against `401964f0-4296-42b9-a6ac-8813ae4b85dd.png`.
3. Open a row and confirm affected shift list (format dd.mm.yyyy + time + status).

## 4. Approvals Module
1. Open the sidebar «Заявки» tab.
2. Check status checkboxes + history toggle (`b4f129d8-9e79-43b5-8f1b-23a732a1713b.png`).
3. Enter the review dialog, verify shift disposition radios and mandatory comment (`b4c83c1e-d48d-4a5a-849c-5192bc25719e.png`).
4. Approve one request, reject another (with note), and ensure list + banner update correctly.

## 5. Reports Catalogue & Download Queue
1. Navigate to «Отчёты» → «Основные».
2. Confirm the catalogue matches `2ebe157c-bc93-4119-9b54-617d2ddaf252.png` (eight report cards).
3. Trigger «Выгрузить в Excel» on T‑13; watch the button state and bell entry (`29abc770-1cbc-41fb-bf8d-4bcb9956d4d1.png`, `05079efd-059e-42cf-9746-f38036dd41cf.png`).
4. Ensure the entry can be acknowledged/removed and note expiry time.

## 6. Monitoring & Tasks
1. Review «Мониторинг» and «Задачи» panels for live metrics vs to‑do list (`660667fc-bf9c-4d2d-ac22-c07c81892dfc.png`, `67f0ee0b-12b5-4175-aaee-a49a95d1de52.png`).
2. Record any missing SLA indicators, update intervals, or task status badges.

## 7. Employees Drawer (Future Scope)
1. Optional: open an employee edit drawer in production (`28cedaa9-0562-4e27-97b6-7525d8c4f951.png`).
2. Log any localisation or validation behaviours the demo must reproduce when the module ships.

## Pass/Fail Recording
- Use the Manager Portal rows in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` for result logging.
- Attach new screenshots if behaviour deviates; reference aliases from this guide.
- Flag blockers in `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md` with “MP‑” IDs.

## Quick Reminders
- Do not modify production data.
- Capture only RU copy and behaviour differences; visuals are out of scope unless they impact usability.
- When tests finish, update `docs/SCREENSHOT_INDEX.md` if new captures are taken.
