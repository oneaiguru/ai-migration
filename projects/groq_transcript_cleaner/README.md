# Groq Transcript Cleaner

Small helper to strip Groq Whisperer CLI output down to just the transcribed text.

## Usage

- From repo root: `python projects/groq_transcript_cleaner/transcript_cleaner.py /path/to/cli_output.markdown`
- Pipe from stdin: `cat sample.markdown | python projects/groq_transcript_cleaner/transcript_cleaner.py`
- Normalize + blank lines: `python projects/groq_transcript_cleaner/transcript_cleaner.py --normalize-spaces --separator $'\n\n' sample.markdown`
- Write to file: add `--output /tmp/transcript.txt`

## Behavior
- Detects lines that start with `Transcription:` (case-insensitive) and emits only the text that follows.
- Other CLI noise is discarded.
- Separator between transcripts is configurable via `--separator` (newline by default).
- Use `--normalize-spaces` to collapse repeated whitespace inside each transcript.
