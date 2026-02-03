# AGENTS.md template

- What: <2–3 sentences on project purpose>
- Run backend tests: python -m pytest (or pytest -q)
- OpenAPI check (if applicable): python scripts/export_openapi.py --check
- UI build (if applicable): npm run build
- Start stack (if applicable): API_PORT=8000 FORECAST_UI_PORT=4173 MYTKO_UI_PORT=5174 bash scripts/dev/start_stack.sh
