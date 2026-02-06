# AI Docs Workspace Index

Read this before any discovery or plan that cites `ai-docs/`. It summarizes every key folder so you know where to pull examples and evidence.

## Core Guidance
- `ai-docs/README.md` – workspace overview (folder map, ground rules, status snapshot).
- `ai-docs/MANIFEST.md` – inventory of harvested docs/snippets/repos.
- `ai-docs/RESEARCH_BRIEF.md` – library/version notes for Radix dialogs, TanStack virtualization, RHF/Zod, accessibility checklist.
- `ai-docs/QUESTIONS.md` – open issues/assumptions to carry into discovery.
- `ai-docs/ACCESSIBILITY_CHECKLIST.md` – Radix/Dialog verification items validated via the playground.

## Wrapper Drafts
- `ai-docs/wrappers-draft/ui/`
  - `Dialog.tsx` – Radix dialog façade with `titleHidden`/`descriptionHidden` support.
  - `Popover.tsx` – Radix popover sample.
  - `Button.tsx` – token-aware button prototype.
  - `README.md` (when present) – notes for UI wrappers.
- `ai-docs/wrappers-draft/form/`
  - `FormField.tsx` – label/hint/error wrapper.
  - `EmployeeForm.tsx` – RHF + Zod example form.
  - `README.md` – draft guidance for form wrappers.
  - **Snapshot note** – Folder mirrors the Phase 7 frozen reference (aria helper + CSV guidance captured 2025-10-15).
- `ai-docs/wrappers-draft/data/`
  - `DataTable.tsx` – TanStack Table + Virtual draft implementation.
  - Add a README if missing when updating the wrapper.

## Playground App (`ai-docs/playground/`)
- `package.json`, `vite.config.ts` – standalone Vite config.
- `src/examples/`
  - `table-demo/TableDemo.tsx` – virtualized table example.
  - `form-demo/FormDemo.tsx` – RHF + Zod demo (if present).
  - `overlay-demo/` – Radix overlay sample (when present).
- `src/styles/` – tokens/styles consumed by demos.

## Reference Snippets (`ai-docs/reference/snippets/`)
- `tanstack-table/basic/src/main.tsx` – canonical table usage.
- `tanstack-table/virtualized-rows/src/main.tsx` – virtualization with dynamic row heights.
- `tanstack-virtual/table/src/main.tsx` – offset math for virtual table.
- `minisearch/basic-search.ts` – fuzzy search helper.
- `utils/import-export.ts` – CSV/Excel helper derived from Employee Management shared utility.
- `tremor/performance-card.tsx`, `recharts/basic-area-chart.tsx` – chart samples.
- Additional folders (dnd-kit, vaul, etc.) mirror harvested vendor examples.

## Scripts (`ai-docs/scripts/`)
- `docs_search.mjs` – grep-style search across harvested docs.
- `fetch_all_docs.sh`, `fetch_licenses.sh`, `clone_examples.sh` – refresh documentation bundle, licenses, and third-party repos.

## URL Harvest Logs
- `ai-docs/corrected_urls.md`, `ai-docs/corrected_urls2.md` – corrected crawl source lists.
- `ai-docs/migration_urls.md`, `ai-docs/migration_urls_latest.md` – script outputs for documentation refresh batches.

## Third-Party Repos
- `ai-docs/third_party/` – shallow clones of vendor repositories (tanstack-table, react-hook-form, minisearch, etc.) retained for deeper reference beyond snippets.

## LLM Reference
- `ai-docs/llm-reference/AiDocsReference.md` – summary of the external migration review and required follow-ups.
- `ai-docs/llm-reference/index.md` – condensed inventory inside the AI workspace.

## Pending Review / TODO
- `ai-docs/reference/docs/` – harvested markdown/html docs; skim relevant sections before major migrations.
- `ai-docs/third_party/` – verify examples are still current when referencing vendor patterns.
- When new wrappers/demos land, update this index and mirror notes back into the relevant discovery/plan documents.

### Reference Strategy
- Drafts in `ai-docs/wrappers-draft/` are illustrative reference demos. Use them to understand intended APIs, not as a byte-for-byte mirror of production.
- When a plan explicitly calls for alignment (for example, to capture a regression fix), copy over only the relevant sections and annotate the README so future agents know which
  portions match shipping code. Otherwise keep the demos lightweight.
- Once the component-library refactor stabilises (Phase 7 follow-ups), produce a trimmed “frozen” reference snapshot of critical demos, note that status here, and avoid routine
  updates unless the reference intentionally changes.
- **Status:** Phase 7 snapshot captured (2025-10-15). Update this note when the next snapshot is recorded.

Always cite file:line references from these assets in discovery/plan documents so executors can retrace the evidence. Call out in discovery when a demo diverges from
production so planners understand what still needs to migrate.
