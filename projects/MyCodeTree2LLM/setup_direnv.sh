#!/bin/bash

# Array of project directories
declare -a projects=(
    "/Users/m/git/tools/fastwhisper"
    "/Users/m/git/personal/lubot"
    "/Users/m/git/personal/active_project_manager/active_project_manager"
    "/Users/m/git/tools/GenAICodeUpdater"
    "/Users/m/git/personal/AI4artists"
    "/Users/m/git/personal/aaiguru_site"
    "/Users/m/git/personal/clouddigital"
    "/Users/m/git/personal/doc-creator"
    "/Users/m/git/personal/game1"
    "/Users/m/git/personal/funnycard"
    "/Users/m/git/personal/gptcodeautopilot"
    "/Users/m/git/personal/mdsplitter"
)

# Loop through each project
for project in "${projects[@]}"; do
    echo "Processing project at $project"

    # Check if the directory exists
    if [ -d "$project" ]; then
        # Step 1: Create the virtual environment if it doesn't exist
        if [ ! -d "$project/venv" ]; then
            echo "Creating virtual environment for $project"
            (cd "$project" && python3 -m venv venv)
            echo "Virtual environment created in $project/venv"
        else
            echo "Virtual environment already exists in $project/venv"
        fi

        # Step 2: Create the .envrc file for direnv
        echo "Creating .envrc for $project"
        echo 'source ./venv/bin/activate' > "$project/.envrc"

        # Step 3: Allow the .envrc file
        (cd "$project" && direnv allow)
        echo "Direnv configured for $project"
    else
        echo "Directory $project does not exist, skipping..."
    fi
done

echo "All projects processed!"