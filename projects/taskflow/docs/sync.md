# Synchronization Guide

This guide explains how to keep your mobile and desktop environments in sync.

## Manual Sync
Run the helper script to commit task changes and exchange updates with the remote repository:
```bash
python scripts/sync.py sync
```
View the current status:
```bash
python scripts/sync.py status
```

## Cron Job
To automate synchronization every five minutes, add this entry with `crontab -e`:
```cron
*/5 * * * * /usr/bin/python /path/to/repo/scripts/sync.py sync >> /var/log/taskflow-sync.log 2>&1
```
Adjust the Python path and repository location as needed.

The script writes the last successful sync timestamp to `sync.log` in the repository root. Use the dashboard to monitor it.
