#!/bin/bash
# Salesforce-QuickBooks Integration Setup Script

# Ensure the script stops on errors
set -e

# Text styling
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print section header
print_header() {
  echo -e "\n${BLUE}${BOLD}==== $1 ====${NC}\n"
}

# Print step
print_step() {
  echo -e "${YELLOW}$1${NC}"
}

# Print success
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Display welcome message
print_header "SALESFORCE-QUICKBOOKS INTEGRATION SETUP"
echo "This script will guide you through setting up the Salesforce-QuickBooks integration middleware."
echo "Make sure you have Node.js v20+ installed and necessary access to both Salesforce and QuickBooks."
echo ""

# Check prerequisites
print_header "CHECKING PREREQUISITES"

# Check Node.js version
print_step "Checking Node.js version..."
if command_exists node; then
  NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
  if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be 20 or higher. Current version: $(node -v)"
    echo "Please install Node.js v20 or higher and try again."
    exit 1
  else
    print_success "Node.js version $(node -v) detected"
  fi
else
  print_error "Node.js not found"
  echo "Please install Node.js v20 or higher and try again."
  exit 1
fi

# Check if npm is installed
print_step "Checking npm..."
if command_exists npm; then
  print_success "npm version $(npm -v) detected"
else
  print_error "npm not found"
  echo "Please install npm and try again."
  exit 1
fi

# Verify project directory has required files
print_step "Verifying project directory..."
if [ ! -f "package.json" ]; then
  print_error "package.json not found. Make sure you're in the middleware directory."
  exit 1
else
  print_success "Project directory verified"
fi

# Setup middleware
print_header "MIDDLEWARE SETUP"

print_step "Creating necessary directories..."
mkdir -p logs
mkdir -p data
print_success "Created necessary directories"

print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

print_step "Generating secure keys..."
# Generate keys in a more compatible way
if command_exists openssl; then
  API_KEY=$(openssl rand -hex 24)
  ENCRYPTION_KEY=$(openssl rand -hex 32)
else
  API_KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('hex'))")
  ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
fi

print_success "API Key: $API_KEY"
print_success "Encryption Key: $ENCRYPTION_KEY"

# Create .env file
print_header "CONFIGURATION"
print_step "Setting up configuration parameters..."

# Get server information
read -p "Server Port [3000]: " PORT
PORT=${PORT:-3000}

read -p "Node Environment [production]: " NODE_ENV
NODE_ENV=${NODE_ENV:-production}

read -p "Middleware Base URL (e.g., https://your-middleware-domain.com or http://localhost:3000 for local): " MIDDLEWARE_BASE_URL
if [ -z "$MIDDLEWARE_BASE_URL" ]; then
  MIDDLEWARE_BASE_URL="http://localhost:${PORT}"
  echo "Using default: $MIDDLEWARE_BASE_URL"
fi

# Get Salesforce information
print_step "Salesforce Configuration:"
read -p "Salesforce Client ID: " SF_CLIENT_ID
read -p "Salesforce Client Secret: " SF_CLIENT_SECRET
read -p "Salesforce Redirect URI [${MIDDLEWARE_BASE_URL}/auth/salesforce/callback]: " SF_REDIRECT_URI
SF_REDIRECT_URI=${SF_REDIRECT_URI:-"${MIDDLEWARE_BASE_URL}/auth/salesforce/callback"}
read -p "Salesforce Login URL [https://login.salesforce.com]: " SF_LOGIN_URL
SF_LOGIN_URL=${SF_LOGIN_URL:-"https://login.salesforce.com"}

# Get QuickBooks information
print_step "QuickBooks Configuration:"
read -p "QuickBooks Client ID: " QB_CLIENT_ID
read -p "QuickBooks Client Secret: " QB_CLIENT_SECRET
read -p "QuickBooks Redirect URI [${MIDDLEWARE_BASE_URL}/auth/quickbooks/callback]: " QB_REDIRECT_URI
QB_REDIRECT_URI=${QB_REDIRECT_URI:-"${MIDDLEWARE_BASE_URL}/auth/quickbooks/callback"}
read -p "QuickBooks Environment [sandbox]: " QB_ENVIRONMENT
QB_ENVIRONMENT=${QB_ENVIRONMENT:-"sandbox"}

# Get scheduler information
read -p "Payment Check Cron Schedule [0 1 * * *]: " PAYMENT_CHECK_CRON
PAYMENT_CHECK_CRON=${PAYMENT_CHECK_CRON:-"0 1 * * *"}

print_step "Creating .env file..."
cat > .env << EOL
PORT=${PORT}
NODE_ENV=${NODE_ENV}

# Salesforce credentials
SF_CLIENT_ID=${SF_CLIENT_ID}
SF_CLIENT_SECRET=${SF_CLIENT_SECRET}
SF_REDIRECT_URI=${SF_REDIRECT_URI}
SF_LOGIN_URL=${SF_LOGIN_URL}

# QuickBooks credentials
QB_CLIENT_ID=${QB_CLIENT_ID}
QB_CLIENT_SECRET=${QB_CLIENT_SECRET}
QB_REDIRECT_URI=${QB_REDIRECT_URI}
QB_ENVIRONMENT=${QB_ENVIRONMENT}

# Security
API_KEY=${API_KEY}
TOKEN_ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Scheduler
PAYMENT_CHECK_CRON=${PAYMENT_CHECK_CRON}

# Base URL
MIDDLEWARE_BASE_URL=${MIDDLEWARE_BASE_URL}
EOL

print_success ".env file created"

# Create PM2 ecosystem file for production
print_step "Creating PM2 ecosystem file..."
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "sf-qb-integration",
    script: "src/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
};
EOL
print_success "PM2 ecosystem file created"

# Setup complete
print_header "SETUP COMPLETE"

# Display next steps
print_header "NEXT STEPS"

print_step "1. Start the middleware server:"
echo "   For development: npm run dev"
echo "   For production: npm start"
echo "   With PM2: npm install -g pm2 && pm2 start ecosystem.config.js"

print_step "2. Authorize Salesforce by visiting:"
echo "   ${MIDDLEWARE_BASE_URL}/auth/salesforce"

print_step "3. Authorize QuickBooks by visiting:"
echo "   ${MIDDLEWARE_BASE_URL}/auth/quickbooks"

print_step "4. Configure Salesforce settings:"
echo "   In Salesforce, go to Setup → Custom Settings → QB Integration Settings"
echo "   Click 'Manage' then 'New' at the Default Organization Level"
echo "   Enter the following details:"
echo "   - Middleware Endpoint: ${MIDDLEWARE_BASE_URL}"
echo "   - API Key: ${API_KEY}"
echo "   - QB Realm ID: (Get this from the /auth/status endpoint after authorization)"

print_step "5. Check OAuth status:"
echo "   curl -H \"X-API-Key: ${API_KEY}\" ${MIDDLEWARE_BASE_URL}/auth/status"

print_step "6. Test connections:"
echo "   curl -X POST -H \"X-API-Key: ${API_KEY}\" -H \"Content-Type: application/json\" \\"
echo "     -d '{\"salesforceInstance\":\"YOUR_SALESFORCE_INSTANCE\",\"quickbooksRealm\":\"YOUR_QB_REALM_ID\"}' \\"
echo "     ${MIDDLEWARE_BASE_URL}/api/test-connection"

print_step "7. Create test opportunity and verify integration"

print_header "SECURITY REMINDER"
echo "Keep your API keys and credentials secure. The .env file contains sensitive information."
echo "For production deployments, consider using a secrets management solution."

print_header "DOCUMENTATION"
echo "Refer to the provided documentation for detailed setup instructions:"
echo "- implementation-guide.md: Complete implementation guide"
echo "- sf-setup-guide.md: Salesforce setup guide"
echo "- qb-setup-guide.md: QuickBooks setup guide"
echo "- auth-config-guide.md: Authentication and configuration guide"
echo "- testing-guide.md: Testing guide"
echo "- troubleshooting-guide.md: Troubleshooting guide"

echo -e "\n${GREEN}${BOLD}Setup script completed successfully.${NC}"