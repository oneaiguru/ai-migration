#!/bin/bash

# Find the process ID using the config file
pid=$(jq '.readme_script.pid' /Users/m/git/tools/rename_my_py2SnakeCase/watchdog_config.json)

if [ "$pid" != "null" ]; then
    kill $pid
    echo "Watchdog Manager stopped."
else
    echo "Watchdog Manager is not running."
fi
