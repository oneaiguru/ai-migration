# AGENTS

## Summary
- Simple Groq Whisper-based voice-to-text tool with keyboard-triggered recording and clipboard copy, implemented in `main.py`/`main_improved.py`.
- Requires `GROQ_API_KEY` env var; shell helpers (`setup_api_key.sh`, `start_groq_whisperer.sh`) wire up the environment and run.

## Installation & Run
1. Python 3.10+; create/activate a venv (`python -m venv .venv && source .venv/bin/activate`).
2. Install dependencies: `pip install -r requirements.txt` (or `requirements_minimal.txt`).
3. Export `GROQ_API_KEY` before running.
4. Start: `python main.py` (or `python main_improved.py`) then hold the PAUSE key to record; release to transcribe and copy to clipboard.

## Tests
- Basic leverage tests under `test_transcription.py`; not run here (requires audio/mic and live API key).

## Dependencies
- `groq`, `pyaudio`, `keyboard`, `pyperclip`, `pyautogui`, plus standard library.

Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
