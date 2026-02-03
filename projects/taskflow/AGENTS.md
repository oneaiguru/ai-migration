# TaskFlow Agents Guide

## Summary
- Agent orchestration platform that bridges mobile (task prep) and desktop (execution) for Codex/Claude workflows.
- Key pieces: CLI, Telegram bot, FastAPI server + web UI/results viewer, template gallery, and supporting tools.
- Monorepo path: `projects/taskflow` (source: `/Users/m/git/tools/taskflow`, `.DS_Store` intentionally excluded).

## Setup
- Python 3.8+ recommended. From `projects/taskflow`, create a virtualenv if needed:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  ```
- Install runtime deps: `pip install -r requirements.txt`; for full dev/test tooling use `pip install -r requirements-dev.txt` or `pip install -e .[dev]`.
- Copy `.env.example` to `.env` and fill required env vars (see `docs/configuration.md` for TELEGRAM_TOKEN, WEB_* creds, etc.). `tools/run.sh` sets `PYTHONPATH` when invoking components.

## Run
- CLI: `./tools/run.sh cli <command>` (e.g., task execution helpers).
- API server: `./tools/run.sh server` (FastAPI on `WEB_HOST`/`WEB_PORT`, defaults `0.0.0.0:8000`, HTTP Basic creds from env).
- Results viewer: `./tools/run.sh webui` (serves web UI for task outputs/templates).
- Telegram bot/scheduler: `./tools/run.sh bot` once bot env vars are populated.

## Tests
- Primary: `pytest` from repo root.
- Lint: `flake8 bot/`.
- Shell: `bash -n tools/*.sh`.
- Run applicable checks before opening PRs when feasible.

## Dependencies
- Runtime: `pyTelegramBotAPI`, `GitPython`, `python-dotenv`, `requests`, `schedule`, `fastapi`, `uvicorn`, `httpx`.
- Dev/test: `pytest`, `pytest-cov`, `pytest-mock`, `flake8`, `black`, `mypy`.

## Upstream conventions (reference)
- Historical commit tag format: `[PENDING-L4]` or `[AI-L4]` prefix, subject as `[TAG] scope: summary`.
- Upstream branch naming: `task/<task-id>-<short-description>` (features `feature/<name>`, fixes `fix/<name>`).

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
