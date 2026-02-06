#!/usr/bin/env bash
set -euo pipefail

API_BASE=${API_BASE:-http://127.0.0.1:8000}

echo "[1/4] pytest"
pytest -q --cov=scripts --cov-report=term-missing

echo "[2/4] spec_sync"
python .tools/spec_sync.py

echo "[3/4] docs_check"
python .tools/docs_check.py

echo "[4/4] API smokes"
set +e
curl -fsS "$API_BASE/api/metrics" | head -c 200; echo
curl -fsS "$API_BASE/api/districts" | head -c 200; echo
curl -fsS "$API_BASE/api/sites?date=2024-08-03&limit=3&format=csv" | head -n 5
curl -fsS "$API_BASE/api/routes?date=2024-08-03&policy=strict" | head -c 200; echo
set -e

echo "OK"

