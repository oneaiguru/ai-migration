# Metadata files

## accounts.toml (root)
- Source of truth for account IDs, aliases, currency, type, and status.
- Edit this file to change aliases/types; all reports and renamed files regenerate from it.

## statements.toml
- Auto-generated inventory of every XLSX statement.
- Fields per `[[statement]]`:
  - `src`: Original XLSX path (relative to repo root)
  - `account_id`: Account ID
  - `alias`: Alias from `accounts.toml`
  - `start`, `end`: Date range (ISO)
  - `dest`: Target renamed filename (`alias_start_end.xlsx` under `renamed-statements/`)

## build_statements.py
- Regenerates `statements.toml` from the current XLSX headers (reads “Период / Period”).
- Command: `python metadata/build_statements.py` (run from repo root).
- Uses `accounts.toml` for aliases/types and reuses the header-parsing logic.
