# AGENTS

## Summary
- `llmcodeupdater` processes code from LLM output, backs up existing files, tracks tasks, and writes structured reports for each run.
- The package is import-ready via `setup.py`, and the CLI (`llmcodeupdater.main`) orchestrates encoding conversion, parsing, mapping, and reporting.

## Installation & Run
1. Create an isolated environment (`python -m venv .venv` or similar) and activate it (`source .venv/bin/activate`).
2. Install the package in editable mode: `pip install -e .`.
3. Ensure dependencies (`pyperclip`, `chardet`, `termcolor`, `behave`, `pytest`, etc.) are present; reinstall via `pip install pyperclip chardet termcolor behave pytest`.
4. Run the updater against a repo: `python -m llmcodeupdater.main --git-path /path/to/project --content-file /path/to/llm-output.txt`.
5. For interactive clipboard usage, omit `--content-file` and let the tool read from the clipboard.

## Tests
- `python -m pytest` runs the unit tests under `tests/`.
- `behave tests/features` exercises the BDD steps covering report generation and file updates.

## Dependencies
- `pyperclip`
- `chardet`
- `termcolor`
- `behave`
- `pytest`
- `typing` (provided via `setup.py`)


Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
