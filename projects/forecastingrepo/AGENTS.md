# Agent Guide

## Read First
- docs/SOP/standard-operating-procedures.md

## Quick Handles
- Tunnel: see Demo Runbook (dynamic BASE)
- Python: use 3.11 (`python3.11 -m pytest -q`)
- Tests: `pytest -q`
- Behave: `behave --tags @smoke`
- Spec sync: `python .tools/spec_sync.py`
- Docs check: `python .tools/docs_check.py`
- OpenAPI: `python scripts/export_openapi.py --check`
- Context bundle: `python tools/concat_context.py`

## Data Hygiene
- Never commit raw data or large generated reports.
- Store inputs/exports under `/Users/m/git/clients/rtneo/_incoming/` (ex: `accuracy_backtest_YYYYMMDD/`).
- Keep repo outputs small and reproducible; use `_incoming` for full backtest bundles.

## Spec Tagging Approach (BDD)
- Use file-level tier tags by default for readability.
- Add scenario-level tags only when a file mixes tiers or needs selective execution.

## Current Next Task
- PR‑2: Backtest driver & scoreboard (no model change)
  - See docs/System/Quicklook.md (Backtest mode) for a runnable example.
  - Background: scripts/backtest_eval.py and tests/backtest/test_backtest_eval.py.
  - Acceptance: scoreboards + SUMMARY.md; no pipeline behavior changes.

Also see docs/Tasks/NEXT_AGENT_BRIEF.md for the broader PR queue and reading list.

**Next Up (Docs & PR Tasks):**
- PR‑14 — Weather behind flag (default OFF; assert no‑change): docs/Tasks/PR-14_weather_flag.md
- PR‑15 — Rolling‑origin backtests: docs/Tasks/PR-15_rolling_origin.md
- PR‑16 — IDW tuning (evaluation‑only): docs/Tasks/PR-16_idw_tune.md

**Next Up (Issues quick links):**
- PLG‑UNI‑001 (search): https://github.com/oneaiguru/forecastingrepo/issues?q=PLG-UNI-001
- FLG‑001 (search): https://github.com/oneaiguru/forecastingrepo/issues?q=FLG-001
- BT‑RO‑001 (search): https://github.com/oneaiguru/forecastingrepo/issues?q=BT-RO-001
- IDW‑TUNE‑001 (search): https://github.com/oneaiguru/forecastingrepo/issues?q=IDW-TUNE-001

**Next Up (Sites S‑series):**
- PR‑S1 — Sites ingest: docs/Tasks/PR-S1_sites_ingest.md
- PR‑S2 — Site baseline + simulation: docs/Tasks/PR-S2_site_baseline_and_sim.md
- PR‑S3 — Reconciliation + QA: docs/Tasks/PR-S3_site_reconcile_and_qa.md
- PR‑S4 — Route recommendations: docs/Tasks/PR-S4_routes_recommend.md
  - Scenario flag (default OFF): scenarios/site_level.yml

## Demo Runbook (fast path)
- Start backend + tunnel and print BASE:
  - `bash scripts/dev/demo_up.sh`
- Verify backend (HTTP + CORS):
  - `scripts/dev/verify_backend.sh <BASE> https://mytko-forecast-ui.vercel.app`
- Point UI to BASE and redeploy (Vercel):
  - `/Users/m/git/clients/rtneo/ui/forecast-ui/scripts/dev/ui_deploy_with_base.sh <BASE>`
- Verify UI (serial smokes):
  - `PW_TIMEOUT_MS=30000 PW_EXPECT_TIMEOUT_MS=12000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --workers=1 --reporter=line`
- Bring down:
  - `bash scripts/dev/demo_down.sh`

## Local Demo (no network)
- Bring up API + UI locally:
  - `scripts/dev/local_demo_up.sh`
- Open:
  - UI:  `http://127.0.0.1:4173`
  - API: `http://127.0.0.1:8000/api/metrics`
- Stop:
  - `scripts/dev/local_demo_down.sh`
- Details: `docs/SOP/LOCAL_DEMO_QUICKSTART.md`

## Agent Roles, Handoff, and Magic Prompts

Local Magic Prompts (root): `CE_MAGIC_PROMPTS/`
- Execute: `CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md`
- Plan: `CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md`
- Research: `CE_MAGIC_PROMPTS/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
- Simple: `CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`

Roles
- Scout: read tasks/specs, collect file:line anchors, define acceptance and constraints.
- Planner: write a testable plan (files to touch, commands, gates) — no edits.
- Executor: implement exactly the plan, record evidence (cURLs, tests, OpenAPI), update handoff.
- Coordinator: package/attach bundles, update review indexes, rename rounds to `N_DONE` when accepted.

Write progress/handoff here
- `docs/SESSION_HANDOFF.md` — append what you did and what’s next (state the next expected role).
- `reviews/README_STATUS.md` — surface current BASE (tunnel) and acceptance notes.
- Round intake: `reviews/YYYYMMDD/N_followup/{inbound,outbound}` with `inbound/INBOUND_INDEX.md`.

Next agent and scope (demo freeze)
- Next role: BE Planner.
- Read: `docs/Tasks/BE_SCOUT_PR18_PR17.md` (scout brief for PR‑18 Site Forecast API and PR‑17 Routes Forecast BE).
- Order: implement PR‑18 BE first, then PR‑17 BE. Keep endpoints read‑only; tests + OpenAPI + curls green; do not change golden.

Tasks/Plans mapping
- Tasks: `docs/Tasks/*.md` — single‑page briefs. Start at `docs/Tasks/BE_START_HERE.md` and `docs/Tasks/NEXT_AGENT_BRIEF.md`.
- Plans: `plans/*.plan.md` — per‑session or per‑PR execution plans.
- Evidence: `reviews/NOTES/*.md`, `reviews/COORDINATOR_DROP/**`, and exported `docs/api/openapi.json`.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
