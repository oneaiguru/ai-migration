#!/bin/bash
# Script to set up the working demo solution

echo "=== Setting Up Demo Solution ==="

# First, let's use the final-integration folder since it's mentioned as working
cd /Users/m/git/clients/qbsf/final-integration

# Create a backup of current files
echo "Creating backup..."
cp .env .env.backup 2>/dev/null || true
cp data/tokens.json data/tokens.json.backup 2>/dev/null || true

# Update .env with the working credentials
echo "Updating .env with working credentials..."
cat > .env << 'EOL'
# Server Configuration
PORT=3000
NODE_ENV=development
MIDDLEWARE_BASE_URL=http://localhost:3000

# Salesforce Configuration
SF_CLIENT_ID=3MVG9_kZcLde7U5r7ykzu2c1PeyOueQqRgmwyqmPC4yLcImPruS_CxHVVLptVBa28pP76goj0p4YMLcLT7m9C
SF_CLIENT_SECRET=6BC99FF9F8C3A3F662F05AEF854603A2712A5E3FB97B8B0301B941F3E57F5DE4
SF_REDIRECT_URI=http://localhost:3000/auth/salesforce/callback
SF_LOGIN_URL=https://login.salesforce.com

# QuickBooks Configuration
QB_CLIENT_ID=ABVtqmpIkUMT6Dcs9sZSyh9gCA5EsfUJFUvszgHZeLe6Fgo1jg
QB_CLIENT_SECRET=CPQ3wVLVODA9d0VqN5oo5ErkXw6Aqc8gSsn6HEua
QB_REDIRECT_URI=http://localhost:3000/auth/quickbooks/callback
QB_ENVIRONMENT=sandbox

# Security
API_KEY=quickbooks_salesforce_api_key_2025
TOKEN_ENCRYPTION_KEY=your_encryption_key_at_least_32_characters_long

# Scheduler Configuration
INVOICE_CREATION_CRON=0 */2 * * *
PAYMENT_CHECK_CRON=0 1 * * *
EOL

# Copy the most recent tokens.json from automated-integration (which had the newest timestamp)
echo "Copying latest tokens.json..."
mkdir -p data
cp /Users/m/git/clients/qbsf/automated-integration/data/tokens.json data/tokens.json

echo "Setup complete. Ready to start the server."