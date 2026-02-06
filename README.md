# AI Monorepo (import-first)

Root for importing all projects under `projects/`. Phase 1 is import-only: small, coherent PRs per repo (≤ ~300 KB), no refactors. Phase 2 will reorganize into a cleaner apps/libs layout after reviews.

## Layout
- projects/ — each repo copied 1:1 for Phase 1 imports.
- docs/ — monorepo-level guides and indices (add as we import).

## Working rules (Phase 1)
- Import in the smallest self-contained PRs practical; if a repo won’t split cleanly, use one import PR.
- Each PR adds a minimal `AGENTS.md` in the imported project with purpose + run commands.
- Keep junk out: node_modules, dist, .vite, .venv, zip bundles, _incoming/, large CSVs (containers_long, sites_service, sites_registry), artifacts/viz, reports/sites_demo/*.csv.
- No refactors or behavior changes; only path/ignore tweaks if required to import.
- Merge each PR after review, then open the next.

## PR naming convention (Phase 1)
- Format: `import:<repo>:NN-<scope>` (e.g., `import:forecastingrepo:01-scaffold`).
- Keep each PR ≤ ~300 KB and coherent by area (scaffold, core, API/CLI, tests, docs, tools, artifacts).
- If a repo cannot be split cleanly, use a single `import:<repo>:all` PR.

## Tracking
- See `docs/ProjectIndex.md` for source → target paths and PR series.
- See `docs/PR_PLAN.md` for the slice plan (forecastingrepo + UIs) and per-PR expectations.

## Worktree hygiene
- One worktree per active PR/branch; remove it when the PR merges or is abandoned.
- Name worktrees after the branch (e.g., `git worktree add -b import-foo ../ai-foo origin/main`).
- Use `scripts/dev/cleanup_worktrees.sh` to list status; `--prune` removes merged & clean worktrees (skips dirty/unmerged and the primary repo).
- More guidance and back-burner ideas: `docs/SOP/worktree_hygiene.md`.

## Next steps
- Start with imports for rtneo (forecastingrepo + UIs) following the slice plan.
