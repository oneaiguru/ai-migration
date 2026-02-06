#!/bin/bash
# Consolidated Testing Script for Salesforce-QuickBooks Integration
# This script combines validation, testing, and health checks

set -e

# Configuration - update these values with your actual settings
API_KEY="your_api_key"
MIDDLEWARE_URL="http://localhost:3000"  # Change for production
SF_INSTANCE="https://yourorg.my.salesforce.com"
QB_REALM="your_quickbooks_realm_id"

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

# Function to format JSON if possible
format_json() {
  if command -v python3 &> /dev/null && python3 -c "import json" &> /dev/null; then
    echo "$1" | python3 -m json.tool
  elif command -v python &> /dev/null && python -c "import json" &> /dev/null; then
    echo "$1" | python -m json.tool
  elif command -v jq &> /dev/null; then
    echo "$1" | jq '.'
  else
    echo "$1"
  fi
}

# Function to validate scripts
validate_scripts() {
  print_header "SCRIPT VALIDATION"
  
  local scripts=(
    "updated-sf-qb-setup-script.sh"
    "updated-sf-qb-testing-script.sh"
    "script-validator.sh"
  )
  
  for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
      print_step "Validating $script..."
      bash -n "$script"
      if [ $? -eq 0 ]; then
        print_success "$script is valid"
      else
        print_error "$script has syntax errors"
      fi
    else
      print_error "$script not found"
    fi
  done
}

# Function to check system requirements
check_system_requirements() {
  print_header "SYSTEM REQUIREMENTS"

  # Check Node.js version
  print_step "Checking Node.js version..."
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 20 ]; then
      print_error "Node.js version must be 20 or higher. Current version: $(node -v)"
      echo "Please install Node.js v20 or higher."
      return 1
    else
      print_success "Node.js version $(node -v) detected (v20+ required)"
    fi
  else
    print_error "Node.js not found"
    echo "Please install Node.js v20 or higher."
    return 1
  fi

  # Check npm
  print_step "Checking npm..."
  if command -v npm &> /dev/null; then
    print_success "npm version $(npm -v) detected"
  else
    print_error "npm not found"
    return 1
  fi

  # Check PM2 (optional)
  print_step "Checking PM2 (optional)..."
  if command -v pm2 &> /dev/null; then
    print_success "PM2 version $(pm2 -v) detected"
  else
    print_step "PM2 not found. Optional for production deployments."
  fi

  # Check required files
  print_step "Checking required files..."
  REQUIRED_FILES=(
    "package.json"
    "src/server.js"
    "src/services/salesforce-api.js"
    "src/services/quickbooks-api.js"
    "src/services/oauth-manager.js"
  )
  
  MISSING_FILES=0
  for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
      print_error "Missing required file: $file"
      MISSING_FILES=$((MISSING_FILES+1))
    fi
  done
  
  if [ $MISSING_FILES -eq 0 ]; then
    print_success "All required files present"
  else
    print_error "$MISSING_FILES required files missing"
    return 1
  fi
  
  return 0
}

# Function to check middleware health
check_middleware_health() {
  print_step "Checking middleware health..."
  
  if ! curl --output /dev/null --silent --head --fail $MIDDLEWARE_URL; then
    print_error "Middleware server does not appear to be running at $MIDDLEWARE_URL"
    return 1
  fi
  
  RESPONSE=$(curl -s -H "X-API-Key: $API_KEY" $MIDDLEWARE_URL/api/health)
  
  if [[ $RESPONSE == *"\"success\":true"* ]]; then
    print_success "Middleware is healthy!"
    format_json "$RESPONSE"
    return 0
  else
    print_error "Middleware health check failed!"
    format_json "$RESPONSE"
    return 1
  fi
}

# Function to check OAuth status
check_oauth() {
  print_step "Checking OAuth connections..."
  
  RESPONSE=$(curl -s -H "X-API-Key: $API_KEY" $MIDDLEWARE_URL/auth/status)
  
  if [[ $RESPONSE == *"\"success\":true"* ]]; then
    if [[ $RESPONSE == *"\"salesforce\":{\"connected\":true"* ]] && [[ $RESPONSE == *"\"quickbooks\":{\"connected\":true"* ]]; then
      print_success "Both Salesforce and QuickBooks are connected!"
      format_json "$RESPONSE"
      return 0
    else
      print_error "One or both connections are missing!"
      format_json "$RESPONSE"
      return 1
    fi
  else
    print_error "OAuth status check failed!"
    format_json "$RESPONSE"
    return 1
  fi
}

# Function to test connection
test_connection() {
  print_step "Testing connection to both systems..."
  
  RESPONSE=$(curl -s -X POST -H "X-API-Key: $API_KEY" -H "Content-Type: application/json" \
    -d "{\"salesforceInstance\":\"$SF_INSTANCE\",\"quickbooksRealm\":\"$QB_REALM\"}" \
    $MIDDLEWARE_URL/api/test-connection)
  
  if [[ $RESPONSE == *"\"success\":true"* ]]; then
    print_success "Connection test successful!"
    format_json "$RESPONSE"
    return 0
  else
    print_error "Connection test failed!"
    format_json "$RESPONSE"
    return 1
  fi
}

# Function to trigger manual payment check
trigger_payment_check() {
  print_step "Triggering manual payment status check..."
  
  RESPONSE=$(curl -s -X POST -H "X-API-Key: $API_KEY" $MIDDLEWARE_URL/scheduler/payment-check)
  
  if [[ $RESPONSE == *"\"success\":true"* ]]; then
    print_success "Payment check triggered successfully!"
    format_json "$RESPONSE"
    return 0
  else
    print_error "Payment check trigger failed!"
    format_json "$RESPONSE"
    return 1
  fi
}

# Function to check Salesforce API version
check_sf_api_version() {
  print_step "Checking Salesforce API version..."
  
  if [ -f "src/services/salesforce-api.js" ]; then
    API_VERSION_LINE=$(grep -n "this.apiVersion" src/services/salesforce-api.js | head -1)
    if [[ $API_VERSION_LINE == *"v56.0"* ]]; then
      print_success "Using Salesforce API v56.0 (supported, optional upgrade to v63.0 available)"
      return 0
    elif [[ $API_VERSION_LINE == *"v63.0"* ]]; then
      print_success "Using Salesforce API v63.0 (latest supported version)"
      return 0
    else
      # Extract the version if found
      VERSION=$(echo "$API_VERSION_LINE" | grep -o "v[0-9]\+\.[0-9]\+")
      if [ -n "$VERSION" ]; then
        print_success "Using Salesforce API $VERSION"
        
        # Check if version is in supported range (31.0-63.0)
        MAJOR_VERSION=$(echo "$VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$MAJOR_VERSION" -ge 31 ] && [ "$MAJOR_VERSION" -le 63 ]; then
          print_success "API version is in supported range (v31.0-v63.0)"
        else
          print_error "API version may be outside supported range (v31.0-v63.0)"
          return 1
        fi
      else
        print_error "Couldn't determine Salesforce API version from code"
        return 1
      fi
    fi
  else
    print_error "Could not find salesforce-api.js file to check API version"
    return 1
  fi
}

# Function to run all tests
run_all_tests() {
  print_header "RUNNING ALL TESTS"
  
  local FAILED_TESTS=0
  
  # Run script validation
  validate_scripts
  
  # Check system requirements
  check_system_requirements
  if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS+1))
  fi
  
  # Check if middleware is running
  if ! curl --output /dev/null --silent --head --fail $MIDDLEWARE_URL; then
    print_error "Middleware server does not appear to be running at $MIDDLEWARE_URL"
    print_step "Please start the middleware server before continuing with testing"
    return 1
  fi
  
  # Check middleware health
  check_middleware_health
  if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS+1))
  fi
  
  # Check Salesforce API version
  check_sf_api_version
  if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS+1))
  fi
  
  # Check OAuth connections
  check_oauth
  if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS+1))
  fi
  
  # Test connections
  test_connection
  if [ $? -ne 0 ]; then
    FAILED_TESTS=$((FAILED_TESTS+1))
  fi
  
  # Print test summary
  print_header "TEST SUMMARY"
  if [ $FAILED_TESTS -eq 0 ]; then
    print_success "All tests passed!"
  else
    print_error "$FAILED_TESTS tests failed!"
  fi
  
  # Provide next steps
  print_header "NEXT STEPS"
  
  if [ $FAILED_TESTS -eq 0 ]; then
    print_step "1. Create a test opportunity in Salesforce with stage 'Closed Won'"
    print_step "2. Verify the invoice is created in QuickBooks"
    print_step "3. Mark the invoice as paid in QuickBooks"
    print_step "4. Run payment status check:"
    echo "   curl -X POST -H \"X-API-Key: $API_KEY\" $MIDDLEWARE_URL/scheduler/payment-check"
    print_step "5. Verify the payment information is updated in Salesforce"
  else
    print_step "Please fix the failed tests before proceeding to end-to-end testing."
  fi
}

# Main execution
print_header "SALESFORCE-QUICKBOOKS INTEGRATION TESTER"

echo "This script will test your Salesforce-QuickBooks integration."
echo "Make sure the middleware server is running before proceeding."
echo ""
echo "Current configuration:"
echo "- Middleware URL: $MIDDLEWARE_URL"
echo "- API Key: ${API_KEY:0:4}...${API_KEY: -4}"
echo "- Salesforce Instance: $SF_INSTANCE"
echo "- QuickBooks Realm ID: $QB_REALM"
echo ""

# Offer to update configuration
read -p "Do you want to update the configuration? (y/n): " update_config
if [[ $update_config == "y" ]]; then
  read -p "API Key: " new_api_key
  read -p "Middleware URL: " new_middleware_url
  read -p "Salesforce Instance: " new_sf_instance
  read -p "QuickBooks Realm ID: " new_qb_realm
  
  # Update only if values are provided
  [[ -n "$new_api_key" ]] && API_KEY="$new_api_key"
  [[ -n "$new_middleware_url" ]] && MIDDLEWARE_URL="$new_middleware_url"
  [[ -n "$new_sf_instance" ]] && SF_INSTANCE="$new_sf_instance"
  [[ -n "$new_qb_realm" ]] && QB_REALM="$new_qb_realm"
  
  echo "Configuration updated."
fi

# Show menu and handle user input
show_menu() {
  echo ""
  echo "TESTING MENU:"
  echo "1) Run all tests"
  echo "2) Validate scripts"
  echo "3) Check system requirements"
  echo "4) Check middleware health"
  echo "5) Check OAuth status"
  echo "6) Test connections"
  echo "7) Trigger payment status check"
  echo "8) Check Salesforce API version"
  echo "q) Quit"
  echo ""
  read -p "Select an option: " option
  
  case $option in
    1) run_all_tests ;;
    2) validate_scripts ;;
    3) check_system_requirements ;;
    4) check_middleware_health ;;
    5) check_oauth ;;
    6) test_connection ;;
    7) trigger_payment_check ;;
    8) check_sf_api_version ;;
    q) echo "Exiting."; exit 0 ;;
    *) echo "Invalid option." ;;
  esac
  
  show_menu
}

show_menu