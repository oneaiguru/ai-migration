# HANDOFF: SanghaDesk (Codex-first)

> Location: /Users/m/ai/projects/tgorgbot/ralph-loop-template
> Last Updated: 2026-01-22
> Status: ready

---

## Purpose
Define project-specific scope, invariants, and run/automation rules for Codex loops.
Replace all placeholders before first use.

---

## Project Scope + Stop Criteria (MVP)

In scope:
- Local-first Telegram inbox dashboard with auth, onboarding, and messaging.
- Settings plus pricing/checkout with mock payments.
- Telegram relay integration using existing tgorgbot relay code.
- RU primary with EN fallback; responsive across desktop/tablet/mobile.

Out of scope:
- OAuth, real billing, or third-party integrations.
- Channels beyond Telegram or native mobile apps.
- Enterprise features beyond the MVP (routing, advanced analytics).

Stop criteria (done when all are true):
- `npm run dev` boots frontend and backend locally with SQLite persistence.
- Telegram DM relay appears in the dashboard and replies send from the UI.
- MVP flows match spec: auth, onboarding, dashboard, settings, pricing, checkout; RU/EN and responsive.

---

## Smoke Test Checklist

1. Run `npm run dev` and confirm frontend + backend start (once implemented).
2. Send a Telegram DM to the bot; message appears in the dashboard; reply from UI delivers back to Telegram.
3. Restart the app and confirm messages/settings persist via SQLite.

---

## Ralph Loop Mode (Default)

Purpose: deterministic, audit-friendly loops. Treat resume as a tool, not the default.

Rules:
- Start each iteration as a fresh non-interactive run (`CLI run ...`), not `CLI resume`.
- Never resume transcript state; only persist repo state + plan/spec files.
- Read and update a single state file (e.g., `IMPLEMENTATION_PLAN.md` or equivalent).
- One task per loop.
- Loop ends after: tests -> plan update -> commit.

### Prompt Contract (Plan vs Build)

- Repo contains: `PROMPT_plan.md`, `PROMPT_build.md`, and `IMPLEMENTATION_PLAN.md`.
- Plan mode updates plan only; no code changes.
- Build mode implements the single most important plan item; tests then commit.
- Entrypoint selects prompt by `MODE=plan|build` (no `PROMPT.md` ambiguity).
- Default: prompts live in the repo root and are versioned via git.
- Optional: set `PROMPT_FILE` to point to an external prompt file if you want prompt history outside git.

### Optional: External Prompt Archive (No Extra Git)

If you want prompts outside the repo but still versioned, keep a simple archive:

```bash
#!/bin/bash
set -euo pipefail

PROMPT_DIR="$HOME/.ralph-prompts"
ARCHIVE_DIR="$PROMPT_DIR/archive"
mkdir -p "$ARCHIVE_DIR"

for f in PROMPT_plan.md PROMPT_build.md; do
  if [ -f "$f" ]; then
    ts=$(date -u +%Y%m%dT%H%M%SZ)
    dest="$ARCHIVE_DIR/${f%.md}-$ts.md"
    latest="$PROMPT_DIR/$f"
    if [ -f "$latest" ] && cmp -s "$f" "$latest"; then
      continue
    fi
    cp "$f" "$dest"
    ln -sfn "$dest" "$PROMPT_DIR/$f"
  fi
done
```

Then point the runner at the current prompt:
`PROMPT_FILE="$HOME/.ralph-prompts/PROMPT_build.md"`.

---

## Safety Defaults (Codex)

- Default to `--full-auto` in normal runs.
- Reserve `--dangerously-bypass-approvals-and-sandbox` for isolated runners only (no secrets, minimal network).
- Do not assume the Codex OS sandbox works inside Docker; isolation is the container/VM boundary.

---

## Runtime Layout (optional)

- Workspace root: /Users/m/ai/projects/tgorgbot/ralph-loop-template
- Artifact root: N/A (no external artifact store)
- Resume state root (if any): N/A

### Artifact Store Contract (optional)

Not used for this repo; rely on git history plus `progress.md`/`docs/SESSION_HANDOFF.md`.

---

## Runner/Worker Contract (optional)

Not used for this repo.

---

## Container Run Template (optional)

Not used for this repo.

---

## Guardrails (Required)

- Do not commit resume state or run artifacts.
- Banned paths (customize):
  - .codex/**
  - .claude/**
  - output/**
- Allowed paths (customize):
  - /Users/m/ai/projects/tgorgbot/ralph-loop-template/**

---

## Resume / Teleport Policy (optional)

- Repo = durable state (code/spec/plan/skills + static prompts).
- Artifact store = per-run evidence (jsonl + meta + summary + prompt snapshot).
- Resume state is out-of-band only; never committed to git.

---

## AA Parity Placeholders (optional)

Not used for this repo.
