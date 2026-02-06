# TODO — Next Agent (Focused Work)

- Shim safety
  - ✅ Log/profile path sweep (2025-10-22). ✅ Upstream env hardening + policy cache relocation (see `docs/Tasks/ccc_upstream_policy_followup.md`).
  - Run planner prompt from `docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md` before executing.

 - Packaging
   - ✅ Private artifact scaffolding (see `docs/Packaging/PRIVATE-OVERVIEW.md` for brew/winget templates).
   - ✅ Signing checklist + helper scripts (`docs/Packaging/SIGNING-CHECKLIST.md`, `scripts/release/sign-*`).
   - Next: automate codesign/notary runs & private tap publishing.
- Logging & retention
  - ✅ Env-driven rotation (`CCP_LOG_MAX_BYTES`, `CCP_LOG_MAX_FILES`).
  - ✅ `scripts/prune-results.sh` + `make prune-results` keep metrics lean.
- Summarizer
  - Add decision vs completion split by `op` (stream/nonstream)
  - Large‑log responsiveness (≥10k lines) test pass
- SSE timing
  - ✅ Usage log now records chunk counts/durations; wire long-run stability assertions that consume the new data.
- Repro polish
  - Finish Sonnet CLI 200 completion in quick script if environment allows; otherwise keep overnight runner as canonical proof
- Docs
  - Add PACKAGING-GO-SHIM.md with install recipes and distribution matrix
  - Update PROD-TESTS / HANDOFF consolidated sections to include `make go-proxy` + `source scripts/go-env.sh`
  - Add CLI-only quick proof snippet (Sonnet + Haiku) to SESSION_HANDOFF quick checks

---

R5 SaaS Backlog (new)
- Read plan: docs/roadmap/R5-SaaS-CLI.md
- Tickets: docs/Tasks/BACKLOG_R5_SaaS_CLI.md
- Suggested starting sequence:
  1) Identity + license MVP (device flow + pack issue/verify + `ccp login/status`)
  2) Minimized ingest endpoint + CLI export; seed simple dashboards
  3) Stripe billing + webhooks → license state transitions

R4 polish candidates (optional)
- CLI: `cc db status/export/import`; sample TTL/import tool
- Quotas: consider sourcing long horizon from store (read path stays in‑memory by default)
