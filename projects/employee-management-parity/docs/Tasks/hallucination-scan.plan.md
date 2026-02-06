# Hallucination Profile Scan – Demos #3–#5 (1h each)

## Goal
Quickly classify remaining demos as Isolated (UI-only hallucinations) or Tangled (mixed into logic) to decide parallelization.

## Demos to scan
- Manager Portal: /Users/m/Documents/wfm/main/intelligence/naumen/manager-portal-demo
- Analytics Dashboard: /Users/m/Documents/wfm/main/intelligence/naumen/analytics-dashboard-demo
- Employee Portal: /Users/m/Documents/wfm/main/intelligence/naumen/wfm-employee-portal

## Checklist (per demo)
- Engine: Chart.js/Recharts/none (package.json, imports)
- Inline CDN usage (index.html with inline React) → likely Tangled
- Data flow: fake logic in fetch/adapters? (search for mock/random/Math.random)
- UI layer: fake buttons/labels (export PDF, charts placeholder) without logic
- RU labels present?
- Estimated effort to strip/replace

## Output
- docs/System/HALLUCINATION_PROFILE.md
  - For each demo: Isolated/Tangled + risk notes + recommended path (parallel/sequential)
