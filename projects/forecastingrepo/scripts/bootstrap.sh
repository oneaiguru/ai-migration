#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements-dev.txt ${REQ:-}

export PYTHONHASHSEED=0
export TZ=UTC
export LC_ALL=C.UTF-8
export MPLBACKEND=Agg
export MPLCONFIGDIR="$(mktemp -d)"

pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py

# Optional: start read-only API for demo
if [[ "${START_API:-0}" == "1" ]]; then
  echo "Starting API at http://127.0.0.1:${PORT:-8000} ..."
  uvicorn scripts.api_app:app --host 127.0.0.1 --port "${PORT:-8000}"
  exit 0
fi

cat <<EOF
Bootstrap complete.

To run the demo API:
  source .venv/bin/activate
  START_API=1 PORT=8000 bash scripts/bootstrap.sh

Endpoints:
  GET /api/metrics
  GET /api/districts
  GET /api/sites?date=YYYY-MM-DD
  GET /api/routes?date=YYYY-MM-DD&policy=strict|showcase
EOF
