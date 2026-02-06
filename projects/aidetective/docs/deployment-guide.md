# Sherlock AI Detective Bot - Deployment and Testing Guide

This guide provides detailed instructions for deploying and testing the Sherlock AI Detective Bot (Phase 1 MVP) on a VPS server.

## 1. Server Prerequisites

Ensure your VPS has:
- Ubuntu 20.04 or newer
- At least 1GB RAM
- At least 10GB storage
- Python 3.10+ installed
- Public internet access
- SSH access

## 2. Project Setup

### 2.1 Environment Preparation

Connect to your VPS via SSH and prepare the environment:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required system dependencies (ensure Python 3.10+)
sudo apt install -y python3 python3-pip python3-venv git

# Create project directory
mkdir -p /opt/sherlock-bot
cd /opt/sherlock-bot

# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate
```

### 2.2 Code Deployment

Deploy the code to the server:

```bash
# Clone repo or upload files to the server
# For this guide, we'll assume manual file upload

# Create the project directory structure
mkdir -p bot database/repositories config/stories story_engine utils media/{evidence,characters,locations}

# Create necessary __init__.py files
touch bot/__init__.py database/__init__.py database/repositories/__init__.py config/__init__.py config/stories/__init__.py story_engine/__init__.py utils/__init__.py
```

Place all the code files in their respective directories according to the deployment-package.md file.

### 2.3 Dependencies Installation

Install the required Python packages:

```bash
# Make sure you're in the project root and the virtual environment is activated
pip install -r requirements.txt
```

## 3. Configuration

### 3.1 Environment Variables

Create a `.env` file in the project root:

```bash
cat > .env << EOL
# Telegram Bot Configuration
TELEGRAM_TOKEN=your_telegram_bot_token_here

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///app/data/sherlock.db  # override to a writable path (e.g., ./data/sherlock.db) when running outside Docker

# Application Configuration
LOG_LEVEL=INFO
MEDIA_DIR=media

# Content Configuration
MAX_STORIES_FREE=3
MAX_EVIDENCE_SIZE_MB=2.0
EOL
```

Replace `your_telegram_bot_token_here` with your actual Telegram bot token obtained from BotFather, and `your_openai_api_key_here` with your OpenAI API key if you're using AI features.

### 3.2 Story Data

Place the story JSON file in the appropriate directory:

```bash
# Make sure you're in the project root
cp library_shadows.json config/stories/
```

## 4. Database Initialization

For this MVP, we'll use SQLite with the async driver:

```bash
# Initialize the database and load bundled stories
python scripts/init_db.py
```

## 5. Running the Bot

### 5.1 Test Run

First, do a test run to ensure everything is working correctly:

```bash
# Make sure you're in the project root and the virtual environment is activated
python main.py
```

Verify that the bot starts without errors.

### 5.2 Setting Up as a Service

To keep the bot running continuously, set it up as a system service:

```bash
# Create a service file
sudo nano /etc/systemd/system/sherlock-bot.service
```

Add the following content (replace `/path/to/sherlock-bot` with the actual path and `your_username` with your system username):

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

Check the status:

```bash
sudo systemctl status sherlock-bot
```

If everything is running correctly, you should see an "active (running)" status.

## 6. Monitoring and Logs

Monitor the bot's logs using:

```bash
# View service logs
sudo journalctl -u sherlock-bot -f

# Or check the custom log file
cat sherlock_bot.log
```

## 7. Testing the Bot with Telegram CLI

For automated testing, we'll use the Telegram CLI. This allows scripted interactions with the bot for UAT (User Acceptance Testing).

### 7.1 Setting Up Telegram CLI

```bash
# Install dependencies
sudo apt-get install -y build-essential libreadline-dev libconfig-dev libssl-dev lua5.2 liblua5.2-dev libevent-dev

# Clone the repository
git clone --recursive https://github.com/vysheng/tg.git
cd tg

# Configure and build
./configure
make

# Run and authenticate
./bin/telegram-cli -k tg-server.pub
```

Follow the authentication process to link your Telegram account to the CLI.

### 7.2 Testing Scripts

Create a testing script file:

```bash
nano sherlock_bot_test.txt
```

Add the following test scenarios:

```
# Test Script for Sherlock AI Detective Bot

# 1. Start the bot
msg @your_bot_username /start

# 2. Get help information
msg @your_bot_username /help

# 3. View available cases
msg @your_bot_username /cases

# Wait for response and then select the first case
# (Note: actual button press commands will depend on the specific Telegram CLI implementation)
# For this example, we'll use 'press_inline_button' as a placeholder

# 4. Start investigation
press_inline_button 0

# 5. Test examination of crime scene
press_inline_button "Осмотреть место преступления"

# 6. Test examining specific evidence
press_inline_button "Осмотреть пятна на полу"

# 7. Test returning to investigation
press_inline_button "Вернуться к расследованию"

# 8. Test interaction with a character
press_inline_button "Поговорить с директором библиотеки"

# 9. Test asking a specific question
press_inline_button "Когда вы последний раз видели библиотекаря?"

# 10. Test returning to investigation
press_inline_button "Вернуться к расследованию"

# 11. Test the continue command
msg @your_bot_username /continue

# 12. Test case resolution
# Navigate to case solution (varies based on current state)
press_inline_button "Решить дело"

# 13. Accuse the director
press_inline_button "Обвинить директора библиотеки"

# 14. Restart the bot
msg @your_bot_username /start
```

Replace `@your_bot_username` with your actual bot's username.

### 7.3 Running the Tests

In the Telegram CLI:

```
exec sherlock_bot_test.txt
```

### 7.4 Manual UAT Testing Checklist

For manual testing, follow this checklist:

1. **Start and Help Commands:**
   - Send `/start` - Verify welcome message and initial options
   - Send `/help` - Verify help information is displayed

2. **Story Selection:**
   - Send `/cases` - Verify available cases are displayed
   - Select "Тайна Теневой Библиотеки" - Verify story introduction

3. **Navigation and Investigation:**
   - Select "Осмотреть место преступления" - Verify scene description
   - Examine various objects (книгу, пятна, дверь) - Verify descriptions and evidence collection
   - Return to main investigation - Verify options are displayed

4. **Character Interaction:**
   - Talk to each character - Verify character descriptions display correctly
   - Ask different questions - Verify appropriate responses
   - Return to investigation - Verify transition works correctly

5. **Evidence Collection:**
   - Send `/inventory` - Verify collected evidence is shown
   - Check that evidence status updates correctly when analyzed

6. **Progress Persistence:**
   - Close chat with bot
   - Reopen chat and send `/continue` - Verify investigation state is preserved

7. **Case Resolution:**
   - Navigate to "Решить дело" - Verify options to accuse suspects
   - Try accusing different characters - Verify correct outcomes
   - Verify ability to restart investigation

8. **Error Handling:**
   - Test invalid inputs - Verify graceful error handling
   - Send commands in wrong states - Verify appropriate guidance is provided

## 8. Troubleshooting Common Issues

### 8.1 Bot Not Responding

If the bot doesn't respond to commands:

1. Check if the service is running:
   ```bash
   sudo systemctl status sherlock-bot
   ```

2. Verify the bot token:
   ```bash
   grep TELEGRAM_TOKEN .env
   ```

3. Check the logs for errors:
   ```bash
   sudo journalctl -u sherlock-bot -e
   ```

### 8.2 Database Issues

If you encounter database errors:

1. Check if the database file exists:
   ```bash
   ls -la /app/data/sherlock.db  # container path; host volume is ./data/sherlock.db
   ```

2. Try reinitializing the database:
   ```bash
   mv /app/data/sherlock.db /app/data/sherlock.db.backup  # Backup first if needed
   python scripts/init_db.py
   ```

### 8.3 Media Handling Issues

If media files aren't loading correctly:

1. Check the media directory structure:
   ```bash
   ls -la media/evidence media/characters media/locations
   ```

2. Verify permissions:
   ```bash
   sudo chown -R your_username:your_username media
   chmod -R 755 media
   ```

## 9. Preparing for Production

Before announcing the bot as ready:

1. Perform a complete UAT test using the checklist above
2. Monitor the logs for a few hours to ensure stability
3. Have at least 3 different users test the bot to identify any user-specific issues
4. Verify that all text is correctly translated to Russian (if using the Russian version)
5. Check resource usage to ensure the server can handle the expected load
6. Make a backup of the working version

## 10. Language Implementation Note

For initial development and testing, you may use English to simplify the process. For the final production release:

1. Update all user-facing text in the code to Russian
2. Ensure the story JSON data is in Russian
3. Test all Russian text to verify correct encoding and display
4. Update any help messages or documentation to Russian

## 11. Security Considerations

1. Ensure your `.env` file has restricted permissions:
   ```bash
   chmod 600 .env
   ```

2. Regularly update system packages:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. Monitor logs for suspicious activity
4. Implement rate limiting if needed to prevent abuse

## 12. Backup Strategy

Set up regular backups:

```bash
# Create a backup script
cat > backup.sh << EOL
#!/bin/bash
DATE=\$(date +%Y-%m-%d)
BACKUP_DIR=/opt/backups/sherlock-bot
mkdir -p \$BACKUP_DIR
cp -r /opt/sherlock-bot \$BACKUP_DIR/sherlock-bot-\$DATE
cp /opt/sherlock-bot/data/sherlock.db \$BACKUP_DIR/sherlock-\$DATE.db
find \$BACKUP_DIR -type d -name "sherlock-bot-*" -mtime +7 -exec rm -rf {} \;
find \$BACKUP_DIR -name "sherlock-*.db" -mtime +14 -exec rm {} \;
EOL

chmod +x backup.sh

# Set up a daily cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/sherlock-bot/backup.sh") | crontab -
```

## 13. Next Steps After Successful Deployment

Once the bot is successfully deployed and tested:

1. Gather usage statistics and user feedback
2. Plan for Phase 2 implementation (dialogue enhancements, media handling improvements)
3. Optimize database performance if needed
4. Consider implementing analytics to track user engagement
5. Prepare for scaling if the bot becomes popular

---

This guide should help you deploy and test the Sherlock AI Detective Bot effectively. If you encounter issues not covered here, check the logs for specific error messages and consult the relevant documentation for the components being used.
