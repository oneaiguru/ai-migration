#!/usr/bin/env bash
set -euo pipefail
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements-dev.txt || true
export PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg
export MPLCONFIGDIR="$(mktemp -d)"
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py
echo "[OK] Bootstrap eval complete."

