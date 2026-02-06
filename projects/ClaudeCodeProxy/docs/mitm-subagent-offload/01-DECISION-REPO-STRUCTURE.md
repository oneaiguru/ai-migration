**Decision:** Build in your **existing proxy repository** as a **monorepo** with two services:

* `services/mitm-subagent-offload/` — **New P0** MITM addon + run scripts (subscription lane; subagent‑only routing to GLM)
* `services/api-gateway/` — **Your current** Node gateway (API‑key lane; enterprise/benchmarks)

**Rationale**

* Reuses your **admin/users/usage** scaffolding.
* Keeps **API‑key gateway** intact (useful later for teams).
* Isolates **MITM** logic (Python, mitmproxy) so it can evolve independently.

---