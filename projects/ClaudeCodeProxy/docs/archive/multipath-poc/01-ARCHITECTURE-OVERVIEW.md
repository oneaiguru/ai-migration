```mermaid
flowchart LR
  subgraph Local Machine
    UI[Your terminal] --> WRAP{Router layer}
    WRAP -- model=haiku --> ZCLI[Claude Code (Z.AI env)]
    WRAP -- model=sonnet/opus --> ACLI[Claude Code (Subscription)]
  end
  ZCLI -->|Reply| WRAP --> UI
  ACLI -->|Reply| WRAP --> UI
```

**Variants we will implement:**

1. **Subagent‑only offload:** Route entire subagent runs to Z.AI (separate context window).
2. **Session‑level:** Start a session on Z.AI when user intends haiku; keep Sonnet/Opus on subscription.
3. **Dual‑CLI broker (print mode):** Our Node process accepts `/run` and forwards to the correct CLI instance (each with its own working directory).
4. **PTY wrapper (interactive):** Wrap a single TTY; intercept `/haiku`, `/sonnet`, `/opus` to flip the active lane.
5. **HTTP gateway:** Intercept `/v1/messages`; **API‑billed** keys required; enterprise variant only.

---