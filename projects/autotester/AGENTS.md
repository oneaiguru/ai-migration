# AGENTS

## Summary
- Python toolkit for automated test execution, PEP 8/complexity checks, dependency graphing, docstring-based docs, and TODO/FIXME aggregation, plus feedback capture.
- Primary workflow script (`autotester/src/main_workflow.py`) chains the tools and writes reports/feedback into a chosen output directory.

## Installation & Run
1. Python 3.10+ recommended; create/activate a venv (`python -m venv .venv && source .venv/bin/activate`).
2. Install in editable mode from the repo root: `pip install -e .` (pulls pycodestyle, radon>=6, networkx, matplotlib).
3. Run the full workflow: `python autotester/src/main_workflow.py /path/to/project /path/to/output`.
4. Components also run standalone, e.g. `python -m autotester.src.code_quality_checker.main /path/to/project` or invoke the helpers under `autotester/src/` directly.

## Tests
- Unit tests live under `autotester/tests/`; run with `python -m unittest discover autotester/tests` after installing dev deps.

## Dependencies
- pycodestyle
- radon (>=6.0.0)
- networkx
- matplotlib
- Standard library (logging, pathlib, json, etc.)

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
