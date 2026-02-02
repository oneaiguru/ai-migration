# Migration Prep Workspace

> Draft workspace for Phase 5 library migration exploration. Do **not** integrate with the main project without review.

## Directory Map
- `reference/` – curated documentation, code snippets, and licenses harvested from third-party libraries.
- `third_party/` – vendor example sources (kept read-only).
- `playground/` – standalone Vite app demonstrating candidate libraries.
- `wrappers-draft/` – prototype wrapper APIs showing potential integration shapes.
- `scripts/` – helper utilities (doc search, sync tools, etc.).
- `QUESTIONS.md` – open questions/assumptions logged during prep.
- `MANIFEST.md` – inventory of collected assets.

## Ground Rules
1. Nothing in this folder ships to production; it is exploratory.
2. Keep dependencies local to `playground/` (separate `package.json`).
3. Record evidence sources (URL, version, date) in each doc/snippet.
4. Note blockers or unanswered questions in `QUESTIONS.md`.

## Status Snapshot (2025-10-07)
- Workspace created: 2025-10-07 09:45 +08 (recorded manually).
- Documentation + licenses harvested via `scripts/fetch_all_docs.sh` / `fetch_licenses.sh` (see `MANIFEST.md`).
- Snippet library extracted under `reference/snippets/` for each target library (UI primitives, tables, forms, drag-and-drop, charts, search, mobile).
- Vite playground initialised (`playground/`, `npm install`, demo routes scaffolded in `src/examples/*`).
- Pending tasks:
  - Integrate snippet code into wrappers draft / document parity gaps.
  - Expand Playwright coverage + run accessibility checklist.
  - Polish wrappers & align with parity project structure.

### Documentation Strategy
- **curl → pandoc** for static HTML docs (shadcn, Radix, TanStack, RHF, Zod, dnd-kit, Vaul, Playwright, axe-core).
- **Raw GitHub snapshots** for Tremor, Recharts, MiniSearch (their sites are SPA or GitHub-first).
- Interactive examples (dnd-kit, Recharts) are referenced via CodeSandbox / live sites rather than archived HTML.
- React Hook Form `get-started` stored as raw HTML—plan to clean manually if needed.

### Utility Scripts
- `scripts/fetch_all_docs.sh` – refreshes documentation bundle using corrected URLs/modes.
- `scripts/fetch_licenses.sh` – downloads license files for all vendors.
- `scripts/clone_examples.sh` – pulls third-party reference repos (examples preserved when available).
- `scripts/docs_search.mjs` – grep-like search across `reference/docs` (usage: `./scripts/docs_search.mjs <query>`).

### Playground Commands
```bash
cd migration-prep/playground
npm install
npm run dev      # локальный просмотр примеров
npm run build    # проверка сборки (React 19 + @tremor/react via --legacy-peer-deps)
```

> Если `npm install` жалуется на peer dependency для `@tremor/react`, выполните
> `npm install @tremor/react --legacy-peer-deps` — зависимость зафиксирована в `package-lock.json`.
