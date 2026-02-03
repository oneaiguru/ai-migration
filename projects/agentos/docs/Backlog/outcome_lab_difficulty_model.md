# Outcome Lab + Difficulty Model [Draft]

## 🎯 Why Now
- Normalize quality across tasks/agents by tagging difficulty; improve fairness of provider comparisons.

## 🔗 Contracts (Depends, Emits)
- Depends: features ledger (quality), curated taskset
- Emits: difficulty tags, normalized scores, preview hint

## 🧭 Diagram (Mermaid flowchart)
```mermaid
flowchart TD
  A[Golden taskset] --> B[Collect outcomes]
  B --> C[Fit difficulty (Elo/BT)]
  C --> D[Normalize scores]
  D --> E[Preview + stats]
```

## ✅ Acceptance
- A small taskset has difficulty scores; preview/stats use normalized quality.
- Documentation lists how to adjudicate outcomes consistently.

## 🧪 Operator Quick Cue
- Command: `python -m quality.normalize --taskset docs/System/quality/outcome_lab_taskset.md`
- Check: preview shows normalized quality scores (e.g., `quality_norm=...`); ledger records difficulty tags

## ⏱ Token Budget
- Estimate: 18K

## 🛠 Steps
1. Seed golden taskset + adjudication rubric.
2. Simple Elo/Bradley‑Terry fit with fallback.
3. Normalize preview and stats; tests for edge cases.

## ✅ Good Fit
- Works offline; adds clarity to experiments.

## 🚫 Avoid
- Over‑complex modeling; keep it simple and interpretable.

## 📎 Links
- `docs/Backlog/experiment_designs.md`, `docs/Backlog/stats_power_ci.md`
