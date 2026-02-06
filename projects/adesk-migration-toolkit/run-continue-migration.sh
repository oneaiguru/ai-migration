#!/bin/bash

# Run script to continue migration from where we left off

# Create the run directory if it doesn't exist
mkdir -p runs

# Get the timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create a run log file
RUN_LOG="runs/run_${TIMESTAMP}.log"

echo "Starting the CONTINUE MIGRATION process with DISK SPACE CHECKS..."
echo "This will continue from where we left off (approx. 3,100 contractors)"

# Check and report disk space
DISK_SPACE=$(df -h . | tail -1)
echo "Current disk space: $DISK_SPACE"
echo "WARNING: You have only 4.5GB free disk space (99% used)"
echo "You should free up space during migration!"

echo "Started at: $(date)" > $RUN_LOG
echo "Logs will be saved to: $RUN_LOG"
echo "Migration progress will be in: logs/migration_progress.log"
echo "Migration stats will be in: logs/migration_stats.json"
echo ""
echo "--- Monitoring Commands ---"
echo "• Track progress log: tail -f logs/continue_migration.log"
echo "• Track progress stats: tail -f logs/migration_progress.log"
echo "• Count individual mapping files: find data/mappings/individual -name \"*.json\" | wc -l"
echo "• Check disk space: df -h ."
echo ""

# Make the script executable
chmod +x continue-migration.sh

# Start the script in the background with nohup
nohup ./continue-migration.sh >> $RUN_LOG 2>&1 &

# Save the process ID 
PID=$!
echo $PID > runs/pid_${TIMESTAMP}.txt
echo "Process started with PID: $PID"
echo "To stop the migration, run: kill $PID"