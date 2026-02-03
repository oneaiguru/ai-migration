# Tracker Repo Survey — Line-Indexed Summary
Source: archive/deepresearch/2025-10-18/deep_research_2025-10-17_tracker_repo_survey.md

## Navigation Index
- L3: Deep Research Task 3 — Subscription-Mode Usage Tracker
- L5: Tracker system repo census
- L9: Top recommendations overview
- L11: Claude-Code-Usage-Monitor (primary fork candidate)
- L40: ccusage CLI (cross-provider analyzer)
- L53: Thompson/py (bandit package)
- L73: Notable mentions & alternatives
- L90: Gaps to cover internally
- L101: Recommended integration approach
- L120: Build plan (pricing, scheduler, bandit steps)

## Highlights
- L11–31: Fork **Claude-Code-Usage-Monitor** to ingest Claude JSONL locally; it already handles 5h windows, weekly caps, plan tables, and can run headless for JSONL output.
- L40–51: Treat **ccusage** as a reference/extract source—reuse its JSON schema and CLI pipeline to normalize both Claude and Codex usage without relying on billing APIs.
- L53–70: Use Python’s **thompson** package for lightweight bandit logic so routing decisions can weigh quality-per-cost without heavy infrastructure.
- L73–85: Alternate tools (Rust monitor, Claude trace interceptors) exist but are optional; core gap remains a unified, file-based event model.
- L90–129: Internal backlog items—define plan metadata (`plans.yaml`), build a scheduler/knapsack loop, integrate bandit rewards, and add pricing-aware tests to ensure the stitched system respects quotas.

## Next Actions
- Fork the Claude monitor and strip a JSONL emitter to plug into our tracker ingestion pipeline (ref L11–31).
- Mirror ccusage’s output fields and add a `codex-ccusage` ingestion path (ref L40–51).
- Wrap the `thompson` bandit in our tracker so Experiment 001 can record rewards and steer provider selection (ref L53–70).
- Author `plans.yaml` + pricing ledger and wire a rule-based scheduler that honours the 5h/weekly caps before layering the bandit decisions (ref L101–129).
