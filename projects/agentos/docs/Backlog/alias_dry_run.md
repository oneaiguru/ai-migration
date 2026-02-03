# Alias Dry‑Run + Safeguards [Draft]

## 🎯 Why Now
- Reduce fear of bad panes; provide a reversible, auditable path before writes.

## 🔗 Contracts (Depends, Emits)
- Depends: `tracker alias` subcommand
- Emits: dry‑run output (no JSONL writes), lockfile checks

## 🧭 Diagram (Mermaid flowchart)
```mermaid
flowchart TD
  A[stdin pane] --> B[alias --dry-run]
  B --> C[Print would-write record]
  C --> D[Operator approves]
  D --> E[Write snapshot (no lock conflicts)]
```

## ✅ Acceptance
- `--dry-run` prints what would be written; no files change.
- Wrapper exits early with friendly message if a lockfile exists.

## 🧪 Operator Quick Cue
- Command: `tracker alias start codex --dry-run --stdin < pane.txt`
- Check: CLI prints snapshot JSON preview without writing; lockfile presence results in clear warning message

## ⏱ Token Budget
- Estimate: 8K

## 🛠 Steps
1. Add `--dry-run` to alias CLI to bypass writes.
2. Lockfile check in wrappers; document override.
3. Tests for both paths.

## ✅ Good Fit
- Safer operator UX; fewer accidental ingests.

## 🚫 Avoid
- Silent writes during dry‑run; must be read‑only.

## 📎 Links
- `scripts/tracker-aliases.sh`, `scripts/automation/codex_status.sh`
