#!/bin/bash

# Continue migration from current state
# This script will:
# 1. Check disk space first
# 2. Count existing contractors
# 3. Continue from where we left off
# 4. Use more robust error handling

# Ensure paths resolve relative to this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment (optional)
if [ -f ".env" ]; then
    set -a
    # shellcheck source=/dev/null
    source .env
    set +a
fi

# Configuration
LOG_FILE="logs/continue_migration.log"
PROGRESS_LOG="logs/migration_progress.log"
STATS_FILE="logs/migration_stats.json"
CSV_FILE="newfiles/contacts.csv"
MAPFILE="data/mappings/contractors_mappings.json"
API_URL="https://api.adesk.ru/v1/contractor"
BATCH_SIZE=5
INITIAL_WAIT=333  # 3 requests per second (milliseconds) 
MAX_WAIT=3000
FAILURE_THRESHOLD=5
MIN_DISK_SPACE=1000000  # 1GB in KB

# API token
TOKEN="${ADESK_API_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "ERROR: ADESK_API_TOKEN is required (set it in .env)." >&2
    exit 1
fi

# Initialize logs
mkdir -p logs
echo "CONTINUE MIGRATION" > $LOG_FILE
echo "Started at: $(date)" >> $LOG_FILE
echo "==========================" >> $LOG_FILE

# Initialize progress log
echo "CONTINUE MIGRATION" > $PROGRESS_LOG
echo "Started at: $(date)" >> $PROGRESS_LOG
echo "==========================" >> $PROGRESS_LOG

# Kill any existing migrations
pkill -f "complete-migrate.sh" || true
pkill -f "final-migrate.sh" || true
pkill -f "debug-complete-migrate.sh" || true
pkill -f "final-solution.sh" || true
pkill -f "final-solution-with-duplicate-check.sh" || true
pkill -f "restore-and-continue.sh" || true
pkill -f "migrate.php" || true
echo "Terminated any existing migration processes"

# Log function with timestamp
log() {
    local message="$1"
    echo "[$(date +"%H:%M:%S")] $message" >> $LOG_FILE
    echo "[$(date +"%H:%M:%S")] $message"
}

# Progress log function
progress_log() {
    local message="$1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $message" >> $PROGRESS_LOG
}

# Update stats file - with error handling
update_stats() {
    local current_count=$1
    local total_success=$2
    local total_errors=$3
    local rate=$4
    local estimate=$5
    local duplicates=$6
    
    # Create in temporary file first
    TMP_STATS=$(mktemp)
    echo "{\"count\": $current_count, \"success\": $total_success, \"errors\": $total_errors, \"rate\": \"$rate\", \"estimate\": \"$estimate\", \"duplicates\": $duplicates, \"updated\": \"$(date +"%Y-%m-%d %H:%M:%S")\"}" > $TMP_STATS
    
    # Then move atomically 
    mv $TMP_STATS $STATS_FILE
}

# Check disk space
check_disk_space() {
    local available_kb=$(df -k . | tail -1 | awk '{print $4}')
    if [ "$available_kb" -lt "$MIN_DISK_SPACE" ]; then
        log "WARNING: Low disk space detected: $available_kb KB available"
        log "Minimum required: $MIN_DISK_SPACE KB (1GB)"
        log "Please free up disk space before continuing"
        
        # Clean up old log files if possible
        log "Attempting to clean up old log files..."
        find logs -name "*.log" -mtime +1 -type f -delete
        
        # Check again
        available_kb=$(df -k . | tail -1 | awk '{print $4}')
        if [ "$available_kb" -lt "$MIN_DISK_SPACE" ]; then
            log "ERROR: Still not enough disk space after cleanup: $available_kb KB available"
            return 1
        else
            log "Cleanup successful. Now have $available_kb KB available"
            return 0
        fi
    fi
    log "Disk space check passed: $available_kb KB available"
    return 0
}

# Run disk space check
if ! check_disk_space; then
    log "ERROR: Insufficient disk space. Aborting migration."
    exit 1
fi

# Count existing individual mapping files
log "Counting existing individual mapping files..."
mkdir -p data/mappings/individual
EXISTING_MAPPINGS=$(find data/mappings/individual -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
log "Found $EXISTING_MAPPINGS existing individual mapping files"

# Test API connection
log "Testing API connection with token in URL..."
TEST_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "name=Continue+Test&contact_person=Continue+User" \
    "${API_URL}?api_token=${TOKEN}")

if [[ $TEST_RESPONSE == *"success\":\s*true"* ]] || [[ $TEST_RESPONSE == *"success\": true"* ]]; then
    TEST_ID=$(echo "$TEST_RESPONSE" | grep -o -E '"id":\s*[0-9]+' | grep -o -E '[0-9]+')
    log "✅ API token is valid! Created test contractor with ID: $TEST_ID"
else
    log "❌ ERROR: API test failed: $TEST_RESPONSE"
    exit 1
fi

# Get the total record count from CSV
TOTAL_RECORDS=$(tail -n +2 "$CSV_FILE" | wc -l | tr -d ' ')
log "CSV contains $TOTAL_RECORDS total records"

# Calculate where to start from (skip already processed records)
OFFSET=$EXISTING_MAPPINGS
log "Starting migration from offset $OFFSET (already processed $EXISTING_MAPPINGS contractors)"
progress_log "Starting migration from offset $OFFSET (already processed $EXISTING_MAPPINGS contractors)"

# Calculate estimated completion time for remaining records
REMAINING=$((TOTAL_RECORDS - EXISTING_MAPPINGS))
REQUESTS_PER_HOUR=$((3 * 60 * 60))  # 3 req/sec * 60 sec * 60 min = 10800 req/hour
ESTIMATED_HOURS=$(echo "scale=1; $REMAINING / $REQUESTS_PER_HOUR" | bc)
log "Estimated completion time for remaining $REMAINING contractors: ${ESTIMATED_HOURS} hours"

# Initialize counters
START_TIME=$(date +%s)
TOTAL_PROCESSED=0
TOTAL_SUCCESS=0
TOTAL_ERRORS=0
TOTAL_DUPLICATES=0
CURRENT_WAIT=$INITIAL_WAIT
CONSECUTIVE_FAILURES=0

# Set trap for graceful shutdown
trap 'log "Caught signal. Shutting down gracefully..."; exit 0' SIGINT SIGTERM

# Main migration loop
while true; do
    # Check disk space periodically
    if [ $((TOTAL_PROCESSED % 100)) -eq 0 ]; then
        if ! check_disk_space; then
            log "ERROR: Insufficient disk space. Pausing migration for 5 minutes to allow cleanup."
            sleep 300  # Sleep for 5 minutes
            if ! check_disk_space; then
                log "ERROR: Still insufficient disk space after waiting. Aborting migration."
                exit 1
            else
                log "Disk space now sufficient. Resuming migration."
            fi
        fi
    fi

    # Calculate which lines to process
    LINE_START=$((OFFSET + 2)) # +2 because CSV has a header line
    LINE_END=$((LINE_START + BATCH_SIZE - 1))
    log "Processing CSV lines $LINE_START to $LINE_END"
    
    # Extract the batch of records
    CONTRACTORS=$(sed -n "${LINE_START},${LINE_END}p" "$CSV_FILE")
    
    if [ -z "$CONTRACTORS" ]; then
        log "No more contractors to process!"
        break
    fi
    
    BATCH_SUCCESS=0
    BATCH_ERRORS=0
    BATCH_DUPLICATES=0
    
    # Process each contractor
    while IFS= read -r line; do
        # Skip empty lines
        if [ -z "$line" ]; then
            continue
        fi
        
        # Extract fields from CSV
        ID=$(echo "$line" | cut -d, -f1 | tr -d '"')
        NAME=$(echo "$line" | cut -d, -f7 | tr -d '"')
        GIVEN_NAME=$(echo "$line" | cut -d, -f4 | tr -d '"')
        SURNAME=$(echo "$line" | cut -d, -f3 | tr -d '"')
        MIDDLE_NAME=$(echo "$line" | cut -d, -f5 | tr -d '"')
        
        # If NAME is empty, use combined name fields
        if [ -z "$NAME" ]; then
            NAME="$SURNAME $GIVEN_NAME $MIDDLE_NAME"
        fi
        
        # Process contact person
        CONTACT_PERSON="$GIVEN_NAME $MIDDLE_NAME $SURNAME"
        CONTACT_PERSON=$(echo "$CONTACT_PERSON" | sed 's/  */ /g' | sed 's/^ //g' | sed 's/ $//g')
        
        # Sanitize for URL encoding
        NAME=$(echo "$NAME" | sed 's/\/[0-9]*$//g' | sed 's/  */ /g' | sed 's/^ //g' | sed 's/ $//g')
        NAME_ENCODED=$(echo -n "$NAME" | jq -sRr @uri)
        CONTACT_ENCODED=$(echo -n "$CONTACT_PERSON" | jq -sRr @uri)
        
        # DUPLICATE CHECK: Check if we already have an individual mapping file for this ID
        if [ -f "data/mappings/individual/$ID.json" ]; then
            # Get the Adesk ID from the existing mapping
            if ADESK_ID=$(jq -r '.adesk_id' "data/mappings/individual/$ID.json" 2>/dev/null); then
                log "⚠️ DUPLICATE: Contractor $ID already exists with Adesk ID $ADESK_ID - SKIPPING"
                BATCH_DUPLICATES=$((BATCH_DUPLICATES + 1))
                continue
            fi
        fi
        
        # Don't check main mapping file anymore - relying only on individual files
        
        log "Migrating contractor $ID ($NAME)..."
        
        # Make the API call with token in URL
        RESPONSE=$(curl -s -X POST \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "name=$NAME_ENCODED&contact_person=$CONTACT_ENCODED" \
            "${API_URL}?api_token=${TOKEN}")
        
        # Check for success
        if [[ $RESPONSE == *"success\":\s*true"* ]] || [[ $RESPONSE == *"success\": true"* ]]; then
            ADESK_ID=$(echo "$RESPONSE" | grep -o -E '"id":\s*[0-9]+' | grep -o -E '[0-9]+')
            log "✅ SUCCESS: Migrated contractor $ID to Adesk ID $ADESK_ID"
            
            # Store mapping in individual file only - more reliable
            mkdir -p data/mappings/individual
            
            # Create temporary file first, then move atomically
            TMP_MAPPING=$(mktemp)
            echo "{\"adesk_id\": $ADESK_ID, \"last_updated\": \"$(date +"%Y-%m-%d %H:%M:%S")\", \"metadata\": {}}" > "$TMP_MAPPING"
            mv "$TMP_MAPPING" "data/mappings/individual/$ID.json"
            chmod 644 "data/mappings/individual/$ID.json"
            
            BATCH_SUCCESS=$((BATCH_SUCCESS + 1))
            CONSECUTIVE_FAILURES=0
            
            # Reduce wait time on success (but not below initial)
            if [ $CURRENT_WAIT -gt $INITIAL_WAIT ]; then
                CURRENT_WAIT=$((CURRENT_WAIT / 2))
                [ $CURRENT_WAIT -lt $INITIAL_WAIT ] && CURRENT_WAIT=$INITIAL_WAIT
                log "Reducing wait time to $CURRENT_WAIT milliseconds"
            fi
        else
            log "❌ FAILED: Contractor $ID - $RESPONSE"
            BATCH_ERRORS=$((BATCH_ERRORS + 1))
            CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
            
            # Check for auth errors
            if [[ $RESPONSE == *"Auth required"* ]] || [[ $RESPONSE == *"code\":401"* ]]; then
                log "Authentication error detected. Testing token again..."
                
                # Test the token again
                TEST_RESPONSE=$(curl -s -X POST \
                    -H "Content-Type: application/x-www-form-urlencoded" \
                    -d "name=API+Test&contact_person=Test+Person" \
                    "${API_URL}?api_token=${TOKEN}")
                
                if [[ $TEST_RESPONSE == *"success\":\s*true"* ]] || [[ $TEST_RESPONSE == *"success\": true"* ]]; then
                    log "Token is still valid. Continuing with increased backoff..."
                else
                    log "❌ ERROR: API token is no longer valid! Aborting."
                    progress_log "MIGRATION FAILED - API token invalid"
                    exit 1
                fi
            fi
            
            # Increase wait time on failure
            CURRENT_WAIT=$((CURRENT_WAIT * 2))
            [ $CURRENT_WAIT -gt $MAX_WAIT ] && CURRENT_WAIT=$MAX_WAIT
            log "Increasing wait time to $CURRENT_WAIT milliseconds"
            
            # Take a longer break if too many consecutive failures
            if [ $CONSECUTIVE_FAILURES -ge $FAILURE_THRESHOLD ]; then
                EXTENDED_WAIT=$((CURRENT_WAIT * 3))
                log "Too many consecutive failures. Taking a longer break: $EXTENDED_WAIT milliseconds"
                sleep $((EXTENDED_WAIT / 1000))
                CONSECUTIVE_FAILURES=0
            fi
        fi
        
        # Wait to avoid rate limits (convert ms to seconds)
        SLEEP_SEC=$(echo "scale=3; $CURRENT_WAIT/1000" | bc)
        log "Waiting $CURRENT_WAIT milliseconds ($SLEEP_SEC seconds) before next request..."
        sleep $SLEEP_SEC
        
    done <<< "$CONTRACTORS"
    
    # Update totals
    TOTAL_PROCESSED=$((TOTAL_PROCESSED + BATCH_SIZE))
    TOTAL_SUCCESS=$((TOTAL_SUCCESS + BATCH_SUCCESS))
    TOTAL_ERRORS=$((TOTAL_ERRORS + BATCH_ERRORS))
    TOTAL_DUPLICATES=$((TOTAL_DUPLICATES + BATCH_DUPLICATES))
    
    # Update offset for next batch
    OFFSET=$((OFFSET + BATCH_SIZE))
    
    # Calculate progress metrics
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    HOURS=$((ELAPSED / 3600))
    MINUTES=$(((ELAPSED % 3600) / 60))
    
    # Calculate rate (handle division by zero)
    if [ $ELAPSED -gt 0 ] && [ $TOTAL_SUCCESS -gt 0 ]; then
        RATE=$(echo "scale=1; ($TOTAL_SUCCESS / $ELAPSED) * 3600" | bc 2>/dev/null || echo "0")
    else
        RATE="0"
    fi
    
    # Count individual mapping files for accurate count - but not every batch to reduce I/O
    if [ $((TOTAL_PROCESSED % 20)) -eq 0 ]; then
        MAPPINGS_COUNT=$(find data/mappings/individual -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    else
        # Estimate based on previous count plus new successes
        MAPPINGS_COUNT=$((EXISTING_MAPPINGS + TOTAL_SUCCESS))
    fi
    
    # Log batch results
    log "Batch results: $BATCH_SUCCESS successful, $BATCH_ERRORS failed, $BATCH_DUPLICATES duplicates skipped"
    log "Running totals: $TOTAL_SUCCESS successful, $TOTAL_ERRORS failed, $TOTAL_DUPLICATES duplicates skipped"
    log "Current count from individual files: $MAPPINGS_COUNT"
    log "Rate: $RATE contractors per hour"
    
    # Calculate percentage complete
    if [ $MAPPINGS_COUNT -gt 0 ]; then
        PCT_COMPLETE=$(echo "scale=1; ($MAPPINGS_COUNT / $TOTAL_RECORDS) * 100" | bc 2>/dev/null || echo "0")
    else
        PCT_COMPLETE="0"
    fi
    
    # Recalculate time remaining based on actual rate
    if [[ "$RATE" != "0" && "$RATE" != "" ]]; then
        REMAINING=$((TOTAL_RECORDS - MAPPINGS_COUNT))
        NEW_ESTIMATE_HOURS=$(echo "scale=1; $REMAINING / $RATE" | bc)
        log "New estimate: $NEW_ESTIMATE_HOURS hours remaining"
    else
        NEW_ESTIMATE_HOURS="unknown"
    fi
    
    # Update stats file
    update_stats "$MAPPINGS_COUNT" "$TOTAL_SUCCESS" "$TOTAL_ERRORS" "$RATE" "$NEW_ESTIMATE_HOURS" "$TOTAL_DUPLICATES"
    
    # Add progress report - but not every batch to reduce I/O
    if [ $((TOTAL_PROCESSED % 20)) -eq 0 ]; then
        progress_log "=== PROGRESS REPORT ==="
        progress_log "Running for: ${HOURS}h ${MINUTES}m"
        progress_log "Contractors migrated: $MAPPINGS_COUNT / $TOTAL_RECORDS ($PCT_COMPLETE%)"
        progress_log "Last batch: $BATCH_SUCCESS successful, $BATCH_ERRORS failed, $BATCH_DUPLICATES duplicates skipped"
        progress_log "Total duplicates skipped: $TOTAL_DUPLICATES"
        progress_log "Migration rate: $RATE contractors per hour"
        progress_log "Current wait time: $CURRENT_WAIT milliseconds"
        progress_log "Estimated completion: $NEW_ESTIMATE_HOURS hours remaining"
        progress_log "======================="
    fi
    
    # Periodic backup of mapping files (every 1000 successful migrations)
    if [ $((TOTAL_SUCCESS % 1000)) -eq 0 ] && [ $TOTAL_SUCCESS -gt 0 ]; then
        mkdir -p data/mappings/backups
        BACKUP_DIR="data/mappings/backups/contractors_$(date +"%Y%m%d_%H%M%S")"
        mkdir -p "$BACKUP_DIR"
        
        # Take a sample of mapping files instead of all to save space
        find data/mappings/individual -name "*.json" | sort | head -100 | xargs -I{} cp {} "$BACKUP_DIR"/ 2>/dev/null || true
        log "Created backup of sample mapping files at $BACKUP_DIR"
    fi
    
    # Exit if we reached the end
    if [ $OFFSET -ge $TOTAL_RECORDS ]; then
        log "🎉 MIGRATION COMPLETE!"
        break
    fi
done

# Final summary
FINAL_COUNT=$(find data/mappings/individual -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
TOTAL_TIME=$(($(date +%s) - START_TIME))
HOURS=$((TOTAL_TIME / 3600))
MINUTES=$(((TOTAL_TIME % 3600) / 60))

log "==========================="
log "MIGRATION COMPLETE"
log "Total time: ${HOURS}h ${MINUTES}m"
log "New contractors migrated: $TOTAL_SUCCESS"
log "Existing contractors: $EXISTING_MAPPINGS"
log "Duplicates skipped: $TOTAL_DUPLICATES" 
log "Errors: $TOTAL_ERRORS"
log "Final count: $FINAL_COUNT / $TOTAL_RECORDS"
log "==========================="

progress_log "=== FINAL REPORT ==="
progress_log "Migration completed at: $(date)"
progress_log "Total time: ${HOURS}h ${MINUTES}m"
progress_log "New contractors migrated: $TOTAL_SUCCESS"
progress_log "Existing contractors: $EXISTING_MAPPINGS"
progress_log "Total contractors migrated: $FINAL_COUNT / $TOTAL_RECORDS"
progress_log "======================="
