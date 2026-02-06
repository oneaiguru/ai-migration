#!/bin/bash

# Fix remaining contractors by adding default names
# This script will:
# 1. Identify the final remaining contractors
# 2. Add a default name for empty name fields
# 3. Migrate them manually

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
LOG_FILE="logs/fix_remaining.log"
CSV_FILE="newfiles/contacts.csv"
API_URL="https://api.adesk.ru/v1/contractor"

# API token
TOKEN="${ADESK_API_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    echo "ERROR: ADESK_API_TOKEN is required (set it in .env)." >&2
    exit 1
fi

# Initialize logs
mkdir -p logs
echo "FIX REMAINING CONTRACTORS" > $LOG_FILE
echo "Started at: $(date)" >> $LOG_FILE
echo "==========================" >> $LOG_FILE

# Ensure mappings directory exists
mkdir -p data/mappings/individual

# Log function with timestamp
log() {
    local message="$1"
    echo "[$(date +"%H:%M:%S")] $message" >> $LOG_FILE
    echo "[$(date +"%H:%M:%S")] $message"
}

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
log "Identifying final remaining contractors..."
MISSING_IDS=$(comm -23 <(sort "$TEMP_ALL") <(sort "$TEMP_MIGRATED"))
MISSING_COUNT=$(echo "$MISSING_IDS" | wc -l | tr -d ' ')
log "Found $MISSING_COUNT final remaining contractors to fix"

# Remove temp files
rm -f "$TEMP_ALL" "$TEMP_MIGRATED"

if [ "$MISSING_COUNT" -eq 0 ]; then
    log "No remaining contractors to fix! 100% migration complete."
    exit 0
fi

# Initialize counters
TOTAL_SUCCESS=0
TOTAL_ERRORS=0

# Log the list of missing IDs
log "Remaining contractor IDs: $MISSING_IDS"

# Process each remaining contractor
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
    
    # Use default name if all name fields are empty
    if [ -z "$NAME" ] && [ -z "$GIVEN_NAME" ] && [ -z "$SURNAME" ] && [ -z "$MIDDLE_NAME" ]; then
        NAME="Contractor $ID"
        log "Using default name '$NAME' for empty name fields"
    elif [ -z "$NAME" ]; then
        # If NAME is empty but other fields exist, use combined name fields
        NAME="$SURNAME $GIVEN_NAME $MIDDLE_NAME"
        NAME=$(echo "$NAME" | sed 's/^ //g' | sed 's/ $//g')
        
        # If still empty after combining, use default
        if [ -z "$NAME" ]; then
            NAME="Contractor $ID"
            log "Using default name '$NAME' after failed combination"
        fi
    fi
    
    # Make sure we have a contact person
    if [ -z "$GIVEN_NAME" ] && [ -z "$SURNAME" ] && [ -z "$MIDDLE_NAME" ]; then
        CONTACT_PERSON="Contact $ID"
    else
        CONTACT_PERSON="$GIVEN_NAME $MIDDLE_NAME $SURNAME"
        CONTACT_PERSON=$(echo "$CONTACT_PERSON" | sed 's/  */ /g' | sed 's/^ //g' | sed 's/ $//g')
        
        # If still empty after combining, use default
        if [ -z "$CONTACT_PERSON" ]; then
            CONTACT_PERSON="Contact $ID"
        fi
    fi
    
    # Sanitize for URL encoding
    NAME=$(echo "$NAME" | sed 's/\/[0-9]*$//g' | sed 's/  */ /g' | sed 's/^ //g' | sed 's/ $//g')
    NAME_ENCODED=$(echo -n "$NAME" | jq -sRr @uri)
    CONTACT_ENCODED=$(echo -n "$CONTACT_PERSON" | jq -sRr @uri)
    
    log "Fixing contractor $ID with name '$NAME' and contact person '$CONTACT_PERSON'..."
    
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
        echo "{\"adesk_id\": $ADESK_ID, \"last_updated\": \"$(date +"%Y-%m-%d %H:%M:%S")\", \"metadata\": {}, \"fixed\": true}" > "$TMP_MAPPING"
        mv "$TMP_MAPPING" "data/mappings/individual/$ID.json"
        chmod 644 "data/mappings/individual/$ID.json"
        
        TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
    else
        log "❌ STILL FAILED: Contractor $ID - $RESPONSE"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
    
    # Small sleep to avoid rate limits
    sleep 0.5
done

# Final summary
FINAL_COUNT=$(find data/mappings/individual -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
FINAL_PERCENT=$(echo "scale=2; ($FINAL_COUNT / $TOTAL_IDS) * 100" | bc)

log "==========================="
log "FIX COMPLETE"
log "Successfully fixed: $TOTAL_SUCCESS"
log "Still failed: $TOTAL_ERRORS"
log "Current total migrated: $FINAL_COUNT / $TOTAL_IDS ($FINAL_PERCENT%)"
log "==========================="

if [ $FINAL_COUNT -eq $TOTAL_IDS ]; then
    log "🎉 100% MIGRATION ACHIEVED! 🎉"
fi
