# Token Budget Scorecard — Design Notes (Stub)

- Inputs: plan token targets (from `plans/<date>_next_session.plan.md`), actual tokens (Token_Churn_Ledger.csv).
- Output: Markdown table with plan vs actual %, variance, root-cause notes (pull from `progress.md`).
- Highlight variance >10% and flag sessions lacking token targets.

Use this document to refine CLI arguments and output formatting before coding.
