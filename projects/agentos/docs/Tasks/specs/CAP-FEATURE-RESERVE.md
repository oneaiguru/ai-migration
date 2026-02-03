Title: CAP-FEATURE-RESERVE — Reserve feature rows in ledger

What to change
- Add a helper script `scripts/tools/reserve_feature.py` that appends planned rows to `docs/Ledgers/Feature_Log.csv` (append-only) with empty evidence/outcome fields.
- The script should accept `--window`, `--capability`, `--description`, and optional `--notes` arguments.

Acceptance
1) Run the script with a new capability/window combination.
2) Confirm `docs/Ledgers/Feature_Log.csv` gains a row with `planned` populated and other columns blank.
3) Running it again with a different capability/window appends another row (no overwrites).

Commands
```
python scripts/tools/reserve_feature.py \
  --window W0-N --capability CAP-LEDGER-CHECKPOINT-AUTO \
  --description "Automation checkpoint auto decision" \
  --notes "planned 2025-10-20"
```

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
