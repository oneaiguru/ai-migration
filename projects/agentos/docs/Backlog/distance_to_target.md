# Distance-to-Target (DTT) — Capability Map & Acceptance Evidence

Why
- Move beyond “feature count” and churn by measuring progress toward target capabilities with objective acceptance evidence.

Depends
- Capability map CSV and acceptance evidence ledger.

Emits
- DTT% per project; ΔDTT% per $ window metric.

Outline
- Add `docs/System/capability_map/<project>/capabilities.csv` (id, capability, acceptance_rule, evidence_path).
- Add evidence ledger `docs/Ledgers/Capability_Evidence.csv` (date, window, capability_id, evidence_path, verdict).
- Compute DTT% as satisfied/total, and ΔDTT% per window for cost‑effectiveness.

Acceptance
- CSV and ledger templates exist; preview or a helper command prints DTT% line once evidence accumulates.
