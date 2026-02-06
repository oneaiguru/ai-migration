Title: CAP-LEDGER-CHECKPOINT-AUTO — Ledger checkpoint automation runs decision card

What to change
- Extend `scripts/automation/ledger_checkpoint.sh` with an optional flag to run the decision card after churn and surface the status in the script output/notes.
- Allow overriding the tracker data directory so automation can target alternate sandboxes.

Acceptance
1) Invoke the script with `--decision-card` and a temporary data dir containing a finalized window (`W0-AUTO`).
2) Verify the token ledger row appends with notes containing the decision status (e.g., `decision=GO`).
3) Confirm `tracker churn` still appends to `docs/Ledgers/Churn_Ledger.csv` and the script prints the decision card summary.

Commands
```
TMP=$(mktemp -d)
cp -R data/week0/live "$TMP/data"
scripts/automation/ledger_checkpoint.sh \
  --window W0-19 --provider codex --task smoke --plan 1 --actual 1 \
  --features 0 --decision-card --data-dir "$TMP/data/week0/live"
```

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
