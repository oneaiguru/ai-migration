# AGENTS

## Summary
- CLI helper that strips Groq Whisperer CLI output down to the `Transcription:` payloads.

## Usage
- From repo root: `python projects/groq_transcript_cleaner/transcript_cleaner.py <file>` or pipe stdin.
- Options: `--normalize-spaces` to collapse repeated whitespace; `--separator` to change joiner (default newline).

## Tests
- `python -m pytest projects/groq_transcript_cleaner/tests/test_transcript_cleaner.py` (not run here).
