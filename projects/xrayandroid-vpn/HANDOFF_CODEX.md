# HANDOFF: <Project Name> (Codex-first)

> Location: <repo root>
> Last Updated: <YYYY-MM-DD>
> Status: <draft|ready>

---

## Purpose
Define project-specific scope, invariants, and run/automation rules for Codex loops.
Replace all placeholders before first use.

---

## Project Scope + Stop Criteria (MVP)

In scope:
- <item>
- <item>

Out of scope:
- <item>
- <item>

Stop criteria (done when all are true):
- <item>
- <item>

---

## Smoke Test Checklist

1. <command or behavior>
2. <command or behavior>
3. <command or behavior>

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

- Workspace root: <path>
- Artifact root: <path>
- Resume state root (if any): <path>

### Artifact Store Contract (optional)

```
<artifact_root>/<session>/<run>/
  raw.jsonl.gz
  meta.json
  summary.txt
```

`meta.json` (example fields to customize):

```json
{
  "session_id": "...",
  "run_id": "...",
  "provider": "codex|other",
  "mode": "plan|build|debug",
  "branch": "session/<session_id>",
  "git_sha": "...",
  "model": "...",
  "prompt_path": "...",
  "prompt_sha256": "...",
  "status": "ok|error",
  "exit_code": 0,
  "started_at": "...",
  "ended_at": "..."
}
```

---

## Runner/Worker Contract (optional)

If you use a coordinator/worker architecture, define the contract here:

- `POST /tasks` payload:
  - <fields>
- `GET /tasks/poll` response:
  - <fields>
- `POST /tasks/:id/complete` payload:
  - <fields>

Concurrency rule:
- <rule>

---

## Container Run Template (optional)

```bash
docker run --rm \
  -v <repo>:/workspace \
  -v <resume_state>:/root/.codex \
  -v <artifact_root>:/output \
  -e MODE="plan|build" \
  -e CODEX_MODEL="<model>" \
  <image:tag>
```

---

## Guardrails (Required)

- Do not commit resume state or run artifacts.
- Banned paths (customize):
  - <path>
- Allowed paths (customize):
  - <path>

---

## Resume / Teleport Policy (optional)

- Repo = durable state (code/spec/plan/skills + static prompts).
- Artifact store = per-run evidence (jsonl + meta + summary + prompt snapshot).
- Resume state is out-of-band only; never committed to git.

---

## AA Parity Placeholders (optional)

If you want to align with the AA monorepo later, fill these in or replace this file:
- Scope: <AA Stage 0 components>
- Artifact layout: <AA /output/runs layout>
- Smoke test: <AA stage0_smoke_test command>
- Skills drafts path: <AA skills drafts path>
