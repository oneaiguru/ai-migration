#!/bin/bash
set -e

# Create necessary directories
mkdir -p /var/www/html/logs
mkdir -p /var/www/html/output
mkdir -p /var/www/html/config

# Check if config.json exists, if not create it from example
if [ ! -f /var/www/html/config/config.json ]; then
    if [ -f /var/www/html/config/config.example.json ]; then
        cp /var/www/html/config/config.example.json /var/www/html/config/config.json
        echo "Created config.json from example."
    else
        echo '{"bitrix":{"endpoint":"https://www.souz-pribor.ru/rest","login":"admin","password":"password","timeout":30},"claude":{"api_key":"api-key","model":"claude-3-sonnet-20240229","temperature":0.7,"max_tokens":1000,"top_p":0.9},"text_ru":{"api_key":"api-key"},"uniqueness":{"threshold":70,"use_external_api":true,"text_database":"output/text_database.txt","retry_attempts":3},"batch_size":10,"log_file":"logs/rewrite.log","save_history":true,"output_dir":"output","debug":false}' > /var/www/html/config/config.json
        echo "Created default config.json."
    fi
fi

# Update config.json with environment variables
if [ -n "$CLAUDE_API_KEY" ]; then
    sed -i "s/\"api_key\": \"[^\"]*\"/\"api_key\": \"$CLAUDE_API_KEY\"/g" /var/www/html/config/config.json
    echo "Updated Claude API key."
fi

if [ -n "$TEXTRU_API_KEY" ]; then
    sed -i "s/\"api_key\": \"[^\"]*\"/\"api_key\": \"$TEXTRU_API_KEY\"/g" /var/www/html/config/config.json
    echo "Updated Text.ru API key."
fi

if [ -n "$BITRIX_LOGIN" ]; then
    sed -i "s/\"login\": \"[^\"]*\"/\"login\": \"$BITRIX_LOGIN\"/g" /var/www/html/config/config.json
    echo "Updated Bitrix login."
fi

if [ -n "$BITRIX_PASSWORD" ]; then
    sed -i "s/\"password\": \"[^\"]*\"/\"password\": \"$BITRIX_PASSWORD\"/g" /var/www/html/config/config.json
    echo "Updated Bitrix password."
fi

# Set permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html/logs
chmod -R 755 /var/www/html/output

# Execute the passed command
exec "$@"
