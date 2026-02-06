# Replica DTT Preview (Distance‑to‑Target)

Why Now
- Show progress that can’t be gamed by raw “feature counts”: compute weighted DTT% from a declared capability map + acceptance evidence.

Depends
- Capability map CSV: `docs/System/capability_map/<project>/capabilities.csv`
- Evidence ledger: `docs/Ledgers/Acceptance_Evidence.csv`
- Optional window hooks (if provided at finalize): `spec_id`, `spec_version`

Emits
- Preview line like:
  `Replica: spec=v1.3  DTT before=37.5%  after=45.0%  Δ=+7.5%`

Acceptance
- If both the capability CSV and at least one evidence row exist for the selected spec, `tracker preview --window <W0-XX>` prints a single DTT line.
- If inputs are missing, preview prints `Replica: n/a (no capability map/evidence)` without error.
- Unit test covers weighted DTT computation (partial vs full pass); Behave smoke optional.

Implementation Sketch
- Add a small reader for the capability CSV (id, weight, acceptance_path).
- Read latest evidence entries per capability; compute state∈{0,0.5,1} for {missing, partial, pass}.
- Compute `DTT% = Σ(weight × state)/Σ(weight)`; if previous DTT% exists for the spec, print Δ.
- No new storage required; read‑only preview computed from CSV + ledger.

Token Budget
- ~10–12K

References
- `docs/System/value_system.md`
- `docs/System/capability_map/sample_project/capabilities.csv`
- `docs/Ledgers/Acceptance_Evidence.csv`
