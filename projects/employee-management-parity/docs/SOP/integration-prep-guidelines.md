## Integration Prep Guidelines (All Demos)

Purpose
- Make every demo mountable in a unified shell with minimal duplication or surprises.

Required for each demo
1) Export `Root` component (no internal BrowserRouter). Accept host routing.
2) Provide `setupRU()` registrar and ensure Chart.js/i18n registration is idempotent and centrally invoked by the host.
3) Remove per‑component chart registration; wrappers consume registration via `setupRU()`.
4) Keep CSS scoped; avoid global resets that leak into host. Prefer package styles.
5) Document package exports (package.json `exports` → dist index) and a short mount README.
6) Ensure basename‑friendly routing (especially for Schedule) if internal route fragments exist.
7) RU formatting visible on all relevant screens; no console errors on initial render.

Nice to have
- Storybook slices that mirror mounted usage
- Unit tests for adapters + basic integration tests

Acceptance (per demo)
- Mountable `{ Root, setupRU }` exports; builds cleanly as a package
- Demo renders inside shell at assigned route without errors
