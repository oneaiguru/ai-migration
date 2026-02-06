• Here’s the requested confirmation for WFM Employee Portal.

  RU labels (path:line)

  - Navigation
      - src/components/Layout.tsx:14 — 'Главная'
      - src/components/Layout.tsx:15 — 'Мои заявки'
      - src/components/Layout.tsx:16 — 'Профиль'
  - Dashboard
      - src/pages/Dashboard.tsx:80 — 'Загрузка данных...'
      - src/pages/Dashboard.tsx:91 — 'Добро пожаловать, {…}!'
      - src/pages/Dashboard.tsx:105 — 'Всего заявок'
      - src/pages/Dashboard.tsx:115 — 'На рассмотрении'
      - src/pages/Dashboard.tsx:125 — 'Одобрено'
      - src/pages/Dashboard.tsx:135 — 'Предстоящие'
      - src/pages/Dashboard.tsx:150 — 'Баланс отпусков'
      - src/pages/Dashboard.tsx:217 — 'Последние заявки'
      - src/pages/Dashboard.tsx:223 — 'Посмотреть все'
  - Vacation Requests
      - src/pages/VacationRequests.tsx:139 — 'Загрузка заявок...'
      - src/pages/VacationRequests.tsx:151 — '🏖️ Мои заявки на отпуск'
      - src/pages/VacationRequests.tsx:162 — 'Новая заявка'
      - src/pages/VacationRequests.tsx:169 — 'Все'
      - src/pages/VacationRequests.tsx:170 — 'На рассмотрении'
      - src/pages/VacationRequests.tsx:171 — 'Одобрено'
      - src/pages/VacationRequests.tsx:172 — 'Отклонено'
      - src/pages/VacationRequests.tsx:289 — 'Тип отпуска *'
      - src/pages/VacationRequests.tsx:309 — 'Дата начала *'
      - src/pages/VacationRequests.tsx:321 — 'Дата окончания *'
      - src/pages/VacationRequests.tsx:346 — 'Причина/Комментарий'
      - src/pages/VacationRequests.tsx:366 — 'Экстренная заявка (требует
        немедленного рассмотрения)'
      - src/pages/VacationRequests.tsx:376 — 'Отмена'
      - src/pages/VacationRequests.tsx:383 — 'Подать заявку'
  - Profile
      - src/pages/Profile.tsx:71 — 'Загрузка профиля...'
      - src/pages/Profile.tsx:156 — 'Личная информация'
      - src/pages/Profile.tsx:157 — 'Контакты'
      - src/pages/Profile.tsx:158 — 'Рабочая информация'
      - src/pages/Profile.tsx:183 — 'Имя'
      - src/pages/Profile.tsx:199 — 'Фамилия'
      - src/pages/Profile.tsx:215 — 'Дата рождения'
      - src/pages/Profile.tsx:247 — 'Экстренный контакт'
      - src/pages/Profile.tsx:273 — 'Телефон'
      - src/pages/Profile.tsx:294 — 'Степень родства'
      - src/pages/Profile.tsx:112 — 'Активен' (conditional)
      - src/pages/Profile.tsx:115 — 'лет стажа'
      - src/pages/Profile.tsx:128 — 'Отмена'
      - src/pages/Profile.tsx:134 — 'Сохранить'
      - src/pages/Profile.tsx:143 — 'Редактировать'

  Appendix 1 mapping (status + evidence)

  - #1 Create/Edit/View employee — Partial (Edit/View)
      - Evidence: edit toggle and actions (src/pages/Profile.tsx:143, src/pages/
        Profile.tsx:128, src/pages/Profile.tsx:134)
  - #3 Required fields block — Implemented
      - Evidence: 'Имя' (src/pages/Profile.tsx:183), 'Фамилия' (src/pages/
        Profile.tsx:199), 'Дата рождения' (src/pages/Profile.tsx:215)
  - #4 Emergency contact — Implemented
      - Evidence: 'Экстренный контакт' (src/pages/Profile.tsx:247),
        'Телефон' (src/pages/Profile.tsx:273), 'Степень родства' (src/pages/
        Profile.tsx:294)
  - #6 Work info (position/team) — Implemented
      - Evidence: 'Отдел' (src/pages/Profile.tsx:389), 'Должность' (src/pages/
        Profile.tsx:396)
  - #70 Save gating — Implemented (basic)
      - Evidence: 'Отмена' (src/pages/Profile.tsx:128), 'Сохранить' (src/pages/
        Profile.tsx:134)
  - #51 Import employees — Out of scope (N/A)
      - Evidence: app routes only '/', '/vacation-requests', '/profile' (src/
        App.tsx:21, src/App.tsx:22, src/App.tsx:23)
  - #56 Import check — Out of scope (N/A)
      - Same as above
  - #62–63 List + Edit UI (Employees module) — Out of scope (N/A)
      - Evidence: no Employees list routes; portal is self‑service (src/
        App.tsx:21–23)

  Unknowns flagged for UAT (documented)

  - Added to docs/Tasks/uat-packs/chart_visual_spec.md under “WFM Employee
    Portal – Charts to Measure” → “Unknowns for UAT (forms/tables)”
      - Field formats: phone mask, date min/max (src/pages/Profile.tsx:273, src/
        pages/Profile.tsx:215)
      - Validation: required/error copy for Request modal and
        Profile edits (src/pages/VacationRequests.tsx:289, src/pages/
        VacationRequests.tsx:309, src/pages/VacationRequests.tsx:321; src/pages/
        Profile.tsx:183, :199, :215)
      - RU formatting consistency: date usage across pages (src/pages/
        Dashboard.tsx:62; src/pages/VacationRequests.tsx:119, :124; src/pages/
        Profile.tsx:41)
      - Wording review: modal/buttons (src/pages/
        VacationRequests.tsx:162, :376, :383, :366)

  If you want any additional RU examples captured (e.g., more Dashboard card
  labels), I can add them.

