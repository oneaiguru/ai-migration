# CI/Power Stats & Preview

## 🎯 Why Now
Report confidence intervals and power so routing decisions aren’t based on underpowered samples.

## 🔗 Contracts
- Depends: features.jsonl with quality and tokens
- Emits: CI/power lines in preview; stats utils

## 🧭 Diagram (Mermaid flowchart)
```mermaid
flowchart TD
  A[Features ledger] --> B[Compute quality-per-cost]
  B --> C[CI & power]
  C --> D[Preview: efficiency 0.21 0.18,0.24 n14]
```

## ✅ Acceptance
- Preview prints CI & n; stats util unit tests pass.

## ⏱ Token Budget
~11K

## 🛠 Steps
1) Implement ratio-of-totals CI + power helpers
2) Integrate into preview
3) Tests for edge cases (n small)
