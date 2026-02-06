# UAT – Visual/Behavior Spec (WFM Employee Portal, Staging Draft)

Note: No charts in this demo. Focus on forms/tables/requests behavior.

Unknowns for UAT (forms/tables)
- Field formats: confirm phone mask and date input constraints (Profile emergency contact phone; birthDate min/max) — src/pages/Profile.tsx:273, :215
- Validation: required fields and error messaging for New Request (type/start/end), and Profile edits — src/pages/VacationRequests.tsx:289, :309, :321; src/pages/Profile.tsx:183, :199, :215
- RU formatting consistency: dates across Dashboard/Requests/Profile (toLocaleDateString('ru-RU')) — src/pages/Dashboard.tsx:62; src/pages/VacationRequests.tsx:119, :124; src/pages/Profile.tsx:41
- Wording: verify copy in headers/buttons is final (e.g., “Новая заявка”, “Отмена”, “Подать заявку”, “Экстренная заявка”) — src/pages/VacationRequests.tsx:162, :376, :383, :366

