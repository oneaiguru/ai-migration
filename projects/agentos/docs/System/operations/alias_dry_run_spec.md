# Alias Dry-Run + Safeguards — Spec (Stub)

Overview of CLI changes for `tracker alias --dry-run` and lockfile checks.

- Dry-run prints would-be snapshot JSON without modifying JSONL files.
- Lock manager checks `data/automation/locks/<provider>.lock`; exits with warning if busy.
- Integrate with automation scripts so scheduled jobs respect locks.

Fill with detailed argument parsing/UX notes before implementation.
