# Session Decisions – 2025-10-19

- **Reset handling**: Treat Codex 5h limits as minute-by-minute rolling windows; record `reset_at` in timeline instead of hard-coding hours.
- **Security posture**: Assume local/intra use; keep event logs under .gitignore by default; add optional “secure mode” when sharing externally.
- **Token governor**: Advisory only; issues warnings >75%; must allow override (`--force`).
- **Plan compiler**: Auto-generated stubs must be cleaned before DoD; placeholders are not “done.”
- **Drift watchdog**: Use thresholds + ignore lists; human review before failing builds.
- **Launchd scheduler**: Optional opt-in; document disable path; ensure wrappers avoid duplicate runs.
- **What-if estimator**: If n<3, return “insufficient data” instead of routing advice.
- **Bandit roadmap**: Phase-based roll-out with replay validation + sign-off before live routing.
- **Events JSON**: Store codex exec events locally under .gitignore; no forced redaction until logs leave the repo.
- **Ledgers**: Add tool_version/schema_version fields; ledger updates required per DoD.
- **Contracts**: Keep docs flat; cite sources `path:line`; JSONL append-only.

