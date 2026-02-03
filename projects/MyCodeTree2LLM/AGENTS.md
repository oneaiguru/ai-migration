# AGENTS

## Summary
- Automates project file selection and workflow runs with unified key mappings and directory tree generation.
- CLI entrypoints: `project_manager.py` (project setup/switch), `workflow_automation.py` (run selection + tree), `select_files.py` / `run_file_selection.py` (interactive chooser).

## Installation & Run
1. Use Python 3.7+; create and activate a virtualenv (`python -m venv .venv && source .venv/bin/activate`).
2. Install dependencies: `pip install -r requirements.txt`.
3. Configure `config.json` and `projects.json` with your project roots and selection preferences.
4. Run commands from the repo root:
   - `python project_manager.py setup` to copy helper scripts for the current project.
   - `python project_manager.py switch -p <index|name>` to change projects.
   - `python workflow_automation.py` to run the workflow (generate `tree.txt`, perform selection).
   - `python select_files.py` or `python run_file_selection.py` for interactive selection only.

## Tests
- `pytest` (uses `pytest.ini` to discover unit and BDD feature tests).

## Dependencies
- Python: `rich`, `readchar`, `pyperclip`, `psutil`, `pytest`, `pytest-bdd`, `pytest-cov`, `coverage`, `pytest-mock`, `behave`.
- Frontend (if editing UI): install in `frontend/` with `npm install` (Vite/TypeScript).

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
