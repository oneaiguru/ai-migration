#!/bin/bash
# VIPFLAT to Adesk Migration Toolkit
# 
# This script provides a menu-driven interface for the migration toolset

# Colors for formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set data directory
DATA_DIR="./newfiles"

# Check if the data directory exists
if [ ! -d "$DATA_DIR" ]; then
  echo -e "${RED}Error: Data directory $DATA_DIR does not exist.${NC}"
  exit 1
fi

# Display menu
function show_menu() {
  clear
  echo -e "${BLUE}VIPFLAT to Adesk Migration Toolkit${NC}"
  echo -e "${BLUE}==============================${NC}"
  echo
  echo -e "${BLUE}Data directory: ${YELLOW}$DATA_DIR${NC}"
  echo
  echo "1) Check API connectivity status"
  echo "2) Check for legal entities"
  echo "3) Validate CSV files"
  echo "4) Run test migration (no actual changes)"
  echo "5) Run actual migration (this will migrate data to Adesk)"
  echo "6) Run migration for a specific entity"
  echo "7) Check migration logs"
  echo "8) Exit"
  echo
  echo -e "${YELLOW}Enter your choice [1-8]:${NC} "
}

# Run API status check
function check_api_status() {
  echo -e "${BLUE}Checking API status...${NC}"
  php check_api_status.php
  echo
  read -p "Press Enter to continue..."
}

# Check for legal entities
function check_legal_entities() {
  echo -e "${BLUE}Checking for legal entities...${NC}"
  php check_legal_entities.php
  echo
  read -p "Press Enter to continue..."
}

# Validate CSV files
function validate_csv() {
  echo -e "${BLUE}Validating CSV files in $DATA_DIR...${NC}"
  php csv-validator.php "$DATA_DIR"
  echo
  read -p "Press Enter to continue..."
}

# Run test migration
function run_test_migration() {
  echo -e "${YELLOW}Running TEST migration (no actual changes will be made)...${NC}"
  echo -e "${YELLOW}This will simulate migration using data from $DATA_DIR${NC}"
  echo
  read -p "Press Enter to start test migration or Ctrl+C to cancel..."
  
  php migrate_simple.php --test
  
  echo
  read -p "Press Enter to continue..."
}

# Run actual migration
function run_actual_migration() {
  echo -e "${RED}WARNING: You are about to run an ACTUAL migration.${NC}"
  echo -e "${RED}This will create data in your Adesk account.${NC}"
  echo -e "${YELLOW}Data will be migrated from: $DATA_DIR${NC}"
  echo
  read -p "Are you SURE you want to proceed? (yes/no): " confirm
  
  if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    read -p "Press Enter to continue..."
    return
  fi
  
  echo -e "${BLUE}Starting migration...${NC}"
  php migrate_simple.php
  
  echo
  read -p "Press Enter to continue..."
}

# Run migration for specific entity
function migrate_specific_entity() {
  echo -e "${BLUE}Available entities:${NC}"
  echo "1) categories - Transaction categories"
  echo "2) contractors - Contractors/contacts"
  echo "3) bank_accounts - Bank accounts"
  echo "4) users - Users and default accounts"
  echo "5) projects - Projects"
  echo "6) income_transactions - Income transactions"
  echo "7) expense_transactions - Expense transactions"
  echo "8) transfers - Transfers between accounts"
  echo
  read -p "Enter entity number (1-8): " entity_num
  
  case $entity_num in
    1) entity="categories" ;;
    2) entity="contractors" ;;
    3) entity="bank_accounts" ;;
    4) entity="users" ;;
    5) entity="projects" ;;
    6) entity="income_transactions" ;;
    7) entity="expense_transactions" ;;
    8) entity="transfers" ;;
    *) 
      echo "Invalid choice"
      read -p "Press Enter to continue..."
      return
      ;;
  esac
  
  echo -e "${BLUE}Selected entity: $entity${NC}"
  read -p "Run in test mode? (yes/no): " test_mode
  
  if [ "$test_mode" == "yes" ]; then
    echo -e "${YELLOW}Running TEST migration for $entity...${NC}"
    php migrate_simple.php --entity=$entity --test
  else
    echo -e "${RED}Running ACTUAL migration for $entity...${NC}"
    php migrate_simple.php --entity=$entity
  fi
  
  echo
  read -p "Press Enter to continue..."
}

# Check migration logs
function check_logs() {
  echo -e "${BLUE}Recent migration logs:${NC}"
  ls -lt logs/migration_*.log | head -10 | awk '{print NR ") " $9 " - " $6 " " $7 " " $8}'
  echo
  read -p "Enter log number to view (or Enter to go back): " log_num
  
  if [ -n "$log_num" ]; then
    log_file=$(ls -lt logs/migration_*.log | head -10 | awk '{print $9}' | sed -n "${log_num}p")
    if [ -n "$log_file" ]; then
      echo -e "${BLUE}Showing last 50 lines of $log_file:${NC}"
      tail -50 "$log_file"
      echo
    else
      echo "Invalid log number"
    fi
  fi
  
  read -p "Press Enter to continue..."
}

# Main program loop
while true; do
  show_menu
  read -r choice
  
  case $choice in
    1) check_api_status ;;
    2) check_legal_entities ;;
    3) validate_csv ;;
    4) run_test_migration ;;
    5) run_actual_migration ;;
    6) migrate_specific_entity ;;
    7) check_logs ;;
    8) 
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option. Please try again.${NC}"
      sleep 1
      ;;
  esac
done
