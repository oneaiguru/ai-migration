**Context**

* You already have a Node gateway project for API‑key flows.
* New work requires **network-level** interception for subscription lanes.

**Decision**

* Keep **existing** Node gateway → `services/api-gateway/`
* Add **new** MITM service (Python) → `services/mitm-subagent-offload/`

**Consequences**

* Clear separation of concerns & legal posture.
* Shared logs and docs at repo root.

---