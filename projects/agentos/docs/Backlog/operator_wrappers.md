# Operator Wrappers (Start/Close Window)

## 🎯 Why Now
Reduce operator friction; ensure consistent capture/validation every window.

## 🔗 Contracts
- Depends: aliases, automation, snapshot tool
- Emits: clean lifecycle logs, ledgers appended

## 🧭 Diagram (Mermaid flowchart)
```mermaid
flowchart TD
  A[Start] --> B[Snapshot state]
  B --> C[Enable governor]
  C --> D[Run tasks]
  D --> E[Close: after + buffer]
  E --> F[Preview + ledgers]
  F --> G[Bundle + TLDR]
```

## ✅ Acceptance
- Start/Close scripts run end‑to‑end; produce expected artefacts consistently.

## ⏱ Token Budget
~9K

## 🛠 Steps
1) start_window.sh / close_window.sh
2) Docs + checklist entries
