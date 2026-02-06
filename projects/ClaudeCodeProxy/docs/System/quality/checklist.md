# Quality Checklist

Use this checklist before wrapping a window or handing off to the next agent.

## Required
- `go test ./...` run under `services/go-anth-shim` (and any touched modules).
- `shellcheck` clean on all modified shell scripts (`bin/cc*`, `scripts/**/*.sh`).
- Logs/usage artifacts rotated or archived (avoid committing bulky `logs/usage*.jsonl`).
- Smoke test (`make smoke-license` or appropriate target) executed when changes affect routing/licensing.

## Recommended
- `make summarize && make verify-routing` after proxy changes.
- Manual `claude -p` sanity check on the active lane (Haiku via Z.AI, Sonnet on Anthropic).
- Update `docs/SESSION_HANDOFF.md` with commands run, toggles used, and outstanding TODOs.

## Notes
- Record exceptions (e.g., network constraints preventing smoke test) in the handoff so the next agent can follow up.
- Keep environment profiles in mind: run tests in the profile (dev/prod) that matches your changes.
