# Experiment Designs

## 🎯 Why Now
Make provider comparisons valid: reduce confounders and quantify confidence.

## Designs
- Cross‑Over A/B on identical tasksets
- Time‑Stratified Blocks (morning/evening/reset‑adjacent)
- Difficulty‑Matched Scoring (weight by task difficulty)

## 🔗 Contracts
- Depends: Taskset, features ledger
- Emits: tags/metadata used in analysis and bandit contexts

## 🧭 Diagram (ASCII matrix)

Taskset x Provider x TimeBucket
--------------------------------
T1  | Codex | Claude | Morning
T2  | Codex | Claude | Evening
...

## ✅ Acceptance
- Templates + tags exist; preview summarizes experiment metadata.

## ⏱ Token Budget
~9K

## 🛠 Steps
1) Tagging scheme + docs
2) Preview metadata render
