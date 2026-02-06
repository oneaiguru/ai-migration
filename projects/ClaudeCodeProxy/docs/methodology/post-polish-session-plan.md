# Post-Polish Session Plan (Read after the H1/H2 + header-mode A/B session)

This is the playbook the next agent should follow **after completing the polishing session** (HTTP/1 vs HTTP/2 and header-mode A/B). It captures the production pilot guidance and prompts we agreed on.

---

Here’s a crisp “use it now / keep improving” plan—with straight answers to your routing question, a one‑day pilot plan, simple ELI16 explanations, ready‑to‑paste prompts for Sonnet/Haiku, and a handoff block for the next agent.

------

## 1) Short answer (your routing question)

- **Do `claude -p --model haiku` and `/model haiku` route to GLM (Z.AI) the same way as subagents?**
   **Yes—if MITM was started with `FORCE_HAIKU_TO_ZAI=1`.** That’s the default in the `ccmitm` alias I gave you. Any Haiku call (CLI `-p` or interactive `/model haiku`) will go to Z.AI, exactly like the subagent path.
- **If you want to disable model-based routing temporarily:** restart MITM **without** the force flag:
   `MITM_PORT=8082 FORCE_HAIKU_TO_ZAI=0 make mitm`
   In that mode, all Haiku traffic stays on Anthropic unless you flip the flag back on.

> TL;DR: Keep `FORCE_HAIKU_TO_ZAI=1` for a simple, deterministic pilot—everything Haiku goes to Z.AI; Sonnet/Opus stay on Anthropic.

------

## 2) Pilot **today** (what to do in production on your machine)

**Goal:** Ship real work today (code review/refactors) while the proxy offloads Haiku to Z.AI.
 **Two terminals side‑by‑side**—you can run both at once.

**Terminal A — Proxied (GLM offload)**

```
ccmitm 8082         # starts MITM with model-only routing
ccsub 8082          # wire Claude to the proxy; sets subagent model=haiku
claude              # /login if asked once; then work as usual
```

- Use **Sonnet** for orchestration; delegate to **haiku-subagent** for scans/greps/refactors.
- Quick proof any time: `ccverify` (or `ccproof` for the clean demo).

**Terminal B — Stock Anthropic (no offload)**

```
ccstock             # clean shell; no HTTPS_PROXY; plain Anthropic
claude              # normal use; never hits MITM
```

**What work to actually do today (fast ROI)**

1. **Code‑review pilot (repeatable):** run the review prompt below on `services/mitm-subagent-offload` and `scripts/`. Apply only **minimal diffs** the agent proposes.
2. **Repo map:** generate structure + “old vs new” summaries and let Haiku propose tiny cleanups (naming/docs).
3. **After each task:** `ccverify` → `ccbundle` to snapshot metrics + trace for your records.

**Guardrails you may need**

- Z.AI 401?
   `cczai_bearer` → `ccmitm 8082`
- H2 host‑retarget jitter?
   `cch1` → `ccmitm 8082`
- Pause offload (emergency kill‑switch):
   `ccpause` (resume later with `ccresume`)

------

## 3) ELI16 (explain‑like‑I’m‑16) — what these commands do

- **`make summarize`**
   Reads `logs/usage.jsonl` and prints how many calls went where (Anthropic vs Z.AI) and how fast they were (p50/p95). **No network.** Just math on a log file.
- **`make verify-routing`**
   Sanity counter: “N of M decisions went to Z.AI; completions by lane…”. Easy way to catch mistakes like Haiku landing on Anthropic.
- **`make bundle`**
   Scoops up logs, metrics, and key docs into `~/Downloads/agentos_tmp_review-<timestamp>{/, .tgz}` so you can share (no secrets included).

If you (or a teammate) forget the “why,” the **Operator Guide** and **Reproducibility Guide** inside the repo show the whole flow with diagrams and step‑by‑steps. Your wiki’s **Tool Setup Index** also lists the companion tools (usage analyzer + live dashboard) so this stays discoverable.   And the **Wiki Organization** page explains where to place new ops pages so people can actually find them later. 

------

## 4) Clear, paste‑ready prompts (Sonnet orchestrates; Haiku assists)

**A. Code‑review (security & minimal diffs)**

```
You're Sonnet. Use the haiku-subagent to scan:
  - services/mitm-subagent-offload/addons/*.py
  - scripts/*.sh
Find: TODO/FIXME, any logging of headers/bodies, risky error handling.
Propose only minimal diffs (no SSE changes).
Return a concise Markdown review with: findings (file:line), 3–5 prioritized diffs, and:
"Ready to merge? Y/N + reasons".
```

**B. Repo map + old vs new**

```
You're Sonnet. Run the repo-map helper (or have haiku-subagent enumerate).
Produce REPO_MAP.md that lists each file, brief 1–2 sentence summary, and last commit date/author.
Group sections: "Older than 1 month" vs "Changed this week".
Flag 3 quick wins (rename/doc/factor) with <10-line diffs each for Haiku to draft.
```

**C. Header hygiene self‑audit**

```
Use haiku-subagent to grep logs/usage.jsonl and confirm:
- All Haiku lines show lane:"zai" and header_mode present.
- No "haiku" completions on lane:"anthropic".
- No "header_mode":"x-api-key" on any lane:"anthropic".
Return proof lines and a one-line verdict.
```

**D. Two‑terminal UX explainer (for teammates)**

```
Write a 10‑line note explaining how to keep Terminal A proxied (GLM offload) and Terminal B stock (Anthropic), with the exact commands:
ccmitm 8082; ccsub 8082; ccstock. Include when to use each and one proof command.
```

------

## 5) “Old plan on session” (condensed recap)

- **Model‑only routing endurance plan** (what we just exercised):
  - Start MITM on `:8082` with model‑only routing.
  - **Warmup:** status checks + baseline summarize.
  - **Soak:** alternate Sonnet/Haiku for ~30 min; stream remains intact.
  - **Parallel & Burst:** short spikes; backoff optional on 429/503.
  - **Chaos (optional):** restart MITM mid‑stream; confirm no stuck sockets.
  - **Deliverables:** `results/METRICS.json`, `results/SUMMARY.md`, `results/TESTS.md`, update `docs/SESSION_HANDOFF.md`, and bundle.

You now have proof runs showing **Haiku ⇒ Z.AI (header_mode present)** and **no Haiku on Anthropic**, plus `verify-routing` summaries. That’s enough to use the setup for real work locally while you keep iterating.

------

## 6) Longer‑term (lightweight dev while you dogfood)

- **Keep “force by model” as default** for simplicity during dogfooding; toggle it off only when explicitly comparing lanes.
- **Tiny hardening bursts** (each <30 min, run any day):
  - H1 vs H2 mini A/B; record p95 delta.
  - Header mode A/B (if any 401s): `x-api-key` vs `authorization`.
  - Auto‑rotate logs + nightly `bundle` cron (local only).
- **Productize the UX**:
  - Keep the wiki pages linked (Tool index, Shell config, alias pages) so others can install and find the knobs quickly.

------

## 7) Handoff block (copy into `docs/SESSION_HANDOFF.md` if you like)

**State**

- Port: `8082`
- Mode: **model‑only (FORCE_HAIKU_TO_ZAI=1)**
- Kill‑switch: `OFFLOAD_PAUSED=1`
- Header mode: `x-api-key` (flip with `cczai_bearer`)

**Start**

```
ccmitm 8082
ccsub 8082
claude   # /login once if prompted
```

**Prove**

```
cch "Say ok" --output-format json
ccs "Say ok" --output-format json
ccverify
```

**Bundle**

```
ccbundle
```

**If weirdness**

```
cczai_bearer  && ccmitm 8082     # Z.AI 401s
cch1          && ccmitm 8082     # force HTTP/1.1 if H2 jitter
ccpause / ccresume               # pause/resume offload
```

------

### Final call

- **Yes, use this in “production” on your machine today.** Keep the force‑by‑model routing on; your logs already show clean separation and header hygiene.
- Run the two terminals as above, ship a couple of real code reviews/refactors, and snapshot with `ccbundle`.
- If you want me to draft a one‑pager for teammates (“Start here”) I can base it on the new Operator/Repro guides and your wiki’s Tool Setup Index so it’s discoverable in your system.

If you want, I can also hand you a **single “kickoff prompt”** to paste in Sonnet right now that chains the repo‑map, code‑review, header audit, and a tiny refactor—just say the word.
