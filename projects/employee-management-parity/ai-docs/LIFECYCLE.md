# AI-Docs Lifecycle

Purpose
- Keep the ai-docs workspace lean and useful. Avoid duplicate lists and stale drafts.

Tiers
- Active (current): drafts, playground, reference, scripts
- Snapshots: frozen copies under `ai-docs/snapshots/`
- Deprecated: moved to `ai-docs/deprecated/`

Rules
- Maintain a single URL corrections file: `ai-docs/corrected_urls.md`
- Keep `migration_urls.md` as baseline; merge `migration_urls_latest.md` into corrected_urls, then delete
- Delete `corrected_urls2.md` (duplicate) after merge
- Wrapper drafts: compare to `src/wrappers/**` regularly; delete duplicates, freeze diverged patterns

Weekly
- Run `ai-docs/scripts/cleanup-stale.sh --dry-run`; review and apply

Per Phase
- Create snapshot: `ai-docs/scripts/create-snapshot.sh phase-N`

