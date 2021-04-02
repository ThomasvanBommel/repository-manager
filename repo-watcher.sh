#!/bin/bash
 # File: repo-watcher.sh
 # Created: Thursday April 1st 2021
 # Author: Thomas vanBommel
 # 
 # Last Modified: Friday April 2nd 2021 12:19pm
 # Modified By: Thomas vanBommel
 # 
 # CHANGELOG:

DIR=$1

# check if dir exists
[ ! -d "$DIR" ] && echo "Directory '$DIR' does not exist" && exit 1

# touch file (when its touched we will perform the script)
TOUCH_FILE="$DIR/update.touch"

# ensure touch file exists
touch "$DIR/update.touch"

PREV=$(ls -l --full-time "$TOUCH_FILE")
FIRST_RUN=1

while true; do
    CURR=$(ls -l --full-time "$TOUCH_FILE")

    # Check if something has changed (or first run)
    if [[ "$CURR" != "$PREV" ]] || [[ FIRST_RUN -eq 1 ]]; then
        FIRST_RUN=0

        echo -e "\n$(date): Pulling repository..."
        git -C "$DIR" reset --hard HEAD
        git -C "$DIR" pull

        echo -e "\n$(date): Installing dependencies..."
        npm i --prefix "$DIR"

        PID=$(ps -x | grep "node build/server/src/index.js" | head -n 1 |  awk '{ print $1 }')
        echo -e "\n$(date): Killing previous application [$PID]..."
        kill $PID

        echo -e "\n$(date): Starting application..."
        npm start --prefix "$DIR" &

        PREV="$CURR"
    fi

    sleep 5
done