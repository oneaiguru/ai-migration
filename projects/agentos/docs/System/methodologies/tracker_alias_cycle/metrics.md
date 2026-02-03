# Metrics

- **Alias adoption:** count of windows recorded via alias vs direct CLI (`data/week0/live/state/*.json`).
- **Snapshot accuracy:** ratio of alias-ingested snapshots that pass parser validation (no `errors` aside from expected informational notes).
- **Undo frequency:** number of `tracker alias delete` operations per session (tracked in `progress.md`).
- **Command latency:** time between alias invocation and JSONL update (spot-check via `captured_at` entries).
