#!/bin/bash
# Script Validator for Salesforce-QuickBooks Integration Scripts
# This validates the syntax of the bash scripts without executing them

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

# Function to validate a shell script
validate_script() {
  local script_path="$1"
  
  if [ ! -f "$script_path" ]; then
    print_error "Script not found: $script_path"
    return 1
  fi
  
  print_step "Validating script: $script_path"
  
  # Dry-run the script with bash -n to check for syntax errors
  bash -n "$script_path"
  local result=$?
  
  if [ $result -eq 0 ]; then
    print_success "Script validation passed: $script_path"
    return 0
  else
    print_error "Script validation failed: $script_path"
    return 1
  fi
}

# Function to validate Node.js version check in a script
validate_node_version_check() {
  local script_path="$1"
  
  if [ ! -f "$script_path" ]; then
    print_error "Script not found: $script_path"
    return 1
  fi
  
  print_step "Checking Node.js version validation in: $script_path"
  
  # Check if script requires Node.js v20+
  if grep -q "NODE_VERSION.*-lt 20" "$script_path"; then
    print_success "Script correctly checks for Node.js v20+: $script_path"
    return 0
  else
    if grep -q "NODE_VERSION.*-lt" "$script_path"; then
      local version=$(grep "NODE_VERSION.*-lt" "$script_path" | grep -o "[0-9]\+" | head -1)
      print_error "Script is checking for Node.js v${version}+, should check for v20+: $script_path"
    else
      print_error "Script does not appear to check Node.js version: $script_path"
    fi
    return 1
  fi
}

# Main function to run all validations
run_validations() {
  local total_tests=0
  local passed_tests=0
  
  print_header "SCRIPT VALIDATION"
  
  # List of scripts to validate
  local scripts=(
    "updated-sf-qb-setup-script.sh"
    "updated-automation-script.sh"
    "updated-master-implementation-script.sh"
    "updated-sf-qb-testing-script.sh"
  )
  
  # Validate syntax for each script
  for script in "${scripts[@]}"; do
    ((total_tests++))
    if validate_script "$script"; then
      ((passed_tests++))
    fi
  done
  
  # Validate Node.js version check in each script
  for script in "${scripts[@]}"; do
    ((total_tests++))
    if validate_node_version_check "$script"; then
      ((passed_tests++))
    fi
  done
  
  # Print summary
  print_header "VALIDATION SUMMARY"
  echo "Total tests: $total_tests"
  echo "Tests passed: $passed_tests"
  
  if [ $total_tests -eq $passed_tests ]; then
    print_success "All validations passed!"
    return 0
  else
    print_error "Some validations failed. Please fix the issues before using the scripts."
    return 1
  fi
}

# Check if scripts are in the current directory
if [ $(ls *.sh 2>/dev/null | wc -l) -eq 0 ]; then
  print_error "No shell scripts found in the current directory."
  exit 1
fi

# Run validations
run_validations
exit $?