# 🦀 Claude Code Companion Architecture

Claude Code Companion (CCC) sits between the Claude CLI and the Anthropic/Z.AI APIs. Haiku requests are rerouted to ⚡ Z.AI for cost savings, while Sonnet/Opus remain on Anthropic. The Go shim (`services/go-anth-shim`) handles routing, headers, and logging.

```
             🦀 Claude CLI
                  │
                  ▼
       ┌──────────────────────┐
       │ ccp-start / go shim  │
       └──────────────────────┘
                 │   │
                 │   └─────────► ⚡ Z.AI (Haiku)
                 │
                 └─────────────► Anthropic (Sonnet/Opus)
```

## Request flow (Mermaid)

```mermaid
graph TD
  CLI[🦀 Claude CLI] --> Shim[Go shim]
  Shim -->|model = haiku| ZAI[⚡ Z.AI API]
  Shim -->|model = sonnet/op us| Anthropic[Anthropic API]
```

## Daily operations

```mermaid
graph LR
  A[Install aliases] -->B(ccp-start)
  B --> C(ccp-env / ccp-logs)
  C --> D(ccp-haiku or ccp-sonnet)
  D --> E(ccp-stop)
```

### State flow (simplified)

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Running: ccp-start
  Running --> Logging: ccp-logs
  Logging --> Running: (Ctrl+C)
  Running --> Idle: ccp-stop
```

## Key components
- **Go shim** (`services/go-anth-shim/cmd/ccp`) – routes, scrubs headers, logs usage.
- **MITM add-ons** (`services/mitm-subagent-offload`) – optional Python path for advanced logging.
- **Shell helpers** (`scripts/shell/ccc-aliases.sh`) – one-command start/stop/log.
- **Smoke tests** (`make smoke-license`) – verifies Haiku→Z.AI and license toggles.

## Emojis legend
- 🦀 – Claude Code CLI UI.
- ⚡ – Z.AI lane.
- 📜 – SOP or doc references.

## References
- 📜 `docs/SOP/install-ccc-aliases.md`
- 📜 `docs/ops/environment-profiles.md`
- 📜 `docs/Tasks/mitm_strip_thinking.plan.md`
