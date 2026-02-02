# AI Docs Inventory Guide

Quick reference for agents to locate resources inside `ai-docs/`. Keep this index updated as new drafts or references are added.

## Core Guidance
- `README.md` – Workspace overview (folder map, ground rules, status snapshot).
- `MANIFEST.md` – Harvested artifacts inventory (third-party docs, snippets, repos).
- `RESEARCH_BRIEF.md` – Library/version notes (Radix dialog, TanStack virtualization, RHF/Zod, accessibility checklists).
- `QUESTIONS.md` – Open issues and assumptions tracked during migration prep.
- `ACCESSIBILITY_CHECKLIST.md` – Radix/Dialog accessibility verification items validated in the playground demos.

## URL Harvest Logs
- `corrected_urls.md` / `corrected_urls2.md` – Original crawl source lists with fixed URLs.
- `migration_urls.md` / `migration_urls_latest.md` – Script outputs tracking documentation refresh batches.

## Wrapper Drafts
- `wrappers-draft/ui/` – Dialog, Popover, Button prototypes (Radix-based overlays).
- `wrappers-draft/form/` – FormField, EmployeeForm, README (RHF + Zod patterns).
- `wrappers-draft/data/` – DataTable prototype (TanStack Table + Virtual).

## Playground Examples
- `playground/src/examples/` – Vite demos (table, form, overlay, etc.). Start the playground for hands-on validation.

## Reference Snippets
- `reference/snippets/` – Harvested code samples (TanStack table/virtual, MiniSearch, Tremor, etc.).

## Scripts
- `scripts/docs_search.mjs` – Search helper for reference docs.
- `scripts/fetch_all_docs.sh` – Regenerates documentation bundle (when needed).

## llm-reference
- `llm-reference/AiDocsReference.md` – Summary of external migration review findings and follow-up actions (used by Phase 7 tasks).
- `llm-reference/index.md` (this file) – High-level map of ai-docs.

Keep this guide aligned with repo changes so future agents know where to look before drafting discovery or plans.
