#!/bin/bash

# Setup script for Text Rewriter System
echo "Setting up Text Rewriter System..."

# Create directory structure
echo "Creating directory structure..."
mkdir -p src/Api src/Core src/Utils tests/Unit config web/admin logs output

# Move source files to correct locations
echo "Moving files to correct locations..."
# API files
mv bitrix-api-integration.php src/Api/BitrixApiClient.php
mv claude-api-integration.php src/Api/ClaudeApiClient.php

# Core files
mv main-controller.php src/Core/TextRewriteController.php
mv prompt-engineering.php src/Core/PromptGenerator.php
mv uniqueness-checker.php src/Core/UniquenessChecker.php

# CLI interface
mv cli-runner.php src/cli.php

# Config
mv config-example.json config/config.example.json

# Web interface
mv admin-panel.html web/admin/index.html

# Set permissions
echo "Setting permissions..."
chmod +x src/cli.php
chmod 755 logs output

# Install dependencies
echo "Installing dependencies..."
if command -v composer &> /dev/null; then
    composer install
else
    echo "Composer not found. Please install dependencies manually."
    echo "Run: composer install"
fi

# Create sample config file if it doesn't exist
if [ ! -f config/config.json ]; then
    echo "Creating sample config file..."
    cp config/config.example.json config/config.json
    echo "Please edit config/config.json with your settings."
fi

# Run tests
echo "Running tests..."
if [ -f vendor/bin/phpunit ]; then
    vendor/bin/phpunit tests
else
    echo "PHPUnit not found. Please run tests manually after installing dependencies."
    echo "Run: composer test"
fi

echo "Setup complete!"
echo "Next steps:"
echo "1. Edit config/config.json with your API credentials"
echo "2. Use the system via CLI: php src/cli.php --help"
echo "3. Access the web interface at: http://your-server/path-to-system/web/admin/"
