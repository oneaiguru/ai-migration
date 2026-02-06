Title: CAP-LEDGER-EVIDENCE — Acceptance evidence ledger

What to change
- Maintain `docs/Ledgers/Acceptance_Evidence.csv` (append-only) with rows:
  `window_id,capability_id,test_run_id,runner,result,artifacts_path,artifact_hash,notes`.
- Provide a helper script `scripts/tools/append_evidence.sh` to append rows with an auto-generated `test_run_id` and `sha256` of the artifact.

Acceptance
1) Run pytest and behave; save outputs to `artifacts/test_runs/<id>/`.
2) Append rows for W0-19 and W0-20 using the helper script.
3) Ledger shows entries with non-empty hash; files exist on disk.

Commands
```
mkdir -p artifacts/test_runs/TR-$(date -u +%Y%m%dT%H%M%SZ)-pytest
PYTHONPATH=tracker/src pytest -q | tee artifacts/test_runs/<id>/pytest.txt
shasum -a 256 artifacts/test_runs/<id>/pytest.txt
scripts/tools/append_evidence.sh --window W0-20 --capability CAP-UAT-PYTEST --runner pytest --result pass --artifacts artifacts/test_runs/<id>/pytest.txt --notes "uat opener"
```

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
