# Scheduling Healthcare Posts on macOS

This guide will help you set up automated scheduling for your healthcare blog posts on macOS.

## Prerequisites

- macOS operating system
- Node.js installed
- The auto_post_wordpress project set up and working correctly
- WordPress login credentials stored in your `.env` file

## Setting Up Scheduled Posts

### Step 1: Get the Full Path

Run the helper script to get the full path to use in your crontab:

```
npm run cron-path
```

or

```
./get_cron_path.sh
```

This will display the exact path you need to use in your crontab.

### Step 2: Edit Your Crontab

On macOS, you can edit your crontab by running:

```
crontab -e
```

This will open the crontab file in your default editor (usually vim or nano).

### Step 3: Add the Cron Job

Add one of the following entries to your crontab:

**Three times a week (Monday, Wednesday, Friday at 9 AM):**

```
0 9 * * 1,3,5 /full/path/to/auto_post_wordpress/schedule_healthcare_posts.sh
```

**Once a day at 10 AM:**

```
0 10 * * * /full/path/to/auto_post_wordpress/schedule_healthcare_posts.sh
```

**Once a week on Sunday at 8 PM:**

```
0 20 * * 0 /full/path/to/auto_post_wordpress/schedule_healthcare_posts.sh
```

Replace `/full/path/to/auto_post_wordpress` with the path you got from Step 1.

### Step 4: Save and Exit

In vim, press `Esc`, then type `:wq` and press Enter.
In nano, press `Ctrl+O` to save, then `Ctrl+X` to exit.

### Step 5: Verify Your Crontab

To verify that your crontab has been updated, run:

```
crontab -l
```

This will display your current crontab entries.

## macOS-Specific Considerations

### Allowing Cron Access

On newer versions of macOS, you may need to grant "Full Disk Access" to cron:

1. Open System Preferences > Security & Privacy > Privacy
2. Select "Full Disk Access" from the left sidebar
3. Click the lock icon to make changes (enter your password)
4. Click the "+" button to add an application
5. Press `Cmd+Shift+G` to open the "Go to folder" dialog
6. Enter `/usr/sbin` and click "Go"
7. Select `cron` and click "Open"

### Using launchd Instead of cron

macOS also provides `launchd` as an alternative to cron. If you're having issues with cron, you can create a launch agent:

1. Create a file in `~/Library/LaunchAgents/com.yourusername.healthcarepost.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.yourusername.healthcarepost</string>
    <key>ProgramArguments</key>
    <array>
        <string>/full/path/to/auto_post_wordpress/schedule_healthcare_posts.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>1</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>3</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
            <key>Weekday</key>
            <integer>5</integer>
        </dict>
    </array>
    <key>StandardErrorPath</key>
    <string>/full/path/to/auto_post_wordpress/healthcare_launchd_error.log</string>
    <key>StandardOutPath</key>
    <string>/full/path/to/auto_post_wordpress/healthcare_launchd_output.log</string>
</dict>
</plist>
```

2. Load the launch agent:

```
launchctl load ~/Library/LaunchAgents/com.yourusername.healthcarepost.plist
```

## Troubleshooting

### Checking Logs

The scheduling script creates log files in the project directory with the format `healthcare_post_*.log`. You can check these logs to verify that the script ran successfully:

```
cat healthcare_post_*.log | less
```

### Common Issues

1. **Script not running**: Make sure the paths in your crontab are absolute paths, not relative.

2. **Permission issues**: Ensure the script is executable:

   ```
   chmod +x schedule_healthcare_posts.sh
   ```

3. **Environment variables not available**: The cron environment is different from your shell environment. Make sure all required environment variables are set in your `.env` file.

4. **Node.js not found**: If cron can't find Node.js, modify the script to use the full path to Node.js:

   ```
   /usr/local/bin/node healthcare_post.js
   ```

   (Find your Node.js path with `which node`)

5. **macOS security restrictions**: Grant "Full Disk Access" to cron as described above.

## Testing Your Setup

To test your setup without waiting for the scheduled time:

1. Run the scheduling script manually:

   ```
   ./schedule_healthcare_posts.sh
   ```

2. Check the generated log file to make sure everything worked correctly.

If the script runs successfully when executed manually but not via cron, it's likely an issue with permissions or environment variables in the cron environment.
