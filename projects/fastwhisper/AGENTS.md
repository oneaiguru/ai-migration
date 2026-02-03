# AGENTS

## Summary
- Audio transcription tool built on `faster-whisper` with file management, deduplication, and retry logic (`fastwhisper/main.py` with core utilities under `fastwhisper/core/`).
- Operates on `data/` folders (input/processed/transcript/archive/remote) selected relative to project root or `/mnt/data` when `ENVIRONMENT=code_interpreter`; models are downloaded under `data/models`.

## Installation & Run
1. Python 3.10+ recommended; create a venv (`python -m venv .venv && source .venv/bin/activate`).
2. Install deps: `pip install -e .` (pulls `faster-whisper`, `torch`, and other requirements; GPU optional).
3. Run transcription: `python -m fastwhisper.main --language en` (ensure `data/input/` has audio files).

## Tests
- Unit/BDD tests under `tests/` and `fastwhisper/tests/`; not run here (depend on whisper model + torch).

## Dependencies
- faster-whisper (and torch backend)
- Standard lib (pathlib, argparse, os), plus any transient deps in `setup.py`.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
