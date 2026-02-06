# Token Tracking Checkpoints  [Status: Draft]  [Area: ops]  [Impact: ⭐⭐] [Effort: 🟡]

## 🎯 Why Now
We estimate session token usage in plans, but the ledger only captures the final actual. Adding plan/mid/final checkpoints highlights over/under runs and lets us improve forecasting.

## 🔗 Contracts
- Depends: `docs/Ledgers/Token_Churn_Ledger.csv`, session close SOP (`docs/SOP/session_reflection_sop.md`).
- Emits: ledger rows with explicit `checkpoint=plan|mid|final` tag, SOP updates, optional preview indicator.
- Invariants: append-only ledger; corrections via new rows.

## ✅ Acceptance
- Ledger schema supports checkpoint column and stores plan/mid/final for each session.
- SOPs require logging plan estimate pre-work and mid-session checkpoint.
- Progress/handoff templates reference these checkpoints.

## 🛠 Steps
1. Update ledger template/schema and add helper script to append checkpoint rows.
2. Adjust planning/close-out SOPs to capture plan and mid-session entries.
3. Add reporting view (optional) to highlight variance vs plan.

## ⚠ Risks
- Missing checkpoint entries → add a TODO checklist item so agents don’t skip them.
- Duplicate estimates → clearly tag correction rows.

## 📎 Links
- `docs/Ledgers/Token_Churn_Ledger.csv`
- `docs/SOP/session_reflection_sop.md`
- `docs/Tasks/git_churn_next_steps.md`
