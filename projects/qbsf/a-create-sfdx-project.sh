#!/bin/bash
# Script A: Create SFDX Project Structure

echo "=== Creating SFDX Project Structure ==="

# Create sfdx-project.json in the root directory
cat > sfdx-project.json << 'EOF'
{
  "packageDirectories": [
    {
      "path": "force-app",
      "default": true
    }
  ],
  "name": "QuickBooksIntegration",
  "namespace": "",
  "sfdcLoginUrl": "https://login.salesforce.com",
  "sourceApiVersion": "57.0"
}
EOF

echo "✓ Created sfdx-project.json"

# Create .forceignore file
cat > .forceignore << 'EOF'
# List files or directories below to ignore them when running force:source:push, force:source:pull, and force:source:status
# More info: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_exclude_source.htm

# Standard ignores
.DS_Store
Thumbs.db
.git
.gitignore
.idea
.vscode
.project
.settings
node_modules

# Local environment variables
.env
*.log
EOF

echo "✓ Created .forceignore"

# Create .gitignore if it doesn't exist
if [[ ! -f .gitignore ]]; then
cat > .gitignore << 'EOF'
# Salesforce cache
.sfdx/
.localdevserver/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependency directories
node_modules/

# Environment variables
.env
.env.local
.env.*.local

# MacOS system files
.DS_Store

# Windows system files
Thumbs.db
ehthumbs.db
Desktop.ini

# VS Code
.vscode/
*.code-workspace

# IntelliJ
.idea/
*.iml

# Local Netlify folder
.netlify

# Jest coverage
coverage/
.nyc_output/
EOF
echo "✓ Created .gitignore"
fi

# Create project structure
mkdir -p force-app/main/default/aura
mkdir -p force-app/main/default/applications
mkdir -p force-app/main/default/appMenus
mkdir -p force-app/main/default/flows
mkdir -p force-app/main/default/layouts
mkdir -p force-app/main/default/objects
mkdir -p force-app/main/default/permissionsets
mkdir -p force-app/main/default/staticresources
mkdir -p force-app/main/default/tabs
mkdir -p config

echo "✓ Created default directories"

# Create VS Code settings if directory exists
if [[ -d .vscode ]]; then
cat > .vscode/settings.json << 'EOF'
{
  "search.exclude": {
    "**/node_modules": true,
    "**/bower_components": true,
    "**/.sfdx": true
  },
  "eslint.nodePath": "/usr/local/lib/node_modules"
}
EOF
echo "✓ Created VS Code settings"
fi

echo ""
echo "SFDX project structure created successfully!"
echo ""
echo "Your project now has:"
echo "- sfdx-project.json (required for SFDX)"
echo "- .forceignore (to exclude files from deployment)"
echo "- Standard Salesforce project directories"
echo ""
echo "You can now run: ./b-prepare-environment.sh"
