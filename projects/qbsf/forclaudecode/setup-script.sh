#!/bin/bash

# Create necessary directories
mkdir -p data scripts/

# Move files to their correct locations
mv src/simple-oauth-manager.js src/services/oauth-manager.js
mv src/updated-quick-check.js scripts/quick-check.js

# Create .env file
cat > .env << 'EOL'
# Server settings
PORT=3000

# Salesforce settings
SF_CLIENT_ID=YOUR_SALESFORCE_CLIENT_ID
SF_CLIENT_SECRET=YOUR_SALESFORCE_CLIENT_SECRET
SF_REDIRECT_URI=http://localhost:3000/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks settings
QB_CLIENT_ID=ABVtqmpIkUMT6Dcs9sZSyh9gCA5EsfUJFUvszgHZeLe6Fgo1jg
QB_CLIENT_SECRET=CPQ3wVLVODA9d0VqN5oo5ErkXw6Aqc8gSsn6HEua
QB_REDIRECT_URI=http://localhost:3000/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox

# Security
API_KEY=quickbooks_salesforce_api_key_2025
EOL

# Create a data directory to store tokens
mkdir -p data

# Install dependencies
npm install

echo "Setup complete! You can now run: node scripts/quick-check.js"
