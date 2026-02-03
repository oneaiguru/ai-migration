# Recipe — Deliverables Bundle

## Why
Package all key artefacts (plan, TLDR, ledgers, timeline) for handoff.

## Steps
1. Ensure navigation files and timelines are up-to-date
2. Run bundler (once implemented): `scripts/tools/build_bundle.sh --date 2025-10-20`
   - Collects: `plans/<date>_next_session.plan.md`, `docs/SessionReports/<date>_TLDR.md`, `docs/Ledgers/*.csv`, timeline JSON, previews
3. Record bundle path in `docs/SESSION_HANDOFF.md`

## Edge Cases
- If bundler not available yet, manually zip relevant files; note location
- Ensure no secrets in bundle before sharing externally

## Related
- Backlog: `docs/Backlog/deliverables_bundler.md`
