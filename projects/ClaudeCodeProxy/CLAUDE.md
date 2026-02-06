**Moonshot: Haiku → GLM inside Claude Code**

* Keep **Sonnet/Opus** on Anthropic subscription (main lane).
* Offload **Haiku (throughput)** to **GLM** via Z.AI when running **subagents**.
* Do it **locally** with a **MITM proxy**:

  * Claude Code supports HTTPS proxy + custom CA.
  * Addon routes `/v1/messages` with `model: haiku` to Z.AI.
  * Preserve streaming; log usage per lane.
* Leave your existing **Node API gateway** intact for API‑key experiments/teams.

**Start here:** `01-DECISION-REPO-STRUCTURE.md` → `02-PRD-SUBAGENT-OFFLOAD.md` → `05/06 MITM`.

---

## Should you build in the existing repo or fresh?

**Recommendation:** **Existing repo (monorepo)**.
You already have a working Node gateway with admin/usage scaffolding. Add the MITM service as a **new sibling service**. This keeps your two “routes” (subscription via MITM, API‑key via Node) cleanly separated but co-located, reusing logs and docs. If later you want to open-source only the MITM, you can extract that folder easily.

---

If you want, I can also generate the **shell run scripts** (`scripts/run-mitm.sh`, `scripts/start-sub.sh`, `scripts/start-zai.sh`, `scripts/print-versions.sh`) as small files in the same style.