# AGENTS — Adesk Migration Toolkit (VIPFLAT)

Purpose
- Final PHP toolkit for migrating VIPFLAT CSV exports into Adesk (API v1 token in `.env`).

Quick start
- Duplicate `.env.example` to `.env` and fill `ADESK_API_TOKEN` (other values optional).
- Place CSVs in `newfiles/` (accounts, contacts, target, debet/credit, moving, etc.).
- Dry-run validator: `php csv-validator.php newfiles/`
- Interactive menu: `./run_migration.sh` (or scripted: `php migrate.php --mode=full --entity=all`).
- Logs land in `logs/` and mappings in `data/mappings/` (kept empty in repo).

Notes
- Keep secrets out of git (`.env` ignored). Add CSVs/mappings only locally.
- Scripts default to API rate-limit friendly settings; adjust env vars if needed.
