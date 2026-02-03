# Value System — Recoverable, Anti‑Gaming Metrics

This document defines what to measure, why it represents value, and the atomic data we must capture now so future metrics are always reconstructible.

Principles
- Evidence over counts: tie units to acceptance evidence (tests, diffs, artifacts).
- Fix the target ex‑ante: define a capability map before sessions; measure distance to that target.
- Normalize difficulty: weights per unit to avoid “easy feature” inflation.
- Reward persistence: prefer work that sticks; penalize rework.
- Store raw + links: keep SHAs and artifact paths so any metric can be recomputed later.

Value lenses
- Product replica (reverse‑engineering): Distance‑to‑Target (DTT) and ΔDTT per cost.
- Startup validation: Decision quality + cash signal (CI on uplift; decision recorded).
- Established product: Impact − Cost (hours saved/revenue lift minus delivery costs), corrected by rework/defects.

Atomic data to capture now
- Window record: `window_id, started_at, ended_at, providers, quality_score, outcome, spec_id, spec_version, commit_start, commit_end, methodology, time_spent_hours(optional), token_cost_usd(optional)`.
- Capability map: `docs/System/capability_map/<project>/capabilities.csv` with `capability_id,name,type,weight,acceptance_path,criticality,owner`.
- Acceptance evidence ledger: `docs/Ledgers/Acceptance_Evidence.csv` with `window_id,capability_id,test_run_id,runner,result,artifacts_path,artifact_hash,notes`.
- Experiment ledger (when applicable): `docs/Ledgers/Experiment_Ledger.csv` with hypothesis and CI fields.
- Churn ledger (after churn lands): record commit range and numstat, plus `normalized_churn_per_feature` and an optional stability flag later.

Composite metrics (computed later)
- DTT% and ΔDTT% per $/hour; API coverage; Effective Feature Points (EFP) and cost per EFP; rework rate; stability half‑life; experiment value index; delivery ROI; token→progress efficiency.

Next actions (prep)
- Add finalize hooks in the tracker to persist: `spec_id, spec_version, methodology, commit_start, commit_end` (optional at first).
- Create capability map and acceptance ledger stubs (headers only) and keep them append‑only.
- Proceed with churn 3‑commit plan; it complements DTT and guards against inflated counts.

Source
- Raw strategic note archived at: docs/Archive/PRO_001_raw.md (copied from /Users/m/Desktop/PRO.markdown)
