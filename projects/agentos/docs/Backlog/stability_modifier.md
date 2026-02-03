# Stability Modifier — Persisted After 7 Days

Why
- Penalize rework by tracking whether window outcomes persist beyond a short horizon.

Depends
- Churn JSONL records with a `persisted_after_7d` boolean field.

Emits
- A stability badge and a quality multiplier adjustment in preview/ledgers.

Outline
- Extend churn JSONL schema with `persisted_after_7d` (default null until computed).
- A small housekeeping job flips the flag 7 days after a window if no follow-up churn touches the same files.
- Preview can show `unstable` when false.

Acceptance
- Field appears in churn records; preview optionally surfaces a stability note.
