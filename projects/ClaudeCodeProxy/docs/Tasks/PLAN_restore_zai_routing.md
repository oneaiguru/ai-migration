# Plan — Restore Haiku → Z.ai Routing (Community + Licensed Scenarios)

## Context
- R4 persistence/rollups/metrics are working.
- Local CCP forwards traffic, but current runs show Haiku requests hitting Anth lane with `decision:"license_block"` and Z.ai attempts returning 5xx (fallback).
- CLI errors (EPERM under `~/.claude/debug`) and missing Anth Authorization lead to 401s on the Anth lane.
- No historical `lane:"zai"` log snapshot exists in Git (logs were cleaned in Oct 2025).

## Goal
- Reproduce a working state (Haiku → Z.ai → 200) matching the timeframe when wiki instructions were written.
- Identify which change(s) introduced the regression after that point.
- Re-establish a reliable end-to-end UAT flow (T1–T3) with documented env/profile steps.

## Approach (High-Level)

1. **Clone the historical working setup**
   - Identify the last known working commit (based on wiki timestamps or local notes) before licensing/persistence changes.
   - Clone or check out that commit into a separate working tree (e.g., `~/git/tools/ClaudeCodeProxy-legacy`).
   - Verify Haiku → Z.ai success (with the same `.env` credentials).
   - Capture logs/metrics as a baseline reference.

2. **Diff and reintroduce changes gradually**
   - Compare the historical tree with current HEAD to spot major areas that changed (licensing hooks, header management, profile scripts).
   - Reapply changes incrementally, testing Haiku routing at each step:
     - Header handling
     - License gating logic
     - Logging/persistence
   - Use git bisect if necessary to find the exact commit that broke Z.ai routing.

3. **Fix and document current HEAD**
   - Once we pinpoint the regression(s), fix the implementation so HEAD routes correctly.
   - Update docs/aliases to show the precise steps (profile ≠ licensed mode; how to inject Authorization header).
   - Append the lane=zai proof to `results/TESTS.md` and `docs/SESSION_HANDOFF.md`.

4. **Optional: improve CLI flow**
   - Ensure CLI runs don’t fail on the debug dir (mkdir) and send Authorization headers if the user is logged in.
   - Possibly add a fallback to read `~/.config/ccp/license.pack` if env vars are absent.

## Task Breakdown
- T0 (prep): Read the following in this repo before coding:
  - `docs/SOP/PROFILES.md` (Dev vs Prod profiles, license verification checklist)
  - `docs/OPS-GUIDE.md` (persistence metrics, env toggles)
  - `docs/System/STORE.md` (SQLite schema + retention)
  - `docs/roadmap/R5-SaaS-CLI.md` and `docs/Tasks/BACKLOG_R5_SaaS_CLI.md` (context)
  - `AGENTS.md` & `README.md` (env conventions, `.env` usage)
  - `scripts/dev/dev-license-activate.sh` (trial pack helper)
  - `~/Desktop/haiku_zai_investigation.md` (network/curl recipes)
  - Optional: skim `~/wiki/dotfiles/ClaudeMITM-Flow.md` and `~/wiki/dotfiles/ClaudeUAT-Profile.md` for alias usage (if accessible).
- T1: Identify working commit & reproduce Haiku→Z.ai success (legacy tree) – *done 2025-10-26* (`dc3791e`, see `ClaudeCodeProxy-prelicense/logs/usage_go_repro_quick.jsonl`).
- T2: Inline comparison (git bisect or manual diff) to locate regression – *done 2025-10-26* (regression at `44025be`, license gate).
- T3: Patch current HEAD (restore routing) – *complete 2025-10-26* (`CCP_LICENSE_PUBKEY_B64` accepts kid entries; `scripts/uat/run_*` prove Z.ai and Anth lanes via CLI).
- T4: Update docs/TESTS/UAT evidence – *owner: next agent*

## Notes
- Current `.env` already contains the Z.ai key (single-line or `ZAI_API_KEY=...`).
- Trial license helper (`scripts/dev/dev-license-activate.sh`) works; only upstream auth remains.
- The issue may stem from missing Authorization headers (for Anth) or header mode mismatches (for Z.ai).
- Keep commit history clean; all investigative code should be in a separate branch or working tree until the fix is confirmed.
