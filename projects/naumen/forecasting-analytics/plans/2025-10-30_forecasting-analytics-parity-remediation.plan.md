# Forecasting & Analytics — Parity Remediation Plan (2025-10-30)

## Scope
Bring the forecasting demo to parity with the Naumen reference (CH4) by upgrading data contracts, services, workspaces, trend analytics, accuracy dashboards, and validation tooling. Final deliverable includes redeploy + Step 6 UAT evidence and documentation updates.

## Steps & Status

1. **Data contracts & fixtures** — Expand forecasting types, deterministic fixtures, API helper scaffolding, RU metric formatting. ✅ Completed.
2. **Workspace rewrites** — Build/Exceptions/Absenteeism modules consume new services and fixtures; add validations, download actions, absenteeism template gallery. ✅ Completed.
3. **Trend & accuracy analytics** — TrendAnalysisDashboard gains queue/period filters, anomaly tagging, confidence band + CSV export; Accuracy stack refreshed with RU formatting, detail table, export options, adapter coverage. ✅ Completed (2025-10-30).
4. **Tests & tooling** — Update Vitest suites (accuracy, trends, adjustments), ensure smoke routes script covers all tabs. ✅ Completed (2025-10-30).
5. **Validation loop** — Run `npm ci`, `npm run test:run`, `npm run build`, `npm run smoke:routes`, preview/manual checks, deploy via `vercel deploy --prod --yes`, smoke prod. ✅ Completed (2025-10-30).
6. **UAT & documentation** — Execute Step 6 packs (parity_static + chart_visual_spec), capture screenshots to `/Users/m/Desktop/tmp-forecasting-uat/`, update UAT log, CodeMap, parity index/matrix/checklists, tracker, PROGRESS, SESSION_HANDOFF. 🔁 Latest run (2025-10-30) surfaced blockers (trend charts empty without seeded queue/period; build/exceptions/absenteeism workflows missing). Needs remediation + rerun.

## Notes
- Preview port: 4155 (docs/System/ports-registry.md).
- Backend import/export endpoints still mocked; coordinate integration once API ready.
- Manual adjustments call `forecastingApi.saveAdjustments`; swap to live endpoint when available.
- Keep smoke screenshots under `test-results/` and mirror to Desktop tmp directory for outbound UAT.

## Follow-up / Open Questions
- Provide production API schemas for import/export + manual adjustment persistence.
- Confirm RU localisation coverage for accuracy metrics with UX reviewer.
- Extend Playwright suite for confidence band + dual-axis legend evidence once backend stabilises.
