# TG Org Bot (Vera pilot)

Vera pilot bot relays participant DMs into organizer forum topics and sends organizer replies back to the participant.
It runs with long polling on GramIO and stores state in SQLite.

## Quickstart
1. Copy `.env.example` to `.env`.
2. Set `bot_token`, `organizer_forum_chat_id`, `desk_id`, and `sqlite_path=/data/telegram.sqlite`.
3. Start the bot:

```bash
docker compose up -d --build
```

4. Tail logs:

```bash
docker compose logs -f tgorgbot
```

For operations, backups, and smoke tests, see `docs/RUNBOOK.md`.

## Notes
- Uses long polling (no webhook required).
- Built on GramIO.
- Persists conversations in SQLite under `./data`.
