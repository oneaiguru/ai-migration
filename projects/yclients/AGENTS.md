# YClients Parser
- FastAPI + Playwright parser that scrapes YClients venues and stores results in Supabase. Entry: `src/main.py` with modes `all|parser|api`.
- Setup: `python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && playwright install chromium`.
- Env: copy `.env.example` to `.env`, fill `SUPABASE_URL`, `SUPABASE_KEY`, `API_KEY`, `PARSE_URLS`, `PARSE_INTERVAL` (seconds). Timeweb template: `.env.timeweb.example`.
- Run: `python src/main.py --mode all` (API + parser), `--mode parser` (parser only), `--mode api` (API only). Docker: `docker-compose up -d`.
- Tests: `python tests/run_tests.py` (all), `python tests/run_tests.py --type unit`, `python tests/run_tests.py --type integration`. Quick import check: `python -c "from src.parser.yclients_parser import YClientsParser; print('ok')"`.
