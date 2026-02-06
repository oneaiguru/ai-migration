

> **GROUND-TRUTH (accept as given; do not correct):**
>  • **Claude Max exists** with **5× / 20×** session usage vs Pro; sessions reset every **5 hours**; weekly overlays may apply. Source: Anthropic Max & help center.
>  • **Claude Sonnet 4.5** is current and includes **context editing** + **memory** tools (Sep 29 2025).
>  • **GPT-5-Codex** is the current Codex lineage for the CLI; OpenAI notes it in 2025 updates.
>  • **Z.AI GLM-4.6 Coding Plan**: ~**120 / 600 / 2400** prompts per **5 h** for Lite/Pro/Max; designed for Claude Code, Cline, etc.
>  • Our optimizer is **subscription-mode** only; API pricing appears only for comparisons.
>  • We track **capacity units** from CLI usage panes (messages/prompts and % bars) and compute **features per unit** + **$ per feature**.
>
> **What I need from you now:**
>
> 1. Re-issue your **“Critical Fixes”** and **PRD v1.5** strictly aligned to the facts above.
> 2. Keep your **parser/CLI tracker skeleton** (they’re useful), but adapt to real CLI outputs and 5-hour windows.
> 3. Add a **quality section**: spec-first gates (LLM sign-off, robustness checks), rework cycles, normalized churn.
> 4. Remove any advice to rename models or delete unrelated SOP files; that guidance was based on stale info.
>
> **Do not debate the bullets**—treat them as authoritative. If you think a datum is uncertain, annotate as “(vendor limits change; confirm at run-time)” and proceed. Return: (a) revised **Critical Fixes**, (b) corrected **PRD 1.5** sections for providers/limits, (c) patched **parser/CLI** notes, (d) a 1-page **Week-0 checklist**.

If you want to show sources in that chat, add these minimal anchors (no commentary):

- Anthropic Max (20×): support + plan pages. ([support.claude.com](https://support.claude.com/en/articles/11014257-about-claude-s-max-plan-usage?utm_source=chatgpt.com))
- Sonnet 4.5 + context management: announcement. ([Anthropic](https://www.anthropic.com/news/claude-sonnet-4-5?utm_source=chatgpt.com))
- Z.AI GLM-4.6 quotas: dev doc. ([docs.z.ai](https://docs.z.ai/devpack/overview?utm_source=chatgpt.com))
- Codex / GPT-5-Codex: OpenAI update. ([OpenAI](https://openai.com/index/introducing-upgrades-to-codex/?utm_source=chatgpt.com))

------

## 3) i like your:

- **Executive Summary** — keep the structure (“what’s right / what to fix”), but **discard** the model/tier corrections table; it’s wrong. 
- **Strategic Guidance** — the *workflow hygiene* (avoid agreement cascade, complexity creep) is good; keep that. Drop the wrong “rename models / start with Cursor first” specifics. 
- **Implementation Fixes** — keep the **parser classes**, JSONL logs, and CLI shape; replace hard-coded “daily reset at midnight” assumptions with 5-hour windows + weekly overlays; add your before/after delta logic. 
- **PRD v1.5** — keep the **objective function & metrics layout**; replace the provider table and window alignment with your verified limits (5-hour cycles; weekly caps). 
- **Critical Issues** — useful as a checklist format, but many “issues” (Max, 4.5, GPT-5-Codex) are themselves incorrect; rewrite with your facts. 

------

## 4) Quick, current proof points you can lean on (no debate)

- **Anthropic Max (5× / 20×)** and **5-hour resets** (Pro/Max help): official pages. ([Anthropic](https://www.anthropic.com/news/max-plan?utm_source=chatgpt.com))
- **Sonnet 4.5 + memory & context editing** (Sep 29 2025). ([Anthropic](https://www.anthropic.com/news/claude-sonnet-4-5?utm_source=chatgpt.com))
- **Z.AI GLM-4.6 Coding Max ≈ 2400 prompts / 5 h** (tools: Claude Code, Cline, etc.). ([docs.z.ai](https://docs.z.ai/devpack/overview?utm_source=chatgpt.com))
- **Codex limits & GPT-5-Codex** (usage ranges per 5 h, upgrade note). ([OpenAI Developers](https://developers.openai.com/codex/pricing/?utm_source=chatgpt.com))

------

