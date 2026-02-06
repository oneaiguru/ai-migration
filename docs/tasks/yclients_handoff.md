# YClients Handoff (post-import)

## Current status
- PR 107 merged (`projects/yclients` imported with FastAPI + Playwright + Supabase).
- Env templates kept (`.env.example`, `.env.timeweb.example`) with placeholders; no secrets committed.
- Known issue: Lunda pricing/venue mismatch between browser verification and exported CSV (see below).

## Critical open issue (Lunda pricing)
- Browser agent (see `docs/tasks/yclients_verification_checklist.md`) shows Lunda tariffs: 6,000 / 6,250 / 6,500 (1h) with 1.5h/2h variants; venue-specific.
- CSV/database currently shows wrong venue label and wrong prices (older data / different venue).
- Suspect areas: `config/venue_pricing.py`, `src/parser/production_data_extractor.py` price mapping, or URL->venue identification in `src/parser/yclients_parser.py`.

### Repro + validate
1) Populate `.env` (or set env vars) with real `SUPABASE_URL`, `SUPABASE_KEY`, `API_KEY`, and set `PARSE_URLS` to Lunda only:
   ```
   PARSE_URLS=https://b1280372.yclients.com/company/1168982/personal/select-services?o=
   PARSE_INTERVAL=600
   ```
2) Install deps in a venv and Playwright chromium:
   ```
   cd projects/yclients
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   playwright install chromium
   ```
3) Run a single parse to Supabase (adjust API key as needed):
   ```
   python src/main.py --mode parser --urls https://b1280372.yclients.com/company/1168982/personal/select-services?o= --once
   ```
4) Check Supabase `booking_data` filtered by URL/venue for:
   - venue name = Lunda (not "court 1/2" from another venue)
   - prices matching 6,000 / 6,250 / 6,500 (1h) and scaled prices for 1.5h/2h.
5) If incorrect, inspect:
   - `config/venue_pricing.py` mappings for Lunda
   - `ProductionDataExtractor.get_universal_price` and time-of-day tariff selection
   - URL->venue resolution in `YClientsParser` (ensure Lunda URL uses the right venue_id/pricing block)

## Quick run/test commands
- Imports sanity: `python -m compileall projects/yclients/src projects/yclients/tests`
- Full tests (require Playwright/Supabase env): `python tests/run_tests.py`
- API + parser: `python src/main.py --mode all`
- Docker: `docker-compose up -d`

## Reference
- Completion plan: `docs/tasks/yclients_plan_async_painting_galaxy.md`
- Live verification script/checklist: `docs/tasks/yclients_verification_checklist.md` (Lunda tariffs, date/time expectations).
- Target path: `projects/yclients/` (entry `src/main.py`; routes in `src/api/routes.py`).
