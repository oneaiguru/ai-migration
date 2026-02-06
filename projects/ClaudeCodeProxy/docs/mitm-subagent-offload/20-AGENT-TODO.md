**P0 Build Tasks**

1. Create `services/mitm-subagent-offload/addons/haiku_glm_router.py` from skeleton.
2. Add run scripts (`scripts/run-mitm.sh`) to export env and start mitmdump.
3. Prepare two workdirs `work/sub`, `work/zai`; provide shell helpers.
4. Implement JSONL logging for usage (teed in addon).
5. Execute `12-TEST-MATRIX.md` and record pass/fail in `results/TESTS.md`.

**Polish**

* Add `scripts/print-versions.sh` to record Claude Code / mitmproxy versions.
* Add `scripts/verify-sse.sh` to run a long streaming test.

---