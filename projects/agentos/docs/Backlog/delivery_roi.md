# Delivery ROI — Impact-Tied Windows

Why
- Tie windows to measurable impact (hours saved, revenue lift) to compute payback and prioritize work.

Depends
- An impact ledger and a minimal rubric.

Emits
- `roi = impact_value / tokens_or_time` by window or feature group.

Outline
- Add `docs/Ledgers/Delivery_Impact.csv` with columns:
  `date,window,task_id,impact_metric,impact_value,estimation_basis,notes`
- Add SOP note on how to record impact consistently (ranges, sources).

Acceptance
- Ledger exists; preview or a helper report can slice ROI by provider/methodology later.
