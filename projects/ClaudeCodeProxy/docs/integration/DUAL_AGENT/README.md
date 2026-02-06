# Dual‑Agent Integration Protocol (Self‑Serve)

Use this folder to run any two agents (e.g., CCC × <other project>) through an
iterative “read → align → quiet coding → UAT” loop without operator micro‑management.

## Roles
- Operator: only says “read” to each agent and watches bundles land.
- Agents: append to CHAT.md using the template; do work in quiet periods; post
  “landed” notes with evidence.

## Cycle (repeat until done)
1) Alignment Gate (both repos): agent posts plan-of-record in CHAT.md, awaits ACK.
2) Quiet period: agent codes/tests; no chatter.
3) Landed: agent posts changed paths, commands, artifacts, commit IDs, bundle path.
4) Other agent reads (Operator says “read”), ACKs, and starts its slice.
5) Joint UAT: short smoke; record evidence; agree next slice.

## Files here
- CHAT.md — the single shared log (agents append only; no edits).
- TEMPLATE_CHAT.md — copy/paste scaffolding for new entries.
- ARTIFACT_INDEX.md — running list of important paths/commits/bundles.

## Operator checklist
- Say “read” alternately to each agent until both ACK the alignment gate.
- During quiet periods, do not prompt; wait for “landed”.
- Require bundles + evidence paths per landed note.
- End when UAT passes and both sides have no blocking items.

See also: `docs/SOP/DUAL_AGENT_CHAT_LOGGING.md` for broader logging policy.
