#!/bin/bash

# Script to run the healthcare post generator
# This script is designed to be executed by cron

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$SCRIPT_DIR"

# Log file for output
LOG_FILE="$SCRIPT_DIR/healthcare_post_$(date +\%Y\%m\%d_\%H\%M\%S).log"

# Log start time
echo "Starting healthcare post generation at $(date)" > "$LOG_FILE"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH" >> "$LOG_FILE"
    exit 1
fi

# Run the healthcare post script
echo "Running healthcare post script..." >> "$LOG_FILE"
node healthcare_post.js >> "$LOG_FILE" 2>&1

# Log completion
echo "Healthcare post generation completed at $(date)" >> "$LOG_FILE"

# Trim log files (keep only the 10 most recent)
ls -t "$SCRIPT_DIR"/healthcare_post_*.log | tail -n +11 | xargs -r rm

exit 0 