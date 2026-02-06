# Runbook

## Prerequisites
- Bot is an admin in the organizer forum chat.
- Topics are enabled in the organizer forum.
- Required env vars are set (bot_token, organizer_forum_chat_id, desk_id, sqlite_path).

## Configure
1. Copy `.env.example` to `.env`.
2. Set `sqlite_path=/data/telegram.sqlite`.
3. Fill in `bot_token`, `organizer_forum_chat_id`, and `desk_id`.

## Start
```bash
docker compose up -d --build
```

## Stop
```bash
docker compose down
```

## Restart
```bash
docker compose restart
```

## Logs
```bash
docker compose logs -f --tail=200 tgorgbot
```

## Backup SQLite
1. Stop the container to avoid a partial copy.
2. Copy the database file to a backup location.

```bash
mkdir -p backups
cp data/telegram.sqlite backups/telegram.sqlite.$(date +%Y%m%d%H%M%S)
```

## Smoke Test
- DM the bot and confirm a forum topic is created.
- Confirm the DM is copied into the organizer topic.
- Reply in the organizer topic and confirm it is copied back to the DM.
