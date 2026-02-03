#!/bin/bash

# Script to consolidate READMEs
consolidate_readmes() {
    echo "# Code Analysis Tools Suite" > README.md
    echo "\n## Overview\n" >> README.md
    
    # Concatenate all README contents with section headers
    for readme in src/*/README.md; do
        module_name=$(basename $(dirname $readme))
        echo "\n## ${module_name}\n" >> README.md
        cat $readme >> README.md
    done
}

# Script to consolidate utilities
consolidate_utils() {
    mkdir -p src/common/utils
    
    # Move all utility files to common directory
    for utils_dir in src/*/utils; do
        if [ -d "$utils_dir" ]; then
            cp -r $utils_dir/* src/common/utils/
        fi
    done
    
    # Remove old utils directories
    find src/ -type d -name "utils" ! -path "src/common/utils" -exec rm -rf {} +
}

# Create __init__.py files for imports
create_init_files() {
    find src/ -type d -exec touch {}/__init__.py \;
}

# Execute the consolidation
consolidate_readmes
consolidate_utils
create_init_files#!/bin/bash

# Script to consolidate READMEs
consolidate_readmes() {
    echo "# Code Analysis Tools Suite" > README.md
    echo "\n## Overview\n" >> README.md
    
    # Concatenate all README contents with section headers
    for readme in src/*/README.md; do
        module_name=$(basename $(dirname $readme))
        echo "\n## ${module_name}\n" >> README.md
        cat $readme >> README.md
    done
}

# Script to consolidate utilities
consolidate_utils() {
    mkdir -p src/common/utils
    
    # Move all utility files to common directory
    for utils_dir in src/*/utils; do
        if [ -d "$utils_dir" ]; then
            cp -r $utils_dir/* src/common/utils/
        fi
    done
    
    # Remove old utils directories
    find src/ -type d -name "utils" ! -path "src/common/utils" -exec rm -rf {} +
}

# Create __init__.py files for imports
create_init_files() {
    find src/ -type d -exec touch {}/__init__.py \;
}

# Execute the consolidation
consolidate_readmes
consolidate_utils
create_init_files