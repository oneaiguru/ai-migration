Decision 1 — Two‑repo architecture (Confirm)
Keep CCC (Go) and Agent‑OS (Python) separate for now; interface via `/v1/usage` + `/metrics`. Rationale: protects CCC’s runtime surface; lets Agent‑OS evolve estimators quickly in Python. (Revisit after R5.)

Decision 2 — Tokens‑only quotas (Confirm)
Use tokens as the only enforcement unit; “hours” remains telemetry. Rationale: matches provider metering and Agent‑OS PRD.

Decision 3 — Commit tags & Week‑0 discipline (Adopt across repos)
Adopt `xfeat::`/`xproto::` tags and BEFORE/AFTER cadence in CCC automation and docs so the tracker’s churn/efficiency remains comparable.

Decision 4 — Reroute policy research (Plan)
Add `R3.5` analysis and toggles (`preemptive|run2cap|hybrid`), with calibration loop & GLM experiments. See R3.5 task doc above.

Update (R3.5): decision logs now carry `reroute_mode`, `reroute_decision`,
`preferred_attempt`, and calibration fields (`warn_pct_auto`, `gap_seconds_p50/p95`).
Agent‑OS can consume them directly via `/v1/usage` or the usage log stream.

Decision 5 — Licensing in parallel (Plan)
Proceed with MoR + device/loopback per existing ADRs; CCC reflects license gates in `/readyz`; Agent‑OS records them on the window timeline.

Acceptance (for decisions)
Shared contract doc lands; CCC exports speeds; Agent‑OS renders it; a first “hybrid” reroute toggle exists behind a flag.

---

**How to use this drop:**

1. Paste each file into the indicated path(s).
2. Ask the coding agent to start with `docs/Tasks/R3_5-QUOTA-HARDENING.md` (R3.5), then wire the fixtures and the fallback test.
3. Ask the Agent‑OS agent to add `agentos/docs/integration/CCC_BRIDGE.md` and implement the bridge.
4. Have the browser agent run through `docs/Tasks/BROWSER-AGENT-REGISTRATION.md` during R3 coding.

If you want me to also draft the **tracker/bridges/ccc.py** and the **CCC loader test** next, say the word and I’ll add those two files in the same format.
