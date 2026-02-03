# SOP — Backlog Naming & Spec Conventions

- Use short, action-oriented titles (e.g., “Token Estimator & Governor”, “Codex Event Sink”)
- File names: `docs/Backlog/<kebab_case>.md`
- Spec structure (in order):
  1. Heading (# Idea Name)
  2. 🎯 Why Now
  3. 🔗 Contracts (Depends, Emits)
  4. 🧭 Diagram (Mermaid or ASCII)
  5. ✅ Acceptance
  6. ⏱ Token Budget
  7. 🛠 Steps
- Diagram choice: simple flowchart for processes, sequence for integrations, class for schemas, state for phased roadmaps, ASCII when easier
- Link each spec in `docs/Backlog/index.md` with dependencies/complements
- Add guardrails (anti-patterns) if there are known pitfalls
- Remember to update feasibility review (`docs/Backlog/feasibility_review.md`) when adding significant items
