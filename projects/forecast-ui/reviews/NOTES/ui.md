# Notes (Reviewer: <name>)
- Scope reviewed: UI — Routes table CSV UX (a11y), routes/sites data cohesion, Sites accuracy tiles
- Findings (line-anchored):
  - routes table a11y status and aria-busy: src/components/RoutesTable.tsx:1
  - cohesion (sites via parent): src/components/Routes.tsx:1 and src/components/RoutesTable.tsx:1
  - accuracy tiles: src/components/SiteAccuracy.tsx:1 and public/accuracy_demo.json:1
- Risks/Impact:
  - Minimal; no API contract changes; demo‑safe. Tiles use static JSON.
- Decision: ACCEPT
- Actions required:
  - None pre‑demo. Post‑demo: consider React Query adoption and pagination/virtualization.

