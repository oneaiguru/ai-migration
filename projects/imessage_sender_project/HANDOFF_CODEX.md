# HANDOFF: iMessage Sender / iCampaign Pro (Codex-first)

> Location: /Users/m/ai/projects/imessage_sender_project
> Last Updated: 2026-01-22
> Status: ready

---

## Purpose
Define project-specific scope, invariants, and run/automation rules for Codex loops.

---

## Project Scope + Stop Criteria (MVP)

In scope:
- Incrementally evolve this repo into iCampaign Pro per `imessage.md`.
- PyQt6 desktop GUI with sidebar navigation and core screens.
- SQLite-backed data models for contacts, templates, campaigns, settings, license.
- Campaign send flow reusing existing AppleScript sender.
- Local license/trial validation and packaging scripts.

Out of scope:
- App Store submission or sandboxed automation.
- Mobile or web app builds.
- External services (no backend, no hosted license server).
- Marketing site, payments, or support tooling.

Stop criteria (done when all are true):
- P0 items in `IMPLEMENTATION_PLAN.md` are complete.
- GUI can create a campaign and run a send flow using the existing sender.
- `python -m pytest tests` passes (or updated tests cover new modules).

---

## Smoke Test Checklist

1. `python -m pytest tests`
2. `python -m compileall -q .`
3. `python main-script.py -h`

---

## Ralph Loop Mode (Default)

Purpose: deterministic, audit-friendly loops. Treat resume as a tool, not the default.

Rules:
- Start each iteration as a fresh non-interactive run, not resume.
- Never resume transcript state; only persist repo state + plan/spec files.
- Read and update a single state file (e.g., `IMPLEMENTATION_PLAN.md`).
- One task per loop.
- Loop ends after: tests -> plan update -> commit.

### Prompt Contract (Plan vs Build)

- Repo contains: `PROMPT_plan.md`, `PROMPT_build.md`, and `IMPLEMENTATION_PLAN.md`.
- Plan mode updates plan only; no code changes.
- Build mode implements the single most important plan item; tests then commit.
- Entrypoint selects prompt by `MODE=plan|build`.
- Prompts live in the repo root and are versioned via git.

---

## Safety Defaults (Codex)

- Default to full-auto in normal runs.
- Reserve bypassed approvals/sandbox for isolated runners only.
- Do not assume the Codex OS sandbox works inside Docker; isolation is the container/VM boundary.

---

## Runtime Layout

- Workspace root: /Users/m/ai/projects/imessage_sender_project
- Artifact root: not used
- Resume state root: not used

---

## Guardrails (Required)

- Do not commit resume state or run artifacts.
- Do not edit `final_delivery/` or `final_delivery_en/` unless asked.
- Do not edit `imessage.md` or `specs/` unless explicitly requested.
