# Bitrix AI Writer

PHP tooling to rewrite Bitrix product descriptions with Claude (CLI + admin UI), plus optimized scripts for faster imports and processing.

## Contents
- `src/` main CLI (`cli.php`) and optimized (`cli_fast.php`) flows, Bitrix/Claude clients, prompt generator, uniqueness checker (+ fast variant).
- `web/admin/` lightweight admin UI/API; demos kept in `demo-claude 2` and `demo-claude 3`.
- `config/` includes `config.example.json` and the live `config.json` (ignored by git; keep for local runs).
- `data/`, `output/`, `logs/` retained for local use; large CSVs present but ignored by git.
- `docs/` user guides, prompt editor, prototype HTML, plus `bitrix-integration-guide.md` and `bitrixVinni.md` from external notes.
- `OPTIMIZED_SCRIPTS_README.md`, `clean_and_reimport.php`, `run_optimized_import.sh` document and run the fast import/processing path.
- `code/` and `0505/` contain earlier reference packages and notes (kept for context; zips were left behind).
- Admin API (web/admin/api.php) now enforces `X-API-KEY` for non-local requests (`admin_api.api_key` in config).

## What to do before running
- Create `config/config.json` (copy from `config/config.example.json` if needed) and fill in real secrets: `bitrix.endpoint/login/password`, `claude.api_key`, and set `admin_api.api_key` for the admin UI. Keep this file local-only (ignored by git).
- Keep the demo files’ placeholder keys as-is; do not backfill real tokens there.
- Optional: clean working dirs for a fresh run: `mkdir -p output logs` and clear old reports/logs if you want a blank slate.

## Quick start
1) Dependencies: `composer install` (vendor is ignored in git).
2) CLI/fast paths:
   - Full reset + import: `php clean_and_reimport.php data/1.csv`
   - Export/import: `php src/cli_fast.php --action=import --file=data/your.csv --parallel-requests=4`
   - Process: `php src/cli_fast.php --action=process --limit=50`
   - Classic flow: `php src/cli.php --action=test-generation --product-id=123`
   - All generation paths honor `claude.temperature/max_tokens/top_p` from config.
3) Admin UI: `php -S localhost:8000 -t web` then open `http://localhost:8000/admin/`. The UI prompts for `X-API-KEY`; local requests can be allowed without a key if `admin_api.allow_local_without_key` is true.
4) Tests: `composer test` or `phpunit` from repo root.

## Validation checklist
- Sanity: `php -l` on changed PHP files (already clean); run `composer test` or `phpunit` if available.
- Connectivity check: `/admin/api.php` → `GET /status` uses a non-billable Claude probe (`checkConnection`) and Bitrix auth attempt; ensure config keys are set first.
- Generation params: verify any new call sites pass temperature/max_tokens/top_p; current CLI/tests/admin endpoints already do.

## Git hygiene
- `.gitignore` excludes secrets/artifacts (`config/config.json`, `data/`, `logs/`, `output/`, `vendor/`, demo upload folders). Keep sensitive config local-only.
- Heavy archives (zips) and the `oiriginal/` bulk folder stayed in the source repo to avoid bloat.
