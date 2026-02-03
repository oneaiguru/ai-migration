# DeepSeek Scheduler AGENT

## Summary
- Automates project, bug, communication, and transcript inputs to DeepSeek for prioritization and scheduling of freelance work.
- Parses tasks, routes them through specialized processors, and schedules execution with off-peak cost awareness using the DeepSeek API.

## Install & Run
- `python -m venv venv && source venv/bin/activate`
- `pip install -r requirements.txt` (runtime dependencies) and `pip install -r requirements-dev.txt` for extra tools/tests.
- Set `DEEPSEEK_API_KEY` (preferred) or update `config.json` with your DeepSeek API key and the file paths under `data/` and `outputs/`.
- CLI entry point: `python main_scheduler.py` (or run the helper shell script `./run-scheduler.sh`).

## Tests
- From the activated virtualenv run `pip install -r requirements-dev.txt` if not already installed.
- Execute `pytest -q tests/` to exercise unit, integration, and BDD scenarios.

## Dependencies
- Runtime: `requests>=2.28.0`, `python-dateutil>=2.8.2`.
- Dev/test: `pytest>=7.0.0`, `pytest-bdd>=6.0.0`, `pytest-mock>=3.10.0`, `pytest-cov>=4.0.0`, `vcrpy>=4.2.0`, `black>=23.0.0`, `flake8>=6.0.0`.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
