# HANDOFF: SyncFlow (Codex-first)

> Location: /Users/m/ai/projects/qbsf
> Last Updated: 2026-01-22
> Status: ready

---

## Purpose
Define project-specific scope, invariants, and run/automation rules for Codex loops.

---

## Project Scope + Stop Criteria (MVP)

In scope:
- Build a local-only SyncFlow app under `syncflow/` using the spec in `~/Downloads/qbsfsaas.md`.
- Mock CRM/accounting connections, syncs, and billing flows (no real API calls).
- Persist data locally with Prisma + SQLite.

Out of scope:
- Production deployment or real OAuth/API integrations.
- Changes to existing QB/SF integration code or Salesforce metadata unless explicitly tasked.
- Refactors of legacy docs or task history.

Stop criteria (done when all are true):
- The SyncFlow app runs locally and core P0 flows render (landing, pricing, auth, dashboard, connections, automations).
- Mock sync execution and history work end-to-end with local data.
- Lint/tests for the new app pass if configured.

---

## Smoke Test Checklist

1. `cd syncflow && npm run lint` (if configured)
2. `cd syncflow && npm test` (if configured)
3. `cd syncflow && npm run dev` and verify landing + dashboard load

---

## Ralph Loop Mode (Default)

Purpose: deterministic, audit-friendly loops. Treat resume as a tool, not the default.

Rules:
- Start each iteration as a fresh non-interactive run (`CLI run ...`), not `CLI resume`.
- Never resume transcript state; only persist repo state + plan/spec files.
- Read and update a single state file (`IMPLEMENTATION_PLAN.md`).
- One task per loop.
- Loop ends after: tests -> plan update -> commit.

### Prompt Contract (Plan vs Build)

- Repo contains: `PROMPT_plan.md`, `PROMPT_build.md`, and `IMPLEMENTATION_PLAN.md`.
- Plan mode updates plan only; no code changes.
- Build mode implements the single most important plan item; tests then commit.
- Entrypoint selects prompt by `MODE=plan|build` (no `PROMPT.md` ambiguity).
- Prompts live in the repo root and are versioned via git.

---

## Guardrails (Required)

- Do not commit resume state or run artifacts.
- Do not edit `.env` or `SECRETS.local.md`; use templates instead.
- Avoid destructive commands and preserve legacy assets.
