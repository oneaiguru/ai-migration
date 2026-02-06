# Sherlock AI Detective Bot - Deployment Instructions

This document provides detailed instructions for deploying the Sherlock AI Detective Bot (Phase 1 MVP).

## Option 1: Direct Deployment on VPS

### Prerequisites

- Ubuntu 20.04 or newer
- Python 3.9 or higher
- Git (optional)
- Telegram bot token from [@BotFather](https://t.me/BotFather)

### Steps

1. **Update System Packages**

```bash
sudo apt update
sudo apt upgrade -y
```

2. **Install Required Dependencies**

```bash
sudo apt install -y python3 python3-pip python3-venv git
```

3. **Create Project Directory**

```bash
mkdir -p /opt/sherlock-bot
cd /opt/sherlock-bot
```

4. **Set Up Python Virtual Environment**

```bash
python3 -m venv venv
source venv/bin/activate
```

5. **Clone or Upload Code**

If using Git:
```bash
git clone https://github.com/yourusername/sherlock-bot.git .
```

Or manually upload the project files to the server.

6. **Install Python Dependencies**

```bash
pip install -r requirements.txt
```

7. **Configure Environment Variables**

Create `.env` file from example:
```bash
cp .env.example .env
nano .env
```

Update the following settings:
- `TELEGRAM_TOKEN`: Your Telegram bot token
- `DATABASE_URL`: Database connection URL (default SQLite is fine for MVP)
- Other settings as needed

8. **Create Required Directories**

```bash
mkdir -p media/evidence media/characters media/locations logs
```

9. **Initialize Database**

```bash
python scripts/init_db.py
```

10. **Test Run**

```bash
python main.py
```

Check that the bot starts without errors.

11. **Set Up Systemd Service**

Create a service file:
```bash
sudo nano /etc/systemd/system/sherlock-bot.service
```

Add the following content (replace paths and username):
```
[Unit]
Description=Sherlock AI Detective Bot
After=network.target

[Service]
User=your_username
WorkingDirectory=/opt/sherlock-bot
ExecStart=/opt/sherlock-bot/venv/bin/python main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sherlock-bot
sudo systemctl start sherlock-bot
```

Check service status:
```bash
sudo systemctl status sherlock-bot
```

## Option 2: Docker Deployment

### Prerequisites

- Docker
- Docker Compose
- Telegram bot token from [@BotFather](https://t.me/BotFather)

### Steps

1. **Install Docker and Docker Compose**

Follow the official Docker documentation for your operating system:
- [Install Docker](https://docs.docker.com/engine/install/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)

2. **Create Project Directory**

```bash
mkdir -p sherlock-bot
cd sherlock-bot
```

3. **Clone or Upload Code**

If using Git:
```bash
git clone https://github.com/yourusername/sherlock-bot.git .
```

Or manually upload the project files to the server.

4. **Configure Environment Variables**

Create `.env` file from example:
```bash
cp .env.example .env
nano .env
```

Update the following settings:
- `TELEGRAM_TOKEN`: Your Telegram bot token
- Other settings as needed

5. **Create Required Data Directories**

```bash
mkdir -p data media/evidence media/characters media/locations logs
```

6. **Build and Start Containers**

```bash
docker-compose up -d
```

7. **Check Logs**

```bash
docker-compose logs -f
```

## Verifying Deployment

After deployment, verify that the bot is working correctly:

1. Start a chat with your bot on Telegram
2. Send `/start` command
3. Follow the prompts to begin a detective investigation
4. Try all main features:
   - Selecting a case
   - Exploring crime scenes
   - Interviewing characters
   - Examining evidence
   - Using `/inventory` command
   - Using `/continue` command

## Troubleshooting

### Bot Not Responding

Check the service status:
```bash
# For direct deployment
sudo systemctl status sherlock-bot

# For Docker deployment
docker-compose ps
docker-compose logs sherlock-bot
```

Verify that the Telegram token is correct in the `.env` file.

### Database Errors

Check the logs for database errors:
```bash
# For direct deployment
tail -f logs/sherlock_bot.log

# For Docker deployment
docker-compose logs sherlock-bot
```

If needed, reinitialize the database:
```bash
# For direct deployment
python scripts/init_db.py

# For Docker deployment
docker-compose exec sherlock-bot python scripts/init_db.py
```

### Permission Issues

Check directory permissions:
```bash
# For direct deployment
sudo chown -R your_username:your_username /opt/sherlock-bot
chmod -R 755 /opt/sherlock-bot/media

# For Docker deployment
sudo chown -R 1000:1000 data media logs
chmod -R 755 media
```

## Backup and Maintenance

### Database Backup

For SQLite database:
```bash
# For direct deployment
cp /app/data/sherlock.db /app/data/sherlock.db.backup  # adjust if DATABASE_URL points elsewhere

# For Docker deployment
cp data/sherlock.db data/sherlock.db.backup
```

### Log Rotation

Logs are automatically rotated, but you may want to clean up old logs:
```bash
# Find and delete logs older than 30 days
find logs -name "*.log.*" -type f -mtime +30 -delete
```

### Updating the Bot

For direct deployment:
```bash
cd /opt/sherlock-bot
git pull  # If using Git
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart sherlock-bot
```

For Docker deployment:
```bash
cd sherlock-bot
git pull  # If using Git
docker-compose down
docker-compose build
docker-compose up -d
```

## Security Considerations

- Keep your `.env` file secure and restrict permissions:
  ```bash
  chmod 600 .env
  ```
- Regularly update the system and dependencies
- Consider using a firewall to restrict access to your server
- Monitor logs for unusual activity
