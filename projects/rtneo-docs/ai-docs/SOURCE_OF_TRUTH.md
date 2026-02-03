# Source of Truth — External Product Docs (Telegram Zips)

Purpose
- Provide a single, deduplicated, searchable copy of external product docs for internal review.
- Record provenance (which zip, when staged, original relative path, content hashes) so we can trace any file back to its source.
- Keep originals outside the repo; store references and an index here.

Scope
- Canonical docs (kept): Markdown (.md) files under `ai-docs/product_docs/` from the preferred bundles.
- Duplicates removed: exact normalized‑text matches across bundles/formats; policy prefers Markdown over HTML and the `*_ditto` extraction when present.

Provenance
- Staging base: see the latest folder under `~/git/clients/rtneo/_incoming/telegram_*` (example in report).
- Original zips (paths recorded): `disp.zip`, `HTML.zip`, `src.zip` under the staging base `zips/`.
- Aggregated import zip (for convenience): see `~/Downloads/telegram_import_*.zip` created during staging.

Dedupe Policy
- Prefer `.md` over `.html` when normalized content matches.
- Prefer `disp_ditto` / `src_ditto` / `HTML_ditto` (macOS `ditto` extraction) over the non‑ditto variant if both exist.
- Keep exactly one canonical file per normalized content group; record all duplicates in `ai-docs/telegram_zip_duplicates.csv`.

Indexes
- Full inventory of .md/.html: `ai-docs/telegram_zip_inventory.csv`
- Duplicate map: `ai-docs/telegram_zip_duplicates.csv`
- Canonical→source registry (this repo → original zip path): `ai-docs/source_registry.csv`
- Overview report: `ai-docs/TELEGRAM_ZIPS_REPORT.md`

Notes
- Internal only. These files originate from third‑party product documentation and should not be redistributed without proper agreements.
- If a new Telegram drop arrives, re‑run the staging procedure and update the registry.
