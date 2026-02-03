# UI Status — Demo Ready (2025-11-05)

- Live UI (prod alias): https://mytko-forecast-ui.vercel.app (resolves OK)
- PR: chore/ui-csv-a11y-sites-cohesion — feat(ui): CSV a11y + routes/sites cohesion; SiteAccuracy tiles
- Reviewer bundle: see latest ZIP under ~/Downloads (built via `scripts/make_ui_review_bundle.sh`)

Smoke commands
```
PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npm run -s test:e2e:serial
```

Included artifacts in the UI ZIP
- dist/ (prod build)
- playwright-report/ (HTML)
- tests/e2e/TIMINGS.md
- screenshots/: overview.png, routes_table.png, plan_assignments.png
- reviews/: COORDINATOR_DROP_UI.md, ROUTES_IMPLEMENTATION.md, ui_supporting_bundle/README.md

Notable changes in this drop
- CSV a11y semantics in RoutesTable (role=status, aria-live; aria-busy on button)
- Routes/Sites data cohesion (sites fetched once in parent)
- SiteAccuracy tiles from public/accuracy_demo.json
- P1 foundations: React Query for metrics/sites/routes; TanStack Table for Sites/Routes (no virtualization)

Definition of done
- Unit 12/12 PASS; E2E smokes PASS (serial); no API contract changes
- Vercel alias responds; after merge to main, re-run smokes and rebuild bundle
- Nightly-only Sites pagination spec present (controls visibility)
