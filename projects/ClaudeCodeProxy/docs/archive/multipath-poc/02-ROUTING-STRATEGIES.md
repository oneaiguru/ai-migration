## Strategy A — Subagent‑only offload (safest MVP)

* **How:** Configure the Z.AI instance with `CLAUDE_CODE_SUBAGENT_MODEL=haiku`. Trigger subagent via command; the **whole subagent** runs on Z.AI.
* **Pros:** Clean separation; no mid‑thread context juggling.
* **Cons:** Only subagent work offloaded.

## Strategy B — Session‑level Haiku sessions

* **How:** A launcher starts a new session on Z.AI when the user intends a “haiku session”; Sonnet/Opus sessions stay on subscription.
* **Pros:** Zero mid‑session overhead; simple mental model.
* **Cons:** Requires the user to choose at session start (we’ll add helpers).

## Strategy C — Dual‑CLI broker (mid‑session, non‑interactive)

* **How:** Post prompts to `localhost:4000/run` with `{prompt, model}`. The broker spawns `claude -p --output-format json` in either a **ZAI workdir** or **SUB workdir** to keep contexts separate.
* **Pros:** Fine‑grained switching per turn; no HTTP auth hacks.
* **Cons:** A bit more glue logic.

## Strategy D — PTY wrapper (interactive)

* **How:** Wrap Claude with `node-pty`. Intercept `/haiku|/sonnet|/opus` and flip which underlying CLI receives the next commands.
* **Pros:** Feels “seamless” in one terminal; keeps subscription billing.
* **Cons:** Trickier escape sequences / resize handling.

## Strategy E — HTTP gateway (enterprise)

* **How:** Express proxy at `ANTHROPIC_BASE_URL`; route by `body.model` to Anthropic or Z.AI using **API keys**.
* **Pros:** Classic routing; easy metering.
* **Cons:** **API‑billed**, not subscription—keep separate.

---