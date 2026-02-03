# Decision Card — GO / SOFT GO / NO-GO

Purpose
- Provide a quick, reproducible gate at end-of-window to decide whether to proceed, pause, or reject closeout.

Inputs
- `data/week0/live/windows.jsonl`, `anomalies.jsonl`
- `docs/Ledgers/Acceptance_Evidence.csv`, `docs/Ledgers/Churn_Ledger.csv`

Command
```
python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>
```

Rules
- GO: anomalies=0, window finalized with outcome ∈ {pass, partial}, evidence≥1, churn≥1
- SOFT GO: anomalies=0 and finalized/outcome ok, but missing evidence or churn
- NO-GO: any anomalies, not finalized, or missing outcome

Operator Notes
- Append the decision line into `docs/SESSION_HANDOFF.md` with the command used.
- If NO-GO due to missing evidence/churn for a clean window, address those ledgers and re-run.

