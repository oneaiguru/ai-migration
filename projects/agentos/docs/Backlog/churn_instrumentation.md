
# Churn Instrumentation & Commit Blame  [Status: Draft]  [Area: stats|ops]  [Impact: ⭐⭐⭐] [Effort: 🟡]

## 🎯 Why Now
We need provable lines-added/lines-removed per methodology window so we can quantify cost-per-feature beyond tokens. Git gives us the data, but we must standardise how commits, ledgers, and preview expose churn.

## 🔗 Contracts (Depends, Emits)
- Depends: git repo history; `docs/System/git_churn_strategy.md`; alias state file (commit_base).
- Emits: `windows.jsonl` (`commit_range`, `churn` structure), `docs/Ledgers/Code_Churn_Ledger.csv`, preview audit line.
- Invariants: append-only ledgers; CI gating ensures commit_range present when window finalised; churn computation tolerates missing git (falls back to zeros + error flag).

## ✅ Acceptance
- Window finalize stores `{commit_base, commit_head}` and churn totals (adds/dels/net + per-area breakdown).
- Preview prints churn+methodology summary.
- Code Churn ledger row appended per finalize.
- Tests: pytest for churn helper + CLI flow; Behave scenario covering commit capture.

## 🛠 Steps
1. Docs commit: update Contracts/DoD with churn requirements; map methodology areas.
2. Implementation commit: capture commit range, compute churn, extend windows JSONL & tests.
3. Reporting commit: preview line + ledger writer + docs updates.

## ⚠ Risks
- git unavailable in execution environment → fallback path must not block finalize.
- Methodology area globs drifting from docs → add sanity test referencing docs mapping.

## 📎 Links
- `docs/System/git_churn_strategy.md`
- `docs/Tasks/git_churn_next_steps.md`
- `docs/SessionBoards/001_board.md`
