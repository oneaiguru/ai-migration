# Archived: Multi-Path Haiku→GLM POC

This directory preserves the broader Moonshot experiments (five routing strategies). The active Plan Of Record lives in `docs/mitm-subagent-offload/`; use these notes when revisiting alternative approaches or resurrecting prototype code.

## What this POC includes

* **5 workable paths** to replace *Haiku* with **GLM** in Claude Code without losing Sonnet/Opus subscription lane.
* Minimal runnable code for **broker**, **pty wrapper**, **trace watcher**, and an **API‑billed HTTP gateway**.
* Setup docs for **Anthropic subscription** and **Z.AI** instances.

## Quickstart

```bash
# Install deps
npm i

# (A) Dual-CLI broker (recommended)
export ZAI_API_KEY=sk-...
mkdir -p work/sub work/zai
# Login once in work/sub with `claude`
npm run broker
# Then post prompts:
curl -s localhost:4000/run -H 'content-type: application/json' \
  -d '{"prompt":"echo Hi","model":"haiku"}' | jq .

# (B) PTY wrapper
npm run pty
# type: /haiku  then your task; /sonnet to go back
```

## Notes

* **HTTP gateway** uses API keys → **API‑billed**. Keep separate.
* Prefer **Subagent-only** and **Session-level** routing to avoid mid‑session context juggling.

---

**That’s the full, multi‑path POC package.**
Drop these files into a folder; your coding agent can run each path, fix rough edges, and choose the best route to “full replacement of Haiku with GLM in Claude Code.”
