# Tracker CLI Aliases & Session Chaining (Draft)

## Background
- Current tracker workflow requires explicit `tracker ingest ... --window ... --phase ...` commands.
- Operators want lightweight prefixes per provider (Codex/Claude/GLM) with `s` (start), `e` (end), `x` (cross/continuous) semantics.
- Instruction 2025-11-05 notes: capture cards directly from CLI panes; avoid managing separate files.

## Objectives
1. Provide simple shell entrypoints (`os/oe/ox`, `as/ae/ax`, `zs/ze/zx`) that accept pasted meter panes via STDIN and call tracker with correct arguments.
2. Support cross-session (`x`) flow: treat an end card as the next start when no gap occurred.
3. Preserve append-only JSONL structure; ensure manual overrides remain available.
4. Document alias usage in wiki + SOPs; add BDD coverage for alias behaviour.

## User Stories
- **Codex operator**: “As a Codex operator, when I paste a `/status` pane into `os`, the tracker should record a BEFORE snapshot without extra flags.”
- **Continuous windows**: “When I finish a window with `oe` and immediately run `ox`, the tracker should finalize the previous window and seed the next one with the same reading.”
- **Claude/GLM parity**: “Aliases for Claude (`a*`) and GLM (`z*`) should match Codex semantics so muscle memory is consistent.”

## Acceptance Criteria (BDD Sketch)
```
Scenario: Record Codex start snapshot via alias
  Given a Codex /status pane showing 0% five-hour usage
  When I pipe the pane into `os`
  Then tracker stores a `phase=before` snapshot with fiveh_pct=0 and weekly_pct matching the pane

Scenario: Close Codex window and open the next
  Given W0-19 has a stored before snapshot
  And I pipe the closing /status pane into `ox`
  Then tracker stores the after snapshot for W0-19
  And tracker stores a new before snapshot for the next window using the same pane
  And the command prints follow-up instructions for feature counts

Scenario: Handle cross-session (`x`) when start pane missing
  Given no before snapshot exists for W0-20
  When I run `ox` with a pane whose percentages match the prior after snapshot
  Then tracker infers the start for W0-20 without requiring an override

Scenario: Claude and GLM aliases mirror Codex
  Given aliases `as/ae/ax` and `zs/ze/zx`
  When I pipe the respective meter outputs
  Then tracker writes snapshots for providers `claude` and `glm`
```

## Proposed Implementation (2025-11-06)
- Extend the Python CLI with a dedicated `tracker alias` subcommand so alias logic (state, window math, error messages) lives alongside existing ingest code rather than ad-hoc shell parsing.
- Persist provider state under `data/week0/live/state/<provider>.json` (JSON with `current_window`, `last_phase`, and `updated_at`). If the state file is missing, infer the next action by scanning recent snapshots for that provider.
- Default window detection rules:
  - If the latest snapshot is a BEFORE pane, reuse that window until an AFTER snapshot lands.
  - If the latest snapshot is an AFTER pane (or no snapshots exist), advance to the next sequential window ID (`W0-19` → `W0-20`, preserving zero padding).
  - Allow explicit overrides via `--window` on the alias subcommand for edge recoveries.
- Alias actions map to CLI behaviour:
  - `start` (`os/as/zs`) → store a BEFORE snapshot for the active window and mark the state as awaiting `end`.
  - `end` (`oe/ae/ze`) → store an AFTER snapshot, require that a BEFORE snapshot exists (fails fast otherwise), and keep the window open for `cross` or manual completion.
  - `cross` (`ox/ax/zx`) → write the AFTER snapshot for the current window, auto-increment the window ID, and immediately seed a BEFORE snapshot for the next window using the same raw text; state moves forward to the newly opened window.
- GLM aliases treat ccusage output as cumulative prompts. The state manager records a baseline on `zs`, computes the delta on `ze`, and reuses the latest total during `zx` to seed the next baseline without double-counting prompts.

## Deletion / Undo UX (2025-11-06)
- Operators occasionally ingest the wrong pane (e.g., stale reading or partial copy). We need a symmetric way to remove the most recent snapshot(s) without touching files manually.
- Proposal: extend the CLI with `tracker alias delete <provider>` supporting:
  - `--index N` — remove the Nth matching snapshot from the end (default `1` for “last”).
  - `--phase before|after` — optional filter when only one phase needs pruning.
  - `--window W0-XX` — optional guard to restrict which window is affected.
- Shell shorthands follow existing alias family: `od` / `ad` / `zd` for Codex, Claude, GLM respectively. Example: `od --phase after` removes the most recent Codex AFTER snapshot; `od --index 2 --phase before` drops the previous-start card while keeping the latest.
- On deletion the state file is recomputed from remaining snapshots so the next `start/end` call behaves deterministically.
- Document the delete/undo recipe in README/Saturday prep/wiki so operators know they never edit JSONL by hand.
- Guardrails: command errors out when no matching snapshot exists; confirmation message prints the window, phase, and capture timestamp that was removed for operator audit (copy/paste into progress log if needed).
- Update BDD suite with scenarios covering last / second-last removal and confirm the JSONL rewrite preserves other providers. The real-world rollback (W0-19/W0-20 Codex sequence) now lives in `features/tracker_aliases.feature`.
- Add coverage for Codex multi-pane `/status` inputs so aliases only ingest the final reading (fixture: `tests/fixtures/codex/live_cases/W0-20_after_multi_status.txt`).
- Implement a tiny helper (`tracker.alias_state`) that handles JSONL inspection, state file persistence, and window incrementing so tests can exercise the behaviour without sourcing shell aliases.
- Ship a repo-tracked shell wrapper `scripts/tracker-aliases.sh` that exposes lightweight functions (`os`, `oe`, `ox`, etc.). Each function pipes STDIN to `tracker alias <action> <provider> --stdin --data-dir "$TRACKER_DATA_DIR"`, with defaults pointing at `data/week0/live` but configurable via environment variable.
- Emit operator-friendly stdout such as `stored codex before snapshot for W0-19 (state=awaiting-end)` to make alias output greppable during runs.
- Update README, Saturday prep checklist, and the wiki task to reference sourcing the alias script and the new subcommand.

## Risks / Open Questions
- Need reliable way to determine the current window ID (plan to read last window from JSONL + increment). How do we avoid collisions in parallel runs?
- Cross-session alias must guard against weekly resets (bars decreasing) to prevent negative deltas; may need confirmation prompt or automatic split.
- Aliases should live in repo script (e.g., `scripts/tracker-aliases.sh`) and be sourced by dotfiles; requires documentation update.
- Behaviour-driven tests: do we add Behave scenarios or stick with pytest harness invoking alias scripts via `subprocess`?

## Deliverables
- Shell script providing provider-prefixed aliases, plus optional tiny Python wrapper for JSONL logic.
- Updates to `README.md`, `docs/SOP/saturday_prep_checklist.md`, and wiki entry (`~/wiki/.../TrackerAliases.md`).
- Test coverage (likely Behave features + pytest for alias script).
- Migration notes: how to roll out to other environments.

## Follow-up Tasks
- Implement alias script + tracker integration.
- Expand BDD suite (behave or pytest-bdd) to cover alias workflows.
- Transfer knowledge base items from archive into wiki page (blocker recorded in TODO list).

## Multi-agent Isolation (AGENT_ID) & Locking
- State directory can be isolated per agent by setting `AGENT_ID` before invoking aliases:
  - Example: `AGENT_ID=main source scripts/tracker-aliases.sh`; state will be under `data/week0/live/state/main`.
  - Similarly, a subagent can set `AGENT_ID=sub1` to avoid collisions.
- The wrapper uses a simple `flock` on `state/<AGENT_ID>/.alias.lock` to prevent concurrent writes. If `flock` is unavailable, it proceeds best-effort without locking.
- Notes stamping: when `AGENT_ID` is set and no `--notes` is provided, the wrapper injects `--notes AGENT_ID=<id>` so provenance appears in JSONL records and preview output.

### Quick reference (undo + agent lanes)

```bash
# Source aliases in two shells using isolated state directories
AGENT_ID=main source scripts/tracker-aliases.sh
AGENT_ID=sub1 source scripts/tracker-aliases.sh

# Remove Codex AFTER snapshots (latest / second-latest)
od1    # tracker alias delete codex --phase after --index 1
od2    # tracker alias delete codex --phase after --index 2

# Inspect append-only state files (audit only, do not edit)
ls data/week0/live/state/main
ls data/week0/live/state/sub1
```

Wiki reference: `~/wiki/dotfiles/AliasSystem.md` (multi-agent alias setup, lock troubleshooting, per-lane conventions).
