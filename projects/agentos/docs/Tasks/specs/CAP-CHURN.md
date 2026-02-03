Title: CAP-CHURN — Compute and display churn

What to change
- `tracker churn` computes git diff stats and appends both JSONL and `docs/Ledgers/Churn_Ledger.csv`; preview prints a Churn block.

Acceptance
1) Finalize a window with commit range.
2) Run `tracker churn --window <id> --provider codex --methodology <tag> --commit-start <shaA> --commit-end <shaB>`.
3) Preview shows `Churn:` lines; ledger gained a new row.

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
