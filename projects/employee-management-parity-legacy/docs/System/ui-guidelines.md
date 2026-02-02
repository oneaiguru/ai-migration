# UI Content & Parity Guidelines

These principles keep the Employee Management parity build visually aligned with production while we iterate on feature parity.

## No “Demo” Labels in UI Shell
- Navigation labels, headers, and badges must match the production product. Avoid suffixes like “(демо)” or copy that hints at placeholders.
- Use internal documentation (hand-off notes, backlog items) to flag unfinished areas instead of surfacing “demo” status in the UI.
- Rationale: parity reviews evaluate look-and-feel expectations; extra “demo” tags mislead stakeholders and contradict the goal of matching production 1:1.

## Technology Names Belong in Docs, Not UI Copy
- Do not reference underlying libraries (e.g. “Chart.js”, “Playwright”, “Radix”) in visible strings. Mention them in docs (`docs/System/*`, `docs/Tasks/*`) when relevant.
- UI copy should describe user outcomes (“График смен”) rather than implementation details.

## Placeholder Modules
- If a tab is not yet functionally complete, keep the layout/styles consistent and leave the content in a ready-only placeholder state.
- Use `docs/Tasks/parity-backlog-and-plan.md` or PRDs to track outstanding work; optional contextual hints can live inside the module body (e.g. short paragraph about forthcoming functionality) but should not alter navigation labels.

Following these rules keeps parity builds indistinguishable from production surfaces while still giving agents clear internal breadcrumbs about unfinished work.
