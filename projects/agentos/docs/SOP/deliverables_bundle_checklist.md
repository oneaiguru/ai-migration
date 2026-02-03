# SOP — Deliverables Bundle Checklist

Run at session close (after tests, preview, ledgers).

## Files to Include
- `plans/<date>_next_session.plan.md`
- `docs/SessionReports/<date>_TLDR.md`
- `docs/SessionReports/<date>_TLDR_PRO.md` (if present)
- `docs/SessionReports/<date>_CHANGED_FILES.txt` or equivalent manifest
- `docs/Ledgers/Token_Churn_Ledger.csv`
- `docs/Ledgers/Feature_Log.csv`
- `data/week0/live/windows.jsonl`
- Preview snapshot (`python -m tracker.cli preview --window <W0-XX>` output saved to `.txt`)

## Bundling Steps
1. Create a working directory (e.g., `bundle/<date>`).
2. Copy the files above; review for secrets (event logs under `.gitignore` stay excluded).
3. Zip the directory: `zip -r deliverables_<date>.zip bundle/<date>`.
4. Record the bundle path in `docs/SESSION_HANDOFF.md` (Bundle & Board section).

## Notes
- Do not include raw automation logs unless explicitly approved.
- If bundle automation exists, this checklist still applies—confirm contents before referencing in the handoff.
