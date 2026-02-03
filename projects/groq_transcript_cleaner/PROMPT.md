# Prompt / End Goal

I need a tiny CLI that takes Groq Whisperer CLI output (markdown or text) and returns only the transcribed lines. It should:
- Match lines starting with `Transcription:` (case-insensitive) and output only the text that follows.
- Support stdin or file inputs.
- Allow joining transcripts with a configurable separator (default newline).
- Optionally normalize whitespace.
- Optionally write output to a file when `--output` is provided.

Use `projects/groq_transcript_cleaner/transcript_cleaner.py` to implement and keep behavior tested.
