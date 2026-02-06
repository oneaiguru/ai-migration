# Experiment Templates

## 1. Cross-Over Provider Trial
- **Objective:** Compare providers on identical tasks while controlling for order effects.
- **Dataset:** Duplicate taskset; run provider A first, provider B second; then swap order on next window.
- **Tags:** `exp:cross-over`, `provider:<name>`, `difficulty:<level>`
- **Acceptance:** At least 2 cycles per provider; record outcomes in features ledger and UPS.

## 2. Time-Stratified Blocks
- **Objective:** Understand performance around resets/time-of-day.
- **Dataset:** Morning vs evening windows; codify resets (Codex 5h, Claude weekly) in metadata.
- **Tags:** `exp:time`, `block:morning|evening`, `reset:pre|post`
- **Acceptance:** Minimum 3 windows per block; record in ledger with reset_at reference.

## 3. Difficulty-Matched Comparison
- **Objective:** Compare providers on tasks grouped by difficulty (easy/medium/hard).
- **Dataset:** Use golden taskset difficulty tags; assign evenly across providers.
- **Tags:** `exp:difficulty`, `difficulty:easy|medium|hard`
- **Acceptance:** At least five tasks per difficulty per provider; use normalized scores.

Document experiment IDs and references in `docs/System/methodologies/tracker_alias_cycle/experiments/` when executed.
