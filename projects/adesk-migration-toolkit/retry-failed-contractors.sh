#!/bin/bash

# Script to retry failed contractors
# This script will:
# 1. Identify contractors not yet migrated
# 2. Try to migrate them with a faster rate (5 min sleep window)
# 3. Report results

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
LOG_FILE="logs/retry_failed_contractors.log"
PROGRESS_LOG="logs/retry_progress.log"
CSV_FILE="newfiles/contacts.csv"
API_URL="https://api.adesk.ru/v1/contractor"
BATCH_SIZE=10
SLEEP_MIN=5  # Sleep for 5 minutes between batches

# API token
TOKEN="${ADESK_API_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "ERROR: ADESK_API_TOKEN is required (set it in .env)." >&2
    exit 1
fi

# Initialize logs
mkdir -p logs
echo "RETRY FAILED CONTRACTORS" > $LOG_FILE
echo "Started at: $(date)" >> $LOG_FILE
echo "==========================" >> $LOG_FILE

# Initialize progress log
echo "RETRY FAILED CONTRACTORS" > $PROGRESS_LOG
echo "Started at: $(date)" >> $PROGRESS_LOG
echo "==========================" >> $PROGRESS_LOG

# Ensure mappings directory exists
mkdir -p data/mappings/individual

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

# Test API connection
log "Testing API connection with token in URL..."
TEST_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "name=Retry+Test&contact_person=Retry+User" \
    "${API_URL}?api_token=${TOKEN}")

if [[ $TEST_RESPONSE == *"success\":\s*true"* ]] || [[ $TEST_RESPONSE == *"success\": true"* ]]; then
    TEST_ID=$(echo "$TEST_RESPONSE" | grep -o -E '"id":\s*[0-9]+' | grep -o -E '[0-9]+')
    log "✅ API token is valid! Created test contractor with ID: $TEST_ID"
else
    log "❌ ERROR: API test failed: $TEST_RESPONSE"
    exit 1
fi

# Get list of all contractors from CSV
log "Reading all contractor IDs from CSV..."
ALL_IDS=$(tail -n +2 "$CSV_FILE" | cut -d, -f1 | tr -d '"')
TOTAL_IDS=$(echo "$ALL_IDS" | wc -l | tr -d ' ')
log "Found $TOTAL_IDS total contractors in CSV"

# Get list of migrated contractors
log "Getting list of already migrated contractors..."
MIGRATED_IDS=$(find data/mappings/individual -name "*.json" | sed 's|data/mappings/individual/||' | sed 's|\.json||')
MIGRATED_COUNT=$(echo "$MIGRATED_IDS" | wc -l | tr -d ' ')
log "Found $MIGRATED_COUNT already migrated contractors"

# Create a temporary file with all IDs
TEMP_ALL=$(mktemp)
echo "$ALL_IDS" > "$TEMP_ALL"

# Create a temporary file with migrated IDs
TEMP_MIGRATED=$(mktemp)
echo "$MIGRATED_IDS" > "$TEMP_MIGRATED"

# Find missing IDs
log "Identifying failed contractors..."
MISSING_IDS=$(comm -23 <(sort "$TEMP_ALL") <(sort "$TEMP_MIGRATED"))
MISSING_COUNT=$(echo "$MISSING_IDS" | wc -l | tr -d ' ')
log "Found $MISSING_COUNT failed contractors to retry"

# Remove temp files
rm -f "$TEMP_ALL" "$TEMP_MIGRATED"

if [ "$MISSING_COUNT" -eq 0 ]; then
    log "No failed contractors to retry!"
    exit 0
fi

# Initialize counters
START_TIME=$(date +%s)
TOTAL_SUCCESS=0
TOTAL_ERRORS=0
PROCESSED=0

# Log the list of missing IDs
log "Failed contractor IDs: $MISSING_IDS"
progress_log "Starting retry for $MISSING_COUNT failed contractors"

# Process in batches
for ID in $MISSING_IDS; do
    # Look up the contractor in the CSV
    CONTRACTOR=$(grep "^\"$ID\"," "$CSV_FILE" || grep "^$ID," "$CSV_FILE")
    
    if [ -z "$CONTRACTOR" ]; then
        log "⚠️ WARNING: Contractor $ID not found in CSV - SKIPPING"
        continue
    fi
    
    # Extract fields from CSV
    NAME=$(echo "$CONTRACTOR" | cut -d, -f7 | tr -d '"')
    GIVEN_NAME=$(echo "$CONTRACTOR" | cut -d, -f4 | tr -d '"')
    SURNAME=$(echo "$CONTRACTOR" | cut -d, -f3 | tr -d '"')
    MIDDLE_NAME=$(echo "$CONTRACTOR" | cut -d, -f5 | tr -d '"')
    
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
    
    log "Retrying contractor $ID ($NAME)..."
    
    # Make the API call with token in URL
    RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "name=$NAME_ENCODED&contact_person=$CONTACT_ENCODED" \
        "${API_URL}?api_token=${TOKEN}")
    
    # Check for success
    if [[ $RESPONSE == *"success\":\s*true"* ]] || [[ $RESPONSE == *"success\": true"* ]]; then
        ADESK_ID=$(echo "$RESPONSE" | grep -o -E '"id":\s*[0-9]+' | grep -o -E '[0-9]+')
        log "✅ SUCCESS: Migrated contractor $ID to Adesk ID $ADESK_ID"
        
        # Store mapping in individual file
        mkdir -p data/mappings/individual
        TMP_MAPPING=$(mktemp)
        echo "{\"adesk_id\": $ADESK_ID, \"last_updated\": \"$(date +"%Y-%m-%d %H:%M:%S")\", \"metadata\": {}, \"retry\": true}" > "$TMP_MAPPING"
        mv "$TMP_MAPPING" "data/mappings/individual/$ID.json"
        chmod 644 "data/mappings/individual/$ID.json"
        
        TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
    else
        log "❌ FAILED AGAIN: Contractor $ID - $RESPONSE"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
    
    PROCESSED=$((PROCESSED + 1))
    
    # Log progress periodically
    if [ $((PROCESSED % 10)) -eq 0 ] || [ $PROCESSED -eq $MISSING_COUNT ]; then
        CURRENT_TIME=$(date +%s)
        ELAPSED=$((CURRENT_TIME - START_TIME))
        MINUTES=$((ELAPSED / 60))
        SECONDS=$((ELAPSED % 60))
        
        PERCENT=$(echo "scale=2; ($PROCESSED / $MISSING_COUNT) * 100" | bc)
        
        log "Progress: $PROCESSED/$MISSING_COUNT ($PERCENT%) - $TOTAL_SUCCESS succeeded, $TOTAL_ERRORS failed"
        progress_log "Progress: $PROCESSED/$MISSING_COUNT ($PERCENT%) - Running for ${MINUTES}m ${SECONDS}s"
        progress_log "Contractors retried: $TOTAL_SUCCESS succeeded, $TOTAL_ERRORS failed"
    fi
    
    # Sleep between batches (every 10 contractors) to avoid rate limits
    if [ $((PROCESSED % $BATCH_SIZE)) -eq 0 ] && [ $PROCESSED -lt $MISSING_COUNT ]; then
        log "Sleeping for $SLEEP_MIN minutes before next batch..."
        progress_log "Sleeping for $SLEEP_MIN minutes before next batch..."
        sleep $((SLEEP_MIN * 60))
    fi
done

# Final summary
FINAL_COUNT=$(find data/mappings/individual -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
TOTAL_TIME=$(($(date +%s) - START_TIME))
MINUTES=$((TOTAL_TIME / 60))
SECONDS=$((TOTAL_TIME % 60))

log "==========================="
log "RETRY COMPLETE"
log "Total time: ${MINUTES}m ${SECONDS}s"
log "Retried: $PROCESSED contractors"
log "Success: $TOTAL_SUCCESS"
log "Failed again: $TOTAL_ERRORS"
log "Current total migrated: $FINAL_COUNT / $TOTAL_IDS"
log "==========================="

progress_log "=== FINAL RETRY REPORT ==="
progress_log "Retry completed at: $(date)"
progress_log "Total time: ${MINUTES}m ${SECONDS}s"
progress_log "Successfully retried: $TOTAL_SUCCESS"
progress_log "Failed again: $TOTAL_ERRORS"
progress_log "Current total migrated: $FINAL_COUNT / $TOTAL_IDS ($(echo "scale=2; ($FINAL_COUNT / $TOTAL_IDS) * 100" | bc)%)"
progress_log "======================="
