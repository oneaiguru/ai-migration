# PRD.md — Vera Pilot: Telegram DM ↔ Topics Relay (Phase 1 ONLY)

## Problem (1 paragraph)
Course participants are currently messaging organizers in scattered DMs. This creates chaos: duplicated questions, delayed responses, missed messages, and burnout for Vera and the Moscow team. Organizers need one public, organized place to answer participant questions without asking anyone to adopt a new tool.

## Solution (1 paragraph)
Deploy a single Telegram bot that becomes the only point of contact for questions. Participants DM the bot; the bot creates (or reuses) a dedicated **forum topic** (Topic thread) inside a single organizer “forum” supergroup and copies the participant message into that topic. Organizers reply inside the topic; the bot copies the reply back to the participant in DM. Everything is Telegram-native for organizers.

## Users
- **Participants:** DM the bot with questions
- **Organizers (Vera + Moscow + volunteers):** answer in Topics in a single organizer group

## Scope (Phase 1 — locked)
1) Participant DMs bot → bot creates forum topic in organizer group (if first message from that participant)
2) Bot copies participant message into that topic
3) Organizer replies in that topic → bot copies reply back to participant
4) `/start` command → welcome/instructions

## Success criteria (max 5 bullets)
- **Reliability:** Every inbound participant DM is either delivered into the correct organizer topic or logged with an explicit error (no silent drops).
- **Latency:** Messages and replies are relayed typically in seconds under pilot load (target: < 5s median during normal network conditions).
- **Adoption:** During the pilot, organizers use Topics for replies (not DMs) for the majority of questions.
- **Operational stability:** Bot runs continuously on VPS during the pilot period with automatic restart on failure (Docker Compose restart policy).
- **Organizer outcome:** Vera confirms DM chaos is materially reduced (qualitative “yes/no” + short notes).

## Out of scope (explicit)
- `/faq`, `/status`, `/schedule` commands
- Payment / registration / GetCourse integration
- CSV import or participant allowlists
- Broadcasting, reminders, or mass messaging
- AI answers, RAG, agent copilots, training pipelines
- Multi-tenant provisioning, token pools, self-serve creation
- Web UI / web inbox

## Non-negotiable constraints
- **Framework:** GramIO (no alternatives)
- **Language:** TypeScript, strict mode (no `any`)
- **Database:** SQLite (Week 1)
- **Deployment:** Docker Compose on VPS
- **Delivery mode:** Long polling (no webhook, no public endpoint)

## Assumptions
- Organizer group is a **supergroup with Topics enabled (forum)**.
- Bot is admin in organizer group with permission to manage topics.
- Participants message the bot first (required for bot to DM them back).
