# PR‑18 UI — Planner Scout Brief (Local‑First)

Role & scope
- Role: UI Planner → Executor for PR‑18 (Site Forecast). Start with discovery; execute only after plan approval.
- Scope: UI‑only, demo‑safe. No API/Route‑Builder changes. RU labels preserved.

Read first (full)
- forecastingrepo/reviews/README_STATUS.md:1 — summary, BASE (local default), API contracts, UI tasks
- forecastingrepo/reviews/DEMO_FREEZE.md:1 — local is default; remote optional
- forecastingrepo/docs/SOP/LOCAL_DEMO_QUICKSTART.md:1 — start/stop local demo one‑liner
- ui/forecast-ui/docs/Tasks/PR-18_site_forecast_ui.md:1 — execution details for hook/component/tests
- ui/forecast-ui/docs/SOP/TEST_RUN_SOP.md:1 — test commands and expectations
- CE Magic Prompts SOPs (role cadence):
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md:1
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md:1
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md:1
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md:1

Ground‑truth code anchors
- Hooks pattern: ui/forecast-ui/src/hooks/useRoutesData.ts:1, ui/forecast-ui/src/hooks/useSitesData.ts:1
- API client: ui/forecast-ui/src/api/client.ts:1
- Integration point: ui/forecast-ui/src/components/table/SitesTanStackTable.tsx:1

Planner deliverable (what to propose)
- Files to add/change (exact paths), with responsibilities:
  - ui/forecast-ui/src/hooks/useSiteForecast.ts — React Query wrapper for `GET /api/sites/{site_id}/forecast` (window preferred; days fallback)
  - ui/forecast-ui/src/components/SiteForecast.tsx — Recharts line chart, `role="region"`, `aria-label="Прогноз по площадке"`
  - (Optional) ui/forecast-ui/src/components/table/SitesTanStackTable.tsx — “Прогноз” action to open modal/drawer
  - ui/forecast-ui/src/types/api.ts — ensure shape `{date, pred_mass_kg?, fill_pct?, overflow_prob?, last_service_dt?}`
- Tests to add/run:
  - Unit: hook (window param, days fallback, empty state), component (renders ≥1 point; a11y region present)
  - Optional E2E: open modal for a site and assert chart mounts (serial smoke)
- Validation commands (local‑first):
  - `cd ui/forecast-ui && npm test -s`
  - `PW_TIMEOUT_MS=30000 E2E_BASE_URL=http://127.0.0.1:4173 npx playwright test --workers=1 --reporter=line`

Acceptance (Executor must hit)
- For a known site (e.g., S1), chart renders with ≥1 point on 2024‑08‑01..2024‑08‑07
- No console errors; existing PR smokes remain green; empty state for routes forecast ([]) is handled
- Flat reviewer bundles updated if component added:
  - forecastingrepo/reviews/ATTACH_REVIEWERS/UI_COMPONENTS/SiteForecast.tsx:1
  - forecastingrepo/reviews/ATTACH_REVIEWERS/UI_COMPONENTS/SitesTanStackTable.tsx:1 (if action added)

Do / Don’t
- Do consume endpoints as‑is; handle 200 [] and 400 param errors
- Don’t change API shapes, routing, or labels; avoid large refactors
- Don’t introduce Route Builder features in this PR

Handoff (after execution)
- Update ui/forecast-ui/NEXT_AGENT_HANDOFF.md:1 with what landed + validation results
- Note any deferred integration (modal) and leave a clear TODO anchor
- Rebuild reviewer bundles only if files changed

Local‑first reminder
- Bring up local demo via `forecastingrepo/scripts/dev/local_demo_up.sh`
- UI: http://127.0.0.1:4173, API: http://127.0.0.1:8000/api/metrics
- Remote (tunnel/Vercel) remains optional and can be unstable; verify `<BASE>/api/metrics` before switching UI base

