#!/bin/bash

# Script to help set up cron jobs by providing the full path

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Use the following path in your crontab:"
echo ""
echo "$SCRIPT_DIR/schedule_healthcare_posts.sh"
echo ""
echo "Example crontab entry (runs Monday, Wednesday, Friday at 9 AM):"
echo "0 9 * * 1,3,5 $SCRIPT_DIR/schedule_healthcare_posts.sh"
echo ""
echo "To edit your crontab, run:"
echo "crontab -e" 