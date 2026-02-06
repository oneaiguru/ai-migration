#!/bin/bash
# VIPFLAT to Adesk Migration Tool - Migration Execution Script
# 
# This script runs the migration tool with various configurations
# and generates a comprehensive report.

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create log directory
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_DIR="migration_logs_${TIMESTAMP}"
mkdir -p "${LOG_DIR}"

echo -e "${BLUE}VIPFLAT to Adesk Migration Tool${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""
echo -e "Starting migration process at: ${YELLOW}$(date)${NC}"
echo -e "All logs will be saved to: ${YELLOW}${LOG_DIR}${NC}"
echo ""

# Function to run migration with parameters
run_migration() {
    local mode=$1
    local entity=$2
    local extra_params=$3
    
    local cmd="php migrate.php --mode=${mode}"
    
    if [ -n "${entity}" ]; then
        cmd="${cmd} --entity=${entity}"
    fi
    
    if [ -n "${extra_params}" ]; then
        cmd="${cmd} ${extra_params}"
    fi
    
    local log_file="${LOG_DIR}/migration_${mode}"
    if [ -n "${entity}" ]; then
        log_file="${log_file}_${entity}"
    fi
    log_file="${log_file}.log"
    
    echo -e "Running: ${YELLOW}${cmd}${NC}"
    echo -e "Logging to: ${YELLOW}${log_file}${NC}"
    
    # Execute the command
    ${cmd} > "${log_file}" 2>&1
    
    # Check if successful
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migration completed successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Migration failed. Check log file for details${NC}"
        return 1
    fi
}

# First, run test mode to validate configuration
echo -e "${BLUE}Step 1: Running test mode to validate configuration${NC}"
run_migration "full" "" "--test"
if [ $? -ne 0 ]; then
    echo -e "${RED}Test mode failed. Please check logs before proceeding with actual migration.${NC}"
    exit 1
fi

# Ask for confirmation before proceeding with actual migration
echo ""
echo -e "${YELLOW}Test mode completed. The system is now ready for actual migration.${NC}"
echo -e "${YELLOW}Would you like to proceed with the full migration? (y/n)${NC}"
read -p "> " proceed_migration

if [[ ! $proceed_migration =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Migration cancelled by user. You can review test logs in ${LOG_DIR}${NC}"
    exit 0
fi

# Migrate reference data first
echo ""
echo -e "${BLUE}Step 2: Migrating reference data${NC}"

echo -e "${BLUE}Migrating categories...${NC}"
run_migration "full" "categories"

echo -e "${BLUE}Migrating contractors...${NC}"
run_migration "full" "contractors"

echo -e "${BLUE}Migrating bank accounts...${NC}"
run_migration "full" "bank_accounts"

echo -e "${BLUE}Migrating users and creating default cash accounts...${NC}"
run_migration "full" "users"

echo -e "${BLUE}Migrating projects (apartments)...${NC}"
run_migration "full" "projects"

# Migrate financial operations
echo ""
echo -e "${BLUE}Step 3: Migrating financial operations${NC}"

echo -e "${BLUE}Migrating income transactions...${NC}"
run_migration "full" "income_transactions"

echo -e "${BLUE}Migrating expense transactions...${NC}"
run_migration "full" "expense_transactions"

echo -e "${BLUE}Migrating transfers...${NC}"
run_migration "full" "transfers"

# Run validation
echo ""
echo -e "${BLUE}Step 4: Validating migration results${NC}"
php validate-script.php > "${LOG_DIR}/validation.log" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Validation completed successfully${NC}"
else
    echo -e "${RED}✗ Validation failed. Please check the validation log for details${NC}"
    echo -e "${YELLOW}Validation log: ${LOG_DIR}/validation.log${NC}"
fi

# Generate summary
echo ""
echo -e "${BLUE}Migration Summary${NC}"
echo -e "${BLUE}====================${NC}"
echo -e "Migration completed at: ${YELLOW}$(date)${NC}"
echo -e "Total logs generated: ${YELLOW}$(ls -1 ${LOG_DIR} | wc -l)${NC}"
echo -e "Log directory: ${YELLOW}${LOG_DIR}${NC}"
echo ""
echo -e "${GREEN}To run incremental updates in the future, use:${NC}"
echo -e "${YELLOW}php migrate.php --mode=incremental${NC}"
echo ""
echo -e "${BLUE}Thank you for using the VIPFLAT to Adesk Migration Tool!${NC}"