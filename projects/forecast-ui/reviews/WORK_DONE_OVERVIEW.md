# UI — Work Done Overview (Demo Readiness)

Scope: demo-safe UI stabilization, E2E test hygiene, advisory gates, and reviewer-facing bundle docs.

What’s implemented
- CSV UX in Routes: loading/disabled state and inline error message on failure.
- PR E2E smokes (serial, 30s per test; routes spec cap 45s) against prod alias.
- Nightly E2E spec: Registry filter (skips on PR; runs with E2E_NIGHTLY=1, screenshots and downloads enabled).
- Advisory lint/format configs and scripts (ESLint, Prettier) and size-gate script (warn>350, block≥500).
- CI workflows: PR smokes + nightly E2E present; HTML report uploaded on PR.
- Bundle docs for reviewers: PRE_SHOW_CHECKLIST.md and COORDINATOR_DROP_UI.md included in the UI ZIP.

Validations
- Unit tests: 6 passed (Vitest).
- E2E PR smokes: 5 passed, 1 nightly spec skipped (~21s total).
- UI prod alias resolves via curl; pages render live.

Notes
- No functional changes beyond UX feedback; API contracts unchanged.
- Current file sizes below split thresholds (Routes≈242, RoutesTable≈191, Sites≈165); split plan ready if growth exceeds 300–400 LoC.
- Use SOP TEST_RUN_SOP.md for timeouts, background runs, and typical durations; artifacts included in the bundle.

Next
- Merge PR and verify Vercel deploy; re-run PR smokes; rebuild bundle and deliver to reviewers.
- Optional follow-ups: add small Vitest unit tests for CSV error path and routes-fallback; enforce size-gate in CI post‑demo.
