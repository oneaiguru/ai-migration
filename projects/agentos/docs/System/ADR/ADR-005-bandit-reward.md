# ADR-005 — Bandit Reward (Quality-per-Cost)

- **Status:** Proposed (2025-11-05)
- **Context:** PRD §6 targets quality-adjusted efficiency and discourages long reasoning barring when quality is low.
- **Decision:** When enabling bandits, compute rewards as quality-per-cost with a small step penalty for Codex/Claude; for GLM divide quality by prompts used.
- **Rationale:** Preserves quality-over-capacity guidance without introducing complex RL tuning.
- **Implications:**
  - Log `quality_score` per window (baseline PASS = 1.0; extend later).
  - Store capacity deltas (`Δpp`, prompts) alongside reward for auditability.
  - Ensure tracker schema supports additional reward metadata.
