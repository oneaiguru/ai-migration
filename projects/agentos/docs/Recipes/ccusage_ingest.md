# Recipe — ccusage Ingest

## Why
Record Codex token usage (daily, weekly, session) from ccusage-codex and ingest into tracker.

## Steps
1. Run `npx @ccusage/codex@latest session --json > tmp_ccusage_session.json`
2. Run `npx @ccusage/codex@latest daily --json > tmp_ccusage_daily.json` (captures latest reset + per-day totals).
3. If you have weekly exports, save them to `tmp_ccusage_weekly.json`; otherwise reuse the latest upstream CSV/JSON and tag it as a backfill.
4. In tracker data dir ingest each scope (notes optional):
   * `< tmp_ccusage_session.json tracker ingest codex-ccusage --window W0-XX --scope session --stdin --notes automation:ccusage-session`
   * `< tmp_ccusage_daily.json tracker ingest codex-ccusage --window W0-XX --scope daily --stdin --notes automation:ccusage-daily`
   * `< tmp_ccusage_weekly.json tracker ingest codex-ccusage --window W0-XX --scope weekly --stdin --notes backfill:weekly`
5. Preview: `tracker preview --window W0-XX`

## Expected Output
- `codex_ccusage.jsonl` appended with session/daily/weekly rows stamped with schema/tool versions
- Preview shows ccusage lines for weekly/daily/session including reset info

## Edge Cases
- CLI version changes → update fixtures + blessed schema (run `ccusage --help` to confirm current flags).
- Weekly exports are not always shipped; if missing, record a trusted fixture and mark `notes=backfill` to show it is synthetic.
- Offline mode: `--offline` to avoid external fetch

## Related
- Backlog: `docs/Backlog/data_schemas_ledgers.md`
- Feature: `features/tracker_ccusage.feature`
- See also: `docs/System/schemas/universal_provider_schema.md`, `docs/System/stats/ci_acceptance.md`, `docs/System/experiments/templates.md`
