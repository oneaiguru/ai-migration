# Batch of Smaller Tasks

This list captures tidy-up items that are too small for their own window. Keep it handy for a future Claude Code batch session—knock them out in one go when the queue is light.

## Open items

1. **Docs log-path sweep**
   - `rg "logs/usage.jsonl" docs --glob '!Tasks/**'` still returns a handful of references (older playbooks, long-session notes).
   - Replace with `${CCP_LOGS_DIR:-logs}/usage.jsonl` snippets or point to `LOG_FILE` helper.

2. **Test fixtures env clarity**
   - Some test scripts call `go test` without setting `CCP_LOGS_DIR`. Add a short comment or export in the scripts so new operators copy the right pattern.

3. **Review bundle metadata**
   - `scripts/review-bundle.sh` still prints `mitm_port` hard-coded to 8082. Teach it to read the port from `MITM_PORT` or the pid file when available.

4. ✅ **Docs examples -> helper aliases** (2025-10-22, commit pending)
   - Canonical docs now reference `ccc-on` with manual fallback notes where needed.

5. **Quality checklist cross-link**
   - Link `docs/System/quality/ccc-aliases-tests.md` from the SOP index so the alias installer tests are easy to find.
6. ✅ **Archive subagent-marker remnants** (2025-10-23)
   - `docs/TODO-NEXT-AGENT.md` + `docs/mitm-subagent-offload/README.md` updated to reflect the retirement of metadata routing.

## How to run this batch later

- Planner: scope one session for “Batch Small Tasks” and confirm the list above (plus any new entries) is still valid.
- Scout: execute each bullet in order, running `rg`/`go test`/`make verify-routing` as needed.
- Update this file when a bullet is cleared (mark with ✅ and note the commit hash for traceability).
