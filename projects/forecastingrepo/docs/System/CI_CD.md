# CI/CD Pipeline
## Jobs (GitHub Actions)
1) setup: cache deps; install `requirements-dev.txt`
2) test: `pytest --cov=scripts --cov-report=xml`
3) spec-sync: `python .tools/spec_sync.py`
4) docs-check: `python .tools/docs_check.py`
5) (optional) lint: ruff/black --check
6) artifacts: upload coverage, `delivery/` (if e2e creates it)

## Required Status Checks
- tests-green, spec-sync-ok, docs-ok, coverage-threshold
