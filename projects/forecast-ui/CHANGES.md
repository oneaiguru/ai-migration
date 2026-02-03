# CHANGES (Demo Integration)

Non‑breaking additions focused on parity + API integration.

What’s new
- Маршруты 2.0 (Table view)
  - Columns: Прогноз запол., %, Риск, Посл. вывоз; risk sorting; “Риск ≥ 80%” filter; CSV download
- План‑задания
  - Inline risk badges; date picker; critical‑only toggle
- Реестр КП
  - Risk badge column + “Переполнение ≥ 80%” filter
- Styling parity
  - Lighter sidebar; blue accent; compact tables; tooltips (WAPE/SMAPE; badge titles)
- Zero‑states
  - Friendly empty states on all tabs; no crashes on missing fields

Fallback logic
- If `/api/routes` returns no rows for the demo date, UI derives strict/showcase from `/api/sites` (keeps demos meaningful)
- Server CSV preferred; JSON→CSV fallback for downloads

Known limits
- Table fields `volume`, `schedule`, `last_service` appear as backend enriches `/api/routes`
- CSV content mirrors server data; when server routes are empty, CSV is empty (UI fallback does not fabricate CSV rows)

Env & URLs
- Vercel env: `VITE_API_URL`, `VITE_DEMO_DEFAULT_DATE = 2024-08-03`
- Stable UI: https://mytko-forecast-ui.vercel.app

Files (high‑level)
- Components: src/components/{Routes.tsx,RoutesTable.tsx,RoutesPrototype.tsx,Sites.tsx,Overview.tsx,Districts.tsx,PlanAssignments.tsx,RegistryView.tsx}
- API client: src/api/client.ts
- Styles/Config: tailwind.config.js, src/index.css, vite.config.ts
