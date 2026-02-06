# Manager Portal – Localization Backlog

Status (2025-10-26): ✅ Strings translated in `${MANAGER_PORTAL_REPO}` (manager-portal-exec-2025-10-26-codex). Keep the inventory below as reference for future copy reviews.

Source: docs/Archive/UAT/2025-10-13_unified-shell-and-portals-uat.md · Manager Portal section (URL `https://manager-portal-demo-8s108xcm1-granins-projects.vercel.app`). Behaviour passed; remaining gaps were language-only prior to this pass.

## Translated Phrases (2025-10-26)
- Dashboard header + cards → «Покрытие смен», «Текущее покрытие по командам», KPI: «Всего сотрудников», «На смене сегодня», «Заявки в работе», «Предстоящие отпуска», легенда доната: «Отпуск», «Больничный», «Личные дела», «Сверхурочная работа».
- Coverage toggle controls → кнопки «Покрытие» / «Соблюдение графика», подписи осей берутся из русских названий команд (обновлены в mockData).
- Approvals screen → «Заявки, ожидающие решения», карточки приоритетов «Высокий/Средний/Низкий приоритет», таблица с колонками «Сотрудник», «Команда», «Тип заявки», «Период», «Приоритет», «Подано», диалог «Статус: …», кнопки «Отклонить», «Одобрить», «Применить решение», поля «Причина отказа*», «Комментарий (по желанию)».
- Teams screen → заголовок «Обзор команд», карточки «Всего сотрудников», «На смене сегодня», «Заявки в работе», «Предстоящие отпуска», кнопка «Подробнее», модальное окно «Обзор команды», «Подразделение», «Состав команды», «Последние заявки».

## Acceptance For Future Pass
- [Completed] Replace listed strings with approved Russian copy (aligns with CH2_Login_System.md и CH3_Employees.md).
- Pending verification: rerun `parity_static.md` + `trimmed_smoke.md` on the next UAT sweep to capture русские скриншоты и подтвердить отсутствие регрессий.
- 2025-10-31 выполнено: подтверждено, что отчёты используют RU имена файлов (`src/utils/exports.ts:19-76`) и легенды `shift_swap`/`replacement` отображаются как «Обмен сменами»/«Замещение сотрудника» (`src/adapters/approvals.ts:36-88`). Зафиксировать обновлённые скриншоты при следующем UAT прогоне.

## Outstanding (2025-11-02)
- Settings shell still shows English helper text on deployed build; confirm `${MANAGER_PORTAL_REPO}/src/pages/Settings.tsx:6-24` ships RU copy and redeploy if necessary (`/Users/m/Desktop/k/k.md:97-120`).
