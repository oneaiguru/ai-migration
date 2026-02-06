## POC Checklist

1. **Install Claude Code** (Node 18+).
2. **Prepare two envs:**

   * **SUB:** Normal subscription login (`claude`), no `ANTHROPIC_AUTH_TOKEN`.
   * **ZAI:** `ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic` + `ANTHROPIC_AUTH_TOKEN=$ZAI_API_KEY`.
3. **Create two working dirs:** `work/sub/` and `work/zai/`.
4. **Run each POC path below** and record outcomes in `results/TEST-MATRIX.md`.

## Experiments

* **E1 (Subagent‑only):** Trigger a subagent run; verify all turns are handled by Z.AI; `/status` confirms model mapping.
* **E2 (Session‑level):** Start haiku session in `work/zai`; continue; ensure no spillover to SUB.
* **E3 (Dual‑CLI broker):** `curl -XPOST :4000/run -d '{"prompt":"echo 1","model":"haiku"}'`; inspect JSON and usage logs.
* **E4 (PTY wrapper):** Type `/haiku`, then a task; type `/sonnet`, then another task. Confirm lane flips.
* **E5 (HTTP gateway):** Route both lanes with API keys; verify token usage returned in JSON.

## Expected Artifacts

* `logs/usage.jsonl` — `{ts, lane, model, tokens_in, tokens_out}`
* `logs/broker.log` — broker decisions and errors
* `results/TEST-MATRIX.md` — pass/fail notes & diffs

---