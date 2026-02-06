# 🚀 Quick Start (5 minutes)

This is the shortest safe path to run locally, prove Haiku → Z.AI offload, and keep Sonnet on Anthropic.

- ✅ Requirements: mitmdump (mitmproxy), Claude CLI, Node.js, Python
- 📦 Repo: `/Users/m/git/tools/ClaudeCodeProxy`
- 🪪 Window tag (example): `W0-CHN`
- 🔖 Track commits: `commit_start=$(git rev-parse HEAD)` … `commit_end=$(git rev-parse HEAD)`

## 1) Preflight

```bash
cd /Users/m/git/tools/ClaudeCodeProxy
make install-local         # sets up helpers, prints next steps
cc doctor                  # checks tools and basic log hygiene
```

If mitmdump missing (brew): `brew install mitmproxy`

## 2) Start

Open two panes (A=proxied, B=stock):

```bash
cc mitm start 8082         # starts mitmdump with the router
cc two-up 8082             # tmux two-pane (proxied vs stock)
> Requires tmux; see Troubleshooting for manual two-terminal setup.
```

If you prefer manual:
- A (proxied): `source scripts/sub-env.sh 8082 && claude`
- B (stock): `unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_* && claude`

## 3) Prove routing

Run in the left (proxied) pane:

```bash
cc h "ok" --output-format json   # Haiku → should route to Z.AI
cc s "ok" --output-format json   # Sonnet → stays on Anthropic
cc verify                        # summarizes and verifies routing
```

## 4) Do real work (45–60 min)

- Keep body‑tee OFF by default (privacy). Enable only for diagnostics.
- Use Haiku for sub‑tasks you want offloaded; keep Sonnet orchestration on Anthropic.

## 5) Wrap

```bash
cc quota                 # Z.AI usage for last 5h (approx)
cc productize-check      # safety gates + verify summary
cc bundle                # writes ~/Downloads/agentos_tmp_review-<ts>.tgz
```

Add a brief note to `docs/SESSION_HANDOFF.md` with toggles, versions, commands, and the bundle path. Record `commit_end`.

---

## 🗺️ Visual: Proxy flow

```mermaid
flowchart LR
  A[Claude CLI]\n(HTTPS client) -->|HTTPS_PROXY| P((mitmdump))
  P -->|model=haiku| Z[Z.AI\napi.z.ai\n/api/anthropic]
  P -->|model=sonnet| C[Anthropic\napi.anthropic.com]
  P -. guards .-> L[(JSONL logs)\nlogs/usage.jsonl]
```

- Lane rules (P0): Model‑based Haiku ⇒ Z.AI. Sonnet ⇒ Anthropic.
- Guards: no cross‑leak of auth headers; SSE preserved; optional H1 mode.

```mermaid
sequenceDiagram
  participant You
  participant A as Pane A (proxied)
  participant B as Pane B (stock)
  You->>A: cc mitm start 8082
  You->>A: source scripts/sub-env.sh 8082; claude
  You->>B: unset proxy vars; claude
  A->>A: cc h "ok" → Z.AI
  A->>A: cc s "ok" → Anthropic
  A->>A: cc verify / cc bundle
```
