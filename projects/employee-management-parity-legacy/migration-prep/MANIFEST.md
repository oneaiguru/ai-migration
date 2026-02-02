# Migration Prep Manifest

| Date | Artifact | Location | Source / Version | Notes |
| --- | --- | --- | --- | --- |

## Outstanding Items
- [x] Populate reference docs for target libraries (shadcn, Radix, TanStack Table, RHF+Zod, dnd-kit, Tremor, MiniSearch, Vaul, Playwright/axe). *(docs captured 2025-10-07)*
- [x] Capture minimal examples under `third_party/` and `reference/snippets/`.
- [x] Initialize playground app and demos.
- [ ] Draft wrapper prototypes.
- [ ] Complete accessibility checklist for each demo.

## 2025-10-07 Documentation Harvest
- **shadcn/ui** – introduction + components (6 pages, gfm)
- **Radix primitives** – overview, accessibility, dialog, popover, tabs (5 pages, gfm)
- **TanStack Table** – intro, React guide, virtualization, row selection, column pinning, API (gfm/markdown fallback)
- **TanStack Virtual** – intro, React guide, table example (gfm)
- **React Hook Form** – docs set captured (get-started stored as html fallback, others gfm)
- **@hookform/resolvers** – zod adapter page (gfm)
- **Zod** – main + primitives/refinements/error handling (gfm)
- **dnd-kit** – overview + sortable context/hooks + sensors/accessibility (6 pages, gfm)
- **Tremor** – GitHub README snapshot (markdown)
- **Recharts** – GitHub README snapshot (markdown)
- **MiniSearch** – GitHub README snapshot (markdown)
- **Vaul** – main docs, getting started, API (gfm)
- **Playwright** – intro, accessibility testing, API reference (gfm)
- **axe-core** – repo overview, API, rules (gfm)
- **axe-core/playwright** – README (gfm)

## Licenses (2025-10-07)
- MIT/Apache/MPL licenses downloaded for shadcn, radix, tanstack-table, tanstack-virtual, react-hook-form, hookform-resolvers, zod, dnd-kit, tremor, recharts, minisearch, vaul, playwright, axe-core.

## Repositories (2025-10-07)
- Shallow clones placed under `third_party/` for shadcn-ui, radix-primitives, tanstack-table, tanstack-virtual, react-hook-form, zod, dnd-kit, tremor, recharts, minisearch, vaul, playwright, axe-core.
  - examples directory preserved where available (tanstack-table, tanstack-virtual, react-hook-form, minisearch, playwright).

## Known Gaps / Notes
- Radix "focus management" content lives within the accessibility overview (no standalone URL).
- dnd-kit interactive examples live on CodeSandbox; linked but not archived locally.
- Tremor & Recharts provide GitHub-first documentation; site SPA routes are non-crawlable.
- MiniSearch TypeDoc pages are offline; README contains authoritative API reference.
- React Hook Form `get-started` conversion still requires manual cleanup (stored as raw HTML).

## Snippet Library (2025-10-07)
- `reference/snippets/shadcn/dialog-example.tsx`
- `reference/snippets/radix/popover.tsx`
- `reference/snippets/tanstack-table/{basic,virtualized-rows}/`
- `reference/snippets/tanstack-virtual/table/`
- `reference/snippets/react-hook-form/{basic.tsx,validationSchema.tsx,zodResolver.tsx}`
- `reference/snippets/dnd-kit/{vertical-sortable.story.tsx,multiple-containers.tsx}`
- `reference/snippets/tremor/performance-card.tsx`
- `reference/snippets/recharts/basic-area-chart.tsx`
- `reference/snippets/minisearch/basic-search.ts`
- `reference/snippets/vaul/mobile-filters.tsx`
- `reference/snippets/playwright/employee-list-a11y.spec.ts`

## Wrapper Drafts (2025-10-07)
- `wrappers-draft/ui/Dialog.tsx`
- `wrappers-draft/ui/Popover.tsx`
- `wrappers-draft/data/DataTable.tsx`
- `wrappers-draft/form/FormField.tsx`
- `wrappers-draft/form/EmployeeForm.tsx`
