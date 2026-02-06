# 🧰 Commands (cc wrapper cheatsheet)

Daily helpers provided by `bin/cc` and Makefile.

- `cc mitm start [PORT]` — start proxy (default `8082`)
- `cc mitm stop [PORT]` — stop proxy
- `cc mitm status [PORT]` — show proxy status
- `cc two-up [PORT]` — open two panes: A=proxied, B=stock (tmux)
- `cc h "prompt"` — run Haiku one‑shot (proxied)
- `cc s "prompt"` — run Sonnet one‑shot
- `cc verify` — summarize usage and verify routing
- `cc quota` — show Z.AI calls/tokens for last 5h
- `cc productize-check` — safety checks (no header leaks) + summary
- `cc bundle` — collect logs/results into `~/Downloads/…tgz`

Toggles (export and restart MITM):

- `MITM_FORCE_H1=1` — force HTTP/1.1 if H2 host change jitters
- `ZAI_HEADER_MODE=authorization` — switch Z.AI auth header style
- `OFFLOAD_PAUSED=1` — pause offload routing decisions

```mermaid
flowchart TB
  subgraph Proxied (A)
    H[cc h "…"] --> P((Proxy))
    S[cc s "…"] -->|sonnet| C
  end
  subgraph Stock (B)
    SB[claude] --> C[Anthropic]
  end
  P -->|haiku| Z[Z.AI]
  P -->|sonnet| C
```

