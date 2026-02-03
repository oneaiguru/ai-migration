# SOP — UAT Opener (Start of Session)

Run before touching any plan tasks.

1. `cd tracker`
2. `PYTHONPATH=tracker/src pytest`
3. `PYTHONPATH=tracker/src behave features`
4. `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>`
   - Verify providers list and ccusage block render without errors.
   - Verify `Anomalies: N (see anomalies.jsonl)` prints (N may be 0).
   - Capture churn: `PYTHONPATH=tracker/src python -m tracker.cli churn --window <W0-XX> --provider <provider>` (add `--commit-start/--commit-end` if the window metadata is not yet populated). If commit bounds are missing, expect the CLI to warn (`warn: missing commit_start — skipping git diff`) and log `churn <window>: skipped (decision=missing-commit-range)`; supply hashes before proceeding when churn metrics are required. Re-run preview to confirm a `Churn:` block appears with the expected `+/-/net` figures.
5. Check contracts:
   - No negative capacity deltas in `windows.jsonl`
   - `reset_at` present on Codex/Claude records
6. Confirm ledgers exist and are writable (`docs/Ledgers/Token_Churn_Ledger.csv`, `docs/Ledgers/Feature_Log.csv`).
7. Append acceptance evidence rows (append-only):
   - `scripts/tools/append_evidence.sh --window <W0-XX> --capability CAP-UAT-PYTEST --runner pytest --result pass --artifacts artifacts/test_runs/<id>/pytest.txt --notes "uat opener"`
   - `scripts/tools/append_evidence.sh --window <W0-XX> --capability CAP-UAT-BEHAVE --runner behave --result pass --artifacts artifacts/test_runs/<id>/behave.txt --notes "uat opener"`
8. Run a decision-card check: `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-XX>`
   - Expect `Status:   GO` when churn and evidence rows exist, otherwise note the reported reasons (`SOFT GO` or `NO-GO`) in the session log before proceeding.
9. Capture commit hashes for the active window plan: note `commit_start` (baseline) and `commit_end` (implementation target) in the session notes so they can be written to `windows.jsonl` metadata and `docs/Ledgers/Churn_Ledger.csv` at closeout.

Record the commands and results in `progress.md` and `docs/SESSION_HANDOFF.md`.
