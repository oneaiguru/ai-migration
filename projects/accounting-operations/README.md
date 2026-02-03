# Handoff for Next Agent (code-only -> data-aware)

## Paths (absolute)
- Data root (keep untouched): /Users/m/Documents/accounting/bank
- Code repo (current): /Users/m/ai/projects/accounting-operations
- Backup: /Users/m/Documents/accounting/bank-backup.zip

## Goal
Use the code repo at /Users/m/ai/projects/accounting-operations while reading data from /Users/m/Documents/accounting/bank. Do NOT modify delivered sets:
- /Users/m/Documents/accounting/bank/renamed-statements/
- /Users/m/Documents/accounting/bank/renamed-statements-2025/
- /Users/m/Documents/accounting/bank/audits/audit2023-2024/

## Env
Set DATA_ROOT to the data path and OUTPUT_ROOT for generated docs (run inside the repo):
```
export DATA_ROOT=/Users/m/Documents/accounting/bank
export OUTPUT_ROOT=/Users/m/ai/projects/accounting-operations/docs/current
# Optional if not relying on scripts/build_readme.py to set sys.path:
export PYTHONPATH=/Users/m/ai/projects/accounting-operations
```
scripts/build_readme.py now prepends the repo root to sys.path, so PYTHONPATH is usually unnecessary.

## Regenerate inventory/reports/README
```
cd /Users/m/ai/projects/accounting-operations
DATA_ROOT=$DATA_ROOT python metadata/build_statements.py       # builds statements.toml in DATA_ROOT
DATA_ROOT=$DATA_ROOT python generate_reports.py                # writes reports to DATA_ROOT
DATA_ROOT=$DATA_ROOT OUTPUT_ROOT=$OUTPUT_ROOT python scripts/build_readme.py  # README to OUTPUT_ROOT/README.md
```

## Audit packaging
```
DATA_ROOT=$DATA_ROOT python audits/build_audit.py
```
(Uses config/audit_config.toml; copies renamed files and README to audits/audit2023-2024/.)

## Do NOT delete
- renamed-statements/, renamed-statements-2025/, or audits/audit2023-2024/ in the data root.

## Safe to delete (after backup)
- Original XLSX in account folders and missing/ (all duplicates elsewhere), once you choose.

## Notes
- DATA_ROOT must remain /Users/m/Documents/accounting/bank; leave renamed-statements/, renamed-statements-2025/, and audits/audit2023-2024/ untouched.
- OUTPUT_ROOT should point to docs/current inside the repo when generating README.

## Ship log
Record shipments in config/ship_log.toml (name, timestamp, source README, files, zip).

## Current state
- Data: 30 business files in renamed-statements (2023–2024), 5 overlap files in renamed-statements-2025.
- metadata/statements.toml rebuilt from renamed-statements (business only).
- Docs in code repo under docs/; generated README goes to docs/current/ when OUTPUT_ROOT is set.
