# Definition of Done (Tracker Features)

A feature is “done” only when:
- Spec exists: `.feature` scenario(s) + step defs committed
- Fixtures exist and are referenced in the spec
- Code implemented with preview updated if applicable
- Unit + Behave tests pass locally (`pytest`, `behave features`)
- Ledgers updated: `Feature_Log.csv`; if applicable, tokens/churn in `Token_Churn_Ledger.csv`
- Quality score recorded with rubric guidance (1=fail workaround, 3=acceptable, 5=exceeds expectations) and noted in tracker complete.
- Handoff updated: `progress.md`, `docs/SESSION_HANDOFF.md`
- Citations: any large-doc references use `path:line` or `path:Lstart–Lend`
- No schema/breaking changes without updating `docs/System/contracts.md`
