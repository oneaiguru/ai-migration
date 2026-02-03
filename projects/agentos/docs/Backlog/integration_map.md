# Integration Map — How Ideas Work Together

This map shows how the core backlog items connect. Use it to choose build order and verify interfaces.

```mermaid
flowchart LR
  subgraph Capture
    A[Aliases os/oe/ox] -->|snapshots| T
    B[codex_status.sh] -->|pane + JSON| T
    C[ccusage-codex] -->|daily/weekly/session JSON| T
    D[claude-monitor] -->|realtime text| T
  end

  subgraph Timeline
    T[Unified Timeline Builder] --> U(timeline.json)
  end

  subgraph Schemas
    L1[(taskset.jsonl)]
    L2[(features.jsonl)]
    L3[(sessions.jsonl)]
    L4[(anomalies.jsonl)]
  end

  U --> L3
  A --> L3
  B --> L3
  C --> L3
  D --> L3

  subgraph Analysis
    S[Stats & Power (CI)]
    W[What-If Estimator]
    R[Bandit Router (Phases)]
  end

  L2 --> S --> W --> R
  L3 --> S
  L4 --> S

  subgraph Ops
    G[Token Estimator & Governor]
    P[Plan Compiler]
    X[Coverage & Lint]
    H[Deliverables Bundler]
  end

  P --> A
  P --> B
  X --> P
  G --> A
  G --> B
  U --> H
  L2 --> H
```

Build Order
- Schemas first → Timeline → Capture automation → Stats/What‑If → Router
- Ops tools (Plan Compiler, Governor, Lint) fold in as guardrails

Interfaces
- JSONL append‑only; ISO 8601 timestamps; window_id `W0-XX`
- Summaries cite `path:line` for auditability

