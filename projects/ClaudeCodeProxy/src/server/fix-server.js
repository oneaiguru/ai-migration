#!/bin/bash
# Replace all instances of optional chaining in server.js

# Find all lines with ?.
grep -n "?." server.js > optional_chaining_lines.txt

# Print the lines found
echo "Lines with optional chaining operator:"
cat optional_chaining_lines.txt

# Replace the problematic code
sed -i 's/\([a-zA-Z0-9_\.]*\)?\./${\1 \&\& $1\./g' server.js

# Check if replacement worked
echo "Checking if replacement was successful:"
grep -n "?." server.js

echo "Fix completed. Original file backed up as server.js.bak"
