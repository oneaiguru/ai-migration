# START HERE – Roles & Flow

> Follow directory governance rules; do not add new top-level folders under `docs/` without an approved plan.

## Decision Tree
```mermaid
graph TD
    Start([New Task]) --> Type{Task Type?}
    Type -->|Feature| Feature[Check progress log]
    Type -->|Bug| Bug[Review recent handoff notes]
    Type -->|Documentation| Docs[Use documentation SOP]
    Type -->|UAT| UAT[Run UAT SOP]
    Feature --> Role{Role?}
    Role -->|Scout| Scout[Research prompts + discovery]
    Role -->|Planner| Planner[Planning prompts + plan]
    Role -->|Executor| Executor[Execution prompts + build]
    Scout --> Handoff[Update SESSION_HANDOFF.md]
    Planner --> Handoff
    Executor --> Handoff
    Handoff --> Done([Task complete])
```

## Quick Links
- `progress.md`
- `docs/SESSION_HANDOFF.md`
- `docs/System/context-engineering.md`
- `docs/SOP/plan-execution-sop.md`
- `docs/System/documentation-index.md`
