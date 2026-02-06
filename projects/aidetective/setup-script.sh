#!/bin/bash

# Setup script for Sherlock AI Detective Bot

echo "Setting up Sherlock AI Detective Bot..."

# Create directory structure
mkdir -p bot database/repositories config/stories story_engine utils media/evidence media/characters media/locations tests features/steps logs scripts

# Create __init__.py files for all packages
touch bot/__init__.py database/__init__.py database/repositories/__init__.py config/__init__.py config/stories/__init__.py story_engine/__init__.py utils/__init__.py media/__init__.py tests/__init__.py features/steps/__init__.py scripts/__init__.py

# Move bot files
echo "Moving bot files..."
mv bot-commands.py bot/commands.py
mv bot-conversation.py bot/conversation.py
mv bot-keyboards.py bot/keyboards.py
mv bot-states.py bot/states.py

# Move database files
echo "Moving database files..."
mv db-models.py database/models.py
mv db-session.py database/session.py
mv investigation-repository.py database/repositories/investigation_repository.py
mv story-repository.py database/repositories/story_repository.py
mv user-repository.py database/repositories/user_repository.py

# Move config files
echo "Moving config files..."
mv config-settings.py config/settings.py

# Move story engine files
echo "Moving story engine files..."
mv story-manager.py story_engine/story_manager.py

# Move utils files
echo "Moving utils files..."
mv exceptions.py utils/exceptions.py
mv logger.py utils/logger.py

# Move media files
echo "Moving media files..."
mv media-handler.py media/media_handler.py

# Move test files
echo "Moving test files..."
mv db-repository-test.py tests/test_repositories.py
mv story-manager-test.py tests/test_story_manager.py

# Move feature files
echo "Moving feature files..."
mv user-story-feature.txt features/user_story.feature
mv user-steps.py features/steps/user_steps.py

# Move script files
echo "Moving script files..."
mv init-db-script.py scripts/init_db.py

# Fix other files
echo "Setting up other files..."
mv docker-compose.txt docker-compose.yml
mv dockerfile.txt Dockerfile
mv env-example.sh .env.example
mv main-py.py main.py

# Create docs directory
mkdir -p docs
mv deployment-guide.md docs/deployment-guide.md
mv uat-testing-plan.md docs/uat-testing-plan.md
mv deployment-instructions.md DEPLOYMENT.md

# Give execute permissions to scripts
chmod +x scripts/init_db.py
[ -f setup.sh ] && chmod +x setup.sh

echo "Creating sample .env file..."
cat > .env << EOL
# Telegram Bot Configuration
TELEGRAM_TOKEN=your_telegram_bot_token_here

# Database Configuration
DATABASE_URL=sqlite+aiosqlite:///app/data/sherlock.db

# OpenAI API Configuration (optional for Phase 1 MVP)
OPENAI_API_KEY=

# Media Configuration
MEDIA_DIR=./media

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/sherlock_bot.log

# Content Configuration
MAX_STORIES_FREE=3
MAX_EVIDENCE_SIZE_MB=2.0
EOL

echo "Setup complete! Please edit the .env file to add your Telegram bot token."
echo "Next steps:"
echo "1. Install requirements: pip install -r requirements.txt"
echo "2. Edit .env file: nano .env"
echo "3. Initialize database: python scripts/init_db.py"
echo "4. Run the bot: python main.py"
