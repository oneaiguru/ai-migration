# Show-&-Ask Packet — W0-CHP-3 (Codex)

Owner: you
Status: pending AFTER pane (observe-only)

## Paste Outputs Here (after close)

- Preview (first 40–60 lines):
- Decision Card (full):
- Window Audit JSON: `logs/W0-CHP-3_window_audit.json` (attach or paste top-level object)
- Evidence rows appended: `docs/Ledgers/Acceptance_Evidence.csv` (commit the diff)
- Ledgers touched: `Token_Churn_Ledger.csv`, `Churn_Ledger.csv` (commit the diff)

## Close Commands (run in order when AFTER is ready)

```bash
# 0) Env
PATH="tracker/.venv/bin:$PATH"; source scripts/tracker-aliases.sh; export AGENT_ID=main

# 1) Store AFTER
cat </path/to/after_pane.txt> | oe --window W0-CHP-3

# 2) Finalize & churn (replace <N> with feature count)
tracker/.venv/bin/python -m tracker.cli \
  --data-dir data/week0/live complete \
  --window W0-CHP-3 --codex-features <N> \
  --quality 1.0 --outcome pass --methodology week0 --notes after-clean

tracker/.venv/bin/python -m tracker.cli \
  --data-dir data/week0/live churn \
  --window W0-CHP-3 --provider codex --methodology week0 \
  --commit-start $(git rev-parse HEAD) --commit-end $(git rev-parse HEAD)

# 3) Audit + decision
tracker/.venv/bin/python -m tracker.cli \
  --data-dir data/week0/live window-audit --window W0-CHP-3 --format json \
  | tee logs/W0-CHP-3_window_audit.json

python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-3

# 4) Evidence rows (rerun tests, then append)
PYTHONPATH=tracker/src tracker/.venv/bin/python -m pytest | tee artifacts/test_runs/W0-CHP-3/pytest.txt
PYTHONPATH=tracker/src tracker/.venv/bin/behave features | tee artifacts/test_runs/W0-CHP-3/behave.txt

scripts/tools/append_evidence.sh \
  --window W0-CHP-3 --capability CAP-UAT-PYTEST \
  --runner pytest --result pass \
  --artifacts artifacts/test_runs/W0-CHP-3/pytest.txt \
  --notes "week0 W0-CHP-3"

scripts/tools/append_evidence.sh \
  --window W0-CHP-3 --capability CAP-UAT-BEHAVE \
  --runner behave --result pass \
  --artifacts artifacts/test_runs/W0-CHP-3/behave.txt \
  --notes "week0 W0-CHP-3"
```

## Notes & Anomalies

- Respect the +5 min AFTER buffer before running `oe` to avoid negative deltas.
- If you need to reseed the AFTER snapshot, use `od --window W0-CHP-3 --phase after` first.

---

## Attachments (after close)

- logs/W0-CHP-3_window_audit.json
- Artifacts under `artifacts/test_runs/W0-CHP-3/`

