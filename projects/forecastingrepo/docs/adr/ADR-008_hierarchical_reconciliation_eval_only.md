# ADR‑008: Hierarchical reconciliation (evaluation‑only)

**Status:** Accepted for evaluation‑only; no change to client CSVs.
**Context:** Region and districts form a hierarchy.
**Decision:**
- Canonical client outputs: **district‑sum** defines region.
- Compute **region‑direct** only for QA and diagnostics.
- Consider **MinT** reconciliation in evaluation experiments (not in delivery).
**Rationale:** keeps POC deterministic and auditable while allowing research on coherence/variance trade‑offs.
**Exit criteria for change:** if MinT improves backtest stability (MASE/RMSSE) without degrading interpretability, propose ADR update.

---