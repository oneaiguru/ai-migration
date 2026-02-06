# YClients Parser - Migration Plan

**Source:** `/Users/m/git/clients/yclents/yclients-local-fix/`  
**Target:** `~/ai/projects/yclients/`  
**Size:** ~4 MB core (no git history) or ~286 MB with `.git/`

## 1) Scope & Usage
- **Active code to migrate (required):** Core app (FastAPI + parser) ~40-50 files.
- **Entry points:** `src/main.py` (API + parser modes), `startup.py` (enhanced), `super_simple_startup.py` (minimal).
- **Core logic:** `src/parser/yclients_parser.py` (186 KB, 3-month rolling cutoff), `production_data_extractor.py`, `yclients_real_selectors.py`.
- **Integrations:** `src/database/` (Supabase), `src/api/` (FastAPI routes/auth), `src/browser/` (Playwright setup), `src/export/`, `src/scheduler/`.
- **Config & deployment:** `config/settings.py`, `config/logging_config.py`, `config/venue_pricing.py` (multi-venue pricing), `requirements.txt`, `Dockerfile`.
- **Docs to bring:** `CLAUDE.md`, `README.md`, deployment guides.
- **Dead/skip:** Parser backups, old versions (`enhanced_data_extractor.py`, `improved_yclients_parser.py`, etc.), `H*HANDOFF*.md`, test exports (`booking_export_*.csv`), old dirs (`yclients-parser*/`), viewer apps (`viewer/`, `new-viewer/` unless explicitly requested), archives (`*.zip`, `*.tar.gz`), backups (`*.bak`, `*.backup*`), `.claude-trace/`, `venv/`, `node_modules/`.

## 2) Layout & Targets
- 1:1 copy; no renames/flattening.
- Source to target:
  - `src/` -> `~/ai/projects/yclients/src/`
  - `config/` -> `~/ai/projects/yclients/config/`
  - `tests/` -> `~/ai/projects/yclients/tests/`
  - `scripts/` -> `~/ai/projects/yclients/scripts/`
  - Root files -> `requirements.txt`, `Dockerfile`, `docker-compose.yml`, `.env.example`, `.gitignore`, `startup.py`, `super_simple_startup.py`, `CLAUDE.md`, `README.md`.
- Optional: include `.git/` only if git history is needed (adds ~282 MB; prefer clean start).

## 3) Run Commands
Installation:
```bash
cd ~/ai/projects/yclients
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
playwright install-deps chromium
cp .env.example .env  # then fill real secrets
```

Run modes:
- Full app: `python src/main.py`
- Parser only: `python src/main.py --mode parser`
- API only: `python src/main.py --mode api`
- Docker: `docker-compose up [-d]`; logs `docker-compose logs -f`

Tests:
- All: `python tests/run_tests.py`
- Coverage: `python tests/run_tests.py --coverage`
- Quick import checks (examples):
  - `python -c "from src.parser.yclients_parser import YClientsParser; print('OK parser')"`
  - `python -c "from src.database.db_manager import DatabaseManager; print('OK database')"`
  - `python -c "from src.api.routes import app; print('OK api')"`

Exports:
- API: `curl "http://localhost:8000/data?limit=1000" -H "X-API-Key: <key>" > export.json`
- Direct CSV (async snippet below) via `CsvExporter`.

## 4) Ignore / Keep Rules
- **Exclude:** `venv/`, `viewer/node_modules/`, `viewer/.next/`, `.playwright/`, `__pycache__/`, `*.pyc`, `*.pyo`, `*.egg-info/`, `dist/`, `build/`, `.env`, `.env.local`, `viewer/.env*`, `*.pem`, `*.key`, `.claude-trace/`, `*.log`, `booking_export_*.csv`, `HANDOFF_*.md`, `MESSAGE_FOR_*.md`, `SESSION_*.md`, `CRITICAL_*.md`, `TEST_RESULTS_*.md`, `*.bak`, `*.backup*`, `*-original.*`, `*.tar.gz`, `*.zip`, old dirs (`yclients-parser*/`, `tmp-timeweb/`, `archive/`), optional apps (`viewer/`, `new-viewer/`).
- **Keep:** `.env.example`, `.env.timeweb.example`, `viewer/.env.example` (templates), `tests/fixtures/` (if small), `.gitignore`.

## 5) External Services
- **Supabase (primary DB):** `https://rlcquyttvqclcxeeghtz.supabase.co`; tables `booking_data`, `urls`; service role key required. Keep placeholders in `.env`; do not commit real keys.
- **YClients target venues:** Lunda Padel (b1280372), Padel Friends (b861100), Padel A33 (b918666), TK Raketlon (b1009933), Korty-Setki (n1308467), Nagatinskaya (n1165596). Uses Playwright session cookies; no API creds.
- **TimeWeb deploy:** `https://server4parcer-parser-4949.twc1.net` auto-deploys from GitHub `server4parcer/parser.git`. Document only.

## 6) Known Risks
- Size: clean copy ~4 MB; with deps/git/history up to 1.4 GB+. Exclude deps; reinstall via pip/Playwright.
- Secrets: `.env`, `.env.local`, `viewer/.env.local` hold Supabase keys; ensure `.gitignore` and template use only placeholders, and rotate if exposed.
- Python 3.10+ required (see Dockerfile).
- Supabase schema not included; run `scripts/setup_db.py` or create tables per `src/database/models.py`.
- No LICENSE file; add later if needed.

## 7) Verification Plan
1) Imports: run the three quick import checks above.  
2) Config:
```bash
python - <<'PY'
from config.settings import SUPABASE_URL, API_PORT
    print(SUPABASE_URL[:30] + '...')
    print(API_PORT)
    print('Config loaded')
PY
```
3) DB connection:
```bash
python - <<'PY'
import asyncio
from src.database.db_manager import DatabaseManager
async def test():
    db = DatabaseManager()
    await db.initialize()
    print('Database connected')
    await db.close()
asyncio.run(test())
PY
```
4) API health:
```bash
python src/main.py --mode api &
sleep 5
curl http://localhost:8000/status
pkill -f "python src/main.py"
```
Expect `{"status": "ok", ...}`.

5) Parser smoke (single URL):
```bash
python - <<'PY'
import asyncio
from src.parser.yclients_parser import YClientsParser
from src.database.db_manager import DatabaseManager
async def test():
    db = DatabaseManager()
    await db.initialize()
    parser = YClientsParser(
        urls=["https://b1280372.yclients.com/company/1168982/personal/select-services?o="],
        db_manager=db,
    )
    results = await parser.parse_url(parser.urls[0])
    print(f"Parser extracted {len(results)} records")
    await db.close()
asyncio.run(test())
PY
```
Expect 100+ records for Lunda Padel.

6) Docker: `docker-compose up -d`, wait ~30s, `curl "http://localhost:8000/status?api_key=<key>"`, check logs for "Parser started", then `docker-compose down`.

## 8) File Inventory (used)
- `src/main.py`, `startup.py`, `super_simple_startup.py`.
- `src/parser/`: `yclients_parser.py`, `production_data_extractor.py`, `yclients_real_selectors.py`, `parser_router.py`.
- `src/database/`: `db_manager.py`, `models.py`, `queries.py`.
- `src/api/`: `routes.py`, `auth.py`.
- `src/browser/`: `browser_manager.py`, `stealth_config.py`, `proxy_manager.py`.
- `src/export/`: `csv_exporter.py`, `json_exporter.py`.
- `src/scheduler/`: `cron_manager.py`.
- `config/`: `settings.py`, `logging_config.py`, `venue_pricing.py`.
- `tests/`: `run_tests.py`, `test_parser.py`, `test_database.py`, `test_api.py`, `test_integration.py`.
- `scripts/`: `setup_db.py`, `update_db_schema.py`.
- Root: `Dockerfile`, `docker-compose.yml`, `requirements.txt`, `.env.example`, `.gitignore`, `CLAUDE.md`, `README.md`.

## Execution Steps
1) `mkdir -p ~/ai/projects/yclients` and `cd` there.  
2) Copy directories/files via `rsync`/`cp` following the source-target map and excludes in section 4.  
3) Set up env and dependencies (section 3).  
4) Run verification plan (section 7).  
5) Initialize DB: `python scripts/setup_db.py`.  
6) Start app `python src/main.py`; check `http://localhost:8000/status`.

## Post-Migration
- Optionally archive original to `/Users/m/git/clients/yclents/yclients-local-fix.archive/` once smoke tests pass.
- For git init (if needed): `git init`, add, and commit with message summarizing parser, pricing, Supabase integration, FastAPI, Playwright, exports.

## Critical Notes
- Parser uses 3-month rolling cutoff (see `src/parser/yclients_parser.py` around date logic).  
- `venue_pricing.py` supports multiple venues with distinct pricing rules.  
- Do not commit real Supabase/API keys; use `.env.example` placeholders only.  
- Aim for 100+ records from a venue in smoke tests before declaring migration done.  
- Reinstall dependencies (Playwright browsers ~110 MB, Python packages ~70 MB) rather than copying caches.

## Estimated Timeline
- File copy: ~5 minutes (4 MB core).  
- Env setup: ~10 minutes (pip + Playwright).  
- Config: ~5 minutes (.env).  
- Verification: ~15 minutes.  
- Total: ~35 minutes for clean migration.
