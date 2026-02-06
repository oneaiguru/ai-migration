#!/bin/bash
# VIPFLAT to Adesk Migration Tool - Newfiles Migration Script
# 
# This script runs the migration tool with data from the newfiles directory

# Color formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directory containing the data
DATA_DIR="./newfiles"

# Check if --test flag was passed
TEST_MODE=""
if [[ "$1" == "--test" ]]; then
  TEST_MODE="--test"
  echo -e "${YELLOW}Running in TEST MODE - no actual data will be migrated${NC}"
else
  echo -e "${RED}Running in LIVE MODE - actual data will be migrated to Adesk${NC}"
  echo -e "${YELLOW}Do you want to continue with LIVE migration? (y/n)${NC}"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Migration canceled."
    exit 0
  fi
fi

# Migration order
ENTITIES=(
  "categories"
  "contractors"
  "bank_accounts"
  "users"
  "projects"
  "income_transactions"
  "expense_transactions"
  "transfers"
)

# Step 1: Check API connection
echo -e "\n${BLUE}Step 1: Checking API connection...${NC}"
php check_api.php

# Step 2: Verify CSV files
echo -e "\n${BLUE}Step 2: Validating CSV files...${NC}"
php csv-validator.php $DATA_DIR

# Step 3: Run migration for each entity type
echo -e "\n${BLUE}Step 3: Running migration...${NC}"

for entity in "${ENTITIES[@]}"; do
  echo -e "\n${BLUE}Migrating ${entity}...${NC}"
  php migrate.php --entity=$entity --from-dir=$DATA_DIR $TEST_MODE
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error migrating $entity. Do you want to continue with the next entity? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      echo "Migration stopped."
      exit 1
    fi
  fi
done

echo -e "\n${GREEN}Migration completed successfully!${NC}"
echo -e "All entities have been migrated from $DATA_DIR"
echo -e "Check the logs directory for detailed reports."