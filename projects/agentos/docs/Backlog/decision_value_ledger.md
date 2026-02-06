# Decision Value Ledger — Hypotheses and Outcomes

Why
- Reward cost-saving “no-go” decisions and make experimental learning explicit.

Depends
- A CSV ledger tracking decision experiments.

Emits
- Decisions with n, CI, outcome, and next action.

Outline
- Add `docs/Ledgers/Decision_Value.csv` with columns:
  `date,window,experiment_id,hypothesis,providers_compared,n,ci,decision,outcome,notes`
- Provide a tiny helper script or doc recipe to append rows at session end.

Acceptance
- Ledger exists; handoff references entries after experiments.
