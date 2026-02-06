# Recipe — Ledger Update

## Why
Keep measurement consistent by logging tokens/churn and shipped scenarios at the end of every session.

## Steps
1. Open `docs/Ledgers/Token_Churn_Ledger.csv` and append a row with:
   - `date` (YYYY-MM-DD)
   - `session_id` (from Codex `/status` pane)
   - `task` (short description, e.g., `session_documentation`)
   - `tokens_planned` (if known) and `tokens_actual` (e.g., context used)
   - `delta`, `commits`, `lines_added`, `lines_deleted`, `features_added`, `tests_added`
   - `notes` (free text)
2. Open `docs/Ledgers/Feature_Log.csv` and append rows for each BDD scenario shipped:
   - `date`, `window_id`, `provider`, `feature_file`, `scenario`, optional `commit_id`, `notes`
3. Save files (CSV is append-only; do not remove prior entries).

## Example
```
2025-10-19,0199f878-7b4c-7423-9b83-c2bd6e6749d6,session_documentation,0,221000,221000,0,0,0,0,0,"Documented SOPs, backlog, ledgers"
2025-10-19,W0-PLANNING,n/a,n/a,n/a,,"Documentation-focused session; no new BDD scenarios"
```

## Edge Cases
- If a session produces no new features, add a single row noting that (see example).
- Keep tokens_planned = 0 when the session was documentation-only.

## Related
- DoD: `docs/SOP/definition_of_done.md`
- Planning SOP: `docs/SOP/next_session_planning_sop.md`
