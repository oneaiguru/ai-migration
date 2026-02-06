# TODO (next steps)

- Add configurable output paths/years for README generation:
  - `scripts/build_readme.py` should read desired years and output folder from a config (e.g., config/readme_config.toml).
- Add shipment log (TOML) for sent archives/zips:
  - Include name, timestamp, source README path, files count, and zip name if created.
- Clean redundant raws:
  - Original account folders and `missing/` are duplicates (hash-verified); safe to delete once archived.
  - Remove `raw-consolidated/raw-matched/` (all duped); decide on `raw-extra/` personal uniques.
- Docs note:
  - Clarify which docs are generated (`docs/current/*`) vs static guidance (`agent-mode`, `2025-planning`).
