Title: CAP-PREVIEW-NOTES — Preview prints window notes

What to change
- Show a single-line Notes: <text> in `tracker preview --window <id>` when the finalized window has a `notes` field.
- File: `tracker/src/tracker/cli.py` (single-window branch in `_handle_preview`).

Acceptance
1) Finalize a window with `--notes preview-notes`.
2) Run `tracker preview --window <id>`.
3) Expect an extra line: `Notes: preview-notes`.

Commands
```
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> ingest codex --window W0-NOTES --phase before --stdin < tests/fixtures/codex/alt_reset_64_0.txt
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> ingest codex --window W0-NOTES --phase after  --stdin < tests/fixtures/codex/wide_status_82_1.txt
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> complete --window W0-NOTES --codex-features 1 --quality 1.0 --notes preview-notes
PYTHONPATH=tracker/src python -m tracker.cli --data-dir <tmp> preview --window W0-NOTES
```

Links
- Capability map: `docs/System/capability_map/agentos/capabilities.csv`
