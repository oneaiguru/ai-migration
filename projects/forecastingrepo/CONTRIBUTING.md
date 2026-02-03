# Contributing

## Workflow
- Open a PR to `main`; direct pushes are blocked.
- Use Conventional Commits (feat:, fix:, docs:, test:, chore: ...).
- PRs must be green on:
  - tests (pytest, coverage ≥85% global)
  - spec-sync (.tools/spec_sync.py)
  - docs-check (.tools/docs_check.py)
  - critical coverage (scripts/ingest_and_forecast.py ≥90%)

## How to run locally
```
pip install -r requirements-dev.txt
pytest -q --cov=scripts --cov-report=xml
python .tools/spec_sync.py
python .tools/docs_check.py
```

## Code ownership
See .github/CODEOWNERS — protected paths require review by code owners.
