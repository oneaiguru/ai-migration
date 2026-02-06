**Title:** Moonshot POC — Full Replacement of *Haiku* with GLM in Claude Code
**Owner:** You
**Goal:** Make every request that uses the “haiku” model family in Claude Code execute on **Z.AI GLM** (Anthropic‑compatible endpoint), while **Sonnet/Opus** continue on your **Claude subscription**. Preserve UX (/model, slash commands) and measure usage.

## Problem

* Claude Code users hit weekly limits; Haiku often drives most tokens.
* Z.AI offers Anthropic‑compatible endpoint + cheaper GLM models.
* We want **seamless** Haiku→GLM without losing **subscription billing** for Sonnet/Opus.

## Scope (POC)

* Build **multiple working paths** to swap Haiku→GLM:

  1. **Subagent‑only offload** (session‑level, safest)
  2. **Session‑level “Haiku sessions → GLM”**
  3. **Dual‑CLI broker** (mid‑session routing via CLI print mode)
  4. **PTY wrapper** (intercept `/model haiku` and route next N turns)
  5. **HTTP gateway** (API‑billed variant, enterprise mode)
* Instrument usage (per backend/model).
* Ship runnable code + scripts; let the coding agent harden them.

## Out of Scope (POC)

* Bulletproof security hardening (we’ll document minimal practices).
* Enterprise SSO or multi‑tenant hosting.

## Success Criteria

* S1: In 3/4 paths, a simple prompt tagged **haiku** returns **GLM** output in ≤ 1s overhead compared to baseline.
* S2: Sonnet/Opus routes **unaltered** through subscription instance.
* S3: Usage log shows **backend=GLM** for haiku, **backend=Anthropic** otherwise.
* S4: No crashes in a 2‑hour scripted session (100+ prompts).

## Risks

* Subscription vs API billing mismatch (only matters for HTTP gateway path).
* CLI session persistence nuances across OS.
* Path differences in response shapes or errors.

## Phases

* P0: Implement all 5 paths minimally; one README to run each.
* P1: Add PTY toggle + log watcher to make UX smoother.
* P2: Analytics & basic cost calculator.

---