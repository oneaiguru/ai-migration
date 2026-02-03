# ADR-006 — Bandit Library Posture

- **Status:** Proposed (2025-11-05)
- **Context:** Early Week-0 focuses on measurement and validation; library choice can wait until data is stable.
- **Decision:** Ship an ε-greedy placeholder with a clean interface for Week-0/Week-1; defer selecting a heavy bandit library until we have real data.
- **Rationale:** Avoids premature dependency lock-in while keeping the interface compatible with Thompson/UCB later.
- **Implications:**
  - Expose `select_arm(context)` and `update(arm, reward)` in `bandits.py` for future swaps.
  - Document integration points so we can drop in libs like MABWiser or PyBandits without refactoring trackers.
  - Capture reward history for future modeling.
