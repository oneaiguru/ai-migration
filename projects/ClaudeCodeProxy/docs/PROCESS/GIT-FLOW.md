# Git Flow — Milestones R0/R1/R2

This project ships in thin, testable increments. Each milestone (R0, R1, R2, …) follows the same branch/PR/tag pattern so history stays clean and reproducible.

## Branching

- `main` — protected, always green, release tags only.
- `feature/<milestone>-<slug>` — e.g. `feature/r1-routing`, `feature/r2-quotas`.
- `fix/<slug>` or `docs/<slug>` — small follow‑ups as needed.

Create a branch from the latest `main`:

```
git switch main && git pull
git switch -c feature/r1-routing
```

## Commits

- Squash granular WIP into meaningful commits before PR.
- Message style: concise summary + bullet list of notable changes.
- Prefer grouping by milestone: “R1 hardening: …”.

Example:

```
R1 hardening: routing + readiness

- Catalog routing, /readyz JSON, manual override decision logging
- 5xx single-lane fallback, JSON/SSE timeouts
- Atomic JSONL writes, rotation mutex; docs/tests updated
```

## Pull Requests

- Title: `R<n> — <scope>` (e.g. `R1 — Multi‑model connectors + routing MVP`).
- Checklist:
  - [ ] Unit tests added/updated; `go test ./...` green
  - [ ] No logs/results/binaries in diff
  - [ ] Docs updated (OPS/PROD-TESTS/Tasks handoff)
  - [ ] Handoff notes appended to `docs/SESSION_HANDOFF.md`

## Tags & Releases

- After review/merge to `main`, tag the milestone:

```
git switch main && git pull --ff-only
# Tag format: r0, r1, r2 … (annotated)
git tag -a r1 -m "R1 — routing MVP, readiness, fallback"
git push origin r1
```

- Generate release notes (since previous tag):

```
make release-notes  # prints notes since last tag
```

Paste notes into the GitHub Release description if applicable.

### Integration Baselines (tags)
- For cross‑repo integrations, add an “integration ready” tag after JOINT UAT passes, e.g.:
  - `r3.6-bridge-ready` (CCC) and matching tag in the partner repo.
- Record the tag pairs in `docs/integration/DUAL_AGENT/ARTIFACT_INDEX.md`.

## Changelog (lightweight)

- We keep milestone summaries in commit messages + GitHub release body.
- For deep artifacts, link to `results/` snapshots and `docs/Tasks/*_HANDOFF.md` in the release.

## Hygiene rules

- `.gitignore` must exclude `logs/`, `results/`, local binaries, and OS junk.
- Never commit API keys, packs, or trace logs.
- Keep changes scoped and documented; avoid wide‑ranging refactors in milestone PRs.

## Quick commands

```
# Start a milestone branch
git switch -c feature/r2-quotas

# Commit (squash prior WIP as needed)
git add -A && git commit -m "R2 scaffolding: quotas engine + endpoints"

# Open PR, then after merge tag release
git tag -a r2 -m "R2 — quotas + budget guards (MVP)" && git push origin r2

# Generate notes since last tag
make release-notes
```
