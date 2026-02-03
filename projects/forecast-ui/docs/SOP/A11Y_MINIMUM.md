# SOP — A11y Minimum (Demo‑Safe)

Scope: pragmatic accessibility improvements we guarantee for the demo without large refactors.

- Status announcements
  - CSV status: `role="status"` + `aria-live="polite"`; buttons set `aria-busy` while running.
  - Pager: ensure select has `aria-label` and buttons are reachable via Tab.
- Focus & keyboard (Tab only)
  - All interactive elements are tabbable and have visible focus styles.
  - View switches (cards/table) do not trap focus; Tab order follows visual order.
- Tables
  - Header cells act as column headers (`scope="col"` or equivalent via TanStack semantics).
  - Sticky headers remain visible; no keyboard trap.
- Error states
  - Replace generic “Error” with short, readable inline text; do not block the entire page.
- Deferred (post‑demo)
  - Full keyboard navigation (arrow keys in tables), skip links, landmarks beyond the main content, broader screen reader texts.

Validation
- Manual Tab walkthrough per tab (Overview, Districts, Sites, Routes)
- Unit checks for presence of `role="status"` and pager labels where applicable
- PR E2E remains unchanged; nightly optional a11y presence checks can be added later
