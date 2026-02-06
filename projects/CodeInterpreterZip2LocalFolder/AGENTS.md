# AGENTS

## Summary
- Scripts to update a project directory from the newest ZIP in a downloads folder, with variants to preserve existing files or replace top-level entries.
- Configuration comes from `config.json`, which provides `project_root` and an optional `downloads_dir` (defaults to the user's downloads folder).

## Installation & Run
1. Use Python 3.10+; optional virtualenv: `python -m venv .venv && source .venv/bin/activate`.
2. Set `project_root` and `downloads_dir` in `config.json`.
3. Pick a mode:
   - `python update_project_from_zip.py` filters out macOS metadata and `__pycache__` entries while preserving files not in the ZIP.
   - `python update_project_preserve.py` extracts the archive contents without deleting anything else.
   - `python update_project_replace.py` removes top-level items that overlap the ZIP before extracting.

## Tests
- `python -m unittest combined_test_update_project` writes fixtures to `/tmp` and exercises the update scripts.

## Dependencies
- Standard library only (json, pathlib, zipfile, logging, shutil, os).

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
